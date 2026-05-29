import { DashboardIcon } from "./DashboardIcon";
import { ProvenanceBadge, StatusBadge } from "./Badges";
import type {
  MissionDataFlowWorkbenchLane,
  MissionDataFlowWorkbenchRecord,
  MissionDataFlowWorkbenchSnapshot,
  MissionDataFlowWorkbenchSourceSummary,
} from "./missionDataFlowWorkbenchModel";

export function MissionDataFlowWorkbenchSurface({
  snapshot,
}: {
  snapshot: MissionDataFlowWorkbenchSnapshot;
}) {
  const primaryRecord = findPrimaryInspectorRecord(snapshot);
  const scenarioLane = snapshot.lanes.find(
    (lane) => lane.id === "scenario-data-flow-evidence",
  );
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
          <span className="cockpit-eyebrow">v0.12.0 foundation</span>
          <h3>Mission Data Flow Workbench</h3>
          <p>
            Read-only workbench surface for Core-derived mission data-flow evidence,
            relationships, coverage and generated artifact context. The visual
            grammar follows Reference B without introducing private graph semantics.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="READ-ONLY" />
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="REFERENCE B LAYOUT" />
        </div>
      </div>

      <MissionDataFlowWorkbenchTabs />

      <div
        className="cockpit-work-grid mission-data-flow-workbench-grid"
        aria-label="Mission Data Flow Workbench layout"
      >
        <section
          className="cockpit-panel cockpit-panel-large mission-data-flow-workbench-canvas"
          aria-label="Read-only graph view foundation"
        >
          <MissionDataFlowWorkbenchToolbar snapshot={snapshot} />
          <MissionDataFlowWorkbenchCanvas snapshot={snapshot} />
        </section>

        <MissionDataFlowWorkbenchInspector record={primaryRecord} />
      </div>

      <div
        className="cockpit-work-grid mission-data-flow-workbench-lower-grid"
        aria-label="Mission Data Flow Workbench lower evidence panels"
      >
        <MissionDataFlowWorkbenchScenarioPanel lane={scenarioLane} />
        <MissionDataFlowWorkbenchValidationPanel
          coverageLane={coverageLane}
          relationshipLane={relationshipLane}
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
          Layout: left to right. Filters: Core-reported records only. The canvas
          shows a structured preview, not an editable graph.
        </p>
      </div>
      <div className="badge-row">
        <StatusBadge label={`${snapshot.counts.relationshipRecords} RELATIONS`} />
        <StatusBadge label={`${snapshot.counts.scenarioDataFlowEvidenceRecords} EVIDENCE`} />
      </div>
    </div>
  );
}

function MissionDataFlowWorkbenchCanvas({
  snapshot,
}: {
  snapshot: MissionDataFlowWorkbenchSnapshot;
}) {
  const canvasRecords = selectCanvasRecords(snapshot);

  if (canvasRecords.length === 0) {
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
    <div className="cockpit-contract-topology" aria-label="Read-only flow canvas preview">
      {canvasRecords.map((record, index) => (
        <div
          className="cockpit-contract-node cockpit-contract-node-detected"
          key={record.id}
        >
          <span className="cockpit-contract-node-index">
            {index + 1 < 10 ? `0${index + 1}` : index + 1}
          </span>
          <div>
            <strong>{record.label}</strong>
            <span>{record.kind}</span>
          </div>
          <small>{record.provenance}</small>
        </div>
      ))}
    </div>
  );
}

function MissionDataFlowWorkbenchInspector({
  record,
}: {
  record: MissionDataFlowWorkbenchRecord | null;
}) {
  return (
    <aside className="cockpit-panel" aria-label="Workbench Inspector placeholder">
      <div className="entry-main">
        <div>
          <span className="cockpit-eyebrow">Inspector</span>
          <h3>{record ? "Selected reported record" : "No selection"}</h3>
        </div>
        <DashboardIcon kind="evidence" />
      </div>

      {record ? (
        <div className="cockpit-compact-list">
          <div className="cockpit-row">
            <span>ID</span>
            <strong>{record.id}</strong>
          </div>
          <div className="cockpit-row">
            <span>Kind</span>
            <strong>{record.kind}</strong>
          </div>
          <div className="cockpit-row">
            <span>State</span>
            <strong>{record.state}</strong>
          </div>
          <div className="cockpit-row">
            <span>Provenance</span>
            <strong>{record.provenance}</strong>
          </div>
          <div className="cockpit-empty-module cockpit-empty-module-dormant">
            <strong>Read-only preview</strong>
            <span>{record.detail}</span>
          </div>
        </div>
      ) : (
        <div className="cockpit-empty-module cockpit-empty-module-dormant">
          <strong>Inspector binding reserved</strong>
          <span>
            Dedicated record selection and Inspector synchronization are reserved
            for a later Workbench slice.
          </span>
        </div>
      )}
    </aside>
  );
}

function MissionDataFlowWorkbenchScenarioPanel({
  lane,
}: {
  lane: MissionDataFlowWorkbenchLane | undefined;
}) {
  const records = lane?.records ?? [];

  return (
    <article className="cockpit-panel" aria-label="Scenario timeline foundation">
      <div className="entry-main">
        <div>
          <span className="cockpit-eyebrow">Scenario Timeline</span>
          <h3>Data-flow evidence</h3>
        </div>
        <StatusBadge label={lane?.state.toUpperCase() ?? "NOT-REPORTED"} />
      </div>

      {records.length > 0 ? (
        <ul className="entry-list">
          {records.slice(0, 6).map((record) => (
            <MissionDataFlowWorkbenchRecordItem record={record} key={record.id} />
          ))}
        </ul>
      ) : (
        <div className="cockpit-empty-module cockpit-empty-module-dormant">
          <strong>No scenario data-flow evidence</strong>
          <span>{lane?.emptyDetail ?? "No Core simulation report has been loaded."}</span>
        </div>
      )}
    </article>
  );
}

function MissionDataFlowWorkbenchValidationPanel({
  coverageLane,
  relationshipLane,
}: {
  coverageLane: MissionDataFlowWorkbenchLane | undefined;
  relationshipLane: MissionDataFlowWorkbenchLane | undefined;
}) {
  const coverageRecords = coverageLane?.records ?? [];
  const relationshipRecords = relationshipLane?.records ?? [];

  return (
    <article className="cockpit-panel" aria-label="Validation results foundation">
      <div className="entry-main">
        <div>
          <span className="cockpit-eyebrow">Lint / Validation Results</span>
          <h3>Reported coverage and relationships</h3>
        </div>
        <DashboardIcon kind="validation" />
      </div>

      <div className="summary-grid">
        <WorkbenchCount label="Coverage records" value={coverageRecords.length} />
        <WorkbenchCount label="Relationship records" value={relationshipRecords.length} />
      </div>

      <div className="cockpit-compact-list">
        {[...coverageRecords, ...relationshipRecords].slice(0, 5).map((record) => (
          <div className="cockpit-row" key={record.id}>
            <span>{record.label}</span>
            <strong>{record.state}</strong>
          </div>
        ))}
      </div>
    </article>
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

function MissionDataFlowWorkbenchRecordItem({
  record,
}: {
  record: MissionDataFlowWorkbenchRecord;
}) {
  return (
    <li>
      <div className="entry-main">
        <strong>{record.label}</strong>
        <div className="badge-row">
          <StatusBadge label={record.state.toUpperCase()} />
        </div>
      </div>
      <div className="command-meta">
        <span>kind: {record.kind}</span>
        <span>provenance: {record.provenance}</span>
        <span>{record.detail}</span>
      </div>
    </li>
  );
}

function selectCanvasRecords(
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
