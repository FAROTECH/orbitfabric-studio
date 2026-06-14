import { useMemo, useState, type CSSProperties } from "react";

import type {
  CoreSimulationCommandRecord,
  CoreSimulationDataFlowEvidenceRecord,
  CoreSimulationEventRecord,
  CoreSimulationModeTransitionRecord,
  CoreSimulationReport,
} from "./types/workspace";

export interface DataFlowTimelineScenario {
  scenario: string;
  status: string;
  evidence: string;
  expectations: string;
  events: string;
  state: string;
  source: string;
  detail: string;
  raw: unknown;
}

interface DataFlowWorkbenchScenarioTimelineProps {
  scenario: DataFlowTimelineScenario;
  simulationReports: CoreSimulationReport[];
  onClose: () => void;
  onSelectDataFlowEvidence: (evidence: CoreSimulationDataFlowEvidenceRecord) => void;
}

type TimelineLayer = "commands" | "events" | "data-flow" | "mode-state";
type TimelineTab = "timeline" | "data-flow" | "commands" | "events" | "raw";

type TimelineRowKind = "COMMAND" | "EVENT" | "DATA-FLOW EVIDENCE" | "MODE";

interface TimelineRow {
  id: string;
  t: number;
  type: TimelineRowKind;
  layer: TimelineLayer;
  label: string;
  detail: string;
  status: string;
  raw: unknown;
}

interface TimelineConnectorSegment {
  id: string;
  t: number;
  layer: TimelineLayer;
  firstIndex: number;
  lastIndex: number;
}

const ROW_HEIGHT = 38;
const TIMELINE_TICK_STEP = 250;
const TIMELINE_TICK_PIXEL_WIDTH = 170;
const TIMELINE_AXIS_HEADER_HEIGHT = 30;
const TIMELINE_AXIS_PADDING_PERCENT = 14;

const LAYER_LABELS: Record<TimelineLayer, string> = {
  commands: "Commands",
  events: "Events",
  "data-flow": "Data-flow evidence",
  "mode-state": "Mode / State",
};

const TAB_LABELS: Array<{ id: TimelineTab; label: string }> = [
  { id: "timeline", label: "Timeline" },
  { id: "data-flow", label: "Data-flow evidence" },
  { id: "commands", label: "Commands" },
  { id: "events", label: "Events" },
  { id: "raw", label: "Raw report" },
];

export function DataFlowWorkbenchScenarioTimeline({
  scenario,
  simulationReports,
  onClose,
  onSelectDataFlowEvidence,
}: DataFlowWorkbenchScenarioTimelineProps) {
  const [activeTab, setActiveTab] = useState<TimelineTab>("timeline");
  const [visibleLayers, setVisibleLayers] = useState<Record<TimelineLayer, boolean>>({
    commands: true,
    events: true,
    "data-flow": true,
    "mode-state": true,
  });

  const report = useMemo(
    () => selectScenarioSimulationReport(simulationReports, scenario),
    [simulationReports, scenario],
  );
  const rows = useMemo(() => createTimelineRows(report), [report]);
  const visibleRows = rows.filter((row) => visibleLayers[row.layer]);
  const ticks = useMemo(() => createTimelineTicks(rows), [rows]);
  const maxTime = ticks.length > 0 ? ticks[ticks.length - 1] : TIMELINE_TICK_STEP;

  const commandRows = rows.filter((row) => row.layer === "commands");
  const eventRows = rows.filter((row) => row.layer === "events");
  const dataFlowRows = rows.filter((row) => row.layer === "data-flow");

  return (
    <section className="dfw-timeline-expansion" aria-label={`Expanded run detail: ${scenario.scenario}`}>
      <header className="dfw-timeline-header">
        <div>
          <span className="cockpit-eyebrow">Expanded run detail</span>
          <h3>{scenario.scenario}</h3>
          <p>
            Core-derived scenario timeline. Report source: {scenario.source}. {scenario.detail}.
          </p>
        </div>
        <div className="dfw-timeline-header-actions">
          <span className="dfw-timeline-status-chip dfw-timeline-status-chip-reported">{scenario.status}</span>
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </header>

      <nav className="dfw-timeline-tabs" aria-label="Expanded run detail tabs">
        {TAB_LABELS.map((tab) => (
          <button
            className={activeTab === tab.id ? "dfw-timeline-tab-active" : ""}
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "timeline" ? (
        <TimelineTabPanel
          report={report}
          rows={visibleRows}
          ticks={ticks}
          maxTime={maxTime}
          visibleLayers={visibleLayers}
          onToggleLayer={(layer) => {
            setVisibleLayers((current) => ({ ...current, [layer]: !current[layer] }));
          }}
          onSelectDataFlowEvidence={onSelectDataFlowEvidence}
        />
      ) : null}

      {activeTab === "data-flow" ? (
        <RecordListPanel
          emptyLabel="No data-flow evidence reported for this scenario."
          rows={dataFlowRows}
          onSelectDataFlowEvidence={onSelectDataFlowEvidence}
        />
      ) : null}

      {activeTab === "commands" ? (
        <RecordListPanel
          emptyLabel="No commands reported for this scenario."
          rows={commandRows}
          onSelectDataFlowEvidence={onSelectDataFlowEvidence}
        />
      ) : null}

      {activeTab === "events" ? (
        <RecordListPanel
          emptyLabel="No events reported for this scenario."
          rows={eventRows}
          onSelectDataFlowEvidence={onSelectDataFlowEvidence}
        />
      ) : null}

      {activeTab === "raw" ? (
        <pre className="raw-output-block dfw-timeline-raw">
          {formatRawReport(report ?? scenario.raw)}
        </pre>
      ) : null}
    </section>
  );
}


function selectScenarioSimulationReport(
  reports: CoreSimulationReport[],
  scenario: DataFlowTimelineScenario,
): CoreSimulationReport | null {
  return reports.find((report) => report.scenario === scenario.scenario) ?? null;
}

function TimelineTabPanel({
  report,
  rows,
  ticks,
  maxTime,
  visibleLayers,
  onToggleLayer,
  onSelectDataFlowEvidence,
}: {
  report: CoreSimulationReport | null;
  rows: TimelineRow[];
  ticks: number[];
  maxTime: number;
  visibleLayers: Record<TimelineLayer, boolean>;
  onToggleLayer: (layer: TimelineLayer) => void;
  onSelectDataFlowEvidence: (evidence: CoreSimulationDataFlowEvidenceRecord) => void;
}) {
  if (!report) {
    return (
      <div className="dfw-timeline-empty">
        <strong>Detailed simulation report not loaded for this scenario</strong>
        <span>
          The scenario run index is reported, but the passively hydrated simulation report does not match this run.
          Studio does not infer timeline records from the index alone.
        </span>
      </div>
    );
  }

  const timelineHeight = Math.max(240, rows.length * ROW_HEIGHT + TIMELINE_AXIS_HEADER_HEIGHT);
  const timelineContentWidth = Math.max(1040, ticks.length * TIMELINE_TICK_PIXEL_WIDTH);

  return (
    <div className="dfw-timeline-panel">
      <div className="dfw-timeline-toolbar">
        <div className="dfw-timeline-layer-toggles" aria-label="Timeline layer filters">
          {(Object.keys(LAYER_LABELS) as TimelineLayer[]).map((layer) => (
            <button
              className={visibleLayers[layer] ? "dfw-timeline-toggle-active" : ""}
              key={layer}
              type="button"
              onClick={() => onToggleLayer(layer)}
            >
              <i className={`dfw-timeline-dot dfw-timeline-dot-${layer}`} aria-hidden="true" />
              {LAYER_LABELS[layer]}
            </button>
          ))}
        </div>
        <button className="dfw-timeline-filter-button" type="button" disabled title="Filter is not wired in this step">
          Filter
        </button>
      </div>

      <div className="dfw-timeline-grid">
        <div className="dfw-timeline-table" style={{ "--dfw-timeline-row-height": `${ROW_HEIGHT}px` } as CSSProperties}>
          <div className="dfw-timeline-table-head">
            <span>Time (s)</span>
            <span>Type</span>
            <span>Detail</span>
          </div>
          {rows.map((row) => (
            <TimelineTableRow
              key={row.id}
              row={row}
              onSelectDataFlowEvidence={onSelectDataFlowEvidence}
            />
          ))}
        </div>

        <div className="dfw-timeline-canvas-shell" style={{ height: `${timelineHeight}px` }}>
          <div
            className="dfw-timeline-canvas"
            style={{ height: `${timelineHeight}px`, width: `${timelineContentWidth}px` }}
          >
          <div className="dfw-timeline-ruler" aria-hidden="true">
            <strong className="dfw-timeline-axis-title">Timeline (s)</strong>
            {ticks.map((tick) => (
              <span
                className="dfw-timeline-ruler-tick"
                key={tick}
                style={{ left: `${timeToPercent(tick, maxTime)}%` }}
              >
                {tick.toLocaleString()}
              </span>
            ))}
          </div>
          <svg className="dfw-timeline-svg" viewBox={`0 0 100 ${timelineHeight}`} preserveAspectRatio="none" aria-hidden="true">
            {ticks.map((tick) => {
              const x = timeToPercent(tick, maxTime);
              return <line className="dfw-timeline-grid-line" key={tick} x1={x} x2={x} y1="0" y2={timelineHeight} />;
            })}
            {rows.map((_, index) => {
              const y = TIMELINE_AXIS_HEADER_HEIGHT + index * ROW_HEIGHT;
              return (
                <line
                  className="dfw-timeline-row-line"
                  key={`row-line-${index}`}
                  x1="0"
                  x2="100"
                  y1={y}
                  y2={y}
                />
              );
            })}
            {createTimelineConnectorSegments(rows).map((segment) => {
              const x = timeToPercent(segment.t, maxTime);
              const y1 = segment.firstIndex * ROW_HEIGHT + ROW_HEIGHT / 2 + TIMELINE_AXIS_HEADER_HEIGHT;
              const y2 = segment.lastIndex * ROW_HEIGHT + ROW_HEIGHT / 2 + TIMELINE_AXIS_HEADER_HEIGHT;

              return (
                <line
                  className={`dfw-timeline-group-connector dfw-timeline-group-connector-${segment.layer}`}
                  key={segment.id}
                  x1={x}
                  x2={x}
                  y1={y1}
                  y2={y2}
                />
              );
            })}
            {rows.map((row, index) => (
              <TimelineMarkerSvg
                key={row.id}
                row={row}
                x={timeToPercent(row.t, maxTime)}
                y={index * ROW_HEIGHT + ROW_HEIGHT / 2 + TIMELINE_AXIS_HEADER_HEIGHT}
              />
            ))}
          </svg>
          <div className="dfw-timeline-label-layer">
            {rows.map((row, index) => {
              const x = timeToPercent(row.t, maxTime);
              const top = index * ROW_HEIGHT + TIMELINE_AXIS_HEADER_HEIGHT + 9;
              return (
                <button
                  className={`dfw-timeline-floating-label dfw-timeline-floating-label-${row.layer}`}
                  key={row.id}
                  style={{ left: `${x}%`, top: `${top}px` }}
                  type="button"
                  onClick={() => {
                    if (row.layer === "data-flow" && isDataFlowEvidence(row.raw)) {
                      onSelectDataFlowEvidence(row.raw);
                    }
                  }}
                >
                  {row.label}
                </button>
              );
            })}
          </div>
          </div>
        </div>

        <div className="dfw-timeline-state-rail" style={{ "--dfw-timeline-row-height": `${ROW_HEIGHT}px` } as CSSProperties}>
          <div className="dfw-timeline-state-head">Status</div>
          {rows.map((row) => (
            <span className={`dfw-timeline-state-pill dfw-timeline-state-${row.layer}`} key={row.id}>
              {formatStatus(row)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineTableRow({
  row,
  onSelectDataFlowEvidence,
}: {
  row: TimelineRow;
  onSelectDataFlowEvidence: (evidence: CoreSimulationDataFlowEvidenceRecord) => void;
}) {
  return (
    <button
      className={`dfw-timeline-row dfw-timeline-row-${row.layer}`}
      type="button"
      onClick={() => {
        if (row.layer === "data-flow" && isDataFlowEvidence(row.raw)) {
          onSelectDataFlowEvidence(row.raw);
        }
      }}
    >
      <span>{row.t.toLocaleString()}</span>
      <strong>{row.type}</strong>
      <span>{row.detail}</span>
    </button>
  );
}

function RecordListPanel({
  rows,
  emptyLabel,
  onSelectDataFlowEvidence,
}: {
  rows: TimelineRow[];
  emptyLabel: string;
  onSelectDataFlowEvidence: (evidence: CoreSimulationDataFlowEvidenceRecord) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="dfw-timeline-empty">
        <strong>{emptyLabel}</strong>
        <span>No private Studio inference is used to fill missing records.</span>
      </div>
    );
  }

  return (
    <div className="dfw-timeline-record-list">
      {rows.map((row) => (
        <button
          className={`dfw-timeline-record-card dfw-timeline-record-card-${row.layer}`}
          key={row.id}
          type="button"
          onClick={() => {
            if (row.layer === "data-flow" && isDataFlowEvidence(row.raw)) {
              onSelectDataFlowEvidence(row.raw);
            }
          }}
        >
          <span>t={row.t.toLocaleString()} s</span>
          <strong>{row.label}</strong>
          <small>{row.detail}</small>
        </button>
      ))}
    </div>
  );
}

function TimelineMarkerSvg({ row, x, y }: { row: TimelineRow; x: number; y: number }) {
  if (row.layer === "commands") {
    return <rect className="dfw-timeline-marker-command" x={x - 0.55} y={y - 4.5} width="1.1" height="9" rx="0.2" />;
  }

  if (row.layer === "events") {
    return <polygon className="dfw-timeline-marker-event" points={`${x},${y - 5} ${x + 0.9},${y} ${x},${y + 5} ${x - 0.9},${y}`} />;
  }

  if (row.layer === "data-flow") {
    return <rect className="dfw-timeline-marker-data-flow" x={x - 1.1} y={y - 4.2} width="2.2" height="8.4" rx="0.6" />;
  }

  return <circle className="dfw-timeline-marker-mode" cx={x} cy={y} r="0.7" />;
}

function createTimelineRows(report: CoreSimulationReport | null): TimelineRow[] {
  if (!report) {
    return [];
  }

  const rows: TimelineRow[] = [
    ...report.mode_transitions.map(modeTransitionToTimelineRow),
    ...report.commands.map(commandToTimelineRow),
    ...report.events.map(eventToTimelineRow),
    ...report.data_flow_evidence.map(dataFlowEvidenceToTimelineRow),
  ];

  return rows.sort(compareTimelineRows);
}

function commandToTimelineRow(command: CoreSimulationCommandRecord, index: number): TimelineRow {
  return {
    id: `command:${index}:${command.t}:${command.command_id}`,
    t: command.t,
    type: "COMMAND",
    layer: "commands",
    label: command.command_id,
    detail: command.command_id,
    status: command.status,
    raw: command,
  };
}

function eventToTimelineRow(event: CoreSimulationEventRecord, index: number): TimelineRow {
  return {
    id: `event:${index}:${event.t}:${event.event_id}`,
    t: event.t,
    type: "EVENT",
    layer: "events",
    label: event.event_id,
    detail: event.event_id,
    status: event.severity,
    raw: event,
  };
}

function modeTransitionToTimelineRow(mode: CoreSimulationModeTransitionRecord, index: number): TimelineRow {
  return {
    id: `mode:${index}:${mode.t}:${mode.from}:${mode.to}`,
    t: mode.t,
    type: "MODE",
    layer: "mode-state",
    label: `${mode.from} → ${mode.to}`,
    detail: `Mode change: ${mode.from} → ${mode.to}`,
    status: "reported",
    raw: mode,
  };
}

function dataFlowEvidenceToTimelineRow(
  evidence: CoreSimulationDataFlowEvidenceRecord,
  index: number,
): TimelineRow {
  return {
    id: `data-flow:${index}:${evidence.t}:${evidence.data_product_id ?? "unknown"}`,
    t: evidence.t,
    type: "DATA-FLOW EVIDENCE",
    layer: "data-flow",
    label: evidence.data_product_id ?? "data-flow evidence",
    detail: `${evidence.data_product_id ?? "data-flow evidence"} produced by ${evidence.producer ?? "not reported"}`,
    status: "reported",
    raw: evidence,
  };
}

function compareTimelineRows(left: TimelineRow, right: TimelineRow): number {
  if (left.t !== right.t) {
    return left.t - right.t;
  }

  const order: Record<TimelineLayer, number> = {
    "mode-state": 0,
    commands: 1,
    events: 2,
    "data-flow": 3,
  };

  return order[left.layer] - order[right.layer];
}

function createTimelineTicks(rows: TimelineRow[]): number[] {
  const maxRowTime = rows.reduce((max, row) => Math.max(max, row.t), 0);
  const tickStep = selectTimelineTickStep(maxRowTime);
  const maxTime = Math.max(tickStep * 3, Math.ceil(maxRowTime / tickStep) * tickStep);
  const ticks: number[] = [];

  for (let tick = 0; tick <= maxTime; tick += tickStep) {
    ticks.push(tick);
  }

  return ticks;
}

function createTimelineConnectorSegments(rows: TimelineRow[]): TimelineConnectorSegment[] {
  const groups = new Map<number, Array<{ row: TimelineRow; index: number }>>();

  rows.forEach((row, index) => {
    const current = groups.get(row.t) ?? [];
    current.push({ row, index });
    groups.set(row.t, current);
  });

  return Array.from(groups.entries()).flatMap(([t, group]) => {
    if (group.length < 2) {
      return [];
    }

    const sortedGroup = [...group].sort((left, right) => left.index - right.index);
    const representative = selectConnectorLayer(sortedGroup.map((entry) => entry.row.layer));

    return [
      {
        id: `connector:${t}:${sortedGroup[0].index}:${sortedGroup[sortedGroup.length - 1].index}`,
        t,
        layer: representative,
        firstIndex: sortedGroup[0].index,
        lastIndex: sortedGroup[sortedGroup.length - 1].index,
      },
    ];
  });
}

function selectConnectorLayer(layers: TimelineLayer[]): TimelineLayer {
  if (layers.includes("data-flow")) {
    return "data-flow";
  }

  if (layers.includes("commands")) {
    return "commands";
  }

  if (layers.includes("events")) {
    return "events";
  }

  return "mode-state";
}

function selectTimelineTickStep(maxRowTime: number): number {
  if (maxRowTime <= 180) {
    return 60;
  }

  if (maxRowTime <= 600) {
    return 120;
  }

  return TIMELINE_TICK_STEP;
}

function timeToPercent(t: number, maxTime: number): number {
  if (maxTime <= 0) {
    return TIMELINE_AXIS_PADDING_PERCENT;
  }

  const normalized = Math.max(0, Math.min(1, t / maxTime));
  const usableWidth = 100 - TIMELINE_AXIS_PADDING_PERCENT * 2;

  return TIMELINE_AXIS_PADDING_PERCENT + normalized * usableWidth;
}

function formatStatus(row: TimelineRow): string {
  if (row.layer === "commands") {
    return `Command ${row.status}`;
  }

  if (row.layer === "events") {
    return `Event ${row.status}`;
  }

  if (row.layer === "data-flow") {
    return "Data-flow reported";
  }

  return "State reported";
}

function formatRawReport(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function isDataFlowEvidence(value: unknown): value is CoreSimulationDataFlowEvidenceRecord {
  return Boolean(value && typeof value === "object" && "t" in value && typeof (value as { t?: unknown }).t === "number");
}
