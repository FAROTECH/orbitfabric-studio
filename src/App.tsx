import { useState } from "react";
import Editor from "@monaco-editor/react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

import { CoverageSummaryPanel } from "./CoverageSummaryPanel";
import { DashboardSummaryPanel } from "./DashboardSummaryPanel";
import { ScenarioRunIndexPanel } from "./ScenarioRunIndexPanel";
import {
  GeneratedArtifactExplorerPanel,
  type GeneratedArtifactDashboardSummary,
  type GeneratedArtifactInspectorItem,
  type GeneratedEvidenceArtifactSummary,
} from "./GeneratedArtifactExplorer";
import { ProvenanceBadge, SeverityBadge, StatusBadge } from "./Badges";

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
  CoreSimulationJsonValue,
  CoreSimulationReport,
  CoreScenarioRunIndex,
  FileContent,
  ProjectEntry,
  WorkspaceInspection,
} from "./types/workspace";

const nonGoalItems = [
  "No editing",
  "No artifact generation",
  "No generated file modification",
  "No private scenario execution",
  "No mission control behavior",
  "No command uplink",
  "No live telemetry archive",
  "No private graph semantics",
  "No visual Mission Model editor",
];

type ActiveSurface =
  | "mission-dashboard"
  | "model-inventory"
  | "core-commands"
  | "contracts"
  | "relationships"
  | "generated-artifacts"
  | "reports-logs"
  | "scenario-evidence"
  | "reserved-ground"
  | "raw-output";

const shellSurfaceItems = [
  {
    label: "Mission",
    status: "active",
    targetId: "studio-dashboard",
    surface: "mission-dashboard",
    icon: "mission",
    caption: "Mission cockpit",
  },
  {
    label: "Model",
    status: "available",
    targetId: "studio-model",
    surface: "model-inventory",
    icon: "model",
    caption: "Model inventory",
  },
  {
    label: "Core",
    status: "available",
    targetId: "studio-validation",
    surface: "core-commands",
    icon: "core",
    caption: "Core commands",
  },
  {
    label: "Contracts",
    status: "available",
    targetId: "studio-contracts",
    surface: "contracts",
    icon: "contracts",
    caption: "Contract reports",
  },
  {
    label: "Relations",
    status: "available",
    targetId: "studio-relationships",
    surface: "relationships",
    icon: "relationships",
    caption: "Relationship data",
  },
  {
    label: "Artifacts",
    status: "available",
    targetId: "studio-artifacts",
    surface: "generated-artifacts",
    icon: "artifacts",
    caption: "Generated files",
  },
  {
    label: "Reports",
    status: "available",
    targetId: "studio-reports-logs",
    surface: "reports-logs",
    icon: "reports",
    caption: "Reports and logs",
  },
  {
    label: "Evidence",
    status: "available",
    targetId: "studio-evidence",
    surface: "scenario-evidence",
    icon: "evidence",
    caption: "Scenario evidence",
  },
  {
    label: "Ground",
    status: "reserved",
    targetId: "studio-future-surfaces",
    surface: "reserved-ground",
    icon: "ground",
    caption: "Reserved surface",
  },
  {
    label: "Raw",
    status: "available",
    targetId: "studio-raw-output",
    surface: "raw-output",
    icon: "raw",
    caption: "Raw output",
  },
] as const;

const reservedSurfaceItems = [
  {
    id: "studio-reserved-ground",
    title: "Ground Integration Artifact Viewer",
    milestone: "v0.8.0",
    summary:
      "Reserved for inspecting generated ground-facing artifacts without becoming a ground segment.",
    allowed: [
      "Inspect generated ground-facing artifacts",
      "Preview supported generated text artifacts",
      "Explain generated artifact provenance",
      "Keep ground artifacts read-only",
    ],
    forbidden: [
      "No command uplink",
      "No telemetry archive",
      "No live decoder behavior",
      "No ground segment operations",
    ],
  },
] as const;

type SimulationInspectorRecordKind =
  | "timeline"
  | "event"
  | "command"
  | "modeTransition"
  | "dataFlowEvidence"
  | "failedExpectation";

interface SimulationInspectorRecord {
  kind: SimulationInspectorRecordKind;
  title: string;
  record: unknown;
}

interface CoreReportSnapshots {
  lintReport: CoreLintReport | null;
  dashboardSummary: CoreDashboardSummary | null;
  scenarioRunIndex: CoreScenarioRunIndex | null;
  coverageSummary: CoreCoverageSummary | null;
  simulationReport: CoreSimulationReport | null;
}

type StudioDetailKind =
  | "workspace"
  | "source-file"
  | "generated-artifact"
  | "simulation-record"
  | "core-output";

interface StudioDetailSelection {
  kind: StudioDetailKind;
  title: string;
  source: string;
}

function createEmptyCoreReportSnapshots(): CoreReportSnapshots {
  return {
    lintReport: null,
    dashboardSummary: null,
    scenarioRunIndex: null,
    coverageSummary: null,
    simulationReport: null,
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
  const [activeSurface, setActiveSurface] =
    useState<ActiveSurface>("mission-dashboard");
  const [selectedDetail, setSelectedDetail] =
    useState<StudioDetailSelection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [coreError, setCoreError] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isRunningCoreCommand, setIsRunningCoreCommand] = useState(false);

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
    setActiveSurface("mission-dashboard");
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

      setWorkspace(inspection);
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
    setSelectedDetail({
      kind: "simulation-record",
      title: record.title,
      source: record.kind,
    });
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
    const dashboardSummary = parseCoreDashboardSummary(reportContent);
    const scenarioRunIndex = parseCoreScenarioRunIndex(reportContent);
    const coverageSummary = parseCoreCoverageSummary(reportContent);
    const simulationReport = parseCoreSimulationReport(reportContent);

    if (
      !lintReport &&
      !dashboardSummary &&
      !scenarioRunIndex &&
      !coverageSummary &&
      !simulationReport
    ) {
      return;
    }

    setCoreReportSnapshots((current) => ({
      lintReport: lintReport ?? current.lintReport,
      dashboardSummary: dashboardSummary ?? current.dashboardSummary,
      scenarioRunIndex: scenarioRunIndex ?? current.scenarioRunIndex,
      coverageSummary: coverageSummary ?? current.coverageSummary,
      simulationReport: simulationReport ?? current.simulationReport,
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
  const hasCoreModelSummary = Boolean(parseCoreModelSummary(coreReportContent));
  const hasCoreEntityIndex = Boolean(parseCoreEntityIndex(coreReportContent));
  const hasCoreRelationshipManifest = Boolean(
    parseCoreRelationshipManifest(coreReportContent),
  );

  const surfaceAvailability: Record<ActiveSurface, boolean> = {
    "mission-dashboard": true,
    "model-inventory": Boolean(workspace && workspace.source_model_files.length > 0),
    "core-commands": Boolean(workspace?.mission_dir),
    contracts: hasCoreModelSummary || hasCoreEntityIndex,
    relationships: hasCoreRelationshipManifest,
    "generated-artifacts": Boolean(workspace),
    "reports-logs": Boolean(workspace && workspace.generated_locations.length > 0),
    "scenario-evidence": Boolean(workspace),
    "reserved-ground": true,
    "raw-output": Boolean(coreResult),
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
              Temporary legacy surface for the cockpit pivot. This keeps existing
              read-only workspace, Core command, generated artifact and file viewer
              behavior available while the UI is split into compact dedicated
              surfaces.
            </p>
          </div>
          <div className="badge-row">
            <ProvenanceBadge label="READ-ONLY" />
            <StatusBadge label="LEGACY SURFACE" />
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
            className="hero-panel"
            aria-labelledby="studio-title"
          >
            <div className="eyebrow">OrbitFabric Studio</div>
            <h1 id="studio-title">Mission Contract Engineering Workbench</h1>
            <p className="release">v0.7.2 single-page cockpit foundation</p>
            <div className="badge-row hero-badge-row">
              <ProvenanceBadge label="READ-ONLY" />
              <ProvenanceBadge label="CORE-DERIVED" />
              <StatusBadge label="COCKPIT FOUNDATION" />
            </div>
            <p className="summary">
              Inspect mission contract state, Core reports, scenario evidence and
              generated artifacts from a compact read-only engineering cockpit.
            </p>
            <p className="summary">
              OrbitFabric Core remains authoritative. Studio visualizes reported
              evidence, provenance and generated artifacts without editing files,
              inferring semantics or introducing mission-control behavior.
            </p>
            <button
              className="primary-action"
              type="button"
              onClick={handleOpenWorkspace}
              disabled={isOpening}
            >
              {isOpening ? "Opening..." : "Open workspace"}
            </button>
            {error ? <p className="error-text">{error}</p> : null}
          </section>

          <EmptyState />
        </>
      );
    }

    if (activeSurface === "mission-dashboard") {
      return (
        <WorkspaceDashboard
          workspace={workspace}
          coreResult={coreResult}
          coreReportSnapshots={coreReportSnapshots}
          generatedArtifactSummary={generatedArtifactSummary}
          onActiveSurfaceChange={setActiveSurface}
        />
      );
    }

    if (activeSurface === "scenario-evidence") {
      return (
        <ScenarioEvidenceSurface
          workspace={workspace}
          generatedEvidenceArtifactSummary={generatedEvidenceArtifactSummary}
          coreResult={coreResult}
          simulationReport={simulationReport}
          simulationReportSource={simulationReportSource}
          isRunningCoreCommand={isRunningCoreCommand}
          onOpenFile={handleOpenFile}
          onRunScenario={handleCoreSimScenario}
          onSelectSimulationRecord={handleSelectSimulationRecord}
        />
      );
    }

    if (activeSurface === "reserved-ground") {
      return <ReservedFutureSurfaces />;
    }

    if (activeSurface === "model-inventory") {
      return renderLegacyWorkspaceSurface("Model Inventory");
    }

    if (activeSurface === "core-commands") {
      return renderLegacyWorkspaceSurface("Core Commands");
    }

    if (activeSurface === "contracts") {
      return renderLegacyWorkspaceSurface("Contracts");
    }

    if (activeSurface === "relationships") {
      return renderLegacyWorkspaceSurface("Relationships");
    }

    if (activeSurface === "generated-artifacts") {
      return renderLegacyWorkspaceSurface("Generated Artifacts");
    }

    if (activeSurface === "reports-logs") {
      return renderLegacyWorkspaceSurface("Reports and Logs");
    }

    if (activeSurface === "raw-output") {
      return renderLegacyWorkspaceSurface("Raw Core Output");
    }

    return null;
  }

  return (
    <main className="studio-app-shell">
      <WorkspaceHeader workspace={workspace} />

      <div
        className={`workbench-layout ${
          activeSurface === "mission-dashboard" ? "workbench-layout-dashboard" : ""
        }`}
      >
        <PrimarySidebar
          activeSurface={activeSurface}
          surfaceAvailability={surfaceAvailability}
          onActiveSurfaceChange={setActiveSurface}
        />

        <section className="main-surface" aria-label="Studio main surface">
          {renderActiveSurface()}
        </section>

        {activeSurface !== "mission-dashboard" ? (
          <InspectorPanel
            workspace={workspace}
            activeSurface={activeSurface}
            selectedFile={selectedFile}
            selectedGeneratedArtifact={selectedGeneratedArtifact}
            selectedSimulationRecord={selectedSimulationRecord}
            selectedDetail={selectedDetail}
            coreResult={coreResult}
          />
        ) : null}
      </div>
    </main>
  );
}

function WorkspaceHeader({ workspace }: { workspace: WorkspaceInspection | null }) {
  const workspaceName = workspace?.selected_path
    ? workspace.selected_path.split(/[\\/]/).filter(Boolean).slice(-1)[0]
    : "No workspace";

  return (
    <header className="workspace-header cockpit-command-bar" aria-label="Workspace command bar">
      <div className="cockpit-command-identity">
        <div className="cockpit-command-mark">OF</div>
        <div>
          <span className="cockpit-eyebrow">OrbitFabric Studio</span>
          <h2>Mission Contract Engineering Workbench</h2>
        </div>
      </div>

      <div className="cockpit-command-workspace" title={workspace?.selected_path ?? undefined}>
        <span>Workspace</span>
        <strong>{workspaceName}</strong>
        <small>{workspace?.selected_path ?? "Open a workspace to begin."}</small>
      </div>

      <div className="cockpit-command-actions" aria-label="Cockpit command status">
        <span className="cockpit-command-chip">Validate</span>
        <span className="cockpit-command-chip">Scenario</span>
        <span className="cockpit-command-chip">Artifacts</span>
        <span className="cockpit-command-chip cockpit-command-chip-muted">Read-only</span>
      </div>

      <div className="workspace-header-status cockpit-command-status">
        <ProvenanceBadge label="CORE-DERIVED" />
        <StatusBadge label={workspace?.mission_dir ? "WORKSPACE OPEN" : "UNAVAILABLE"} />
      </div>
    </header>
  );
}

function PrimarySidebar({
  activeSurface,
  surfaceAvailability,
  onActiveSurfaceChange,
}: {
  activeSurface: ActiveSurface;
  surfaceAvailability: Record<ActiveSurface, boolean>;
  onActiveSurfaceChange: (surface: ActiveSurface) => void;
}) {
  return (
    <nav className="primary-sidebar cockpit-sidebar" aria-label="Studio surfaces">
      <div className="cockpit-sidebar-brand">
        <div className="cockpit-sidebar-mark">OF</div>
        <div>
          <strong>Studio</strong>
          <span>Workbench</span>
        </div>
      </div>

      <ul className="surface-nav-list cockpit-surface-nav-list">
        {shellSurfaceItems.map((item) => {
          const isReserved = item.status === "reserved";
          const isActive = item.surface === activeSurface;
          const isEnabled = !isReserved && Boolean(surfaceAvailability[item.surface]);
          const displayedStatus = isActive
            ? "active"
            : isReserved
              ? "reserved"
              : isEnabled
                ? item.status
                : "unavailable";
          const itemClassName = [
            "surface-nav-item",
            "cockpit-surface-nav-item",
            isActive ? "surface-nav-item-active" : "",
            !isEnabled ? "surface-nav-item-disabled" : "",
            isReserved ? "surface-nav-item-reserved" : "",
          ]
            .filter(Boolean)
            .join(" ");

          const itemContent = (
            <>
              <DashboardIcon kind={item.icon} />
              <span className="surface-nav-copy">
                <strong>{item.label}</strong>
                <span>{item.caption}</span>
              </span>
              <span className={`surface-status surface-status-${displayedStatus}`}>
                {displayedStatus}
              </span>
            </>
          );

          return (
            <li key={item.label}>
              {isEnabled ? (
                <a
                  className={`${itemClassName} surface-nav-link`}
                  href={`#${item.targetId}`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => onActiveSurfaceChange(item.surface)}
                >
                  {itemContent}
                </a>
              ) : (
                <span className={itemClassName} aria-disabled="true">
                  {itemContent}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function InspectorPanel({
  workspace,
  activeSurface,
  selectedFile,
  selectedGeneratedArtifact,
  selectedSimulationRecord,
  selectedDetail,
  coreResult,
}: {
  workspace: WorkspaceInspection | null;
  activeSurface: ActiveSurface;
  selectedFile: FileContent | null;
  selectedGeneratedArtifact: GeneratedArtifactInspectorItem | null;
  selectedSimulationRecord: SimulationInspectorRecord | null;
  selectedDetail: StudioDetailSelection | null;
  coreResult: CoreCommandResult | null;
}) {
  const hasSelection = Boolean(
    selectedFile ||
      selectedGeneratedArtifact ||
      selectedSimulationRecord ||
      selectedDetail ||
      coreResult ||
      workspace,
  );
  const selectedFileIsScenarioSource = Boolean(
    selectedFile &&
      workspace?.scenario_files.some((entry) => entry.path === selectedFile.path),
  );

  const selectedTitle =
    selectedSimulationRecord?.title ??
    selectedGeneratedArtifact?.name ??
    selectedFile?.name ??
    selectedDetail?.title ??
    (workspace ? "Workspace inspection" : "No selection");

  const selectedKind =
    selectedSimulationRecord?.kind ??
    selectedGeneratedArtifact?.artifactClass ??
    (selectedFileIsScenarioSource
      ? "scenario source"
      : selectedFile
        ? "source file"
        : selectedDetail?.kind ?? "workspace");

  const selectedSource =
    selectedGeneratedArtifact?.relativePath ??
    selectedFile?.path ??
    selectedDetail?.source ??
    workspace?.selected_path ??
    "not available";
  const showInspectorSafetyBoundary =
    !workspace || activeSurface !== "mission-dashboard";

  return (
    <aside className="contextual-inspector workbench-inspector" aria-label="Contextual inspector">
      <div className="inspector-hero">
        <div className="inspector-hero-title">
          <DashboardIcon kind="evidence" />
          <div>
            <span className="cockpit-eyebrow">Inspector</span>
            <h2>Detail panel</h2>
          </div>
        </div>
        <div className="badge-row inspector-badge-row">
          <ProvenanceBadge label="READ-ONLY" />
          <StatusBadge label={hasSelection ? "REPORTED" : "UNAVAILABLE"} />
        </div>
      </div>

      <section className="inspector-object-card" aria-label="Inspector selected context">
        <div className="inspector-object-title">
          <div>
            <span className="cockpit-eyebrow">Selected context</span>
            <h3>{selectedTitle}</h3>
          </div>
          <StatusBadge label={formatDashboardStatusLabel(hasSelection ? selectedKind : null)} />
        </div>

        <div className="inspector-property-grid">
          <InspectorField label="Kind" value={selectedKind} />
          <InspectorField label="Source" value={formatInspectorPath(selectedSource)} title={selectedSource} />
        </div>
      </section>

      <section className="inspector-section-modern">
        <div className="inspector-section-heading">
          <h3>Workspace</h3>
          <StatusBadge label={workspace ? "OPEN" : "UNAVAILABLE"} />
        </div>

        <div className="inspector-property-grid">
          <InspectorField label="Status" value={workspace ? "open" : "not selected"} />
          <InspectorField
            label="Path"
            value={formatInspectorPath(workspace?.selected_path)}
            title={workspace?.selected_path}
          />
          <InspectorField
            label="Mission"
            value={formatInspectorPath(workspace?.mission_dir)}
            title={workspace?.mission_dir ?? undefined}
          />
          <InspectorField
            label="Generated"
            value={formatInspectorPath(workspace?.generated_dir)}
            title={workspace?.generated_dir ?? undefined}
          />
        </div>
      </section>

      <section className="inspector-section-modern">
        <div className="inspector-section-heading">
          <h3>Selected object</h3>
          <StatusBadge
            label={
              selectedSimulationRecord
                ? selectedSimulationRecord.kind.toUpperCase()
                : selectedGeneratedArtifact
                  ? selectedGeneratedArtifact.knownStatus
                  : selectedFile
                    ? "SOURCE"
                    : "UNAVAILABLE"
            }
          />
        </div>

        {selectedSimulationRecord ? (
          <>
            <div className="inspector-status-strip">
              <ProvenanceBadge label="CORE-DERIVED" />
              <ProvenanceBadge label="READ-ONLY" />
            </div>
            <div className="inspector-property-grid">
              <InspectorField label="Title" value={selectedSimulationRecord.title} />
              <InspectorField label="Kind" value={selectedSimulationRecord.kind} />
              <InspectorField label="Source" value="orbitfabric-sim JSON report" />
              <InspectorField label="Inference" value="none" />
            </div>
            <pre className="raw-output-block inspector-raw-block">
              {formatUnknownBlock(selectedSimulationRecord.record)}
            </pre>
          </>
        ) : selectedGeneratedArtifact ? (
          <>
            <div className="inspector-status-strip">
              <ProvenanceBadge label="GENERATED" />
              <StatusBadge
                label={selectedGeneratedArtifact.knownStatus === "known" ? "REPORTED" : "UNKNOWN"}
              />
              <StatusBadge
                label={
                  selectedGeneratedArtifact.previewStatus === "previewable"
                    ? "PREVIEW ONLY"
                    : "UNAVAILABLE"
                }
              />
            </div>
            <div className="inspector-property-grid">
              <InspectorField label="Name" value={selectedGeneratedArtifact.name} />
              <InspectorField label="Class" value={selectedGeneratedArtifact.artifactClass} />
              <InspectorField label="Relative path" value={selectedGeneratedArtifact.relativePath} />
              <InspectorField
                label="Path"
                value={formatInspectorPath(selectedGeneratedArtifact.path)}
                title={selectedGeneratedArtifact.path}
              />
              <InspectorField label="Size" value={`${selectedGeneratedArtifact.sizeBytes} bytes`} />
              <InspectorField label="Extension" value={selectedGeneratedArtifact.extension ?? "none"} />
              <InspectorField label="Provenance" value={selectedGeneratedArtifact.provenanceSource} />
              <InspectorField
                label="Detail"
                value={selectedGeneratedArtifact.provenanceDetail ?? "not reported"}
              />
            </div>
          </>
        ) : selectedFile ? (
          <>
            <div className="inspector-status-strip">
              <ProvenanceBadge label="SOURCE" />
              {selectedFileIsScenarioSource ? <StatusBadge label="SCENARIO SOURCE" /> : null}
              <ProvenanceBadge label="READ-ONLY" />
              <ProvenanceBadge label="PREVIEW ONLY" />
            </div>
            <div className="inspector-property-grid">
              <InspectorField label="Name" value={selectedFile.name} />
              <InspectorField
                label="Category"
                value={selectedFileIsScenarioSource ? "scenario source" : "source preview"}
              />
              <InspectorField label="Language" value={selectedFile.language} />
              <InspectorField label="Size" value={`${selectedFile.size_bytes} bytes`} />
              <InspectorField
                label="Path"
                value={formatInspectorPath(selectedFile.path)}
                title={selectedFile.path}
              />
            </div>
          </>
        ) : (
          <p className="inspector-empty-copy">No source or generated artifact selected.</p>
        )}
      </section>

      <section className="inspector-section-modern">
        <div className="inspector-section-heading">
          <h3>Core output</h3>
          <StatusBadge label={coreResult ? (coreResult.success ? "PASS" : "FAIL") : "UNAVAILABLE"} />
        </div>

        {coreResult ? (
          <>
            <div className="inspector-status-strip">
              <ProvenanceBadge label="CORE-DERIVED" />
              {coreResult.json_report_available ? <StatusBadge label="REPORTED" /> : null}
            </div>
            <div className="inspector-property-grid">
              <InspectorField label="Command" value={coreResult.command} />
              <InspectorField label="Args" value={coreResult.args.join(" ") || "none"} />
              <InspectorField label="Exit code" value={String(coreResult.exit_code ?? "not available")} />
              <InspectorField
                label="JSON report"
                value={coreResult.json_report_available ? "available" : "not available"}
              />
              <InspectorField
                label="Report path"
                value={formatInspectorPath(coreResult.json_report_path)}
                title={coreResult.json_report_path ?? undefined}
              />
              <InspectorField
                label="Log"
                value={coreResult.log_available ? "available" : "not available"}
              />
              <InspectorField
                label="Log path"
                value={formatInspectorPath(coreResult.log_path)}
                title={coreResult.log_path ?? undefined}
              />
            </div>
          </>
        ) : (
          <p className="inspector-empty-copy">No Core command result selected.</p>
        )}
      </section>

      {showInspectorSafetyBoundary ? (
        <section className="inspector-section-modern inspector-boundary-section">
          <div className="inspector-section-heading">
            <h3>Safety boundary</h3>
            <DashboardIcon kind="shield" />
          </div>

          <div className="inspector-guardrail-list">
            <span>No editing</span>
            <span>No automatic fixes</span>
            <span>No private relationship inference</span>
            <span>No generated artifact mutation</span>
          </div>
        </section>
      ) : null}
    </aside>
  );
}

function InspectorField({
  label,
  value,
  title,
}: {
  label: string;
  value: string | number | null | undefined;
  title?: string;
}) {
  return (
    <div className="inspector-field" title={title}>
      <span>{label}</span>
      <strong>{value === null || value === undefined || value === "" ? "not available" : value}</strong>
    </div>
  );
}

function formatInspectorPath(value: string | null | undefined): string {
  if (!value) {
    return "not available";
  }

  const parts = value.split(/[\\/]/).filter(Boolean);

  if (parts.length <= 3) {
    return value;
  }

  return `…/${parts.slice(-3).join("/")}`;
}




function ScenarioEvidenceSurface({
  workspace,
  generatedEvidenceArtifactSummary,
  coreResult,
  simulationReport,
  simulationReportSource,
  isRunningCoreCommand,
  onOpenFile,
  onRunScenario,
  onSelectSimulationRecord,
}: {
  workspace: WorkspaceInspection;
  generatedEvidenceArtifactSummary: GeneratedEvidenceArtifactSummary | null;
  coreResult: CoreCommandResult | null;
  simulationReport: CoreSimulationReport | null;
  simulationReportSource: string | null;
  isRunningCoreCommand: boolean;
  onOpenFile: (entry: ProjectEntry) => void;
  onRunScenario: (entry: ProjectEntry) => void;
  onSelectSimulationRecord: (record: SimulationInspectorRecord) => void;
}) {
  const scenarioFiles = workspace.scenario_files;
  const evidenceArtifactCandidates = generatedEvidenceArtifactSummary
    ? [
        ...generatedEvidenceArtifactSummary.reportCandidates,
        ...generatedEvidenceArtifactSummary.logCandidates,
      ]
    : [];

  return (
    <section
      id="studio-evidence"
      className="entry-section scenario-source-surface"
      aria-label="Scenario Evidence Explorer"
    >
      <div className="file-viewer-header">
        <div>
          <h3>Scenario Evidence Explorer</h3>
          <p>
            v0.7.0 starts with read-only scenario source inspection. Scenario
            sources are detected structurally from the workspace. Studio does not
            parse scenario YAML semantically, execute scenarios or infer evidence.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="SOURCE" />
          <StatusBadge label="SCENARIO SOURCE" />
          <ProvenanceBadge label="READ-ONLY" />
        </div>
      </div>

      <div className="summary-grid">
        <SummaryItem label="Scenario sources" value={String(scenarioFiles.length)} />
        <SummaryItem label="Execution" value="Not implemented" />
        <SummaryItem
          label="Simulation report"
          value={simulationReport ? simulationReport.result.toUpperCase() : "Not selected"}
        />
        <SummaryItem
          label="Passive report/log candidates"
          value={
            generatedEvidenceArtifactSummary
              ? String(evidenceArtifactCandidates.length)
              : "Run artifact inspection"
          }
        />
      </div>

      <section className="entry-section muted-section" aria-label="Scenario Evidence boundary">
        <h3>Current boundary</h3>
        <p>
          This surface renders scenario source files and Core-produced simulation
          JSON reports. Scenario execution, when triggered from Studio, is limited
          to a fixed `orbitfabric sim` wrapper with Studio-controlled report and
          log paths.
        </p>
        <ul className="entry-list">
          <li>
            <div className="entry-main">
              <strong>Scenario execution is available only through a fixed Core command.</strong>
              <span className="category-badge category-derivedReport">boundary</span>
            </div>
          </li>
          <li>
            <div className="entry-main">
              <strong>Scenario status, expectations and timeline are rendered only from Core JSON.</strong>
              <span className="category-badge category-derivedReport">boundary</span>
            </div>
          </li>
          <li>
            <div className="entry-main">
              <strong>No mission control, live telemetry or command uplink behavior exists.</strong>
              <span className="category-badge category-derivedReport">boundary</span>
            </div>
          </li>
        </ul>
      </section>

      <SimulationReportSummaryPanel
        simulationReport={simulationReport}
        simulationReportSource={simulationReportSource}
      />

      <SimulationReportRecordsPanel
        simulationReport={simulationReport}
        onSelectSimulationRecord={onSelectSimulationRecord}
      />

      <SimulationLogLinkPanel coreResult={coreResult} onOpenFile={onOpenFile} />

      <SimulationReportEvidencePanel
        simulationReport={simulationReport}
        onSelectSimulationRecord={onSelectSimulationRecord}
      />

      <section
        className="entry-section"
        aria-label="Passive scenario report and log discovery"
      >
        <h3>Passive report/log candidates</h3>
        <p>
          This section reuses the generated artifact inventory. Report and log
          files are only preview candidates here. Studio does not parse them as
          scenario evidence, does not infer scenario status and does not derive
          expectations or timelines from logs.
        </p>

        {generatedEvidenceArtifactSummary ? (
          <>
            <div className="summary-grid">
              <SummaryItem
                label="Report candidates"
                value={String(generatedEvidenceArtifactSummary.reportCandidates.length)}
              />
              <SummaryItem
                label="Log candidates"
                value={String(generatedEvidenceArtifactSummary.logCandidates.length)}
              />
              <SummaryItem label="Semantic parsing" value="Not performed" />
            </div>

            {evidenceArtifactCandidates.length > 0 ? (
              <ul className="entry-list">
                {evidenceArtifactCandidates.map((artifact) => (
                  <li key={artifact.path}>
                    <div className="entry-main">
                      <button
                        className="entry-button"
                        type="button"
                        onClick={() =>
                          onOpenFile({
                            name: artifact.name,
                            path: artifact.path,
                            kind: "file",
                            category: "derivedReport",
                          })
                        }
                      >
                        {artifact.name}
                      </button>
                      <div className="badge-row artifact-entry-badges">
                        <ProvenanceBadge label="GENERATED" />
                        <StatusBadge
                          label={artifact.artifactClass === "logs" ? "LOG" : "REPORT"}
                        />
                        <ProvenanceBadge label="READ-ONLY" />
                        <ProvenanceBadge label="PREVIEW ONLY" />
                      </div>
                    </div>
                    <span className="entry-path">{artifact.relativePath}</span>
                    <div className="command-meta">
                      <span>class: {artifact.artifactClass}</span>
                      <span>preview: {artifact.previewStatus}</span>
                      <span>status: {artifact.knownStatus}</span>
                      <span>{artifact.reason}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-text">
                No generated report or log artifacts were reported by the current
                generated artifact inventory.
              </p>
            )}
          </>
        ) : (
          <p className="empty-text">
            Run Generated Artifact Explorer to populate passive report/log candidate
            discovery. Until then, no evidence artifact is inferred.
          </p>
        )}
      </section>

      <section className="entry-section" aria-label="Scenario source files">
        <h3>Scenario source files</h3>
        {scenarioFiles.length > 0 ? (
          <ul className="entry-list">
            {scenarioFiles.map((scenario) => (
              <li key={scenario.path}>
                <div className="entry-main">
                  <button
                    className="entry-button"
                    type="button"
                    onClick={() => onOpenFile(scenario)}
                    disabled={scenario.kind !== "file"}
                  >
                    {scenario.name}
                  </button>
                  <button
                    className="entry-button"
                    type="button"
                    onClick={() => onRunScenario(scenario)}
                    disabled={scenario.kind !== "file" || isRunningCoreCommand}
                  >
                    {isRunningCoreCommand ? "Running through Core..." : "Run through Core"}
                  </button>
                  <div className="badge-row artifact-entry-badges">
                    <ProvenanceBadge label="SOURCE" />
                    <StatusBadge label="SCENARIO SOURCE" />
                    <ProvenanceBadge label="READ-ONLY" />
                  </div>
                </div>
                <span className="entry-path">{scenario.path}</span>
                <div className="command-meta">
                  <span>kind: {scenario.kind}</span>
                  <span>category: scenario source</span>
                  <span>semantic parsing: not performed by Studio</span>
                  <span>execution: fixed Core `orbitfabric sim` wrapper only</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-text">
            No scenario YAML files were detected in the workspace scenarios area.
          </p>
        )}
      </section>
    </section>
  );
}


function SimulationReportSummaryPanel({
  simulationReport,
  simulationReportSource,
}: {
  simulationReport: CoreSimulationReport | null;
  simulationReportSource: string | null;
}) {
  return (
    <section
      className={`entry-section ${simulationReport ? "" : "muted-section"}`}
      aria-label="Core simulation report summary"
    >
      <div className="file-viewer-header">
        <div>
          <h3>Core simulation report summary</h3>
          <p>
            Read-only rendering of the real OrbitFabric Core `orbitfabric-sim`
            JSON report. This slice shows only top-level identity, status and
            summary counts already present in Core output.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="SIMULATION REPORT" />
          <ProvenanceBadge label="READ-ONLY" />
        </div>
      </div>

      {simulationReport ? (
        <>
          <div className="summary-grid">
            <SummaryItem label="Mission" value={simulationReport.mission} />
            <SummaryItem label="Scenario" value={simulationReport.scenario} />
            <SummaryItem
              label="Result"
              value={simulationReport.result.toUpperCase()}
            />
            <SummaryItem label="Core version" value={simulationReport.version} />
            <SummaryItem
              label="Timeline entries"
              value={String(simulationReport.timeline.length)}
            />
            <SummaryItem
              label="Events"
              value={String(simulationReport.summary.events)}
            />
            <SummaryItem
              label="Commands"
              value={String(simulationReport.summary.commands)}
            />
            <SummaryItem
              label="Mode transitions"
              value={String(simulationReport.summary.mode_transitions)}
            />
            <SummaryItem
              label="Data-flow evidence"
              value={String(simulationReport.summary.data_flow_evidence)}
            />
            <SummaryItem
              label="Failed expectations"
              value={String(simulationReport.summary.failed_expectations)}
            />
            <SummaryItem label="Final mode" value={simulationReport.final_state.mode} />
            <SummaryItem
              label="Source"
              value={simulationReportSource ?? "Core simulation JSON"}
            />
          </div>

          <div className="badge-row inspector-badge-row">
            <StatusBadge
              label={simulationReport.result === "passed" ? "PASS" : "FAIL"}
            />
            <StatusBadge label="SUMMARY ONLY" />
            <ProvenanceBadge label="PREVIEW ONLY" />
          </div>

          <p>
            Timeline, event, command, mode transition, data-flow evidence and
            failed expectation sections are rendered only from structured Core
            simulation JSON fields. Studio does not show passed expectations,
            coverage, dedicated telemetry effects or produced data products
            unless Core exposes them as structured fields.
          </p>
        </>
      ) : (
        <p className="empty-text">
          No valid `orbitfabric-sim` JSON report is selected. Select a generated
          simulation JSON report candidate, or wait for a future controlled Run
          Scenario slice. Studio does not infer scenario status from non-simulation
          reports or logs.
        </p>
      )}
    </section>
  );
}


function SimulationReportRecordsPanel({
  simulationReport,
  onSelectSimulationRecord,
}: {
  simulationReport: CoreSimulationReport | null;
  onSelectSimulationRecord: (record: SimulationInspectorRecord) => void;
}) {
  return (
    <section
      className={`entry-section ${simulationReport ? "" : "muted-section"}`}
      aria-label="Core simulation timeline and records"
    >
      <div className="file-viewer-header">
        <div>
          <h3>Core simulation timeline and records</h3>
          <p>
            Read-only rendering of timeline entries, events, commands and mode
            transitions from the selected `orbitfabric-sim` JSON report. Studio
            does not derive these records from scenario YAML or logs.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="SIMULATION RECORDS" />
          <ProvenanceBadge label="READ-ONLY" />
        </div>
      </div>

      {simulationReport ? (
        <>
          <section className="entry-section muted-section" aria-label="Simulation record boundary">
            <h3>Record boundary</h3>
            <p>
              This slice expands timeline entries, events, commands and mode
              transitions already present in the Core simulation JSON report.
              Data-flow evidence and failed expectations are rendered separately
              from their own structured Core fields.
            </p>
          </section>

          <section className="entry-section" aria-label="Simulation timeline">
            <h3>Timeline</h3>
            {simulationReport.timeline.length > 0 ? (
              <ul className="entry-list">
                {simulationReport.timeline.map((entry, index) => (
                  <li key={`${entry.t}-${entry.time}-${index}`}>
                    <div className="entry-main">
                      <strong>{entry.rendered}</strong>
                      <StatusBadge label="TIMELINE" />
                      <button
                        className="entry-button"
                        type="button"
                        onClick={() =>
                          onSelectSimulationRecord({
                            kind: "timeline",
                            title: entry.rendered,
                            record: entry,
                          })
                        }
                      >
                        Inspect record
                      </button>
                    </div>
                    <div className="command-meta">
                      <span>t: {entry.t}</span>
                      <span>time: {entry.time}</span>
                      <span>message: {entry.message}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-text">No timeline entries are present in this Core report.</p>
            )}
          </section>

          <section className="entry-section" aria-label="Simulation events">
            <h3>Events</h3>
            {simulationReport.events.length > 0 ? (
              <ul className="entry-list">
                {simulationReport.events.map((event, index) => (
                  <li key={`${event.t}-${event.event_id}-${index}`}>
                    <div className="entry-main">
                      <strong>{event.event_id}</strong>
                      <StatusBadge label={event.severity} />
                      <button
                        className="entry-button"
                        type="button"
                        onClick={() =>
                          onSelectSimulationRecord({
                            kind: "event",
                            title: event.event_id,
                            record: event,
                          })
                        }
                      >
                        Inspect record
                      </button>
                    </div>
                    <div className="command-meta">
                      <span>t: {event.t}</span>
                      <span>severity: {event.severity}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-text">No events are present in this Core report.</p>
            )}
          </section>

          <section className="entry-section" aria-label="Simulation commands">
            <h3>Commands</h3>
            {simulationReport.commands.length > 0 ? (
              <ul className="entry-list">
                {simulationReport.commands.map((command, index) => (
                  <li key={`${command.t}-${command.command_id}-${index}`}>
                    <div className="entry-main">
                      <strong>{command.command_id}</strong>
                      <StatusBadge label={command.status} />
                      <button
                        className="entry-button"
                        type="button"
                        onClick={() =>
                          onSelectSimulationRecord({
                            kind: "command",
                            title: command.command_id,
                            record: command,
                          })
                        }
                      >
                        Inspect record
                      </button>
                    </div>
                    <div className="command-meta">
                      <span>t: {command.t}</span>
                      <span>dispatch: {command.dispatch}</span>
                      <span>status: {command.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-text">No commands are present in this Core report.</p>
            )}
          </section>

          <section className="entry-section" aria-label="Simulation mode transitions">
            <h3>Mode transitions</h3>
            {simulationReport.mode_transitions.length > 0 ? (
              <ul className="entry-list">
                {simulationReport.mode_transitions.map((transition, index) => (
                  <li key={`${transition.t}-${transition.from}-${transition.to}-${index}`}>
                    <div className="entry-main">
                      <strong>{transition.from}{" -> "}{transition.to}</strong>
                      <StatusBadge label="MODE CHANGE" />
                      <button
                        className="entry-button"
                        type="button"
                        onClick={() =>
                          onSelectSimulationRecord({
                            kind: "modeTransition",
                            title: `${transition.from} -> ${transition.to}`,
                            record: transition,
                          })
                        }
                      >
                        Inspect record
                      </button>
                    </div>
                    <div className="command-meta">
                      <span>t: {transition.t}</span>
                      <span>from: {transition.from}</span>
                      <span>to: {transition.to}</span>
                      <span>reason: {transition.reason}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-text">No mode transitions are present in this Core report.</p>
            )}
          </section>
        </>
      ) : (
        <p className="empty-text">
          No valid `orbitfabric-sim` JSON report is selected. Timeline and
          records are not inferred from source YAML, generated reports or logs.
        </p>
      )}
    </section>
  );
}


function SimulationLogLinkPanel({
  coreResult,
  onOpenFile,
}: {
  coreResult: CoreCommandResult | null;
  onOpenFile: (entry: ProjectEntry) => void;
}) {
  const logPath = coreResult?.log_path ?? null;
  const logAvailable = Boolean(coreResult?.log_available && logPath);

  return (
    <section
      className={`entry-section ${logAvailable ? "" : "muted-section"}`}
      aria-label="Core simulation log linkage"
    >
      <div className="file-viewer-header">
        <div>
          <h3>Core simulation log</h3>
          <p>
            Read-only linkage to the plain-text log produced by the controlled
            Core `orbitfabric sim --log` path. Studio previews the log as text
            only and does not derive evidence from it.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="LOG" />
          <ProvenanceBadge label="PREVIEW ONLY" />
        </div>
      </div>

      {logAvailable && logPath ? (
        <>
          <div className="summary-grid">
            <SummaryItem label="Log status" value="Available" />
            <SummaryItem label="Log path" value={logPath} />
          </div>
          <button
            className="entry-button"
            type="button"
            onClick={() =>
              onOpenFile({
                name: fileNameFromPath(logPath),
                path: logPath,
                kind: "file",
                category: "derivedReport",
              })
            }
          >
            Preview simulation log
          </button>
          <p>
            This preview is not evidence parsing. The structured simulation JSON
            report remains the source for status, timeline, records and evidence.
          </p>
        </>
      ) : (
        <p className="empty-text">
          No simulation log is linked to the current Core output. Run a scenario
          through the controlled Core command to produce a Studio-controlled log
          path.
        </p>
      )}
    </section>
  );
}

function fileNameFromPath(path: string): string {
  return path.split(/[\\/]/).pop() || "simulation.log";
}

function SimulationReportEvidencePanel({
  simulationReport,
  onSelectSimulationRecord,
}: {
  simulationReport: CoreSimulationReport | null;
  onSelectSimulationRecord: (record: SimulationInspectorRecord) => void;
}) {
  return (
    <section
      className={`entry-section ${simulationReport ? "" : "muted-section"}`}
      aria-label="Core simulation data-flow evidence and failed expectations"
    >
      <div className="file-viewer-header">
        <div>
          <h3>Core simulation data-flow evidence</h3>
          <p>
            Read-only rendering of `data_flow_evidence` and
            `failed_expectations` records already present in the selected
            `orbitfabric-sim` JSON report. Studio does not infer produced data
            products, passed expectations or coverage.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="EVIDENCE RECORDS" />
          <ProvenanceBadge label="READ-ONLY" />
        </div>
      </div>

      {simulationReport ? (
        <>
          <section className="entry-section muted-section" aria-label="Simulation evidence boundary">
            <h3>Evidence boundary</h3>
            <p>
              Data-flow records are shown as Core-reported evidence records only.
              They are not presented as proof of real onboard production,
              downlink completion or runtime storage behavior. Failed expectations
              are shown only when Core reports them.
            </p>
          </section>

          <section className="entry-section" aria-label="Simulation data-flow evidence">
            <h3>Data-flow evidence</h3>
            {simulationReport.data_flow_evidence.length > 0 ? (
              <ul className="entry-list">
                {simulationReport.data_flow_evidence.map((record, index) => (
                  <li key={`${record.t}-${record.data_product_id ?? "data-flow"}-${index}`}>
                    <div className="entry-main">
                      <strong>{record.data_product_id ?? "unnamed data-flow evidence"}</strong>
                      <StatusBadge label="DATA-FLOW EVIDENCE" />
                      <button
                        className="entry-button"
                        type="button"
                        onClick={() =>
                          onSelectSimulationRecord({
                            kind: "dataFlowEvidence",
                            title: record.data_product_id ?? "unnamed data-flow evidence",
                            record,
                          })
                        }
                      >
                        Inspect record
                      </button>
                    </div>
                    <div className="command-meta">
                      <span>t: {record.t}</span>
                      <span>producer: {record.producer ?? "not reported"}</span>
                      <span>producer type: {record.producer_type ?? "not reported"}</span>
                      <span>triggered by command: {record.triggered_by_command ?? "not reported"}</span>
                      <span>
                        storage intent: {formatSimulationValue(record.storage_intent)}
                      </span>
                      <span>
                        downlink intent: {formatSimulationValue(record.downlink_intent)}
                      </span>
                      <span>
                        eligible flows: {formatStringList(record.eligible_downlink_flows)}
                      </span>
                      <span>
                        contact windows: {formatStringList(record.contact_windows)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-text">
                No data-flow evidence records are present in this Core report.
              </p>
            )}
          </section>

          <section className="entry-section" aria-label="Simulation failed expectations">
            <h3>Failed expectations</h3>
            {simulationReport.failed_expectations.length > 0 ? (
              <ul className="entry-list">
                {simulationReport.failed_expectations.map((expectation, index) => (
                  <li key={`failed-expectation-${index}`}>
                    <div className="entry-main">
                      <strong>Failed expectation {index + 1}</strong>
                      <StatusBadge label="FAILED EXPECTATION" />
                      <button
                        className="entry-button"
                        type="button"
                        onClick={() =>
                          onSelectSimulationRecord({
                            kind: "failedExpectation",
                            title: `Failed expectation ${index + 1}`,
                            record: expectation,
                          })
                        }
                      >
                        Inspect record
                      </button>
                    </div>
                    <pre className="raw-output-block">
                      {formatSimulationBlock(expectation)}
                    </pre>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-text">
                No failed expectations are present in this Core report. Studio
                does not infer passed expectations from this absence.
              </p>
            )}
          </section>
        </>
      ) : (
        <p className="empty-text">
          No valid `orbitfabric-sim` JSON report is selected. Data-flow evidence
          and failed expectations are not inferred from source YAML, generated
          reports or logs.
        </p>
      )}
    </section>
  );
}

function formatStringList(value: string[] | undefined): string {
  return value && value.length > 0 ? value.join(", ") : "not reported";
}

function formatSimulationValue(value: CoreSimulationJsonValue | undefined): string {
  if (value === undefined) {
    return "not reported";
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}

function formatSimulationBlock(value: CoreSimulationJsonValue): string {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value, null, 2);
}

function formatUnknownBlock(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value, null, 2);
}


function ReservedFutureSurfaces() {
  return (
    <section
      id="studio-future-surfaces"
      className="reserved-surfaces-panel"
      aria-label="Reserved future Studio surfaces"
    >
      <div className="file-viewer-header">
        <div>
          <h2>Reserved future surfaces</h2>
          <p>
            This slot keeps the next ground-facing roadmap surface visible without
            implementing its domain logic. It is intentionally disabled in the primary
            navigation and does not provide ground operations, live mission behavior,
            command uplink or telemetry archive behavior.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="READ-ONLY" />
          <StatusBadge label="RESERVED" />
        </div>
      </div>

      <div className="reserved-surface-grid">
        {reservedSurfaceItems.map((surface) => (
          <article
            id={surface.id}
            key={surface.id}
            className="reserved-surface-card"
          >
            <div className="reserved-surface-header">
              <div>
                <h3>{surface.title}</h3>
                <span>{surface.milestone}</span>
              </div>
              <StatusBadge label="RESERVED" />
            </div>

            <p>{surface.summary}</p>

            <div className="reserved-surface-columns">
              <div>
                <h4>Allowed future scope</h4>
                <ul>
                  {surface.allowed.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4>Explicit non-goals</h4>
                <ul>
                  {surface.forbidden.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
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


function WorkspaceDashboard({
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
  const lintReport =
    parseCoreLintReport(currentReportContent) ?? coreReportSnapshots.lintReport;
  const dashboardSummary =
    parseCoreDashboardSummary(currentReportContent) ??
    coreReportSnapshots.dashboardSummary;
  const scenarioRunIndex =
    parseCoreScenarioRunIndex(currentReportContent) ??
    coreReportSnapshots.scenarioRunIndex;
  const coverageSummary =
    parseCoreCoverageSummary(currentReportContent) ??
    coreReportSnapshots.coverageSummary;
  const simulationReport =
    parseCoreSimulationReport(currentReportContent) ??
    coreReportSnapshots.simulationReport;

  const dashboardValidation = dashboardSummary?.validation ?? null;
  const validationResult = lintReport?.result ?? dashboardValidation?.result ?? null;
  const validationErrors =
    lintReport?.summary.errors ?? dashboardValidation?.errors ?? null;
  const validationWarnings =
    lintReport?.summary.warnings ?? dashboardValidation?.warnings ?? null;
  const validationInfo =
    lintReport?.summary.info ?? dashboardValidation?.info ?? null;

  const dashboardDomains = dashboardSummary?.model_domains.domains ?? [];
  const topEntityDomains = dashboardSummary
    ? dashboardTopEntries(dashboardSummary.entity_inventory.domains, 5)
    : [];
  const topRelationshipTypes = dashboardSummary
    ? dashboardTopEntries(dashboardSummary.relationship_inventory.relationship_types, 4)
    : [];
  const displayedIndexedScenarioRuns = scenarioRunIndex?.runs.slice(0, 3) ?? [];
  const topEntityCoverageRecords = coverageSummary
    ? dashboardTopCoverageRecords(coverageSummary.entity_coverage, 4)
    : [];
  const topExpectationCoverageTypes = coverageSummary
    ? dashboardTopEntries(
        Object.fromEntries(
          Object.entries(coverageSummary.expectation_coverage.by_type).map(
            ([expectationType, coverage]) => [expectationType, coverage.total],
          ),
        ),
        3,
      )
    : [];
  const unsupportedCoverageEntityDomains =
    coverageSummary?.unsupported.entity_domains ?? [];
  const unsupportedCoverageRelationshipTypes =
    coverageSummary?.unsupported.relationship_types ?? [];
  const generatedArtifactStatusItems = generatedArtifactSummary
    ? [
        ["Known", generatedArtifactSummary.knownArtifacts],
        ["Unknown", generatedArtifactSummary.unknownArtifacts],
        ["Previewable", generatedArtifactSummary.previewableArtifacts],
        ["Warnings", generatedArtifactSummary.warningCount],
      ]
    : [];
  const hasReportsLocation = workspace?.generated_locations.some(
    (entry) => entry.name === "reports",
  );
  const hasLogsLocation = workspace?.generated_locations.some(
    (entry) => entry.name === "logs",
  );
  const workspaceCockpitName = workspace?.selected_path
    ? workspace.selected_path.split(/[\\/]/).filter(Boolean).slice(-1)[0]
    : null;

  return (
    <section
      id="studio-dashboard"
      className="workspace-dashboard cockpit-dashboard"
      aria-label="Mission cockpit dashboard"
    >
      <div className="cockpit-status-strip">
        <div className="cockpit-status-main">
          <DashboardIcon kind="mission" />
          <div>
            <span className="cockpit-eyebrow">Mission cockpit</span>
            <h2>OrbitFabric Studio</h2>
          </div>
        </div>

        <div className="cockpit-status-metrics" aria-label="Workspace quick metrics">
          <div className="cockpit-status-chip">
            <strong>{workspace?.source_model_files.length ?? 0}</strong>
            <span>Sources</span>
          </div>
          <div className="cockpit-status-chip">
            <strong>{workspace?.scenario_files.length ?? 0}</strong>
            <span>Scenarios</span>
          </div>
          <div className="cockpit-status-chip">
            <strong>{workspace?.generated_locations.length ?? 0}</strong>
            <span>Generated</span>
          </div>
        </div>

        <div className="cockpit-status-workspace">
          <div className="badge-row">
            <ProvenanceBadge label="READ-ONLY" />
            <ProvenanceBadge label="CORE-DERIVED" />
            <StatusBadge label={workspace ? "WORKSPACE OPEN" : "UNAVAILABLE"} />
          </div>
          <strong title={workspace?.selected_path ?? undefined}>
            {workspaceCockpitName ?? "No workspace selected"}
          </strong>
          <span title={workspace?.selected_path ?? undefined}>
            {workspace?.selected_path ?? "Open a workspace to inspect it."}
          </span>
        </div>
      </div>

      <div className="cockpit-kpi-grid" aria-label="Mission cockpit status cards">
        <article className="cockpit-kpi-card">
          <DashboardIcon kind="validation" />
          <div>
            <h3>Validation</h3>
            <strong>{validationResult ?? "Unavailable"}</strong>
            <span>
              {validationErrors === null &&
              validationWarnings === null &&
              validationInfo === null
                ? "Run validation to populate status"
                : `Errors ${validationErrors ?? 0} · Warnings ${
                    validationWarnings ?? 0
                  } · Info ${validationInfo ?? 0}`}
            </span>
          </div>
          <StatusBadge label={formatDashboardStatusLabel(validationResult)} />
        </article>

        <article className="cockpit-kpi-card">
          <DashboardIcon kind="model" />
          <div>
            <h3>Model inventory</h3>
            <strong>
              {dashboardSummary
                ? `${dashboardSummary.entity_inventory.total_entities} entities`
                : workspace
                  ? `${workspace.source_model_files.length} files`
                  : "Unavailable"}
            </strong>
            <span>
              {dashboardSummary
                ? `${dashboardSummary.relationship_inventory.total_relationships} relationships`
                : "Core dashboard summary not loaded"}
            </span>
          </div>
          <button
            type="button"
            className="cockpit-card-action"
            onClick={() => onActiveSurfaceChange("model-inventory")}
            disabled={!workspace}
          >
            Detail
          </button>
        </article>

        <article className="cockpit-kpi-card">
          <DashboardIcon kind="scenario" />
          <div>
            <h3>Scenario runs</h3>
            <strong>
              {scenarioRunIndex
                ? `${scenarioRunIndex.summary.total} indexed`
                : "Unavailable"}
            </strong>
            <span>
              {scenarioRunIndex
                ? `${scenarioRunIndex.summary.passed} passed, ${scenarioRunIndex.summary.failed} failed`
                : "Run scenario-run-index"}
            </span>
          </div>
          <button
            type="button"
            className="cockpit-card-action"
            onClick={() => onActiveSurfaceChange("scenario-evidence")}
            disabled={!workspace}
          >
            Evidence
          </button>
        </article>

        <article className="cockpit-kpi-card">
          <DashboardIcon kind="coverage" />
          <div>
            <h3>Coverage</h3>
            <strong>{coverageSummary ? "Available" : "Unavailable"}</strong>
            <span>
              {coverageSummary
                ? `${coverageSummary.expectation_coverage.passed}/${coverageSummary.expectation_coverage.total} expectations`
                : "Run coverage-summary"}
            </span>
          </div>
          <button
            type="button"
            className="cockpit-card-action"
            onClick={() => onActiveSurfaceChange("reports-logs")}
            disabled={!workspace}
          >
            Report
          </button>
        </article>

        <article className="cockpit-kpi-card">
          <DashboardIcon kind="artifacts" />
          <div>
            <h3>Artifacts</h3>
            <strong>
              {generatedArtifactSummary
                ? `${generatedArtifactSummary.totalArtifacts} files`
                : "Unavailable"}
            </strong>
            <span>
              {generatedArtifactSummary
                ? `${generatedArtifactSummary.previewableArtifacts} previewable`
                : "Inspect generated artifacts"}
            </span>
          </div>
          <button
            type="button"
            className="cockpit-card-action"
            onClick={() => onActiveSurfaceChange("generated-artifacts")}
            disabled={!workspace}
          >
            Open
          </button>
        </article>
      </div>

      <div className="cockpit-work-grid">
        <article className="cockpit-panel cockpit-panel-large">
          <div className="cockpit-panel-header">
            <div>
              <span className="cockpit-eyebrow">Mission data contract</span>
              <h3>Core-derived contract map</h3>
            </div>
            <StatusBadge label={dashboardSummary ? "REPORTED" : "PARTIAL"} />
          </div>

          <div className="cockpit-domain-strip">
            {dashboardDomains.length > 0 ? (
              dashboardDomains.slice(0, 8).map((domain) => (
                <div className="cockpit-domain-chip" key={domain.id}>
                  <span>{domain.display_name}</span>
                  <strong>{domain.count}</strong>
                </div>
              ))
            ) : (
              <>
                <div className="cockpit-domain-chip">
                  <span>Source files</span>
                  <strong>{workspace?.source_model_files.length ?? 0}</strong>
                </div>
                <div className="cockpit-domain-chip">
                  <span>Scenarios</span>
                  <strong>{workspace?.scenario_files.length ?? 0}</strong>
                </div>
                <div className="cockpit-domain-chip">
                  <span>Generated</span>
                  <strong>{workspace?.generated_locations.length ?? 0}</strong>
                </div>
              </>
            )}
          </div>

          <div className="cockpit-two-column">
            <div className="cockpit-compact-list">
              <h4>Top entity domains</h4>
              {topEntityDomains.length > 0 ? (
                topEntityDomains.map(([domain, count]) => (
                  <div className="cockpit-row" key={domain}>
                    <span>{domain}</span>
                    <strong>{count}</strong>
                  </div>
                ))
              ) : (
                <p>No Core entity inventory loaded.</p>
              )}
            </div>

            <div className="cockpit-compact-list">
              <h4>Top relationships</h4>
              {topRelationshipTypes.length > 0 ? (
                topRelationshipTypes.map(([relationshipType, count]) => (
                  <div className="cockpit-row" key={relationshipType}>
                    <span>{relationshipType}</span>
                    <strong>{count}</strong>
                  </div>
                ))
              ) : (
                <p>No Core relationship inventory loaded.</p>
              )}
            </div>
          </div>
        </article>

        <article className="cockpit-panel">
          <div className="cockpit-panel-header">
            <div>
              <span className="cockpit-eyebrow">Activity</span>
              <h3>Recent evidence</h3>
            </div>
            <DashboardIcon kind="evidence" />
          </div>

          <div className="cockpit-compact-list">
            {displayedIndexedScenarioRuns.length > 0 ? (
              displayedIndexedScenarioRuns.map((run) => (
                <div className="cockpit-row" key={`${run.report_path}-${run.scenario}`}>
                  <span>{run.scenario}</span>
                  <strong>{run.result}</strong>
                </div>
              ))
            ) : (
              <p>No Core-indexed scenario runs loaded.</p>
            )}
          </div>

          <div className="cockpit-mini-status">
            <span>Latest sim</span>
            <strong>{simulationReport ? simulationReport.result : "not available"}</strong>
          </div>
        </article>

        <article className="cockpit-panel">
          <div className="cockpit-panel-header">
            <div>
              <span className="cockpit-eyebrow">Coverage</span>
              <h3>Reported scopes</h3>
            </div>
            <DashboardIcon kind="coverage" />
          </div>

          <div className="cockpit-compact-list">
            {topEntityCoverageRecords.length > 0 ? (
              topEntityCoverageRecords.map(([domain, coverage]) => (
                <div className="cockpit-row" key={domain}>
                  <span>{domain}</span>
                  <strong>
                    {coverage.covered}/{coverage.total}
                  </strong>
                </div>
              ))
            ) : (
              <p>No entity coverage records loaded.</p>
            )}
          </div>

          <div className="cockpit-mini-status">
            <span>Expectation types</span>
            <strong>{topExpectationCoverageTypes.length}</strong>
          </div>
        </article>

        <article className="cockpit-panel">
          <div className="cockpit-panel-header">
            <div>
              <span className="cockpit-eyebrow">Generated</span>
              <h3>Artifact state</h3>
            </div>
            <DashboardIcon kind="artifacts" />
          </div>

          <div className="cockpit-compact-list">
            {generatedArtifactStatusItems.length > 0 ? (
              generatedArtifactStatusItems.map(([label, value]) => (
                <div className="cockpit-row" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))
            ) : (
              <p>Generated artifact inventory not inspected.</p>
            )}
          </div>

          <button
            type="button"
            className="cockpit-secondary-action"
            onClick={() => onActiveSurfaceChange("generated-artifacts")}
            disabled={!workspace}
          >
            Open artifact surface
          </button>
        </article>

        <article className="cockpit-panel cockpit-boundary-panel">
          <div className="cockpit-panel-header">
            <div>
              <span className="cockpit-eyebrow">Boundary</span>
              <h3>Read-only guardrails</h3>
            </div>
            <DashboardIcon kind="shield" />
          </div>

          <div className="cockpit-guardrail-grid">
            <span>No editing</span>
            <span>No uplink</span>
            <span>No live telemetry</span>
            <span>No private coverage</span>
          </div>

          <div className="cockpit-mini-status">
            <span>Reports</span>
            <strong>{hasReportsLocation ? "detected" : "not detected"}</strong>
          </div>
          <div className="cockpit-mini-status">
            <span>Logs</span>
            <strong>{hasLogsLocation ? "detected" : "not detected"}</strong>
          </div>
        </article>
      </div>

      <div className="cockpit-footer">
        <div>
          <strong>Unsupported coverage scopes</strong>
          <span>
            Entities:{" "}
            {unsupportedCoverageEntityDomains.length > 0
              ? unsupportedCoverageEntityDomains.join(", ")
              : "none reported"}
          </span>
          <span>
            Relationships:{" "}
            {unsupportedCoverageRelationshipTypes.length > 0
              ? unsupportedCoverageRelationshipTypes.join(", ")
              : "none reported"}
          </span>
        </div>
        <button
          type="button"
          className="cockpit-secondary-action"
          onClick={() => onActiveSurfaceChange("core-commands")}
          disabled={!workspace}
        >
          Run Core commands
        </button>
      </div>
    </section>
  );
}

type DashboardIconKind =
  | "mission"
  | "validation"
  | "model"
  | "scenario"
  | "coverage"
  | "artifacts"
  | "evidence"
  | "shield"
  | "core"
  | "contracts"
  | "relationships"
  | "reports"
  | "ground"
  | "raw";

function DashboardIcon({ kind }: { kind: DashboardIconKind }) {
  const iconPath = {
    mission: "M12 3l7 4v10l-7 4-7-4V7l7-4z M12 7v10 M5 7l7 4 7-4",
    validation: "M5 12l4 4L19 6 M4 4h16v16H4z",
    model: "M4 5h7v7H4z M13 5h7v7h-7z M4 14h7v5H4z M13 14h7v5h-7z",
    scenario: "M4 6h5l3 6 3-6h5 M4 18h5l3-6 3 6h5",
    coverage: "M12 20a8 8 0 1 0-8-8 M12 12l5-5 M12 12v8",
    artifacts: "M6 4h9l3 3v13H6z M15 4v4h4 M8 12h8 M8 16h6",
    evidence: "M5 5h14v10H8l-3 3z M8 9h8 M8 12h6",
    shield: "M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z",
    core: "M8 9h8 M8 15h8 M5 6h14v12H5z",
    contracts: "M7 4h10v16H7z M9 8h6 M9 12h6 M9 16h4",
    relationships: "M6 7a2 2 0 1 0 0.1 0 M18 7a2 2 0 1 0 0.1 0 M12 17a2 2 0 1 0 0.1 0 M8 8l3 7 M16 8l-3 7 M8 7h8",
    reports: "M5 4h14v16H5z M8 8h8 M8 12h8 M8 16h5",
    ground: "M4 18h16 M7 18l5-12 5 12 M9 13h6",
    raw: "M8 8l-4 4 4 4 M16 8l4 4-4 4 M13 6l-2 12",
  }[kind];

  return (
    <span className={`dashboard-icon dashboard-icon-${kind}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" role="img">
        <path d={iconPath} />
      </svg>
    </span>
  );
}


function formatDashboardRatio(value: number | null | undefined): string {
  return value === null || value === undefined ? "not reported" : String(value);
}

function formatDashboardStatusLabel(value: string | null): string {
  return value ? value.toUpperCase() : "UNAVAILABLE";
}

function formatDashboardDomainState(present: boolean): string {
  return present ? "present" : "missing";
}

function dashboardTopEntries(
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

function dashboardTopCoverageRecords(
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

function EntrySection({
  id,
  title,
  entries,
  emptyText,
  onOpenFile,
}: {
  id?: string;
  title: string;
  entries: ProjectEntry[];
  emptyText: string;
  onOpenFile: (entry: ProjectEntry) => void;
}) {
  return (
    <section id={id} className="entry-section">
      <h3>{title}</h3>
      {entries.length > 0 ? (
        <ul className="entry-list">
          {entries.map((entry) => (
            <li key={entry.path}>
              <div className="entry-main">
                <button
                  className="entry-button"
                  type="button"
                  onClick={() => onOpenFile(entry)}
                  disabled={entry.kind !== "file"}
                >
                  {entry.name}
                </button>
                <span className={`category-badge category-${entry.category}`}>
                  {formatCategory(entry.category)}
                </span>
              </div>
              <span className="entry-path">{entry.path}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-text">{emptyText}</p>
      )}
    </section>
  );
}

function FileViewer({
  selectedFile,
  viewerError,
  isReadingFile,
}: {
  selectedFile: FileContent | null;
  viewerError: string | null;
  isReadingFile: boolean;
}) {
  return (
    <aside className="file-viewer" aria-label="Read-only file viewer">
      <div className="file-viewer-header">
        <div>
          <h3>Read-only file viewer</h3>
          <p>
            Files are displayed as text only. Studio does not edit or validate
            their content.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="SOURCE" />
          <ProvenanceBadge label="READ-ONLY" />
          <ProvenanceBadge label="PREVIEW ONLY" />
        </div>
      </div>

      {viewerError ? <p className="error-text">{viewerError}</p> : null}

      {isReadingFile ? <p className="empty-text">Reading file...</p> : null}

      {!selectedFile && !isReadingFile ? (
        <p className="empty-text">Select a source or scenario file to inspect it.</p>
      ) : null}

      {selectedFile ? (
        <div className="editor-shell">
          <div className="editor-meta">
            <strong>{selectedFile.name}</strong>
            <span>{selectedFile.size_bytes} bytes</span>
            <span>{selectedFile.path}</span>
          </div>
          <Editor
            height="520px"
            language={selectedFile.language}
            value={selectedFile.content}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              automaticLayout: true,
            }}
          />
        </div>
      ) : null}
    </aside>
  );
}

function MissingFiles({ files }: { files: string[] }) {
  if (files.length === 0) {
    return null;
  }

  return (
    <section className="entry-section muted-section">
      <h3>Expected source files not detected</h3>
      <p>
        Missing files are reported structurally. This is not a validation result.
      </p>
      <ul className="missing-list">
        {files.map((file) => (
          <li key={file}>{file}</li>
        ))}
      </ul>
    </section>
  );
}

function formatCategory(category: ProjectEntry["category"]) {
  switch (category) {
    case "sourceModel":
      return "source model";
    case "scenarioSource":
      return "scenario source";
    case "derivedReport":
      return "derived report";
    case "generatedOutput":
      return "generated output";
  }
}

export default App;
