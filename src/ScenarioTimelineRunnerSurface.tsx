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

type PassiveArtifactCandidate =
  | GeneratedEvidenceArtifactSummary["reportCandidates"][number]
  | GeneratedEvidenceArtifactSummary["logCandidates"][number];

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

interface EvidenceLane {
  title: string;
  label: string;
  items: EvidenceLaneItem[];
}

interface RunwayStage {
  id: string;
  label: string;
  detail: string;
  state: string;
  tone: "ready" | "waiting" | "running" | "reported" | "empty";
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
  const artifactCandidates: PassiveArtifactCandidate[] = generatedEvidenceArtifactSummary
    ? [
        ...generatedEvidenceArtifactSummary.reportCandidates,
        ...generatedEvidenceArtifactSummary.logCandidates,
      ]
    : [];
  const evidenceLanes = createEvidenceLanes(simulationReport);
  const evidenceCount = countEvidenceLaneItems(evidenceLanes);
  const metrics = createScenarioRunnerMetrics({
    scenarioFiles,
    simulationReport,
    generatedEvidenceArtifactSummary,
    artifactCandidates,
    evidenceCount,
  });
  const runwayStages = createRunwayStages({
    scenarioFiles,
    coreResult,
    simulationReport,
    simulationReportSource,
    isRunningCoreCommand,
    evidenceCount,
  });

  return (
    <section
      id="studio-evidence"
      className="entry-section scenario-timeline-runner-surface"
      aria-label="Scenario Runway Console"
    >
      <ScenarioTimelineRunnerHeader simulationReport={simulationReport} />

      <ScenarioRunwaySpine stages={runwayStages} />

      <ScenarioRunnerStatusStrip metrics={metrics} />

      <ScenarioRunTargetBay
        scenarioFiles={scenarioFiles}
        simulationReport={simulationReport}
        isRunningCoreCommand={isRunningCoreCommand}
        onOpenFile={onOpenFile}
        onRunScenario={onRunScenario}
      />

      <TemporalRadarCanvas
        simulationReport={simulationReport}
        evidenceLanes={evidenceLanes}
        onSelectSimulationRecord={onSelectSimulationRecord}
      />

      <ScenarioEvidenceLaneStrips
        lanes={evidenceLanes}
        onSelectSimulationRecord={onSelectSimulationRecord}
      />

      <ScenarioReportDock
        coreResult={coreResult}
        generatedEvidenceArtifactSummary={generatedEvidenceArtifactSummary}
        artifactCandidates={artifactCandidates}
        onOpenFile={onOpenFile}
      />

      <ScenarioGuardrailStrip />
    </section>
  );
}

function ScenarioTimelineRunnerHeader({
  simulationReport,
}: {
  simulationReport: CoreSimulationReport | null;
}) {
  return (
    <header className="scenario-runner-hero scenario-runway-hero">
      <div>
        <span className="cockpit-eyebrow">Scenario Runway Console</span>
        <h3>Core-derived execution trace</h3>
        <p>
          From scenario source to inspection evidence. Studio shows the Core simulation
          trace only: source target, fixed wrapper, JSON report, temporal markers,
          evidence lanes and inspector endpoint.
        </p>
      </div>
      <div className="scenario-runner-hero-badges">
        <ProvenanceBadge label="READ-ONLY" />
        <ProvenanceBadge label="CORE-DERIVED" />
        <StatusBadge label="FIXED WRAPPER" />
        <StatusBadge label={simulationReport ? simulationReport.result.toUpperCase() : "WAITING"} />
      </div>
    </header>
  );
}

function ScenarioRunwaySpine({ stages }: { stages: RunwayStage[] }) {
  return (
    <section className="scenario-runway-spine" aria-label="Scenario runway stages">
      {stages.map((stage, index) => (
        <article className={`scenario-runway-stage scenario-runway-stage-${stage.tone}`} key={stage.id}>
          <div className="scenario-runway-stage-index">{String(index + 1).padStart(2, "0")}</div>
          <div className="scenario-runway-stage-main">
            <span>{stage.label}</span>
            <strong>{stage.state}</strong>
            <small>{stage.detail}</small>
          </div>
        </article>
      ))}
    </section>
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

function ScenarioRunTargetBay({
  scenarioFiles,
  simulationReport,
  isRunningCoreCommand,
  onOpenFile,
  onRunScenario,
}: {
  scenarioFiles: ProjectEntry[];
  simulationReport: CoreSimulationReport | null;
  isRunningCoreCommand: boolean;
  onOpenFile: (entry: ProjectEntry) => void;
  onRunScenario: (entry: ProjectEntry) => void;
}) {
  return (
    <section className="scenario-runner-panel scenario-run-target-bay" aria-label="Scenario Run Target Bay">
      <div className="scenario-runner-panel-heading">
        <div>
          <span className="cockpit-eyebrow">Run target bay</span>
          <h3>Scenario sources ready for Core execution</h3>
          <p>Scenario YAML is treated as a run target. Studio does not parse it into private scenario state.</p>
        </div>
        <StatusBadge label={`${scenarioFiles.length} TARGETS`} />
      </div>

      {scenarioFiles.length > 0 ? (
        <div className="scenario-run-target-grid scenario-launch-bay-grid">
          {scenarioFiles.map((scenario, index) => {
            const state = getScenarioTargetState(scenario, simulationReport, isRunningCoreCommand);

            return (
              <article className={`scenario-run-target scenario-run-target-${state.tone}`} key={scenario.path}>
                <div className="scenario-run-target-index">{String(index + 1).padStart(2, "0")}</div>
                <div className="scenario-run-target-main">
                  <div className="scenario-run-target-state-row">
                    <StatusBadge label={state.label} />
                  </div>
                  <button
                    className="scenario-run-target-title"
                    type="button"
                    onClick={() => onOpenFile(scenario)}
                    disabled={scenario.kind !== "file"}
                  >
                    {stripYamlExtension(scenario.name)}
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
                    <StatusBadge label="FIXED WRAPPER" />
                    <ProvenanceBadge label="READ-ONLY" />
                  </div>
                </div>
              </article>
            );
          })}
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

function TemporalRadarCanvas({
  simulationReport,
  evidenceLanes,
  onSelectSimulationRecord,
}: {
  simulationReport: CoreSimulationReport | null;
  evidenceLanes: EvidenceLane[];
  onSelectSimulationRecord: (record: ScenarioTimelineInspectorRecord) => void;
}) {
  const timeline = simulationReport?.timeline ?? [];
  const markerCount = Math.max(timeline.length, 3);

  return (
    <section className="scenario-runner-panel scenario-temporal-radar" aria-label="Temporal Radar Canvas">
      <div className="scenario-runner-panel-heading">
        <div>
          <span className="cockpit-eyebrow">Temporal radar</span>
          <h3>Timeline trace and synchronized evidence lanes</h3>
          <p>Markers are ordered from Core timeline records. Lane chips are grouped by Core-reported category only.</p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label={`${timeline.length} MARKERS`} />
        </div>
      </div>

      {timeline.length > 0 ? (
        <div className="scenario-radar-grid" style={{ "--radar-columns": String(markerCount) } as React.CSSProperties}>
          <div className="scenario-radar-axis" aria-hidden="true" />
          {timeline.map((entry, index) => (
            <button
              className="scenario-radar-marker"
              key={`${formatRecordTime(entry)}-${index}`}
              style={{ gridColumn: `${index + 1} / span 1` }}
              type="button"
              onClick={() =>
                onSelectSimulationRecord({
                  kind: "timeline",
                  title: getRecordTitle(entry, `Timeline step ${index + 1}`),
                  record: entry,
                })
              }
            >
              <span>{formatRecordTime(entry)}</span>
              <strong>{getRecordTitle(entry, `Step ${index + 1}`)}</strong>
            </button>
          ))}
          {evidenceLanes.map((lane) => (
            <div className="scenario-radar-lane" key={lane.title} style={{ gridColumn: `1 / span ${markerCount}` }}>
              <span>{lane.label}</span>
              <div>
                {lane.items.length > 0 ? (
                  lane.items.slice(0, 8).map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      title={item.detail}
                      style={{ gridColumn: `${Math.min(index + 1, markerCount)} / span 1` }}
                      onClick={() =>
                        onSelectSimulationRecord({
                          kind: item.kind,
                          title: item.title,
                          record: item.record,
                        })
                      }
                    >
                      {item.title}
                    </button>
                  ))
                ) : (
                  <small>No records</small>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="scenario-radar-empty" aria-label="Scenario temporal radar waiting state">
          <div className="scenario-radar-empty-axis" aria-hidden="true">
            <span>T+0</span>
            <span>T+?</span>
            <span>T+?</span>
          </div>
          <div className="scenario-radar-empty-steps">
            <div>
              <span>01</span>
              <strong>Select scenario</strong>
              <small>Choose a source YAML run target.</small>
            </div>
            <div>
              <span>02</span>
              <strong>Run Core</strong>
              <small>Execute only through the fixed wrapper.</small>
            </div>
            <div>
              <span>03</span>
              <strong>Inspect trace</strong>
              <small>Read Core JSON timeline and evidence records.</small>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ScenarioEvidenceLaneStrips({
  lanes,
  onSelectSimulationRecord,
}: {
  lanes: EvidenceLane[];
  onSelectSimulationRecord: (record: ScenarioTimelineInspectorRecord) => void;
}) {
  return (
    <section className="scenario-runner-panel scenario-evidence-lane-strips" aria-label="Scenario Evidence Lane Strips">
      <div className="scenario-runner-panel-heading">
        <div>
          <span className="cockpit-eyebrow">Evidence lanes</span>
          <h3>Core record categories</h3>
          <p>No causality is inferred between lanes. Each chip opens the raw Core record in the Inspector.</p>
        </div>
        <ProvenanceBadge label="NO INFERENCE" />
      </div>

      <div className="scenario-lane-strip-stack">
        {lanes.map((lane) => (
          <article className="scenario-lane-strip" key={lane.title}>
            <header>
              <span>{lane.label}</span>
              <strong>{lane.items.length}</strong>
            </header>
            <div className="scenario-lane-strip-records">
              {lane.items.length > 0 ? (
                lane.items.slice(0, 8).map((item) => (
                  <button
                    className="scenario-lane-chip"
                    key={item.id}
                    type="button"
                    title={item.detail}
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
                  </button>
                ))
              ) : (
                <small>empty lane</small>
              )}
            </div>
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
  artifactCandidates: PassiveArtifactCandidate[];
  onOpenFile: (entry: ProjectEntry) => void;
}) {
  return (
    <section className="scenario-runner-panel scenario-report-dock" aria-label="Scenario Report Dock">
      <div className="scenario-runner-panel-heading">
        <div>
          <span className="cockpit-eyebrow">Report dock</span>
          <h3>Core output, log and passive candidates</h3>
          <p>Reports and logs are preview surfaces here. They do not produce private scenario state.</p>
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

function ScenarioGuardrailStrip() {
  const guardrails = [
    "READ-ONLY",
    "CORE JSON ONLY",
    "FIXED WRAPPER",
    "NO UPLINK",
    "NO LIVE TELEMETRY",
    "NO LOG-DERIVED STATE",
  ];

  return (
    <section className="scenario-guardrail-strip" aria-label="Scenario Runner Guardrails">
      {guardrails.map((guardrail) => (
        <span key={guardrail}>{guardrail}</span>
      ))}
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
  evidenceCount,
}: {
  scenarioFiles: ProjectEntry[];
  simulationReport: CoreSimulationReport | null;
  generatedEvidenceArtifactSummary: GeneratedEvidenceArtifactSummary | null;
  artifactCandidates: PassiveArtifactCandidate[];
  evidenceCount: number;
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
      label: "Evidence records",
      value: String(evidenceCount),
      detail: "Commands, events, modes, data-flow and expectations.",
    },
    {
      label: "Passive candidates",
      value: generatedEvidenceArtifactSummary ? String(artifactCandidates.length) : "not inspected",
      detail: "Generated report/log candidates are preview-only.",
    },
  ];
}

function createRunwayStages({
  scenarioFiles,
  coreResult,
  simulationReport,
  simulationReportSource,
  isRunningCoreCommand,
  evidenceCount,
}: {
  scenarioFiles: ProjectEntry[];
  coreResult: CoreCommandResult | null;
  simulationReport: CoreSimulationReport | null;
  simulationReportSource: string | null;
  isRunningCoreCommand: boolean;
  evidenceCount: number;
}): RunwayStage[] {
  return [
    {
      id: "source",
      label: "Source",
      state: scenarioFiles.length > 0 ? "READY" : "EMPTY",
      detail: `${scenarioFiles.length} YAML targets`,
      tone: scenarioFiles.length > 0 ? "ready" : "empty",
    },
    {
      id: "core",
      label: "Core sim",
      state: isRunningCoreCommand ? "RUNNING" : coreResult ? "COMPLETE" : "WAITING",
      detail: "fixed wrapper only",
      tone: isRunningCoreCommand ? "running" : coreResult ? "reported" : "waiting",
    },
    {
      id: "report",
      label: "Report JSON",
      state: simulationReport ? "AVAILABLE" : "MISSING",
      detail: simulationReportSource ?? "no report selected",
      tone: simulationReport ? "reported" : "waiting",
    },
    {
      id: "timeline",
      label: "Timeline",
      state: simulationReport ? `${simulationReport.timeline.length} RECORDS` : "EMPTY",
      detail: "Core timeline only",
      tone: simulationReport && simulationReport.timeline.length > 0 ? "reported" : "empty",
    },
    {
      id: "evidence",
      label: "Evidence",
      state: `${evidenceCount} RECORDS`,
      detail: "grouped by Core category",
      tone: evidenceCount > 0 ? "reported" : "empty",
    },
    {
      id: "inspect",
      label: "Inspect",
      state: evidenceCount > 0 || Boolean(simulationReport) ? "READY" : "IDLE",
      detail: "raw Core record endpoint",
      tone: evidenceCount > 0 || Boolean(simulationReport) ? "ready" : "waiting",
    },
  ];
}

function createEvidenceLanes(simulationReport: CoreSimulationReport | null): EvidenceLane[] {
  return [
    {
      title: "Commands",
      label: "CMD",
      items: mapReportRecords(simulationReport?.commands ?? [], "command"),
    },
    {
      title: "Events",
      label: "EVT",
      items: mapReportRecords(simulationReport?.events ?? [], "event"),
    },
    {
      title: "Mode transitions",
      label: "MODE",
      items: mapReportRecords(simulationReport?.mode_transitions ?? [], "modeTransition"),
    },
    {
      title: "Data-flow",
      label: "FLOW",
      items: mapReportRecords(simulationReport?.data_flow_evidence ?? [], "dataFlowEvidence"),
    },
    {
      title: "Failed expectations",
      label: "EXPECT",
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

function countEvidenceLaneItems(lanes: EvidenceLane[]): number {
  return lanes.reduce((total, lane) => total + lane.items.length, 0);
}

function getScenarioTargetState(
  scenario: ProjectEntry,
  simulationReport: CoreSimulationReport | null,
  isRunningCoreCommand: boolean,
): { label: string; tone: string } {
  if (isRunningCoreCommand) {
    return { label: "RUNNING", tone: "running" };
  }

  if (simulationReport && scenario.name.includes(simulationReport.scenario)) {
    return { label: "LAST RUN", tone: "reported" };
  }

  return { label: "READY", tone: "ready" };
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

function stripYamlExtension(value: string): string {
  return value.replace(/\.ya?ml$/i, "");
}

function toObjectRecord(record: unknown): Record<string, unknown> {
  return record && typeof record === "object" ? (record as Record<string, unknown>) : {};
}
