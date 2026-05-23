import { useState } from "react";
import Editor from "@monaco-editor/react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

import {
  GeneratedArtifactExplorerPanel,
  type GeneratedArtifactDashboardSummary,
  type GeneratedArtifactInspectorItem,
  type GeneratedEvidenceArtifactSummary,
} from "./GeneratedArtifactExplorer";
import { ProvenanceBadge, SeverityBadge, StatusBadge } from "./Badges";

import {
  parseCoreEntityIndex,
  parseCoreLintReport,
  parseCoreModelSummary,
  parseCoreRelationshipManifest,
  parseCoreSimulationReport,
} from "./coreReports";
import type {
  CoreCommandResult,
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
  FileContent,
  ProjectEntry,
  WorkspaceInspection,
} from "./types/workspace";

const nonGoalItems = [
  "No editing",
  "No artifact generation",
  "No generated file modification",
  "No scenario execution",
  "No mission control behavior",
  "No command uplink",
  "No live telemetry archive",
  "No private graph semantics",
  "No visual Mission Model editor",
];

const shellSurfaceItems = [
  { label: "Overview", status: "active", targetId: "studio-overview" },
  { label: "Model", status: "available", targetId: "studio-model" },
  { label: "Validation", status: "available", targetId: "studio-validation" },
  { label: "Contracts", status: "available", targetId: "studio-contracts" },
  { label: "Relationships", status: "available", targetId: "studio-relationships" },
  { label: "Artifacts", status: "available", targetId: "studio-artifacts" },
  { label: "Reports & Logs", status: "available", targetId: "studio-reports-logs" },
  { label: "Evidence", status: "available", targetId: "studio-evidence" },
  { label: "Ground", status: "reserved", targetId: "studio-future-surfaces" },
  { label: "Raw", status: "available", targetId: "studio-raw-output" },
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

function App() {
  const [workspace, setWorkspace] = useState<WorkspaceInspection | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [coreExecutable, setCoreExecutable] = useState("orbitfabric");
  const [coreResult, setCoreResult] = useState<CoreCommandResult | null>(null);
  const [generatedArtifactSummary, setGeneratedArtifactSummary] =
    useState<GeneratedArtifactDashboardSummary | null>(null);
  const [selectedGeneratedArtifact, setSelectedGeneratedArtifact] =
    useState<GeneratedArtifactInspectorItem | null>(null);
  const [generatedEvidenceArtifactSummary, setGeneratedEvidenceArtifactSummary] =
    useState<GeneratedEvidenceArtifactSummary | null>(null);
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
    setGeneratedArtifactSummary(null);
    setSelectedGeneratedArtifact(null);
    setGeneratedEvidenceArtifactSummary(null);
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
    setIsReadingFile(true);

    try {
      const file = await invoke<FileContent>("read_text_file", {
        workspacePath: workspace.selected_path,
        filePath: entry.path,
      });

      setSelectedFile(file);
    } catch (caught) {
      setViewerError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsReadingFile(false);
    }
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

  async function runCoreCommand(commandName: string, payload: Record<string, string>) {
    setCoreError(null);
    setCoreResult(null);
    setIsRunningCoreCommand(true);

    try {
      const result = await invoke<CoreCommandResult>(commandName, payload);
      setCoreResult(result);
    } catch (caught) {
      setCoreError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsRunningCoreCommand(false);
    }
  }

  const coreReportContent = coreResult?.json_report_content ?? null;
  const coreSimulationReport = parseCoreSimulationReport(coreReportContent);
  const selectedFileSimulationReport = parseCoreSimulationReport(
    selectedFile?.content ?? null,
  );
  const simulationReport = selectedFileSimulationReport ?? coreSimulationReport;
  const simulationReportSource = selectedFileSimulationReport
    ? "selected file preview"
    : coreSimulationReport
      ? "Core command output"
      : null;
  const hasCoreModelSummary = Boolean(parseCoreModelSummary(coreReportContent));
  const hasCoreEntityIndex = Boolean(parseCoreEntityIndex(coreReportContent));
  const hasCoreRelationshipManifest = Boolean(
    parseCoreRelationshipManifest(coreReportContent),
  );

  const surfaceAvailability: Record<string, boolean> = {
    Overview: true,
    Model: Boolean(workspace && workspace.source_model_files.length > 0),
    Validation: Boolean(workspace?.mission_dir),
    Contracts: hasCoreModelSummary || hasCoreEntityIndex,
    Relationships: hasCoreRelationshipManifest,
    Artifacts: Boolean(workspace),
    "Reports & Logs": Boolean(
      workspace && workspace.generated_locations.length > 0,
    ),
    Evidence: Boolean(workspace),
    Ground: false,
    Raw: Boolean(coreResult),
  };

  return (
    <main className="studio-app-shell">
      <WorkspaceHeader workspace={workspace} />

      <div className="workbench-layout">
        <PrimarySidebar surfaceAvailability={surfaceAvailability} />

        <section className="main-surface" aria-label="Studio main surface">
          <section
            id="studio-overview"
            className="hero-panel"
            aria-labelledby="studio-title"
          >
            <div className="eyebrow">OrbitFabric Studio</div>
            <h1 id="studio-title">Mission Contract Engineering Workbench</h1>
            <p className="release">v0.6.0 information architecture and UX foundation</p>
            <div className="badge-row hero-badge-row">
              <ProvenanceBadge label="READ-ONLY" />
              <ProvenanceBadge label="CORE-DERIVED" />
              <StatusBadge label="UX FOUNDATION" />
            </div>
            <p className="summary">
              Open a local OrbitFabric workspace, inspect Mission Model files, run
              fixed OrbitFabric Core validation and export commands, navigate
              Core-derived contracts and relationships, inspect generated artifacts,
              and review reserved future surfaces for scenario evidence and ground
              integration.
            </p>
            <p className="summary">
              Studio remains read-only. OrbitFabric Core remains authoritative for
              validation, generation, reports, artifact semantics and engineering
              meaning.
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

          <section className="grid" aria-label="workspace inspection">
            <article className="card">
              <h2>Primary loop</h2>
              <ol className="workflow-steps" aria-label="Studio primary workflow">
                {[
                  "Open",
                  "Inspect",
                  "Validate",
                  "Navigate",
                  "Explain Relationships",
                  "Inspect Generated Artifacts",
                  "Review Reserved Surfaces",
                ].map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p>
                Studio classifies workspace files and generated artifacts conservatively,
                renders Core-derived validation, domain, entity and relationship reports,
                previews supported generated text artifacts read-only, and keeps future
                Evidence and Ground surfaces explicitly reserved. It does not validate
                the Mission Model independently and does not infer mission semantics from
                generated artifacts.
              </p>
            </article>

            <article className="card warning-card">
              <h2>Not in this release</h2>
              <ul>
                {nonGoalItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </section>

          <WorkspaceDashboard
            workspace={workspace}
            coreResult={coreResult}
            generatedArtifactSummary={generatedArtifactSummary}
          />

          {workspace ? (
            <ScenarioEvidenceSurface
              workspace={workspace}
              generatedEvidenceArtifactSummary={generatedEvidenceArtifactSummary}
              simulationReport={simulationReport}
              simulationReportSource={simulationReportSource}
              onOpenFile={handleOpenFile}
            />
          ) : null}

          <ReservedFutureSurfaces />

          {workspace ? (
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
              onGeneratedArtifactSummaryChange={setGeneratedArtifactSummary}
              onGeneratedArtifactSelectionChange={setSelectedGeneratedArtifact}
              onGeneratedEvidenceArtifactSummaryChange={setGeneratedEvidenceArtifactSummary}
              onOpenFile={handleOpenFile}
            />
          ) : (
            <EmptyState />
          )}
        </section>

        <InspectorPanel
          workspace={workspace}
          selectedFile={selectedFile}
          selectedGeneratedArtifact={selectedGeneratedArtifact}
          coreResult={coreResult}
        />
      </div>
    </main>
  );
}

function WorkspaceHeader({ workspace }: { workspace: WorkspaceInspection | null }) {
  return (
    <header className="workspace-header" aria-label="Workspace header">
      <div>
        <div className="eyebrow">OrbitFabric Studio</div>
        <h2>Mission Contract Engineering Workbench</h2>
        <p>{workspace ? workspace.selected_path : "No workspace selected"}</p>
      </div>

      <div className="workspace-header-status">
        <ProvenanceBadge label="READ-ONLY" />
        <ProvenanceBadge label="CORE-DERIVED" />
        <StatusBadge label={workspace?.mission_dir ? "WORKSPACE OPEN" : "UNAVAILABLE"} />
      </div>
    </header>
  );
}

function PrimarySidebar({
  surfaceAvailability,
}: {
  surfaceAvailability: Record<string, boolean>;
}) {
  return (
    <nav className="primary-sidebar" aria-label="Studio surfaces">
      <h2>Surfaces</h2>
      <ul className="surface-nav-list">
        {shellSurfaceItems.map((item) => {
          const isReserved = item.status === "reserved";
          const isEnabled = !isReserved && Boolean(surfaceAvailability[item.label]);
          const displayedStatus = isReserved
            ? "reserved"
            : isEnabled
              ? item.status
              : "unavailable";

          return (
            <li key={item.label}>
              {isEnabled ? (
                <a className="surface-nav-item surface-nav-link" href={`#${item.targetId}`}>
                  <span>{item.label}</span>
                  <span className={`surface-status surface-status-${displayedStatus}`}>
                    {displayedStatus}
                  </span>
                </a>
              ) : (
                <span
                  className="surface-nav-item surface-nav-item-disabled"
                  aria-disabled="true"
                >
                  <span>{item.label}</span>
                  <span className={`surface-status surface-status-${displayedStatus}`}>
                    {displayedStatus}
                  </span>
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
  selectedFile,
  selectedGeneratedArtifact,
  coreResult,
}: {
  workspace: WorkspaceInspection | null;
  selectedFile: FileContent | null;
  selectedGeneratedArtifact: GeneratedArtifactInspectorItem | null;
  coreResult: CoreCommandResult | null;
}) {
  const hasSelection = Boolean(selectedFile || selectedGeneratedArtifact || coreResult || workspace);
  const selectedFileIsScenarioSource = Boolean(
    selectedFile &&
      workspace?.scenario_files.some((entry) => entry.path === selectedFile.path),
  );

  return (
    <aside className="contextual-inspector" aria-label="Contextual inspector">
      <div className="inspector-title-row">
        <div>
          <h2>Inspector</h2>
          <p>
            Read-only context for selected workspace objects. It reports identity,
            provenance, status and raw metadata without inventing links or implying
            editability.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="READ-ONLY" />
          <StatusBadge label={hasSelection ? "REPORTED" : "UNAVAILABLE"} />
        </div>
      </div>

      {!hasSelection ? (
        <div className="inspector-section inspector-empty-state">
          <h3>No selection</h3>
          <span>Open a workspace or select a source/generated artifact.</span>
        </div>
      ) : null}

      <div className="inspector-section">
        <h3>Workspace</h3>
        <span>Status: {workspace ? "open" : "not selected"}</span>
        {workspace ? <span>Path: {workspace.selected_path}</span> : null}
        {workspace?.mission_dir ? <span>Mission directory: {workspace.mission_dir}</span> : null}
        {workspace?.generated_dir ? <span>Generated directory: {workspace.generated_dir}</span> : null}
      </div>

      <div className="inspector-section">
        <h3>Selected object</h3>
        {selectedGeneratedArtifact ? (
          <>
            <div className="badge-row inspector-badge-row">
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
            <strong>{selectedGeneratedArtifact.name}</strong>
            <span>Class: {selectedGeneratedArtifact.artifactClass}</span>
            <span>Relative path: {selectedGeneratedArtifact.relativePath}</span>
            <span>Path: {selectedGeneratedArtifact.path}</span>
            <span>Size: {selectedGeneratedArtifact.sizeBytes} bytes</span>
            <span>Extension: {selectedGeneratedArtifact.extension ?? "none"}</span>
            <span>Provenance: {selectedGeneratedArtifact.provenanceSource}</span>
            {selectedGeneratedArtifact.provenanceDetail ? (
              <span>{selectedGeneratedArtifact.provenanceDetail}</span>
            ) : null}
          </>
        ) : selectedFile ? (
          <>
            <div className="badge-row inspector-badge-row">
              <ProvenanceBadge label="SOURCE" />
              {selectedFileIsScenarioSource ? <StatusBadge label="SCENARIO SOURCE" /> : null}
              <ProvenanceBadge label="READ-ONLY" />
              <ProvenanceBadge label="PREVIEW ONLY" />
            </div>
            <strong>{selectedFile.name}</strong>
            <span>Category: {selectedFileIsScenarioSource ? "scenario source" : "source preview"}</span>
            <span>Language: {selectedFile.language}</span>
            <span>Size: {selectedFile.size_bytes} bytes</span>
            <span>Path: {selectedFile.path}</span>
          </>
        ) : (
          <span>No source or generated artifact selected.</span>
        )}
      </div>

      <div className="inspector-section">
        <h3>Core output</h3>
        {coreResult ? (
          <>
            <div className="badge-row inspector-badge-row">
              <ProvenanceBadge label="CORE-DERIVED" />
              <StatusBadge label={coreResult.success ? "PASS" : "FAIL"} />
              {coreResult.json_report_available ? <StatusBadge label="REPORTED" /> : null}
            </div>
            <strong>{coreResult.command}</strong>
            <span>Args: {coreResult.args.join(" ") || "none"}</span>
            <span>Exit code: {coreResult.exit_code ?? "not available"}</span>
            <span>JSON report: {coreResult.json_report_available ? "available" : "not available"}</span>
            {coreResult.json_report_path ? <span>{coreResult.json_report_path}</span> : null}
          </>
        ) : (
          <span>No Core command result selected.</span>
        )}
      </div>

      <div className="inspector-section">
        <h3>Safety boundary</h3>
        <span>No editing.</span>
        <span>No automatic fixes.</span>
        <span>No private relationship inference.</span>
        <span>No generated artifact mutation.</span>
      </div>
    </aside>
  );
}


function ScenarioEvidenceSurface({
  workspace,
  generatedEvidenceArtifactSummary,
  simulationReport,
  simulationReportSource,
  onOpenFile,
}: {
  workspace: WorkspaceInspection;
  generatedEvidenceArtifactSummary: GeneratedEvidenceArtifactSummary | null;
  simulationReport: CoreSimulationReport | null;
  simulationReportSource: string | null;
  onOpenFile: (entry: ProjectEntry) => void;
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
          This slice lists scenario source files only. Core-produced scenario
          reports, timelines, expectations and evidence records will be rendered
          only after the corresponding Core output contract is verified.
        </p>
        <ul className="entry-list">
          <li>
            <div className="entry-main">
              <strong>No scenario execution command is introduced.</strong>
              <span className="category-badge category-derivedReport">boundary</span>
            </div>
          </li>
          <li>
            <div className="entry-main">
              <strong>No scenario status, expectations or timeline are inferred.</strong>
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

      <SimulationReportRecordsPanel simulationReport={simulationReport} />

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
            Data-flow evidence and failed expectation details are intentionally
            not expanded in this slice. Studio does not show passed expectations,
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
}: {
  simulationReport: CoreSimulationReport | null;
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
              This slice expands only timeline entries, events, commands and mode
              transitions already present in the Core simulation JSON report.
              Data-flow evidence and failed expectation details remain summarized
              until their dedicated rendering slice.
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
  generatedArtifactSummary,
}: {
  workspace: WorkspaceInspection | null;
  coreResult: CoreCommandResult | null;
  generatedArtifactSummary: GeneratedArtifactDashboardSummary | null;
}) {
  const lintReport = parseCoreLintReport(coreResult?.json_report_content ?? null);
  const hasReportsLocation = workspace?.generated_locations.some(
    (entry) => entry.name === "reports",
  );
  const hasLogsLocation = workspace?.generated_locations.some(
    (entry) => entry.name === "logs",
  );

  return (
    <section id="studio-dashboard" className="workspace-dashboard" aria-label="Workspace dashboard">
      <div className="file-viewer-header">
        <div>
          <h2>Workspace dashboard</h2>
          <p>
            Read-only overview of the selected workspace and currently available
            Core-derived outputs. This is not a mission operations dashboard.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="READ-ONLY" />
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="OVERVIEW" />
        </div>
      </div>

      <div className="dashboard-card-grid">
        <article className="dashboard-card">
          <h3>Mission summary</h3>
          <strong>{workspace ? "Workspace open" : "No workspace selected"}</strong>
          <span>{workspace?.selected_path ?? "Open a workspace to inspect it."}</span>
          <span>Mission directory: {workspace?.mission_dir ? "detected" : "not detected"}</span>
          <span>Generated directory: {workspace?.generated_dir ? "detected" : "not detected"}</span>
        </article>

        <article className="dashboard-card">
          <h3>Validation summary</h3>
          <strong>{lintReport ? lintReport.result : "Not available"}</strong>
          {lintReport ? (
            <>
              <span>Errors: {lintReport.summary.errors}</span>
              <span>Warnings: {lintReport.summary.warnings}</span>
              <span>Info: {lintReport.summary.info}</span>
            </>
          ) : (
            <span>Run Core lint to populate this summary.</span>
          )}
        </article>

        <article className="dashboard-card">
          <h3>Model surfaces</h3>
          <strong>{workspace ? `${workspace.source_model_files.length} source files` : "Not inspected"}</strong>
          <span>Missing expected files: {workspace?.missing_expected_source_files.length ?? 0}</span>
          <span>Scenario files: {workspace?.scenario_files.length ?? 0}</span>
          <span>Generated locations: {workspace?.generated_locations.length ?? 0}</span>
        </article>

        <article className="dashboard-card">
          <h3>Generated artifact inventory</h3>
          <strong>
            {generatedArtifactSummary
              ? `${generatedArtifactSummary.totalArtifacts} artifacts`
              : "Not inspected"}
          </strong>
          {generatedArtifactSummary ? (
            <>
              <span>Known: {generatedArtifactSummary.knownArtifacts}</span>
              <span>Unknown: {generatedArtifactSummary.unknownArtifacts}</span>
              <span>Previewable: {generatedArtifactSummary.previewableArtifacts}</span>
              <span>Not previewable: {generatedArtifactSummary.notPreviewableArtifacts}</span>
            </>
          ) : (
            <span>Run Generated Artifact Explorer to populate this summary.</span>
          )}
        </article>

        <article className="dashboard-card">
          <h3>Reports & Logs</h3>
          <strong>Generated locations</strong>
          <span>Reports: {hasReportsLocation ? "detected" : "not detected"}</span>
          <span>Logs: {hasLogsLocation ? "detected" : "not detected"}</span>
          <span>Core JSON report: {coreResult?.json_report_available ? "available" : "not available"}</span>
        </article>

        <article className="dashboard-card">
          <h3>Read-only boundary</h3>
          <strong>Enforced by current UI</strong>
          <span>No Mission Model editing</span>
          <span>No generated artifact editing</span>
          <span>No arbitrary command execution</span>
        </article>

        <article className="dashboard-card surface-card-anchor">
          <h3>Future surfaces</h3>
          <strong>Reserved</strong>
          <span>Evidence: reserved for Core-produced scenario evidence</span>
          <span>Ground: reserved for generated ground-facing artifacts</span>
          <span>Detailed reserved slots are shown below the dashboard.</span>
        </article>

        <article className="dashboard-card">
          <h3>Warnings</h3>
          <strong>{workspace?.warnings.length ?? 0} warnings</strong>
          {workspace && workspace.warnings.length > 0 ? (
            <ul className="dashboard-card-list">
              {workspace.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : (
            <span>No structural workspace warnings.</span>
          )}
        </article>
      </div>
    </section>
  );
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
  onCoreExecutableChange: (value: string) => void;
  onCoreVersion: () => void;
  onCoreInspectMission: () => void;
  onCoreLintMission: () => void;
  onCoreExportModelSummary: () => void;
  onCoreExportEntityIndex: () => void;
  onCoreExportRelationshipManifest: () => void;
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
        sourceModelFiles={workspace.source_model_files}
        onExecutableChange={onCoreExecutableChange}
        onVersion={onCoreVersion}
        onInspectMission={onCoreInspectMission}
        onLintMission={onCoreLintMission}
        onExportModelSummary={onCoreExportModelSummary}
        onExportEntityIndex={onCoreExportEntityIndex}
        onExportRelationshipManifest={onCoreExportRelationshipManifest}
        onOpenFile={onOpenFile}
      />

      <GeneratedArtifactExplorerPanel
        workspacePath={workspace.selected_path}
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
  sourceModelFiles,
  onExecutableChange,
  onVersion,
  onInspectMission,
  onLintMission,
  onExportModelSummary,
  onExportEntityIndex,
  onExportRelationshipManifest,
  onOpenFile,
}: {
  executable: string;
  result: CoreCommandResult | null;
  error: string | null;
  isRunning: boolean;
  hasMissionDir: boolean;
  sourceModelFiles: ProjectEntry[];
  onExecutableChange: (value: string) => void;
  onVersion: () => void;
  onInspectMission: () => void;
  onLintMission: () => void;
  onExportModelSummary: () => void;
  onExportEntityIndex: () => void;
  onExportRelationshipManifest: () => void;
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
  const parsedModelSummary = parseCoreModelSummary(result.json_report_content);
  const parsedEntityIndex = parseCoreEntityIndex(result.json_report_content);
  const parsedRelationshipManifest = parseCoreRelationshipManifest(result.json_report_content);
  const isModelSummaryCommand = result.args.includes("model-summary");
  const isEntityIndexCommand = result.args.includes("entity-index");
  const isRelationshipManifestCommand = result.args.includes("relationship-manifest");

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
      {result.json_report_content &&
      !parsedLintReport &&
      !parsedModelSummary &&
      !parsedEntityIndex &&
      !parsedRelationshipManifest ? (
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
