use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::{Digest, Sha256};
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

    let contained = portable_relative_path(&relative);
    if !contained {
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
    let mut digest = Sha256::new();
    digest.update(bytes);
    Ok(format!("{:x}", digest.finalize()))
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
