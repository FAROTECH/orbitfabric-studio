mod capture;
mod integrations;

use serde::Serialize;
use std::env;
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::thread;
use std::time::{Duration, Instant};

const CORE_VERSION_TIMEOUT: Duration = Duration::from_secs(10);
const CORE_OPERATION_TIMEOUT: Duration = Duration::from_secs(60);
const CORE_POLL_INTERVAL: Duration = Duration::from_millis(25);

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
    run_core_command_with_timeout(
        executable,
        operation,
        args,
        report_path,
        core_timeout_for_operation(operation),
    )
}

fn run_core_command_with_timeout(
    executable: String,
    operation: &str,
    args: &[&str],
    report_path: Option<PathBuf>,
    timeout: Duration,
) -> Result<CoreInvocationResult, String> {
    let command = executable.trim();

    if command.is_empty() {
        return Err("OrbitFabric executable path is empty.".to_string());
    }

    let mut child = Command::new(command)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|error| format!("Unable to execute OrbitFabric Core command: {error}"))?;

    let stdout = child
        .stdout
        .take()
        .ok_or_else(|| "Unable to capture OrbitFabric Core stdout.".to_string())?;
    let stderr = child
        .stderr
        .take()
        .ok_or_else(|| "Unable to capture OrbitFabric Core stderr.".to_string())?;

    let stdout_reader = thread::spawn(move || read_stream(stdout));
    let stderr_reader = thread::spawn(move || read_stream(stderr));

    let started = Instant::now();
    let mut timed_out = false;
    let status = loop {
        match child.try_wait() {
            Ok(Some(status)) => break status,
            Ok(None) if started.elapsed() >= timeout => {
                timed_out = true;
                let _ = child.kill();
                break child
                    .wait()
                    .map_err(|error| format!("Unable to reap timed-out OrbitFabric Core process: {error}"))?;
            }
            Ok(None) => thread::sleep(CORE_POLL_INTERVAL),
            Err(error) => {
                let _ = child.kill();
                let _ = child.wait();
                let _ = stdout_reader.join();
                let _ = stderr_reader.join();
                return Err(format!("Unable to poll OrbitFabric Core process: {error}"));
            }
        }
    };

    let stdout_bytes = stdout_reader
        .join()
        .map_err(|_| "OrbitFabric Core stdout reader thread failed.".to_string())??;
    let stderr_bytes = stderr_reader
        .join()
        .map_err(|_| "OrbitFabric Core stderr reader thread failed.".to_string())??;

    let report_text = match &report_path {
        Some(path) if path.is_file() => fs::read_to_string(path).ok(),
        _ => None,
    };

    Ok(CoreInvocationResult {
        operation: operation.to_string(),
        executable: command.to_string(),
        args: args.iter().map(|arg| (*arg).to_string()).collect(),
        exit_code: status.code(),
        process_completed: !timed_out,
        timed_out,
        stdout: String::from_utf8_lossy(&stdout_bytes).to_string(),
        stderr: String::from_utf8_lossy(&stderr_bytes).to_string(),
        report_path: report_path.as_ref().map(|path| display_path(path)),
        report_text,
    })
}

fn read_stream<R: Read>(mut stream: R) -> Result<Vec<u8>, String> {
    let mut buffer = Vec::new();
    stream
        .read_to_end(&mut buffer)
        .map_err(|error| format!("Unable to read OrbitFabric Core process output: {error}"))?;
    Ok(buffer)
}

fn core_timeout_for_operation(operation: &str) -> Duration {
    if operation == "version" {
        CORE_VERSION_TIMEOUT
    } else {
        CORE_OPERATION_TIMEOUT
    }
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sanitize_request_id_keeps_only_safe_characters() {
        assert_eq!(sanitize_request_id("abc DEF/../123_-"), "abcDEF123_-");
        assert_eq!(sanitize_request_id("///"), "request");
    }

    #[test]
    fn clear_request_temp_removes_the_whole_request_directory() {
        let request_id = "rust-cleanup-test";
        let report = request_report_path(request_id, "report.json", true)
            .expect("request temp directory should be created");
        fs::write(&report, b"{}")
            .expect("test report should be writable");

        let request_dir = core_request_temp_dir(request_id);
        assert!(request_dir.is_dir());
        assert!(report.is_file());

        clear_core_request_temp(request_id.to_string())
            .expect("request temp directory should be removable");

        assert!(!request_dir.exists());
    }

    #[cfg(unix)]
    #[test]
    fn core_command_completes_before_timeout() {
        let result = run_core_command_with_timeout(
            "/bin/sh".to_string(),
            "test",
            &["-c", "printf 'ok'"],
            None,
            Duration::from_secs(1),
        )
        .expect("test command should run");

        assert!(result.process_completed);
        assert!(!result.timed_out);
        assert_eq!(result.exit_code, Some(0));
        assert_eq!(result.stdout, "ok");
    }

    #[cfg(unix)]
    #[test]
    fn core_command_is_killed_after_timeout() {
        let result = run_core_command_with_timeout(
            "/bin/sh".to_string(),
            "test",
            &["-c", "sleep 2"],
            None,
            Duration::from_millis(75),
        )
        .expect("timed-out command should return a transport result");

        assert!(!result.process_completed);
        assert!(result.timed_out);
    }
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
            integrations::read_integration_package_manifest,
            integrations::read_integration_result_bundle,
            capture::save_surface_capture_png,
        ])
        .run(tauri::generate_context!())
        .expect("error while running OrbitFabric Studio");
}
