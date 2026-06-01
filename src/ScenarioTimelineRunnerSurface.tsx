import { ProvenanceBadge, StatusBadge } from "./Badges";
import type { GeneratedEvidenceArtifactSummary } from "./GeneratedArtifactExplorer";
import type {
  CoreCommandResult,
  CoreSimulationReport,
  ProjectEntry,
  WorkspaceInspection,
} from "./types/workspace";

export type ScenarioTimelineRecordKind =
  | "timeline"
  | "event"
  | "command"
  | "modeTransition"
  | "dataFlowEvidence"
  | "failedExpectation";

export interface ScenarioTimelineInspectorRecord {
  kind: ScenarioTimelineRecordKind;
  title: string;
  record: unknown;
}

interface ScenarioTimelineRunnerSurfaceProps {
  workspace: WorkspaceInspection;
  generatedEvidenceArtifactSummary: GeneratedEvidenceArtifactSummary | null;
  coreResult: CoreCommandResult | null;
  simulationReport: CoreSimulationReport | null;
  simulationReportSource: string | null;
  isRunningCoreCommand: boolean;
  onOpenFile: (entry: ProjectEntry) => void;
  onRunScenario: (entry: ProjectEntry) => void;
  onSelectSimulationRecord: (record: ScenarioTimelineInspectorRecord) => void;
}

interface ScenarioMetric {
  label: string;
  value: string;
  detail: string;
}

interface EvidenceLaneItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  kind: ScenarioTimelineRecordKind;
  record: unknown;
}

export function ScenarioTimelineRunnerSurface({
  workspace,
  generatedEvidenceArtifactSummary,
  coreResult,
  simulationReport,
  simulationReportSource,
  isRunningCoreCommand,
  onOpenFile,
  onRunScenario,
  onSelectSimulationRecord,
}: ScenarioTimelineRunnerSurfaceProps) {
  const scenarioFiles = workspace.scenario_files;
  const artifactCandidates = generatedEvidenceArtifactSummary
    ? [
        ...generatedEvidenceArtifactSummary.reportCandidates,
        ...generatedEvidenceArtifactSummary.logCandidates,
      ]
    : [];
  const metrics = createScenarioRunnerMetrics({
    scenarioFiles,
    simulationReport,
    generatedEvidenceArtifactSummary,
    artifactCandidates,
  });

  return (
    <section
      id="studio-evidence"
      className="entry-section scenario-timeline-runner-surface"
      aria-label="Scenario Timeline Runner"
    >
      <ScenarioTimelineRunnerHeader
        simulationReport={simulationReport}
        simulationReportSource={simulationReportSource}
      />

      <ScenarioRunnerStatusStrip metrics={metrics} />

      <ScenarioRunRail
        scenarioFiles={scenarioFiles}
        isRunningCoreCommand={isRunningCoreCommand}
        onOpenFile={onOpenFile}
        onRunScenario={onRunScenario}
      />

      <ScenarioTimelineCanvas
        simulationReport={simulationReport}
        onSelectSimulationRecord={onSelectSimulationRecord}
      />

      <ScenarioEvidenceLanes
        simulationReport={simulationReport}
        onSelectSimulationRecord={onSelectSimulationRecord}
      />

      <ScenarioReportDock
        coreResult={coreResult}
        generatedEvidenceArtifactSummary={generatedEvidenceArtifactSummary}
        artifactCandidates={artifactCandidates}
        onOpenFile={onOpenFile}
      />

      <ScenarioBoundaryPanel />
    </section>
  );
}

function ScenarioTimelineRunnerHeader({
  simulationReport,
  simulationReportSource,
}: {
  simulationReport: CoreSimulationReport | null;
  simulationReportSource: string | null;
}) {
  return (
    <header className="scenario-runner-hero">
      <div>
        <span className="cockpit-eyebrow">Scenario Timeline Runner</span>
        <h3>Scenario execution path</h3>
        <p>
          Select a scenario source, run it through the fixed Core wrapper, inspect
          the produced timeline and evidence lanes. Studio renders only Core
          simulation JSON evidence and never derives scenario state from YAML or logs.
        </p>
      </div>
      <div className="scenario-runner-hero-badges">
        <ProvenanceBadge label="READ-ONLY" />
        <ProvenanceBadge label="CORE-DERIVED" />
        <StatusBadge label="FIXED CORE WRAPPER" />
        <StatusBadge label={simulationReport ? simulationReport.result.toUpperCase() : "WAITING"} />
        {simulationReportSource ? <ProvenanceBadge label="REPORT SELECTED" /> : null}
      </div>
    </header>
  );
}

function ScenarioRunnerStatusStrip({ metrics }: { metrics: ScenarioMetric[] }) {
  return (
    <section className="scenario-runner-status-strip" aria-label="Scenario runner status">
      {metrics.map((metric) => (
        <article className="scenario-runner-status-card" key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <small>{metric.detail}</small>
        </article>
      ))}
    </section>
  );
}

function ScenarioRunRail({
  scenarioFiles,
  isRunningCoreCommand,
  onOpenFile,
  onRunScenario,
}: {
  scenarioFiles: ProjectEntry[];
  isRunningCoreCommand: boolean;
  onOpenFile: (entry: ProjectEntry) => void;
  onRunScenario: (entry: ProjectEntry) => void;
}) {
  return (
    <section className="scenario-runner-panel scenario-run-rail" aria-label="Scenario Source Run Rail">
      <div className="scenario-runner-panel-heading">
        <div>
          <span className="cockpit-eyebrow">Run targets</span>
          <h3>Scenario Source / Run Rail</h3>
          <p>YAML files are source targets only. Execution is available only through Core.</p>
        </div>
        <StatusBadge label={`${scenarioFiles.length} SCENARIOS`} />
      </div>

      {scenarioFiles.length > 0 ? (
        <div className="scenario-run-target-grid">
          {scenarioFiles.map((scenario, index) => (
            <article className="scenario-run-target" key={scenario.path}>
              <div className="scenario-run-target-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="scenario-run-target-main">
                <button
                  className="scenario-run-target-title"
                  type="button"
                  onClick={() => onOpenFile(scenario)}
                  disabled={scenario.kind !== "file"}
                >
                  {scenario.name}
                </button>
                <span title={scenario.path}>{formatCompactPath(scenario.path)}</span>
              </div>
              <div className="scenario-run-target-actions">
                <button
                  className="scenario-run-primary-action"
                  type="button"
                  onClick={() => onRunScenario(scenario)}
                  disabled={scenario.kind !== "file" || isRunningCoreCommand}
                >
                  {isRunningCoreCommand ? "Running through Core" : "Run through Core"}
                </button>
                <div className="badge-row artifact-entry-badges">
                  <ProvenanceBadge label="SOURCE" />
                  <StatusBadge label="SCENARIO SOURCE" />
                  <ProvenanceBadge label="READ-ONLY" />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <ScenarioRunnerEmptyState
          title="No scenario sources detected"
          detail="No YAML files were detected in the workspace scenarios area."
        />
      )}
    </section>
  );
}

function ScenarioTimelineCanvas({
  simulationReport,
  onSelectSimulationRecord,
}: {
  simulationReport: CoreSimulationReport | null;
  onSelectSimulationRecord: (record: ScenarioTimelineInspectorRecord) => void;
}) {
  const timeline = simulationReport?.timeline ?? [];

  return (
    <section className="scenario-runner-panel scenario-timeline-canvas" aria-label="Scenario Timeline Canvas">
      <div className="scenario-runner-panel-heading">
        <div>
          <span className="cockpit-eyebrow">Timeline</span>
          <h3>Core simulation path</h3>
          <p>Temporal records are rendered only from the selected Core simulation report.</p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label={`${timeline.length} RECORDS`} />
        </div>
      </div>

      {timeline.length > 0 ? (
        <div className="scenario-timeline-track" aria-label="Core timeline records">
          {timeline.map((entry, index) => (
            <button
              className="scenario-timeline-node"
              key={`${formatRecordTime(entry)}-${index}`}
              type="button"
              onClick={() =>
                onSelectSimulationRecord({
                  kind: "timeline",
                  title: getRecordTitle(entry, `Timeline step ${index + 1}`),
                  record: entry,
                })
              }
            >
              <span className="scenario-timeline-node-time">{formatRecordTime(entry)}</span>
              <strong>{getRecordTitle(entry, `Timeline step ${index + 1}`)}</strong>
              <small>{getRecordDetail(entry)}</small>
            </button>
          ))}
        </div>
      ) : (
        <div className="scenario-empty-runway" aria-label="Scenario timeline waiting state">
          <div className="scenario-empty-step">
            <span>01</span>
            <strong>Select scenario</strong>
            <small>Choose a source YAML run target.</small>
          </div>
          <div className="scenario-empty-step">
            <span>02</span>
            <strong>Run Core</strong>
            <small>Execute only through the fixed wrapper.</small>
          </div>
          <div className="scenario-empty-step">
            <span>03</span>
            <strong>Inspect timeline</strong>
            <small>Read Core JSON timeline and evidence records.</small>
          </div>
        </div>
      )}
    </section>
  );
}

function ScenarioEvidenceLanes({
  simulationReport,
  onSelectSimulationRecord,
}: {
  simulationReport: CoreSimulationReport | null;
  onSelectSimulationRecord: (record: ScenarioTimelineInspectorRecord) => void;
}) {
  const lanes = createEvidenceLanes(simulationReport);

  return (
    <section className="scenario-runner-panel scenario-evidence-lanes" aria-label="Scenario Evidence Lanes">
      <div className="scenario-runner-panel-heading">
        <div>
          <span className="cockpit-eyebrow">Evidence</span>
          <h3>Commands, events, modes and data-flow</h3>
          <p>No causality is inferred between lanes. Records are grouped only by Core-reported category.</p>
        </div>
        <ProvenanceBadge label="NO INFERENCE" />
      </div>

      <div className="scenario-evidence-lane-grid">
        {lanes.map((lane) => (
          <article className="scenario-evidence-lane" key={lane.title}>
            <header>
              <span>{lane.title}</span>
              <strong>{lane.items.length}</strong>
            </header>
            {lane.items.length > 0 ? (
              <div className="scenario-evidence-lane-items">
                {lane.items.slice(0, 5).map((item) => (
                  <button
                    className="scenario-evidence-lane-item"
                    key={item.id}
                    type="button"
                    onClick={() =>
                      onSelectSimulationRecord({
                        kind: item.kind,
                        title: item.title,
                        record: item.record,
                      })
                    }
                  >
                    <span>{item.time}</span>
                    <strong>{item.title}</strong>
                    <small>{item.detail}</small>
                  </button>
                ))}
              </div>
            ) : (
              <p>No Core records reported for this lane.</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function ScenarioReportDock({
  coreResult,
  generatedEvidenceArtifactSummary,
  artifactCandidates,
  onOpenFile,
}: {
  coreResult: CoreCommandResult | null;
  generatedEvidenceArtifactSummary: GeneratedEvidenceArtifactSummary | null;
  artifactCandidates: GeneratedEvidenceArtifactSummary["reportCandidates"];
  onOpenFile: (entry: ProjectEntry) => void;
}) {
  return (
    <section className="scenario-runner-panel scenario-report-dock" aria-label="Scenario Report And Log Dock">
      <div className="scenario-runner-panel-heading">
        <div>
          <span className="cockpit-eyebrow">Report dock</span>
          <h3>Core output, logs and passive candidates</h3>
          <p>Logs and generated artifacts are preview surfaces. They do not produce scenario state.</p>
        </div>
        <StatusBadge label={coreResult ? (coreResult.success ? "CORE PASS" : "CORE FAIL") : "NO CORE RUN"} />
      </div>

      <div className="scenario-report-dock-grid">
        <article>
          <span>Core command</span>
          <strong>{coreResult?.command ?? "not executed"}</strong>
          <small>{coreResult?.args.join(" ") || "No Core command result selected."}</small>
        </article>
        <article>
          <span>JSON report</span>
          <strong>{coreResult?.json_report_available ? "available" : "not available"}</strong>
          <small>{formatCompactPath(coreResult?.json_report_path)}</small>
        </article>
        <article>
          <span>Simulation log</span>
          <strong>{coreResult?.log_available ? "available" : "not available"}</strong>
          <small>{formatCompactPath(coreResult?.log_path)}</small>
        </article>
        <article>
          <span>Passive candidates</span>
          <strong>{generatedEvidenceArtifactSummary ? String(artifactCandidates.length) : "not inspected"}</strong>
          <small>Generated artifact inventory only.</small>
        </article>
      </div>

      {artifactCandidates.length > 0 ? (
        <div className="scenario-passive-candidate-strip">
          {artifactCandidates.slice(0, 6).map((artifact) => (
            <button
              type="button"
              key={artifact.path}
              onClick={() =>
                onOpenFile({
                  name: artifact.name,
                  path: artifact.path,
                  kind: "file",
                  category: "derivedReport",
                })
              }
            >
              <span>{artifact.artifactClass === "logs" ? "LOG" : "REPORT"}</span>
              <strong>{artifact.name}</strong>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ScenarioBoundaryPanel() {
  return (
    <section className="scenario-runner-panel scenario-boundary-panel" aria-label="Scenario Runner Boundary">
      <div className="scenario-runner-panel-heading">
        <div>
          <span className="cockpit-eyebrow">Boundary</span>
          <h3>Safety and provenance boundary</h3>
          <p>The runner is an inspection surface, not a mission-control system.</p>
        </div>
        <ProvenanceBadge label="READ-ONLY" />
      </div>
      <div className="scenario-boundary-grid">
        <span>Fixed Core command only</span>
        <span>Core JSON timeline only</span>
        <span>No live telemetry</span>
        <span>No command uplink</span>
        <span>No private simulation</span>
        <span>No log-derived state</span>
      </div>
    </section>
  );
}

function ScenarioRunnerEmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="scenario-runner-empty-state">
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

function createScenarioRunnerMetrics({
  scenarioFiles,
  simulationReport,
  generatedEvidenceArtifactSummary,
  artifactCandidates,
}: {
  scenarioFiles: ProjectEntry[];
  simulationReport: CoreSimulationReport | null;
  generatedEvidenceArtifactSummary: GeneratedEvidenceArtifactSummary | null;
  artifactCandidates: GeneratedEvidenceArtifactSummary["reportCandidates"];
}): ScenarioMetric[] {
  return [
    {
      label: "Scenario sources",
      value: String(scenarioFiles.length),
      detail: "YAML run targets detected in workspace.",
    },
    {
      label: "Simulation report",
      value: simulationReport ? simulationReport.result.toUpperCase() : "not selected",
      detail: simulationReport ? simulationReport.scenario : "Run Core or select a simulation JSON report.",
    },
    {
      label: "Timeline records",
      value: simulationReport ? String(simulationReport.timeline.length) : "0",
      detail: "Core-reported timeline entries only.",
    },
    {
      label: "Evidence lanes",
      value: simulationReport ? String(createEvidenceLanes(simulationReport).reduce((total, lane) => total + lane.items.length, 0)) : "0",
      detail: "Commands, events, modes, data-flow and expectations.",
    },
    {
      label: "Passive candidates",
      value: generatedEvidenceArtifactSummary ? String(artifactCandidates.length) : "not inspected",
      detail: "Generated report/log candidates are preview-only.",
    },
  ];
}

function createEvidenceLanes(simulationReport: CoreSimulationReport | null) {
  return [
    {
      title: "Commands",
      items: mapReportRecords(simulationReport?.commands ?? [], "command"),
    },
    {
      title: "Events",
      items: mapReportRecords(simulationReport?.events ?? [], "event"),
    },
    {
      title: "Mode transitions",
      items: mapReportRecords(simulationReport?.mode_transitions ?? [], "modeTransition"),
    },
    {
      title: "Data-flow",
      items: mapReportRecords(simulationReport?.data_flow_evidence ?? [], "dataFlowEvidence"),
    },
    {
      title: "Failed expectations",
      items: mapReportRecords(simulationReport?.failed_expectations ?? [], "failedExpectation"),
    },
  ];
}

function mapReportRecords(records: unknown[], kind: ScenarioTimelineRecordKind): EvidenceLaneItem[] {
  return records.map((record, index) => ({
    id: `${kind}-${index}`,
    title: getRecordTitle(record, `${formatKindLabel(kind)} ${index + 1}`),
    detail: getRecordDetail(record),
    time: formatRecordTime(record),
    kind,
    record,
  }));
}

function getRecordTitle(record: unknown, fallback: string): string {
  const objectRecord = toObjectRecord(record);
  const value =
    objectRecord.rendered ??
    objectRecord.command ??
    objectRecord.event ??
    objectRecord.name ??
    objectRecord.target ??
    objectRecord.data_product ??
    objectRecord.product ??
    objectRecord.mode ??
    objectRecord.to;

  return typeof value === "string" && value.trim() ? value : fallback;
}

function getRecordDetail(record: unknown): string {
  const objectRecord = toObjectRecord(record);
  const value = objectRecord.message ?? objectRecord.result ?? objectRecord.reason ?? objectRecord.status;

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  const keys = Object.keys(objectRecord).filter((key) => key !== "t" && key !== "time");
  return keys.length > 0 ? keys.slice(0, 4).join(" / ") : "Core record";
}

function formatRecordTime(record: unknown): string {
  const objectRecord = toObjectRecord(record);
  const value = objectRecord.t ?? objectRecord.time;

  if (typeof value === "number") {
    return `T+${value}`;
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return "T+?";
}

function formatKindLabel(kind: ScenarioTimelineRecordKind): string {
  return kind.replace(/([A-Z])/g, " $1").toLowerCase();
}

function formatCompactPath(value: string | null | undefined): string {
  if (!value) {
    return "not available";
  }

  const parts = value.split(/[\\/]/).filter(Boolean);
  return parts.length <= 4 ? value : `…/${parts.slice(-4).join("/")}`;
}

function toObjectRecord(record: unknown): Record<string, unknown> {
  return record && typeof record === "object" ? (record as Record<string, unknown>) : {};
}
