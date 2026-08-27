use serde::Serialize;
use std::fs;
use std::path::{Component, Path, PathBuf};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IntegrationProfileAssetRead {
    path: String,
    text: String,
    contained: Option<bool>,
}

#[tauri::command]
pub fn read_integration_profile_schema(
    manifest_path: String,
    schema_path: String,
) -> Result<IntegrationProfileAssetRead, String> {
    let manifest = canonicalize_existing_file(&manifest_path, "Integration Package manifest")?;
    let package_root = manifest
        .parent()
        .ok_or_else(|| "Integration Package manifest has no parent directory.".to_string())?;

    if !portable_relative_path(&schema_path) {
        return Ok(IntegrationProfileAssetRead {
            path: schema_path,
            text: String::new(),
            contained: Some(false),
        });
    }

    let candidate = package_root.join(&schema_path);
    if !candidate.is_file() {
        return Err("Published Profile schema path is not an existing file.".to_string());
    }
    let resolved = candidate
        .canonicalize()
        .map_err(|error| format!("Unable to resolve published Profile schema: {error}"))?;
    if !resolved.starts_with(package_root) {
        return Ok(IntegrationProfileAssetRead {
            path: display_path(&resolved),
            text: String::new(),
            contained: Some(false),
        });
    }

    let text = fs::read_to_string(&resolved)
        .map_err(|error| format!("Unable to read published Profile schema as UTF-8: {error}"))?;
    Ok(IntegrationProfileAssetRead {
        path: display_path(&resolved),
        text,
        contained: Some(true),
    })
}

#[tauri::command]
pub fn read_projection_profile(path: String) -> Result<IntegrationProfileAssetRead, String> {
    let resolved = canonicalize_existing_file(&path, "Projection Profile")?;
    let text = fs::read_to_string(&resolved)
        .map_err(|error| format!("Unable to read Projection Profile as UTF-8: {error}"))?;
    Ok(IntegrationProfileAssetRead {
        path: display_path(&resolved),
        text,
        contained: None,
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
            "orbitfabric-studio-profile-{label}-{}-{nonce}",
            std::process::id()
        ));
        fs::create_dir_all(&path).expect("test temp directory should be created");
        path
    }

    #[test]
    fn profile_schema_reader_accepts_package_relative_file() {
        let root = temp_dir("schema");
        let manifest = root.join("integration_package.json");
        let schema = root.join("schemas/profile.json");
        fs::create_dir_all(schema.parent().unwrap()).unwrap();
        fs::write(&manifest, b"{}").unwrap();
        fs::write(&schema, b"{\"type\":\"object\"}").unwrap();

        let read = read_integration_profile_schema(
            display_path(&manifest),
            "schemas/profile.json".to_string(),
        )
        .expect("schema should be readable");
        assert_eq!(read.contained, Some(true));
        assert!(read.text.contains("object"));
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn profile_schema_reader_rejects_lexical_escape() {
        let root = temp_dir("escape");
        let manifest = root.join("integration_package.json");
        fs::write(&manifest, b"{}").unwrap();
        let read = read_integration_profile_schema(
            display_path(&manifest),
            "../schema.json".to_string(),
        )
        .expect("lexical escape should be represented as a trust fact");
        assert_eq!(read.contained, Some(false));
        let _ = fs::remove_dir_all(root);
    }

    #[cfg(unix)]
    #[test]
    fn profile_schema_reader_rejects_symlink_escape() {
        use std::os::unix::fs::symlink;

        let root = temp_dir("symlink-root");
        let outside = temp_dir("symlink-outside");
        let manifest = root.join("integration_package.json");
        let outside_schema = outside.join("profile.json");
        let link = root.join("schema.json");
        fs::write(&manifest, b"{}").unwrap();
        fs::write(&outside_schema, b"{}").unwrap();
        symlink(&outside_schema, &link).unwrap();

        let read = read_integration_profile_schema(
            display_path(&manifest),
            "schema.json".to_string(),
        )
        .expect("symlink escape should be represented as a trust fact");
        assert_eq!(read.contained, Some(false));
        let _ = fs::remove_dir_all(root);
        let _ = fs::remove_dir_all(outside);
    }
}
