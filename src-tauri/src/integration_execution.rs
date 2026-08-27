use serde::Serialize;
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::thread;
use std::time::{Duration, Instant};

const ADAPTER_DEFAULT_TIMEOUT: Duration = Duration::from_secs(120);
const ADAPTER_POLL_INTERVAL: Duration = Duration::from_millis(25);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IntegrationAdapterInvocation {
    operation: String,
    executable: String,
    args: Vec<String>,
    exit_code: Option<i32>,
    process_completed: bool,
    timed_out: bool,
    stdout: String,
    stderr: String,
    output_dir: String,
    result_path: String,
    result_text: Option<String>,
}

#[tauri::command]
pub fn run_integration_adapter(
    authorized_argv_prefix: Vec<String>,
    operation: String,
    input_set_manifest: String,
    profile: String,
    output_dir: String,
) -> Result<IntegrationAdapterInvocation, String> {
    run_integration_adapter_with_timeout(
        authorized_argv_prefix,
        operation,
        input_set_manifest,
        profile,
        output_dir,
        ADAPTER_DEFAULT_TIMEOUT,
    )
}

fn run_integration_adapter_with_timeout(
    authorized_argv_prefix: Vec<String>,
    operation: String,
    input_set_manifest: String,
    profile: String,
    output_dir: String,
    timeout: Duration,
) -> Result<IntegrationAdapterInvocation, String> {
    let executable = authorized_argv_prefix
        .first()
        .map(|value| value.trim())
        .filter(|value| !value.is_empty())
        .ok_or_else(|| "Authorized adapter argv prefix is empty.".to_string())?
        .to_string();
    if operation.trim().is_empty() {
        return Err("Integration operation id is empty.".to_string());
    }

    let input_manifest = canonicalize_existing_file(&input_set_manifest, "Core Integration Input Set manifest")?;
    let profile_path = canonicalize_existing_file(&profile, "Projection Profile")?;
    let output_root = prepare_output_dir(&output_dir)?;
    let result_path = output_root.join("integration_result.json");

    // A previous Result must never be accepted as evidence for this invocation.
    if result_path.exists() {
        fs::remove_file(&result_path)
            .map_err(|error| format!("Unable to invalidate previous Integration Result: {error}"))?;
    }

    let input_display = display_path(&input_manifest);
    let profile_display = display_path(&profile_path);
    let output_display = display_path(&output_root);

    let mut args: Vec<String> = authorized_argv_prefix.iter().skip(1).cloned().collect();
    args.extend([
        "run".to_string(),
        "--operation".to_string(),
        operation.clone(),
        "--input-set-manifest".to_string(),
        input_display,
        "--profile".to_string(),
        profile_display,
        "--output-dir".to_string(),
        output_display.clone(),
    ]);

    let mut child = Command::new(&executable)
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|error| format!("Unable to execute authorized integration adapter: {error}"))?;

    let stdout = child
        .stdout
        .take()
        .ok_or_else(|| "Unable to capture integration adapter stdout.".to_string())?;
    let stderr = child
        .stderr
        .take()
        .ok_or_else(|| "Unable to capture integration adapter stderr.".to_string())?;
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
                    .map_err(|error| format!("Unable to reap timed-out integration adapter: {error}"))?;
            }
            Ok(None) => thread::sleep(ADAPTER_POLL_INTERVAL),
            Err(error) => {
                let _ = child.kill();
                let _ = child.wait();
                let _ = stdout_reader.join();
                let _ = stderr_reader.join();
                return Err(format!("Unable to poll integration adapter process: {error}"));
            }
        }
    };

    let stdout_bytes = stdout_reader
        .join()
        .map_err(|_| "Integration adapter stdout reader thread failed.".to_string())??;
    let stderr_bytes = stderr_reader
        .join()
        .map_err(|_| "Integration adapter stderr reader thread failed.".to_string())??;
    let result_text = if result_path.is_file() {
        fs::read_to_string(&result_path).ok()
    } else {
        None
    };

    Ok(IntegrationAdapterInvocation {
        operation,
        executable,
        args,
        exit_code: status.code(),
        process_completed: !timed_out,
        timed_out,
        stdout: String::from_utf8_lossy(&stdout_bytes).to_string(),
        stderr: String::from_utf8_lossy(&stderr_bytes).to_string(),
        output_dir: output_display,
        result_path: display_path(&result_path),
        result_text,
    })
}

fn canonicalize_existing_file(path: &str, label: &str) -> Result<PathBuf, String> {
    let candidate = PathBuf::from(path);
    if !candidate.is_file() {
        return Err(format!("{label} path is not an existing file."));
    }
    candidate
        .canonicalize()
        .map_err(|error| format!("Unable to resolve {label}: {error}"))
}

fn prepare_output_dir(path: &str) -> Result<PathBuf, String> {
    let candidate = PathBuf::from(path);
    fs::create_dir_all(&candidate)
        .map_err(|error| format!("Unable to create Integration Result output directory: {error}"))?;
    candidate
        .canonicalize()
        .map_err(|error| format!("Unable to resolve Integration Result output directory: {error}"))
}

fn read_stream<R: Read>(mut stream: R) -> Result<Vec<u8>, String> {
    let mut buffer = Vec::new();
    stream
        .read_to_end(&mut buffer)
        .map_err(|error| format!("Unable to read integration adapter process output: {error}"))?;
    Ok(buffer)
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
            "orbitfabric-studio-adapter-{label}-{}-{nonce}",
            std::process::id()
        ));
        fs::create_dir_all(&path).unwrap();
        path
    }

    #[cfg(unix)]
    #[test]
    fn adapter_runner_passes_protocol_as_direct_argv_without_shell() {
        let root = temp_dir("argv");
        let input = root.join("input.json");
        let profile = root.join("profile.yaml");
        let output = root.join("out");
        fs::write(&input, b"{}").unwrap();
        fs::write(&profile, b"kind: test\n").unwrap();

        let invocation = run_integration_adapter_with_timeout(
            vec!["/bin/echo".to_string(), "prefix".to_string()],
            "project".to_string(),
            display_path(&input),
            display_path(&profile),
            display_path(&output),
            Duration::from_secs(1),
        )
        .expect("echo adapter fixture should execute");

        assert_eq!(invocation.exit_code, Some(0));
        assert!(invocation.stdout.contains("prefix run --operation project"));
        assert!(invocation.result_text.is_none());
        let _ = fs::remove_dir_all(root);
    }

    #[cfg(unix)]
    #[test]
    fn adapter_runner_invalidates_previous_result_before_execution() {
        let root = temp_dir("stale-result");
        let input = root.join("input.json");
        let profile = root.join("profile.yaml");
        let output = root.join("out");
        fs::create_dir_all(&output).unwrap();
        fs::write(&input, b"{}").unwrap();
        fs::write(&profile, b"kind: test\n").unwrap();
        fs::write(output.join("integration_result.json"), b"{\"old\":true}").unwrap();

        let invocation = run_integration_adapter_with_timeout(
            vec!["/bin/false".to_string()],
            "project".to_string(),
            display_path(&input),
            display_path(&profile),
            display_path(&output),
            Duration::from_secs(1),
        )
        .expect("false fixture should produce a transport result");

        assert_ne!(invocation.exit_code, Some(0));
        assert!(invocation.result_text.is_none());
        assert!(!output.join("integration_result.json").exists());
        let _ = fs::remove_dir_all(root);
    }

    #[cfg(unix)]
    #[test]
    fn external_adapter_acceptance_executes_through_studio_runner() {
        let executable = match std::env::var("ORBITFABRIC_STUDIO_ADAPTER_ACCEPTANCE_EXECUTABLE") {
            Ok(value) => value,
            Err(_) => return,
        };
        let input = std::env::var("ORBITFABRIC_STUDIO_ADAPTER_ACCEPTANCE_INPUT_MANIFEST")
            .expect("acceptance Input Manifest path must be provided with the executable");
        let profile = std::env::var("ORBITFABRIC_STUDIO_ADAPTER_ACCEPTANCE_PROFILE")
            .expect("acceptance Profile path must be provided with the executable");
        let output = std::env::var("ORBITFABRIC_STUDIO_ADAPTER_ACCEPTANCE_OUTPUT_DIR")
            .expect("acceptance output path must be provided with the executable");

        let invocation = run_integration_adapter_with_timeout(
            vec![executable.clone()],
            "project".to_string(),
            input,
            profile,
            output,
            Duration::from_secs(30),
        )
        .expect("real acceptance adapter should execute through Studio runner");

        assert_eq!(invocation.executable, executable);
        assert_eq!(invocation.exit_code, Some(0), "{}", invocation.stderr);
        assert!(invocation.process_completed);
        assert!(!invocation.timed_out);
        assert_eq!(invocation.operation, "project");
        assert_eq!(invocation.args.first().map(String::as_str), Some("run"));
        assert!(invocation.args.windows(2).any(|items| items == ["--operation", "project"]));
        let result = invocation
            .result_text
            .expect("successful real adapter invocation must leave Integration Result");
        assert!(result.contains("\"kind\": \"orbitfabric.integration_result\""));
        assert!(result.contains("\"result\": \"succeeded\""));
    }
}
