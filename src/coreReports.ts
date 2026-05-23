import type {
  CoreCoverageRecord,
  CoreCoverageSummary,
  CoreDashboardDomainPresenceSummary,
  CoreDashboardModelDomain,
  CoreDashboardSummary,
  CoreEntityIndex,
  CoreEntityIndexDomain,
  CoreEntityIndexEntity,
  CoreExpectationCoverage,
  CoreExpectationCoverageByType,
  CoreLintFinding,
  CoreLintReport,
  CoreModelSummary,
  CoreModelSummaryDomain,
  CoreRelationshipCoverage,
  CoreRelationshipDerivation,
  CoreRelationshipEndpoint,
  CoreRelationshipManifest,
  CoreRelationshipRecord,
  CoreRelationshipType,
  CoreScenarioRunIndex,
  CoreScenarioRunIndexSummary,
  CoreScenarioRunRecord,
  CoreSimulationCommandRecord,
  CoreSimulationDataFlowEvidenceRecord,
  CoreSimulationEventRecord,
  CoreSimulationExpectationAccounting,
  CoreSimulationExpectationRecord,
  CoreSimulationFinalState,
  CoreSimulationJsonValue,
  CoreSimulationModeTransitionRecord,
  CoreSimulationReport,
  CoreSimulationResultStatus,
  CoreSimulationSummary,
  CoreSimulationTimelineEntry,
  CoreUnsupportedCoverageScope,
} from "./types/workspace";

export function parseCoreSimulationReport(
  content: string | null,
): CoreSimulationReport | null {
  if (!content) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(content);

    if (!isRecord(parsed)) {
      return null;
    }

    if (
      parsed.tool !== "orbitfabric-sim" ||
      typeof parsed.version !== "string" ||
      typeof parsed.mission !== "string" ||
      typeof parsed.scenario !== "string" ||
      !isCoreSimulationResultStatus(parsed.result) ||
      !isCoreSimulationSummary(parsed.summary) ||
      !Array.isArray(parsed.timeline) ||
      !parsed.timeline.every(isCoreSimulationTimelineEntry) ||
      !Array.isArray(parsed.events) ||
      !parsed.events.every(isCoreSimulationEventRecord) ||
      !Array.isArray(parsed.commands) ||
      !parsed.commands.every(isCoreSimulationCommandRecord) ||
      !Array.isArray(parsed.mode_transitions) ||
      !parsed.mode_transitions.every(isCoreSimulationModeTransitionRecord) ||
      !Array.isArray(parsed.data_flow_evidence) ||
      !parsed.data_flow_evidence.every(isCoreSimulationDataFlowEvidenceRecord) ||
      !isOptionalCoreSimulationExpectationAccounting(parsed.expectations) ||
      !isCoreSimulationFinalState(parsed.final_state) ||
      !Array.isArray(parsed.failed_expectations) ||
      !parsed.failed_expectations.every(isJsonValue)
    ) {
      return null;
    }

    return parsed as unknown as CoreSimulationReport;
  } catch {
    return null;
  }
}

export function parseCoreLintReport(content: string | null): CoreLintReport | null {
  if (!content) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(content);

    if (!isRecord(parsed)) {
      return null;
    }

    if (
      typeof parsed.tool !== "string" ||
      typeof parsed.version !== "string" ||
      typeof parsed.mission !== "string" ||
      typeof parsed.model_version !== "string" ||
      typeof parsed.result !== "string" ||
      !isNumberRecord(parsed.loaded) ||
      !isCoreLintSummary(parsed.summary) ||
      !Array.isArray(parsed.findings) ||
      !parsed.findings.every(isCoreLintFinding)
    ) {
      return null;
    }

    return parsed as unknown as CoreLintReport;
  } catch {
    return null;
  }
}

export function parseCoreModelSummary(content: string | null): CoreModelSummary | null {
  if (!content) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(content);

    if (!isRecord(parsed)) {
      return null;
    }

    if (
      parsed.kind !== "orbitfabric.model_summary" ||
      typeof parsed.summary_version !== "string" ||
      typeof parsed.orbitfabric_version !== "string" ||
      !isCoreReportMissionIdentity(parsed.mission) ||
      !isCoreReportSource(parsed.source) ||
      !isRecord(parsed.boundaries) ||
      !isNumberRecord(parsed.counts) ||
      !Array.isArray(parsed.domains) ||
      !parsed.domains.every(isCoreModelSummaryDomain)
    ) {
      return null;
    }

    return parsed as unknown as CoreModelSummary;
  } catch {
    return null;
  }
}

export function parseCoreEntityIndex(content: string | null): CoreEntityIndex | null {
  if (!content) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(content);

    if (!isRecord(parsed)) {
      return null;
    }

    if (
      parsed.kind !== "orbitfabric.entity_index" ||
      typeof parsed.index_version !== "string" ||
      typeof parsed.orbitfabric_version !== "string" ||
      !isCoreReportMissionIdentity(parsed.mission) ||
      !isCoreReportSource(parsed.source) ||
      !isRecord(parsed.boundaries) ||
      !isCoreEntityIndexCounts(parsed.counts) ||
      !Array.isArray(parsed.domains) ||
      !parsed.domains.every(isCoreEntityIndexDomain) ||
      !Array.isArray(parsed.entities) ||
      !parsed.entities.every(isCoreEntityIndexEntity)
    ) {
      return null;
    }

    return parsed as unknown as CoreEntityIndex;
  } catch {
    return null;
  }
}

export function parseCoreRelationshipManifest(
  content: string | null,
): CoreRelationshipManifest | null {
  if (!content) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(content);

    if (!isRecord(parsed)) {
      return null;
    }

    if (
      parsed.kind !== "orbitfabric.relationship_manifest" ||
      typeof parsed.manifest_version !== "string" ||
      typeof parsed.orbitfabric_version !== "string" ||
      typeof parsed.status !== "string" ||
      !isCoreReportMissionIdentity(parsed.mission) ||
      !isCoreRelationshipManifestSource(parsed.source) ||
      !isCoreRelationshipManifestBoundaries(parsed.boundaries) ||
      !isCoreRelationshipManifestCounts(parsed.counts) ||
      !Array.isArray(parsed.relationship_types) ||
      !parsed.relationship_types.every(isCoreRelationshipType) ||
      !Array.isArray(parsed.relationships) ||
      !parsed.relationships.every(isCoreRelationshipRecord) ||
      !isCoreRelationshipDerivationPolicy(parsed.derivation_policy)
    ) {
      return null;
    }

    return parsed as unknown as CoreRelationshipManifest;
  } catch {
    return null;
  }
}

export function parseCoreDashboardSummary(
  content: string | null,
): CoreDashboardSummary | null {
  if (!content) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(content);

    if (!isRecord(parsed)) {
      return null;
    }

    if (
      parsed.kind !== "orbitfabric.dashboard_summary" ||
      typeof parsed.dashboard_version !== "string" ||
      typeof parsed.orbitfabric_version !== "string" ||
      !isCoreReportMissionIdentity(parsed.mission) ||
      !isCoreDashboardSummarySource(parsed.source) ||
      !isCoreDashboardSummaryBoundaries(parsed.boundaries) ||
      !isCoreDashboardValidationSummary(parsed.validation) ||
      !isCoreDashboardModelDomains(parsed.model_domains) ||
      !isCoreDashboardEntityInventory(parsed.entity_inventory) ||
      !isCoreDashboardRelationshipInventory(parsed.relationship_inventory) ||
      !isCoreDashboardCoverageState(parsed.coverage)
    ) {
      return null;
    }

    return parsed as unknown as CoreDashboardSummary;
  } catch {
    return null;
  }
}

export function parseCoreScenarioRunIndex(
  content: string | null,
): CoreScenarioRunIndex | null {
  if (!content) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(content);

    if (!isRecord(parsed)) {
      return null;
    }

    if (
      parsed.kind !== "orbitfabric.scenario_run_index" ||
      typeof parsed.index_version !== "string" ||
      typeof parsed.orbitfabric_version !== "string" ||
      !isCoreScenarioRunIndexSource(parsed.source) ||
      !isCoreScenarioRunIndexBoundaries(parsed.boundaries) ||
      !isCoreScenarioRunIndexSummary(parsed.summary) ||
      !Array.isArray(parsed.runs) ||
      !parsed.runs.every(isCoreScenarioRunRecord)
    ) {
      return null;
    }

    return parsed as unknown as CoreScenarioRunIndex;
  } catch {
    return null;
  }
}

export function parseCoreCoverageSummary(
  content: string | null,
): CoreCoverageSummary | null {
  if (!content) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(content);

    if (!isRecord(parsed)) {
      return null;
    }

    if (
      parsed.kind !== "orbitfabric.coverage_summary" ||
      typeof parsed.coverage_version !== "string" ||
      typeof parsed.orbitfabric_version !== "string" ||
      !isCoreReportMissionIdentity(parsed.mission) ||
      !isCoreCoverageSummarySource(parsed.source) ||
      !isCoreCoverageSummaryBoundaries(parsed.boundaries) ||
      !isCoreScenarioRunIndexSummary(parsed.scenario_runs) ||
      !isCoreCoverageRecordMap(parsed.entity_coverage) ||
      !isCoreExpectationCoverage(parsed.expectation_coverage) ||
      !isCoreRelationshipCoverage(parsed.relationship_coverage) ||
      !isCoreUnsupportedCoverageScope(parsed.unsupported)
    ) {
      return null;
    }

    return parsed as unknown as CoreCoverageSummary;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  return (
    isRecord(value) &&
    Object.values(value).every((entry) => typeof entry === "number")
  );
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isOptionalNumber(value: unknown): value is number | undefined {
  return typeof value === "number" || value === undefined;
}

function isJsonValue(value: unknown): value is CoreSimulationJsonValue {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  if (isRecord(value)) {
    return Object.values(value).every(isJsonValue);
  }

  return false;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isCoreSimulationResultStatus(
  value: unknown,
): value is CoreSimulationResultStatus {
  return value === "passed" || value === "failed";
}

function isCoreSimulationSummary(value: unknown): value is CoreSimulationSummary {
  return (
    isRecord(value) &&
    typeof value.events === "number" &&
    typeof value.commands === "number" &&
    typeof value.mode_transitions === "number" &&
    typeof value.data_flow_evidence === "number" &&
    typeof value.failed_expectations === "number" &&
    isOptionalNumber(value.expectations) &&
    isOptionalNumber(value.passed_expectations)
  );
}

function isCoreSimulationTimelineEntry(
  value: unknown,
): value is CoreSimulationTimelineEntry {
  return (
    isRecord(value) &&
    typeof value.t === "number" &&
    typeof value.time === "string" &&
    typeof value.message === "string" &&
    typeof value.rendered === "string"
  );
}

function isCoreSimulationEventRecord(
  value: unknown,
): value is CoreSimulationEventRecord {
  return (
    isRecord(value) &&
    typeof value.t === "number" &&
    typeof value.event_id === "string" &&
    typeof value.severity === "string"
  );
}

function isCoreSimulationCommandRecord(
  value: unknown,
): value is CoreSimulationCommandRecord {
  return (
    isRecord(value) &&
    typeof value.t === "number" &&
    typeof value.command_id === "string" &&
    typeof value.status === "string" &&
    typeof value.dispatch === "string"
  );
}

function isCoreSimulationModeTransitionRecord(
  value: unknown,
): value is CoreSimulationModeTransitionRecord {
  return (
    isRecord(value) &&
    typeof value.t === "number" &&
    typeof value.from === "string" &&
    typeof value.to === "string" &&
    typeof value.reason === "string"
  );
}

function isOptionalString(value: unknown): value is string | undefined {
  return typeof value === "string" || value === undefined;
}

function isOptionalStringArray(value: unknown): value is string[] | undefined {
  return value === undefined || isStringArray(value);
}

function isOptionalJsonRecord(
  value: unknown,
): value is { [key: string]: CoreSimulationJsonValue } | undefined {
  return (
    value === undefined ||
    (isRecord(value) && Object.values(value).every(isJsonValue))
  );
}

function isCoreSimulationDataFlowEvidenceRecord(
  value: unknown,
): value is CoreSimulationDataFlowEvidenceRecord {
  return (
    isRecord(value) &&
    typeof value.t === "number" &&
    isOptionalString(value.data_product_id) &&
    isOptionalString(value.producer) &&
    isOptionalString(value.producer_type) &&
    isOptionalString(value.triggered_by_command) &&
    isOptionalJsonRecord(value.storage_intent) &&
    isOptionalJsonRecord(value.downlink_intent) &&
    isOptionalStringArray(value.eligible_downlink_flows) &&
    isOptionalStringArray(value.contact_windows) &&
    Object.values(value).every(
      (entry) => entry === undefined || isJsonValue(entry),
    )
  );
}

function isOptionalCoreSimulationExpectationAccounting(
  value: unknown,
): value is CoreSimulationExpectationAccounting | undefined {
  return value === undefined || isCoreSimulationExpectationAccounting(value);
}

function isCoreSimulationExpectationAccounting(
  value: unknown,
): value is CoreSimulationExpectationAccounting {
  return (
    isRecord(value) &&
    typeof value.total === "number" &&
    typeof value.passed === "number" &&
    typeof value.failed === "number" &&
    Array.isArray(value.records) &&
    value.records.every(isCoreSimulationExpectationRecord)
  );
}

function isCoreSimulationExpectationRecord(
  value: unknown,
): value is CoreSimulationExpectationRecord {
  return (
    isRecord(value) &&
    typeof value.t === "number" &&
    typeof value.expectation_type === "string" &&
    typeof value.target === "string" &&
    isJsonValue(value.expected) &&
    isJsonValue(value.actual) &&
    isCoreSimulationResultStatus(value.result) &&
    typeof value.message === "string"
  );
}

function isCoreSimulationFinalState(value: unknown): value is CoreSimulationFinalState {
  return (
    isRecord(value) &&
    typeof value.mode === "string" &&
    isRecord(value.telemetry) &&
    Object.values(value.telemetry).every(isJsonValue)
  );
}

function isCoreReportMissionIdentity(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.model_version === "string"
  );
}

function isCoreReportSource(value: unknown): boolean {
  return isRecord(value) && typeof value.mission_dir === "string";
}

function isCoreLintSummary(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.errors === "number" &&
    typeof value.warnings === "number" &&
    typeof value.info === "number"
  );
}

function isCoreLintFinding(value: unknown): value is CoreLintFinding {
  return (
    isRecord(value) &&
    typeof value.severity === "string" &&
    typeof value.code === "string" &&
    isNullableString(value.file) &&
    isNullableString(value.domain) &&
    isNullableString(value.object_id) &&
    typeof value.message === "string" &&
    isNullableString(value.suggestion)
  );
}

function isCoreModelSummaryDomain(value: unknown): value is CoreModelSummaryDomain {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.display_name === "string" &&
    typeof value.source_file === "string" &&
    typeof value.required === "boolean" &&
    typeof value.present === "boolean" &&
    typeof value.count === "number" &&
    typeof value.count_provenance === "string"
  );
}

function isCoreEntityIndexCounts(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.total_entities === "number" &&
    isNumberRecord(value.domains)
  );
}

function isCoreEntityIndexDomain(value: unknown): value is CoreEntityIndexDomain {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.display_name === "string" &&
    typeof value.source_file === "string" &&
    typeof value.required === "boolean" &&
    typeof value.present === "boolean" &&
    typeof value.indexed === "boolean" &&
    typeof value.model_count === "number" &&
    typeof value.entity_count === "number" &&
    typeof value.count_provenance === "string"
  );
}

function isCoreEntityIndexEntity(value: unknown): value is CoreEntityIndexEntity {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.domain === "string" &&
    typeof value.entity_type === "string" &&
    typeof value.display_name === "string" &&
    typeof value.source_file === "string" &&
    typeof value.provenance === "string" &&
    typeof value.required_domain === "boolean" &&
    typeof value.present === "boolean"
  );
}

function isCoreRelationshipManifestSource(value: unknown): boolean {
  return (
    isCoreReportSource(value) &&
    isRecord(value) &&
    typeof value.entity_index_kind === "string" &&
    typeof value.entity_index_version === "string"
  );
}

function isCoreRelationshipManifestBoundaries(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.source_of_truth === "string" &&
    typeof value.core_derived_report === "boolean" &&
    typeof value.read_only === "boolean" &&
    typeof value.contains_entity_index === "boolean" &&
    typeof value.contains_entity_records === "boolean" &&
    typeof value.contains_relationship_manifest === "boolean" &&
    typeof value.contains_relationship_records === "boolean" &&
    typeof value.contains_relationship_graph === "boolean" &&
    typeof value.contains_dependency_graph === "boolean" &&
    typeof value.contains_yaml_ast === "boolean" &&
    typeof value.contains_source_locations === "boolean" &&
    typeof value.contains_plugin_api === "boolean" &&
    typeof value.contains_studio_api === "boolean" &&
    typeof value.contains_runtime_behavior === "boolean" &&
    typeof value.contains_ground_behavior === "boolean"
  );
}

function isCoreRelationshipManifestCounts(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.total_relationships === "number" &&
    isNumberRecord(value.relationship_types)
  );
}

function isCoreRelationshipType(value: unknown): value is CoreRelationshipType {
  return (
    isRecord(value) &&
    typeof value.relationship_type === "string" &&
    typeof value.display_name === "string" &&
    typeof value.from_domain === "string" &&
    typeof value.to_domain === "string" &&
    isCoreRelationshipDerivation(value.derived_from) &&
    typeof value.relationship_count === "number"
  );
}

function isCoreRelationshipRecord(value: unknown): value is CoreRelationshipRecord {
  return (
    isRecord(value) &&
    typeof value.relationship_id === "string" &&
    typeof value.relationship_type === "string" &&
    isCoreRelationshipEndpoint(value.from) &&
    isCoreRelationshipEndpoint(value.to) &&
    isCoreRelationshipDerivation(value.derived_from)
  );
}

function isCoreRelationshipEndpoint(value: unknown): value is CoreRelationshipEndpoint {
  return (
    isRecord(value) &&
    typeof value.domain === "string" &&
    typeof value.id === "string"
  );
}

function isCoreRelationshipDerivation(value: unknown): value is CoreRelationshipDerivation {
  return isRecord(value) && typeof value.model_field === "string";
}

function isCoreRelationshipDerivationPolicy(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.requires_explicit_loaded_mission_model_fields === "boolean" &&
    typeof value.references_entity_index_entities === "boolean" &&
    typeof value.forbids_naming_heuristics === "boolean" &&
    typeof value.forbids_raw_yaml_scanning === "boolean" &&
    typeof value.forbids_downstream_assumptions === "boolean"
  );
}

function isCoreDashboardSummarySource(value: unknown): boolean {
  return (
    isCoreReportSource(value) &&
    isRecord(value) &&
    typeof value.model_summary_kind === "string" &&
    typeof value.model_summary_version === "string" &&
    typeof value.entity_index_kind === "string" &&
    typeof value.entity_index_version === "string" &&
    typeof value.relationship_manifest_kind === "string" &&
    typeof value.relationship_manifest_version === "string"
  );
}

function isCoreDashboardSummaryBoundaries(value: unknown): boolean {
  return isRecord(value) && isBooleanFields(value, [
    "core_derived_report",
    "read_only",
    "contains_dashboard_summary",
    "contains_coverage_metrics",
    "contains_health_score",
    "contains_scenario_run_index",
    "contains_expectation_accounting",
    "contains_relationship_graph",
    "contains_dependency_graph",
    "contains_yaml_ast",
    "contains_source_locations",
    "contains_plugin_api",
    "contains_studio_api",
    "contains_runtime_behavior",
    "contains_ground_behavior",
  ]) && typeof value.source_of_truth === "string";
}

function isCoreDashboardValidationSummary(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.tool === "string" &&
    typeof value.result === "string" &&
    typeof value.errors === "number" &&
    typeof value.warnings === "number" &&
    typeof value.info === "number"
  );
}

function isCoreDashboardModelDomains(value: unknown): boolean {
  return (
    isRecord(value) &&
    isCoreDashboardDomainPresenceSummary(value.required) &&
    isCoreDashboardDomainPresenceSummary(value.optional) &&
    isNumberRecord(value.counts) &&
    Array.isArray(value.domains) &&
    value.domains.every(isCoreDashboardModelDomain)
  );
}

function isCoreDashboardDomainPresenceSummary(
  value: unknown,
): value is CoreDashboardDomainPresenceSummary {
  return (
    isRecord(value) &&
    typeof value.total === "number" &&
    typeof value.present === "number" &&
    typeof value.missing === "number"
  );
}

function isCoreDashboardModelDomain(
  value: unknown,
): value is CoreDashboardModelDomain {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.display_name === "string" &&
    typeof value.source_file === "string" &&
    typeof value.required === "boolean" &&
    typeof value.present === "boolean" &&
    typeof value.count === "number"
  );
}

function isCoreDashboardEntityInventory(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.total_entities === "number" &&
    isNumberRecord(value.domains)
  );
}

function isCoreDashboardRelationshipInventory(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.total_relationships === "number" &&
    isNumberRecord(value.relationship_types)
  );
}

function isCoreDashboardCoverageState(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.status === "string" &&
    typeof value.reason === "string" &&
    typeof value.requires_core_output === "string"
  );
}

function isCoreScenarioRunIndexSource(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.simulation_reports_dir === "string" &&
    typeof value.input_report_tool === "string"
  );
}

function isCoreScenarioRunIndexBoundaries(value: unknown): boolean {
  return isRecord(value) && isBooleanFields(value, [
    "core_derived_report",
    "read_only",
    "contains_scenario_run_index",
    "contains_coverage_metrics",
    "contains_health_score",
    "contains_expectation_accounting",
    "contains_relationship_graph",
    "contains_dependency_graph",
    "contains_yaml_ast",
    "contains_source_locations",
    "contains_plugin_api",
    "contains_studio_api",
    "contains_runtime_behavior",
    "contains_ground_behavior",
    "derived_from_simulation_json",
    "derived_from_logs",
  ]) && typeof value.source_of_truth === "string";
}

function isCoreScenarioRunIndexSummary(
  value: unknown,
): value is CoreScenarioRunIndexSummary {
  return (
    isRecord(value) &&
    typeof value.total === "number" &&
    typeof value.passed === "number" &&
    typeof value.failed === "number"
  );
}

function isCoreScenarioRunRecord(value: unknown): value is CoreScenarioRunRecord {
  return (
    isRecord(value) &&
    typeof value.report_file === "string" &&
    typeof value.report_path === "string" &&
    typeof value.mission === "string" &&
    typeof value.scenario === "string" &&
    isCoreSimulationResultStatus(value.result) &&
    isNumberRecord(value.summary)
  );
}

function isCoreCoverageSummarySource(value: unknown): boolean {
  return (
    isCoreReportSource(value) &&
    isRecord(value) &&
    typeof value.entity_index === "string" &&
    typeof value.entity_index_kind === "string" &&
    typeof value.entity_index_version === "string" &&
    typeof value.relationship_manifest === "string" &&
    typeof value.relationship_manifest_kind === "string" &&
    typeof value.relationship_manifest_version === "string" &&
    typeof value.scenario_run_index === "string" &&
    typeof value.scenario_run_index_kind === "string" &&
    typeof value.scenario_run_index_version === "string"
  );
}

function isCoreCoverageSummaryBoundaries(value: unknown): boolean {
  return isRecord(value) && isBooleanFields(value, [
    "core_derived_report",
    "read_only",
    "contains_coverage_metrics",
    "contains_health_score",
    "contains_model_completeness_score",
    "contains_relationship_graph",
    "contains_dependency_graph",
    "contains_yaml_ast",
    "contains_source_locations",
    "contains_plugin_api",
    "contains_studio_api",
    "contains_runtime_behavior",
    "contains_ground_behavior",
    "coverage_derived_from_entity_index",
    "coverage_derived_from_relationship_manifest",
    "coverage_derived_from_scenario_run_index",
    "coverage_derived_from_simulation_json",
    "coverage_derived_from_logs",
  ]) && typeof value.source_of_truth === "string";
}

function isCoreCoverageRecordMap(value: unknown): boolean {
  return isRecord(value) && Object.values(value).every(isCoreCoverageRecord);
}

function isCoreCoverageRecord(value: unknown): value is CoreCoverageRecord {
  return (
    isRecord(value) &&
    typeof value.total === "number" &&
    typeof value.covered === "number" &&
    typeof value.uncovered === "number" &&
    isNullableNumber(value.coverage_ratio) &&
    isStringArray(value.covered_ids) &&
    isStringArray(value.uncovered_ids)
  );
}

function isCoreExpectationCoverage(value: unknown): value is CoreExpectationCoverage {
  return (
    isRecord(value) &&
    typeof value.total === "number" &&
    typeof value.passed === "number" &&
    typeof value.failed === "number" &&
    isNullableNumber(value.pass_ratio) &&
    isCoreExpectationCoverageByTypeMap(value.by_type)
  );
}

function isCoreExpectationCoverageByTypeMap(value: unknown): boolean {
  return isRecord(value) && Object.values(value).every(isCoreExpectationCoverageByType);
}

function isCoreExpectationCoverageByType(
  value: unknown,
): value is CoreExpectationCoverageByType {
  return (
    isRecord(value) &&
    typeof value.total === "number" &&
    typeof value.passed === "number" &&
    typeof value.failed === "number" &&
    isNullableNumber(value.pass_ratio)
  );
}

function isCoreRelationshipCoverage(value: unknown): value is CoreRelationshipCoverage {
  return (
    isRecord(value) &&
    isStringArray(value.supported_relationship_types) &&
    typeof value.total_supported_relationships === "number" &&
    typeof value.covered_supported_relationships === "number" &&
    typeof value.uncovered_supported_relationships === "number" &&
    isNullableNumber(value.coverage_ratio) &&
    isStringArray(value.covered_relationship_ids) &&
    isStringArray(value.uncovered_relationship_ids) &&
    isCoreCoverageRecordMap(value.by_type)
  );
}

function isCoreUnsupportedCoverageScope(value: unknown): value is CoreUnsupportedCoverageScope {
  return (
    isRecord(value) &&
    isStringArray(value.entity_domains) &&
    isStringArray(value.relationship_types) &&
    typeof value.reason === "string"
  );
}

function isNullableNumber(value: unknown): value is number | null {
  return typeof value === "number" || value === null;
}

function isBooleanFields(value: Record<string, unknown>, fields: string[]): boolean {
  return fields.every((field) => typeof value[field] === "boolean");
}
