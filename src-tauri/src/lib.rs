use serde::Serialize;
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct MissionSourceResolution {
    selected_path: String,
    mission_dir: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct CoreInvocationResult {
    operation: String,
    executable: String,
    args: Vec<String>,
    exit_code: Option<i32>,
    process_completed: bool,
    timed_out: bool,
    stdout: String,
    stderr: String,
    report_path: Option<String>,
    report_text: Option<String>,
}

/// Resolve the user's directory selection to the candidate Mission Model directory.
///
/// This command deliberately performs no OrbitFabric semantic inspection. It recognizes
/// only the conventional `<workspace>/mission` directory shape; Core remains the authority
/// on whether the resulting directory is a loadable Mission Model.
#[tauri::command]
fn resolve_mission_source(path: String) -> Result<MissionSourceResolution, String> {
    let selected = canonicalize_existing_dir(&path)?;

    let mission = if selected
        .file_name()
        .and_then(|value| value.to_str())
        .is_some_and(|value| value == "mission")
    {
        selected.clone()
    } else {
        let child = selected.join("mission");
        if child.is_dir() {
            child
                .canonicalize()
                .map_err(|error| format!("Unable to resolve mission directory: {error}"))?
        } else {
            selected.clone()
        }
    };

    Ok(MissionSourceResolution {
        selected_path: display_path(&selected),
        mission_dir: display_path(&mission),
    })
}

#[tauri::command]
fn run_core_version(executable: String) -> Result<CoreInvocationResult, String> {
    run_core_command(executable, "version", &["--version"], None)
}

#[tauri::command]
fn run_core_export_mission_snapshot(
    executable: String,
    mission_dir: String,
    request_id: String,
) -> Result<CoreInvocationResult, String> {
    let mission = canonicalize_existing_dir(&mission_dir)?;
    let report_path = request_report_path(&request_id, "mission_snapshot.json", true)?;
    let mission_display = display_path(&mission);
    let report_display = display_path(&report_path);

    run_core_command(
        executable,
        "mission-snapshot",
        &[
            "export",
            "mission-snapshot",
            mission_display.as_str(),
            "--json",
            report_display.as_str(),
        ],
        Some(report_path),
    )
}

#[tauri::command]
fn run_core_export_entity_index(
    executable: String,
    mission_dir: String,
    request_id: String,
) -> Result<CoreInvocationResult, String> {
    let mission = canonicalize_existing_dir(&mission_dir)?;
    let report_path = request_report_path(&request_id, "entity_index.json", false)?;
    let mission_display = display_path(&mission);
    let report_display = display_path(&report_path);

    run_core_command(
        executable,
        "entity-index",
        &[
            "export",
            "entity-index",
            mission_display.as_str(),
            "--json",
            report_display.as_str(),
        ],
        Some(report_path),
    )
}

#[tauri::command]
fn run_core_export_relationship_manifest(
    executable: String,
    mission_dir: String,
    request_id: String,
) -> Result<CoreInvocationResult, String> {
    let mission = canonicalize_existing_dir(&mission_dir)?;
    let report_path = request_report_path(&request_id, "relationship_manifest.json", false)?;
    let mission_display = display_path(&mission);
    let report_display = display_path(&report_path);

    run_core_command(
        executable,
        "relationship-manifest",
        &[
            "export",
            "relationship-manifest",
            mission_display.as_str(),
            "--json",
            report_display.as_str(),
        ],
        Some(report_path),
    )
}

#[tauri::command]
fn run_core_lint_mission(
    executable: String,
    mission_dir: String,
    request_id: String,
) -> Result<CoreInvocationResult, String> {
    let mission = canonicalize_existing_dir(&mission_dir)?;
    let report_path = request_report_path(&request_id, "lint_report.json", false)?;
    let mission_display = display_path(&mission);
    let report_display = display_path(&report_path);

    run_core_command(
        executable,
        "lint",
        &[
            "lint",
            mission_display.as_str(),
            "--json",
            report_display.as_str(),
        ],
        Some(report_path),
    )
}

#[tauri::command]
fn clear_core_request_temp(request_id: String) -> Result<(), String> {
    let request_dir = core_request_temp_dir(&request_id);

    if request_dir.exists() {
        fs::remove_dir_all(&request_dir)
            .map_err(|error| format!("Unable to clear Studio Core request directory: {error}"))?;
    }

    Ok(())
}

fn run_core_command(
    executable: String,
    operation: &str,
    args: &[&str],
    report_path: Option<PathBuf>,
) -> Result<CoreInvocationResult, String> {
    let command = executable.trim();

    if command.is_empty() {
        return Err("OrbitFabric executable path is empty.".to_string());
    }

    let output = Command::new(command)
        .args(args)
        .output()
        .map_err(|error| format!("Unable to execute OrbitFabric Core command: {error}"))?;

    let report_text = match &report_path {
        Some(path) if path.is_file() => fs::read_to_string(path).ok(),
        _ => None,
    };

    Ok(CoreInvocationResult {
        operation: operation.to_string(),
        executable: command.to_string(),
        args: args.iter().map(|arg| (*arg).to_string()).collect(),
        exit_code: output.status.code(),
        process_completed: true,
        timed_out: false,
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        report_path: report_path.as_ref().map(|path| display_path(path)),
        report_text,
    })
}

fn request_report_path(
    request_id: &str,
    file_name: &str,
    reset_request_dir: bool,
) -> Result<PathBuf, String> {
    let request_dir = core_request_temp_dir(request_id);

    if reset_request_dir && request_dir.exists() {
        fs::remove_dir_all(&request_dir)
            .map_err(|error| format!("Unable to reset Studio Core request directory: {error}"))?;
    }

    fs::create_dir_all(&request_dir)
        .map_err(|error| format!("Unable to create Studio Core request directory: {error}"))?;

    Ok(request_dir.join(file_name))
}

fn core_request_temp_dir(request_id: &str) -> PathBuf {
    env::temp_dir()
        .join("orbitfabric-studio")
        .join("core")
        .join(std::process::id().to_string())
        .join(sanitize_request_id(request_id))
}

fn sanitize_request_id(request_id: &str) -> String {
    let sanitized: String = request_id
        .chars()
        .filter_map(|character| {
            if character.is_ascii_alphanumeric() || matches!(character, '-' | '_') {
                Some(character)
            } else {
                None
            }
        })
        .take(96)
        .collect();

    if sanitized.is_empty() {
        "request".to_string()
    } else {
        sanitized
    }
}

fn canonicalize_existing_dir(path: &str) -> Result<PathBuf, String> {
    let candidate = PathBuf::from(path);

    if !candidate.is_dir() {
        return Err("Selected path is not an existing directory.".to_string());
    }

    candidate
        .canonicalize()
        .map_err(|error| format!("Unable to resolve selected directory: {error}"))
}

fn display_path(path: &Path) -> String {
    path.to_string_lossy().to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            resolve_mission_source,
            run_core_version,
            run_core_export_mission_snapshot,
            run_core_export_entity_index,
            run_core_export_relationship_manifest,
            run_core_lint_mission,
            clear_core_request_temp,
        ])
        .run(tauri::generate_context!())
        .expect("error while running OrbitFabric Studio");
}
