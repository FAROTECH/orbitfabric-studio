import type { RelationshipRecordDto } from "../core/contracts";
import { entityKey, type EntityKey, type EntityRef } from "../mission/entityRef";
import type { MissionSession } from "../mission/MissionSession";
import type { ContextPathStep } from "../mission/selection";

export interface ContextGraphNode {
  entity: EntityRef;
  key: EntityKey;
  depth: number;
}

export interface ContextGraphEdge {
  relationshipId: string;
  relationshipType: string;
  source: EntityRef;
  target: EntityRef;
}

export interface ContextGraphModel {
  root: EntityRef;
  nodes: readonly ContextGraphNode[];
  edges: readonly ContextGraphEdge[];
}

/**
 * Build the local context graph from Core-owned relationships only.
 *
 * `expanded` is presentation state: every expanded entity contributes its immediate
 * incoming/outgoing Core relationships. The function never infers additional edges.
 */
export function buildContextGraphModel(
  session: MissionSession,
  root: EntityRef,
  expanded: ReadonlySet<EntityKey>,
): ContextGraphModel {
  const rootKey = entityKey(root);
  const nodes = new Map<EntityKey, EntityRef>([[rootKey, root]]);
  const edges = new Map<string, ContextGraphEdge>();

  for (const expandedKey of expanded) {
    const record = session.readModel.entityRecordsByKey.get(expandedKey);
    if (!record) {
      continue;
    }

    const expandedRef: EntityRef = { domain: record.domain, id: record.id };
    nodes.set(expandedKey, expandedRef);

    for (const relationship of session.readModel.outgoingByEntity.get(expandedKey) ?? []) {
      addRelationship(nodes, edges, relationship);
    }

    for (const relationship of session.readModel.incomingByEntity.get(expandedKey) ?? []) {
      addRelationship(nodes, edges, relationship);
    }
  }

  const depths = shortestUndirectedDepths(rootKey, nodes, edges);
  const graphNodes = [...nodes.entries()]
    .map(([key, entity]) => ({
      entity,
      key,
      depth: depths.get(key) ?? Number.MAX_SAFE_INTEGER,
    }))
    .sort((left, right) => {
      if (left.depth !== right.depth) {
        return left.depth - right.depth;
      }
      return left.key.localeCompare(right.key);
    });

  return {
    root,
    nodes: graphNodes,
    edges: [...edges.values()].sort((left, right) =>
      left.relationshipId.localeCompare(right.relationshipId),
    ),
  };
}

export function initialContextExpansion(root: EntityRef): ReadonlySet<EntityKey> {
  return new Set([entityKey(root)]);
}

export function expandContextEntity(
  expanded: ReadonlySet<EntityKey>,
  entity: EntityRef,
): ReadonlySet<EntityKey> {
  const next = new Set(expanded);
  next.add(entityKey(entity));
  return next;
}

/**
 * Return one shortest traversal path through the currently visible Core relationships.
 *
 * This is presentation/navigation state only. It does not assert a new causal or semantic
 * relationship between the first and last entity in the path.
 */
export function findContextPath(
  model: ContextGraphModel,
  target: EntityRef,
): ContextPathStep[] | null {
  const rootKey = entityKey(model.root);
  const targetKey = entityKey(target);

  if (rootKey === targetKey) {
    return [];
  }

  interface Traversal {
    neighbor: EntityRef;
    step: ContextPathStep;
  }

  const adjacency = new Map<EntityKey, Traversal[]>();

  for (const node of model.nodes) {
    adjacency.set(node.key, []);
  }

  for (const edge of model.edges) {
    const sourceKey = entityKey(edge.source);
    const targetEdgeKey = entityKey(edge.target);

    adjacency.get(sourceKey)?.push({
      neighbor: edge.target,
      step: {
        relationshipId: edge.relationshipId,
        from: edge.source,
        to: edge.target,
        direction: "forward",
      },
    });

    adjacency.get(targetEdgeKey)?.push({
      neighbor: edge.source,
      step: {
        relationshipId: edge.relationshipId,
        from: edge.target,
        to: edge.source,
        direction: "inverse",
      },
    });
  }

  const visited = new Set<EntityKey>([rootKey]);
  const queue: { entity: EntityRef; path: ContextPathStep[] }[] = [
    { entity: model.root, path: [] },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }

    const currentKey = entityKey(current.entity);
    const traversals = [...(adjacency.get(currentKey) ?? [])].sort((left, right) =>
      left.step.relationshipId.localeCompare(right.step.relationshipId),
    );

    for (const traversal of traversals) {
      const neighborKey = entityKey(traversal.neighbor);
      if (visited.has(neighborKey)) {
        continue;
      }

      const nextPath = [...current.path, traversal.step];
      if (neighborKey === targetKey) {
        return nextPath;
      }

      visited.add(neighborKey);
      queue.push({ entity: traversal.neighbor, path: nextPath });
    }
  }

  return null;
}

function addRelationship(
  nodes: Map<EntityKey, EntityRef>,
  edges: Map<string, ContextGraphEdge>,
  relationship: RelationshipRecordDto,
): void {
  const source: EntityRef = {
    domain: relationship.from.domain,
    id: relationship.from.id,
  };
  const target: EntityRef = {
    domain: relationship.to.domain,
    id: relationship.to.id,
  };

  nodes.set(entityKey(source), source);
  nodes.set(entityKey(target), target);
  edges.set(relationship.relationship_id, {
    relationshipId: relationship.relationship_id,
    relationshipType: relationship.relationship_type,
    source,
    target,
  });
}

function shortestUndirectedDepths(
  rootKey: EntityKey,
  nodes: ReadonlyMap<EntityKey, EntityRef>,
  edges: ReadonlyMap<string, ContextGraphEdge>,
): Map<EntityKey, number> {
  const adjacency = new Map<EntityKey, Set<EntityKey>>();

  for (const key of nodes.keys()) {
    adjacency.set(key, new Set());
  }

  for (const edge of edges.values()) {
    const sourceKey = entityKey(edge.source);
    const targetKey = entityKey(edge.target);
    adjacency.get(sourceKey)?.add(targetKey);
    adjacency.get(targetKey)?.add(sourceKey);
  }

  const depths = new Map<EntityKey, number>([[rootKey, 0]]);
  const queue: EntityKey[] = [rootKey];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) {
      break;
    }
    const depth = depths.get(current) ?? 0;

    for (const neighbor of adjacency.get(current) ?? []) {
      if (depths.has(neighbor)) {
        continue;
      }
      depths.set(neighbor, depth + 1);
      queue.push(neighbor);
    }
  }

  return depths;
}
