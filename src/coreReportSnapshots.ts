import type {
  CoreCoverageSummary,
  CoreDashboardSummary,
  CoreEntityIndex,
  CoreLintReport,
  CoreModelSummary,
  CoreRelationshipManifest,
  CoreScenarioRunIndex,
  CoreSimulationReport,
} from "./types/workspace";

export interface CoreReportSnapshots {
  lintReport: CoreLintReport | null;
  modelSummary: CoreModelSummary | null;
  entityIndex: CoreEntityIndex | null;
  relationshipManifest: CoreRelationshipManifest | null;
  dashboardSummary: CoreDashboardSummary | null;
  scenarioRunIndex: CoreScenarioRunIndex | null;
  coverageSummary: CoreCoverageSummary | null;
  simulationReport: CoreSimulationReport | null;
  simulationReports: CoreSimulationReport[];
}

export function createEmptyCoreReportSnapshots(): CoreReportSnapshots {
  return {
    lintReport: null,
    modelSummary: null,
    entityIndex: null,
    relationshipManifest: null,
    dashboardSummary: null,
    scenarioRunIndex: null,
    coverageSummary: null,
    simulationReport: null,
    simulationReports: [],
  };
}

export function upsertSimulationReport(
  reports: CoreSimulationReport[],
  report: CoreSimulationReport,
): CoreSimulationReport[] {
  const nextReports = reports.filter((candidate) => candidate.scenario !== report.scenario);

  return [...nextReports, report];
}
