import { PublicPreviewPlaceholder } from "./PublicPreviewPlaceholder";
import { GeneratedArtifactsSurface } from "./GeneratedArtifactsSurface";
import { CoreReportRunnerSurface } from "./CoreReportRunnerSurface";
import { MissionCockpit } from "./MissionCockpit";
import { MissionDataFlowWorkbenchRoute } from "./MissionDataFlowWorkbenchRoute";
import { ScenarioTimelineRunnerSurface, type ScenarioTimelineInspectorRecord } from "./ScenarioTimelineRunnerSurface";
import type {
  GeneratedArtifactDashboardSummary,
  GeneratedArtifactInspectorItem,
  GeneratedEvidenceArtifactSummary,
} from "./GeneratedArtifactExplorer";
import type { ActiveSurface, TargetDomainId } from "./navigationModel";
import { createMissionDataFlowWorkbenchSnapshot } from "./missionDataFlowWorkbenchModel";
import {
  modelInventoryDomainSurfaceComponents,
  publicPreviewModelNavigationIds,
  publicPreviewPlaceholderCopy,
} from "./studioSurfaceConfig";
import { upsertSimulationReport, type CoreReportSnapshots } from "./coreReportSnapshots";
import { formatNavigationLabel } from "./studioFormatters";
import {
  parseCoreCoverageSummary,
  parseCoreDashboardSummary,
  parseCoreEntityIndex,
  parseCoreLintReport,
  parseCoreModelSummary,
  parseCoreRelationshipManifest,
  parseCoreSimulationReport,
} from "./coreReports";
import type { DomainEntitySummary } from "./domainSurfaceModel";
import type {
  CoreCommandResult,
  FileContent,
  ProjectEntry,
  WorkspaceInspection,
} from "./types/workspace";

export interface StudioActiveSurfaceProps {
  workspace: WorkspaceInspection | null;
  activeSurface: ActiveSurface;
  activeNavigationId: TargetDomainId;
  isOpening: boolean;
  error: string | null;
  onOpenWorkspace: () => void | Promise<void>;
  onActiveSurfaceChange: (surface: ActiveSurface) => void;
  onPrimaryNavigationSelect: (
    surface: ActiveSurface,
    navigationId: TargetDomainId,
  ) => void;
  coreExecutable: string;
  coreResult: CoreCommandResult | null;
  coreReportSnapshots: CoreReportSnapshots;
  coreError: string | null;
  isRunningCoreCommand: boolean;
  onCoreExecutableChange: (value: string) => void;
  onCoreVersion: () => Promise<void>;
  onCoreInspectMission: () => Promise<void>;
  onCoreLintMission: () => Promise<void>;
  onCoreExportModelSummary: () => Promise<void>;
  onCoreExportEntityIndex: () => Promise<void>;
  onCoreExportRelationshipManifest: () => Promise<void>;
  onCoreExportDashboardSummary: () => Promise<void>;
  onCoreExportScenarioRunIndex: () => Promise<void>;
  onCoreExportCoverageSummary: () => Promise<void>;
  onRunScenario: (entry: ProjectEntry) => void | Promise<void>;
  selectedFile: FileContent | null;
  selectedCoreDomainEntity: DomainEntitySummary | null;
  onOpenFile: (entry: ProjectEntry) => void;
  onSelectSimulationRecord: (record: ScenarioTimelineInspectorRecord) => void;
  onSelectCoreDomainEntity: (entity: DomainEntitySummary) => void;
  generatedArtifactSummary: GeneratedArtifactDashboardSummary | null;
  generatedEvidenceArtifactSummary: GeneratedEvidenceArtifactSummary | null;
  generatedArtifactRefreshToken: number;
  onGeneratedArtifactSummaryChange: (
    summary: GeneratedArtifactDashboardSummary | null,
  ) => void;
  onGeneratedArtifactSelectionChange: (
    artifact: GeneratedArtifactInspectorItem | null,
  ) => void;
  onGeneratedEvidenceArtifactSummaryChange: (
    summary: GeneratedEvidenceArtifactSummary | null,
  ) => void;
}

export function StudioActiveSurface({
  workspace,
  activeSurface,
  activeNavigationId,
  isOpening,
  error,
  onOpenWorkspace,
  onActiveSurfaceChange,
  onPrimaryNavigationSelect,
  coreExecutable,
  coreResult,
  coreReportSnapshots,
  coreError,
  isRunningCoreCommand,
  onCoreExecutableChange,
  onCoreVersion,
  onCoreInspectMission,
  onCoreLintMission,
  onCoreExportModelSummary,
  onCoreExportEntityIndex,
  onCoreExportRelationshipManifest,
  onCoreExportDashboardSummary,
  onCoreExportScenarioRunIndex,
  onCoreExportCoverageSummary,
  onRunScenario,
  selectedFile,
  selectedCoreDomainEntity,
  onOpenFile,
  onSelectSimulationRecord,
  onSelectCoreDomainEntity,
  generatedArtifactSummary,
  generatedEvidenceArtifactSummary,
  generatedArtifactRefreshToken,
  onGeneratedArtifactSummaryChange,
  onGeneratedArtifactSelectionChange,
  onGeneratedEvidenceArtifactSummaryChange,
}: StudioActiveSurfaceProps) {
  const coreReportContent = coreResult?.json_report_content ?? null;
  const coreSimulationReport = parseCoreSimulationReport(coreReportContent);
  const selectedFileSimulationReport = parseCoreSimulationReport(
    selectedFile?.content ?? null,
  );
  const simulationReport =
    selectedFileSimulationReport ??
    coreSimulationReport ??
    coreReportSnapshots.simulationReport;
  const simulationReportSource = selectedFileSimulationReport
    ? "selected file preview"
    : coreSimulationReport
      ? "Core command output"
      : coreReportSnapshots.simulationReport
        ? "latest Core simulation report snapshot"
        : null;
  const simulationReports = simulationReport
    ? upsertSimulationReport(coreReportSnapshots.simulationReports, simulationReport)
    : coreReportSnapshots.simulationReports;
  const coreModelSummary = parseCoreModelSummary(coreReportContent);
  const coreEntityIndex = parseCoreEntityIndex(coreReportContent);
  const coreRelationshipManifest = parseCoreRelationshipManifest(coreReportContent);
  const coreDashboardSummary = parseCoreDashboardSummary(coreReportContent);
  const coreLintReport = parseCoreLintReport(coreReportContent);
  const coreCoverageSummary = parseCoreCoverageSummary(coreReportContent);
  const modelSummary = coreModelSummary ?? coreReportSnapshots.modelSummary;
  const entityIndex = coreEntityIndex ?? coreReportSnapshots.entityIndex;
  const relationshipManifest =
    coreRelationshipManifest ?? coreReportSnapshots.relationshipManifest;
  const dashboardSummary = coreDashboardSummary ?? coreReportSnapshots.dashboardSummary;
  const lintReport = coreLintReport ?? coreReportSnapshots.lintReport;
  const coverageSummary = coreCoverageSummary ?? coreReportSnapshots.coverageSummary;
  const missionDataFlowWorkbenchSnapshot = createMissionDataFlowWorkbenchSnapshot({
    modelSummary,
    entityIndex,
    relationshipManifest,
    dashboardSummary,
    lintReport,
    scenarioRunIndex: coreReportSnapshots.scenarioRunIndex,
    simulationReport,
    simulationReports,
    coverageSummary,
    generatedArtifactInventory: null,
  });

  if (!workspace) {
    return (
      <>
        <section
          id="studio-overview"
          className="hero-panel cockpit-empty-panel"
          aria-labelledby="studio-title"
        >
          <div className="cockpit-empty-console">
            <div className="cockpit-empty-mark" aria-hidden="true">OF</div>
            <div>
              <h1 id="studio-title">OrbitFabric Studio</h1>
              <div className="cockpit-empty-led-row" aria-label="Initial cockpit state">
                <span>
                  <strong>Workspace</strong>
                  <em>Not opened</em>
                </span>
                <span>
                  <strong>Mission</strong>
                  <em>Not loaded</em>
                </span>
                <span>
                  <strong>Core Evidence</strong>
                  <em>Not loaded</em>
                </span>
                <span>
                  <strong>Model Status</strong>
                  <em>Not reported</em>
                </span>
              </div>
            </div>
            <button
              className="primary-action"
              type="button"
              onClick={onOpenWorkspace}
              disabled={isOpening}
            >
              {isOpening ? "Opening" : "Open workspace"}
            </button>
          </div>
          {error ? <p className="error-text">{error}</p> : null}
        </section>
      </>
    );
  }

  if (activeSurface === "mission-dashboard") {
    return (
      <MissionCockpit
        workspace={workspace}
        coreResult={coreResult}
        coreReportSnapshots={coreReportSnapshots}
        generatedArtifactSummary={generatedArtifactSummary}
        onNavigate={(surface, navigationId) => {
          if (navigationId) {
            onPrimaryNavigationSelect(surface, navigationId);
            return;
          }

          onActiveSurfaceChange(surface);
        }}
      />
    );
  }

  if (activeSurface === "mission-data-flow-workbench") {
    return (
      <MissionDataFlowWorkbenchRoute
        snapshot={missionDataFlowWorkbenchSnapshot}
      />
    );
  }

  if (activeSurface === "scenario-evidence") {
    return (
      <ScenarioTimelineRunnerSurface
        workspace={workspace}
        generatedEvidenceArtifactSummary={generatedEvidenceArtifactSummary}
        coreResult={coreResult}
        simulationReport={simulationReport}
        simulationReportSource={simulationReportSource}
        isRunningCoreCommand={isRunningCoreCommand}
        onOpenFile={onOpenFile}
        onRunScenario={onRunScenario}
        onSelectSimulationRecord={(record: ScenarioTimelineInspectorRecord) =>
          onSelectSimulationRecord(record)
        }
      />
    );
  }

  if (activeSurface === "ground-integration") {
    return (
      <PublicPreviewPlaceholder
        {...publicPreviewPlaceholderCopy["ground-integration"]!}
      />
    );
  }

  if (activeSurface === "model-inventory") {
    if (!publicPreviewModelNavigationIds.has(activeNavigationId)) {
      return (
        <PublicPreviewPlaceholder
          title={`${formatNavigationLabel(activeNavigationId)} surface in redesign`}
          summary="This domain inspection surface is temporarily gated for the Mission Content First public preview. Core data remains authoritative; Studio will not infer missing contract state or expose transitional UI."
        />
      );
    }

    const DomainSurfaceComponent =
      modelInventoryDomainSurfaceComponents[activeNavigationId];

    if (DomainSurfaceComponent) {
      return (
        <DomainSurfaceComponent
          workspace={workspace}
          modelSummary={modelSummary}
          entityIndex={entityIndex}
          selectedEntity={selectedCoreDomainEntity}
          onSelectEntity={onSelectCoreDomainEntity}
          onOpenFile={onOpenFile}
        />
      );
    }

    return (
      <PublicPreviewPlaceholder
        title="Domain surface in redesign"
        summary="This domain surface is not exposed in the current public preview."
      />
    );
  }

  if (activeSurface === "core-commands") {
    return (
      <CoreReportRunnerSurface
        workspace={workspace}
        coreExecutable={coreExecutable}
        coreResult={coreResult}
        coreError={coreError}
        isRunningCoreCommand={isRunningCoreCommand}
        reports={{
          lintReport,
          modelSummary,
          entityIndex,
          relationshipManifest,
          dashboardSummary,
          scenarioRunIndex: coreReportSnapshots.scenarioRunIndex,
          coverageSummary,
          simulationReports,
        }}
        onCoreExecutableChange={onCoreExecutableChange}
        onCoreVersion={onCoreVersion}
        onCoreInspectMission={onCoreInspectMission}
        onCoreLintMission={onCoreLintMission}
        onCoreExportModelSummary={onCoreExportModelSummary}
        onCoreExportEntityIndex={onCoreExportEntityIndex}
        onCoreExportRelationshipManifest={onCoreExportRelationshipManifest}
        onCoreExportDashboardSummary={onCoreExportDashboardSummary}
        onCoreExportScenarioRunIndex={onCoreExportScenarioRunIndex}
        onCoreExportCoverageSummary={onCoreExportCoverageSummary}
        onOpenFile={onOpenFile}
      />
    );
  }

  if (activeSurface === "contracts") {
    return <PublicPreviewPlaceholder {...publicPreviewPlaceholderCopy.contracts!} />;
  }

  if (activeSurface === "relationships") {
    return <PublicPreviewPlaceholder {...publicPreviewPlaceholderCopy.relationships!} />;
  }

  if (activeSurface === "generated-artifacts") {
    return (
      <GeneratedArtifactsSurface
        workspace={workspace}
        refreshToken={generatedArtifactRefreshToken}
        onDashboardSummaryChange={onGeneratedArtifactSummaryChange}
        onArtifactSelectionChange={onGeneratedArtifactSelectionChange}
        onEvidenceArtifactSummaryChange={onGeneratedEvidenceArtifactSummaryChange}
      />
    );
  }

  if (activeSurface === "reports-logs") {
    return <PublicPreviewPlaceholder {...publicPreviewPlaceholderCopy["reports-logs"]!} />;
  }

  if (activeSurface === "raw-output") {
    return <PublicPreviewPlaceholder {...publicPreviewPlaceholderCopy["raw-output"]!} />;
  }

  return null;
}
