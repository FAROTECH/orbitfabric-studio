use serde::Serialize;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IntegrationTextFileRead {
    path: String,
    text: String,
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
