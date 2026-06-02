import type { GeneratedArtifactDashboardSummary } from "./GeneratedArtifactExplorer";
import type { CoreReportSnapshots } from "./missionCockpitModel";
import type {
  CoreCoverageRecord,
  CoreDashboardModelDomain,
  CoreEntityIndex,
  CoreEntityIndexEntity,
  CoreRelationshipManifest,
  CoreSimulationDataFlowEvidenceRecord,
  CoreSimulationJsonValue,
  WorkspaceInspection,
} from "./types/workspace";

export type MissionContentEvidenceKey =
  | "workspace"
  | "modelSummary"
  | "entityIndex"
  | "relationshipManifest"
  | "dashboardSummary"
  | "scenarioRunIndex"
  | "coverageSummary"
  | "simulationReport"
  | "generatedArtifactInventory";

export type MissionContentWarningSeverity = "warning" | "critical";

export interface MissionContentViewModelInput {
  workspace: WorkspaceInspection | null;
  snapshots: CoreReportSnapshots;
  relationshipManifest: CoreRelationshipManifest | null;
  generatedArtifactSummary: GeneratedArtifactDashboardSummary | null;
}

export interface MissionContentViewModel {
  mission: MissionContentMission;
  spacecraft: MissionContentEntityGroup;
  payloads: MissionContentEntityGroup;
  dataProducts: MissionContentDataProductGroup;
  scenarios: MissionContentScenarioGroup;
  generatedArtifacts: MissionContentGeneratedArtifacts;
  commandability: MissionContentCoverageSummary;
  telemetryEffects: MissionContentEntityGroup;
  warnings: MissionContentWarning[];
  evidence: MissionContentEvidencePosture;
  support: MissionContentSupportPosture;
}

export interface MissionContentMission {
  id: string;
  name: string;
  modelVersion: string;
  workspaceName: string;
  missionDir: string | null;
}

export interface MissionContentEntityGroup {
  label: string;
  count: number | null;
  items: MissionContentEntity[];
  source: string;
}

export interface MissionContentDataProductGroup extends MissionContentEntityGroup {
  coverage: MissionContentCoverageSummary;
  producedBy: MissionContentRelationshipSummary;
  downlinkLinked: MissionContentRelationshipSummary;
  observedProducts: MissionContentObservedDataProduct[];
}

export interface MissionContentEntity {
  id: string;
  label: string;
  domain: string;
  entityType: string;
  sourceFile: string;
}

export interface MissionContentScenarioGroup {
  count: number;
  sourceCount: number;
  passed: number | null;
  failed: number | null;
  items: MissionContentScenario[];
  source: string;
}

export interface MissionContentScenario {
  id: string;
  label: string;
  result: string;
  reportFile: string | null;
}

export interface MissionContentGeneratedArtifacts {
  total: number | null;
  docs: number | null;
  reports: number | null;
  runtime: number | null;
  ground: number | null;
  warnings: number | null;
  source: string;
}

export interface MissionContentCoverageSummary {
  total: number | null;
  covered: number | null;
  uncovered: number | null;
  percent: number | null;
  source: string;
}

export interface MissionContentRelationshipSummary {
  total: number | null;
  covered: number | null;
  source: string;
}

export interface MissionContentObservedDataProduct {
  id: string;
  producer: string | null;
  producerType: string | null;
  storageIntent: string | null;
  downlinkIntent: string | null;
  downlinkFlows: string[];
  contactWindows: string[];
}

export interface MissionContentWarning {
  id: string;
  severity: MissionContentWarningSeverity;
  title: string;
  detail: string;
  source: string;
}

export interface MissionContentEvidencePosture {
  items: MissionContentEvidenceItem[];
  reported: number;
  total: number;
}

export interface MissionContentEvidenceItem {
  key: MissionContentEvidenceKey;
  label: string;
  available: boolean;
  detail: string;
}

export interface MissionContentSupportPosture {
  validation: {
    result: string | null;
    errors: number | null;
    warnings: number | null;
    info: number | null;
  };
  relationships: {
    total: number | null;
    types: number | null;
  };
  expectationCoverage: MissionContentCoverageSummary;
}

const workspaceFallbackMissionName = "OrbitFabric mission workspace";

export function createMissionContentViewModel({
  workspace,
  snapshots,
  relationshipManifest,
  generatedArtifactSummary,
}: MissionContentViewModelInput): MissionContentViewModel {
  const missionIdentity =
    snapshots.modelSummary?.mission ??
    snapshots.entityIndex?.mission ??
    snapshots.dashboardSummary?.mission ??
    snapshots.coverageSummary?.mission ??
    null;
  const workspaceName = workspace?.selected_path
    ? lastPathSegment(workspace.selected_path)
    : "No workspace";
  const mission: MissionContentMission = {
    id: missionIdentity?.id ?? workspaceName,
    name: missionIdentity?.name ?? workspaceFallbackMissionName,
    modelVersion: missionIdentity?.model_version ?? "not reported",
    workspaceName,
    missionDir: workspace?.mission_dir ?? null,
  };

  const dashboardDomains = new Map(
    (snapshots.dashboardSummary?.model_domains.domains ?? []).map((domain) => [domain.id, domain]),
  );
  const entityDomains = new Map(
    (snapshots.entityIndex?.domains ?? []).map((domain) => [domain.id, domain]),
  );

  const spacecraft = createEntityGroup({
    label: "Spacecraft",
    domainIds: ["spacecraft"],
    entityIndex: snapshots.entityIndex,
    dashboardDomains,
    entityDomains,
    fallbackSource: "Core entity index or model summary",
  });
  const payloads = createEntityGroup({
    label: "Payloads",
    domainIds: ["payloads"],
    entityIndex: snapshots.entityIndex,
    dashboardDomains,
    entityDomains,
    fallbackSource: "Core entity index or model summary",
  });
  const telemetryEffects = createEntityGroup({
    label: "Telemetry",
    domainIds: ["telemetry"],
    entityIndex: snapshots.entityIndex,
    dashboardDomains,
    entityDomains,
    fallbackSource: "Core entity index or model summary",
  });
  const dataProductEntities = createEntityGroup({
    label: "Data Products",
    domainIds: ["data_products", "data-products"],
    entityIndex: snapshots.entityIndex,
    dashboardDomains,
    entityDomains,
    fallbackSource: "Core entity index or model summary",
  });
  const dataProductCoverage = coverageFromRecords(snapshots.coverageSummary?.entity_coverage, [
    "data_products",
    "data-products",
    "dataProducts",
    "data_products.yaml",
  ], "Core coverage summary");
  const commandability = coverageFromRecords(snapshots.coverageSummary?.entity_coverage, [
    "commandability",
    "commands",
    "commands.yaml",
    "commandability.yaml",
  ], "Core coverage summary");

  const dataProducts: MissionContentDataProductGroup = {
    ...dataProductEntities,
    coverage: dataProductCoverage,
    producedBy: summarizeRelationships(relationshipManifest, [
      "data_product_produced_by_payload",
      "data_product_produced_by_subsystem",
    ], snapshots.coverageSummary?.relationship_coverage.by_type),
    downlinkLinked: summarizeRelationships(
      relationshipManifest,
      ["downlink_flow_includes_data_product"],
      snapshots.coverageSummary?.relationship_coverage.by_type,
    ),
    observedProducts: observedDataProductsFromSimulation(
      snapshots.simulationReport?.data_flow_evidence ?? [],
    ),
  };

  const scenarios = createScenarioGroup(workspace, snapshots);
  const generatedArtifacts = createGeneratedArtifactsSummary(workspace, generatedArtifactSummary);
  const warnings = createMissionWarnings({
    workspace,
    snapshots,
    generatedArtifactSummary,
    dataProductCoverage,
    commandability,
  });
  const validation = snapshots.lintReport?.summary ?? snapshots.dashboardSummary?.validation ?? null;

  return {
    mission,
    spacecraft,
    payloads,
    dataProducts,
    scenarios,
    generatedArtifacts,
    commandability,
    telemetryEffects,
    warnings,
    evidence: createEvidencePosture({
      workspace,
      snapshots,
      relationshipManifest,
      generatedArtifactSummary,
    }),
    support: {
      validation: {
        result: snapshots.lintReport?.result ?? snapshots.dashboardSummary?.validation.result ?? null,
        errors: validation?.errors ?? null,
        warnings: validation?.warnings ?? null,
        info: validation?.info ?? null,
      },
      relationships: {
        total: relationshipManifest?.counts.total_relationships ?? null,
        types: relationshipManifest
          ? Object.keys(relationshipManifest.counts.relationship_types).length
          : null,
      },
      expectationCoverage: expectationCoverageFromSnapshot(snapshots),
    },
  };
}

function createEntityGroup({
  label,
  domainIds,
  entityIndex,
  dashboardDomains,
  entityDomains,
  fallbackSource,
}: {
  label: string;
  domainIds: string[];
  entityIndex: CoreEntityIndex | null;
  dashboardDomains: Map<string, CoreDashboardModelDomain>;
  entityDomains: Map<string, { entity_count: number; source_file: string }>;
  fallbackSource: string;
}): MissionContentEntityGroup {
  const entities = (entityIndex?.entities ?? [])
    .filter((entity) => domainIds.includes(entity.domain))
    .map(toMissionEntity)
    .sort((left, right) => left.label.localeCompare(right.label));
  const entityDomain = firstMapped(domainIds, entityDomains);
  const dashboardDomain = firstMapped(domainIds, dashboardDomains);

  return {
    label,
    count: entityDomain?.entity_count ?? dashboardDomain?.count ?? entities.length,
    items: entities,
    source: entityIndex
      ? "Core entity index"
      : dashboardDomain
        ? "Core dashboard summary"
        : fallbackSource,
  };
}

function toMissionEntity(entity: CoreEntityIndexEntity): MissionContentEntity {
  return {
    id: entity.id,
    label: entity.display_name || entity.id,
    domain: entity.domain,
    entityType: entity.entity_type,
    sourceFile: entity.source_file,
  };
}

function coverageFromRecords(
  records: Record<string, CoreCoverageRecord> | undefined,
  candidateKeys: string[],
  source: string,
): MissionContentCoverageSummary {
  const record = firstMapped(candidateKeys, records ?? new Map<string, CoreCoverageRecord>());

  if (!record) {
    return {
      total: null,
      covered: null,
      uncovered: null,
      percent: null,
      source: `${source} not reported`,
    };
  }

  return {
    total: record.total,
    covered: record.covered,
    uncovered: record.uncovered,
    percent: ratioToPercent(record.coverage_ratio),
    source,
  };
}

function expectationCoverageFromSnapshot(snapshots: CoreReportSnapshots): MissionContentCoverageSummary {
  const expectationCoverage = snapshots.coverageSummary?.expectation_coverage ?? null;

  if (!expectationCoverage) {
    return {
      total: null,
      covered: null,
      uncovered: null,
      percent: null,
      source: "Core coverage summary not reported",
    };
  }

  return {
    total: expectationCoverage.total,
    covered: expectationCoverage.passed,
    uncovered: expectationCoverage.failed,
    percent: ratioToPercent(expectationCoverage.pass_ratio),
    source: "Core coverage summary",
  };
}

function summarizeRelationships(
  relationshipManifest: CoreRelationshipManifest | null,
  relationshipTypes: string[],
  coverageByType?: Record<string, CoreCoverageRecord>,
): MissionContentRelationshipSummary {
  const total = relationshipTypes.reduce(
    (sum, type) => sum + (relationshipManifest?.counts.relationship_types[type] ?? 0),
    0,
  );
  const covered = relationshipTypes.reduce(
    (sum, type) => sum + (coverageByType?.[type]?.covered ?? 0),
    0,
  );

  return {
    total: relationshipManifest ? total : null,
    covered: coverageByType ? covered : null,
    source: relationshipManifest ? "Core relationship manifest" : "Core relationship manifest not reported",
  };
}

function observedDataProductsFromSimulation(
  records: CoreSimulationDataFlowEvidenceRecord[],
): MissionContentObservedDataProduct[] {
  const byId = new Map<string, MissionContentObservedDataProduct>();

  for (const record of records) {
    if (!record.data_product_id) {
      continue;
    }

    byId.set(record.data_product_id, {
      id: record.data_product_id,
      producer: record.producer ?? null,
      producerType: record.producer_type ?? null,
      storageIntent: summarizeJsonValue(record.storage_intent),
      downlinkIntent: summarizeJsonValue(record.downlink_intent),
      downlinkFlows: record.eligible_downlink_flows ?? [],
      contactWindows: record.contact_windows ?? [],
    });
  }

  return [...byId.values()].sort((left, right) => left.id.localeCompare(right.id));
}

function createScenarioGroup(
  workspace: WorkspaceInspection | null,
  snapshots: CoreReportSnapshots,
): MissionContentScenarioGroup {
  const runs = snapshots.scenarioRunIndex?.runs ?? [];
  const sourceCount = workspace?.scenario_files.length ?? 0;

  return {
    count: runs.length > 0 ? runs.length : sourceCount,
    sourceCount,
    passed: snapshots.scenarioRunIndex?.summary.passed ?? snapshots.coverageSummary?.scenario_runs.passed ?? null,
    failed: snapshots.scenarioRunIndex?.summary.failed ?? snapshots.coverageSummary?.scenario_runs.failed ?? null,
    items:
      runs.length > 0
        ? runs.map((run) => ({
            id: run.scenario,
            label: run.scenario,
            result: run.result,
            reportFile: run.report_file,
          }))
        : (workspace?.scenario_files ?? []).map((entry) => ({
            id: entry.name,
            label: entry.name,
            result: "not run",
            reportFile: null,
          })),
    source: runs.length > 0 ? "Core scenario run index" : "Workspace scenario sources",
  };
}

function createGeneratedArtifactsSummary(
  workspace: WorkspaceInspection | null,
  generatedArtifactSummary: GeneratedArtifactDashboardSummary | null,
): MissionContentGeneratedArtifacts {
  const generatedLocations = new Set(
    (workspace?.generated_locations ?? []).map((entry) => entry.name.toLowerCase()),
  );

  return {
    total: generatedArtifactSummary?.totalArtifacts ?? null,
    docs: generatedLocations.has("docs") ? 1 : null,
    reports: generatedLocations.has("reports") ? 1 : null,
    runtime: generatedLocations.has("runtime") ? 1 : null,
    ground: generatedLocations.has("ground") ? 1 : null,
    warnings: generatedArtifactSummary?.warningCount ?? null,
    source: generatedArtifactSummary ? "Generated artifact inventory" : "Workspace generated locations",
  };
}

function createMissionWarnings({
  workspace,
  snapshots,
  generatedArtifactSummary,
  dataProductCoverage,
  commandability,
}: {
  workspace: WorkspaceInspection | null;
  snapshots: CoreReportSnapshots;
  generatedArtifactSummary: GeneratedArtifactDashboardSummary | null;
  dataProductCoverage: MissionContentCoverageSummary;
  commandability: MissionContentCoverageSummary;
}): MissionContentWarning[] {
  const warnings: MissionContentWarning[] = [];

  for (const source of workspace?.missing_expected_source_files ?? []) {
    warnings.push({
      id: `missing-source:${source}`,
      severity: "critical",
      title: `Missing source: ${source}`,
      detail: "Workspace inspection reports an expected source file as missing.",
      source: "Workspace inspection",
    });
  }

  for (const [index, warning] of (workspace?.warnings ?? []).entries()) {
    warnings.push({
      id: `workspace-warning:${index}`,
      severity: "warning",
      title: "Workspace warning",
      detail: warning,
      source: "Workspace inspection",
    });
  }

  const validationErrors = snapshots.lintReport?.summary.errors ?? snapshots.dashboardSummary?.validation.errors ?? 0;
  const validationWarnings = snapshots.lintReport?.summary.warnings ?? snapshots.dashboardSummary?.validation.warnings ?? 0;

  if (validationErrors > 0) {
    warnings.push({
      id: "validation-errors",
      severity: "critical",
      title: `${validationErrors} validation errors`,
      detail: "Core validation reports blocking errors.",
      source: snapshots.lintReport ? "Core lint report" : "Core dashboard summary",
    });
  }

  if (validationWarnings > 0) {
    warnings.push({
      id: "validation-warnings",
      severity: "warning",
      title: `${validationWarnings} validation warnings`,
      detail: "Core validation reports warnings.",
      source: snapshots.lintReport ? "Core lint report" : "Core dashboard summary",
    });
  }

  const failedScenarios = snapshots.scenarioRunIndex?.summary.failed ?? snapshots.coverageSummary?.scenario_runs.failed ?? 0;

  if (failedScenarios > 0) {
    warnings.push({
      id: "failed-scenarios",
      severity: "critical",
      title: `${failedScenarios} failed scenario runs`,
      detail: "Core scenario evidence reports failed runs.",
      source: snapshots.scenarioRunIndex ? "Core scenario run index" : "Core coverage summary",
    });
  }

  if ((dataProductCoverage.uncovered ?? 0) > 0) {
    warnings.push({
      id: "uncovered-data-products",
      severity: "warning",
      title: `${dataProductCoverage.uncovered} uncovered data products`,
      detail: "Core coverage summary reports data products without scenario evidence.",
      source: dataProductCoverage.source,
    });
  }

  if ((commandability.uncovered ?? 0) > 0) {
    warnings.push({
      id: "uncovered-commands",
      severity: "warning",
      title: `${commandability.uncovered} uncovered command records`,
      detail: "Core coverage summary reports command records without scenario evidence.",
      source: commandability.source,
    });
  }

  if ((generatedArtifactSummary?.warningCount ?? 0) > 0) {
    warnings.push({
      id: "artifact-warnings",
      severity: "warning",
      title: `${generatedArtifactSummary?.warningCount ?? 0} generated artifact warnings`,
      detail: "Generated artifact inspection reports warnings.",
      source: "Generated artifact inventory",
    });
  }

  return warnings;
}

function createEvidencePosture({
  workspace,
  snapshots,
  relationshipManifest,
  generatedArtifactSummary,
}: {
  workspace: WorkspaceInspection | null;
  snapshots: CoreReportSnapshots;
  relationshipManifest: CoreRelationshipManifest | null;
  generatedArtifactSummary: GeneratedArtifactDashboardSummary | null;
}): MissionContentEvidencePosture {
  const items: MissionContentEvidenceItem[] = [
    {
      key: "workspace",
      label: "Workspace",
      available: Boolean(workspace),
      detail: workspace?.selected_path ?? "not selected",
    },
    {
      key: "modelSummary",
      label: "Model summary",
      available: Boolean(snapshots.modelSummary),
      detail: snapshots.modelSummary ? "reported" : "not reported",
    },
    {
      key: "entityIndex",
      label: "Entity index",
      available: Boolean(snapshots.entityIndex),
      detail: snapshots.entityIndex ? `${snapshots.entityIndex.counts.total_entities} entities` : "not reported",
    },
    {
      key: "relationshipManifest",
      label: "Relationships",
      available: Boolean(relationshipManifest),
      detail: relationshipManifest ? `${relationshipManifest.counts.total_relationships} relationships` : "not reported",
    },
    {
      key: "dashboardSummary",
      label: "Dashboard summary",
      available: Boolean(snapshots.dashboardSummary),
      detail: snapshots.dashboardSummary ? "reported" : "not reported",
    },
    {
      key: "scenarioRunIndex",
      label: "Scenario index",
      available: Boolean(snapshots.scenarioRunIndex),
      detail: snapshots.scenarioRunIndex ? `${snapshots.scenarioRunIndex.summary.total} runs` : "not reported",
    },
    {
      key: "coverageSummary",
      label: "Coverage",
      available: Boolean(snapshots.coverageSummary),
      detail: snapshots.coverageSummary ? "reported" : "not reported",
    },
    {
      key: "simulationReport",
      label: "Simulation",
      available: Boolean(snapshots.simulationReport),
      detail: snapshots.simulationReport?.scenario ?? "not reported",
    },
    {
      key: "generatedArtifactInventory",
      label: "Artifacts",
      available: Boolean(generatedArtifactSummary),
      detail: generatedArtifactSummary ? `${generatedArtifactSummary.totalArtifacts} artifacts` : "not loaded",
    },
  ];

  return {
    items,
    reported: items.filter((item) => item.available).length,
    total: items.length,
  };
}

function ratioToPercent(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round(value * 100)));
}

function lastPathSegment(path: string): string {
  return path.split(/[\\/]/).filter(Boolean).slice(-1)[0] ?? path;
}

function firstMapped<T>(keys: string[], map: Map<string, T> | Record<string, T>): T | null {
  for (const key of keys) {
    const value = map instanceof Map ? map.get(key) : map[key];

    if (value) {
      return value;
    }
  }

  return null;
}

function summarizeJsonValue(value: CoreSimulationJsonValue | undefined): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `${value.length} items`;
  }

  return Object.entries(value)
    .map(([key, item]) => `${key}: ${String(item)}`)
    .slice(0, 3)
    .join(", ");
}
