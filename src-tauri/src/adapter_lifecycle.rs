use super::{
    canonicalize_existing_file, display_path, run_core_command, CoreInvocationResult,
};

#[tauri::command]
pub(crate) fn run_core_adapter_list(
    executable: String,
) -> Result<CoreInvocationResult, String> {
    run_core_command(
        executable,
        "adapter-list",
        &["adapter", "list", "--json"],
        None,
    )
}

#[tauri::command]
pub(crate) fn run_core_adapter_verify(
    executable: String,
    instance_id: String,
) -> Result<CoreInvocationResult, String> {
    run_core_command(
        executable,
        "adapter-verify",
        &["adapter", "verify", instance_id.as_str(), "--json"],
        None,
    )
}

#[tauri::command]
pub(crate) fn run_core_adapter_lock_check(
    executable: String,
    lock_path: String,
) -> Result<CoreInvocationResult, String> {
    let lock = canonicalize_existing_file(&lock_path)?;
    let lock_display = display_path(&lock);
    run_core_command(
        executable,
        "adapter-lock-check",
        &["adapter", "lock", "check", lock_display.as_str(), "--json"],
        None,
    )
}

#[tauri::command]
pub(crate) fn run_core_adapter_catalog_select(
    executable: String,
    catalog_path: String,
    source_coordinate: String,
    release_version: String,
) -> Result<CoreInvocationResult, String> {
    let catalog = canonicalize_existing_file(&catalog_path)?;
    let catalog_display = display_path(&catalog);
    run_core_command(
        executable,
        "adapter-catalog-select",
        &[
            "adapter",
            "catalog",
            "select",
            catalog_display.as_str(),
            source_coordinate.as_str(),
            "--version",
            release_version.as_str(),
            "--json",
        ],
        None,
    )
}
