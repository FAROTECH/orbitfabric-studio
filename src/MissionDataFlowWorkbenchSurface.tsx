import { useState } from "react";

import { DashboardIcon } from "./DashboardIcon";
import { ProvenanceBadge, StatusBadge } from "./Badges";
import type {
  MissionDataFlowTraceabilityLink,
  MissionDataFlowTraceabilitySummary,
  MissionDataFlowWorkbenchLane,
  MissionDataFlowWorkbenchRecord,
  MissionDataFlowWorkbenchSnapshot,
  MissionDataFlowWorkbenchSourceSummary,
} from "./missionDataFlowWorkbenchModel";
import type {
  CoreRelationshipRecord,
  CoreSimulationDataFlowEvidenceRecord,
} from "./types/workspace";

interface WorkbenchCanvasNode {
  id: string;
  label: string;
  kind: string;
  provenance: string;
  detail: string;
  raw: unknown;
}

interface WorkbenchCanvasEdge {
  id: string;
  label: string;
  fromLabel: string;
  toLabel: string;
  relationshipType: string;
  detail: string;
  raw: unknown;
}

interface WorkbenchInspectorSelection {
  id: string;
  label: string;
  kind: string;
  evidenceKind: string;
  state: string;
  provenance: string;
  detail: string;
  raw: unknown;
}

interface WorkbenchCanvasEndpointRaw {
  endpoint: {
    domain: string;
    id: string;
  };
  relationship_id: string;
  relationship_type: string;
  direction: string;
}

export function MissionDataFlowWorkbenchSurface({
  snapshot,
}: {
  snapshot: MissionDataFlowWorkbenchSnapshot;
}) {
  const primaryRecord = findPrimaryInspectorRecord(snapshot);
  const [selectedInspectorItem, setSelectedInspectorItem] =
    useState<WorkbenchInspectorSelection | null>(null);
  const inspectorSelection =
    selectedInspectorItem ?? toInspectorSelectionFromRecord(primaryRecord);
  const scenarioLane = snapshot.lanes.find(
    (lane) => lane.id === "scenario-data-flow-evidence",
  );
  const validationLane = snapshot.lanes.find((lane) => lane.id === "validation");
  const coverageLane = snapshot.lanes.find((lane) => lane.id === "coverage");
  const relationshipLane = snapshot.lanes.find(
    (lane) => lane.id === "relationship-manifest",
  );

  return (
    <section
      id="studio-data-flow-workbench"
      className="entry-section mission-data-flow-workbench"
      aria-label="Mission Data Flow Workbench"
    >
      <div className="file-viewer-header">
        <div>
          <span className="cockpit-eyebrow">v0.14.0 traceability integration</span>
          <h3>Mission Data Flow Workbench</h3>
          <p>
            Read-only workbench surface for Core-derived mission data-flow evidence,
            relationships, validation, coverage, generated artifact context and
            reported traceability links. The visual grammar follows Reference B
            without introducing private graph semantics.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="READ-ONLY" />
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="TRACEABILITY" />
        </div>
      </div>

      <MissionDataFlowWorkbenchTabs />
      <MissionDataFlowWorkbenchEvidenceSummary snapshot={snapshot} />

      <div
        className="cockpit-work-grid mission-data-flow-workbench-grid"
        aria-label="Mission Data Flow Workbench layout"
      >
        <section
          className="cockpit-panel cockpit-panel-large mission-data-flow-workbench-canvas"
          aria-label="Read-only graph view foundation"
        >
          <MissionDataFlowWorkbenchToolbar snapshot={snapshot} />
          <MissionDataFlowWorkbenchCanvas
            snapshot={snapshot}
            onSelectInspectorItem={setSelectedInspectorItem}
          />
        </section>

        <MissionDataFlowWorkbenchInspector
          selection={inspectorSelection}
          traceability={snapshot.traceability}
        />
      </div>

      <div
        className="cockpit-work-grid mission-data-flow-workbench-lower-grid"
        aria-label="Mission Data Flow Workbench lower evidence panels"
      >
        <MissionDataFlowWorkbenchScenarioPanel
          lane={scenarioLane}
          onSelectRecord={(record) =>
            setSelectedInspectorItem(toInspectorSelectionFromRecord(record))
          }
        />
        <MissionDataFlowWorkbenchValidationPanel
          validationLane={validationLane}
          coverageLane={coverageLane}
          relationshipLane={relationshipLane}
          onSelectRecord={(record) =>
            setSelectedInspectorItem(toInspectorSelectionFromRecord(record))
          }
        />
      </div>

      <MissionDataFlowWorkbenchSources sources={snapshot.sources} />
    </section>
  );
}

function MissionDataFlowWorkbenchTabs() {
  const tabs = [
    { label: "Graph View", state: "active" },
    { label: "YAML View", state: "reserved" },
    { label: "Scenario Runner", state: "reserved" },
    { label: "Data Flow Evidence", state: "reported" },
  ] as const;

  return (
    <nav className="entry-section muted-section" aria-label="Workbench views">
      <div className="badge-row">
        {tabs.map((tab) => (
          <span
            className="cockpit-command-chip"
            aria-current={tab.state === "active" ? "page" : undefined}
            key={tab.label}
            title={
              tab.state === "reserved"
                ? "Reserved for a later milestone"
                : "Read-only Core-derived view"
            }
          >
            {tab.label}
          </span>
        ))}
      </div>
    </nav>
  );
}

function MissionDataFlowWorkbenchEvidenceSummary({
  snapshot,
}: {
  snapshot: MissionDataFlowWorkbenchSnapshot;
}) {
  return (
    <section
      className="entry-section muted-section"
      aria-label="Mission Data Flow Workbench evidence summary"
    >
      <div className="entry-main">
        <div>
          <span className="cockpit-eyebrow">Evidence posture</span>
          <h3>Reported Workbench inputs</h3>
          <p>
            Compact Reference B rail for the current Workbench state. Counts come
            directly from the Core-derived snapshot.
          </p>
        </div>
        <DashboardIcon kind="evidence" />
      </div>

      <div className="summary-grid">
        <WorkbenchCount
          label="Relationship records"
          value={snapshot.counts.relationshipRecords}
        />
        <WorkbenchCount
          label="Scenario evidence"
          value={snapshot.counts.scenarioDataFlowEvidenceRecords}
        />
        <WorkbenchCount
          label="Validation evidence"
          value={snapshot.counts.validationEvidenceRecords}
        />
        <WorkbenchCount label="Coverage records" value={snapshot.counts.coverageScopes} />
        <WorkbenchCount label="Traceability links" value={snapshot.counts.traceabilityLinks} />
        <div className="summary-item">
          <span>Boundary</span>
          <strong>{snapshot.boundary.readOnly ? "read-only" : "unavailable"}</strong>
        </div>
      </div>
    </section>
  );
}

function MissionDataFlowWorkbenchToolbar({
  snapshot,
}: {
  snapshot: MissionDataFlowWorkbenchSnapshot;
}) {
  return (
    <div className="entry-main" aria-label="Workbench graph toolbar">
      <div>
        <span className="cockpit-eyebrow">Graph View</span>
        <h3>Reported flow foundation</h3>
        <p>
          Select reported nodes, edges and evidence records to inspect their Core
          provenance and related traceability. The canvas remains read-only.
        </p>
      </div>
      <div className="badge-row">
        <StatusBadge label={`${snapshot.counts.relationshipRecords} RELATIONS`} />
        <StatusBadge label={`${snapshot.counts.scenarioDataFlowEvidenceRecords} EVIDENCE`} />
        <StatusBadge label={`${snapshot.counts.traceabilityLinks} TRACE LINKS`} />
      </div>
    </div>
  );
}

function MissionDataFlowWorkbenchCanvas({
  snapshot,
  onSelectInspectorItem,
}: {
  snapshot: MissionDataFlowWorkbenchSnapshot;
  onSelectInspectorItem: (selection: WorkbenchInspectorSelection) => void;
}) {
  const canvasNodes = selectCanvasNodes(snapshot);
  const canvasEdges = selectCanvasEdges(snapshot);

  if (canvasNodes.length === 0) {
    return (
      <div className="cockpit-empty-module cockpit-empty-module-dormant">
        <strong>No Core-reported flow records</strong>
        <span>
          Run or load Core model summary, entity index, relationship manifest and
          scenario evidence reports to populate this read-only canvas foundation.
        </span>
      </div>
    );
  }

  return (
    <div aria-label="Read-only flow canvas preview">
      <div className="cockpit-contract-topology">
        {canvasNodes.map((node, index) => (
          <button
            className="cockpit-contract-node cockpit-contract-node-detected"
            key={node.id}
            type="button"
            onClick={() => onSelectInspectorItem(toInspectorSelectionFromNode(node))}
          >
            <span className="cockpit-contract-node-index">
              {index + 1 < 10 ? `0${index + 1}` : index + 1}
            </span>
            <div>
              <strong>{node.label}</strong>
              <span>{node.kind}</span>
            </div>
            <small>{node.provenance}</small>
          </button>
        ))}
      </div>

      {canvasEdges.length > 0 ? (
        <div className="cockpit-compact-list" aria-label="Core-reported canvas edges">
          <h4>Core-reported edges</h4>
          {canvasEdges.map((edge) => (
            <button
              className="cockpit-row"
              key={edge.id}
              title={edge.detail}
              type="button"
              onClick={() => onSelectInspectorItem(toInspectorSelectionFromEdge(edge))}
            >
              <span>
                {edge.fromLabel} -&gt; {edge.toLabel}
              </span>
              <strong>{edge.relationshipType}</strong>
            </button>
          ))}
        </div>
      ) : (
        <div className="cockpit-empty-module cockpit-empty-module-dormant">
          <strong>No Core-reported edges</strong>
          <span>
            The canvas is showing reported records only. Relationship edges appear
            only when Core reports relationship manifest records.
          </span>
        </div>
      )}
    </div>
  );
}

function MissionDataFlowWorkbenchInspector({
  selection,
  traceability,
}: {
  selection: WorkbenchInspectorSelection | null;
  traceability: MissionDataFlowTraceabilitySummary;
}) {
  const relatedTraceabilityLinks = selection
    ? selectTraceabilityLinksForSelection(traceability, selection)
    : [];

  return (
    <aside className="cockpit-panel" aria-label="Workbench Inspector">
      <div className="entry-main">
        <div>
          <span className="cockpit-eyebrow">Inspector</span>
          <h3>{selection ? "Selected reported evidence" : "No selection"}</h3>
        </div>
        <DashboardIcon kind="evidence" />
      </div>

      {selection ? (
        <div className="cockpit-compact-list">
          <div className="cockpit-row">
            <span>ID</span>
            <strong>{selection.id}</strong>
          </div>
          <div className="cockpit-row">
            <span>Kind</span>
            <strong>{selection.kind}</strong>
          </div>
          <div className="cockpit-row">
            <span>Evidence</span>
            <strong>{selection.evidenceKind}</strong>
          </div>
          <div className="cockpit-row">
            <span>State</span>
            <strong>{selection.state}</strong>
          </div>
          <div className="cockpit-row">
            <span>Provenance</span>
            <strong>{selection.provenance}</strong>
          </div>
          <div className="cockpit-empty-module cockpit-empty-module-dormant">
            <strong>Read-only detail</strong>
            <span>{selection.detail}</span>
          </div>
          <WorkbenchInspectorTraceabilitySection links={relatedTraceabilityLinks} />
          <pre className="raw-output-block inspector-raw-block">
            {formatWorkbenchRawValue(selection.raw)}
          </pre>
        </div>
      ) : (
        <div className="cockpit-empty-module cockpit-empty-module-dormant">
          <strong>No reported evidence selected</strong>
          <span>
            Select a Core-reported node, edge or evidence record to inspect it. No
            editing or private inference is performed.
          </span>
        </div>
      )}
    </aside>
  );
}

function WorkbenchInspectorTraceabilitySection({
  links,
}: {
  links: MissionDataFlowTraceabilityLink[];
}) {
  const displayedLinks = links.slice(0, 6);

  return (
    <section className="cockpit-compact-list" aria-label="Inspector traceability blocks">
      <h4>Traceability</h4>
      {displayedLinks.length > 0 ? (
        <>
          <div className="summary-grid">
            <WorkbenchCount label="Related links" value={links.length} />
            <WorkbenchCount
              label="Unavailable"
              value={links.filter((link) => link.state === "unavailable").length}
            />
          </div>
          {displayedLinks.map((link) => (
            <article
              className="cockpit-empty-module cockpit-empty-module-dormant"
              key={link.id}
            >
              <div className="entry-main">
                <div>
                  <strong>{link.label}</strong>
                  <span>{link.kind}</span>
                </div>
                <StatusBadge label={link.state.toUpperCase()} />
              </div>
              <div className="command-meta">
                <span>
                  {link.from.label} -&gt; {link.to.label}
                </span>
                <span>evidence: {link.evidenceKind}</span>
                <span>provenance: {link.provenance}</span>
                <span>{link.detail}</span>
              </div>
            </article>
          ))}
          {links.length > displayedLinks.length ? (
            <div className="cockpit-empty-module cockpit-empty-module-dormant">
              <strong>{links.length - displayedLinks.length} additional links hidden</strong>
              <span>
                The Inspector keeps the traceability block compact. The underlying
                Workbench snapshot still carries the full read-only link set.
              </span>
            </div>
          ) : null}
        </>
      ) : (
        <div className="cockpit-empty-module cockpit-empty-module-dormant">
          <strong>No reported traceability links</strong>
          <span>
            No Core-reported relationship, scenario, validation, coverage or generated
            artifact link references this selected record. Studio does not infer
            missing traceability.
          </span>
        </div>
      )}
    </section>
  );
}

function MissionDataFlowWorkbenchScenarioPanel({
  lane,
  onSelectRecord,
}: {
  lane: MissionDataFlowWorkbenchLane | undefined;
  onSelectRecord: (record: MissionDataFlowWorkbenchRecord) => void;
}) {
  const records = lane?.records ?? [];

  return (
    <article className="cockpit-panel" aria-label="Scenario timeline foundation">
      <div className="entry-main">
        <div>
          <span className="cockpit-eyebrow">Scenario Timeline</span>
          <h3>Core-reported data-flow evidence</h3>
        </div>
        <StatusBadge label={lane?.state.toUpperCase() ?? "NOT-REPORTED"} />
      </div>

      {records.length > 0 ? (
        <div className="cockpit-compact-list">
          {records.slice(0, 6).map((record) => (
            <MissionDataFlowWorkbenchScenarioEvidenceItem
              key={record.id}
              record={record}
              onSelectRecord={onSelectRecord}
            />
          ))}
        </div>
      ) : (
        <div className="cockpit-empty-module cockpit-empty-module-dormant">
          <strong>No scenario data-flow evidence</strong>
          <span>{lane?.emptyDetail ?? "No Core simulation report has been loaded."}</span>
        </div>
      )}
    </article>
  );
}

function MissionDataFlowWorkbenchScenarioEvidenceItem({
  record,
  onSelectRecord,
}: {
  record: MissionDataFlowWorkbenchRecord;
  onSelectRecord: (record: MissionDataFlowWorkbenchRecord) => void;
}) {
  const evidence = isCoreSimulationDataFlowEvidenceRecord(record.raw)
    ? record.raw
    : null;

  return (
    <section className="cockpit-empty-module cockpit-empty-module-dormant">
      <div className="entry-main">
        <button
          className="entry-button"
          type="button"
          onClick={() => onSelectRecord(record)}
        >
          {record.label}
        </button>
        <StatusBadge label={record.state.toUpperCase()} />
      </div>

      {evidence ? (
        <div className="command-meta">
          <span>t={String(evidence.t)}</span>
          <span>producer: {evidence.producer ?? "not reported"}</span>
          <span>producer type: {evidence.producer_type ?? "not reported"}</span>
          <span>command: {evidence.triggered_by_command ?? "not reported"}</span>
          <span>
            flows: {formatStringList(evidence.eligible_downlink_flows, "not reported")}
          </span>
          <span>
            contacts: {formatStringList(evidence.contact_windows, "not reported")}
          </span>
          <span>storage: {formatOptionalJson(evidence.storage_intent)}</span>
          <span>downlink: {formatOptionalJson(evidence.downlink_intent)}</span>
        </div>
      ) : (
        <div className="command-meta">
          <span>kind: {record.kind}</span>
          <span>provenance: {record.provenance}</span>
          <span>{record.detail}</span>
        </div>
      )}
    </section>
  );
}

function MissionDataFlowWorkbenchValidationPanel({
  validationLane,
  coverageLane,
  relationshipLane,
  onSelectRecord,
}: {
  validationLane: MissionDataFlowWorkbenchLane | undefined;
  coverageLane: MissionDataFlowWorkbenchLane | undefined;
  relationshipLane: MissionDataFlowWorkbenchLane | undefined;
  onSelectRecord: (record: MissionDataFlowWorkbenchRecord) => void;
}) {
  const validationRecords = validationLane?.records ?? [];
  const coverageRecords = coverageLane?.records ?? [];
  const relationshipRecords = relationshipLane?.records ?? [];

  return (
    <article className="cockpit-panel" aria-label="Validation and coverage evidence">
      <div className="entry-main">
        <div>
          <span className="cockpit-eyebrow">Lint / Validation Results</span>
          <h3>Core-reported validation and coverage</h3>
        </div>
        <DashboardIcon kind="validation" />
      </div>

      <div className="summary-grid">
        <WorkbenchCount label="Validation records" value={validationRecords.length} />
        <WorkbenchCount label="Coverage records" value={coverageRecords.length} />
        <WorkbenchCount label="Relationship records" value={relationshipRecords.length} />
      </div>

      <WorkbenchEvidenceRecordGroup
        title="Validation evidence"
        emptyLabel="No validation evidence"
        emptyDetail="Run or load Core lint or dashboard reports to populate validation evidence."
        records={validationRecords}
        maxRecords={4}
        onSelectRecord={onSelectRecord}
      />
      <WorkbenchEvidenceRecordGroup
        title="Coverage evidence"
        emptyLabel="No coverage evidence"
        emptyDetail="Run or load Core coverage-summary to populate coverage evidence."
        records={coverageRecords}
        maxRecords={5}
        onSelectRecord={onSelectRecord}
      />
      <WorkbenchEvidenceRecordGroup
        title="Relationship evidence"
        emptyLabel="No relationship evidence"
        emptyDetail="Run or load Core relationship-manifest to populate relationship evidence."
        records={relationshipRecords.filter((record) => record.kind === "relationship-record")}
        maxRecords={3}
        onSelectRecord={onSelectRecord}
      />
    </article>
  );
}

function WorkbenchEvidenceRecordGroup({
  title,
  emptyLabel,
  emptyDetail,
  records,
  maxRecords,
  onSelectRecord,
}: {
  title: string;
  emptyLabel: string;
  emptyDetail: string;
  records: MissionDataFlowWorkbenchRecord[];
  maxRecords: number;
  onSelectRecord: (record: MissionDataFlowWorkbenchRecord) => void;
}) {
  const displayedRecords = records.slice(0, maxRecords);

  return (
    <section className="cockpit-compact-list" aria-label={title}>
      <h4>{title}</h4>
      {displayedRecords.length > 0 ? (
        displayedRecords.map((record) => (
          <MissionDataFlowWorkbenchRecordRow
            key={record.id}
            record={record}
            onSelectRecord={onSelectRecord}
          />
        ))
      ) : (
        <div className="cockpit-empty-module cockpit-empty-module-dormant">
          <strong>{emptyLabel}</strong>
          <span>{emptyDetail}</span>
        </div>
      )}
    </section>
  );
}

function MissionDataFlowWorkbenchRecordRow({
  record,
  onSelectRecord,
}: {
  record: MissionDataFlowWorkbenchRecord;
  onSelectRecord: (record: MissionDataFlowWorkbenchRecord) => void;
}) {
  return (
    <button
      className="cockpit-row"
      type="button"
      title={record.detail}
      onClick={() => onSelectRecord(record)}
    >
      <span>{record.label}</span>
      <strong>{record.kind}</strong>
    </button>
  );
}

function MissionDataFlowWorkbenchSources({
  sources,
}: {
  sources: MissionDataFlowWorkbenchSourceSummary[];
}) {
  return (
    <section className="entry-section" aria-label="Workbench reported sources">
      <div className="entry-main">
        <div>
          <h3>Reported sources</h3>
          <p>
            The workbench shell exposes only sources already reported by Core or
            loaded through generated artifact inspection.
          </p>
        </div>
        <DashboardIcon kind="evidence" />
      </div>

      <div className="summary-grid">
        {sources.map((source) => (
          <div className="summary-item" key={source.id} title={source.detail}>
            <span>{source.label}</span>
            <strong>{source.state}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function WorkbenchCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{String(value)}</strong>
    </div>
  );
}

function selectCanvasNodes(
  snapshot: MissionDataFlowWorkbenchSnapshot,
): WorkbenchCanvasNode[] {
  const edgeRecords = selectRelationshipRecords(snapshot);

  if (edgeRecords.length > 0) {
    const nodesById = new Map<string, WorkbenchCanvasNode>();

    for (const relationship of edgeRecords.slice(0, 8)) {
      const fromId = `${relationship.from.domain}:${relationship.from.id}`;
      const toId = `${relationship.to.domain}:${relationship.to.id}`;

      nodesById.set(fromId, {
        id: fromId,
        label: relationship.from.id,
        kind: relationship.from.domain,
        provenance: "core-relationship-manifest",
        detail: `Relationship endpoint from ${relationship.relationship_id}`,
        raw: {
          endpoint: relationship.from,
          relationship_id: relationship.relationship_id,
          relationship_type: relationship.relationship_type,
          direction: "from",
        },
      });
      nodesById.set(toId, {
        id: toId,
        label: relationship.to.id,
        kind: relationship.to.domain,
        provenance: "core-relationship-manifest",
        detail: `Relationship endpoint from ${relationship.relationship_id}`,
        raw: {
          endpoint: relationship.to,
          relationship_id: relationship.relationship_id,
          relationship_type: relationship.relationship_type,
          direction: "to",
        },
      });
    }

    return Array.from(nodesById.values()).slice(0, 8);
  }

  return selectFallbackCanvasRecords(snapshot).map((record) => ({
    id: record.id,
    label: record.label,
    kind: record.kind,
    provenance: record.provenance,
    detail: record.detail,
    raw: record.raw,
  }));
}

function selectCanvasEdges(
  snapshot: MissionDataFlowWorkbenchSnapshot,
): WorkbenchCanvasEdge[] {
  return selectRelationshipRecords(snapshot)
    .slice(0, 8)
    .map((relationship) => ({
      id: relationship.relationship_id,
      label: relationship.relationship_id,
      fromLabel: `${relationship.from.domain}:${relationship.from.id}`,
      toLabel: `${relationship.to.domain}:${relationship.to.id}`,
      relationshipType: relationship.relationship_type,
      detail: `Core-reported relationship ${relationship.relationship_id}`,
      raw: relationship,
    }));
}

function selectRelationshipRecords(
  snapshot: MissionDataFlowWorkbenchSnapshot,
): CoreRelationshipRecord[] {
  return recordsForLane(snapshot, "relationship-manifest")
    .filter((record) => record.kind === "relationship-record")
    .map((record) => record.raw)
    .filter(isCoreRelationshipRecord);
}

function selectFallbackCanvasRecords(
  snapshot: MissionDataFlowWorkbenchSnapshot,
): MissionDataFlowWorkbenchRecord[] {
  const relationshipRecords = recordsForLane(snapshot, "relationship-manifest").filter(
    (record) => record.kind === "relationship-record",
  );

  if (relationshipRecords.length > 0) {
    return relationshipRecords.slice(0, 8);
  }

  const scenarioRecords = recordsForLane(snapshot, "scenario-data-flow-evidence");

  if (scenarioRecords.length > 0) {
    return scenarioRecords.slice(0, 8);
  }

  return recordsForLane(snapshot, "mission-domains").slice(0, 8);
}

function findPrimaryInspectorRecord(
  snapshot: MissionDataFlowWorkbenchSnapshot,
): MissionDataFlowWorkbenchRecord | null {
  return (
    recordsForLane(snapshot, "relationship-manifest").find(
      (record) => record.kind === "relationship-record",
    ) ??
    recordsForLane(snapshot, "validation")[0] ??
    recordsForLane(snapshot, "scenario-data-flow-evidence")[0] ??
    recordsForLane(snapshot, "mission-domains")[0] ??
    null
  );
}

function recordsForLane(
  snapshot: MissionDataFlowWorkbenchSnapshot,
  laneId: MissionDataFlowWorkbenchLane["id"],
): MissionDataFlowWorkbenchRecord[] {
  return snapshot.lanes.find((lane) => lane.id === laneId)?.records ?? [];
}

function toInspectorSelectionFromRecord(
  record: MissionDataFlowWorkbenchRecord | null,
): WorkbenchInspectorSelection | null {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    label: record.label,
    kind: record.kind,
    evidenceKind: record.evidenceKind,
    state: record.state,
    provenance: record.provenance,
    detail: record.detail,
    raw: record.raw,
  };
}

function toInspectorSelectionFromNode(
  node: WorkbenchCanvasNode,
): WorkbenchInspectorSelection {
  return {
    id: `canvas-node:${node.id}`,
    label: node.label,
    kind: `canvas-node:${node.kind}`,
    evidenceKind: "relationship-evidence",
    state: "reported",
    provenance: node.provenance,
    detail: node.detail,
    raw: node.raw,
  };
}

function toInspectorSelectionFromEdge(
  edge: WorkbenchCanvasEdge,
): WorkbenchInspectorSelection {
  return {
    id: `canvas-edge:${edge.id}`,
    label: edge.label,
    kind: "canvas-edge:relationship-record",
    evidenceKind: "relationship-evidence",
    state: "reported",
    provenance: "core-relationship-manifest",
    detail: `${edge.fromLabel} -> ${edge.toLabel}, ${edge.relationshipType}`,
    raw: edge.raw,
  };
}

function selectTraceabilityLinksForSelection(
  traceability: MissionDataFlowTraceabilitySummary,
  selection: WorkbenchInspectorSelection,
): MissionDataFlowTraceabilityLink[] {
  const keys = createSelectionTraceabilityKeys(selection);

  return traceability.groups
    .flatMap((group) => group.links)
    .filter((link) => traceabilityLinkMatchesSelection(link, keys));
}

function createSelectionTraceabilityKeys(
  selection: WorkbenchInspectorSelection): Set<string> {
  const keys = new Set<string>();

  addTraceabilityKey(keys, selection.id);
  addPrefixedTraceabilityKeys(keys, selection.id);

  if (isCoreRelationshipRecord(selection.raw)) {
    addRelationshipTraceabilityKeys(keys, selection.raw.relationship_id);
    addEndpointTraceabilityKeys(keys, selection.raw.from.domain, selection.raw.from.id);
    addEndpointTraceabilityKeys(keys, selection.raw.to.domain, selection.raw.to.id);
  }

  if (isWorkbenchCanvasEndpointRaw(selection.raw)) {
    addRelationshipTraceabilityKeys(keys, selection.raw.relationship_id);
    addEndpointTraceabilityKeys(
      keys,
      selection.raw.endpoint.domain,
      selection.raw.endpoint.id,
    );
  }

  return keys;
}

function addPrefixedTraceabilityKeys(keys: Set<string>, value: string) {
  const knownPrefixes = [
    "relationship:",
    "scenario-data-flow:",
    "validation:",
    "coverage:",
    "generated-artifact:",
  ];

  for (const prefix of knownPrefixes) {
    if (value.startsWith(prefix)) {
      addTraceabilityKey(keys, `traceability:${value}`);
    }
  }

  if (value.startsWith("canvas-edge:")) {
    const relationshipId = value.replace("canvas-edge:", "");
    addRelationshipTraceabilityKeys(keys, relationshipId);
  }

  if (value.startsWith("canvas-node:")) {
    const endpointId = value.replace("canvas-node:", "");
    addTraceabilityKey(keys, endpointId);
  }
}

function addRelationshipTraceabilityKeys(keys: Set<string>, relationshipId: string) {
  addTraceabilityKey(keys, relationshipId);
  addTraceabilityKey(keys, `relationship:${relationshipId}`);
  addTraceabilityKey(keys, `traceability:relationship:${relationshipId}`);
}

function addEndpointTraceabilityKeys(keys: Set<string>, domain: string, id: string) {
  addTraceabilityKey(keys, id);
  addTraceabilityKey(keys, `${domain}:${id}`);
}

function addTraceabilityKey(keys: Set<string>, value: string | null | undefined) {
  if (value && value.trim().length > 0) {
    keys.add(value);
  }
}

function traceabilityLinkMatchesSelection(
  link: MissionDataFlowTraceabilityLink,
  keys: Set<string>,
): boolean {
  return (
    keys.has(link.id) ||
    keys.has(link.label) ||
    endpointMatchesSelection(link.from, keys) ||
    endpointMatchesSelection(link.to, keys)
  );
}

function endpointMatchesSelection(
  endpoint: MissionDataFlowTraceabilityLink["from"],
  keys: Set<string>,
): boolean {
  return (
    keys.has(endpoint.label) ||
    Boolean(endpoint.id && keys.has(endpoint.id)) ||
    Boolean(endpoint.recordId && keys.has(endpoint.recordId)) ||
    Boolean(endpoint.domain && endpoint.id && keys.has(`${endpoint.domain}:${endpoint.id}`))
  );
}

function formatWorkbenchRawValue(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatOptionalJson(value: unknown): string {
  if (value === null || value === undefined) {
    return "not reported";
  }

  return formatWorkbenchRawValue(value);
}

function formatStringList(values: string[] | undefined, fallback: string): string {
  if (!values || values.length === 0) {
    return fallback;
  }

  return values.join(", ");
}

function isCoreRelationshipRecord(value: unknown): value is CoreRelationshipRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CoreRelationshipRecord>;

  return Boolean(
    typeof candidate.relationship_id === "string" &&
      typeof candidate.relationship_type === "string" &&
      candidate.from &&
      typeof candidate.from.domain === "string" &&
      typeof candidate.from.id === "string" &&
      candidate.to &&
      typeof candidate.to.domain === "string" &&
      typeof candidate.to.id === "string",
  );
}

function isWorkbenchCanvasEndpointRaw(value: unknown): value is WorkbenchCanvasEndpointRaw {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<WorkbenchCanvasEndpointRaw>;

  return Boolean(
    candidate.endpoint &&
      typeof candidate.endpoint.domain === "string" &&
      typeof candidate.endpoint.id === "string" &&
      typeof candidate.relationship_id === "string" &&
      typeof candidate.relationship_type === "string" &&
      typeof candidate.direction === "string",
  );
}

function isCoreSimulationDataFlowEvidenceRecord(
  value: unknown,
): value is CoreSimulationDataFlowEvidenceRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CoreSimulationDataFlowEvidenceRecord>;

  return typeof candidate.t === "number";
}
