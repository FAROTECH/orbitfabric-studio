import { useEffect, useMemo, useState } from "react";

import { StatusBadge } from "./Badges";
import { DashboardIcon } from "./DashboardIcon";
import { type GeneratedArtifactDashboardSummary } from "./GeneratedArtifactExplorer";
import {
  targetDomainNavigationItems,
  type ActiveSurface,
  type TargetDomainId,
} from "./navigationModel";
import {
  parseCoreCoverageSummary,
  parseCoreDashboardSummary,
  parseCoreEntityIndex,
  parseCoreLintReport,
  parseCoreModelSummary,
  parseCoreRelationshipManifest,
  parseCoreScenarioRunIndex,
  parseCoreSimulationReport,
} from "./coreReports";
import type {
  CoreCommandResult,
  CoreCoverageRecord,
  CoreRelationshipManifest,
  WorkspaceInspection,
} from "./types/workspace";
import {
  createMissionCockpitPostureModel,
  type CoreReportSnapshots,
  type MissionCockpitMetricKind,
  type MissionCockpitMetricState,
} from "./missionCockpitModel";
import { createMissionDataFlowWorkbenchSnapshot } from "./missionDataFlowWorkbenchModel";

type CockpitSignalState = "reported" | "warning" | "critical" | "idle";

type CockpitDomainTileState =
  | "indexed"
  | "present"
  | "missing"
  | "reserved"
  | "not-reported";

type ArtifactDockId = "docs" | "reports" | "logs" | "runtime" | "ground" | "unknown";

interface SourceBusItem {
  id: string;
  label: string;
  value: string;
  state: CockpitSignalState;
  title: string;
}

interface ContractMatrixTile {
  id: TargetDomainId;
  label: string;
  shortLabel: string;
  icon: Parameters<typeof DashboardIcon>[0]["kind"];
  value: string;
  state: CockpitDomainTileState;
  warning: boolean;
  surface: ActiveSurface;
  disabled: boolean;
  title: string;
}

interface GaugeModel {
  label: string;
  value: string;
  percent: number | null;
  title: string;
}

const domainShortLabels: Partial<Record<TargetDomainId, string>> = {
  mission: "MSN",
  "data-flow-workbench": "FLOW",
  spacecraft: "S/C",
  subsystems: "SUB",
  modes: "MODE",
  telemetry: "TLM",
  commands: "CMD",
  events: "EVT",
  faults: "FLT",
  packets: "PKT",
  payloads: "PAY",
  "data-products": "DATA",
  "contacts-downlink": "DLNK",
  commandability: "CMDY",
  autonomy: "AUTO",
  scenarios: "SCN",
  "generated-artifacts": "ART",
};

const artifactDockItems: readonly {
  id: ArtifactDockId;
  label: string;
  icon: string;
  locationName: string | null;
}[] = [
  { id: "docs", label: "DOCS", icon: "▤", locationName: "docs" },
  { id: "reports", label: "REPORTS", icon: "▥", locationName: "reports" },
  { id: "logs", label: "LOGS", icon: "≡", locationName: "logs" },
  { id: "runtime", label: "RUNTIME", icon: "</>", locationName: "runtime" },
  { id: "ground", label: "GROUND", icon: "⌁", locationName: "ground" },
  { id: "unknown", label: "UNKNOWN", icon: "?", locationName: null },
] as const;

function formatMetricStateLabel(state: MissionCockpitMetricState): string {
  if (state === "core-reported") {
    return "CORE";
  }

  if (state === "not-reported") {
    return "N/R";
  }

  return "N/A";
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function ratioToPercent(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return clampPercent(value * 100);
}

function formatPercent(value: number | null): string {
  return value === null ? "N/R" : `${value}%`;
}

function formatCompactNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? "N/R" : String(value);
}

function signalForAvailability(isAvailable: boolean, isWarning = false): CockpitSignalState {
  if (isWarning) {
    return "warning";
  }

  return isAvailable ? "reported" : "idle";
}

function selectCoverageRecord(
  records: Record<string, CoreCoverageRecord> | undefined,
  candidates: string[],
): CoreCoverageRecord | null {
  if (!records) {
    return null;
  }

  for (const candidate of candidates) {
    const record = records[candidate];

    if (record) {
      return record;
    }
  }

  return null;
}

function aggregateCoverage(
  records: Record<string, CoreCoverageRecord> | undefined,
): { total: number; covered: number; uncovered: number; percent: number | null } | null {
  if (!records) {
    return null;
  }

  const values = Object.values(records);

  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, record) => sum + record.total, 0);
  const covered = values.reduce((sum, record) => sum + record.covered, 0);
  const uncovered = values.reduce((sum, record) => sum + record.uncovered, 0);

  return {
    total,
    covered,
    uncovered,
    percent: total > 0 ? clampPercent((covered / total) * 100) : null,
  };
}

function findStructuralSourceFile(
  workspace: WorkspaceInspection | null,
  domainId: TargetDomainId,
): string | null {
  if (!workspace) {
    return null;
  }

  const candidates = new Set([
    domainId,
    domainId.replace(/-/g, "_"),
    `${domainId}.yaml`,
    `${domainId.replace(/-/g, "_")}.yaml`,
  ]);

  if (domainId === "contacts-downlink") {
    candidates.add("contacts");
    candidates.add("contacts.yaml");
    candidates.add("downlink");
    candidates.add("downlink.yaml");
  }

  if (domainId === "data-products") {
    candidates.add("data_products");
    candidates.add("data_products.yaml");
  }

  const match = workspace.source_model_files.find((entry) => {
    const normalized = entry.name.toLowerCase();
    return [...candidates].some((candidate) => normalized === candidate.toLowerCase());
  });

  return match?.name ?? null;
}

function buildScenarioDots(
  scenarioRunIndex: CoreReportSnapshots["scenarioRunIndex"],
  coverageSummary: CoreReportSnapshots["coverageSummary"],
): { state: "passed" | "failed" | "idle"; title: string }[] {
  if (scenarioRunIndex?.runs.length) {
    return scenarioRunIndex.runs.slice(0, 24).map((run) => ({
      state: run.result,
      title: `${run.scenario}: ${run.result}`,
    }));
  }

  const scenarioRuns = coverageSummary?.scenario_runs ?? null;

  if (!scenarioRuns) {
    return [];
  }

  const dotCount = Math.min(scenarioRuns.total, 24);

  return Array.from({ length: dotCount }, (_, index) => {
    if (index < scenarioRuns.failed) {
      return { state: "failed" as const, title: "failed" };
    }

    if (index < scenarioRuns.failed + scenarioRuns.passed) {
      return { state: "passed" as const, title: "passed" };
    }

    return { state: "idle" as const, title: "not reported" };
  });
}

function metricInstrumentClass(kind: MissionCockpitMetricKind): string {
  return kind.replace(/-/g, "_");
}

export function MissionCockpit({
  workspace,
  coreResult,
  coreReportSnapshots,
  generatedArtifactSummary,
  onActiveSurfaceChange,
}: {
  workspace: WorkspaceInspection | null;
  coreResult: CoreCommandResult | null;
  coreReportSnapshots: CoreReportSnapshots;
  generatedArtifactSummary: GeneratedArtifactDashboardSummary | null;
  onActiveSurfaceChange: (surface: ActiveSurface) => void;
}) {
  const currentReportContent = coreResult?.json_report_content ?? null;
  const currentRelationshipManifest = useMemo(
    () => parseCoreRelationshipManifest(currentReportContent),
    [currentReportContent],
  );
  const [relationshipManifestSnapshot, setRelationshipManifestSnapshot] =
    useState<CoreRelationshipManifest | null>(null);

  useEffect(() => {
    setRelationshipManifestSnapshot(null);
  }, [workspace?.selected_path]);

  useEffect(() => {
    if (currentRelationshipManifest) {
      setRelationshipManifestSnapshot(currentRelationshipManifest);
    }
  }, [currentRelationshipManifest]);

  const lintReport =
    parseCoreLintReport(currentReportContent) ?? coreReportSnapshots.lintReport;
  const modelSummary =
    parseCoreModelSummary(currentReportContent) ?? coreReportSnapshots.modelSummary;
  const entityIndex =
    parseCoreEntityIndex(currentReportContent) ?? coreReportSnapshots.entityIndex;
  const relationshipManifest =
    currentRelationshipManifest ?? relationshipManifestSnapshot;
  const dashboardSummary =
    parseCoreDashboardSummary(currentReportContent) ??
    coreReportSnapshots.dashboardSummary;
  const scenarioRunIndex =
    parseCoreScenarioRunIndex(currentReportContent) ??
    coreReportSnapshots.scenarioRunIndex;
  const coverageSummary =
    parseCoreCoverageSummary(currentReportContent) ?? coreReportSnapshots.coverageSummary;
  const simulationReport =
    parseCoreSimulationReport(currentReportContent) ??
    coreReportSnapshots.simulationReport;

  const effectiveCoreReportSnapshots: CoreReportSnapshots = {
    lintReport,
    modelSummary,
    entityIndex,
    dashboardSummary,
    scenarioRunIndex,
    coverageSummary,
    simulationReport,
  };

  const missionCockpitPosture = createMissionCockpitPostureModel({
    workspace,
    snapshots: effectiveCoreReportSnapshots,
  });

  const missionDataFlowSnapshot = createMissionDataFlowWorkbenchSnapshot({
    modelSummary,
    entityIndex,
    relationshipManifest,
    dashboardSummary,
    lintReport,
    simulationReport,
    coverageSummary,
    generatedArtifactInventory: null,
  });

  const workspaceName = workspace?.selected_path
    ? workspace.selected_path.split(/[\\/]/).filter(Boolean).slice(-1)[0]
    : "N/R";
  const dashboardValidation = dashboardSummary?.validation ?? null;
  const validationResult = lintReport?.result ?? dashboardValidation?.result ?? null;
  const validationErrors =
    lintReport?.summary.errors ?? dashboardValidation?.errors ?? null;
  const validationWarnings =
    lintReport?.summary.warnings ?? dashboardValidation?.warnings ?? null;
  const validationInfo = lintReport?.summary.info ?? dashboardValidation?.info ?? null;
  const validationMax = Math.max(validationErrors ?? 0, validationWarnings ?? 0, validationInfo ?? 0, 1);
  const validationFindings = lintReport?.findings.slice(0, 3) ?? [];
  const generatedLocationNames = new Set(
    (workspace?.generated_locations ?? []).map((entry) => entry.name.toLowerCase()),
  );
  const missingSources = workspace?.missing_expected_source_files ?? [];
  const workspaceWarnings = workspace?.warnings ?? [];

  const sourceBusItems: SourceBusItem[] = [
    {
      id: "workspace",
      label: "WS",
      value: workspace ? "1" : "0",
      state: signalForAvailability(Boolean(workspace)),
      title: workspace?.selected_path ?? "Workspace not selected",
    },
    {
      id: "mission",
      label: "MISSION",
      value: workspace?.mission_dir ? "1" : "0",
      state: workspace?.mission_dir ? "reported" : workspace ? "critical" : "idle",
      title: workspace?.mission_dir ?? "Mission directory not reported",
    },
    {
      id: "model",
      label: "MODEL",
      value: String(workspace?.source_model_files.length ?? 0),
      state: workspace?.source_model_files.length ? "reported" : workspace ? "warning" : "idle",
      title: "Workspace source model files",
    },
    {
      id: "scenarios",
      label: "SCEN",
      value: String(workspace?.scenario_files.length ?? 0),
      state: workspace?.scenario_files.length ? "reported" : workspace ? "warning" : "idle",
      title: "Workspace scenario files",
    },
    {
      id: "generated",
      label: "GEN",
      value: String(workspace?.generated_locations.length ?? 0),
      state: workspace?.generated_locations.length ? "reported" : workspace ? "warning" : "idle",
      title: "Workspace generated locations",
    },
    {
      id: "core",
      label: "CORE",
      value: coreResult ? (coreResult.success ? "OK" : "ERR") : "N/R",
      state: coreResult ? (coreResult.success ? "reported" : "critical") : "idle",
      title: coreResult?.command ?? "Core command result not reported",
    },
    {
      id: "entity",
      label: "ENTITY",
      value: formatCompactNumber(entityIndex?.counts.total_entities),
      state: signalForAvailability(Boolean(entityIndex)),
      title: "Core entity index",
    },
    {
      id: "relations",
      label: "REL",
      value: formatCompactNumber(relationshipManifest?.counts.total_relationships),
      state: signalForAvailability(Boolean(relationshipManifest)),
      title: "Core relationship manifest",
    },
    {
      id: "dashboard",
      label: "DASH",
      value: dashboardSummary ? "1" : "0",
      state: signalForAvailability(Boolean(dashboardSummary)),
      title: "Core dashboard summary",
    },
    {
      id: "lint",
      label: "LINT",
      value: validationErrors || validationWarnings ? `${validationErrors ?? 0}/${validationWarnings ?? 0}` : validationResult ? "OK" : "N/R",
      state:
        validationErrors && validationErrors > 0
          ? "critical"
          : validationWarnings && validationWarnings > 0
            ? "warning"
            : validationResult
              ? "reported"
              : "idle",
      title: "Core lint report or dashboard validation",
    },
    {
      id: "sim",
      label: "SIM",
      value: simulationReport ? simulationReport.result.toUpperCase() : "N/R",
      state: simulationReport ? (simulationReport.result === "passed" ? "reported" : "critical") : "idle",
      title: "Core simulation report",
    },
    {
      id: "coverage",
      label: "COV",
      value: coverageSummary ? "1" : "0",
      state: signalForAvailability(Boolean(coverageSummary)),
      title: "Core coverage summary",
    },
    {
      id: "artifacts",
      label: "ART",
      value: formatCompactNumber(generatedArtifactSummary?.totalArtifacts),
      state: generatedArtifactSummary
        ? generatedArtifactSummary.warningCount > 0
          ? "warning"
          : "reported"
        : "idle",
      title: generatedArtifactSummary?.generatedDir ?? "Generated artifact inventory not loaded",
    },
  ];

  const dataProductCoverageRecord = selectCoverageRecord(coverageSummary?.entity_coverage, [
    "data-products",
    "data_products",
    "dataProducts",
    "data_products.yaml",
  ]);
  const commandabilityCoverageRecord = selectCoverageRecord(coverageSummary?.entity_coverage, [
    "commandability",
    "commands",
    "commandability.yaml",
    "commands.yaml",
  ]);
  const scenarioCoveragePercent = coverageSummary?.scenario_runs.total
    ? clampPercent((coverageSummary.scenario_runs.passed / coverageSummary.scenario_runs.total) * 100)
    : null;
  const dataProductCoveragePercent = ratioToPercent(dataProductCoverageRecord?.coverage_ratio);
  const commandabilityCoveragePercent = ratioToPercent(commandabilityCoverageRecord?.coverage_ratio);
  const entityCoverageAggregate = aggregateCoverage(coverageSummary?.entity_coverage);
  const expectationCoveragePercent = ratioToPercent(coverageSummary?.expectation_coverage.pass_ratio);
  const relationshipCoveragePercent = ratioToPercent(
    coverageSummary?.relationship_coverage.coverage_ratio,
  );
  const scenarioDots = buildScenarioDots(scenarioRunIndex, coverageSummary);

  const coverageGauges: GaugeModel[] = [
    {
      label: "Entities",
      value: entityCoverageAggregate
        ? `${entityCoverageAggregate.covered}/${entityCoverageAggregate.total}`
        : "N/R",
      percent: entityCoverageAggregate?.percent ?? null,
      title: "Core coverage_summary.entity_coverage",
    },
    {
      label: "Relationships",
      value: coverageSummary
        ? `${coverageSummary.relationship_coverage.covered_supported_relationships}/${coverageSummary.relationship_coverage.total_supported_relationships}`
        : "N/R",
      percent: relationshipCoveragePercent,
      title: "Core coverage_summary.relationship_coverage",
    },
    {
      label: "Expectations",
      value: coverageSummary
        ? `${coverageSummary.expectation_coverage.passed}/${coverageSummary.expectation_coverage.total}`
        : "N/R",
      percent: expectationCoveragePercent,
      title: "Core coverage_summary.expectation_coverage",
    },
  ];

  const dashboardDomainMap = new Map(
    (dashboardSummary?.model_domains.domains ?? []).map((domain) => [domain.id, domain]),
  );
  const entityDomainMap = new Map(
    (entityIndex?.domains ?? []).map((domain) => [domain.id, domain]),
  );
  const contractMatrixTiles: ContractMatrixTile[] = targetDomainNavigationItems.map((item) => {
    if (item.id === "mission") {
      return {
        id: item.id,
        label: item.label,
        shortLabel: domainShortLabels[item.id] ?? item.label,
        icon: item.icon,
        value: workspace?.mission_dir ? "1" : "0",
        state: workspace?.mission_dir ? "present" : "missing",
        warning: !workspace?.mission_dir,
        surface: item.destinationSurface,
        disabled: !workspace,
        title: workspace?.mission_dir ?? "Mission directory not reported",
      };
    }

    if (item.id === "data-flow-workbench") {
      const links = missionDataFlowSnapshot.counts.traceabilityLinks;

      return {
        id: item.id,
        label: item.label,
        shortLabel: domainShortLabels[item.id] ?? item.label,
        icon: item.icon,
        value: String(links),
        state: links > 0 ? "present" : "not-reported",
        warning: false,
        surface: item.destinationSurface,
        disabled: !workspace,
        title: "Traceability links from Core reports and generated artifacts",
      };
    }

    if (item.id === "scenarios") {
      const count = scenarioRunIndex?.summary.total ?? workspace?.scenario_files.length ?? null;

      return {
        id: item.id,
        label: item.label,
        shortLabel: domainShortLabels[item.id] ?? item.label,
        icon: item.icon,
        value: formatCompactNumber(count),
        state: count && count > 0 ? "present" : "not-reported",
        warning: Boolean(scenarioRunIndex && scenarioRunIndex.summary.failed > 0),
        surface: item.destinationSurface,
        disabled: !workspace,
        title: scenarioRunIndex ? "Core scenario run index" : "Workspace scenario files",
      };
    }

    if (item.id === "generated-artifacts") {
      const count = generatedArtifactSummary?.totalArtifacts ?? workspace?.generated_locations.length ?? null;

      return {
        id: item.id,
        label: item.label,
        shortLabel: domainShortLabels[item.id] ?? item.label,
        icon: item.icon,
        value: formatCompactNumber(count),
        state: count && count > 0 ? "present" : "not-reported",
        warning: Boolean(generatedArtifactSummary && generatedArtifactSummary.warningCount > 0),
        surface: item.destinationSurface,
        disabled: !workspace,
        title: generatedArtifactSummary ? "Generated artifact inventory" : "Workspace generated locations",
      };
    }

    const entityDomain = entityDomainMap.get(item.id);
    const dashboardDomain = dashboardDomainMap.get(item.id);
    const structuralSource = findStructuralSourceFile(workspace, item.id);
    const count = entityDomain?.entity_count ?? dashboardDomain?.count ?? null;
    const state: CockpitDomainTileState =
      item.status === "reserved"
        ? "reserved"
        : entityDomain
          ? entityDomain.indexed
            ? "indexed"
            : "present"
          : dashboardDomain
            ? dashboardDomain.present
              ? "present"
              : "missing"
            : structuralSource
              ? "present"
              : "not-reported";

    return {
      id: item.id,
      label: item.label,
      shortLabel: domainShortLabels[item.id] ?? item.label,
      icon: item.icon,
      value: count === null ? (structuralSource ? "SRC" : item.status === "reserved" ? "RSV" : "N/R") : String(count),
      state,
      warning: state === "missing",
      surface: item.destinationSurface,
      disabled: !workspace || item.status === "reserved",
      title: entityDomain
        ? `Core entity index: ${entityDomain.source_file}`
        : dashboardDomain
          ? `Core dashboard summary: ${dashboardDomain.source_file}`
          : structuralSource ?? item.caption,
    };
  });

  const attentionCounters = [
    { label: "ERR", value: validationErrors ?? 0, state: validationErrors ? "critical" : "reported" },
    { label: "WARN", value: validationWarnings ?? 0, state: validationWarnings ? "warning" : "reported" },
    { label: "MISS", value: missingSources.length, state: missingSources.length ? "critical" : "reported" },
    {
      label: "SCN FAIL",
      value: scenarioRunIndex?.summary.failed ?? coverageSummary?.scenario_runs.failed ?? 0,
      state:
        (scenarioRunIndex?.summary.failed ?? coverageSummary?.scenario_runs.failed ?? 0) > 0
          ? "critical"
          : "reported",
    },
    {
      label: "UNCOV",
      value:
        (entityCoverageAggregate?.uncovered ?? 0) +
        (coverageSummary?.relationship_coverage.uncovered_supported_relationships ?? 0) +
        (coverageSummary?.expectation_coverage.failed ?? 0),
      state:
        (entityCoverageAggregate?.uncovered ?? 0) +
          (coverageSummary?.relationship_coverage.uncovered_supported_relationships ?? 0) +
          (coverageSummary?.expectation_coverage.failed ?? 0) >
        0
          ? "warning"
          : "reported",
    },
    {
      label: "ART WARN",
      value: generatedArtifactSummary?.warningCount ?? 0,
      state: generatedArtifactSummary?.warningCount ? "warning" : "reported",
    },
  ];

  const attentionChips = [
    ...validationFindings.map((finding) => ({
      label: `${finding.severity.toUpperCase()} ${finding.code}`,
      state: finding.severity.toLowerCase() === "error" ? "critical" : "warning",
      title: finding.message,
    })),
    ...missingSources.slice(0, 2).map((source) => ({
      label: `MISS ${source}`,
      state: "critical",
      title: "Missing expected source file",
    })),
    ...workspaceWarnings.slice(0, 2).map((warning) => ({
      label: "WS WARN",
      state: "warning",
      title: warning,
    })),
    ...((coverageSummary?.unsupported.entity_domains ?? []).length > 0
      ? [
          {
            label: `UNSUP ENT ${coverageSummary?.unsupported.entity_domains.length ?? 0}`,
            state: "warning",
            title: coverageSummary?.unsupported.entity_domains.join(", ") ?? "",
          },
        ]
      : []),
    ...((coverageSummary?.unsupported.relationship_types ?? []).length > 0
      ? [
          {
            label: `UNSUP REL ${coverageSummary?.unsupported.relationship_types.length ?? 0}`,
            state: "warning",
            title: coverageSummary?.unsupported.relationship_types.join(", ") ?? "",
          },
        ]
      : []),
  ].slice(0, 5);

  const coreReportCount = [
    lintReport,
    modelSummary,
    entityIndex,
    relationshipManifest,
    dashboardSummary,
    scenarioRunIndex,
    coverageSummary,
    simulationReport,
  ].filter(Boolean).length;

  const evidenceSignalCount = [
    validationResult,
    scenarioRunIndex ?? simulationReport,
    coverageSummary,
    generatedArtifactSummary,
  ].filter(Boolean).length;

  const corePipelineStages: {
    label: string;
    value: string;
    state: CockpitSignalState;
    lanes: { label: string; value: string; state: CockpitSignalState }[];
  }[] = [
    {
      label: "INPUTS",
      value: `${formatCompactNumber(workspace?.source_model_files.length)} / ${formatCompactNumber(workspace?.scenario_files.length)}`,
      state: workspace ? "reported" : "idle",
      lanes: [
        {
          label: "MODEL SRC",
          value: formatCompactNumber(workspace?.source_model_files.length),
          state: signalForAvailability(Boolean(workspace?.source_model_files.length)),
        },
        {
          label: "SCEN SRC",
          value: formatCompactNumber(workspace?.scenario_files.length),
          state: signalForAvailability(Boolean(workspace?.scenario_files.length)),
        },
        {
          label: "GEN PATHS",
          value: formatCompactNumber(workspace?.generated_locations.length),
          state: signalForAvailability(Boolean(workspace?.generated_locations.length)),
        },
      ],
    },
    {
      label: "CORE REPORTS",
      value: `${coreReportCount}/8`,
      state: coreReportCount > 0 ? "reported" : "idle",
      lanes: [
        { label: "LINT", value: lintReport ? "DET" : "N/R", state: signalForAvailability(Boolean(lintReport)) },
        { label: "MODEL", value: modelSummary ? "DET" : "N/R", state: signalForAvailability(Boolean(modelSummary)) },
        { label: "ENTITY", value: entityIndex ? "DET" : "N/R", state: signalForAvailability(Boolean(entityIndex)) },
        { label: "REL", value: relationshipManifest ? "DET" : "N/R", state: signalForAvailability(Boolean(relationshipManifest)) },
        { label: "DASH", value: dashboardSummary ? "DET" : "N/R", state: signalForAvailability(Boolean(dashboardSummary)) },
        { label: "COV", value: coverageSummary ? "DET" : "N/R", state: signalForAvailability(Boolean(coverageSummary)) },
      ],
    },
    {
      label: "EVIDENCE",
      value: `${evidenceSignalCount}/4`,
      state: evidenceSignalCount > 0 ? "reported" : "idle",
      lanes: [
        { label: "VALID", value: validationResult ? validationResult.toUpperCase() : "N/R", state: signalForAvailability(Boolean(validationResult)) },
        {
          label: "SCEN",
          value: formatCompactNumber(scenarioRunIndex?.summary.total ?? coverageSummary?.scenario_runs.total),
          state: signalForAvailability(Boolean(scenarioRunIndex ?? simulationReport)),
        },
        { label: "COVER", value: coverageSummary ? "DET" : "N/R", state: signalForAvailability(Boolean(coverageSummary)) },
        { label: "SIM", value: simulationReport ? simulationReport.result.toUpperCase() : "N/R", state: signalForAvailability(Boolean(simulationReport)) },
      ],
    },
    {
      label: "OUTPUTS",
      value: formatCompactNumber(generatedArtifactSummary?.totalArtifacts),
      state: generatedArtifactSummary
        ? generatedArtifactSummary.warningCount > 0
          ? "warning"
          : "reported"
        : "idle",
      lanes: [
        { label: "DOCS", value: generatedLocationNames.has("docs") ? "DET" : "N/R", state: signalForAvailability(generatedLocationNames.has("docs")) },
        { label: "REPORTS", value: generatedLocationNames.has("reports") ? "DET" : "N/R", state: signalForAvailability(generatedLocationNames.has("reports")) },
        { label: "RUNTIME", value: generatedLocationNames.has("runtime") ? "DET" : "N/R", state: signalForAvailability(generatedLocationNames.has("runtime")) },
        { label: "GROUND", value: generatedLocationNames.has("ground") ? "DET" : "N/R", state: signalForAvailability(generatedLocationNames.has("ground")) },
        {
          label: "UNKNOWN",
          value: formatCompactNumber(generatedArtifactSummary?.unknownArtifacts),
          state: generatedArtifactSummary?.unknownArtifacts ? "warning" : "idle",
        },
      ],
    },
  ];

  return (
    <section
      id="studio-dashboard"
      className="workspace-dashboard cockpit-dashboard cockpit-instrument-panel"
      aria-label="Mission cockpit instrument panel"
    >
      <div className="cockpit-source-bus" aria-label="Source-of-truth bus">
        <div className="cockpit-source-bus-title">
          <span>SOURCE BUS</span>
          <strong title={workspace?.selected_path ?? undefined}>{workspaceName}</strong>
        </div>
        <div className="cockpit-source-bus-leds">
          {sourceBusItems.map((item) => (
            <div
              className={`cockpit-source-led cockpit-source-led-${item.state}`}
              key={item.id}
              title={item.title}
            >
              <span aria-hidden="true" />
              <strong>{item.label}</strong>
              <em>{item.value}</em>
            </div>
          ))}
        </div>
      </div>

      <div className="cockpit-primary-instrument-cluster" aria-label="Primary instrument cluster">
        {missionCockpitPosture.metrics.map((metric) => {
          const percent =
            metric.kind === "scenario-coverage"
              ? scenarioCoveragePercent
              : metric.kind === "data-product-coverage"
                ? dataProductCoveragePercent
                : metric.kind === "commandability-coverage"
                  ? commandabilityCoveragePercent
                  : null;

          return (
            <article
              className={`cockpit-instrument cockpit-instrument-${metricInstrumentClass(metric.kind)} cockpit-instrument-${metric.state}`}
              key={metric.kind}
              title={`${metric.provenance} · ${metric.source}`}
            >
              <div className="cockpit-instrument-header">
                <DashboardIcon
                  kind={
                    metric.kind === "mission-health"
                      ? "shield"
                      : metric.kind === "model-completeness"
                        ? "model"
                        : metric.kind === "lint-status"
                          ? "validation"
                          : metric.kind === "scenario-coverage"
                            ? "scenario"
                            : metric.kind === "data-product-coverage"
                              ? "artifacts"
                              : "core"
                  }
                />
                <StatusBadge label={formatMetricStateLabel(metric.state)} />
              </div>
              <div className="cockpit-instrument-body">
                <span>{metric.label}</span>
                {metric.kind === "lint-status" ? (
                  <div className="cockpit-severity-stack">
                    <SeverityBar label="ERR" value={validationErrors ?? 0} max={validationMax} state="critical" />
                    <SeverityBar label="WARN" value={validationWarnings ?? 0} max={validationMax} state="warning" />
                    <SeverityBar label="INFO" value={validationInfo ?? 0} max={validationMax} state="reported" />
                  </div>
                ) : (
                  <>
                    <strong>{metric.value.replace("Not reported", "N/R")}</strong>
                    <div className="cockpit-ring" aria-hidden="true">
                      <div className="cockpit-ring-core">{formatPercent(percent)}</div>
                    </div>
                    <div className="cockpit-mini-gauge">
                      <span style={{ width: `${percent ?? 0}%` }} />
                    </div>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="cockpit-panel-grid" aria-label="Mission cockpit graphical panels">
        <section className="cockpit-contract-matrix" aria-label="Mission contract matrix">
          <div className="cockpit-panel-title-row">
            <span>CONTRACT MATRIX</span>
            <StatusBadge label={entityIndex ? "INDEX" : dashboardSummary ? "DASH" : "STRUCT"} />
          </div>
          <div className="cockpit-domain-tile-grid">
            {contractMatrixTiles.map((tile) => (
              <button
                type="button"
                className={`cockpit-domain-tile cockpit-domain-tile-${tile.state}`}
                key={tile.id}
                title={tile.title}
                disabled={tile.disabled}
                onClick={() => onActiveSurfaceChange(tile.surface)}
              >
                <DashboardIcon kind={tile.icon} />
                <strong>{tile.value}</strong>
                <span>{tile.shortLabel}</span>
                <i className={tile.warning ? "cockpit-domain-warning" : ""} aria-hidden="true" />
              </button>
            ))}
          </div>

          <div className="cockpit-matrix-legend" aria-label="Contract matrix legend">
            <span><i className="cockpit-legend-dot cockpit-legend-present" aria-hidden="true" /> SRC structural source</span>
            <span><i className="cockpit-legend-dot cockpit-legend-indexed" aria-hidden="true" /> IDX Core indexed</span>
            <span><i className="cockpit-legend-dot cockpit-legend-reserved" aria-hidden="true" /> RSV reserved</span>
            <span><i className="cockpit-legend-dot cockpit-legend-idle" aria-hidden="true" /> N/R not reported</span>
          </div>
        </section>

        <section className="cockpit-evidence-wall" aria-label="Evidence wall">
          <div className="cockpit-panel-title-row">
            <span>EVIDENCE WALL</span>
            <StatusBadge label={validationResult ? validationResult.toUpperCase() : "N/R"} />
          </div>

          {!validationResult && !scenarioRunIndex && !coverageSummary ? (
            <div className="cockpit-evidence-empty-band" aria-label="Evidence availability">
              <span>AWAITING CORE EVIDENCE</span>
              <strong>Validation, scenarios and coverage not reported.</strong>
            </div>
          ) : null}

          <div className="cockpit-evidence-block cockpit-evidence-validation">
            <div className="cockpit-evidence-heading">VALIDATION</div>
            <SeverityBar label="ERR" value={validationErrors ?? 0} max={validationMax} state="critical" />
            <SeverityBar label="WARN" value={validationWarnings ?? 0} max={validationMax} state="warning" />
            <SeverityBar label="INFO" value={validationInfo ?? 0} max={validationMax} state="reported" />
            <div className="cockpit-finding-chip-row">
              {validationFindings.length > 0 ? (
                validationFindings.map((finding) => (
                  <span
                    className={`cockpit-finding-chip cockpit-finding-${finding.severity.toLowerCase()}`}
                    key={`${finding.code}-${finding.object_id ?? finding.message}`}
                    title={finding.message}
                  >
                    {finding.severity.toUpperCase()} {finding.code}
                  </span>
                ))
              ) : (
                <span className="cockpit-finding-chip cockpit-finding-idle">N/R</span>
              )}
            </div>
          </div>

          <div className="cockpit-evidence-block cockpit-evidence-scenarios">
            <div className="cockpit-evidence-heading">SCENARIOS</div>
            <div className="cockpit-scenario-led-summary">
              <strong>{formatCompactNumber(scenarioRunIndex?.summary.passed ?? coverageSummary?.scenario_runs.passed)}</strong>
              <span>PASS</span>
              <strong>{formatCompactNumber(scenarioRunIndex?.summary.failed ?? coverageSummary?.scenario_runs.failed)}</strong>
              <span>FAIL</span>
              <strong>{formatCompactNumber(scenarioRunIndex?.summary.total ?? coverageSummary?.scenario_runs.total)}</strong>
              <span>TOTAL</span>
            </div>
            <div className="cockpit-run-dot-board" aria-label="Scenario run dots">
              {scenarioDots.length > 0 ? (
                scenarioDots.map((dot, index) => (
                  <span
                    className={`cockpit-run-dot cockpit-run-dot-${dot.state}`}
                    key={`${dot.title}-${index}`}
                    title={dot.title}
                  />
                ))
              ) : (
                <span className="cockpit-run-dot cockpit-run-dot-idle" title="not reported" />
              )}
            </div>
          </div>

          <div className="cockpit-evidence-block cockpit-evidence-coverage">
            <div className="cockpit-evidence-heading">COVERAGE</div>
            {coverageGauges.map((gauge) => (
              <GaugeRow key={gauge.label} gauge={gauge} />
            ))}
          </div>
        </section>

        <section className="cockpit-traceability-radar" aria-label="Traceability radar">
          <div className="cockpit-panel-title-row">
            <span>TRACEABILITY</span>
            <StatusBadge label={`${missionDataFlowSnapshot.counts.traceabilityLinks} LINKS`} />
          </div>
          <div className="cockpit-radar-line">
            <RadarNode label="MODEL" value={missionDataFlowSnapshot.counts.missionDomains} active={missionDataFlowSnapshot.counts.missionDomains > 0} />
            <RadarNode label="REL" value={missionDataFlowSnapshot.counts.relationshipRecords} active={missionDataFlowSnapshot.counts.relationshipRecords > 0} />
            <RadarNode label="SCEN" value={missionDataFlowSnapshot.counts.scenarioDataFlowEvidenceRecords} active={missionDataFlowSnapshot.counts.scenarioDataFlowEvidenceRecords > 0} />
            <RadarNode label="COV" value={missionDataFlowSnapshot.counts.coverageScopes} active={missionDataFlowSnapshot.counts.coverageScopes > 0} />
            <RadarNode label="ART" value={generatedArtifactSummary?.totalArtifacts ?? 0} active={Boolean(generatedArtifactSummary?.totalArtifacts)} />
          </div>
          <div className="cockpit-radar-counters">
            <span title="Reported traceability links">REP {missionDataFlowSnapshot.traceability.counts.reportedLinks}</span>
            <span title="Unavailable traceability links">N/R {missionDataFlowSnapshot.traceability.counts.unavailableLinks}</span>
            <span title="Relationship types">TYPE {missionDataFlowSnapshot.counts.relationshipTypes}</span>
          </div>
        </section>

        <section className="cockpit-artifact-dock" aria-label="Artifact dock">
          <div className="cockpit-panel-title-row">
            <span>ARTIFACT DOCK</span>
            <StatusBadge label={generatedArtifactSummary ? "INV" : "N/R"} />
          </div>
          <div className="cockpit-artifact-modules">
            {artifactDockItems.map((item) => {
              const detected = item.locationName
                ? generatedLocationNames.has(item.locationName)
                : Boolean(generatedArtifactSummary && generatedArtifactSummary.unknownArtifacts > 0);
              const value =
                item.id === "unknown"
                  ? formatCompactNumber(generatedArtifactSummary?.unknownArtifacts)
                  : detected
                    ? "DET"
                    : "N/R";
              const state =
                item.id === "unknown" && generatedArtifactSummary?.unknownArtifacts
                  ? "warning"
                  : detected
                    ? "reported"
                    : "idle";

              return (
                <div
                  className={`cockpit-artifact-module cockpit-artifact-module-${state}`}
                  key={item.id}
                  title={item.locationName ?? "Generated artifact inventory unknown class"}
                >
                  <i>{item.icon}</i>
                  <span>{item.label}</span>
                  <strong>{value}</strong>
                </div>
              );
            })}
          </div>
          <div className="cockpit-artifact-strip">
            <span>TOTAL {formatCompactNumber(generatedArtifactSummary?.totalArtifacts)}</span>
            <span>KNOWN {formatCompactNumber(generatedArtifactSummary?.knownArtifacts)}</span>
            <span>PREVIEW {formatCompactNumber(generatedArtifactSummary?.previewableArtifacts)}</span>
            <span>WARN {formatCompactNumber(generatedArtifactSummary?.warningCount)}</span>
          </div>
        </section>
      </div>

      <div className="cockpit-lower-console" aria-label="Core output pipeline and attention rail">
        <section className="cockpit-core-output-pipeline" aria-label="Core output pipeline">
        <div className="cockpit-panel-title-row">
          <span>CORE OUTPUT PIPELINE</span>
          <StatusBadge label={coreResult ? (coreResult.success ? "CORE OK" : "CORE ERR") : "N/R"} />
        </div>

        <div className="cockpit-pipeline-stage-grid">
          {corePipelineStages.map((stage) => (
            <div
              className={`cockpit-pipeline-stage cockpit-pipeline-stage-${stage.state}`}
              key={stage.label}
            >
              <div className="cockpit-pipeline-stage-header">
                <span>{stage.label}</span>
                <strong>{stage.value}</strong>
              </div>

              <div className="cockpit-pipeline-lanes">
                {stage.lanes.map((lane) => (
                  <span
                    className={`cockpit-pipeline-lane cockpit-pipeline-lane-${lane.state}`}
                    key={`${stage.label}-${lane.label}`}
                  >
                    <i aria-hidden="true" />
                    <em>{lane.label}</em>
                    <strong>{lane.value}</strong>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cockpit-attention-strip" aria-label="Attention strip">
        <div className="cockpit-attention-counters">
          {attentionCounters.map((item) => (
            <span
              className={`cockpit-attention-counter cockpit-attention-${item.state}`}
              key={item.label}
            >
              {item.label} <strong>{item.value}</strong>
            </span>
          ))}
        </div>
        <div className="cockpit-attention-chips">
          {attentionChips.length > 0 ? (
            attentionChips.map((item) => (
              <span
                className={`cockpit-attention-chip cockpit-attention-${item.state}`}
                key={`${item.label}-${item.title}`}
                title={item.title}
              >
                {item.label}
              </span>
            ))
          ) : (
            <span className="cockpit-attention-chip cockpit-attention-reported">CLEAR</span>
          )}
        </div>
      </section>
      </div>
    </section>
  );
}

function SeverityBar({
  label,
  value,
  max,
  state,
}: {
  label: string;
  value: number;
  max: number;
  state: CockpitSignalState;
}) {
  const width = max > 0 ? clampPercent((value / max) * 100) : 0;

  return (
    <div className={`cockpit-severity-row cockpit-severity-${state}`}>
      <span>{label}</span>
      <div aria-hidden="true">
        <i style={{ width: `${width}%` }} />
      </div>
      <strong>{value}</strong>
    </div>
  );
}

function GaugeRow({ gauge }: { gauge: GaugeModel }) {
  return (
    <div className="cockpit-gauge-row" title={gauge.title}>
      <span>{gauge.label}</span>
      <div aria-hidden="true">
        <i style={{ width: `${gauge.percent ?? 0}%` }} />
      </div>
      <strong>{gauge.value}</strong>
    </div>
  );
}

function RadarNode({
  label,
  value,
  active,
}: {
  label: string;
  value: number;
  active: boolean;
}) {
  return (
    <div className={`cockpit-radar-node ${active ? "cockpit-radar-node-active" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
