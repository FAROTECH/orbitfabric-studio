import { useMemo, useState } from "react";

import { ProvenanceBadge, StatusBadge } from "./Badges";
import type {
  MissionDataFlowTraceabilityLink,
  MissionDataFlowWorkbenchSourceState,
} from "./missionDataFlowWorkbenchModel";
import type { CoreSimulationDataFlowEvidenceRecord } from "./types/workspace";

interface FocusSelection {
  id: string;
  label: string;
  kind: string;
  state: MissionDataFlowWorkbenchSourceState | "preview" | "not-wired";
  source: string;
  detail: string;
  raw: unknown;
}

interface FocusPathNode {
  id: string;
  label: string;
  kind: string;
  state: MissionDataFlowWorkbenchSourceState;
  detail: string;
  source: string;
  raw: unknown;
}

interface FocusCoverageItem {
  id: string;
  label: string;
  value: string;
  detail: string;
  state: MissionDataFlowWorkbenchSourceState;
  raw: unknown;
}

type FocusTabId = "flow-path" | "scenario-timeline" | "coverage" | "artifacts" | "json";

type FocusGraphSelection =
  | { type: "node"; node: FocusPathNode }
  | { type: "edge"; edge: FocusRouteEdge };

interface FocusRouteEdge {
  id: string;
  label: string;
  from: FocusPathNode;
  to: FocusPathNode;
  state: MissionDataFlowWorkbenchSourceState;
  source: string;
  detail: string;
  raw: unknown;
}

interface FocusCurrentItem {
  id: string;
  label: string;
  kind: string;
  state: MissionDataFlowWorkbenchSourceState | "preview" | "not-wired";
  source: string;
  detail: string;
  raw: unknown;
  scope: "route" | "node" | "edge";
}

interface DataFlowWorkbenchFocusModeProps {
  selection: FocusSelection;
  selectedPath: FocusPathNode[];
  relatedTraceabilityLinks: MissionDataFlowTraceabilityLink[];
  coverageItems: FocusCoverageItem[];
  onBack: () => void;
  onSelectPathNode: (node: FocusPathNode) => void;
}

const FOCUS_TABS: Array<{ id: FocusTabId; label: string; wired: boolean }> = [
  { id: "flow-path", label: "Flow Path", wired: true },
  { id: "scenario-timeline", label: "Scenario Timeline", wired: false },
  { id: "coverage", label: "Coverage", wired: false },
  { id: "artifacts", label: "Artifacts", wired: false },
  { id: "json", label: "JSON", wired: true },
];

export function DataFlowWorkbenchFocusMode({
  selection,
  selectedPath,
  relatedTraceabilityLinks,
  coverageItems,
  onBack,
  onSelectPathNode,
}: DataFlowWorkbenchFocusModeProps) {
  const routeEdges = useMemo(() => createRouteEdges(selectedPath), [selectedPath]);
  const initialNode = useMemo(
    () => selectInitialFocusNode(selectedPath, selection),
    [selectedPath, selection],
  );
  const [activeTab, setActiveTab] = useState<FocusTabId>("flow-path");
  const [graphSelection, setGraphSelection] = useState<FocusGraphSelection | null>(
    initialNode ? { type: "node", node: initialNode } : null,
  );
  const selectedDataFlowEvidence = selectDataFlowEvidence(
    graphSelection?.type === "node" ? graphSelection.node.raw : graphSelection?.edge.raw,
    selection.raw,
    selectedPath,
  );
  const currentItem = createCurrentFocusItem(graphSelection, selection);
  const currentLabel = currentItem.label;
  const currentKind = currentItem.kind;
  const currentState = currentItem.state;
  const generatedLinks = relatedTraceabilityLinks.filter(
    (link) => link.kind === "generated-artifact" || link.evidenceKind === "artifact-evidence",
  );

  function handleSelectNode(node: FocusPathNode) {
    setGraphSelection({ type: "node", node });
    onSelectPathNode(node);
  }

  return (
    <section
      id="studio-data-flow-workbench"
      className="entry-section mission-data-flow-focus-mode"
      aria-label="Data Flow Workbench focus mode"
    >
      <header className="mission-data-flow-focus-header">
        <div>
          <span className="mission-data-flow-focus-breadcrumb">
            Data Flow Workbench &gt; {selection.label}
          </span>
          <div className="mission-data-flow-focus-title-row">
            <h2>{selection.label}</h2>
            <StatusBadge label={String(currentState).toUpperCase()} />
          </div>
          <p>
            Dedicated read-only workspace for the selected data-flow route and its Core-derived
            evidence.
          </p>
        </div>
        <div className="mission-data-flow-focus-actions">
          <ProvenanceBadge label="READ-ONLY" />
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="NO INFERENCE" />
          <button type="button" onClick={onBack}>Back to Workbench</button>
        </div>
      </header>

      <div className="mission-data-flow-focus-layout">
        <section className="mission-data-flow-focus-graph-panel" aria-label="Evidence Route Graph">
          <header>
            <div>
              <span className="cockpit-eyebrow">Evidence Route Graph</span>
              <strong>{selectedPath.length > 0 ? `${selectedPath.length} nodes` : "not reported"}</strong>
            </div>
            <div className="mission-data-flow-focus-graph-actions">
              <button type="button" disabled title="Static fit is used in this step.">Fit</button>
              <button type="button" disabled title="Pan and zoom are not wired in this step.">Pan / zoom</button>
            </div>
          </header>

          {selectedPath.length > 0 ? (
            <div className="mission-data-flow-focus-route-graph">
              {selectedPath.map((node, index) => {
                const edge = routeEdges[index];
                const isSelected = graphSelection?.type === "node" && graphSelection.node.id === node.id;

                return (
                  <div className="mission-data-flow-focus-route-step" key={node.id}>
                    <button
                      className={[
                        "mission-data-flow-focus-route-node",
                        isSelected ? "mission-data-flow-focus-route-node-selected" : "",
                      ].filter(Boolean).join(" ")}
                      type="button"
                      onClick={() => handleSelectNode(node)}
                    >
                      <span>{formatRouteNodeKind(node.kind)}</span>
                      <strong>{node.label}</strong>
                      <small>{node.state}</small>
                    </button>

                    {edge ? (
                      <button
                        className={[
                          "mission-data-flow-focus-route-edge",
                          graphSelection?.type === "edge" && graphSelection.edge.id === edge.id
                            ? "mission-data-flow-focus-route-edge-selected"
                            : "",
                        ].filter(Boolean).join(" ")}
                        type="button"
                        onClick={() => setGraphSelection({ type: "edge", edge })}
                      >
                        <i aria-hidden="true" />
                        <span>{edge.label}</span>
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <FocusEmptyState
              title="No route graph reported"
              detail="No command, producer, data product, downlink flow or contact window path is present in the loaded Core evidence."
            />
          )}
        </section>

        <section className="mission-data-flow-focus-details-panel" aria-label="Evidence Details">
          <header>
            <div>
              <span className="cockpit-eyebrow">Evidence Details</span>
              <strong>{currentLabel}</strong>
            </div>
            <StatusBadge label={String(currentState).toUpperCase()} />
          </header>

          <nav className="mission-data-flow-focus-tabs" aria-label="Focus mode tabs">
            {FOCUS_TABS.map((tab) => (
              <button
                className={tab.id === activeTab ? "mission-data-flow-focus-tab-active" : ""}
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                title={tab.wired ? tab.label : "Not wired in this step."}
              >
                {tab.label}
                {!tab.wired ? <span>preview</span> : null}
              </button>
            ))}
          </nav>

          <div className="mission-data-flow-focus-tab-body">
            {activeTab === "flow-path" ? (
              <FocusFlowPath
                currentItem={currentItem}
                routeSelection={selection}
                selectedPath={selectedPath}
                selectedDataFlowEvidence={selectedDataFlowEvidence}
                relatedTraceabilityLinks={relatedTraceabilityLinks}
                generatedLinks={generatedLinks}
                coverageItems={coverageItems}
              />
            ) : null}

            {activeTab === "json" ? (
              <pre className="raw-output-block mission-data-flow-focus-raw">
                {formatRawValue(createFocusJsonPayload(currentItem, selectedDataFlowEvidence, selectedPath))}
              </pre>
            ) : null}

            {activeTab !== "flow-path" && activeTab !== "json" ? (
              <FocusEmptyState
                title={`${FOCUS_TABS.find((tab) => tab.id === activeTab)?.label ?? "Tab"} not wired`}
                detail="This focus mode shell keeps the tab visible as a deliberate preview, but it does not fabricate additional Core evidence."
              />
            ) : null}
          </div>
        </section>

        <aside className="mission-data-flow-focus-inspector" aria-label="Focus mode inspector">
          <header>
            <span className="cockpit-eyebrow">Inspector</span>
            <strong>{currentLabel}</strong>
            <small>{currentKind}</small>
          </header>

          <div className="mission-data-flow-focus-property-grid">
            <span>Identifier</span>
            <strong>{currentItem.id}</strong>
            <span>Type</span>
            <strong>{currentKind}</strong>
            <span>Status</span>
            <strong>{currentState}</strong>
            <span>Source</span>
            <strong>{currentItem.source}</strong>
          </div>

          <div className="mission-data-flow-focus-note">
            <strong>Read-only evidence</strong>
            <span>{currentItem.detail}</span>
          </div>

          <section className="mission-data-flow-focus-related">
            <header>
              <span className="cockpit-eyebrow">Related links</span>
              <strong>{relatedTraceabilityLinks.length}</strong>
            </header>
            {relatedTraceabilityLinks.slice(0, 5).map((link) => (
              <article key={link.id}>
                <span>{link.label}</span>
                <strong>{link.state}</strong>
                <small>{link.detail}</small>
              </article>
            ))}
            {relatedTraceabilityLinks.length === 0 ? (
              <FocusEmptyState
                title="No related links reported"
                detail="Studio does not infer missing traceability relationships."
              />
            ) : null}
          </section>
        </aside>
      </div>
    </section>
  );
}

function FocusFlowPath({
  currentItem,
  routeSelection,
  selectedPath,
  selectedDataFlowEvidence,
  relatedTraceabilityLinks,
  generatedLinks,
  coverageItems,
}: {
  currentItem: FocusCurrentItem;
  routeSelection: FocusSelection;
  selectedPath: FocusPathNode[];
  selectedDataFlowEvidence: CoreSimulationDataFlowEvidenceRecord | null;
  relatedTraceabilityLinks: MissionDataFlowTraceabilityLink[];
  generatedLinks: MissionDataFlowTraceabilityLink[];
  coverageItems: FocusCoverageItem[];
}) {
  const coverageSummary = coverageItems.filter((item) => item.state === "reported");

  return (
    <div className="mission-data-flow-focus-flow-grid">
      <section className="mission-data-flow-focus-card mission-data-flow-focus-card-wide">
        <header>
          <span className="cockpit-eyebrow">Flow path summary</span>
          <strong>{routeSelection.label}</strong>
        </header>
        <p>
          Selected {currentItem.scope} <strong>{currentItem.label}</strong> is inspected inside the
          Core-reported route for <strong>{selectedDataFlowEvidence?.data_product_id ?? routeSelection.label}</strong>.
          The route remains the end-to-end path across {selectedPath.length} route nodes.
        </p>
        <div className="mission-data-flow-focus-selected-card">
          <span>{currentItem.kind}</span>
          <strong>{currentItem.state}</strong>
          <small>{currentItem.source}</small>
          <em>{currentItem.detail}</em>
        </div>
        <div className="mission-data-flow-focus-strip">
          {selectedPath.map((node, index) => (
            <span key={node.id}>
              {node.label}
              {index < selectedPath.length - 1 ? <i aria-hidden="true">→</i> : null}
            </span>
          ))}
        </div>
      </section>

      <section className="mission-data-flow-focus-card">
        <header>
          <span className="cockpit-eyebrow">Traceability facts</span>
          <strong>Core evidence</strong>
        </header>
        <div className="mission-data-flow-focus-property-grid">
          <span>producer</span>
          <strong>{selectedDataFlowEvidence?.producer ?? "not reported"}</strong>
          <span>producer type</span>
          <strong>{selectedDataFlowEvidence?.producer_type ?? "not reported"}</strong>
          <span>triggered by command</span>
          <strong>{selectedDataFlowEvidence?.triggered_by_command ?? "not reported"}</strong>
          <span>time</span>
          <strong>{selectedDataFlowEvidence ? formatTimeSeconds(selectedDataFlowEvidence.t) : "not reported"}</strong>
          <span>eligible flow</span>
          <strong>{formatStringList(selectedDataFlowEvidence?.eligible_downlink_flows, "not reported")}</strong>
          <span>contact window</span>
          <strong>{formatStringList(selectedDataFlowEvidence?.contact_windows, "not reported")}</strong>
        </div>
      </section>

      <section className="mission-data-flow-focus-card">
        <header>
          <span className="cockpit-eyebrow">Provenance</span>
          <strong>{routeSelection.source}</strong>
        </header>
        <div className="mission-data-flow-focus-property-grid">
          <span>selection source</span>
          <strong>{routeSelection.source}</strong>
          <span>route source</span>
          <strong>{selectedDataFlowEvidence ? "core-simulation-report" : "not reported"}</strong>
          <span>related links</span>
          <strong>{relatedTraceabilityLinks.length}</strong>
          <span>linked artifacts</span>
          <strong>{generatedLinks.length}</strong>
        </div>
      </section>

      <section className="mission-data-flow-focus-card">
        <header>
          <span className="cockpit-eyebrow">Route evidence status</span>
          <strong>Conservative states</strong>
        </header>
        <div className="mission-data-flow-focus-status-list">
          <FocusStatusItem label="Route path" value={selectedPath.length > 0 ? "reported" : "not reported"} />
          <FocusStatusItem label="Data-flow evidence" value={selectedDataFlowEvidence ? "reported" : "not reported"} />
          <FocusStatusItem label="Related links" value={relatedTraceabilityLinks.length > 0 ? "reported" : "not reported"} />
          <FocusStatusItem label="Generated artifacts" value={generatedLinks.length > 0 ? "reported" : "not reported"} />
        </div>
      </section>

      <section className="mission-data-flow-focus-card">
        <header>
          <span className="cockpit-eyebrow">Scenario & coverage context</span>
          <strong>{coverageSummary.length} reported scopes</strong>
        </header>
        <div className="mission-data-flow-focus-coverage-list">
          {coverageItems.slice(0, 5).map((item) => (
            <article key={item.id}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="mission-data-flow-focus-card">
        <header>
          <span className="cockpit-eyebrow">Relationship coverage selected</span>
          <strong>{relatedTraceabilityLinks.length} links</strong>
        </header>
        <div className="mission-data-flow-focus-link-list">
          {relatedTraceabilityLinks.slice(0, 4).map((link) => (
            <article key={link.id}>
              <span>{link.label}</span>
              <strong>{link.state}</strong>
              <small>{link.detail}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function FocusStatusItem({ label, value }: { label: string; value: string }) {
  return (
    <article className={`mission-data-flow-focus-status mission-data-flow-focus-status-${normalizeCssToken(value)}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function FocusEmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mission-data-flow-focus-empty">
      <strong>{title}</strong>
      <span>{detail}</span>
      <ProvenanceBadge label="NO INFERENCE" />
    </div>
  );
}


function createCurrentFocusItem(
  graphSelection: FocusGraphSelection | null,
  selection: FocusSelection,
): FocusCurrentItem {
  if (graphSelection?.type === "node") {
    return {
      id: graphSelection.node.id,
      label: graphSelection.node.label,
      kind: graphSelection.node.kind,
      state: graphSelection.node.state,
      source: graphSelection.node.source,
      detail: graphSelection.node.detail,
      raw: graphSelection.node.raw,
      scope: "node",
    };
  }

  if (graphSelection?.type === "edge") {
    return {
      id: graphSelection.edge.id,
      label: graphSelection.edge.label,
      kind: "Route segment",
      state: graphSelection.edge.state,
      source: graphSelection.edge.source,
      detail: graphSelection.edge.detail,
      raw: graphSelection.edge.raw,
      scope: "edge",
    };
  }

  return {
    ...selection,
    scope: "route",
  };
}

function createFocusJsonPayload(
  currentItem: FocusCurrentItem,
  selectedDataFlowEvidence: CoreSimulationDataFlowEvidenceRecord | null,
  selectedPath: FocusPathNode[],
): unknown {
  return {
    focus_selection: {
      scope: currentItem.scope,
      id: currentItem.id,
      label: currentItem.label,
      kind: currentItem.kind,
      state: currentItem.state,
      source: currentItem.source,
      detail: currentItem.detail,
    },
    selected_path: selectedPath.map((node) => ({
      id: node.id,
      label: node.label,
      kind: node.kind,
      state: node.state,
      source: node.source,
    })),
    core_data_flow_evidence: selectedDataFlowEvidence,
    selected_raw: currentItem.raw,
  };
}

function createRouteEdges(path: FocusPathNode[]): FocusRouteEdge[] {
  const edgeLabels = ["triggered route", "produced data", "eligible flow", "contact window"];

  return path.slice(0, -1).map((node, index) => {
    const next = path[index + 1];

    return {
      id: `route-edge:${node.id}->${next.id}`,
      label: edgeLabels[index] ?? "reported segment",
      from: node,
      to: next,
      state: node.state === "reported" && next.state === "reported" ? "reported" : "not-reported",
      source: "core-simulation-report",
      detail: `Core-reported route segment from ${node.label} to ${next.label}.`,
      raw: next.raw ?? node.raw,
    };
  });
}

function selectInitialFocusNode(
  selectedPath: FocusPathNode[],
  selection: FocusSelection,
): FocusPathNode | null {
  return (
    selectedPath.find((node) => node.id === selection.id || node.label === selection.label) ??
    selectedPath.find((node) => node.kind.toLowerCase().includes("data product")) ??
    selectedPath[0] ??
    null
  );
}

function selectDataFlowEvidence(
  candidateRaw: unknown,
  selectionRaw: unknown,
  selectedPath: FocusPathNode[],
): CoreSimulationDataFlowEvidenceRecord | null {
  if (isCoreSimulationDataFlowEvidenceRecord(candidateRaw)) {
    return candidateRaw;
  }

  if (isCoreSimulationDataFlowEvidenceRecord(selectionRaw)) {
    return selectionRaw;
  }

  const node = selectedPath.find((item) => isCoreSimulationDataFlowEvidenceRecord(item.raw));

  return isCoreSimulationDataFlowEvidenceRecord(node?.raw) ? node.raw : null;
}

function formatRouteNodeKind(kind: string): string {
  const normalized = kind.toLowerCase();

  if (normalized.includes("command")) {
    return "Command";
  }

  if (normalized.includes("producer")) {
    return "Producer";
  }

  if (normalized.includes("data product")) {
    return "Data product";
  }

  if (normalized.includes("downlink")) {
    return "Downlink flow";
  }

  if (normalized.includes("contact")) {
    return "Contact window";
  }

  return kind;
}

function formatStringList(values: string[] | undefined, fallback: string): string {
  if (!values || values.length === 0) {
    return fallback;
  }

  return values.join(", ");
}

function formatTimeSeconds(value: number): string {
  return `${value} s`;
}

function formatRawValue(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function normalizeCssToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function isCoreSimulationDataFlowEvidenceRecord(
  value: unknown,
): value is CoreSimulationDataFlowEvidenceRecord {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof (value as { t?: unknown }).t === "number",
  );
}
