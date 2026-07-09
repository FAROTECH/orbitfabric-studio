import { type ComponentType, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

import { CoverageSummaryPanel } from "./CoverageSummaryPanel";
import { PublicPreviewPlaceholder } from "./PublicPreviewPlaceholder";
import { FileViewer } from "./FileViewer";
import { EntrySection } from "./EntrySection";
import { MissingFiles } from "./MissingFiles";
import { DashboardSummaryPanel } from "./DashboardSummaryPanel";
import {
  InspectorPanel,
  type SimulationInspectorRecord,
  type StudioDetailSelection,
} from "./InspectorPanel";
import { ScenarioRunIndexPanel } from "./ScenarioRunIndexPanel";
import {
  GeneratedArtifactExplorerPanel,
  type GeneratedArtifactDashboardSummary,
  type GeneratedArtifactInspectorItem,
  type GeneratedEvidenceArtifactSummary,
} from "./GeneratedArtifactExplorer";
import { GeneratedArtifactsSurface } from "./GeneratedArtifactsSurface";
import { CoreReportRunnerSurface } from "./CoreReportRunnerSurface";
import { MissionCockpit } from "./MissionCockpit";
import { MissionDataFlowWorkbenchRoute } from "./MissionDataFlowWorkbenchRoute";
import { SpacecraftDomainSurface } from "./SpacecraftDomainSurface";
import { SubsystemsDomainSurface } from "./SubsystemsDomainSurface";
import { ModesDomainSurface } from "./ModesDomainSurface";
import { TelemetryDomainSurface } from "./TelemetryDomainSurface";
import { CommandsDomainSurface } from "./CommandsDomainSurface";
import { EventsDomainSurface } from "./EventsDomainSurface";
import { FaultsDomainSurface } from "./FaultsDomainSurface";
import { PacketsDomainSurface } from "./PacketsDomainSurface";
import { PayloadsDomainSurface } from "./PayloadsDomainSurface";
import { DataProductsDomainSurface } from "./DataProductsDomainSurface";
import { ContactsDownlinkDomainSurface } from "./ContactsDownlinkDomainSurface";
import { CommandabilityDomainSurface } from "./CommandabilityDomainSurface";
import { AutonomyReservedSurface } from "./AutonomyReservedSurface";
import { ShellStatusBar } from "./ShellStatusBar";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { PrimarySidebar } from "./PrimarySidebar";
import { ProvenanceBadge, SeverityBadge, StatusBadge } from "./Badges";
import {
  type ActiveSurface,
  type TargetDomainId,
} from "./navigationModel";
import type { DomainEntitySummary } from "./domainSurfaceModel";
import { createMissionDataFlowWorkbenchSnapshot } from "./missionDataFlowWorkbenchModel";
import { hydrateGeneratedReportsFromWorkspace } from "./generatedReportHydration";
import {
  ScenarioTimelineRunnerSurface,
  type ScenarioTimelineInspectorRecord,
} from "./ScenarioTimelineRunnerSurface";

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
  CoreCoverageSummary,
  CoreDashboardSummary,
  CoreEntityIndex,
  CoreEntityIndexDomain,
  CoreEntityIndexEntity,
  CoreLintFinding,
  CoreLintReport,
  CoreModelSummary,
  CoreModelSummaryDomain,
  CoreRelationshipManifest,
  CoreRelationshipRecord,
  CoreRelationshipType,
  CoreSimulationReport,
  CoreScenarioRunIndex,
  FileContent,
  ProjectEntry,
  WorkspaceInspection,
} from "./types/workspace";


interface CoreReportSnapshots {
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

interface CoreDomainSurfaceComponentProps {
  workspace: WorkspaceInspection;
  modelSummary: CoreModelSummary | null;
  entityIndex: CoreEntityIndex | null;
  selectedEntity: DomainEntitySummary | null;
  onSelectEntity: (entity: DomainEntitySummary) => void;
  onOpenFile: (entry: ProjectEntry) => void;
}

const modelInventoryDomainSurfaceComponents: Partial<
  Record<TargetDomainId, ComponentType<CoreDomainSurfaceComponentProps>>
> = {
  spacecraft: SpacecraftDomainSurface,
  subsystems: SubsystemsDomainSurface,
  modes: ModesDomainSurface,
  telemetry: TelemetryDomainSurface,
  commands: CommandsDomainSurface,
  events: EventsDomainSurface,
  faults: FaultsDomainSurface,
  packets: PacketsDomainSurface,
  payloads: PayloadsDomainSurface,
  autonomy: AutonomyReservedSurface,
  "data-products": DataProductsDomainSurface,
  "contacts-downlink": ContactsDownlinkDomainSurface,
  commandability: CommandabilityDomainSurface,
};


const defaultNavigationIdBySurface: Record<ActiveSurface, TargetDomainId> = {
  "mission-dashboard": "mission",
  "mission-data-flow-workbench": "data-flow-workbench",
  "model-inventory": "data-products",
  "core-commands": "core-report-runner",
  contracts: "data-products",
  relationships: "data-products",
  "generated-artifacts": "generated-artifacts",
  "reports-logs": "generated-artifacts",
  "scenario-evidence": "scenarios",
  "ground-integration": "generated-artifacts",
  "raw-output": "core-report-runner",
};

const publicPreviewModelNavigationIds: ReadonlySet<TargetDomainId> = new Set([
  "data-products",
]);

const publicPreviewPlaceholderCopy: Partial<Record<ActiveSurface, { title: string; summary: string }>> = {
  contracts: {
    title: "Contracts surface in redesign",
    summary:
      "Contract inspection remains read-only, but this surface is temporarily gated while it is realigned with the Mission Content First cockpit direction.",
  },
  relationships: {
    title: "Relationships surface in redesign",
    summary:
      "Relationship evidence is available through Data Flow Workbench for this public preview. The legacy relationship surface is gated to avoid exposing transitional UI.",
  },
  "reports-logs": {
    title: "Reports and logs surface in redesign",
    summary:
      "Core reports are inspected through Core Report Runner and the dedicated cockpit surfaces. The legacy reports/logs surface is not exposed in this public preview.",
  },
  "ground-integration": {
    title: "Ground integration viewer in redesign",
    summary:
      "Generated ground-facing artifacts remain read-only, but this viewer is gated until it matches the public preview cockpit standard.",
  },
  "raw-output": {
    title: "Raw Core output moved to Core Report Runner",
    summary:
      "Raw process output is now surfaced inside Core Report Runner, next to the fixed Core action that produced it.",
  },
};

function createEmptyCoreReportSnapshots(): CoreReportSnapshots {
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

function App() {
  const [workspace, setWorkspace] = useState<WorkspaceInspection | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [coreExecutable, setCoreExecutable] = useState("orbitfabric");
  const [coreResult, setCoreResult] = useState<CoreCommandResult | null>(null);
  const [coreReportSnapshots, setCoreReportSnapshots] =
    useState<CoreReportSnapshots>(() => createEmptyCoreReportSnapshots());
  const [generatedArtifactSummary, setGeneratedArtifactSummary] =
    useState<GeneratedArtifactDashboardSummary | null>(null);
  const [selectedGeneratedArtifact, setSelectedGeneratedArtifact] =
    useState<GeneratedArtifactInspectorItem | null>(null);
  const [generatedEvidenceArtifactSummary, setGeneratedEvidenceArtifactSummary] =
    useState<GeneratedEvidenceArtifactSummary | null>(null);
  const [generatedArtifactRefreshToken, setGeneratedArtifactRefreshToken] =
    useState(0);
  const [selectedSimulationRecord, setSelectedSimulationRecord] =
    useState<SimulationInspectorRecord | null>(null);
  const [selectedCoreDomainEntity, setSelectedCoreDomainEntity] =
    useState<DomainEntitySummary | null>(null);
  const [activeSurface, setActiveSurface] =
    useState<ActiveSurface>("mission-dashboard");
  const [activeNavigationId, setActiveNavigationId] =
    useState<TargetDomainId>("mission");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedDetail, setSelectedDetail] =
    useState<StudioDetailSelection | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [coreError, setCoreError] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isRunningCoreCommand, setIsRunningCoreCommand] = useState(false);

  const mainContentRef = useRef<HTMLElement | null>(null);
  const surfaceContentRef = useRef<HTMLElement | null>(null);

  function resetMainContentScroll() {
    requestAnimationFrame(() => {
      surfaceContentRef.current?.scrollTo({ top: 0, left: 0 });
      mainContentRef.current?.scrollTo({ top: 0, left: 0 });
      document.documentElement.scrollTo({ top: 0, left: 0 });
      document.body.scrollTo({ top: 0, left: 0 });
    });
  }

  useEffect(() => {
    resetMainContentScroll();
  }, [activeSurface, activeNavigationId]);

  function clearSelectedContext() {
    setSelectedFile(null);
    setSelectedGeneratedArtifact(null);
    setSelectedSimulationRecord(null);
    setSelectedCoreDomainEntity(null);
    setSelectedDetail(null);
  }

  async function handleOpenWorkspace() {
    setError(null);
    setViewerError(null);
    setCoreError(null);
    setSelectedFile(null);
    setCoreResult(null);
    setCoreReportSnapshots(createEmptyCoreReportSnapshots());
    setGeneratedArtifactSummary(null);
    setSelectedGeneratedArtifact(null);
    setGeneratedEvidenceArtifactSummary(null);
    setGeneratedArtifactRefreshToken(0);
    setSelectedSimulationRecord(null);
    setSelectedCoreDomainEntity(null);
    setActiveSurface("mission-dashboard");
    setActiveNavigationId("mission");
    setSelectedDetail(null);
    setIsOpening(true);

    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Open OrbitFabric mission workspace",
      });

      if (typeof selected !== "string") {
        return;
      }

      const inspection = await invoke<WorkspaceInspection>("inspect_workspace", {
        path: selected,
      });
      const generatedHydration = await hydrateGeneratedReportsFromWorkspace(
        inspection.selected_path,
      );

      setWorkspace(inspection);
      setCoreReportSnapshots(generatedHydration.coreReportSnapshots);
      setSelectedDetail({
        kind: "workspace",
        title: "Workspace inspection",
        source: inspection.selected_path,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsOpening(false);
    }
  }

  async function handleOpenFile(entry: ProjectEntry) {
    if (!workspace || entry.kind !== "file") {
      return;
    }

    setViewerError(null);
    setSelectedGeneratedArtifact(null);
    setSelectedSimulationRecord(null);
    setSelectedCoreDomainEntity(null);
    setIsReadingFile(true);

    try {
      const file = await invoke<FileContent>("read_text_file", {
        workspacePath: workspace.selected_path,
        filePath: entry.path,
      });

      setSelectedFile(file);
      setSelectedDetail({
        kind: "source-file",
        title: file.name,
        source: file.path,
      });
    } catch (caught) {
      setViewerError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsReadingFile(false);
    }
  }

  function handleGeneratedArtifactSelectionChange(
    artifact: GeneratedArtifactInspectorItem | null,
  ) {
    setSelectedGeneratedArtifact(artifact);
    setSelectedSimulationRecord(null);
    setSelectedCoreDomainEntity(null);
    setSelectedDetail(
      artifact
        ? {
            kind: "generated-artifact",
            title: artifact.name,
            source: artifact.relativePath,
          }
        : null,
    );
  }

  function handleSelectSimulationRecord(record: SimulationInspectorRecord) {
    setSelectedSimulationRecord(record);
    setSelectedGeneratedArtifact(null);
    setSelectedCoreDomainEntity(null);
    setSelectedDetail({
      kind: "simulation-record",
      title: record.title,
      source: record.kind,
    });
  }

  function handleSelectCoreDomainEntity(entity: DomainEntitySummary) {
    setSelectedCoreDomainEntity(entity);
    setSelectedGeneratedArtifact(null);
    setSelectedSimulationRecord(null);
    setSelectedDetail({
      kind: "core-entity",
      title: entity.displayName || entity.id,
      source: "Core entity_index.json",
    });
  }

  function handleActiveSurfaceChange(surface: ActiveSurface) {
    clearSelectedContext();
    setActiveSurface(surface);
    setActiveNavigationId(defaultNavigationIdBySurface[surface]);
    resetMainContentScroll();
  }

  function handlePrimaryNavigationSelect(
    surface: ActiveSurface,
    navigationId: TargetDomainId,
  ) {
    clearSelectedContext();
    setActiveSurface(surface);
    setActiveNavigationId(navigationId);
    resetMainContentScroll();
  }

  async function handleCoreVersion() {
    await runCoreCommand("run_core_version", { executable: coreExecutable });
  }

  async function handleCoreInspectMission() {
    if (!workspace?.mission_dir) {
      setCoreError("No mission directory is available for Core inspection.");
      return;
    }

    await runCoreCommand("run_core_inspect_mission", {
      executable: coreExecutable,
      missionDir: workspace.mission_dir,
    });
  }

  async function handleCoreLintMission() {
    if (!workspace?.mission_dir) {
      setCoreError("No mission directory is available for Core lint.");
      return;
    }

    await runCoreCommand("run_core_lint_mission", {
      executable: coreExecutable,
      missionDir: workspace.mission_dir,
    });
  }

  async function handleCoreExportModelSummary() {
    if (!workspace?.mission_dir) {
      setCoreError("No mission directory is available for Core model summary export.");
      return;
    }

    await runCoreCommand("run_core_export_model_summary", {
      executable: coreExecutable,
      missionDir: workspace.mission_dir,
    });
  }

  async function handleCoreExportEntityIndex() {
    if (!workspace?.mission_dir) {
      setCoreError("No mission directory is available for Core entity index export.");
      return;
    }

    await runCoreCommand("run_core_export_entity_index", {
      executable: coreExecutable,
      missionDir: workspace.mission_dir,
    });
  }

  async function handleCoreExportRelationshipManifest() {
    if (!workspace?.mission_dir) {
      setCoreError("No mission directory is available for Core relationship manifest export.");
      return;
    }

    await runCoreCommand("run_core_export_relationship_manifest", {
      executable: coreExecutable,
      missionDir: workspace.mission_dir,
    });
  }

  async function handleCoreExportDashboardSummary() {
    if (!workspace?.mission_dir) {
      setCoreError("No mission directory is available for Core dashboard summary export.");
      return;
    }

    const result = await runCoreCommand("run_core_export_dashboard_summary", {
      executable: coreExecutable,
      missionDir: workspace.mission_dir,
    });

    if (result?.json_report_available) {
      setGeneratedArtifactRefreshToken((current) => current + 1);
    }
  }

  async function handleCoreExportScenarioRunIndex() {
    if (!workspace) {
      setCoreError("No workspace is available for Core scenario run index export.");
      return;
    }

    const result = await runCoreCommand("run_core_export_scenario_run_index", {
      executable: coreExecutable,
      workspacePath: workspace.selected_path,
    });

    if (result?.json_report_available) {
      setGeneratedArtifactRefreshToken((current) => current + 1);
    }
  }

  async function handleCoreExportCoverageSummary() {
    if (!workspace?.mission_dir) {
      setCoreError("No mission directory is available for Core coverage summary export.");
      return;
    }

    const result = await runCoreCommand("run_core_export_coverage_summary", {
      executable: coreExecutable,
      missionDir: workspace.mission_dir,
    });

    if (result?.json_report_available) {
      setGeneratedArtifactRefreshToken((current) => current + 1);
    }
  }

  async function handleCoreSimScenario(scenario: ProjectEntry) {
    if (!workspace) {
      setCoreError("No workspace is available for Core scenario execution.");
      return;
    }

    if (scenario.kind !== "file") {
      setCoreError("Only scenario source files can be executed through Core.");
      return;
    }

    setSelectedSimulationRecord(null);

    const result = await runCoreCommand("run_core_sim_scenario", {
      executable: coreExecutable,
      workspacePath: workspace.selected_path,
      scenarioFile: scenario.path,
    });

    if (result?.json_report_available) {
      setGeneratedArtifactRefreshToken((current) => current + 1);
    }
  }

  async function runCoreCommand(
    commandName: string,
    payload: Record<string, string>,
  ): Promise<CoreCommandResult | null> {
    setCoreError(null);
    setCoreResult(null);
    setIsRunningCoreCommand(true);

    try {
      const result = await invoke<CoreCommandResult>(commandName, payload);
      setCoreResult(result);
      setSelectedDetail({
        kind: "core-output",
        title: result.command,
        source: result.args.join(" ") || "fixed Core command",
      });
      updateCoreReportSnapshots(result);
      return result;
    } catch (caught) {
      setCoreError(caught instanceof Error ? caught.message : String(caught));
      return null;
    } finally {
      setIsRunningCoreCommand(false);
    }
  }

  function updateCoreReportSnapshots(result: CoreCommandResult) {
    const reportContent = result.json_report_content ?? null;

    if (!reportContent) {
      return;
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
      return;
    }

    setCoreReportSnapshots((current) => ({
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
    }));
  }

  function upsertSimulationReport(
    reports: CoreSimulationReport[],
    report: CoreSimulationReport,
  ): CoreSimulationReport[] {
    const nextReports = reports.filter((candidate) => candidate.scenario !== report.scenario);

    return [...nextReports, report];
  }

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
  const hasCoreModelSummary = Boolean(modelSummary);
  const hasCoreEntityIndex = Boolean(entityIndex);
  const hasCoreRelationshipManifest = Boolean(relationshipManifest);

  const surfaceAvailability: Record<ActiveSurface, boolean> = {
    "mission-dashboard": true,
    "mission-data-flow-workbench": Boolean(workspace),
    "model-inventory": Boolean(workspace && workspace.source_model_files.length > 0),
    "core-commands": Boolean(workspace),
    contracts: false,
    relationships: false,
    "generated-artifacts": Boolean(workspace),
    "reports-logs": false,
    "scenario-evidence": Boolean(workspace),
    "ground-integration": false,
    "raw-output": false,
  };

  function renderLegacyWorkspaceSurface(surfaceLabel: string) {
    if (!workspace) {
      return <EmptyState />;
    }

    return (
      <section className="active-surface-frame" aria-label={surfaceLabel}>
        <div className="file-viewer-header">
          <div>
            <h2>{surfaceLabel}</h2>
            <p>
              Reserved diagnostic surface for the public baseline. Core-derived
              inspection remains available without exposing legacy cockpit pivot
              wording.
            </p>
          </div>
          <div className="badge-row">
            <ProvenanceBadge label="READ-ONLY" />
            <StatusBadge label="DIAGNOSTIC" />
          </div>
        </div>

        <WorkspacePanel
          workspace={workspace}
          selectedFile={selectedFile}
          viewerError={viewerError}
          isReadingFile={isReadingFile}
          coreExecutable={coreExecutable}
          coreResult={coreResult}
          coreError={coreError}
          isRunningCoreCommand={isRunningCoreCommand}
          onCoreExecutableChange={setCoreExecutable}
          onCoreVersion={handleCoreVersion}
          onCoreInspectMission={handleCoreInspectMission}
          onCoreLintMission={handleCoreLintMission}
          onCoreExportModelSummary={handleCoreExportModelSummary}
          onCoreExportEntityIndex={handleCoreExportEntityIndex}
          onCoreExportRelationshipManifest={handleCoreExportRelationshipManifest}
          onCoreExportDashboardSummary={handleCoreExportDashboardSummary}
          onCoreExportScenarioRunIndex={handleCoreExportScenarioRunIndex}
          onCoreExportCoverageSummary={handleCoreExportCoverageSummary}
          generatedArtifactRefreshToken={generatedArtifactRefreshToken}
          onGeneratedArtifactSummaryChange={setGeneratedArtifactSummary}
          onGeneratedArtifactSelectionChange={handleGeneratedArtifactSelectionChange}
          onGeneratedEvidenceArtifactSummaryChange={setGeneratedEvidenceArtifactSummary}
          onOpenFile={handleOpenFile}
        />
      </section>
    );
  }

  function renderActiveSurface() {
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
                onClick={handleOpenWorkspace}
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
              handlePrimaryNavigationSelect(surface, navigationId);
              return;
            }

            handleActiveSurfaceChange(surface);
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
          onOpenFile={handleOpenFile}
          onRunScenario={handleCoreSimScenario}
          onSelectSimulationRecord={(record: ScenarioTimelineInspectorRecord) =>
            handleSelectSimulationRecord(record)
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
            onSelectEntity={handleSelectCoreDomainEntity}
            onOpenFile={handleOpenFile}
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
          onCoreExecutableChange={setCoreExecutable}
          onCoreVersion={handleCoreVersion}
          onCoreInspectMission={handleCoreInspectMission}
          onCoreLintMission={handleCoreLintMission}
          onCoreExportModelSummary={handleCoreExportModelSummary}
          onCoreExportEntityIndex={handleCoreExportEntityIndex}
          onCoreExportRelationshipManifest={handleCoreExportRelationshipManifest}
          onCoreExportDashboardSummary={handleCoreExportDashboardSummary}
          onCoreExportScenarioRunIndex={handleCoreExportScenarioRunIndex}
          onCoreExportCoverageSummary={handleCoreExportCoverageSummary}
          onOpenFile={handleOpenFile}
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
          onDashboardSummaryChange={setGeneratedArtifactSummary}
          onArtifactSelectionChange={handleGeneratedArtifactSelectionChange}
          onEvidenceArtifactSummaryChange={setGeneratedEvidenceArtifactSummary}
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

  return (
     <main ref={mainContentRef} className="studio-app-shell">
      <WorkspaceHeader
        workspace={workspace}
        activeSurface={activeSurface}
        isOpening={isOpening}
        onOpenWorkspace={handleOpenWorkspace}
        onActiveSurfaceChange={handleActiveSurfaceChange}
      />

      <div
        className={[
          "workbench-layout",
          activeSurface === "mission-dashboard" ? "workbench-layout-dashboard" : "",
          activeSurface === "scenario-evidence" ? "workbench-layout-scenario-evidence" : "",
          activeSurface === "core-commands" ? "workbench-layout-core-report-runner" : "",
          activeSurface === "generated-artifacts" ? "workbench-layout-generated-artifacts" : "",
          activeSurface === "mission-data-flow-workbench" ? "workbench-layout-data-flow-workbench" : "",
          activeSurface === "model-inventory" && activeNavigationId === "data-products" ? "workbench-layout-data-products" : "",
          isSidebarCollapsed ? "workbench-layout-sidebar-collapsed" : "",
          workspace ? "workbench-layout-workspace" : "workbench-layout-empty",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <PrimarySidebar
          activeNavigationId={workspace ? activeNavigationId : null}
          surfaceAvailability={surfaceAvailability}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapsed={() => setIsSidebarCollapsed((current) => !current)}
          onNavigationSelect={handlePrimaryNavigationSelect}
        />

        <section
          ref={surfaceContentRef}
          className={[
            "main-surface",
            activeSurface === "scenario-evidence" ? "main-surface-scenario-evidence" : "",
            activeSurface === "core-commands" ? "main-surface-core-report-runner" : "",
            activeSurface === "generated-artifacts" ? "main-surface-generated-artifacts" : "",
            activeSurface === "mission-data-flow-workbench" ? "main-surface-data-flow-workbench" : "",
            activeSurface === "model-inventory" && activeNavigationId === "data-products" ? "main-surface-data-products" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label="Studio main surface"
        >
          {renderActiveSurface()}
        </section>

        {workspace &&
        activeSurface !== "mission-dashboard" &&
        activeSurface !== "core-commands" &&
        activeSurface !== "generated-artifacts" &&
        activeSurface !== "mission-data-flow-workbench" ? (
          <InspectorPanel
            workspace={workspace}
            activeSurface={activeSurface}
            selectedFile={selectedFile}
            selectedGeneratedArtifact={selectedGeneratedArtifact}
            selectedSimulationRecord={selectedSimulationRecord}
            selectedCoreDomainEntity={selectedCoreDomainEntity}
            selectedDetail={selectedDetail}
            coreResult={coreResult}
            formatDashboardStatusLabel={formatDashboardStatusLabel}
            formatUnknownBlock={formatUnknownBlock}
          />
        ) : null}

        {workspace ? (
          <ShellStatusBar
            workspace={workspace}
            activeSurface={activeSurface}
            activeNavigationId={activeNavigationId}
            coreResult={coreResult}
          />
        ) : null}
      </div>
    </main>
  );
}


function formatNavigationLabel(navigationId: TargetDomainId): string {
  return navigationId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ").replace(" And ", " & " );
}



function formatUnknownBlock(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value, null, 2);
}

function EmptyState() {
  return (
    <section className="inspection-panel" aria-label="No workspace selected">
      <h2>No workspace selected</h2>
      <p>
        Select an OrbitFabric workspace or mission directory to inspect its
        structural layout. No files are modified by this operation.
      </p>
    </section>
  );
}








function formatDashboardStatusLabel(value: string | null): string {
  return value ? value.toUpperCase() : "UNAVAILABLE";
}







function WorkspacePanel({
  workspace,
  selectedFile,
  viewerError,
  isReadingFile,
  coreExecutable,
  coreResult,
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
  generatedArtifactRefreshToken,
  onGeneratedArtifactSummaryChange,
  onGeneratedArtifactSelectionChange,
  onGeneratedEvidenceArtifactSummaryChange,
  onOpenFile,
}: {
  workspace: WorkspaceInspection;
  selectedFile: FileContent | null;
  viewerError: string | null;
  isReadingFile: boolean;
  coreExecutable: string;
  coreResult: CoreCommandResult | null;
  coreError: string | null;
  isRunningCoreCommand: boolean;
  generatedArtifactRefreshToken: number;
  onCoreExecutableChange: (value: string) => void;
  onCoreVersion: () => void;
  onCoreInspectMission: () => void;
  onCoreLintMission: () => void;
  onCoreExportModelSummary: () => void;
  onCoreExportEntityIndex: () => void;
  onCoreExportRelationshipManifest: () => void;
  onCoreExportDashboardSummary: () => void;
  onCoreExportScenarioRunIndex: () => void;
  onCoreExportCoverageSummary: () => void;
  onGeneratedArtifactSummaryChange: (
    summary: GeneratedArtifactDashboardSummary | null,
  ) => void;
  onGeneratedArtifactSelectionChange: (
    artifact: GeneratedArtifactInspectorItem | null,
  ) => void;
  onGeneratedEvidenceArtifactSummaryChange: (
    summary: GeneratedEvidenceArtifactSummary | null,
  ) => void;
  onOpenFile: (entry: ProjectEntry) => void;
}) {
  return (
    <section className="inspection-panel" aria-label="Workspace inspection result">
      <div className="inspection-header">
        <div>
          <h2>Workspace inspection</h2>
          <p>{workspace.selected_path}</p>
        </div>
        <span className="status-pill">Structural only</span>
      </div>

      <div className="summary-grid">
        <SummaryItem label="Mission directory" value={workspace.mission_dir} />
        <SummaryItem label="Scenarios directory" value={workspace.scenarios_dir} />
        <SummaryItem label="Generated directory" value={workspace.generated_dir} />
      </div>

      {workspace.warnings.length > 0 ? (
        <div className="warning-box">
          <h3>Warnings</h3>
          <ul>
            {workspace.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <CoreStatusPanel
        executable={coreExecutable}
        result={coreResult}
        error={coreError}
        isRunning={isRunningCoreCommand}
        hasMissionDir={Boolean(workspace.mission_dir)}
        hasWorkspace={Boolean(workspace.selected_path)}
        sourceModelFiles={workspace.source_model_files}
        onExecutableChange={onCoreExecutableChange}
        onVersion={onCoreVersion}
        onInspectMission={onCoreInspectMission}
        onLintMission={onCoreLintMission}
        onExportModelSummary={onCoreExportModelSummary}
        onExportEntityIndex={onCoreExportEntityIndex}
        onExportRelationshipManifest={onCoreExportRelationshipManifest}
        onExportDashboardSummary={onCoreExportDashboardSummary}
        onExportScenarioRunIndex={onCoreExportScenarioRunIndex}
        onExportCoverageSummary={onCoreExportCoverageSummary}
        onOpenFile={onOpenFile}
      />

      <GeneratedArtifactExplorerPanel
        workspacePath={workspace.selected_path}
        refreshToken={generatedArtifactRefreshToken}
        onDashboardSummaryChange={onGeneratedArtifactSummaryChange}
        onArtifactSelectionChange={onGeneratedArtifactSelectionChange}
        onEvidenceArtifactSummaryChange={onGeneratedEvidenceArtifactSummaryChange}
      />

      <div className="workspace-layout">
        <div>
          <EntrySection
            id="studio-model"
            title="Source model files"
            entries={workspace.source_model_files}
            emptyText="No expected Mission Model files detected."
            onOpenFile={onOpenFile}
          />

          <MissingFiles files={workspace.missing_expected_source_files} />

          <EntrySection
            title="Scenario sources"
            entries={workspace.scenario_files}
            emptyText="No scenario YAML files detected."
            onOpenFile={onOpenFile}
          />

          <EntrySection
            id="studio-reports-logs"
            title="Generated and derived locations"
            entries={workspace.generated_locations}
            emptyText="No generated artifact locations detected."
            onOpenFile={onOpenFile}
          />
        </div>

        <FileViewer
          selectedFile={selectedFile}
          viewerError={viewerError}
          isReadingFile={isReadingFile}
        />
      </div>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value ?? "Not detected"}</strong>
    </div>
  );
}

function CoreStatusPanel({
  executable,
  result,
  error,
  isRunning,
  hasMissionDir,
  hasWorkspace,
  sourceModelFiles,
  onExecutableChange,
  onVersion,
  onInspectMission,
  onLintMission,
  onExportModelSummary,
  onExportEntityIndex,
  onExportRelationshipManifest,
  onExportDashboardSummary,
  onExportScenarioRunIndex,
  onExportCoverageSummary,
  onOpenFile,
}: {
  executable: string;
  result: CoreCommandResult | null;
  error: string | null;
  isRunning: boolean;
  hasMissionDir: boolean;
  hasWorkspace: boolean;
  sourceModelFiles: ProjectEntry[];
  onExecutableChange: (value: string) => void;
  onVersion: () => void;
  onInspectMission: () => void;
  onLintMission: () => void;
  onExportModelSummary: () => void;
  onExportEntityIndex: () => void;
  onExportRelationshipManifest: () => void;
  onExportDashboardSummary: () => void;
  onExportScenarioRunIndex: () => void;
  onExportCoverageSummary: () => void;
  onOpenFile: (entry: ProjectEntry) => void;
}) {
  return (
    <section id="studio-validation" className="core-panel" aria-label="OrbitFabric Core command status">
      <div className="file-viewer-header">
        <div>
          <h3>OrbitFabric Core command status</h3>
          <p>
            Runs only fixed Core commands and displays raw process output. The
            lint and export commands write Core JSON reports as derived reports.
            Studio does not parse Mission Model YAML semantically.
          </p>
        </div>
        <span className="status-pill">Raw output</span>
      </div>

      <label className="command-label" htmlFor="core-executable">
        OrbitFabric executable
      </label>
      <input
        id="core-executable"
        className="command-input"
        type="text"
        value={executable}
        onChange={(event) => onExecutableChange(event.target.value)}
        spellCheck={false}
      />

      <div className="command-actions">
        <button type="button" onClick={onVersion} disabled={isRunning}>
          Run --version
        </button>
        <button
          type="button"
          onClick={onInspectMission}
          disabled={isRunning || !hasMissionDir}
        >
          Run inspect mission
        </button>
        <button
          type="button"
          onClick={onLintMission}
          disabled={isRunning || !hasMissionDir}
        >
          Run lint mission
        </button>
        <button
          type="button"
          onClick={onExportModelSummary}
          disabled={isRunning || !hasMissionDir}
        >
          Run export model-summary
        </button>
        <button
          type="button"
          onClick={onExportEntityIndex}
          disabled={isRunning || !hasMissionDir}
        >
          Run export entity-index
        </button>
        <button
          type="button"
          onClick={onExportRelationshipManifest}
          disabled={isRunning || !hasMissionDir}
        >
          Run export relationship-manifest
        </button>
        <button
          type="button"
          onClick={onExportDashboardSummary}
          disabled={isRunning || !hasMissionDir}
        >
          Run export dashboard-summary
        </button>
        <button
          type="button"
          onClick={onExportScenarioRunIndex}
          disabled={isRunning || !hasWorkspace}
        >
          Run export scenario-run-index
        </button>
        <button
          type="button"
          onClick={onExportCoverageSummary}
          disabled={isRunning || !hasMissionDir}
        >
          Run export coverage-summary
        </button>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {isRunning ? <p className="empty-text">Running Core command...</p> : null}
      {result ? (
        <CoreCommandOutput
          result={result}
          sourceModelFiles={sourceModelFiles}
          onOpenFile={onOpenFile}
        />
      ) : null}
    </section>
  );
}

function CoreCommandOutput({
  result,
  sourceModelFiles,
  onOpenFile,
}: {
  result: CoreCommandResult;
  sourceModelFiles: ProjectEntry[];
  onOpenFile: (entry: ProjectEntry) => void;
}) {
  const parsedLintReport = parseCoreLintReport(result.json_report_content);
  const parsedCoverageSummary = parseCoreCoverageSummary(result.json_report_content);
  const parsedModelSummary = parseCoreModelSummary(result.json_report_content);
  const parsedEntityIndex = parseCoreEntityIndex(result.json_report_content);
  const parsedRelationshipManifest = parseCoreRelationshipManifest(result.json_report_content);
  const parsedDashboardSummary = parseCoreDashboardSummary(result.json_report_content);
  const parsedScenarioRunIndex = parseCoreScenarioRunIndex(result.json_report_content);
  const isModelSummaryCommand = result.args.includes("model-summary");
  const isEntityIndexCommand = result.args.includes("entity-index");
  const isRelationshipManifestCommand = result.args.includes("relationship-manifest");
  const isDashboardSummaryCommand = result.args.includes("dashboard-summary");
  const isScenarioRunIndexCommand = result.args.includes("scenario-run-index");
  const isCoverageSummaryCommand = result.args.includes("coverage-summary");

  return (
    <div id="studio-raw-output" className="command-output">
      <div className="command-meta">
        <strong>{result.command}</strong>
        <span>{result.args.join(" ") || "no args"}</span>
        <span>{result.success ? "success" : "failed"}</span>
        <span>exit code: {result.exit_code ?? "not available"}</span>
      </div>
      {result.json_report_path ? (
        <div className="command-meta">
          <strong>Core JSON report</strong>
          <span>{result.json_report_available ? "available" : "not available"}</span>
          <span>{result.json_report_path}</span>
        </div>
      ) : null}
      {parsedLintReport ? (
        <CoreValidationSummary
          report={parsedLintReport}
          rawContent={result.json_report_content ?? ""}
          sourceModelFiles={sourceModelFiles}
          onOpenFile={onOpenFile}
        />
      ) : null}
      {parsedModelSummary ? (
        <CoreModelSummaryPanel
          summary={parsedModelSummary}
          sourceModelFiles={sourceModelFiles}
          onOpenFile={onOpenFile}
        />
      ) : null}
      {parsedEntityIndex ? (
        <CoreEntityIndexPanel
          index={parsedEntityIndex}
          sourceModelFiles={sourceModelFiles}
          onOpenFile={onOpenFile}
        />
      ) : null}
      {parsedRelationshipManifest ? (
        <CoreRelationshipManifestPanel
          manifest={parsedRelationshipManifest}
          rawContent={result.json_report_content ?? ""}
        />
      ) : null}
      {parsedDashboardSummary ? (
        <DashboardSummaryPanel summary={parsedDashboardSummary} />
      ) : null}
      {parsedScenarioRunIndex ? (
        <ScenarioRunIndexPanel index={parsedScenarioRunIndex} />
      ) : null}
      {parsedCoverageSummary ? (
        <CoverageSummaryPanel summary={parsedCoverageSummary} />
      ) : null}
      {result.json_report_content &&
      !parsedLintReport &&
      !parsedCoverageSummary &&
      !parsedModelSummary &&
      !parsedEntityIndex &&
      !parsedRelationshipManifest &&
      !parsedDashboardSummary &&
      !parsedScenarioRunIndex ? (
        <UnrecognizedCoreReport rawContent={result.json_report_content} />
      ) : null}
      {isModelSummaryCommand && !result.json_report_available ? (
        <section className="entry-section muted-section" aria-label="Core model summary unavailable">
          <h3>Contract domains unavailable</h3>
          <p>
            Core did not produce a model summary report. Domain navigation requires
            OrbitFabric Core v0.8.1 or newer and a successful fixed export command.
          </p>
        </section>
      ) : null}
      {isEntityIndexCommand && !result.json_report_available ? (
        <section className="entry-section muted-section" aria-label="Core entity index unavailable">
          <h3>Contract entities unavailable</h3>
          <p>
            Core did not produce an entity index report. Entity navigation requires
            OrbitFabric Core v0.8.2 or newer and a successful fixed export command.
          </p>
        </section>
      ) : null}
      {isRelationshipManifestCommand && !result.json_report_available ? (
        <section className="entry-section muted-section" aria-label="Core relationship manifest unavailable">
          <h3>Relationship manifest unavailable</h3>
          <p>
            Core did not produce a relationship manifest report. Relationship
            inspection requires OrbitFabric Core v1.0.0 or newer and a successful
            fixed export command.
          </p>
        </section>
      ) : null}
      {isDashboardSummaryCommand && !result.json_report_available ? (
        <section className="entry-section muted-section" aria-label="Core dashboard summary unavailable">
          <h3>Dashboard summary unavailable</h3>
          <p>
            Core did not produce a dashboard summary report. Dashboard rendering
            requires a successful fixed `dashboard-summary` export command.
          </p>
        </section>
      ) : null}
      {isScenarioRunIndexCommand && !result.json_report_available ? (
        <section className="entry-section muted-section" aria-label="Core scenario run index unavailable">
          <h3>Scenario run index unavailable</h3>
          <p>
            Core did not produce a scenario run index report. Scenario run
            rendering requires simulation JSON reports and a successful fixed
            `scenario-run-index` export command.
          </p>
        </section>
      ) : null}
      {isCoverageSummaryCommand && !result.json_report_available ? (
        <section className="entry-section muted-section" aria-label="Core coverage summary unavailable">
          <h3>Coverage summary unavailable</h3>
          <p>
            Core did not produce a coverage summary report. Coverage rendering
            requires existing entity index, relationship manifest and scenario run
            index reports produced through fixed Core exports.
          </p>
        </section>
      ) : null}
      <pre>{result.stdout || "<empty stdout>"}</pre>
      {result.stderr ? <pre className="stderr-output">{result.stderr}</pre> : null}
    </div>
  );
}

function UnrecognizedCoreReport({ rawContent }: { rawContent: string }) {
  return (
    <section className="entry-section muted-section" aria-label="Core JSON report status">
      <h3>Core JSON report</h3>
      <p>
        A Core JSON report was produced, but Studio did not recognize it as a
        supported report shape for this view. No diagnostics, domains or entities
        are inferred.
      </p>
      <div className="command-meta">
        <strong>Core JSON report content</strong>
        <span>{rawContent.length} bytes</span>
      </div>
    </section>
  );
}

function CoreValidationSummary({
  report,
  rawContent,
  sourceModelFiles,
  onOpenFile,
}: {
  report: CoreLintReport | null;
  rawContent: string;
  sourceModelFiles: ProjectEntry[];
  onOpenFile: (entry: ProjectEntry) => void;
}) {
  if (!report) {
    return <UnrecognizedCoreReport rawContent={rawContent} />;
  }

  return (
    <section className="entry-section" aria-label="Core validation summary">
      <div className="file-viewer-header">
        <div>
          <h3>Core validation summary</h3>
          <p>
            Derived from the OrbitFabric Core JSON lint report. Studio displays
            these fields without running independent validation.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="CORE-DERIVED" />
          <ProvenanceBadge label="RELATIONSHIP" />
          <ProvenanceBadge label="READ-ONLY" />
        </div>
      </div>

      <div className="summary-grid">
        <SummaryItem label="Result" value={report.result} />
        <SummaryItem label="Mission" value={report.mission} />
        <SummaryItem label="Model version" value={report.model_version} />
        <SummaryItem label="Core version" value={report.version} />
      </div>

      <div className="summary-grid">
        <SummaryItem label="Errors" value={String(report.summary.errors)} />
        <SummaryItem label="Warnings" value={String(report.summary.warnings)} />
        <SummaryItem label="Info" value={String(report.summary.info)} />
        <SummaryItem label="Findings" value={String(report.findings.length)} />
      </div>

      <CoreFindingsList
        findings={report.findings}
        sourceModelFiles={sourceModelFiles}
        onOpenFile={onOpenFile}
      />
    </section>
  );
}

function CoreModelSummaryPanel({
  summary,
  sourceModelFiles,
  onOpenFile,
}: {
  summary: CoreModelSummary;
  sourceModelFiles: ProjectEntry[];
  onOpenFile: (entry: ProjectEntry) => void;
}) {
  return (
    <section id="studio-contracts" className="entry-section" aria-label="Contract domain navigation">
      <div className="file-viewer-header">
        <div>
          <h3>Contract domains</h3>
          <p>
            Derived from Core `model_summary.json`. Studio lists domains and
            source files exactly as reported by Core. It does not infer entities,
            relationships or source locations.
          </p>
        </div>
        <span className="status-pill">Core model summary</span>
      </div>

      <div className="summary-grid">
        <SummaryItem label="Mission" value={summary.mission.name} />
        <SummaryItem label="Mission ID" value={summary.mission.id} />
        <SummaryItem label="Core version" value={summary.orbitfabric_version} />
      </div>

      <DomainList
        domains={summary.domains}
        sourceModelFiles={sourceModelFiles}
        onOpenFile={onOpenFile}
      />
    </section>
  );
}

function DomainList({
  domains,
  sourceModelFiles,
  onOpenFile,
}: {
  domains: CoreModelSummaryDomain[];
  sourceModelFiles: ProjectEntry[];
  onOpenFile: (entry: ProjectEntry) => void;
}) {
  if (domains.length === 0) {
    return (
      <section className="entry-section muted-section" aria-label="No contract domains">
        <h3>Contract domain list</h3>
        <p>Core model summary did not report any domains.</p>
      </section>
    );
  }

  return (
    <section className="entry-section" aria-label="Contract domain list">
      <h3>Domain list</h3>
      <ul className="entry-list">
        {domains.map((domain) => {
          const linkedFile = findSourceModelFile(domain.source_file, sourceModelFiles);

          return (
            <li key={domain.id}>
              <div className="entry-main">
                <strong>{domain.display_name}</strong>
                <span className={`category-badge category-${domain.present ? "sourceModel" : "derivedReport"}`}>
                  {domain.present ? "present" : "missing"}
                </span>
              </div>
              <div className="command-meta">
                <span>id: {domain.id}</span>
                <span>required: {String(domain.required)}</span>
                <span>count: {domain.count}</span>
                <span>count provenance: {domain.count_provenance}</span>
                <span>
                  source file: {linkedFile ? (
                    <button
                      className="inline-link-button"
                      type="button"
                      onClick={() => onOpenFile(linkedFile)}
                    >
                      {domain.source_file}
                    </button>
                  ) : (
                    domain.source_file
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CoreEntityIndexPanel({
  index,
  sourceModelFiles,
  onOpenFile,
}: {
  index: CoreEntityIndex;
  sourceModelFiles: ProjectEntry[];
  onOpenFile: (entry: ProjectEntry) => void;
}) {
  return (
    <section id="studio-contracts" className="entry-section" aria-label="Contract entity navigation">
      <div className="file-viewer-header">
        <div>
          <h3>Contract entities</h3>
          <p>
            Derived from Core `entity_index.json`. Studio lists entity records
            exactly as reported by Core. It does not infer relationships, graph
            edges, YAML AST nodes or source locations.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="REPORTED" />
        </div>
      </div>

      <div className="summary-grid">
        <SummaryItem label="Mission" value={index.mission.name} />
        <SummaryItem label="Mission ID" value={index.mission.id} />
        <SummaryItem label="Total entities" value={String(index.counts.total_entities)} />
      </div>

      <EntityDomainSummary
        domains={index.domains}
        sourceModelFiles={sourceModelFiles}
        onOpenFile={onOpenFile}
      />

      <EntityList
        domains={index.domains}
        entities={index.entities}
        sourceModelFiles={sourceModelFiles}
        onOpenFile={onOpenFile}
      />
    </section>
  );
}


function CoreRelationshipManifestPanel({
  manifest,
  rawContent,
}: {
  manifest: CoreRelationshipManifest;
  rawContent: string;
}) {
  const boundaryLabels = [
    ["Core relationship manifest", manifest.boundaries.contains_relationship_manifest],
    ["Not relationship graph", !manifest.boundaries.contains_relationship_graph],
    ["Not dependency graph", !manifest.boundaries.contains_dependency_graph],
    ["No source locations", !manifest.boundaries.contains_source_locations],
    ["No runtime behavior", !manifest.boundaries.contains_runtime_behavior],
    ["No ground behavior", !manifest.boundaries.contains_ground_behavior],
  ];

  return (
    <section id="studio-relationships" className="entry-section" aria-label="Relationship manifest summary">
      <div className="file-viewer-header">
        <div>
          <h3>Relationship Manifest</h3>
          <p>
            Derived from Core `relationship_manifest.json`. Studio displays the
            manifest identity, boundaries, relationship types, relationship records
            and selected-record explanations. It does not infer relationships,
            render a graph or derive runtime behavior.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="CORE-DERIVED" />
          <ProvenanceBadge label="RELATIONSHIP" />
          <StatusBadge label="REPORTED" />
        </div>
      </div>

      <div className="summary-grid">
        <SummaryItem label="Mission" value={manifest.mission.name} />
        <SummaryItem label="Mission ID" value={manifest.mission.id} />
        <SummaryItem label="Manifest version" value={manifest.manifest_version} />
        <SummaryItem label="Core version" value={manifest.orbitfabric_version} />
        <SummaryItem label="Status" value={manifest.status} />
        <SummaryItem
          label="Total relationships"
          value={String(manifest.counts.total_relationships)}
        />
      </div>

      <section className="entry-section" aria-label="Relationship manifest boundaries">
        <h3>Boundary labels</h3>
        <p>
          These labels are reported from the Core manifest boundary flags. They
          keep this surface separate from graph, runtime and ground behavior.
        </p>
        <ul className="entry-list">
          {boundaryLabels.map(([label, enabled]) => (
            <li key={String(label)}>
              <div className="entry-main">
                <strong>{label}</strong>
                <span className={`category-badge category-${enabled ? "sourceModel" : "derivedReport"}`}>
                  {enabled ? "confirmed" : "not confirmed"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <RelationshipTypeSummary relationshipTypes={manifest.relationship_types} />

      <RelationshipRecordsNavigation relationships={manifest.relationships} />

      <section className="entry-section" aria-label="Relationship manifest raw preview">
        <h3>Raw relationship_manifest.json preview</h3>
        <p>
          Raw report content is shown for transparency. The structured summaries,
          record navigation and explanation panel above remain derived from this
          Core report.
        </p>
        <pre>{rawContent || "<empty relationship manifest>"}</pre>
      </section>
    </section>
  );
}



function RelationshipRecordsNavigation({
  relationships,
}: {
  relationships: CoreRelationshipRecord[];
}) {
  const [selectedType, setSelectedType] = useState("");
  const [selectedFromDomain, setSelectedFromDomain] = useState("");
  const [selectedToDomain, setSelectedToDomain] = useState("");
  const [selectedRelationshipId, setSelectedRelationshipId] = useState("");

  const relationshipTypeOptions = uniqueSorted(
    relationships.map((item) => item.relationship_type),
  );
  const fromDomainOptions = uniqueSorted(
    relationships.map((item) => item.from.domain),
  );
  const toDomainOptions = uniqueSorted(
    relationships.map((item) => item.to.domain),
  );

  const filteredRelationships = relationships.filter((item) => {
    return (
      (!selectedType || item.relationship_type === selectedType) &&
      (!selectedFromDomain || item.from.domain === selectedFromDomain) &&
      (!selectedToDomain || item.to.domain === selectedToDomain)
    );
  });

  const selectedRelationship =
    filteredRelationships.find(
      (item) => item.relationship_id === selectedRelationshipId,
    ) ?? null;

  return (
    <section className="entry-section" aria-label="Relationship records navigation">
      <h3>Relationship records</h3>
      <p>
        Relationship records are rendered exactly as reported by Core. Studio
        does not infer additional records, create synthetic nodes or resolve
        endpoint links in this slice.
      </p>

      <div className="summary-grid">
        <SummaryItem label="Reported records" value={String(relationships.length)} />
        <SummaryItem label="Visible records" value={String(filteredRelationships.length)} />
        <SummaryItem
          label="Selected record"
          value={selectedRelationship ? selectedRelationship.relationship_id : "None"}
        />
      </div>

      <div className="command-actions">
        <label className="command-label">
          Type
          <select
            className="command-input"
            value={selectedType}
            onChange={(event) => {
              setSelectedType(event.target.value);
              setSelectedRelationshipId("");
            }}
          >
            <option value="">All relationship types</option>
            {relationshipTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="command-label">
          From domain
          <select
            className="command-input"
            value={selectedFromDomain}
            onChange={(event) => {
              setSelectedFromDomain(event.target.value);
              setSelectedRelationshipId("");
            }}
          >
            <option value="">All from domains</option>
            {fromDomainOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="command-label">
          To domain
          <select
            className="command-input"
            value={selectedToDomain}
            onChange={(event) => {
              setSelectedToDomain(event.target.value);
              setSelectedRelationshipId("");
            }}
          >
            <option value="">All to domains</option>
            {toDomainOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => {
            setSelectedType("");
            setSelectedFromDomain("");
            setSelectedToDomain("");
            setSelectedRelationshipId("");
          }}
        >
          Clear record filters
        </button>
      </div>

      {filteredRelationships.length > 0 ? (
        <ul className="entry-list">
          {filteredRelationships.map((relationship) => {
            const isSelected =
              relationship.relationship_id === selectedRelationshipId;

            return (
              <li key={relationship.relationship_id}>
                <div className="entry-main">
                  <button
                    className="entry-button"
                    type="button"
                    onClick={() =>
                      setSelectedRelationshipId(relationship.relationship_id)
                    }
                  >
                    {relationship.relationship_id}
                  </button>
                  <span className="category-badge category-sourceModel">
                    {isSelected ? "selected" : relationship.relationship_type}
                  </span>
                </div>
                <div className="command-meta">
                  <span>type: {relationship.relationship_type}</span>
                  <span>
                    from: {relationship.from.domain}:{relationship.from.id}
                  </span>
                  <span>
                    to: {relationship.to.domain}:{relationship.to.id}
                  </span>
                  <span>derived from: {relationship.derived_from.model_field}</span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="empty-text">No relationship records match the active filters.</p>
      )}

      <RelationshipExplanationPanel relationship={selectedRelationship} />
    </section>
  );
}

function RelationshipExplanationPanel({
  relationship,
}: {
  relationship: CoreRelationshipRecord | null;
}) {
  if (!relationship) {
    return (
      <section className="entry-section muted-section" aria-label="Relationship explanation">
        <h3>Selected relationship explanation</h3>
        <p>
          Select a Core relationship record above to inspect its read-only
          provenance and boundary statements.
        </p>
      </section>
    );
  }

  const explanationItems = [
    ["Source", "Core relationship_manifest.json"],
    ["Relationship ID", relationship.relationship_id],
    ["Relationship type", relationship.relationship_type],
    [
      "From endpoint",
      `${relationship.from.domain}:${relationship.from.id}`,
    ],
    ["To endpoint", `${relationship.to.domain}:${relationship.to.id}`],
    ["Derived from", relationship.derived_from.model_field],
  ];

  const boundaryStatements = [
    "This relationship comes from Core relationship_manifest.json.",
    `It is derived from the explicit Mission Model field ${relationship.derived_from.model_field}.`,
    "Studio did not infer this relationship.",
    "This relationship does not represent runtime behavior.",
    "This relationship does not represent ground behavior.",
    "This relationship is not a dependency graph edge.",
    "Endpoint linking and source line navigation are intentionally not provided in this slice.",
  ];

  return (
    <section className="entry-section" aria-label="Relationship explanation">
      <div className="file-viewer-header">
        <div>
          <h3>Selected relationship explanation</h3>
          <p>
            Read-only detail for one Core-owned relationship record. The
            explanation is limited to provenance, endpoints and explicit boundary
            statements.
          </p>
        </div>
        <span className="status-pill">Core-derived</span>
      </div>

      <div className="summary-grid">
        {explanationItems.map(([label, value]) => (
          <SummaryItem key={label} label={label} value={value} />
        ))}
      </div>

      <section className="entry-section" aria-label="Relationship boundary statements">
        <h3>Boundary statements</h3>
        <ul className="entry-list">
          {boundaryStatements.map((statement) => (
            <li key={statement}>
              <div className="entry-main">
                <strong>{statement}</strong>
                <span className="category-badge category-sourceModel">
                  confirmed
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}


function RelationshipTypeSummary({
  relationshipTypes,
}: {
  relationshipTypes: CoreRelationshipType[];
}) {
  const [selectedType, setSelectedType] = useState("");
  const [selectedFromDomain, setSelectedFromDomain] = useState("");
  const [selectedToDomain, setSelectedToDomain] = useState("");

  const relationshipTypeOptions = uniqueSorted(
    relationshipTypes.map((item) => item.relationship_type),
  );
  const fromDomainOptions = uniqueSorted(
    relationshipTypes.map((item) => item.from_domain),
  );
  const toDomainOptions = uniqueSorted(
    relationshipTypes.map((item) => item.to_domain),
  );

  const filteredRelationshipTypes = relationshipTypes.filter((item) => {
    return (
      (!selectedType || item.relationship_type === selectedType) &&
      (!selectedFromDomain || item.from_domain === selectedFromDomain) &&
      (!selectedToDomain || item.to_domain === selectedToDomain)
    );
  });

  const filteredCount = filteredRelationshipTypes.reduce(
    (total, item) => total + item.relationship_count,
    0,
  );

  return (
    <section className="entry-section" aria-label="Relationship type summary">
      <h3>Relationship type summary</h3>
      <p>
        Relationship types are listed exactly as reported by Core. Studio does
        not add relationship families, infer extra edges or interpret runtime
        behavior.
      </p>

      <div className="summary-grid">
        <SummaryItem
          label="Reported types"
          value={String(relationshipTypes.length)}
        />
        <SummaryItem
          label="Visible types"
          value={String(filteredRelationshipTypes.length)}
        />
        <SummaryItem
          label="Visible relationships"
          value={String(filteredCount)}
        />
      </div>

      <div className="command-actions">
        <label className="command-label">
          Type
          <select
            className="command-input"
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
          >
            <option value="">All relationship types</option>
            {relationshipTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="command-label">
          From domain
          <select
            className="command-input"
            value={selectedFromDomain}
            onChange={(event) => setSelectedFromDomain(event.target.value)}
          >
            <option value="">All from domains</option>
            {fromDomainOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="command-label">
          To domain
          <select
            className="command-input"
            value={selectedToDomain}
            onChange={(event) => setSelectedToDomain(event.target.value)}
          >
            <option value="">All to domains</option>
            {toDomainOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => {
            setSelectedType("");
            setSelectedFromDomain("");
            setSelectedToDomain("");
          }}
        >
          Clear relationship filters
        </button>
      </div>

      {filteredRelationshipTypes.length > 0 ? (
        <ul className="entry-list">
          {filteredRelationshipTypes.map((item) => (
            <li key={item.relationship_type}>
              <div className="entry-main">
                <strong>{item.display_name}</strong>
                <span className="category-badge category-sourceModel">
                  {item.relationship_count} relationships
                </span>
              </div>
              <div className="command-meta">
                <span>type: {item.relationship_type}</span>
                <span>from: {item.from_domain}</span>
                <span>to: {item.to_domain}</span>
                <span>derived from: {item.derived_from.model_field}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-text">No relationship types match the active filters.</p>
      )}
    </section>
  );
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((left, right) =>
    left.localeCompare(right),
  );
}

function EntityDomainSummary({
  domains,
  sourceModelFiles,
  onOpenFile,
}: {
  domains: CoreEntityIndexDomain[];
  sourceModelFiles: ProjectEntry[];
  onOpenFile: (entry: ProjectEntry) => void;
}) {
  return (
    <section className="entry-section" aria-label="Entity index domain summary">
      <h3>Domain index summary</h3>
      <p>
        Domain summaries are reported by Core. Domains marked as not indexed are
        shown without synthetic entity records.
      </p>
      <ul className="entry-list">
        {domains.map((domain) => {
          const linkedFile = findSourceModelFile(domain.source_file, sourceModelFiles);

          return (
            <li key={domain.id}>
              <div className="entry-main">
                <strong>{domain.display_name}</strong>
                <span className={`category-badge category-${domain.indexed ? "sourceModel" : "derivedReport"}`}>
                  {domain.indexed ? "indexed" : "not indexed"}
                </span>
              </div>
              <div className="command-meta">
                <span>id: {domain.id}</span>
                <span>present: {String(domain.present)}</span>
                <span>required: {String(domain.required)}</span>
                <span>model count: {domain.model_count}</span>
                <span>entity count: {domain.entity_count}</span>
                <span>count provenance: {domain.count_provenance}</span>
                <span>
                  source file: {linkedFile ? (
                    <button
                      className="inline-link-button"
                      type="button"
                      onClick={() => onOpenFile(linkedFile)}
                    >
                      {domain.source_file}
                    </button>
                  ) : (
                    domain.source_file
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function EntityList({
  domains,
  entities,
  sourceModelFiles,
  onOpenFile,
}: {
  domains: CoreEntityIndexDomain[];
  entities: CoreEntityIndexEntity[];
  sourceModelFiles: ProjectEntry[];
  onOpenFile: (entry: ProjectEntry) => void;
}) {
  if (entities.length === 0) {
    return (
      <section className="entry-section muted-section" aria-label="No entity records">
        <h3>Entity records</h3>
        <p>Core entity index did not report any entity records.</p>
      </section>
    );
  }

  const entitiesByDomain = groupEntitiesByDomain(entities);

  return (
    <section className="entry-section" aria-label="Entity records">
      <h3>Entity records</h3>
      <p>
        Entity records are grouped by Core-reported domain. Only records present
        in `entity_index.entities` are rendered.
      </p>
      {domains.map((domain) => {
        const domainEntities = entitiesByDomain[domain.id] ?? [];

        if (domainEntities.length === 0) {
          return null;
        }

        return (
          <section className="entry-section" key={domain.id} aria-label={`${domain.display_name} entities`}>
            <div className="entry-main">
              <h3>{domain.display_name}</h3>
              <span className="category-badge category-sourceModel">
                {domainEntities.length} entities
              </span>
            </div>
            <ul className="entry-list">
              {domainEntities.map((entity) => {
                const linkedFile = findSourceModelFile(entity.source_file, sourceModelFiles);

                return (
                  <li key={`${entity.domain}-${entity.id}`}>
                    <div className="entry-main">
                      <strong>{entity.display_name}</strong>
                      <span className="category-badge category-generatedOutput">
                        {entity.entity_type}
                      </span>
                    </div>
                    <div className="command-meta">
                      <span>id: {entity.id}</span>
                      <span>domain: {entity.domain}</span>
                      <span>present: {String(entity.present)}</span>
                      <span>required domain: {String(entity.required_domain)}</span>
                      <span>provenance: {entity.provenance}</span>
                      <span>
                        source file: {linkedFile ? (
                          <button
                            className="inline-link-button"
                            type="button"
                            onClick={() => onOpenFile(linkedFile)}
                          >
                            {entity.source_file}
                          </button>
                        ) : (
                          entity.source_file
                        )}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </section>
  );
}

function groupEntitiesByDomain(
  entities: CoreEntityIndexEntity[],
): Record<string, CoreEntityIndexEntity[]> {
  return entities.reduce<Record<string, CoreEntityIndexEntity[]>>((grouped, entity) => {
    grouped[entity.domain] = grouped[entity.domain] ?? [];
    grouped[entity.domain].push(entity);
    return grouped;
  }, {});
}

function CoreFindingsList({
  findings,
  sourceModelFiles,
  onOpenFile,
}: {
  findings: CoreLintFinding[];
  sourceModelFiles: ProjectEntry[];
  onOpenFile: (entry: ProjectEntry) => void;
}) {
  if (findings.length === 0) {
    return (
      <section className="entry-section muted-section" aria-label="Core findings list">
        <h3>Core findings</h3>
        <p>No findings reported by OrbitFabric Core.</p>
      </section>
    );
  }

  return (
    <section className="entry-section" aria-label="Core findings list">
      <h3>Core findings</h3>
      <p>
        Read-only list of findings provided by OrbitFabric Core. File references
        are opened only when they match a known source model file in this workspace.
      </p>
      <ul className="entry-list">
        {findings.map((finding, index) => {
          const linkedFile = findSourceModelFile(finding.file, sourceModelFiles);

          return (
            <li key={`${finding.code}-${finding.object_id ?? index}`}>
              <div className="entry-main">
                <SeverityBadge label={finding.severity} />
                <strong>{finding.code}</strong>
              </div>
              <p>{finding.message}</p>
              <div className="command-meta">
                {finding.file ? (
                  <span>
                    file: {linkedFile ? (
                      <button
                        className="inline-link-button"
                        type="button"
                        onClick={() => onOpenFile(linkedFile)}
                      >
                        {finding.file}
                      </button>
                    ) : (
                      finding.file
                    )}
                  </span>
                ) : null}
                {finding.domain ? <span>domain: {finding.domain}</span> : null}
                {finding.object_id ? <span>object: {finding.object_id}</span> : null}
              </div>
              {finding.suggestion ? <p>Suggestion: {finding.suggestion}</p> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function findSourceModelFile(
  sourceFile: string | null,
  sourceModelFiles: ProjectEntry[],
): ProjectEntry | null {
  if (!sourceFile) {
    return null;
  }

  return (
    sourceModelFiles.find(
      (entry) => entry.kind === "file" && entry.name === sourceFile,
    ) ?? null
  );
}

function severityCategory(severity: string): ProjectEntry["category"] {
  return severity === "ERROR" ? "derivedReport" : "generatedOutput";
}


export default App;
