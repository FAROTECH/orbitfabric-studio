import type {
  CoreCoverageSummary,
  CoreDashboardSummary,
  CoreEntityIndex,
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
  | "coverage"
  | "generated-artifacts";

export type MissionDataFlowWorkbenchRecordKind =
  | "mission-domain"
  | "relationship-type"
  | "relationship-record"
  | "scenario-data-flow-evidence"
  | "coverage-scope"
  | "generated-artifact";

export type MissionDataFlowWorkbenchProvenance =
  | "workspace-inspection"
  | "core-model-summary"
  | "core-entity-index"
  | "core-relationship-manifest"
  | "core-dashboard-summary"
  | "core-coverage-summary"
  | "core-simulation-report"
  | "generated-artifact-inventory"
  | "explicit-unavailable-state";

export interface MissionDataFlowWorkbenchInput {
  modelSummary: CoreModelSummary | null;
  entityIndex: CoreEntityIndex | null;
  relationshipManifest: CoreRelationshipManifest | null;
  dashboardSummary: CoreDashboardSummary | null;
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
  provenance: MissionDataFlowWorkbenchProvenance;
  state: MissionDataFlowWorkbenchSourceState;
  detail: string;
  raw: unknown;
}

export interface MissionDataFlowWorkbenchLane {
  id: MissionDataFlowWorkbenchLaneId;
  title: string;
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
  counts: {
    missionDomains: number;
    relationshipTypes: number;
    relationshipRecords: number;
    scenarioDataFlowEvidenceRecords: number;
    coverageScopes: number;
    generatedArtifacts: number;
  };
}

export function createMissionDataFlowWorkbenchSnapshot(
  input: MissionDataFlowWorkbenchInput,
): MissionDataFlowWorkbenchSnapshot {
  const missionDomainRecords = createMissionDomainRecords(input);
  const relationshipRecords = createRelationshipRecords(input.relationshipManifest);
  const scenarioEvidenceRecords = createScenarioEvidenceRecords(input.simulationReport);
  const coverageRecords = createCoverageRecords(input.coverageSummary);
  const generatedArtifactRecords = createGeneratedArtifactRecords(
    input.generatedArtifactInventory,
  );

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
        provenance: input.entityIndex ? "core-entity-index" : "core-model-summary",
        records: missionDomainRecords,
        emptyDetail: "No Core model summary or entity index has been reported yet.",
      }),
      createLane({
        id: "relationship-manifest",
        title: "Relationship manifest",
        provenance: "core-relationship-manifest",
        records: relationshipRecords,
        emptyDetail: "No Core relationship manifest has been reported yet.",
      }),
      createLane({
        id: "scenario-data-flow-evidence",
        title: "Scenario data-flow evidence",
        provenance: "core-simulation-report",
        records: scenarioEvidenceRecords,
        emptyDetail: "No Core simulation data-flow evidence has been reported yet.",
      }),
      createLane({
        id: "coverage",
        title: "Coverage",
        provenance: "core-coverage-summary",
        records: coverageRecords,
        emptyDetail: "No Core coverage summary has been reported yet.",
      }),
      createLane({
        id: "generated-artifacts",
        title: "Generated artifacts",
        provenance: "generated-artifact-inventory",
        records: generatedArtifactRecords,
        emptyDetail: "No generated artifact inventory has been loaded yet.",
      }),
    ],
    counts: {
      missionDomains: missionDomainRecords.length,
      relationshipTypes: input.relationshipManifest?.relationship_types.length ?? 0,
      relationshipRecords: input.relationshipManifest?.relationships.length ?? 0,
      scenarioDataFlowEvidenceRecords: scenarioEvidenceRecords.length,
      coverageScopes: coverageRecords.length,
      generatedArtifacts: generatedArtifactRecords.length,
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
    provenance: "core-simulation-report",
    state: "reported",
    detail: `t=${record.t}, producer=${record.producer ?? "not reported"}`,
    raw: record,
  };
}

function createCoverageRecords(
  coverageSummary: CoreCoverageSummary | null,
): MissionDataFlowWorkbenchRecord[] {
  if (!coverageSummary) {
    return [];
  }

  const entityCoverage = Object.entries(coverageSummary.entity_coverage).map(
    ([domain, coverage]) => ({
      id: `coverage:entity:${domain}`,
      label: domain,
      kind: "coverage-scope" as const,
      provenance: "core-coverage-summary" as const,
      state: "reported" as const,
      detail: `${coverage.covered}/${coverage.total} covered`,
      raw: coverage,
    }),
  );

  const relationshipCoverage = Object.entries(
    coverageSummary.relationship_coverage.by_type,
  ).map(([relationshipType, coverage]) => ({
    id: `coverage:relationship:${relationshipType}`,
    label: relationshipType,
    kind: "coverage-scope" as const,
    provenance: "core-coverage-summary" as const,
    state: "reported" as const,
    detail: `${coverage.covered}/${coverage.total} covered`,
    raw: coverage,
  }));

  return [...entityCoverage, ...relationshipCoverage];
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
    provenance: "generated-artifact-inventory",
    state: artifact.known_status === "known" ? "reported" : "unavailable",
    detail: `${artifact.artifact_class}, ${artifact.preview_status}`,
    raw: artifact,
  };
}

function createLane({
  id,
  title,
  provenance,
  records,
  emptyDetail,
}: {
  id: MissionDataFlowWorkbenchLaneId;
  title: string;
  provenance: MissionDataFlowWorkbenchProvenance;
  records: MissionDataFlowWorkbenchRecord[];
  emptyDetail: string;
}): MissionDataFlowWorkbenchLane {
  return {
    id,
    title,
    provenance,
    records,
    state: records.length > 0 ? "reported" : "not-reported",
    emptyDetail,
  };
}
