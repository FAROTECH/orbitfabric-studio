import { useState } from "react";
import Editor from "@monaco-editor/react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

import type {
  CoreCommandResult,
  CoreLintFinding,
  CoreLintReport,
  FileContent,
  ProjectEntry,
  WorkspaceInspection,
} from "./types/workspace";

const nonGoalItems = [
  "No editing",
  "No graph view",
  "No scenario runner",
  "No generator workbench",
  "No independent validation",
];

function App() {
  const [workspace, setWorkspace] = useState<WorkspaceInspection | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [coreExecutable, setCoreExecutable] = useState("orbitfabric");
  const [coreResult, setCoreResult] = useState<CoreCommandResult | null>(null);
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

  return (
    <main className="studio-shell">
      <section className="hero-panel" aria-labelledby="studio-title">
        <div className="eyebrow">OrbitFabric Studio</div>
        <h1 id="studio-title">Read-only Mission Project Viewer</h1>
        <p className="release">v0.1.0 workspace inspection slice</p>
        <p className="summary">
          Open a local OrbitFabric workspace and inspect its source model files,
          scenario sources and generated artifact locations. This view is
          structural only: OrbitFabric Core remains authoritative for validation
          and engineering meaning.
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
          <div className="loop">Open -&gt; Inspect</div>
          <p>
            Studio classifies files and directories conservatively. It does not
            validate the Mission Model and does not infer mission semantics.
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
          onOpenFile={handleOpenFile}
        />
      ) : (
        <EmptyState />
      )}
    </main>
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
        onOpenFile={onOpenFile}
      />

      <div className="workspace-layout">
        <div>
          <EntrySection
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
  onOpenFile: (entry: ProjectEntry) => void;
}) {
  return (
    <section className="core-panel" aria-label="OrbitFabric Core command status">
      <div className="file-viewer-header">
        <div>
          <h3>OrbitFabric Core command status</h3>
          <p>
            Runs only fixed Core commands and displays raw process output. The
            lint command writes a Core JSON report as a derived report. This
            slice opens Core-referenced source files only when the match is safe.
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
  const parsedReport = parseCoreLintReport(result.json_report_content);

  return (
    <div className="command-output">
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
      {result.json_report_content ? (
        <CoreValidationSummary
          report={parsedReport}
          rawContent={result.json_report_content}
          sourceModelFiles={sourceModelFiles}
          onOpenFile={onOpenFile}
        />
      ) : null}
      <pre>{result.stdout || "<empty stdout>"}</pre>
      {result.stderr ? <pre className="stderr-output">{result.stderr}</pre> : null}
    </div>
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
    return (
      <section className="entry-section muted-section" aria-label="Core JSON report status">
        <h3>Core validation summary</h3>
        <p>
          A Core JSON report was produced, but Studio did not recognize it as
          the current lint report shape. No diagnostics are inferred.
        </p>
        <div className="command-meta">
          <strong>Core JSON report content</strong>
          <span>{rawContent.length} bytes</span>
        </div>
      </section>
    );
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
        <span className="status-pill">Core-derived</span>
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
                <span className={`category-badge category-${severityCategory(finding.severity)}`}>
                  {finding.severity}
                </span>
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
  findingFile: string | null,
  sourceModelFiles: ProjectEntry[],
): ProjectEntry | null {
  if (!findingFile) {
    return null;
  }

  return (
    sourceModelFiles.find(
      (entry) => entry.kind === "file" && entry.name === findingFile,
    ) ?? null
  );
}

function severityCategory(severity: string): ProjectEntry["category"] {
  return severity === "ERROR" ? "derivedReport" : "generatedOutput";
}

function parseCoreLintReport(content: string | null): CoreLintReport | null {
  if (!content) {
    return null;
  }

  try {
    const parsed = JSON.parse(content) as Partial<CoreLintReport>;

    if (
      typeof parsed.tool !== "string" ||
      typeof parsed.version !== "string" ||
      typeof parsed.mission !== "string" ||
      typeof parsed.model_version !== "string" ||
      typeof parsed.result !== "string" ||
      !parsed.summary ||
      !Array.isArray(parsed.findings)
    ) {
      return null;
    }

    return parsed as CoreLintReport;
  } catch {
    return null;
  }
}

function EntrySection({
  title,
  entries,
  emptyText,
  onOpenFile,
}: {
  title: string;
  entries: ProjectEntry[];
  emptyText: string;
  onOpenFile: (entry: ProjectEntry) => void;
}) {
  return (
    <section className="entry-section">
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
        <span className="status-pill">Read-only</span>
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
