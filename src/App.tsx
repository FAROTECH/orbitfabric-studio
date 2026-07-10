import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

import { InspectorPanel } from "./InspectorPanel";
import {
  type GeneratedArtifactDashboardSummary,
  type GeneratedEvidenceArtifactSummary,
} from "./GeneratedArtifactExplorer";
import { ShellStatusBar } from "./ShellStatusBar";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { PrimarySidebar } from "./PrimarySidebar";
import { StudioActiveSurface } from "./StudioActiveSurface";
import {
  type ActiveSurface,
  type TargetDomainId,
} from "./navigationModel";
import { createSurfaceAvailability } from "./surfaceAvailability";
import { defaultNavigationIdBySurface } from "./studioSurfaceConfig";
import { hydrateGeneratedReportsFromWorkspace } from "./generatedReportHydration";
import { useCoreCommands } from "./useCoreCommands";
import { useStudioSelection } from "./useStudioSelection";

import {
  formatDashboardStatusLabel,
  formatUnknownBlock,
} from "./studioFormatters";

import type { WorkspaceInspection } from "./types/workspace";

function App() {
  const [workspace, setWorkspace] = useState<WorkspaceInspection | null>(null);
  const [generatedArtifactSummary, setGeneratedArtifactSummary] =
    useState<GeneratedArtifactDashboardSummary | null>(null);
  const [generatedEvidenceArtifactSummary, setGeneratedEvidenceArtifactSummary] =
    useState<GeneratedEvidenceArtifactSummary | null>(null);
  const [generatedArtifactRefreshToken, setGeneratedArtifactRefreshToken] =
    useState(0);
  const [activeSurface, setActiveSurface] =
    useState<ActiveSurface>("mission-dashboard");
  const [activeNavigationId, setActiveNavigationId] =
    useState<TargetDomainId>("mission");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  const {
    selectedFile,
    selectedGeneratedArtifact,
    selectedSimulationRecord,
    selectedCoreDomainEntity,
    selectedDetail,
    clearSelectedContext,
    clearSelectedSimulationRecord,
    selectWorkspace,
    selectCoreOutput,
    handleOpenFile,
    handleGeneratedArtifactSelectionChange,
    handleSelectSimulationRecord,
    handleSelectCoreDomainEntity,
  } = useStudioSelection({
    workspace,
  });

  const {
    coreExecutable,
    setCoreExecutable,
    coreResult,
    coreReportSnapshots,
    coreError,
    isRunningCoreCommand,
    resetCoreCommandState,
    hydrateCoreReportSnapshots,
    handleCoreVersion,
    handleCoreInspectMission,
    handleCoreLintMission,
    handleCoreExportModelSummary,
    handleCoreExportEntityIndex,
    handleCoreExportRelationshipManifest,
    handleCoreExportDashboardSummary,
    handleCoreExportScenarioRunIndex,
    handleCoreExportCoverageSummary,
    handleCoreSimScenario,
  } = useCoreCommands({
    workspace,
    onCoreOutput: selectCoreOutput,
    onScenarioExecutionStart: clearSelectedSimulationRecord,
    onGeneratedArtifactRefresh: () => {
      setGeneratedArtifactRefreshToken((current) => current + 1);
    },
  });

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

  async function handleOpenWorkspace() {
    setError(null);
    resetCoreCommandState();
    clearSelectedContext();
    setGeneratedArtifactSummary(null);
    setGeneratedEvidenceArtifactSummary(null);
    setGeneratedArtifactRefreshToken(0);
    setActiveSurface("mission-dashboard");
    setActiveNavigationId("mission");
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
      hydrateCoreReportSnapshots(generatedHydration.coreReportSnapshots);
      selectWorkspace(inspection);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsOpening(false);
    }
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

  const surfaceAvailability = createSurfaceAvailability(workspace);

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
          <StudioActiveSurface
            workspace={workspace}
            activeSurface={activeSurface}
            activeNavigationId={activeNavigationId}
            isOpening={isOpening}
            error={error}
            onOpenWorkspace={handleOpenWorkspace}
            onActiveSurfaceChange={handleActiveSurfaceChange}
            onPrimaryNavigationSelect={handlePrimaryNavigationSelect}
            coreExecutable={coreExecutable}
            coreResult={coreResult}
            coreReportSnapshots={coreReportSnapshots}
            coreError={coreError}
            isRunningCoreCommand={isRunningCoreCommand}
            selectedFile={selectedFile}
            selectedCoreDomainEntity={selectedCoreDomainEntity}
            generatedArtifactSummary={generatedArtifactSummary}
            generatedEvidenceArtifactSummary={generatedEvidenceArtifactSummary}
            generatedArtifactRefreshToken={generatedArtifactRefreshToken}
            onOpenFile={handleOpenFile}
            onRunScenario={handleCoreSimScenario}
            onSelectSimulationRecord={handleSelectSimulationRecord}
            onSelectCoreDomainEntity={handleSelectCoreDomainEntity}
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
            onGeneratedArtifactSummaryChange={setGeneratedArtifactSummary}
            onGeneratedArtifactSelectionChange={
              handleGeneratedArtifactSelectionChange
            }
            onGeneratedEvidenceArtifactSummaryChange={
              setGeneratedEvidenceArtifactSummary
            }
          />
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
