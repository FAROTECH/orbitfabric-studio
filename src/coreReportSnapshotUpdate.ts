import {
  type CoreReportSnapshots,
  upsertSimulationReport,
} from "./coreReportSnapshots";
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

export type CoreReportSnapshotsUpdater = (
  current: CoreReportSnapshots,
) => CoreReportSnapshots;

export function createCoreReportSnapshotsUpdater(
  reportContent: string | null,
): CoreReportSnapshotsUpdater | null {
  if (!reportContent) {
    return null;
  }

  const lintReport = parseCoreLintReport(reportContent);
  const modelSummary = parseCoreModelSummary(reportContent);
  const entityIndex = parseCoreEntityIndex(reportContent);
  const relationshipManifest = parseCoreRelationshipManifest(reportContent);
  const dashboardSummary = parseCoreDashboardSummary(reportContent);
  const scenarioRunIndex = parseCoreScenarioRunIndex(reportContent);
  const coverageSummary = parseCoreCoverageSummary(reportContent);
  const simulationReport = parseCoreSimulationReport(reportContent);

  if (
    !lintReport &&
    !modelSummary &&
    !entityIndex &&
    !relationshipManifest &&
    !dashboardSummary &&
    !scenarioRunIndex &&
    !coverageSummary &&
    !simulationReport
  ) {
    return null;
  }

  return (current) => ({
    lintReport: lintReport ?? current.lintReport,
    modelSummary: modelSummary ?? current.modelSummary,
    entityIndex: entityIndex ?? current.entityIndex,
    relationshipManifest: relationshipManifest ?? current.relationshipManifest,
    dashboardSummary: dashboardSummary ?? current.dashboardSummary,
    scenarioRunIndex: scenarioRunIndex ?? current.scenarioRunIndex,
    coverageSummary: coverageSummary ?? current.coverageSummary,
    simulationReport: simulationReport ?? current.simulationReport,
    simulationReports: simulationReport
      ? upsertSimulationReport(current.simulationReports, simulationReport)
      : current.simulationReports,
  });
}
