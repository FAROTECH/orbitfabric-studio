use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::path::{Component, Path, PathBuf};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IntegrationTextRead {
    path: String,
    text: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IntegrationBundleFileCheck {
    artifact_id: String,
    path: Option<String>,
    exists: Option<bool>,
    sha256_matches: Option<bool>,
    contained: Option<bool>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IntegrationBundleRead {
    result_path: String,
    result_text: String,
    artifact_checks: Vec<IntegrationBundleFileCheck>,
}

#[derive(Debug, Deserialize)]
struct ResultArtifactRecord {
    id: String,
    status: String,
    path: Option<String>,
    sha256: Option<String>,
}

#[tauri::command]
pub fn read_integration_package_manifest(path: String) -> Result<IntegrationTextRead, String> {
    read_utf8_json_file(&path, "Integration Package manifest")
}

#[tauri::command]
pub fn read_integration_result_bundle(path: String) -> Result<IntegrationBundleRead, String> {
    let result_path = canonicalize_existing_file(&path, "Integration Result")?;
    let result_text = fs::read_to_string(&result_path)
        .map_err(|error| format!("Unable to read Integration Result: {error}"))?;
    let root: Value = serde_json::from_str(&result_text)
        .map_err(|error| format!("Integration Result is not valid JSON: {error}"))?;
    let artifacts = root
        .get("artifacts")
        .and_then(Value::as_array)
        .ok_or_else(|| "Integration Result artifacts must be an array.".to_string())?;
    let bundle_root = result_path
        .parent()
        .ok_or_else(|| "Integration Result has no bundle directory.".to_string())?;

    let mut checks = Vec::with_capacity(artifacts.len());
    for value in artifacts {
        let artifact: ResultArtifactRecord = serde_json::from_value(value.clone())
            .map_err(|error| format!("Invalid Integration Result artifact record: {error}"))?;
        checks.push(check_artifact(bundle_root, artifact)?);
    }

    Ok(IntegrationBundleRead {
        result_path: display_path(&result_path),
        result_text,
        artifact_checks: checks,
    })
}

fn read_utf8_json_file(path: &str, label: &str) -> Result<IntegrationTextRead, String> {
    let resolved = canonicalize_existing_file(path, label)?;
    let text = fs::read_to_string(&resolved)
        .map_err(|error| format!("Unable to read {label}: {error}"))?;
    serde_json::from_str::<Value>(&text)
        .map_err(|error| format!("{label} is not valid JSON: {error}"))?;
    Ok(IntegrationTextRead {
        path: display_path(&resolved),
        text,
    })
}

fn check_artifact(
    bundle_root: &Path,
    artifact: ResultArtifactRecord,
) -> Result<IntegrationBundleFileCheck, String> {
    if artifact.status != "generated" {
        return Ok(IntegrationBundleFileCheck {
            artifact_id: artifact.id,
            path: artifact.path,
            exists: None,
            sha256_matches: None,
            contained: None,
        });
    }

    let relative = match artifact.path {
        Some(path) => path,
        None => {
            return Ok(IntegrationBundleFileCheck {
                artifact_id: artifact.id,
                path: None,
                exists: Some(false),
                sha256_matches: Some(false),
                contained: Some(false),
            })
        }
    };

    if !portable_relative_path(&relative) {
        return Ok(IntegrationBundleFileCheck {
            artifact_id: artifact.id,
            path: Some(relative),
            exists: Some(false),
            sha256_matches: Some(false),
            contained: Some(false),
        });
    }

    let artifact_path = bundle_root.join(&relative);
    let exists = artifact_path.is_file();
    let sha256_matches = if exists {
        match artifact.sha256 {
            Some(expected) => file_sha256(&artifact_path)
                .map(|actual| actual.eq_ignore_ascii_case(&expected))
                .unwrap_or(false),
            None => false,
        }
    } else {
        false
    };

    Ok(IntegrationBundleFileCheck {
        artifact_id: artifact.id,
        path: Some(relative),
        exists: Some(exists),
        sha256_matches: Some(sha256_matches),
        contained: Some(true),
    })
}

fn portable_relative_path(value: &str) -> bool {
    if value.trim().is_empty() {
        return false;
    }
    let path = Path::new(value);
    if path.is_absolute() {
        return false;
    }
    !path.components().any(|component| {
        matches!(
            component,
            Component::ParentDir | Component::RootDir | Component::Prefix(_)
        )
    })
}

fn file_sha256(path: &Path) -> Result<String, String> {
    let bytes = fs::read(path)
        .map_err(|error| format!("Unable to read generated integration artifact: {error}"))?;
    Ok(sha256_hex(&bytes))
}

fn sha256_hex(input: &[u8]) -> String {
    const K: [u32; 64] = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
        0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
        0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
        0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
        0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
        0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
        0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
        0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
        0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];

    let mut data = input.to_vec();
    let bit_len = (data.len() as u64) * 8;
    data.push(0x80);
    while data.len() % 64 != 56 {
        data.push(0);
    }
    data.extend_from_slice(&bit_len.to_be_bytes());

    let mut h = [
        0x6a09e667u32,
        0xbb67ae85,
        0x3c6ef372,
        0xa54ff53a,
        0x510e527f,
        0x9b05688c,
        0x1f83d9ab,
        0x5be0cd19,
    ];

    for chunk in data.chunks_exact(64) {
        let mut w = [0u32; 64];
        for (index, word) in chunk.chunks_exact(4).enumerate() {
            w[index] = u32::from_be_bytes([word[0], word[1], word[2], word[3]]);
        }
        for index in 16..64 {
            let s0 = w[index - 15].rotate_right(7)
                ^ w[index - 15].rotate_right(18)
                ^ (w[index - 15] >> 3);
            let s1 = w[index - 2].rotate_right(17)
                ^ w[index - 2].rotate_right(19)
                ^ (w[index - 2] >> 10);
            w[index] = w[index - 16]
                .wrapping_add(s0)
                .wrapping_add(w[index - 7])
                .wrapping_add(s1);
        }

        let mut a = h[0];
        let mut b = h[1];
        let mut c = h[2];
        let mut d = h[3];
        let mut e = h[4];
        let mut f = h[5];
        let mut g = h[6];
        let mut hh = h[7];

        for index in 0..64 {
            let s1 = e.rotate_right(6) ^ e.rotate_right(11) ^ e.rotate_right(25);
            let ch = (e & f) ^ ((!e) & g);
            let temp1 = hh
                .wrapping_add(s1)
                .wrapping_add(ch)
                .wrapping_add(K[index])
                .wrapping_add(w[index]);
            let s0 = a.rotate_right(2) ^ a.rotate_right(13) ^ a.rotate_right(22);
            let maj = (a & b) ^ (a & c) ^ (b & c);
            let temp2 = s0.wrapping_add(maj);

            hh = g;
            g = f;
            f = e;
            e = d.wrapping_add(temp1);
            d = c;
            c = b;
            b = a;
            a = temp1.wrapping_add(temp2);
        }

        h[0] = h[0].wrapping_add(a);
        h[1] = h[1].wrapping_add(b);
        h[2] = h[2].wrapping_add(c);
        h[3] = h[3].wrapping_add(d);
        h[4] = h[4].wrapping_add(e);
        h[5] = h[5].wrapping_add(f);
        h[6] = h[6].wrapping_add(g);
        h[7] = h[7].wrapping_add(hh);
    }

    h.iter().map(|word| format!("{word:08x}")).collect()
}

fn canonicalize_existing_file(path: &str, label: &str) -> Result<PathBuf, String> {
    let candidate = PathBuf::from(path);
    if !candidate.is_file() {
        return Err(format!("{label} path is not an existing file."));
    }
    candidate
        .canonicalize()
        .map_err(|error| format!("Unable to resolve {label} path: {error}"))
}

fn display_path(path: &Path) -> String {
    path.to_string_lossy().to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn temp_dir(label: &str) -> PathBuf {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("clock should be after epoch")
            .as_nanos();
        let path = std::env::temp_dir().join(format!(
            "orbitfabric-studio-integration-{label}-{}-{nonce}",
            std::process::id()
        ));
        fs::create_dir_all(&path).expect("test temp directory should be created");
        path
    }

    #[test]
    fn sha256_matches_known_vector() {
        assert_eq!(
            sha256_hex(b"abc"),
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        );
    }

    #[test]
    fn portable_bundle_paths_reject_escape_and_absolute_paths() {
        assert!(portable_relative_path("artifacts/flight/mission_contract.h"));
        assert!(!portable_relative_path("../outside.txt"));
        assert!(!portable_relative_path("artifacts/../outside.txt"));
        assert!(!portable_relative_path("/tmp/outside.txt"));
    }

    #[test]
    fn result_reader_verifies_generated_artifact_digest() {
        let root = temp_dir("digest");
        let artifact = root.join("artifacts/output.txt");
        fs::create_dir_all(artifact.parent().unwrap()).unwrap();
        fs::write(&artifact, b"orbitfabric").unwrap();
        let expected = file_sha256(&artifact).unwrap();
        let result_path = root.join("integration_result.json");
        let result = serde_json::json!({
            "artifacts": [{
                "id": "artifact.test",
                "status": "generated",
                "path": "artifacts/output.txt",
                "sha256": expected
            }]
        });
        fs::write(&result_path, serde_json::to_vec(&result).unwrap()).unwrap();

        let read = read_integration_result_bundle(display_path(&result_path)).unwrap();
        assert_eq!(read.artifact_checks.len(), 1);
        let check = &read.artifact_checks[0];
        assert_eq!(check.contained, Some(true));
        assert_eq!(check.exists, Some(true));
        assert_eq!(check.sha256_matches, Some(true));

        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn result_reader_reports_bundle_path_escape_without_reading_it() {
        let root = temp_dir("escape");
        let result_path = root.join("integration_result.json");
        let result = serde_json::json!({
            "artifacts": [{
                "id": "artifact.test",
                "status": "generated",
                "path": "../outside.txt",
                "sha256": "deadbeef"
            }]
        });
        fs::write(&result_path, serde_json::to_vec(&result).unwrap()).unwrap();

        let read = read_integration_result_bundle(display_path(&result_path)).unwrap();
        let check = &read.artifact_checks[0];
        assert_eq!(check.contained, Some(false));
        assert_eq!(check.exists, Some(false));
        assert_eq!(check.sha256_matches, Some(false));

        let _ = fs::remove_dir_all(root);
    }
}
