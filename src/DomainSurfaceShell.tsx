import type { ReactNode } from "react";

import { ProvenanceBadge, StatusBadge } from "./Badges";
import type {
  DomainEntitySummary,
  DomainSurfaceSnapshot,
} from "./domainSurfaceModel";

export function DomainSurfaceFrame({
  snapshot,
  children,
}: {
  snapshot: DomainSurfaceSnapshot;
  children: ReactNode;
}) {
  return (
    <section className="entry-section" aria-label={`${snapshot.definition.label} domain surface`}>
      {children}
    </section>
  );
}

export function DomainSurfaceHeader({
  snapshot,
  description,
}: {
  snapshot: DomainSurfaceSnapshot;
  description: ReactNode;
}) {
  return (
    <div className="file-viewer-header">
      <div>
        <h3>{snapshot.definition.label}</h3>
        <p>{description}</p>
      </div>
      <div className="badge-row">
        <ProvenanceBadge label="READ-ONLY" />
        <ProvenanceBadge label="CORE-DERIVED" />
        <StatusBadge label={snapshot.definition.lifecycleStatus.toUpperCase()} />
      </div>
    </div>
  );
}

export function DomainSurfaceSummary({
  snapshot,
}: {
  snapshot: DomainSurfaceSnapshot;
}) {
  return (
    <div className="summary-grid">
      <DomainSurfaceSummaryItem
        label="Source file"
        value={snapshot.sourceFileState.sourceFile?.name ?? snapshot.sourceFileState.state}
      />
      <DomainSurfaceSummaryItem
        label="Model summary"
        value={snapshot.coreReportState.modelSummaryState}
      />
      <DomainSurfaceSummaryItem
        label="Entity index"
        value={snapshot.coreReportState.entityIndexState}
      />
      <DomainSurfaceSummaryItem
        label="Entities"
        value={String(snapshot.entityCount)}
      />
    </div>
  );
}

export function DomainEntityList({
  entities,
  onSelectEntity,
}: {
  entities: readonly DomainEntitySummary[];
  onSelectEntity?: (entity: DomainEntitySummary) => void;
}) {
  if (entities.length === 0) {
    return <DomainSurfaceEmptyState title="No Core entities" detail="No entity records are reported for this domain." />;
  }

  return (
    <ul className="entry-list">
      {entities.map((entity) => (
        <li key={`${entity.domain}-${entity.id}`}>
          <div className="entry-main">
            {onSelectEntity ? (
              <button
                className="entry-button"
                type="button"
                onClick={() => onSelectEntity(entity)}
              >
                {entity.displayName || entity.id}
              </button>
            ) : (
              <strong>{entity.displayName || entity.id}</strong>
            )}
            <StatusBadge label={entity.present ? "PRESENT" : "NOT PRESENT"} />
          </div>
          <div className="command-meta">
            <span>id: {entity.id}</span>
            <span>type: {entity.entityType}</span>
            <span>source: {entity.sourceFile}</span>
            <span>provenance: {entity.provenance}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DomainEntityDetail({ entity }: { entity: DomainEntitySummary }) {
  return (
    <section className="entry-section muted-section" aria-label="Domain entity detail">
      <h3>Entity detail</h3>
      <div className="summary-grid">
        <DomainSurfaceSummaryItem label="ID" value={entity.id} />
        <DomainSurfaceSummaryItem label="Domain" value={entity.domain} />
        <DomainSurfaceSummaryItem label="Type" value={entity.entityType} />
        <DomainSurfaceSummaryItem label="Source file" value={entity.sourceFile} />
      </div>
      <pre>{JSON.stringify(entity.raw, null, 2)}</pre>
    </section>
  );
}

export function DomainSurfaceEmptyState({
  title,
  detail,
}: {
  title: string;
  detail: ReactNode;
}) {
  return (
    <section className="entry-section muted-section" aria-label={title}>
      <h3>{title}</h3>
      <p>{detail}</p>
    </section>
  );
}

function DomainSurfaceSummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
