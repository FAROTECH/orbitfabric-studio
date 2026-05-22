use serde::Serialize;
use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

const MAX_TEXT_FILE_BYTES: u64 = 1_048_576;
const MAX_GENERATED_ARTIFACTS: usize = 1_000;
const MAX_GENERATED_ARTIFACT_DEPTH: usize = 8;

const EXPECTED_MISSION_FILES: &[&str] = &[
    "spacecraft.yaml",
    "subsystems.yaml",
    "modes.yaml",
    "telemetry.yaml",
    "commands.yaml",
    "events.yaml",
    "faults.yaml",
    "packets.yaml",
    "policies.yaml",
    "payloads.yaml",
    "data_products.yaml",
    "contacts.yaml",
    "commandability.yaml",
];

const GENERATED_DIRS: &[&str] = &[
    "docs",
    "reports",
    "logs",
    "runtime",
    "runtime/cpp17",
];

#[derive(Debug, Serialize)]
struct WorkspaceInspection {
    selected_path: String,
    mission_dir: Option<String>,
    scenarios_dir: Option<String>,
    generated_dir: Option<String>,
    source_model_files: Vec<ProjectEntry>,
    missing_expected_source_files: Vec<String>,
    scenario_files: Vec<ProjectEntry>,
    generated_locations: Vec<ProjectEntry>,
    warnings: Vec<String>,
}

#[derive(Debug, Serialize)]
struct ProjectEntry {
    name: String,
    path: String,
    kind: EntryKind,
    category: EntryCategory,
}

#[derive(Debug, Serialize)]
struct FileContent {
    name: String,
    path: String,
    language: String,
    content: String,
    size_bytes: u64,
}

#[derive(Debug, Serialize)]
struct GeneratedArtifactInventory {
    generated_dir: Option<String>,
    artifacts: Vec<GeneratedArtifactEntry>,
    counts: GeneratedArtifactInventoryCounts,
    warnings: Vec<String>,
}

#[derive(Debug, Serialize)]
struct GeneratedArtifactInventoryCounts {
    total_artifacts: usize,
    by_class: BTreeMap<String, usize>,
    known_artifacts: usize,
    unknown_artifacts: usize,
    previewable_artifacts: usize,
    not_previewable_artifacts: usize,
}

#[derive(Debug, Serialize)]
struct GeneratedArtifactEntry {
    name: String,
    path: String,
    relative_path: String,
    extension: Option<String>,
    size_bytes: u64,
    artifact_class: GeneratedArtifactClass,
    known_status: GeneratedArtifactKnownStatus,
    preview_status: GeneratedArtifactPreviewStatus,
    classification_reason: String,
    provenance: GeneratedArtifactProvenance,
}

#[derive(Debug, Serialize)]
struct GeneratedArtifactProvenance {
    source: GeneratedArtifactProvenanceSource,
    detail: Option<String>,
}

#[derive(Debug, Serialize)]
struct CoreCommandResult {
    command: String,
    args: Vec<String>,
    exit_code: Option<i32>,
    success: bool,
    stdout: String,
    stderr: String,
    json_report_path: Option<String>,
    json_report_available: bool,
    json_report_content: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
enum EntryKind {
    File,
    Directory,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
enum EntryCategory {
    SourceModel,
    ScenarioSource,
    DerivedReport,
    GeneratedOutput,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
enum GeneratedArtifactClass {
    Reports,
    Logs,
    Docs,
    Runtime,
    Ground,
    Unknown,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
enum GeneratedArtifactKnownStatus {
    Known,
    Unknown,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
enum GeneratedArtifactPreviewStatus {
    Previewable,
    NotPreviewable,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
enum GeneratedArtifactProvenanceSource {
    DocumentedCorePath,
    DocumentedCoreFileName,
    ManifestField,
    Unknown,
}

impl GeneratedArtifactClass {
    fn as_str(&self) -> &'static str {
        match self {
            GeneratedArtifactClass::Reports => "reports",
            GeneratedArtifactClass::Logs => "logs",
            GeneratedArtifactClass::Docs => "docs",
            GeneratedArtifactClass::Runtime => "runtime",
            GeneratedArtifactClass::Ground => "ground",
            GeneratedArtifactClass::Unknown => "unknown",
        }
    }
}

#[tauri::command]
fn inspect_workspace(path: String) -> Result<WorkspaceInspection, String> {
    let selected = PathBuf::from(path);

    if !selected.exists() {
        return Err("Selected path does not exist.".to_string());
    }

    if !selected.is_dir() {
        return Err("Selected path is not a directory.".to_string());
    }

    let mission_dir = detect_mission_dir(&selected);
    let scenarios_dir = detect_child_dir(&selected, "scenarios");
    let generated_dir = detect_child_dir(&selected, "generated");

    let mut warnings = Vec::new();

    if mission_dir.is_none() {
        warnings.push(
            "No OrbitFabric mission directory was detected structurally. This is not a Core validation result."
                .to_string(),
        );
    }

    let (source_model_files, missing_expected_source_files) = match &mission_dir {
        Some(dir) => inspect_mission_files(dir),
        None => (Vec::new(), EXPECTED_MISSION_FILES.iter().map(|file| file.to_string()).collect()),
    };

    let scenario_files = scenarios_dir
        .as_ref()
        .map(|dir| list_yaml_files(dir, EntryCategory::ScenarioSource))
        .unwrap_or_default();

    let generated_locations = generated_dir
        .as_ref()
        .map(|dir| inspect_generated_locations(dir))
        .unwrap_or_default();

    Ok(WorkspaceInspection {
        selected_path: display_path(&selected),
        mission_dir: mission_dir.as_ref().map(|dir| display_path(dir)),
        scenarios_dir: scenarios_dir.as_ref().map(|dir| display_path(dir)),
        generated_dir: generated_dir.as_ref().map(|dir| display_path(dir)),
        source_model_files,
        missing_expected_source_files,
        scenario_files,
        generated_locations,
        warnings,
    })
}

#[tauri::command]
fn inspect_generated_artifacts(workspace_path: String) -> Result<GeneratedArtifactInventory, String> {
    let workspace = canonicalize_existing_dir(&workspace_path)?;
    let generated_candidate = workspace.join("generated");
    let mut warnings = Vec::new();

    if !generated_candidate.exists() {
        warnings.push("No generated directory was found in the selected workspace.".to_string());

        return Ok(GeneratedArtifactInventory {
            generated_dir: None,
            artifacts: Vec::new(),
            counts: empty_generated_artifact_counts(),
            warnings,
        });
    }

    if !generated_candidate.is_dir() {
        return Err("The generated path exists but is not a directory.".to_string());
    }

    let generated = generated_candidate
        .canonicalize()
        .map_err(|error| format!("Unable to resolve generated directory: {error}"))?;

    if !generated.starts_with(&workspace) {
        return Err("Generated directory is outside the selected workspace.".to_string());
    }

    let mut artifacts = Vec::new();
    collect_generated_artifacts(&generated, &generated, 0, &mut artifacts, &mut warnings);
    artifacts.sort_by(|left, right| left.relative_path.cmp(&right.relative_path));

    let counts = count_generated_artifacts(&artifacts);

    Ok(GeneratedArtifactInventory {
        generated_dir: Some(display_path(&generated)),
        artifacts,
        counts,
        warnings,
    })
}

#[tauri::command]
fn read_text_file(workspace_path: String, file_path: String) -> Result<FileContent, String> {
    let workspace = canonicalize_existing_dir(&workspace_path)?;
    let file = canonicalize_existing_file(&file_path)?;

    if !file.starts_with(&workspace) {
        return Err("Requested file is outside the selected workspace.".to_string());
    }

    let metadata = fs::metadata(&file).map_err(|error| format!("Unable to read file metadata: {error}"))?;

    if metadata.len() > MAX_TEXT_FILE_BYTES {
        return Err(format!(
            "File is too large for the read-only viewer. Maximum supported size is {MAX_TEXT_FILE_BYTES} bytes."
        ));
    }

    if !is_supported_text_file(&file) {
        return Err("File type is not supported by the read-only text viewer.".to_string());
    }

    let content = fs::read_to_string(&file).map_err(|error| format!("Unable to read file as UTF-8 text: {error}"))?;
    let name = file
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or("selected file")
        .to_string();

    Ok(FileContent {
        name,
        path: display_path(&file),
        language: language_for_path(&file),
        content,
        size_bytes: metadata.len(),
    })
}

#[tauri::command]
fn run_core_version(executable: String) -> Result<CoreCommandResult, String> {
    run_core_command(executable, &["--version"], None)
}

#[tauri::command]
fn run_core_inspect_mission(
    executable: String,
    mission_dir: String,
) -> Result<CoreCommandResult, String> {
    let mission = canonicalize_existing_dir(&mission_dir)?;
    let mission_display = display_path(&mission);
    run_core_command(executable, &["inspect", "mission", mission_display.as_str()], None)
}

#[tauri::command]
fn run_core_lint_mission(
    executable: String,
    mission_dir: String,
) -> Result<CoreCommandResult, String> {
    let mission = canonicalize_existing_dir(&mission_dir)?;
    let mission_display = display_path(&mission);
    let report_path = lint_report_path_for_mission(&mission)?;
    let report_display = display_path(&report_path);

    run_core_command(
        executable,
        &["lint", mission_display.as_str(), "--json", report_display.as_str()],
        Some(report_path),
    )
}

#[tauri::command]
fn run_core_export_model_summary(
    executable: String,
    mission_dir: String,
) -> Result<CoreCommandResult, String> {
    let mission = canonicalize_existing_dir(&mission_dir)?;
    let mission_display = display_path(&mission);
    let report_path = model_summary_report_path_for_mission(&mission)?;
    let report_display = display_path(&report_path);

    run_core_command(
        executable,
        &[
            "export",
            "model-summary",
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
) -> Result<CoreCommandResult, String> {
    let mission = canonicalize_existing_dir(&mission_dir)?;
    let mission_display = display_path(&mission);
    let report_path = entity_index_report_path_for_mission(&mission)?;
    let report_display = display_path(&report_path);

    run_core_command(
        executable,
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
) -> Result<CoreCommandResult, String> {
    let mission = canonicalize_existing_dir(&mission_dir)?;
    let mission_display = display_path(&mission);
    let report_path = relationship_manifest_report_path_for_mission(&mission)?;
    let report_display = display_path(&report_path);

    run_core_command(
        executable,
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

fn run_core_command(
    executable: String,
    args: &[&str],
    json_report_path: Option<PathBuf>,
) -> Result<CoreCommandResult, String> {
    let command = executable.trim();

    if command.is_empty() {
        return Err("OrbitFabric executable path is empty.".to_string());
    }

    let output = Command::new(command)
        .args(args)
        .output()
        .map_err(|error| format!("Unable to execute OrbitFabric Core command: {error}"))?;

    let json_report_available = json_report_path
        .as_ref()
        .is_some_and(|path| path.is_file());

    let json_report_content = match &json_report_path {
        Some(path) if path.is_file() => fs::read_to_string(path).ok(),
        _ => None,
    };

    Ok(CoreCommandResult {
        command: command.to_string(),
        args: args.iter().map(|arg| (*arg).to_string()).collect(),
        exit_code: output.status.code(),
        success: output.status.success(),
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        json_report_path: json_report_path.as_ref().map(|path| display_path(path)),
        json_report_available,
        json_report_content,
    })
}

fn collect_generated_artifacts(
    dir: &Path,
    generated_root: &Path,
    depth: usize,
    artifacts: &mut Vec<GeneratedArtifactEntry>,
    warnings: &mut Vec<String>,
) {
    if artifacts.len() >= MAX_GENERATED_ARTIFACTS {
        return;
    }

    if depth > MAX_GENERATED_ARTIFACT_DEPTH {
        warnings.push(format!(
            "Generated artifact inspection depth limit reached at {}.",
            display_path(dir)
        ));
        return;
    }

    let read_dir = match fs::read_dir(dir) {
        Ok(read_dir) => read_dir,
        Err(error) => {
            warnings.push(format!(
                "Unable to read generated directory {}: {error}",
                display_path(dir)
            ));
            return;
        }
    };

    let mut entries = Vec::new();

    for entry_result in read_dir {
        let entry = match entry_result {
            Ok(entry) => entry,
            Err(error) => {
                warnings.push(format!("Unable to read generated directory entry: {error}"));
                continue;
            }
        };

        let file_type = match entry.file_type() {
            Ok(file_type) => file_type,
            Err(error) => {
                warnings.push(format!(
                    "Unable to read generated entry type for {}: {error}",
                    display_path(&entry.path())
                ));
                continue;
            }
        };

        entries.push((entry.path(), file_type));
    }

    entries.sort_by(|left, right| left.0.cmp(&right.0));

    for (path, file_type) in entries {
        if artifacts.len() >= MAX_GENERATED_ARTIFACTS {
            warnings.push(format!(
                "Generated artifact inspection limit reached at {MAX_GENERATED_ARTIFACTS} files."
            ));
            return;
        }

        if file_type.is_symlink() {
            warnings.push(format!(
                "Generated artifact inspection skipped symbolic link {}.",
                display_path(&path)
            ));
            continue;
        }

        if file_type.is_dir() {
            collect_generated_artifacts(&path, generated_root, depth + 1, artifacts, warnings);
            continue;
        }

        if file_type.is_file() {
            match build_generated_artifact_entry(&path, generated_root) {
                Ok(artifact) => artifacts.push(artifact),
                Err(error) => warnings.push(error),
            }
        }
    }
}

fn build_generated_artifact_entry(
    path: &Path,
    generated_root: &Path,
) -> Result<GeneratedArtifactEntry, String> {
    let metadata = fs::metadata(path).map_err(|error| {
        format!(
            "Unable to read generated artifact metadata for {}: {error}",
            display_path(path)
        )
    })?;

    let name = path
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or("generated artifact")
        .to_string();

    let relative_path = path
        .strip_prefix(generated_root)
        .unwrap_or(path)
        .to_string_lossy()
        .replace('\\', "/");

    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| value.to_ascii_lowercase());

    let artifact_class = generated_artifact_class_for_relative_path(&relative_path);
    let preview_status = if metadata.len() <= MAX_TEXT_FILE_BYTES && is_supported_text_file(path) {
        GeneratedArtifactPreviewStatus::Previewable
    } else {
        GeneratedArtifactPreviewStatus::NotPreviewable
    };

    Ok(GeneratedArtifactEntry {
        name,
        path: display_path(path),
        relative_path,
        extension,
        size_bytes: metadata.len(),
        artifact_class,
        known_status: GeneratedArtifactKnownStatus::Unknown,
        preview_status,
        classification_reason:
            "Classified only by top-level generated/ subdirectory in this backend slice."
                .to_string(),
        provenance: GeneratedArtifactProvenance {
            source: GeneratedArtifactProvenanceSource::Unknown,
            detail: Some(
                "No Core manifest or file-specific provenance is interpreted by this backend slice."
                    .to_string(),
            ),
        },
    })
}

fn generated_artifact_class_for_relative_path(relative_path: &str) -> GeneratedArtifactClass {
    match relative_path.split('/').next() {
        Some("reports") => GeneratedArtifactClass::Reports,
        Some("logs") => GeneratedArtifactClass::Logs,
        Some("docs") => GeneratedArtifactClass::Docs,
        Some("runtime") => GeneratedArtifactClass::Runtime,
        Some("ground") => GeneratedArtifactClass::Ground,
        _ => GeneratedArtifactClass::Unknown,
    }
}

fn count_generated_artifacts(artifacts: &[GeneratedArtifactEntry]) -> GeneratedArtifactInventoryCounts {
    let mut counts = empty_generated_artifact_counts();
    counts.total_artifacts = artifacts.len();

    for artifact in artifacts {
        *counts
            .by_class
            .entry(artifact.artifact_class.as_str().to_string())
            .or_insert(0) += 1;

        match artifact.known_status {
            GeneratedArtifactKnownStatus::Known => counts.known_artifacts += 1,
            GeneratedArtifactKnownStatus::Unknown => counts.unknown_artifacts += 1,
        }

        match artifact.preview_status {
            GeneratedArtifactPreviewStatus::Previewable => counts.previewable_artifacts += 1,
            GeneratedArtifactPreviewStatus::NotPreviewable => counts.not_previewable_artifacts += 1,
        }
    }

    counts
}

fn empty_generated_artifact_counts() -> GeneratedArtifactInventoryCounts {
    let mut by_class = BTreeMap::new();

    for artifact_class in ["reports", "logs", "docs", "runtime", "ground", "unknown"] {
        by_class.insert(artifact_class.to_string(), 0);
    }

    GeneratedArtifactInventoryCounts {
        total_artifacts: 0,
        by_class,
        known_artifacts: 0,
        unknown_artifacts: 0,
        previewable_artifacts: 0,
        not_previewable_artifacts: 0,
    }
}

fn lint_report_path_for_mission(mission: &Path) -> Result<PathBuf, String> {
    report_path_for_mission(
        mission,
        "orbitfabric_studio_lint_report.json",
        "Studio lint report directory",
    )
}

fn model_summary_report_path_for_mission(mission: &Path) -> Result<PathBuf, String> {
    report_path_for_mission(
        mission,
        "orbitfabric_studio_model_summary.json",
        "Studio model summary report directory",
    )
}

fn entity_index_report_path_for_mission(mission: &Path) -> Result<PathBuf, String> {
    report_path_for_mission(
        mission,
        "orbitfabric_studio_entity_index.json",
        "Studio entity index report directory",
    )
}

fn relationship_manifest_report_path_for_mission(mission: &Path) -> Result<PathBuf, String> {
    report_path_for_mission(
        mission,
        "orbitfabric_studio_relationship_manifest.json",
        "Studio relationship manifest report directory",
    )
}

fn report_path_for_mission(
    mission: &Path,
    report_file_name: &str,
    report_directory_description: &str,
) -> Result<PathBuf, String> {
    let workspace = mission.parent().unwrap_or(mission);
    let reports_dir = workspace.join("generated").join("reports");

    fs::create_dir_all(&reports_dir)
        .map_err(|error| format!("Unable to create {report_directory_description}: {error}"))?;

    Ok(reports_dir.join(report_file_name))
}

fn canonicalize_existing_dir(path: &str) -> Result<PathBuf, String> {
    let candidate = PathBuf::from(path);

    if !candidate.is_dir() {
        return Err("Workspace path is not a directory.".to_string());
    }

    candidate
        .canonicalize()
        .map_err(|error| format!("Unable to resolve workspace path: {error}"))
}

fn canonicalize_existing_file(path: &str) -> Result<PathBuf, String> {
    let candidate = PathBuf::from(path);

    if !candidate.is_file() {
        return Err("Requested path is not a file.".to_string());
    }

    candidate
        .canonicalize()
        .map_err(|error| format!("Unable to resolve file path: {error}"))
}

fn is_supported_text_file(path: &Path) -> bool {
    match path.extension().and_then(|value| value.to_str()) {
        Some("yaml" | "yml" | "json" | "md" | "txt" | "log" | "hpp" | "cpp" | "h" | "c") => true,
        _ => path
            .file_name()
            .and_then(|value| value.to_str())
            .is_some_and(|name| name == "CMakeLists.txt"),
    }
}

fn language_for_path(path: &Path) -> String {
    match path.extension().and_then(|value| value.to_str()) {
        Some("yaml" | "yml") => "yaml",
        Some("json") => "json",
        Some("md") => "markdown",
        Some("hpp" | "cpp" | "h" | "c") => "cpp",
        Some("log" | "txt") => "plaintext",
        _ => "plaintext",
    }
    .to_string()
}

fn detect_mission_dir(selected: &Path) -> Option<PathBuf> {
    let direct_score = count_expected_files(selected);

    if direct_score > 0 {
        return Some(selected.to_path_buf());
    }

    let child = selected.join("mission");

    if child.is_dir() && count_expected_files(&child) > 0 {
        return Some(child);
    }

    None
}

fn detect_child_dir(selected: &Path, name: &str) -> Option<PathBuf> {
    let child = selected.join(name);

    if child.is_dir() {
        Some(child)
    } else {
        None
    }
}

fn count_expected_files(dir: &Path) -> usize {
    EXPECTED_MISSION_FILES
        .iter()
        .filter(|file| dir.join(file).is_file())
        .count()
}

fn inspect_mission_files(dir: &Path) -> (Vec<ProjectEntry>, Vec<String>) {
    let mut found = Vec::new();
    let mut missing = Vec::new();

    for file in EXPECTED_MISSION_FILES {
        let path = dir.join(file);

        if path.is_file() {
            found.push(ProjectEntry {
                name: (*file).to_string(),
                path: display_path(&path),
                kind: EntryKind::File,
                category: EntryCategory::SourceModel,
            });
        } else {
            missing.push((*file).to_string());
        }
    }

    (found, missing)
}

fn list_yaml_files(dir: &Path, category: EntryCategory) -> Vec<ProjectEntry> {
    let mut entries = Vec::new();

    if let Ok(read_dir) = fs::read_dir(dir) {
        for entry in read_dir.flatten() {
            let path = entry.path();
            let Some(name) = path.file_name().and_then(|value| value.to_str()) else {
                continue;
            };

            if path.is_file() && (name.ends_with(".yaml") || name.ends_with(".yml")) {
                entries.push(ProjectEntry {
                    name: name.to_string(),
                    path: display_path(&path),
                    kind: EntryKind::File,
                    category: clone_category(&category),
                });
            }
        }
    }

    entries.sort_by(|left, right| left.name.cmp(&right.name));
    entries
}

fn inspect_generated_locations(dir: &Path) -> Vec<ProjectEntry> {
    let mut entries = Vec::new();

    for relative in GENERATED_DIRS {
        let path = dir.join(relative);

        if path.is_dir() {
            entries.push(ProjectEntry {
                name: (*relative).to_string(),
                path: display_path(&path),
                kind: EntryKind::Directory,
                category: generated_category(relative),
            });
        }
    }

    entries
}

fn generated_category(relative: &str) -> EntryCategory {
    if relative == "reports" || relative == "logs" {
        EntryCategory::DerivedReport
    } else {
        EntryCategory::GeneratedOutput
    }
}

fn clone_category(category: &EntryCategory) -> EntryCategory {
    match category {
        EntryCategory::SourceModel => EntryCategory::SourceModel,
        EntryCategory::ScenarioSource => EntryCategory::ScenarioSource,
        EntryCategory::DerivedReport => EntryCategory::DerivedReport,
        EntryCategory::GeneratedOutput => EntryCategory::GeneratedOutput,
    }
}

fn display_path(path: &Path) -> String {
    path.to_string_lossy().to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            inspect_workspace,
            inspect_generated_artifacts,
            read_text_file,
            run_core_version,
            run_core_inspect_mission,
            run_core_lint_mission,
            run_core_export_model_summary,
            run_core_export_entity_index,
            run_core_export_relationship_manifest
        ])
        .run(tauri::generate_context!())
        .expect("error while running OrbitFabric Studio");
}
