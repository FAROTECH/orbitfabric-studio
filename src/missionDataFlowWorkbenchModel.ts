import type {
  CoreCoverageSummary,
  CoreDashboardSummary,
  CoreDashboardValidationSummary,
  CoreEntityIndex,
  CoreLintFinding,
  CoreLintReport,
  CoreModelSummary,
  CoreRelationshipManifest,
  CoreRelationshipRecord,
  CoreRelationshipType,
  CoreSimulationDataFlowEvidenceRecord,
  CoreSimulationReport,
  GeneratedArtifactEntry,
  GeneratedArtifactInventory,
} from "./types/workspace";

export type MissionDataFlowWorkbenchSourceState =
  | "reported"
  | "not-reported"
  | "unavailable";

export type MissionDataFlowWorkbenchLaneId =
  | "mission-domains"
  | "relationship-manifest"
  | "scenario-data-flow-evidence"
  | "validation"
  | "coverage"
  | "generated-artifacts";

export type MissionDataFlowWorkbenchRecordKind =
  | "mission-domain"
  | "relationship-type"
  | "relationship-record"
  | "scenario-data-flow-evidence"
  | "validation-summary"
  | "validation-finding"
  | "coverage-scope"
  | "coverage-expectation"
  | "coverage-unsupported-scope"
  | "generated-artifact";

export type MissionDataFlowWorkbenchProvenance =
  | "workspace-inspection"
  | "core-model-summary"
  | "core-entity-index"
  | "core-relationship-manifest"
  | "core-dashboard-summary"
  | "core-lint-report"
  | "core-coverage-summary"
  | "core-simulation-report"
  | "generated-artifact-inventory"
  | "explicit-unavailable-state";

export type MissionDataFlowWorkbenchEvidenceKind =
  | "relationship-evidence"
  | "scenario-evidence"
  | "validation-evidence"
  | "coverage-evidence"
  | "artifact-evidence";

export type MissionDataFlowTraceabilityGroupId =
  | "core-relationships"
  | "scenario-data-flow"
  | "generated-outputs"
  | "validation-evidence"
  | "coverage-evidence";

export type MissionDataFlowTraceabilityLinkKind =
  | "core-relationship"
  | "scenario-data-flow"
  | "generated-artifact"
  | "validation-evidence"
  | "coverage-evidence";

export interface MissionDataFlowTraceabilityEndpoint {
  label: string;
  domain: string | null;
  id: string | null;
  recordId: string | null;
}

export interface MissionDataFlowTraceabilityLink {
  id: string;
  label: string;
  kind: MissionDataFlowTraceabilityLinkKind;
  evidenceKind: MissionDataFlowWorkbenchEvidenceKind;
  provenance: MissionDataFlowWorkbenchProvenance;
  state: MissionDataFlowWorkbenchSourceState;
  from: MissionDataFlowTraceabilityEndpoint;
  to: MissionDataFlowTraceabilityEndpoint;
  detail: string;
  raw: unknown;
}

export interface MissionDataFlowTraceabilityGroup {
  id: MissionDataFlowTraceabilityGroupId;
  title: string;
  evidenceKind: MissionDataFlowWorkbenchEvidenceKind;
  provenance: MissionDataFlowWorkbenchProvenance;
  state: MissionDataFlowWorkbenchSourceState;
  links: MissionDataFlowTraceabilityLink[];
  emptyDetail: string;
}

export interface MissionDataFlowTraceabilitySummary {
  groups: MissionDataFlowTraceabilityGroup[];
  counts: {
    groups: number;
    links: number;
    reportedLinks: number;
    unavailableLinks: number;
  };
}

export interface MissionDataFlowWorkbenchInput {
  modelSummary: CoreModelSummary | null;
  entityIndex: CoreEntityIndex | null;
  relationshipManifest: CoreRelationshipManifest | null;
  dashboardSummary: CoreDashboardSummary | null;
  lintReport?: CoreLintReport | null;
  simulationReport: CoreSimulationReport | null;
  coverageSummary: CoreCoverageSummary | null;
  generatedArtifactInventory: GeneratedArtifactInventory | null;
}

export interface MissionDataFlowWorkbenchSourceSummary {
  id: MissionDataFlowWorkbenchProvenance;
  label: string;
  state: MissionDataFlowWorkbenchSourceState;
  detail: string;
}

export interface MissionDataFlowWorkbenchRecord {
  id: string;
  label: string;
  kind: MissionDataFlowWorkbenchRecordKind;
  evidenceKind: MissionDataFlowWorkbenchEvidenceKind;
  provenance: MissionDataFlowWorkbenchProvenance;
  state: MissionDataFlowWorkbenchSourceState;
  detail: string;
  raw: unknown;
}

export interface MissionDataFlowWorkbenchLane {
  id: MissionDataFlowWorkbenchLaneId;
  title: string;
  evidenceKind: MissionDataFlowWorkbenchEvidenceKind;
  state: MissionDataFlowWorkbenchSourceState;
  provenance: MissionDataFlowWorkbenchProvenance;
  records: MissionDataFlowWorkbenchRecord[];
  emptyDetail: string;
}

export interface MissionDataFlowWorkbenchBoundary {
  readOnly: true;
  inference: "none";
  graphSemantics: "not-provided-by-studio";
  authoring: "not-supported";
  sourceOfTruth: "OrbitFabric Core reports and generated artifacts";
}

export interface MissionDataFlowWorkbenchSnapshot {
  boundary: MissionDataFlowWorkbenchBoundary;
  sources: MissionDataFlowWorkbenchSourceSummary[];
  lanes: MissionDataFlowWorkbenchLane[];
  traceability: MissionDataFlowTraceabilitySummary;
  counts: {
    missionDomains: number;
    relationshipTypes: number;
    relationshipRecords: number;
    scenarioDataFlowEvidenceRecords: number;
    validationEvidenceRecords: number;
    coverageScopes: number;
    generatedArtifacts: number;
    traceabilityLinks: number;
  };
}

export function createMissionDataFlowWorkbenchSnapshot(
  input: MissionDataFlowWorkbenchInput,
): MissionDataFlowWorkbenchSnapshot {
  const missionDomainRecords = createMissionDomainRecords(input);
  const relationshipRecords = createRelationshipRecords(input.relationshipManifest);
  const scenarioEvidenceRecords = createScenarioEvidenceRecords(input.simulationReport);
  const validationRecords = createValidationRecords(
    input.lintReport ?? null,
    input.dashboardSummary,
  );
  const coverageRecords = createCoverageRecords(input.coverageSummary);
  const generatedArtifactRecords = createGeneratedArtifactRecords(
    input.generatedArtifactInventory,
  );
  const traceability = createTraceabilitySummary({
    relationshipManifest: input.relationshipManifest,
    simulationReport: input.simulationReport,
    lintReport: input.lintReport ?? null,
    dashboardSummary: input.dashboardSummary,
    coverageSummary: input.coverageSummary,
    generatedArtifactInventory: input.generatedArtifactInventory,
  });

  return {
    boundary: {
      readOnly: true,
      inference: "none",
      graphSemantics: "not-provided-by-studio",
      authoring: "not-supported",
      sourceOfTruth: "OrbitFabric Core reports and generated artifacts",
    },
    sources: createSourceSummaries(input),
    lanes: [
      createLane({
        id: "mission-domains",
        title: "Mission domains",
        evidenceKind: "relationship-evidence",
        provenance: input.entityIndex ? "core-entity-index" : "core-model-summary",
        records: missionDomainRecords,
        emptyDetail: "No Core model summary or entity index has been reported yet.",
      }),
      createLane({
        id: "relationship-manifest",
        title: "Relationship manifest",
        evidenceKind: "relationship-evidence",
        provenance: "core-relationship-manifest",
        records: relationshipRecords,
        emptyDetail: "No Core relationship manifest has been reported yet.",
      }),
      createLane({
        id: "scenario-data-flow-evidence",
        title: "Scenario data-flow evidence",
        evidenceKind: "scenario-evidence",
        provenance: "core-simulation-report",
        records: scenarioEvidenceRecords,
        emptyDetail: "No Core simulation data-flow evidence has been reported yet.",
      }),
      createLane({
        id: "validation",
        title: "Validation evidence",
        evidenceKind: "validation-evidence",
        provenance: input.lintReport ? "core-lint-report" : "core-dashboard-summary",
        records: validationRecords,
        emptyDetail: "No Core lint report or dashboard validation summary has been reported yet.",
      }),
      createLane({
        id: "coverage",
        title: "Coverage",
        evidenceKind: "coverage-evidence",
        provenance: "core-coverage-summary",
        records: coverageRecords,
        emptyDetail: "No Core coverage summary has been reported yet.",
      }),
      createLane({
        id: "generated-artifacts",
        title: "Generated artifacts",
        evidenceKind: "artifact-evidence",
        provenance: "generated-artifact-inventory",
        records: generatedArtifactRecords,
        emptyDetail: "No generated artifact inventory has been loaded yet.",
      }),
    ],
    traceability,
    counts: {
      missionDomains: missionDomainRecords.length,
      relationshipTypes: input.relationshipManifest?.relationship_types.length ?? 0,
      relationshipRecords: input.relationshipManifest?.relationships.length ?? 0,
      scenarioDataFlowEvidenceRecords: scenarioEvidenceRecords.length,
      validationEvidenceRecords: validationRecords.length,
      coverageScopes: coverageRecords.length,
      generatedArtifacts: generatedArtifactRecords.length,
      traceabilityLinks: traceability.counts.links,
    },
  };
}

function createSourceSummaries(
  input: MissionDataFlowWorkbenchInput,
): MissionDataFlowWorkbenchSourceSummary[] {
  return [
    sourceSummary(
      "core-model-summary",
      "Core model summary",
      Boolean(input.modelSummary),
      input.modelSummary?.kind ?? "not reported",
    ),
    sourceSummary(
      "core-entity-index",
      "Core entity index",
      Boolean(input.entityIndex),
      input.entityIndex?.kind ?? "not reported",
    ),
    sourceSummary(
      "core-relationship-manifest",
      "Core relationship manifest",
      Boolean(input.relationshipManifest),
      input.relationshipManifest?.kind ?? "not reported",
    ),
    sourceSummary(
      "core-dashboard-summary",
      "Core dashboard summary",
      Boolean(input.dashboardSummary),
      input.dashboardSummary?.kind ?? "not reported",
    ),
    sourceSummary(
      "core-lint-report",
      "Core lint report",
      Boolean(input.lintReport),
      input.lintReport
        ? `${input.lintReport.result}, ${input.lintReport.summary.errors} errors, ${input.lintReport.summary.warnings} warnings, ${input.lintReport.summary.info} info`
        : "not reported",
    ),
    sourceSummary(
      "core-simulation-report",
      "Core simulation report",
      Boolean(input.simulationReport),
      input.simulationReport?.tool ?? "not reported",
    ),
    sourceSummary(
      "core-coverage-summary",
      "Core coverage summary",
      Boolean(input.coverageSummary),
      input.coverageSummary?.kind ?? "not reported",
    ),
    sourceSummary(
      "generated-artifact-inventory",
      "Generated artifact inventory",
      Boolean(input.generatedArtifactInventory),
      input.generatedArtifactInventory
        ? `${input.generatedArtifactInventory.counts.total_artifacts} artifacts`
        : "not loaded",
    ),
  ];
}

function sourceSummary(
  id: MissionDataFlowWorkbenchProvenance,
  label: string,
  isReported: boolean,
  detail: string,
): MissionDataFlowWorkbenchSourceSummary {
  return {
    id,
    label,
    state: isReported ? "reported" : "not-reported",
    detail,
  };
}

function createMissionDomainRecords(
  input: MissionDataFlowWorkbenchInput,
): MissionDataFlowWorkbenchRecord[] {
  if (input.entityIndex) {
    return input.entityIndex.domains.map((domain) => ({
      id: `domain:${domain.id}`,
      label: domain.display_name,
      kind: "mission-domain",
      evidenceKind: "relationship-evidence",
      provenance: "core-entity-index",
      state: domain.indexed ? "reported" : "not-reported",
      detail: `${domain.entity_count} entities, source ${domain.source_file}`,
      raw: domain,
    }));
  }

  if (input.modelSummary) {
    return input.modelSummary.domains.map((domain) => ({
      id: `domain:${domain.id}`,
      label: domain.display_name,
      kind: "mission-domain",
      evidenceKind: "relationship-evidence",
      provenance: "core-model-summary",
      state: domain.present ? "reported" : "not-reported",
      detail: `${domain.count} records, source ${domain.source_file}`,
      raw: domain,
    }));
  }

  return [];
}

function createRelationshipRecords(
  manifest: CoreRelationshipManifest | null,
): MissionDataFlowWorkbenchRecord[] {
  if (!manifest) {
    return [];
  }

  return [
    ...manifest.relationship_types.map(toRelationshipTypeRecord),
    ...manifest.relationships.map(toRelationshipRecord),
  ];
}

function toRelationshipTypeRecord(
  relationshipType: CoreRelationshipType,
): MissionDataFlowWorkbenchRecord {
  return {
    id: `relationship-type:${relationshipType.relationship_type}`,
    label: relationshipType.display_name,
    kind: "relationship-type",
    evidenceKind: "relationship-evidence",
    provenance: "core-relationship-manifest",
    state: "reported",
    detail: `${relationshipType.from_domain} -> ${relationshipType.to_domain}, ${relationshipType.relationship_count} records`,
    raw: relationshipType,
  };
}

function toRelationshipRecord(
  relationship: CoreRelationshipRecord,
): MissionDataFlowWorkbenchRecord {
  return {
    id: `relationship:${relationship.relationship_id}`,
    label: relationship.relationship_id,
    kind: "relationship-record",
    evidenceKind: "relationship-evidence",
    provenance: "core-relationship-manifest",
    state: "reported",
    detail: `${relationship.from.domain}:${relationship.from.id} -> ${relationship.to.domain}:${relationship.to.id}`,
    raw: relationship,
  };
}

function createScenarioEvidenceRecords(
  simulationReport: CoreSimulationReport | null,
): MissionDataFlowWorkbenchRecord[] {
  return simulationReport?.data_flow_evidence.map(toScenarioEvidenceRecord) ?? [];
}

function toScenarioEvidenceRecord(
  record: CoreSimulationDataFlowEvidenceRecord,
  index: number,
): MissionDataFlowWorkbenchRecord {
  const label = record.data_product_id ?? `data-flow-evidence-${index + 1}`;

  return {
    id: `scenario-data-flow:${index}`,
    label,
    kind: "scenario-data-flow-evidence",
    evidenceKind: "scenario-evidence",
    provenance: "core-simulation-report",
    state: "reported",
    detail: `t=${record.t}, producer=${record.producer ?? "not reported"}`,
    raw: record,
  };
}

function createValidationRecords(
  lintReport: CoreLintReport | null,
  dashboardSummary: CoreDashboardSummary | null,
): MissionDataFlowWorkbenchRecord[] {
  if (lintReport) {
    return [
      toLintSummaryRecord(lintReport),
      ...lintReport.findings.map(toLintFindingRecord),
    ];
  }

  if (dashboardSummary) {
    return [toDashboardValidationRecord(dashboardSummary.validation)];
  }

  return [];
}

function toLintSummaryRecord(
  lintReport: CoreLintReport,
): MissionDataFlowWorkbenchRecord {
  return {
    id: "validation:lint-summary",
    label: `Lint ${lintReport.result}`,
    kind: "validation-summary",
    evidenceKind: "validation-evidence",
    provenance: "core-lint-report",
    state: "reported",
    detail: `${lintReport.summary.errors} errors, ${lintReport.summary.warnings} warnings, ${lintReport.summary.info} info`,
    raw: {
      tool: lintReport.tool,
      version: lintReport.version,
      mission: lintReport.mission,
      model_version: lintReport.model_version,
      result: lintReport.result,
      summary: lintReport.summary,
      loaded: lintReport.loaded,
    },
  };
}

function toLintFindingRecord(
  finding: CoreLintFinding,
  index: number,
): MissionDataFlowWorkbenchRecord {
  return {
    id: `validation:finding:${finding.code}:${finding.object_id ?? "unscoped"}:${index}`,
    label: `${finding.severity}: ${finding.code}`,
    kind: "validation-finding",
    evidenceKind: "validation-evidence",
    provenance: "core-lint-report",
    state: "reported",
    detail: `${finding.domain ?? "domain not reported"}/${finding.object_id ?? "object not reported"}: ${finding.message}`,
    raw: finding,
  };
}

function toDashboardValidationRecord(
  validation: CoreDashboardValidationSummary,
): MissionDataFlowWorkbenchRecord {
  return {
    id: "validation:dashboard-summary",
    label: `Dashboard validation ${validation.result}`,
    kind: "validation-summary",
    evidenceKind: "validation-evidence",
    provenance: "core-dashboard-summary",
    state: "reported",
    detail: `${validation.errors} errors, ${validation.warnings} warnings, ${validation.info} info`,
    raw: validation,
  };
}

function createCoverageRecords(
  coverageSummary: CoreCoverageSummary | null,
): MissionDataFlowWorkbenchRecord[] {
  if (!coverageSummary) {
    return [];
  }

  const scenarioCoverageRecord: MissionDataFlowWorkbenchRecord = {
    id: "coverage:scenario-runs",
    label: "Scenario runs",
    kind: "coverage-scope",
    evidenceKind: "coverage-evidence",
    provenance: "core-coverage-summary",
    state: "reported",
    detail: `${coverageSummary.scenario_runs.passed}/${coverageSummary.scenario_runs.total} passed, ${coverageSummary.scenario_runs.failed} failed`,
    raw: coverageSummary.scenario_runs,
  };

  const entityCoverage = Object.entries(coverageSummary.entity_coverage).map(
    ([domain, coverage]) => ({
      id: `coverage:entity:${domain}`,
      label: domain,
      kind: "coverage-scope" as const,
      evidenceKind: "coverage-evidence" as const,
      provenance: "core-coverage-summary" as const,
      state: "reported" as const,
      detail: `${coverage.covered}/${coverage.total} covered`,
      raw: coverage,
    }),
  );

  const expectationCoverage: MissionDataFlowWorkbenchRecord[] = [
    {
      id: "coverage:expectations:summary",
      label: "Expectations",
      kind: "coverage-expectation",
      evidenceKind: "coverage-evidence",
      provenance: "core-coverage-summary",
      state: "reported",
      detail: `${coverageSummary.expectation_coverage.passed}/${coverageSummary.expectation_coverage.total} passed, ${coverageSummary.expectation_coverage.failed} failed`,
      raw: coverageSummary.expectation_coverage,
    },
    ...Object.entries(coverageSummary.expectation_coverage.by_type).map(
      ([expectationType, coverage]) => ({
        id: `coverage:expectation:${expectationType}`,
        label: expectationType,
        kind: "coverage-expectation" as const,
        evidenceKind: "coverage-evidence" as const,
        provenance: "core-coverage-summary" as const,
        state: "reported" as const,
        detail: `${coverage.passed}/${coverage.total} passed, ${coverage.failed} failed`,
        raw: coverage,
      }),
    ),
  ];

  const relationshipCoverage = Object.entries(
    coverageSummary.relationship_coverage.by_type,
  ).map(([relationshipType, coverage]) => ({
    id: `coverage:relationship:${relationshipType}`,
    label: relationshipType,
    kind: "coverage-scope" as const,
    evidenceKind: "coverage-evidence" as const,
    provenance: "core-coverage-summary" as const,
    state: "reported" as const,
    detail: `${coverage.covered}/${coverage.total} covered`,
    raw: coverage,
  }));

  const unsupportedCoverageRecords: MissionDataFlowWorkbenchRecord[] = [
    ...coverageSummary.unsupported.entity_domains.map((domain) => ({
      id: `coverage:unsupported:entity:${domain}`,
      label: domain,
      kind: "coverage-unsupported-scope" as const,
      evidenceKind: "coverage-evidence" as const,
      provenance: "core-coverage-summary" as const,
      state: "reported" as const,
      detail: coverageSummary.unsupported.reason,
      raw: {
        scope: "entity_domain",
        value: domain,
        reason: coverageSummary.unsupported.reason,
      },
    })),
    ...coverageSummary.unsupported.relationship_types.map((relationshipType) => ({
      id: `coverage:unsupported:relationship:${relationshipType}`,
      label: relationshipType,
      kind: "coverage-unsupported-scope" as const,
      evidenceKind: "coverage-evidence" as const,
      provenance: "core-coverage-summary" as const,
      state: "reported" as const,
      detail: coverageSummary.unsupported.reason,
      raw: {
        scope: "relationship_type",
        value: relationshipType,
        reason: coverageSummary.unsupported.reason,
      },
    })),
  ];

  return [
    scenarioCoverageRecord,
    ...entityCoverage,
    ...expectationCoverage,
    ...relationshipCoverage,
    ...unsupportedCoverageRecords,
  ];
}

function createGeneratedArtifactRecords(
  inventory: GeneratedArtifactInventory | null,
): MissionDataFlowWorkbenchRecord[] {
  return inventory?.artifacts.map(toGeneratedArtifactRecord) ?? [];
}

function toGeneratedArtifactRecord(
  artifact: GeneratedArtifactEntry,
): MissionDataFlowWorkbenchRecord {
  return {
    id: `generated-artifact:${artifact.relative_path}`,
    label: artifact.name,
    kind: "generated-artifact",
    evidenceKind: "artifact-evidence",
    provenance: "generated-artifact-inventory",
    state: artifact.known_status === "known" ? "reported" : "unavailable",
    detail: `${artifact.artifact_class}, ${artifact.preview_status}`,
    raw: artifact,
  };
}

function createTraceabilitySummary(input: {
  relationshipManifest: CoreRelationshipManifest | null;
  simulationReport: CoreSimulationReport | null;
  lintReport: CoreLintReport | null;
  dashboardSummary: CoreDashboardSummary | null;
  coverageSummary: CoreCoverageSummary | null;
  generatedArtifactInventory: GeneratedArtifactInventory | null;
}): MissionDataFlowTraceabilitySummary {
  const groups: MissionDataFlowTraceabilityGroup[] = [
    createTraceabilityGroup({
      id: "core-relationships",
      title: "Core-reported relationships",
      evidenceKind: "relationship-evidence",
      provenance: "core-relationship-manifest",
      links: createRelationshipTraceabilityLinks(input.relationshipManifest),
      emptyDetail: "No Core relationship manifest has been reported yet.",
    }),
    createTraceabilityGroup({
      id: "scenario-data-flow",
      title: "Scenario data-flow evidence",
      evidenceKind: "scenario-evidence",
      provenance: "core-simulation-report",
      links: createScenarioTraceabilityLinks(input.simulationReport),
      emptyDetail: "No Core simulation data-flow evidence has been reported yet.",
    }),
    createTraceabilityGroup({
      id: "generated-outputs",
      title: "Generated output evidence",
      evidenceKind: "artifact-evidence",
      provenance: "generated-artifact-inventory",
      links: createGeneratedArtifactTraceabilityLinks(input.generatedArtifactInventory),
      emptyDetail: "No generated artifact inventory has been loaded yet.",
    }),
    createTraceabilityGroup({
      id: "validation-evidence",
      title: "Validation evidence",
      evidenceKind: "validation-evidence",
      provenance: input.lintReport ? "core-lint-report" : "core-dashboard-summary",
      links: createValidationTraceabilityLinks(input.lintReport, input.dashboardSummary),
      emptyDetail: "No Core lint report or dashboard validation summary has been reported yet.",
    }),
    createTraceabilityGroup({
      id: "coverage-evidence",
      title: "Coverage evidence",
      evidenceKind: "coverage-evidence",
      provenance: "core-coverage-summary",
      links: createCoverageTraceabilityLinks(input.coverageSummary),
      emptyDetail: "No Core coverage summary has been reported yet.",
    }),
  ];
  const links = groups.flatMap((group) => group.links);

  return {
    groups,
    counts: {
      groups: groups.length,
      links: links.length,
      reportedLinks: links.filter((link) => link.state === "reported").length,
      unavailableLinks: links.filter((link) => link.state === "unavailable").length,
    },
  };
}

function createTraceabilityGroup({
  id,
  title,
  evidenceKind,
  provenance,
  links,
  emptyDetail,
}: {
  id: MissionDataFlowTraceabilityGroupId;
  title: string;
  evidenceKind: MissionDataFlowWorkbenchEvidenceKind;
  provenance: MissionDataFlowWorkbenchProvenance;
  links: MissionDataFlowTraceabilityLink[];
  emptyDetail: string;
}): MissionDataFlowTraceabilityGroup {
  return {
    id,
    title,
    evidenceKind,
    provenance,
    links,
    state: links.length > 0 ? "reported" : "not-reported",
    emptyDetail,
  };
}

function createRelationshipTraceabilityLinks(
  manifest: CoreRelationshipManifest | null,
): MissionDataFlowTraceabilityLink[] {
  return manifest?.relationships.map((relationship) => ({
    id: `traceability:relationship:${relationship.relationship_id}`,
    label: relationship.relationship_id,
    kind: "core-relationship",
    evidenceKind: "relationship-evidence",
    provenance: "core-relationship-manifest",
    state: "reported",
    from: endpointFromRelationshipEndpoint(
      relationship.from,
      `relationship:${relationship.relationship_id}:from`,
    ),
    to: endpointFromRelationshipEndpoint(
      relationship.to,
      `relationship:${relationship.relationship_id}:to`,
    ),
    detail: `${relationship.relationship_type}: ${relationship.from.domain}:${relationship.from.id} -> ${relationship.to.domain}:${relationship.to.id}`,
    raw: relationship,
  })) ?? [];
}

function createScenarioTraceabilityLinks(
  simulationReport: CoreSimulationReport | null,
): MissionDataFlowTraceabilityLink[] {
  return simulationReport?.data_flow_evidence.map((record, index) => {
    const dataProductId = record.data_product_id ?? `data-flow-evidence-${index + 1}`;
    const producer = record.producer ?? "producer not reported";

    return {
      id: `traceability:scenario-data-flow:${index}`,
      label: dataProductId,
      kind: "scenario-data-flow",
      evidenceKind: "scenario-evidence",
      provenance: "core-simulation-report",
      state: "reported",
      from: {
        label: producer,
        domain: record.producer_type ?? null,
        id: record.producer ?? null,
        recordId: `scenario-data-flow:${index}:producer`,
      },
      to: {
        label: dataProductId,
        domain: "data_product",
        id: record.data_product_id ?? null,
        recordId: `scenario-data-flow:${index}:data-product`,
      },
      detail: `t=${record.t}, producer=${producer}, data product=${dataProductId}`,
      raw: record,
    };
  }) ?? [];
}

function createGeneratedArtifactTraceabilityLinks(
  inventory: GeneratedArtifactInventory | null,
): MissionDataFlowTraceabilityLink[] {
  return inventory?.artifacts.map((artifact) => ({
    id: `traceability:generated-artifact:${artifact.relative_path}`,
    label: artifact.name,
    kind: "generated-artifact",
    evidenceKind: "artifact-evidence",
    provenance: "generated-artifact-inventory",
    state: artifact.known_status === "known" ? "reported" : "unavailable",
    from: {
      label: artifact.artifact_class,
      domain: "generated_artifact_class",
      id: artifact.artifact_class,
      recordId: `generated-artifact-class:${artifact.artifact_class}`,
    },
    to: {
      label: artifact.relative_path,
      domain: "generated_artifact",
      id: artifact.relative_path,
      recordId: `generated-artifact:${artifact.relative_path}`,
    },
    detail: `${artifact.artifact_class}, ${artifact.preview_status}, ${artifact.classification_reason}`,
    raw: artifact,
  })) ?? [];
}

function createValidationTraceabilityLinks(
  lintReport: CoreLintReport | null,
  dashboardSummary: CoreDashboardSummary | null,
): MissionDataFlowTraceabilityLink[] {
  if (lintReport) {
    return [
      {
        id: "traceability:validation:lint-summary",
        label: `Lint ${lintReport.result}`,
        kind: "validation-evidence",
        evidenceKind: "validation-evidence",
        provenance: "core-lint-report",
        state: "reported",
        from: reportEndpoint("core-lint-report", "Core lint report"),
        to: {
          label: lintReport.result,
          domain: "validation_result",
          id: lintReport.result,
          recordId: "validation:lint-summary",
        },
        detail: `${lintReport.summary.errors} errors, ${lintReport.summary.warnings} warnings, ${lintReport.summary.info} info`,
        raw: lintReport.summary,
      },
      ...lintReport.findings.map((finding, index) => ({
        id: `traceability:validation:finding:${finding.code}:${finding.object_id ?? "unscoped"}:${index}`,
        label: `${finding.severity}: ${finding.code}`,
        kind: "validation-evidence" as const,
        evidenceKind: "validation-evidence" as const,
        provenance: "core-lint-report" as const,
        state: "reported" as const,
        from: reportEndpoint("core-lint-report", "Core lint report"),
        to: {
          label: finding.object_id ?? finding.code,
          domain: finding.domain,
          id: finding.object_id,
          recordId: `validation:finding:${finding.code}:${finding.object_id ?? "unscoped"}:${index}`,
        },
        detail: `${finding.domain ?? "domain not reported"}/${finding.object_id ?? "object not reported"}: ${finding.message}`,
        raw: finding,
      })),
    ];
  }

  if (dashboardSummary) {
    const validation = dashboardSummary.validation;

    return [
      {
        id: "traceability:validation:dashboard-summary",
        label: `Dashboard validation ${validation.result}`,
        kind: "validation-evidence",
        evidenceKind: "validation-evidence",
        provenance: "core-dashboard-summary",
        state: "reported",
        from: reportEndpoint("core-dashboard-summary", "Core dashboard summary"),
        to: {
          label: validation.result,
          domain: "validation_result",
          id: validation.result,
          recordId: "validation:dashboard-summary",
        },
        detail: `${validation.errors} errors, ${validation.warnings} warnings, ${validation.info} info`,
        raw: validation,
      },
    ];
  }

  return [];
}

function createCoverageTraceabilityLinks(
  coverageSummary: CoreCoverageSummary | null,
): MissionDataFlowTraceabilityLink[] {
  if (!coverageSummary) {
    return [];
  }

  return [
    {
      id: "traceability:coverage:scenario-runs",
      label: "Scenario runs",
      kind: "coverage-evidence",
      evidenceKind: "coverage-evidence",
      provenance: "core-coverage-summary",
      state: "reported",
      from: reportEndpoint("core-coverage-summary", "Core coverage summary"),
      to: {
        label: "scenario-runs",
        domain: "coverage_scope",
        id: "scenario-runs",
        recordId: "coverage:scenario-runs",
      },
      detail: `${coverageSummary.scenario_runs.passed}/${coverageSummary.scenario_runs.total} passed, ${coverageSummary.scenario_runs.failed} failed`,
      raw: coverageSummary.scenario_runs,
    },
    ...Object.entries(coverageSummary.entity_coverage).map(([domain, coverage]) => ({
      id: `traceability:coverage:entity:${domain}`,
      label: domain,
      kind: "coverage-evidence" as const,
      evidenceKind: "coverage-evidence" as const,
      provenance: "core-coverage-summary" as const,
      state: "reported" as const,
      from: reportEndpoint("core-coverage-summary", "Core coverage summary"),
      to: {
        label: domain,
        domain: "entity_domain",
        id: domain,
        recordId: `coverage:entity:${domain}`,
      },
      detail: `${coverage.covered}/${coverage.total} covered`,
      raw: coverage,
    })),
    ...Object.entries(coverageSummary.relationship_coverage.by_type).map(
      ([relationshipType, coverage]) => ({
        id: `traceability:coverage:relationship:${relationshipType}`,
        label: relationshipType,
        kind: "coverage-evidence" as const,
        evidenceKind: "coverage-evidence" as const,
        provenance: "core-coverage-summary" as const,
        state: "reported" as const,
        from: reportEndpoint("core-coverage-summary", "Core coverage summary"),
        to: {
          label: relationshipType,
          domain: "relationship_type",
          id: relationshipType,
          recordId: `coverage:relationship:${relationshipType}`,
        },
        detail: `${coverage.covered}/${coverage.total} covered`,
        raw: coverage,
      }),
    ),
  ];
}

function endpointFromRelationshipEndpoint(
  endpoint: CoreRelationshipRecord["from"],
  recordId: string,
): MissionDataFlowTraceabilityEndpoint {
  return {
    label: `${endpoint.domain}:${endpoint.id}`,
    domain: endpoint.domain,
    id: endpoint.id,
    recordId,
  };
}

function reportEndpoint(
  id: MissionDataFlowWorkbenchProvenance,
  label: string,
): MissionDataFlowTraceabilityEndpoint {
  return {
    label,
    domain: "core_report",
    id,
    recordId: id,
  };
}

function createLane({
  id,
  title,
  evidenceKind,
  provenance,
  records,
  emptyDetail,
}: {
  id: MissionDataFlowWorkbenchLaneId;
  title: string;
  evidenceKind: MissionDataFlowWorkbenchEvidenceKind;
  provenance: MissionDataFlowWorkbenchProvenance;
  records: MissionDataFlowWorkbenchRecord[];
  emptyDetail: string;
}): MissionDataFlowWorkbenchLane {
  return {
    id,
    title,
    evidenceKind,
    provenance,
    records,
    state: records.length > 0 ? "reported" : "not-reported",
    emptyDetail,
  };
}
