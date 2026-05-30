import type {
  CoreCoverageRecord,
  CoreCoverageSummary,
  CoreDashboardSummary,
  CoreEntityIndex,
  CoreLintReport,
  CoreModelSummary,
  CoreScenarioRunIndex,
  CoreSimulationReport,
  WorkspaceInspection,
} from "./types/workspace";

export interface CoreReportSnapshots {
  lintReport: CoreLintReport | null;
  modelSummary: CoreModelSummary | null;
  entityIndex: CoreEntityIndex | null;
  dashboardSummary: CoreDashboardSummary | null;
  scenarioRunIndex: CoreScenarioRunIndex | null;
  coverageSummary: CoreCoverageSummary | null;
  simulationReport: CoreSimulationReport | null;
}

export type MissionCockpitMetricState =
  | "core-reported"
  | "not-reported"
  | "unavailable";

export type MissionCockpitMetricKind =
  | "mission-health"
  | "model-completeness"
  | "lint-status"
  | "scenario-coverage"
  | "data-product-coverage"
  | "commandability-coverage";

export interface MissionCockpitMetric {
  kind: MissionCockpitMetricKind;
  label: string;
  value: string;
  detail: string;
  state: MissionCockpitMetricState;
  provenance: string;
  source: string;
}

export interface MissionCockpitPostureModel {
  metrics: MissionCockpitMetric[];
  counts: MissionCockpitPostureCounts;
  boundary: MissionCockpitPostureBoundary;
}

export interface MissionCockpitPostureCounts {
  coreReportedMetrics: number;
  notReportedMetrics: number;
  unavailableMetrics: number;
}

export interface MissionCockpitPostureBoundary {
  readOnly: true;
  coreDerivedOnly: true;
  privateHealthCalculation: false;
  privateCompletenessCalculation: false;
  privateCoverageCalculation: false;
  privateReadinessCalculation: false;
}

export function createMissionCockpitPostureModel({
  workspace,
  snapshots,
}: {
  workspace: WorkspaceInspection | null;
  snapshots: CoreReportSnapshots;
}): MissionCockpitPostureModel {
  const metrics = [
    createMissionHealthMetric(),
    createModelCompletenessMetric(),
    createLintStatusMetric(snapshots),
    createScenarioCoverageMetric(snapshots),
    createDataProductCoverageMetric(snapshots),
    createCommandabilityCoverageMetric(snapshots),
  ];

  return {
    metrics,
    counts: {
      coreReportedMetrics: metrics.filter((metric) => metric.state === "core-reported")
        .length,
      notReportedMetrics: metrics.filter((metric) => metric.state === "not-reported")
        .length,
      unavailableMetrics: metrics.filter((metric) => metric.state === "unavailable")
        .length,
    },
    boundary: {
      readOnly: true,
      coreDerivedOnly: true,
      privateHealthCalculation: false,
      privateCompletenessCalculation: false,
      privateCoverageCalculation: false,
      privateReadinessCalculation: false,
    },
  };
}

function createMissionHealthMetric(): MissionCockpitMetric {
  return {
    kind: "mission-health",
    label: "Mission Health",
    value: "Not reported",
    detail: "OrbitFabric Core does not expose a mission health score for this baseline.",
    state: "not-reported",
    provenance: "No private Studio health calculation",
    source: "Core output required",
  };
}

function createModelCompletenessMetric(): MissionCockpitMetric {
  return {
    kind: "model-completeness",
    label: "Model Completeness",
    value: "Not reported",
    detail:
      "OrbitFabric Core does not expose a model completeness score for this baseline.",
    state: "not-reported",
    provenance: "No private Studio completeness calculation",
    source: "Core output required",
  };
}

function createLintStatusMetric(snapshots: CoreReportSnapshots): MissionCockpitMetric {
  const dashboardValidation = snapshots.dashboardSummary?.validation ?? null;
  const result = snapshots.lintReport?.result ?? dashboardValidation?.result ?? null;
  const errors = snapshots.lintReport?.summary.errors ?? dashboardValidation?.errors ?? null;
  const warnings =
    snapshots.lintReport?.summary.warnings ?? dashboardValidation?.warnings ?? null;
  const info = snapshots.lintReport?.summary.info ?? dashboardValidation?.info ?? null;

  if (!result) {
    return {
      kind: "lint-status",
      label: "Lint Status",
      value: "Unavailable",
      detail: "Run or load Core lint or dashboard reports to populate lint status.",
      state: "unavailable",
      provenance: "No Core lint or dashboard validation output loaded",
      source: "Core lint report or dashboard summary",
    };
  }

  return {
    kind: "lint-status",
    label: "Lint Status",
    value: result.toUpperCase(),
    detail: `Errors ${errors ?? 0} · Warnings ${warnings ?? 0} · Info ${info ?? 0}`,
    state: "core-reported",
    provenance: snapshots.lintReport
      ? "Core lint report"
      : "Core dashboard validation summary",
    source: snapshots.lintReport ? "lint_report.json" : "dashboard_summary.json",
  };
}

function createScenarioCoverageMetric(
  snapshots: CoreReportSnapshots,
): MissionCockpitMetric {
  const scenarioRuns = snapshots.coverageSummary?.scenario_runs ?? null;

  if (!scenarioRuns) {
    return {
      kind: "scenario-coverage",
      label: "Scenario Coverage",
      value: "Not reported",
      detail:
        "Core coverage summary is required. Scenario run counts are not converted into coverage privately.",
      state: "not-reported",
      provenance: "No private Studio scenario coverage calculation",
      source: "coverage_summary.json required",
    };
  }

  return {
    kind: "scenario-coverage",
    label: "Scenario Coverage",
    value: `${scenarioRuns.passed}/${scenarioRuns.total} runs`,
    detail: `${scenarioRuns.failed} failed scenario runs reported by Core coverage summary.`,
    state: "core-reported",
    provenance: "Core coverage summary scenario run accounting",
    source: "coverage_summary.json",
  };
}

function createDataProductCoverageMetric(
  snapshots: CoreReportSnapshots,
): MissionCockpitMetric {
  const record = selectCoverageRecord(snapshots.coverageSummary?.entity_coverage, [
    "data-products",
    "data_products",
    "dataProducts",
    "data_products.yaml",
  ]);

  if (!record) {
    return {
      kind: "data-product-coverage",
      label: "Data Product Coverage",
      value: "Not reported",
      detail:
        "Core coverage summary does not report data product coverage for this baseline.",
      state: "not-reported",
      provenance: "No private Studio data product coverage calculation",
      source: "coverage_summary.json required",
    };
  }

  return {
    kind: "data-product-coverage",
    label: "Data Product Coverage",
    value: formatCoverageValue(record),
    detail: `${record.covered}/${record.total} data product records covered by Core evidence.`,
    state: "core-reported",
    provenance: "Core coverage summary entity coverage",
    source: "coverage_summary.json",
  };
}

function createCommandabilityCoverageMetric(
  snapshots: CoreReportSnapshots,
): MissionCockpitMetric {
  const record = selectCoverageRecord(snapshots.coverageSummary?.entity_coverage, [
    "commandability",
    "commands",
    "commandability.yaml",
    "commands.yaml",
  ]);

  if (!record) {
    return {
      kind: "commandability-coverage",
      label: "Commandability Coverage",
      value: "Not reported",
      detail:
        "Core coverage summary does not report commandability coverage for this baseline.",
      state: "not-reported",
      provenance: "No private Studio commandability coverage calculation",
      source: "coverage_summary.json required",
    };
  }

  return {
    kind: "commandability-coverage",
    label: "Commandability Coverage",
    value: formatCoverageValue(record),
    detail: `${record.covered}/${record.total} commandability records covered by Core evidence.`,
    state: "core-reported",
    provenance: "Core coverage summary entity coverage",
    source: "coverage_summary.json",
  };
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

function formatCoverageValue(record: CoreCoverageRecord): string {
  if (record.coverage_ratio === null) {
    return "Reported";
  }

  return `${Math.round(record.coverage_ratio * 100)}%`;
}

export function formatDashboardStatusLabel(value: string | null): string {
  return value ? value.toUpperCase() : "UNAVAILABLE";
}

export function dashboardTopEntries(
  records: Record<string, number>,
  limit = 4,
): [string, number][] {
  return Object.entries(records)
    .sort(([leftKey, leftValue], [rightKey, rightValue]) => {
      if (leftValue !== rightValue) {
        return rightValue - leftValue;
      }

      return leftKey.localeCompare(rightKey);
    })
    .slice(0, limit);
}

export function dashboardTopCoverageRecords(
  records: Record<
    string,
    {
      total: number;
      covered: number;
      uncovered: number;
      coverage_ratio: number | null;
    }
  >,
  limit = 4,
) {
  return Object.entries(records)
    .sort(([leftKey, leftValue], [rightKey, rightValue]) => {
      if (leftValue.total !== rightValue.total) {
        return rightValue.total - leftValue.total;
      }

      return leftKey.localeCompare(rightKey);
    })
    .slice(0, limit);
}
