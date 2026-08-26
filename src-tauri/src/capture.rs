use serde::Serialize;
use std::env;
use std::fs;
use std::path::PathBuf;

const MAX_SURFACE_CAPTURE_DATA_URL_BYTES: usize = 96_000_000;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct SurfaceCaptureSaveResult {
    path: String,
}

#[tauri::command]
pub(crate) fn save_surface_capture_png(
    filename: String,
    data_url: String,
) -> Result<SurfaceCaptureSaveResult, String> {
    if data_url.len() > MAX_SURFACE_CAPTURE_DATA_URL_BYTES {
        return Err("Surface capture PNG is too large to save.".to_string());
    }

    let safe_filename = sanitize_capture_filename(&filename);
    let output_dir = surface_capture_output_dir()?;
    fs::create_dir_all(&output_dir)
        .map_err(|error| format!("Unable to create surface capture directory: {error}"))?;

    let output_path = output_dir.join(safe_filename);
    let png_bytes = decode_png_data_url(&data_url)?;

    fs::write(&output_path, png_bytes)
        .map_err(|error| format!("Unable to write surface capture PNG: {error}"))?;

    Ok(SurfaceCaptureSaveResult {
        path: output_path.to_string_lossy().to_string(),
    })
}

fn surface_capture_output_dir() -> Result<PathBuf, String> {
    let home = env::var_os("USERPROFILE")
        .or_else(|| env::var_os("HOME"))
        .map(PathBuf::from)
        .ok_or_else(|| "Unable to resolve the user home directory for surface captures.".to_string())?;

    Ok(home
        .join("Downloads")
        .join("OrbitFabric Studio Captures"))
}

fn sanitize_capture_filename(filename: &str) -> String {
    let sanitized: String = filename
        .chars()
        .map(|character| {
            if character.is_ascii_alphanumeric()
                || character == '-'
                || character == '_'
                || character == '.'
            {
                character
            } else {
                '_'
            }
        })
        .take(180)
        .collect();

    let trimmed = sanitized.trim_matches('_');
    let mut safe = if trimmed.is_empty() {
        "orbitfabric-studio__surface.png".to_string()
    } else {
        trimmed.to_string()
    };

    if !safe.to_ascii_lowercase().ends_with(".png") {
        safe.push_str(".png");
    }

    safe
}

fn decode_png_data_url(data_url: &str) -> Result<Vec<u8>, String> {
    const PREFIX: &str = "data:image/png;base64,";

    if !data_url.starts_with(PREFIX) {
        return Err("Surface capture did not produce a PNG data URL.".to_string());
    }

    let bytes = decode_base64(&data_url[PREFIX.len()..])?;
    let png_signature = [137, 80, 78, 71, 13, 10, 26, 10];

    if !bytes.starts_with(&png_signature) {
        return Err("Surface capture payload is not a valid PNG.".to_string());
    }

    Ok(bytes)
}

fn decode_base64(input: &str) -> Result<Vec<u8>, String> {
    let mut output = Vec::with_capacity(input.len() * 3 / 4);
    let mut buffer: u32 = 0;
    let mut bits: u8 = 0;

    for byte in input.bytes() {
        if byte == b'=' {
            break;
        }

        if matches!(byte, b'\r' | b'\n' | b' ' | b'\t') {
            continue;
        }

        let value = base64_value(byte)?;
        buffer = (buffer << 6) | u32::from(value);
        bits += 6;

        if bits >= 8 {
            bits -= 8;
            output.push(((buffer >> bits) & 0xff) as u8);
        }
    }

    Ok(output)
}

fn base64_value(byte: u8) -> Result<u8, String> {
    match byte {
        b'A'..=b'Z' => Ok(byte - b'A'),
        b'a'..=b'z' => Ok(byte - b'a' + 26),
        b'0'..=b'9' => Ok(byte - b'0' + 52),
        b'+' => Ok(62),
        b'/' => Ok(63),
        _ => Err("Surface capture payload contains invalid base64.".to_string()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn capture_filename_is_sanitized_and_keeps_png_extension() {
        assert_eq!(
            sanitize_capture_filename("OrbitFabric Studio: Overview 2026/08/26.png"),
            "OrbitFabric_Studio__Overview_2026_08_26.png"
        );
        assert_eq!(sanitize_capture_filename("///"), "orbitfabric-studio__surface.png");
        assert_eq!(sanitize_capture_filename("capture"), "capture.png");
    }

    #[test]
    fn png_data_url_decoder_validates_png_signature() {
        let decoded = decode_png_data_url("data:image/png;base64,iVBORw0KGgo=")
            .expect("PNG signature should decode");
        assert_eq!(decoded, vec![137, 80, 78, 71, 13, 10, 26, 10]);

        assert!(decode_png_data_url("data:image/png;base64,SGVsbG8=").is_err());
        assert!(decode_png_data_url("data:text/plain;base64,SGVsbG8=").is_err());
    }
}
