import type { RelationshipRecordDto } from "../../core/contracts";
import { entityKey, type EntityRef } from "../../mission/entityRef";
import type { MissionSession } from "../../mission/MissionSession";
import {
  relationshipPresentation,
  type RelationshipPresentation,
} from "../../mission/relationshipPresentation";
import type { ContextPathStep } from "../../mission/selection";

interface RelationshipExplorerProps {
  session: MissionSession;
  subject: EntityRef | null;
  contextPath: readonly ContextPathStep[];
  onFollow: (step: ContextPathStep) => void;
  onOpenExplore: () => void;
}

interface TraversableRelationship {
  relationship: RelationshipRecordDto;
  direction: "forward" | "inverse";
  neighbor: EntityRef;
  presentation: RelationshipPresentation | null;
}

export function RelationshipExplorer({
  session,
  subject,
  contextPath,
  onFollow,
  onOpenExplore,
}: RelationshipExplorerProps) {
  if (session.readiness.relationships === "pending") {
    return <RelationshipStatus title="Reading explicit mission relationships…" />;
  }

  if (session.readiness.relationships === "failed") {
    return (
      <RelationshipStatus
        title="Relationship surface unavailable"
        description="The mission is still open, but Studio cannot safely explore relationships for this session."
      />
    );
  }

  if (subject === null) {
    return (
      <RelationshipStatus
        title="Choose an entity to explore its context"
        description="Relationship exploration is local and selection-centered. Studio does not open a whole-mission graph by default."
        action="Find an entity"
        onAction={onOpenExplore}
      />
    );
  }

  const currentRecord = session.readModel.entityRecordsByKey.get(entityKey(subject));
  const relationships = relationshipsForSubject(session, subject);
  const groups = groupRelationships(relationships);

  return (
    <section className="relationship-explorer" aria-label="Relationship Explorer">
      <header className="relationship-explorer-header">
        <div>
          <p className="eyebrow">Relationship Explorer</p>
          <h1>{currentRecord?.display_name ?? subject.id}</h1>
          <p>
            Follow explicit Core-owned relationships without losing the path that brought you
            here.
          </p>
        </div>
        <div className="relationship-subject-id">
          <span>{currentRecord?.entity_type ?? subject.domain}</span>
          <code>{subject.id}</code>
        </div>
      </header>

      {contextPath.length > 0 ? (
        <div className="relationship-path-summary">
          <span>Context Path</span>
          <strong>{contextPath.length} hop{contextPath.length === 1 ? "" : "s"}</strong>
        </div>
      ) : null}

      {relationships.length === 0 ? (
        <div className="relationship-empty-local">
          No explicit Core-owned relationships are available for this entity.
        </div>
      ) : (
        <div className="relationship-groups">
          {groups.map(([group, items]) => (
            <section key={group} className="relationship-group">
              <header>
                <h2>{groupLabel(group)}</h2>
                <span>{items.length}</span>
              </header>
              <div className="relationship-explorer-list">
                {items.map((item) => (
                  <ExplorerRelationshipRow
                    key={`${item.relationship.relationship_id}-${item.direction}`}
                    session={session}
                    subject={subject}
                    item={item}
                    onFollow={onFollow}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

function ExplorerRelationshipRow({
  session,
  subject,
  item,
  onFollow,
}: {
  session: MissionSession;
  subject: EntityRef;
  item: TraversableRelationship;
  onFollow: (step: ContextPathStep) => void;
}) {
  const record = session.readModel.entityRecordsByKey.get(entityKey(item.neighbor));
  const label = item.presentation
    ? item.direction === "forward"
      ? item.presentation.forwardLabel
      : item.presentation.inverseLabel
    : "Core relationship";

  return (
    <button
      type="button"
      className="relationship-explorer-row"
      onClick={() =>
        onFollow({
          relationshipId: item.relationship.relationship_id,
          from: subject,
          to: item.neighbor,
          direction: item.direction,
        })
      }
    >
      <span className="relationship-explorer-verb">
        {label}
        {!item.presentation ? <code>{item.relationship.relationship_type}</code> : null}
      </span>
      <span className="relationship-explorer-target">
        <strong>{record?.display_name ?? item.neighbor.id}</strong>
        <small>{record?.entity_type ?? item.neighbor.domain}</small>
        <code>{item.neighbor.id}</code>
      </span>
      <span className="relationship-explorer-arrow" aria-hidden="true">
        →
      </span>
    </button>
  );
}

function relationshipsForSubject(
  session: MissionSession,
  subject: EntityRef,
): TraversableRelationship[] {
  const key = entityKey(subject);
  const result: TraversableRelationship[] = [];

  for (const relationship of session.readModel.outgoingByEntity.get(key) ?? []) {
    result.push({
      relationship,
      direction: "forward",
      neighbor: relationship.to,
      presentation: relationshipPresentation(relationship.relationship_type),
    });
  }

  for (const relationship of session.readModel.incomingByEntity.get(key) ?? []) {
    result.push({
      relationship,
      direction: "inverse",
      neighbor: relationship.from,
      presentation: relationshipPresentation(relationship.relationship_type),
    });
  }

  return result.sort((left, right) => {
    const leftGroup = left.presentation?.group ?? "other";
    const rightGroup = right.presentation?.group ?? "other";
    if (leftGroup !== rightGroup) {
      return leftGroup.localeCompare(rightGroup);
    }
    return left.relationship.relationship_id.localeCompare(right.relationship.relationship_id);
  });
}

function groupRelationships(
  relationships: TraversableRelationship[],
): [string, TraversableRelationship[]][] {
  const groups = new Map<string, TraversableRelationship[]>();

  for (const item of relationships) {
    const group = item.presentation?.group ?? "other";
    const values = groups.get(group) ?? [];
    values.push(item);
    groups.set(group, values);
  }

  const order = ["fdir", "operations", "data", "structure", "other"];
  return [...groups.entries()].sort(
    ([left], [right]) => order.indexOf(left) - order.indexOf(right),
  );
}

function groupLabel(group: string): string {
  switch (group) {
    case "fdir":
      return "FDIR & Recovery";
    case "operations":
      return "Operations";
    case "data":
      return "Mission Data & Lifecycle";
    case "structure":
      return "System Context";
    default:
      return "Other explicit relationships";
  }
}

function RelationshipStatus({
  title,
  description,
  action,
  onAction,
}: {
  title: string;
  description?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <section className="relationship-status">
      <p className="eyebrow">Relationship Explorer</p>
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
      {action && onAction ? (
        <button className="secondary-action" type="button" onClick={onAction}>
          {action}
        </button>
      ) : null}
    </section>
  );
}
