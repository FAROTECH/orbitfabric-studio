import type {
  CoreCoverageSummary,
  CoreDashboardSummary,
  CoreLintReport,
  CoreScenarioRunIndex,
  CoreSimulationReport,
} from "./types/workspace";

export interface CoreReportSnapshots {
  lintReport: CoreLintReport | null;
  dashboardSummary: CoreDashboardSummary | null;
  scenarioRunIndex: CoreScenarioRunIndex | null;
  coverageSummary: CoreCoverageSummary | null;
  simulationReport: CoreSimulationReport | null;
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
