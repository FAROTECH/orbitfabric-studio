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

export type GeneratedArtifactClass =
  | "reports"
  | "logs"
  | "docs"
  | "runtime"
  | "ground"
  | "unknown";

export type GeneratedArtifactKnownStatus = "known" | "unknown";

export type GeneratedArtifactPreviewStatus = "previewable" | "notPreviewable";

export type GeneratedArtifactProvenanceSource =
  | "documentedCorePath"
  | "documentedCoreFileName"
  | "manifestField"
  | "unknown";

export interface GeneratedArtifactInventory {
  generated_dir: string | null;
  artifacts: GeneratedArtifactEntry[];
  counts: GeneratedArtifactInventoryCounts;
  warnings: string[];
}

export interface GeneratedArtifactInventoryCounts {
  total_artifacts: number;
  by_class: Record<GeneratedArtifactClass, number>;
  known_artifacts: number;
  unknown_artifacts: number;
  previewable_artifacts: number;
  not_previewable_artifacts: number;
}

export interface GeneratedArtifactEntry {
  name: string;
  path: string;
  relative_path: string;
  extension: string | null;
  size_bytes: number;
  artifact_class: GeneratedArtifactClass;
  known_status: GeneratedArtifactKnownStatus;
  preview_status: GeneratedArtifactPreviewStatus;
  classification_reason: string;
  provenance: GeneratedArtifactProvenance;
}

export interface GeneratedArtifactProvenance {
  source: GeneratedArtifactProvenanceSource;
  detail: string | null;
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
  log_path: string | null;
  log_available: boolean;
}

export type CoreSimulationResultStatus = "passed" | "failed";

export type CoreSimulationJsonValue =
  | string
  | number
  | boolean
  | null
  | CoreSimulationJsonValue[]
  | { [key: string]: CoreSimulationJsonValue };

export interface CoreSimulationReport {
  tool: "orbitfabric-sim";
  version: string;
  mission: string;
  scenario: string;
  result: CoreSimulationResultStatus;
  summary: CoreSimulationSummary;
  timeline: CoreSimulationTimelineEntry[];
  events: CoreSimulationEventRecord[];
  commands: CoreSimulationCommandRecord[];
  mode_transitions: CoreSimulationModeTransitionRecord[];
  data_flow_evidence: CoreSimulationDataFlowEvidenceRecord[];
  expectations?: CoreSimulationExpectationAccounting;
  final_state: CoreSimulationFinalState;
  failed_expectations: CoreSimulationFailedExpectation[];
}

export interface CoreSimulationSummary {
  events: number;
  commands: number;
  mode_transitions: number;
  data_flow_evidence: number;
  failed_expectations: number;
  expectations?: number;
  passed_expectations?: number;
}

export interface CoreSimulationTimelineEntry {
  t: number;
  time: string;
  message: string;
  rendered: string;
}

export interface CoreSimulationEventRecord {
  t: number;
  event_id: string;
  severity: string;
}

export interface CoreSimulationCommandRecord {
  t: number;
  command_id: string;
  status: string;
  dispatch: string;
}

export interface CoreSimulationModeTransitionRecord {
  t: number;
  from: string;
  to: string;
  reason: string;
}

export interface CoreSimulationDataFlowEvidenceRecord {
  t: number;
  data_product_id?: string;
  producer?: string;
  producer_type?: string;
  triggered_by_command?: string;
  storage_intent?: { [key: string]: CoreSimulationJsonValue };
  downlink_intent?: { [key: string]: CoreSimulationJsonValue };
  eligible_downlink_flows?: string[];
  contact_windows?: string[];
  [key: string]: CoreSimulationJsonValue | undefined;
}

export interface CoreSimulationExpectationAccounting {
  total: number;
  passed: number;
  failed: number;
  records: CoreSimulationExpectationRecord[];
}

export interface CoreSimulationExpectationRecord {
  t: number;
  expectation_type: string;
  target: string;
  expected: CoreSimulationJsonValue;
  actual: CoreSimulationJsonValue;
  result: CoreSimulationResultStatus;
  message: string;
}

export interface CoreSimulationFinalState {
  mode: string;
  telemetry: { [key: string]: CoreSimulationJsonValue };
}

export type CoreSimulationFailedExpectation = CoreSimulationJsonValue;

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

export interface CoreRelationshipManifest {
  manifest_version: string;
  kind: "orbitfabric.relationship_manifest";
  orbitfabric_version: string;
  status: string;
  mission: CoreReportMissionIdentity;
  source: CoreRelationshipManifestSource;
  boundaries: CoreRelationshipManifestBoundaries;
  counts: CoreRelationshipManifestCounts;
  relationship_types: CoreRelationshipType[];
  relationships: CoreRelationshipRecord[];
  derivation_policy: CoreRelationshipDerivationPolicy;
}

export interface CoreRelationshipManifestSource extends CoreReportSource {
  entity_index_kind: string;
  entity_index_version: string;
}

export interface CoreRelationshipManifestBoundaries {
  source_of_truth: string;
  core_derived_report: boolean;
  read_only: boolean;
  contains_entity_index: boolean;
  contains_entity_records: boolean;
  contains_relationship_manifest: boolean;
  contains_relationship_records: boolean;
  contains_relationship_graph: boolean;
  contains_dependency_graph: boolean;
  contains_yaml_ast: boolean;
  contains_source_locations: boolean;
  contains_plugin_api: boolean;
  contains_studio_api: boolean;
  contains_runtime_behavior: boolean;
  contains_ground_behavior: boolean;
}

export interface CoreRelationshipManifestCounts {
  total_relationships: number;
  relationship_types: Record<string, number>;
}

export interface CoreRelationshipType {
  relationship_type: string;
  display_name: string;
  from_domain: string;
  to_domain: string;
  derived_from: CoreRelationshipDerivation;
  relationship_count: number;
}

export interface CoreRelationshipRecord {
  relationship_id: string;
  relationship_type: string;
  from: CoreRelationshipEndpoint;
  to: CoreRelationshipEndpoint;
  derived_from: CoreRelationshipDerivation;
}

export interface CoreRelationshipEndpoint {
  domain: string;
  id: string;
}

export interface CoreRelationshipDerivation {
  model_field: string;
}

export interface CoreRelationshipDerivationPolicy {
  requires_explicit_loaded_mission_model_fields: boolean;
  references_entity_index_entities: boolean;
  forbids_naming_heuristics: boolean;
  forbids_raw_yaml_scanning: boolean;
  forbids_downstream_assumptions: boolean;
}

export interface CoreDashboardSummary {
  dashboard_version: string;
  kind: "orbitfabric.dashboard_summary";
  orbitfabric_version: string;
  mission: CoreReportMissionIdentity;
  source: CoreDashboardSummarySource;
  boundaries: CoreDashboardSummaryBoundaries;
  validation: CoreDashboardValidationSummary;
  model_domains: CoreDashboardModelDomains;
  entity_inventory: CoreDashboardEntityInventory;
  relationship_inventory: CoreDashboardRelationshipInventory;
  coverage: CoreDashboardCoverageState;
}

export interface CoreDashboardSummarySource extends CoreReportSource {
  model_summary_kind: string;
  model_summary_version: string;
  entity_index_kind: string;
  entity_index_version: string;
  relationship_manifest_kind: string;
  relationship_manifest_version: string;
}

export interface CoreDashboardSummaryBoundaries {
  source_of_truth: string;
  core_derived_report: boolean;
  read_only: boolean;
  contains_dashboard_summary: boolean;
  contains_coverage_metrics: boolean;
  contains_health_score: boolean;
  contains_scenario_run_index: boolean;
  contains_expectation_accounting: boolean;
  contains_relationship_graph: boolean;
  contains_dependency_graph: boolean;
  contains_yaml_ast: boolean;
  contains_source_locations: boolean;
  contains_plugin_api: boolean;
  contains_studio_api: boolean;
  contains_runtime_behavior: boolean;
  contains_ground_behavior: boolean;
}

export interface CoreDashboardValidationSummary {
  tool: string;
  result: string;
  errors: number;
  warnings: number;
  info: number;
}

export interface CoreDashboardModelDomains {
  required: CoreDashboardDomainPresenceSummary;
  optional: CoreDashboardDomainPresenceSummary;
  counts: Record<string, number>;
  domains: CoreDashboardModelDomain[];
}

export interface CoreDashboardDomainPresenceSummary {
  total: number;
  present: number;
  missing: number;
}

export interface CoreDashboardModelDomain {
  id: string;
  display_name: string;
  source_file: string;
  required: boolean;
  present: boolean;
  count: number;
}

export interface CoreDashboardEntityInventory {
  total_entities: number;
  domains: Record<string, number>;
}

export interface CoreDashboardRelationshipInventory {
  total_relationships: number;
  relationship_types: Record<string, number>;
}

export interface CoreDashboardCoverageState {
  status: string;
  reason: string;
  requires_core_output: string;
}

export interface CoreScenarioRunIndex {
  index_version: string;
  kind: "orbitfabric.scenario_run_index";
  orbitfabric_version: string;
  source: CoreScenarioRunIndexSource;
  boundaries: CoreScenarioRunIndexBoundaries;
  summary: CoreScenarioRunIndexSummary;
  runs: CoreScenarioRunRecord[];
}

export interface CoreScenarioRunIndexSource {
  simulation_reports_dir: string;
  input_report_tool: string;
}

export interface CoreScenarioRunIndexBoundaries {
  source_of_truth: string;
  core_derived_report: boolean;
  read_only: boolean;
  contains_scenario_run_index: boolean;
  contains_coverage_metrics: boolean;
  contains_health_score: boolean;
  contains_expectation_accounting: boolean;
  contains_relationship_graph: boolean;
  contains_dependency_graph: boolean;
  contains_yaml_ast: boolean;
  contains_source_locations: boolean;
  contains_plugin_api: boolean;
  contains_studio_api: boolean;
  contains_runtime_behavior: boolean;
  contains_ground_behavior: boolean;
  derived_from_simulation_json: boolean;
  derived_from_logs: boolean;
}

export interface CoreScenarioRunIndexSummary {
  total: number;
  passed: number;
  failed: number;
}

export interface CoreScenarioRunRecord {
  report_file: string;
  report_path: string;
  mission: string;
  scenario: string;
  result: CoreSimulationResultStatus;
  summary: Record<string, number>;
}

export interface CoreCoverageSummary {
  coverage_version: string;
  kind: "orbitfabric.coverage_summary";
  orbitfabric_version: string;
  mission: CoreReportMissionIdentity;
  source: CoreCoverageSummarySource;
  boundaries: CoreCoverageSummaryBoundaries;
  scenario_runs: CoreScenarioRunIndexSummary;
  entity_coverage: Record<string, CoreCoverageRecord>;
  expectation_coverage: CoreExpectationCoverage;
  relationship_coverage: CoreRelationshipCoverage;
  unsupported: CoreUnsupportedCoverageScope;
}

export interface CoreCoverageSummarySource extends CoreReportSource {
  entity_index: string;
  entity_index_kind: string;
  entity_index_version: string;
  relationship_manifest: string;
  relationship_manifest_kind: string;
  relationship_manifest_version: string;
  scenario_run_index: string;
  scenario_run_index_kind: string;
  scenario_run_index_version: string;
}

export interface CoreCoverageSummaryBoundaries {
  source_of_truth: string;
  core_derived_report: boolean;
  read_only: boolean;
  contains_coverage_metrics: boolean;
  contains_health_score: boolean;
  contains_model_completeness_score: boolean;
  contains_relationship_graph: boolean;
  contains_dependency_graph: boolean;
  contains_yaml_ast: boolean;
  contains_source_locations: boolean;
  contains_plugin_api: boolean;
  contains_studio_api: boolean;
  contains_runtime_behavior: boolean;
  contains_ground_behavior: boolean;
  coverage_derived_from_entity_index: boolean;
  coverage_derived_from_relationship_manifest: boolean;
  coverage_derived_from_scenario_run_index: boolean;
  coverage_derived_from_simulation_json: boolean;
  coverage_derived_from_logs: boolean;
}

export interface CoreCoverageRecord {
  total: number;
  covered: number;
  uncovered: number;
  coverage_ratio: number | null;
  covered_ids: string[];
  uncovered_ids: string[];
}

export interface CoreExpectationCoverage {
  total: number;
  passed: number;
  failed: number;
  pass_ratio: number | null;
  by_type: Record<string, CoreExpectationCoverageByType>;
}

export interface CoreExpectationCoverageByType {
  total: number;
  passed: number;
  failed: number;
  pass_ratio: number | null;
}

export interface CoreRelationshipCoverage {
  supported_relationship_types: string[];
  total_supported_relationships: number;
  covered_supported_relationships: number;
  uncovered_supported_relationships: number;
  coverage_ratio: number | null;
  covered_relationship_ids: string[];
  uncovered_relationship_ids: string[];
  by_type: Record<string, CoreCoverageRecord>;
}

export interface CoreUnsupportedCoverageScope {
  entity_domains: string[];
  relationship_types: string[];
  reason: string;
}
