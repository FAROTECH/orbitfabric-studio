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
  return (
    <section
      id="studio-data-flow-workbench"
      className="entry-section"
      aria-label="Mission Data Flow Workbench"
    >
      <div className="file-viewer-header">
        <div>
          <span className="cockpit-eyebrow">v0.12.0 foundation</span>
          <h3>Mission Data Flow Workbench</h3>
          <p>
            Read-only workbench shell for Core-derived mission data-flow evidence,
            relationships, coverage and generated artifact context. This surface
            renders reported records only and does not infer graph semantics.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="READ-ONLY" />
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="FOUNDATION" />
        </div>
      </div>

      <MissionDataFlowWorkbenchBoundary snapshot={snapshot} />
      <MissionDataFlowWorkbenchSources sources={snapshot.sources} />
      <MissionDataFlowWorkbenchCounts snapshot={snapshot} />

      <div className="cockpit-work-grid" aria-label="Mission data-flow workbench lanes">
        {snapshot.lanes.map((lane) => (
          <MissionDataFlowWorkbenchLanePanel lane={lane} key={lane.id} />
        ))}
      </div>
    </section>
  );
}

function MissionDataFlowWorkbenchBoundary({
  snapshot,
}: {
  snapshot: MissionDataFlowWorkbenchSnapshot;
}) {
  return (
    <section className="entry-section muted-section" aria-label="Workbench boundary">
      <div className="entry-main">
        <div>
          <h3>Boundary</h3>
          <p>
            Source of truth: {snapshot.boundary.sourceOfTruth}. Inference: {" "}
            {snapshot.boundary.inference}. Graph semantics: {" "}
            {snapshot.boundary.graphSemantics}. Authoring: {" "}
            {snapshot.boundary.authoring}.
          </p>
        </div>
        <div className="badge-row">
          <StatusBadge label="NO INFERENCE" />
          <StatusBadge label="NO AUTHORING" />
        </div>
      </div>
    </section>
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

function MissionDataFlowWorkbenchCounts({
  snapshot,
}: {
  snapshot: MissionDataFlowWorkbenchSnapshot;
}) {
  return (
    <section className="entry-section" aria-label="Workbench record counts">
      <div className="summary-grid">
        <WorkbenchCount label="Domains" value={snapshot.counts.missionDomains} />
        <WorkbenchCount
          label="Relationship types"
          value={snapshot.counts.relationshipTypes}
        />
        <WorkbenchCount
          label="Relationships"
          value={snapshot.counts.relationshipRecords}
        />
        <WorkbenchCount
          label="Scenario evidence"
          value={snapshot.counts.scenarioDataFlowEvidenceRecords}
        />
        <WorkbenchCount label="Coverage scopes" value={snapshot.counts.coverageScopes} />
        <WorkbenchCount label="Artifacts" value={snapshot.counts.generatedArtifacts} />
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

function MissionDataFlowWorkbenchLanePanel({
  lane,
}: {
  lane: MissionDataFlowWorkbenchLane;
}) {
  return (
    <article className="cockpit-panel" aria-label={lane.title}>
      <div className="entry-main">
        <div>
          <span className="cockpit-eyebrow">{lane.provenance}</span>
          <h3>{lane.title}</h3>
        </div>
        <StatusBadge label={lane.state.toUpperCase()} />
      </div>

      {lane.records.length === 0 ? (
        <div className="cockpit-empty-module cockpit-empty-module-dormant">
          <strong>No reported records</strong>
          <span>{lane.emptyDetail}</span>
        </div>
      ) : (
        <ul className="entry-list">
          {lane.records.map((record) => (
            <MissionDataFlowWorkbenchRecordItem record={record} key={record.id} />
          ))}
        </ul>
      )}
    </article>
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
