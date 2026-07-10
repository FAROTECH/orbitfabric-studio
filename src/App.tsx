import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

import { PublicPreviewPlaceholder } from "./PublicPreviewPlaceholder";
import {
  InspectorPanel,
  type SimulationInspectorRecord,
  type StudioDetailSelection,
} from "./InspectorPanel";
import {
  type GeneratedArtifactDashboardSummary,
  type GeneratedArtifactInspectorItem,
  type GeneratedEvidenceArtifactSummary,
} from "./GeneratedArtifactExplorer";
import { GeneratedArtifactsSurface } from "./GeneratedArtifactsSurface";
import { CoreReportRunnerSurface } from "./CoreReportRunnerSurface";
import { MissionCockpit } from "./MissionCockpit";
import { MissionDataFlowWorkbenchRoute } from "./MissionDataFlowWorkbenchRoute";
import { ShellStatusBar } from "./ShellStatusBar";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { PrimarySidebar } from "./PrimarySidebar";
import {
  type ActiveSurface,
  type TargetDomainId,
} from "./navigationModel";
import type { DomainEntitySummary } from "./domainSurfaceModel";
import { createMissionDataFlowWorkbenchSnapshot } from "./missionDataFlowWorkbenchModel";
import { createSurfaceAvailability } from "./surfaceAvailability";
import {
  defaultNavigationIdBySurface,
  modelInventoryDomainSurfaceComponents,
  publicPreviewModelNavigationIds,
  publicPreviewPlaceholderCopy,
} from "./studioSurfaceConfig";
import { hydrateGeneratedReportsFromWorkspace } from "./generatedReportHydration";
import {
  createEmptyCoreReportSnapshots,
  type CoreReportSnapshots,
  upsertSimulationReport,
} from "./coreReportSnapshots";
import {
  ScenarioTimelineRunnerSurface,
  type ScenarioTimelineInspectorRecord,
} from "./ScenarioTimelineRunnerSurface";

import {
  formatDashboardStatusLabel,
  formatNavigationLabel,
  formatUnknownBlock,
} from "./studioFormatters";

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
  CoreEntityIndex,
  CoreModelSummary,
  FileContent,
  ProjectEntry,
  WorkspaceInspection,
} from "./types/workspace";

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
  const [coreError, setCoreError] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);
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

    setSelectedGeneratedArtifact(null);
    setSelectedSimulationRecord(null);
    setSelectedCoreDomainEntity(null);
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
    } catch {
      // Keep failed source-file reads non-disruptive; no active surface renders file read errors.
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

  const surfaceAvailability = createSurfaceAvailability(workspace);

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


export default App;
