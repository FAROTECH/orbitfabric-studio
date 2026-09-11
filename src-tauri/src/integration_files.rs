use serde::Serialize;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IntegrationTextFileRead {
    path: String,
    text: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RetainedReferenceRead {
    status: &'static str,
    path: Option<String>,
    sha256: Option<String>,
    text: Option<String>,
    reason: Option<String>,
}

#[tauri::command]
pub fn read_retained_reference(
    parent_path: String,
    parent_sha256: String,
    relative_path: String,
    expected_sha256: String,
) -> Result<RetainedReferenceRead, String> {
    let failure = |status, reason: String| RetainedReferenceRead {
        status, path: None, sha256: None, text: None, reason: Some(reason),
    };
    if relative_path.contains(['\\', ':']) || relative_path.split('/').any(|part| part.is_empty() || part == "." || part == "..") {
        return Ok(failure("failure", "Reference path must be portable and bundle-relative.".into()));
    }
    let parent = PathBuf::from(parent_path).canonicalize().map_err(|error| error.to_string())?;
    let bytes = fs::read(&parent).map_err(|error| error.to_string())?;
    if crate::integrations::sha256_hex(&bytes) != parent_sha256 {
        return Ok(failure("failure", "Selected parent bytes changed during reference loading.".into()));
    }
    let root = parent.parent().ok_or("Parent has no bundle root.")?;
    let candidate = root.join(relative_path);
    let resolved = match candidate.canonicalize() {
        Ok(path) => path,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(failure("missing", "Retained reference file is missing.".into())),
        Err(error) => return Ok(failure("failure", error.to_string())),
    };
    if !resolved.starts_with(root) || !resolved.is_file() {
        return Ok(failure("failure", "Reference is not a contained regular file.".into()));
    }
    let bytes = match fs::read(&resolved) {
        Ok(bytes) => bytes,
        Err(error) => return Ok(failure("failure", error.to_string())),
    };
    let digest = crate::integrations::sha256_hex(&bytes);
    if digest != expected_sha256 {
        return Ok(RetainedReferenceRead { status: "digest_mismatch", path: Some(resolved.to_string_lossy().into()), sha256: Some(digest), text: None, reason: Some("Retained bytes differ from the declared digest.".into()) });
    }
    Ok(RetainedReferenceRead {
        status: "verified", path: Some(resolved.to_string_lossy().into()), sha256: Some(digest),
        text: String::from_utf8(bytes).ok(), reason: None,
    })
}

#[tauri::command]
pub fn read_integration_text_file(path: String) -> Result<IntegrationTextFileRead, String> {
    let candidate = PathBuf::from(&path);
    if !candidate.is_file() {
        return Err("Integration text path is not an existing file.".to_string());
    }
    let resolved = candidate
        .canonicalize()
        .map_err(|error| format!("Unable to resolve integration text file: {error}"))?;
    let text = fs::read_to_string(&resolved)
        .map_err(|error| format!("Unable to read integration text file as UTF-8: {error}"))?;

    Ok(IntegrationTextFileRead {
        path: resolved.to_string_lossy().to_string(),
        text,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn retained_fixture(label: &str) -> PathBuf {
        let unique = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos();
        let root = std::env::temp_dir().join(format!("orbitfabric-retained-{label}-{unique}"));
        fs::create_dir_all(&root).unwrap();
        fs::write(root.join("parent.json"), b"exact parent bytes\n").unwrap();
        root
    }

    fn read_fixture(root: &std::path::Path, relative: &str, digest: String) -> RetainedReferenceRead {
        read_retained_reference(
            root.join("parent.json").to_string_lossy().into_owned(),
            crate::integrations::sha256_hex(b"exact parent bytes\n"),
            relative.into(),
            digest,
        ).unwrap()
    }

    #[test]
    fn retained_reference_separates_integrity_availability_and_text_interpretation() {
        let root = retained_fixture("states");
        let text = b"producer statement\r\n";
        fs::write(root.join("record.txt"), text).unwrap();
        let verified = read_fixture(&root, "record.txt", crate::integrations::sha256_hex(text));
        assert_eq!(verified.status, "verified");
        assert_eq!(verified.text.as_deref(), Some("producer statement\r\n"));
        assert_eq!(verified.sha256, Some(crate::integrations::sha256_hex(text)));

        let missing = read_fixture(&root, "missing.txt", crate::integrations::sha256_hex(text));
        assert_eq!(missing.status, "missing");
        assert!(missing.text.is_none());
        let mismatch = read_fixture(&root, "record.txt", "0".repeat(64));
        assert_eq!(mismatch.status, "digest_mismatch");
        assert!(mismatch.text.is_none());

        let binary = [0xff, 0x00, 0x80];
        fs::write(root.join("binary.bin"), binary).unwrap();
        let verified_binary = read_fixture(&root, "binary.bin", crate::integrations::sha256_hex(&binary));
        assert_eq!(verified_binary.status, "verified");
        assert!(verified_binary.text.is_none());
        assert_eq!(verified_binary.sha256, Some(crate::integrations::sha256_hex(&binary)));
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn retained_reference_rejects_changed_exact_parent() {
        let root = retained_fixture("parent");
        fs::write(root.join("record.txt"), b"retained").unwrap();
        fs::write(root.join("parent.json"), b"replacement parent bytes\n").unwrap();
        let read = read_fixture(&root, "record.txt", crate::integrations::sha256_hex(b"retained"));
        assert_eq!(read.status, "failure");
        assert!(read.reason.unwrap().contains("parent bytes changed"));
        assert!(read.text.is_none());
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn retained_reference_requires_a_contained_regular_file() {
        let root = retained_fixture("containment");
        fs::create_dir(root.join("directory")).unwrap();
        for relative in ["", "/absolute", "../outside", "./record", "dir//record", "C:\\record", "directory"] {
            let read = read_fixture(&root, relative, "0".repeat(64));
            assert_eq!(read.status, "failure", "{relative}");
            assert!(read.text.is_none());
        }
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn reads_exact_utf8_text_without_interpreting_profile_semantics() {
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("clock should be available")
            .as_nanos();
        let path = std::env::temp_dir().join(format!("orbitfabric-studio-profile-{unique}.yaml"));
        let expected = "kind: orbitfabric.projection_profile\nsettings: {}\n";
        fs::write(&path, expected).expect("fixture should be writable");

        let read = read_integration_text_file(path.to_string_lossy().to_string())
            .expect("fixture should be readable");
        assert_eq!(read.text, expected);
        assert!(std::path::Path::new(&read.path).is_absolute());

        let _ = fs::remove_file(path);
    }
}
