import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { ProvenanceBadge, StatusBadge } from "./Badges";
import type {
  MissionDataFlowTraceabilityLink,
  MissionDataFlowWorkbenchSourceState,
} from "./missionDataFlowWorkbenchModel";
import type { CoreSimulationDataFlowEvidenceRecord } from "./types/workspace";

type DrawerTabId = "overview" | "traceability" | "coverage" | "artifacts" | "raw-json";

interface DrawerSelection {
  id: string;
  label: string;
  kind: string;
  state: string;
  source: string;
  detail: string;
  raw: unknown;
}

interface DrawerPathNode {
  id: string;
  label: string;
  kind: string;
  state: MissionDataFlowWorkbenchSourceState;
  detail: string;
  source: string;
  raw: unknown;
}

interface DrawerTraceabilityProperty {
  label: string;
  value: string;
}

interface DataFlowWorkbenchContextDrawerProps {
  selection: DrawerSelection;
  selectedPath: DrawerPathNode[];
  relatedTraceabilityLinks: MissionDataFlowTraceabilityLink[];
  onClose: () => void;
  onSelectPathNode: (node: DrawerPathNode) => void;
}

const DRAWER_TABS: Array<{ id: DrawerTabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "traceability", label: "Traceability" },
  { id: "coverage", label: "Coverage" },
  { id: "artifacts", label: "Artifacts" },
  { id: "raw-json", label: "Raw JSON" },
];

export function DataFlowWorkbenchContextDrawer({
  selection,
  selectedPath,
  relatedTraceabilityLinks,
  onClose,
  onSelectPathNode,
}: DataFlowWorkbenchContextDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTabId>("traceability");
  const dataFlowEvidence = isCoreSimulationDataFlowEvidenceRecord(selection.raw)
    ? selection.raw
    : null;
  const traceabilityProperties = useMemo(
    () => createTraceabilityProperties(selection, dataFlowEvidence),
    [selection, dataFlowEvidence],
  );
  const generatedLinks = relatedTraceabilityLinks.filter(
    (link) => link.kind === "generated-artifact" || link.evidenceKind === "artifact-evidence",
  );

  const drawer = (
    <aside className="mission-data-flow-context-drawer" aria-label="Data Flow Workbench context drawer">
      <div className="mission-data-flow-context-drawer-backdrop" aria-hidden="true" onClick={onClose} />
      <section className="mission-data-flow-context-drawer-panel">
        <header className="mission-data-flow-context-drawer-header">
          <div>
            <span className="mission-data-flow-drawer-breadcrumb">
              Data Flow Workbench &gt; {selection.label}
            </span>
            <div className="mission-data-flow-drawer-title-row">
              <h3>{selection.label}</h3>
              <StatusBadge label={selection.state.toUpperCase()} />
            </div>
            <p>{selection.kind}</p>
          </div>
          <div className="mission-data-flow-drawer-actions">
            <button type="button" disabled title="Focus mode is not wired in this step.">
              Open focus mode
            </button>
            <button type="button" disabled title="Copy ID is not wired in this step.">
              Copy ID
            </button>
            <button type="button" aria-label="Close context drawer" onClick={onClose}>
              Close
            </button>
          </div>
        </header>

        <nav className="mission-data-flow-drawer-tabs" aria-label="Context drawer tabs">
          {DRAWER_TABS.map((tab) => (
            <button
              className={tab.id === activeTab ? "mission-data-flow-drawer-tab-active" : ""}
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mission-data-flow-context-drawer-body">
          {activeTab === "overview" ? (
            <DrawerOverview selection={selection} dataFlowEvidence={dataFlowEvidence} />
          ) : null}

          {activeTab === "traceability" ? (
            <DrawerTraceability
              properties={traceabilityProperties}
              selectedPath={selectedPath}
              relatedTraceabilityLinks={relatedTraceabilityLinks}
              generatedLinks={generatedLinks}
              onSelectPathNode={onSelectPathNode}
            />
          ) : null}

          {activeTab === "coverage" ? (
            <DrawerDeferredPanel
              title="Coverage detail"
              detail="Coverage-specific drawer expansion is not wired in this step. Use the Workbench coverage column for the Core-derived summary."
            />
          ) : null}

          {activeTab === "artifacts" ? (
            <DrawerArtifactPanel generatedLinks={generatedLinks} />
          ) : null}

          {activeTab === "raw-json" ? (
            <pre className="raw-output-block mission-data-flow-drawer-raw">
              {formatRawValue(selection.raw)}
            </pre>
          ) : null}
        </div>
      </section>
    </aside>
  );

  return createPortal(drawer, document.body);
}

function DrawerOverview({
  selection,
  dataFlowEvidence,
}: {
  selection: DrawerSelection;
  dataFlowEvidence: CoreSimulationDataFlowEvidenceRecord | null;
}) {
  return (
    <section className="mission-data-flow-drawer-section">
      <header>
        <span className="cockpit-eyebrow">Selected item</span>
        <strong>{selection.label}</strong>
      </header>
      <div className="mission-data-flow-drawer-property-grid">
        <span>Identifier</span>
        <strong>{selection.id}</strong>
        <span>Type</span>
        <strong>{selection.kind}</strong>
        <span>Status</span>
        <strong>{selection.state}</strong>
        <span>Source</span>
        <strong>{selection.source}</strong>
        <span>Data product</span>
        <strong>{dataFlowEvidence?.data_product_id ?? "not reported"}</strong>
      </div>
      <div className="mission-data-flow-drawer-note">
        <strong>Read-only context</strong>
        <span>{selection.detail}</span>
      </div>
    </section>
  );
}

function DrawerTraceability({
  properties,
  selectedPath,
  relatedTraceabilityLinks,
  generatedLinks,
  onSelectPathNode,
}: {
  properties: DrawerTraceabilityProperty[];
  selectedPath: DrawerPathNode[];
  relatedTraceabilityLinks: MissionDataFlowTraceabilityLink[];
  generatedLinks: MissionDataFlowTraceabilityLink[];
  onSelectPathNode: (node: DrawerPathNode) => void;
}) {
  return (
    <>
      <section className="mission-data-flow-drawer-section">
        <header>
          <span className="cockpit-eyebrow">Traceability summary</span>
          <strong>Core-derived data-flow evidence</strong>
        </header>
        <div className="mission-data-flow-drawer-property-grid">
          {properties.map((property) => (
            <div className="mission-data-flow-drawer-property-row" key={property.label}>
              <span>{property.label}</span>
              <strong>{property.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="mission-data-flow-drawer-section">
        <header>
          <span className="cockpit-eyebrow">Traceability map</span>
          <strong>{selectedPath.length > 0 ? `${selectedPath.length} nodes` : "not reported"}</strong>
        </header>
        {selectedPath.length > 0 ? (
          <div className="mission-data-flow-drawer-map">
            {selectedPath.map((node, index) => (
              <button key={node.id} type="button" onClick={() => onSelectPathNode(node)}>
                <span>{node.label}</span>
                <strong>{node.kind}</strong>
                {index < selectedPath.length - 1 ? <i aria-hidden="true" /> : null}
              </button>
            ))}
          </div>
        ) : (
          <DrawerDeferredPanel
            title="No traceability map reported"
            detail="No data-flow path nodes are present in the loaded Core simulation evidence."
          />
        )}
      </section>

      <DrawerAccordion
        count={relatedTraceabilityLinks.length}
        detail="Relationship and evidence links matching the selected item."
        items={relatedTraceabilityLinks}
        title="Related links"
      />
      <DrawerAccordion
        count={generatedLinks.length}
        detail="Generated artifact links matching the selected item."
        items={generatedLinks}
        title="Linked generated artifacts"
      />
    </>
  );
}

function DrawerArtifactPanel({
  generatedLinks,
}: {
  generatedLinks: MissionDataFlowTraceabilityLink[];
}) {
  if (generatedLinks.length === 0) {
    return (
      <DrawerDeferredPanel
        title="No linked generated artifacts"
        detail="No generated artifact traceability link is associated with this selection in the loaded inventory."
      />
    );
  }

  return (
    <DrawerAccordion
      count={generatedLinks.length}
      detail="Generated artifact references are read-only in this drawer step."
      items={generatedLinks}
      title="Linked generated artifacts"
    />
  );
}

function DrawerAccordion({
  count,
  detail,
  items,
  title,
}: {
  count: number;
  detail: string;
  items: MissionDataFlowTraceabilityLink[];
  title: string;
}) {
  return (
    <details className="mission-data-flow-drawer-accordion" open>
      <summary>
        <span>{title}</span>
        <strong>{count}</strong>
      </summary>
      <p>{detail}</p>
      {items.length > 0 ? (
        <div className="mission-data-flow-drawer-link-list">
          {items.slice(0, 6).map((link) => (
            <article key={link.id}>
              <span>{link.label}</span>
              <strong>{link.state}</strong>
              <small>{link.detail}</small>
            </article>
          ))}
        </div>
      ) : (
        <div className="mission-data-flow-drawer-note">
          <strong>No reported records</strong>
          <span>Studio does not infer missing links.</span>
        </div>
      )}
    </details>
  );
}

function DrawerDeferredPanel({ title, detail }: { title: string; detail: string }) {
  return (
    <section className="mission-data-flow-drawer-section mission-data-flow-drawer-deferred">
      <header>
        <span className="cockpit-eyebrow">Not wired</span>
        <strong>{title}</strong>
      </header>
      <p>{detail}</p>
      <ProvenanceBadge label="NO INFERENCE" />
    </section>
  );
}

function createTraceabilityProperties(
  selection: DrawerSelection,
  dataFlowEvidence: CoreSimulationDataFlowEvidenceRecord | null,
): DrawerTraceabilityProperty[] {
  return [
    { label: "producer", value: dataFlowEvidence?.producer ?? "not reported" },
    { label: "producer type", value: dataFlowEvidence?.producer_type ?? "not reported" },
    { label: "triggered by command", value: dataFlowEvidence?.triggered_by_command ?? "not reported" },
    { label: "scenario", value: readStringField(dataFlowEvidence, "scenario") ?? readStringField(dataFlowEvidence, "scenario_id") ?? "not reported" },
    { label: "time", value: dataFlowEvidence ? formatTimeSeconds(dataFlowEvidence.t) : "not reported" },
    { label: "storage intent", value: readIntentField(dataFlowEvidence?.storage_intent, "class") },
    { label: "retention", value: readIntentField(dataFlowEvidence?.storage_intent, "retention") },
    { label: "overflow policy", value: readIntentField(dataFlowEvidence?.storage_intent, "overflow_policy") },
    { label: "downlink intent", value: readIntentField(dataFlowEvidence?.downlink_intent, "intent") },
    { label: "policy", value: readIntentField(dataFlowEvidence?.downlink_intent, "policy") },
    { label: "eligible flow", value: formatStringList(dataFlowEvidence?.eligible_downlink_flows, "not reported") },
    { label: "contact window", value: formatStringList(dataFlowEvidence?.contact_windows, "not reported") },
    { label: "state", value: selection.state },
  ];
}

function isCoreSimulationDataFlowEvidenceRecord(
  value: unknown,
): value is CoreSimulationDataFlowEvidenceRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && typeof (value as { t?: unknown }).t === "number");
}

function readStringField(value: unknown, key: string): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const result = (value as Record<string, unknown>)[key];

  return typeof result === "string" ? result : null;
}

function readIntentField(value: unknown, key: string): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "not reported";
  }

  const result = (value as Record<string, unknown>)[key];

  if (typeof result === "string" || typeof result === "number") {
    return String(result);
  }

  return "not reported";
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
