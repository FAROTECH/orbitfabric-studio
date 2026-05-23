import type {
  CoreEntityIndex,
  CoreEntityIndexDomain,
  CoreEntityIndexEntity,
  CoreLintFinding,
  CoreLintReport,
  CoreModelSummary,
  CoreModelSummaryDomain,
  CoreRelationshipDerivation,
  CoreRelationshipEndpoint,
  CoreRelationshipManifest,
  CoreRelationshipRecord,
  CoreRelationshipType,
  CoreSimulationCommandRecord,
  CoreSimulationDataFlowEvidenceRecord,
  CoreSimulationEventRecord,
  CoreSimulationFinalState,
  CoreSimulationJsonValue,
  CoreSimulationModeTransitionRecord,
  CoreSimulationReport,
  CoreSimulationResultStatus,
  CoreSimulationSummary,
  CoreSimulationTimelineEntry,
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
    typeof value.failed_expectations === "number"
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
