export type EntryKind = "file" | "directory";

export type EntryCategory =
  | "sourceModel"
  | "scenarioSource"
  | "derivedReport"
  | "generatedOutput";

export interface ProjectEntry {
  name: string;
  path: string;
  kind: EntryKind;
  category: EntryCategory;
}

export interface WorkspaceInspection {
  selected_path: string;
  mission_dir: string | null;
  scenarios_dir: string | null;
  generated_dir: string | null;
  source_model_files: ProjectEntry[];
  missing_expected_source_files: string[];
  scenario_files: ProjectEntry[];
  generated_locations: ProjectEntry[];
  warnings: string[];
}

export interface FileContent {
  name: string;
  path: string;
  language: string;
  content: string;
  size_bytes: number;
}

export interface CoreCommandResult {
  command: string;
  args: string[];
  exit_code: number | null;
  success: boolean;
  stdout: string;
  stderr: string;
}
