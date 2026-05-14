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
  json_report_path: string | null;
  json_report_available: boolean;
  json_report_content: string | null;
}

export interface CoreLintReport {
  tool: string;
  version: string;
  mission: string;
  model_version: string;
  result: string;
  loaded: Record<string, number>;
  summary: CoreLintSummary;
  findings: CoreLintFinding[];
}

export interface CoreLintSummary {
  errors: number;
  warnings: number;
  info: number;
}

export interface CoreLintFinding {
  severity: string;
  code: string;
  file: string | null;
  domain: string | null;
  object_id: string | null;
  message: string;
  suggestion: string | null;
}

export interface CoreReportMissionIdentity {
  id: string;
  name: string;
  model_version: string;
}

export interface CoreReportSource {
  mission_dir: string;
}

export interface CoreModelSummary {
  summary_version: string;
  kind: "orbitfabric.model_summary";
  orbitfabric_version: string;
  mission: CoreReportMissionIdentity;
  source: CoreReportSource;
  boundaries: CoreModelSummaryBoundaries;
  counts: Record<string, number>;
  domains: CoreModelSummaryDomain[];
}

export interface CoreModelSummaryBoundaries {
  source_of_truth: string;
  core_derived_report: boolean;
  contains_entity_index: boolean;
  contains_relationship_manifest: boolean;
  contains_plugin_api: boolean;
  contains_runtime_behavior: boolean;
  contains_ground_behavior: boolean;
}

export interface CoreModelSummaryDomain {
  id: string;
  display_name: string;
  source_file: string;
  required: boolean;
  present: boolean;
  count: number;
  count_provenance: string;
}

export interface CoreEntityIndex {
  index_version: string;
  kind: "orbitfabric.entity_index";
  orbitfabric_version: string;
  mission: CoreReportMissionIdentity;
  source: CoreReportSource;
  boundaries: CoreEntityIndexBoundaries;
  counts: CoreEntityIndexCounts;
  domains: CoreEntityIndexDomain[];
  entities: CoreEntityIndexEntity[];
}

export interface CoreEntityIndexBoundaries {
  source_of_truth: string;
  core_derived_report: boolean;
  read_only: boolean;
  contains_entity_index: boolean;
  contains_entity_records: boolean;
  contains_relationship_manifest: boolean;
  contains_relationship_graph: boolean;
  contains_dependency_graph: boolean;
  contains_yaml_ast: boolean;
  contains_source_locations: boolean;
  contains_plugin_api: boolean;
  contains_studio_api: boolean;
  contains_runtime_behavior: boolean;
  contains_ground_behavior: boolean;
}

export interface CoreEntityIndexCounts {
  total_entities: number;
  domains: Record<string, number>;
}

export interface CoreEntityIndexDomain {
  id: string;
  display_name: string;
  source_file: string;
  required: boolean;
  present: boolean;
  indexed: boolean;
  model_count: number;
  entity_count: number;
  count_provenance: string;
}

export interface CoreEntityIndexEntity {
  id: string;
  domain: string;
  entity_type: string;
  display_name: string;
  source_file: string;
  provenance: string;
  required_domain: boolean;
  present: boolean;
}
