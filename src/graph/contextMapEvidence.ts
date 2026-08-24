import type {
  EntityIndexRecordDto,
  RelationshipRecordDto,
} from "../core/contracts";
import { entityKey, type EntityKey, type EntityRef } from "../mission/entityRef";
import type { MissionSession } from "../mission/MissionSession";
import type { ContextPathStep } from "../mission/selection";
import type { ContextGraphModel } from "./contextGraphModel";

export interface RenderedContextNodeEvidence {
  entity: EntityRef;
  entityType: string;
  displayName: string;
  root: boolean;
  current: boolean;
  expanded: boolean;
  expandable: boolean;
  position: {
    x: number;
    y: number;
  };
}

export interface RenderedContextEdgeEvidence {
  relationshipId: string;
  relationshipType: string | null;
  source: EntityRef | null;
  target: EntityRef | null;
  label: string | null;
  inContextPath: boolean;
  adjacentToCurrent: boolean;
}

export interface ContextMapEvidenceInput {
  session: MissionSession;
  root: EntityRef;
  current: EntityRef;
  expanded: ReadonlySet<EntityKey>;
  contextPath: readonly ContextPathStep[];
  model: ContextGraphModel;
  renderedNodes: readonly RenderedContextNodeEvidence[];
  renderedEdges: readonly RenderedContextEdgeEvidence[];
}

/**
 * Build a deterministic evidence bundle for Context Map verification.
 *
 * The important property is that `expected_from_core` is reconstructed directly from the
 * hydrated Core Relationship Manifest and the interaction state. It does not call or reuse
 * `buildContextGraphModel`, so a defect in the Context Graph builder can be exposed by the
 * expected-vs-model comparison.
 */
export function buildContextMapEvidence(input: ContextMapEvidenceInput) {
  const {
    session,
    root,
    current,
    expanded,
    contextPath,
    model,
    renderedNodes,
    renderedEdges,
  } = input;

  const coreEntities = [...(session.entityIndex?.entities ?? [])].sort(compareEntityRecords);
  const coreRelationships = [...(session.relationships?.relationships ?? [])].sort(
    compareRelationships,
  );
  const coreRelationshipsById = new Map(
    coreRelationships.map((relationship) => [relationship.relationship_id, relationship]),
  );

  const knownRefs = new Map<EntityKey, EntityRef>();
  const remember = (ref: EntityRef) => knownRefs.set(entityKey(ref), { ...ref });

  remember(root);
  remember(current);
  for (const record of coreEntities) {
    remember({ domain: record.domain, id: record.id });
  }
  for (const relationship of coreRelationships) {
    remember(relationship.from);
    remember(relationship.to);
  }
  for (const node of model.nodes) {
    remember(node.entity);
  }
  for (const step of contextPath) {
    remember(step.from);
    remember(step.to);
  }

  const expandedRefs: EntityRef[] = [];
  const unresolvedExpandedKeys: string[] = [];
  for (const key of [...expanded].sort()) {
    const ref = knownRefs.get(key);
    if (ref) {
      expandedRefs.push(ref);
    } else {
      unresolvedExpandedKeys.push(readableKey(key));
    }
  }
  expandedRefs.sort(compareRefs);

  // Independent Core-derived expectation: every explicitly expanded entity contributes all
  // immediate incoming/outgoing Core relationships. Context Path contributes only its exact
  // Core-owned relationships and does not expand a path node's neighborhood.
  const expectedRelationshipIds = new Set<string>();
  for (const relationship of coreRelationships) {
    if (
      expanded.has(entityKey(relationship.from)) ||
      expanded.has(entityKey(relationship.to))
    ) {
      expectedRelationshipIds.add(relationship.relationship_id);
    }
  }
  for (const step of contextPath) {
    if (coreRelationshipsById.has(step.relationshipId)) {
      expectedRelationshipIds.add(step.relationshipId);
    }
  }

  const expectedNodes = new Map<EntityKey, EntityRef>([[entityKey(root), root]]);
  for (const ref of expandedRefs) {
    expectedNodes.set(entityKey(ref), ref);
  }
  for (const relationshipId of expectedRelationshipIds) {
    const relationship = coreRelationshipsById.get(relationshipId);
    if (!relationship) {
      continue;
    }
    expectedNodes.set(entityKey(relationship.from), relationship.from);
    expectedNodes.set(entityKey(relationship.to), relationship.to);
  }

  const expectedNodeKeys = new Set(expectedNodes.keys());
  const modelNodeKeys = new Set(model.nodes.map((node) => node.key));
  const modelRelationshipIds = new Set(model.edges.map((edge) => edge.relationshipId));
  const renderedNodeKeys = new Set(renderedNodes.map((node) => entityKey(node.entity)));
  const renderedRelationshipIds = new Set(renderedEdges.map((edge) => edge.relationshipId));
  const coreEntityKeys = new Set(
    coreEntities.map((record) => entityKey({ domain: record.domain, id: record.id })),
  );
  const contextPathRelationshipIds = new Set(
    contextPath.map((step) => step.relationshipId),
  );
  const currentKey = entityKey(current);
  const rootKey = entityKey(root);

  const expectedVsModel = {
    missing_nodes: setDifference(expectedNodeKeys, modelNodeKeys).map((key) =>
      displayKey(key, knownRefs),
    ),
    extra_nodes: setDifference(modelNodeKeys, expectedNodeKeys).map((key) =>
      displayKey(key, knownRefs),
    ),
    missing_relationships: setDifference(expectedRelationshipIds, modelRelationshipIds),
    extra_relationships: setDifference(modelRelationshipIds, expectedRelationshipIds),
  };

  const modelVsRendered = {
    missing_nodes: setDifference(modelNodeKeys, renderedNodeKeys).map((key) =>
      displayKey(key, knownRefs),
    ),
    extra_nodes: setDifference(renderedNodeKeys, modelNodeKeys).map((key) =>
      displayKey(key, knownRefs),
    ),
    missing_relationships: setDifference(modelRelationshipIds, renderedRelationshipIds),
    extra_relationships: setDifference(renderedRelationshipIds, modelRelationshipIds),
  };

  const visibleForExpandability = modelNodeKeys;
  const summary = {
    core_entity_index_available: session.entityIndex !== null,
    core_relationship_manifest_available: session.relationships !== null,
    no_unresolved_expanded_entities: unresolvedExpandedKeys.length === 0,
    context_path_relationships_exist_in_core: contextPath.every((step) =>
      coreRelationshipsById.has(step.relationshipId),
    ),
    expected_node_set_matches_context_model:
      expectedVsModel.missing_nodes.length === 0 && expectedVsModel.extra_nodes.length === 0,
    expected_relationship_set_matches_context_model:
      expectedVsModel.missing_relationships.length === 0 &&
      expectedVsModel.extra_relationships.length === 0,
    context_model_node_set_matches_rendered:
      modelVsRendered.missing_nodes.length === 0 && modelVsRendered.extra_nodes.length === 0,
    context_model_relationship_set_matches_rendered:
      modelVsRendered.missing_relationships.length === 0 &&
      modelVsRendered.extra_relationships.length === 0,
    all_context_model_nodes_exist_in_core_entity_index: model.nodes.every((node) =>
      coreEntityKeys.has(node.key),
    ),
    all_rendered_nodes_exist_in_core_entity_index: renderedNodes.every((node) =>
      coreEntityKeys.has(entityKey(node.entity)),
    ),
    all_context_model_relationships_match_core: model.edges.every((edge) => {
      const relationship = coreRelationshipsById.get(edge.relationshipId);
      return relationship !== undefined && modelEdgeMatchesCore(edge, relationship);
    }),
    all_rendered_relationships_match_core: renderedEdges.every((edge) => {
      const relationship = coreRelationshipsById.get(edge.relationshipId);
      return relationship !== undefined && renderedEdgeMatchesCore(edge, relationship);
    }),
    all_rendered_edge_endpoints_are_visible: renderedEdges.every(
      (edge) =>
        edge.source !== null &&
        edge.target !== null &&
        renderedNodeKeys.has(entityKey(edge.source)) &&
        renderedNodeKeys.has(entityKey(edge.target)),
    ),
    all_context_path_relationships_are_visible: contextPath.every((step) =>
      modelRelationshipIds.has(step.relationshipId),
    ),
    rendered_context_path_flags_match_interaction: renderedEdges.every(
      (edge) => edge.inContextPath === contextPathRelationshipIds.has(edge.relationshipId),
    ),
    rendered_current_adjacency_flags_match_interaction: renderedEdges.every((edge) => {
      const expectedAdjacent =
        edge.source !== null &&
        edge.target !== null &&
        (entityKey(edge.source) === currentKey || entityKey(edge.target) === currentKey);
      return edge.adjacentToCurrent === expectedAdjacent;
    }),
    rendered_root_current_flags_match_interaction: renderedNodes.every((node) => {
      const key = entityKey(node.entity);
      return node.root === (key === rootKey) && node.current === (key === currentKey);
    }),
    rendered_expanded_flags_match_interaction: renderedNodes.every(
      (node) => node.expanded === expanded.has(entityKey(node.entity)),
    ),
    rendered_expandability_flags_match_core: renderedNodes.every(
      (node) =>
        node.expandable ===
        hasHiddenCoreNeighbor(coreRelationships, node.entity, visibleForExpandability),
    ),
    root_is_visible: modelNodeKeys.has(rootKey) && renderedNodeKeys.has(rootKey),
    current_is_visible: modelNodeKeys.has(currentKey) && renderedNodeKeys.has(currentKey),
  };

  const allPass = Object.values(summary).every(Boolean);

  return {
    kind: "orbitfabric.studio.context_map_evidence",
    evidence_version: "1",
    mission: {
      id: session.snapshot.mission?.id ?? null,
      name: session.snapshot.mission?.name ?? null,
      model_version: session.snapshot.mission?.model_version ?? null,
      orbitfabric_version:
        session.core.orbitfabricVersion ?? session.snapshot.orbitfabric_version ?? null,
      entity_index_version: session.entityIndex?.index_version ?? null,
      relationship_manifest_version: session.relationships?.manifest_version ?? null,
      mission_dir: session.source.missionDir,
      generation: session.generation,
    },
    interaction: {
      root,
      current,
      expanded: expandedRefs,
      unresolved_expanded_keys: unresolvedExpandedKeys,
      context_path: contextPath.map((step) => ({ ...step })),
    },
    core: {
      entities: coreEntities,
      relationships: coreRelationships,
    },
    expected_from_core: {
      nodes: [...expectedNodes.values()].sort(compareRefs),
      relationship_ids: [...expectedRelationshipIds].sort(),
    },
    context_model: {
      nodes: model.nodes.map((node) => ({
        entity: node.entity,
        depth: node.depth,
      })),
      edges: model.edges.map((edge) => ({
        relationship_id: edge.relationshipId,
        relationship_type: edge.relationshipType,
        from: edge.source,
        to: edge.target,
      })),
    },
    rendered: {
      nodes: [...renderedNodes].sort((left, right) =>
        compareRefs(left.entity, right.entity),
      ),
      edges: [...renderedEdges].sort((left, right) =>
        left.relationshipId.localeCompare(right.relationshipId),
      ),
    },
    checks: {
      all_pass: allPass,
      summary,
      differences: {
        expected_vs_context_model: expectedVsModel,
        context_model_vs_rendered: modelVsRendered,
      },
    },
  };
}

function modelEdgeMatchesCore(
  edge: ContextGraphModel["edges"][number],
  relationship: RelationshipRecordDto,
): boolean {
  return (
    edge.relationshipType === relationship.relationship_type &&
    sameRef(edge.source, relationship.from) &&
    sameRef(edge.target, relationship.to)
  );
}

function renderedEdgeMatchesCore(
  edge: RenderedContextEdgeEvidence,
  relationship: RelationshipRecordDto,
): boolean {
  return (
    edge.relationshipType === relationship.relationship_type &&
    edge.source !== null &&
    edge.target !== null &&
    sameRef(edge.source, relationship.from) &&
    sameRef(edge.target, relationship.to)
  );
}

function hasHiddenCoreNeighbor(
  relationships: readonly RelationshipRecordDto[],
  entity: EntityRef,
  visibleKeys: ReadonlySet<EntityKey>,
): boolean {
  const key = entityKey(entity);
  for (const relationship of relationships) {
    const fromKey = entityKey(relationship.from);
    const toKey = entityKey(relationship.to);
    if (fromKey === key && !visibleKeys.has(toKey)) {
      return true;
    }
    if (toKey === key && !visibleKeys.has(fromKey)) {
      return true;
    }
  }
  return false;
}

function sameRef(left: EntityRef, right: EntityRef): boolean {
  return left.domain === right.domain && left.id === right.id;
}

function compareRefs(left: EntityRef, right: EntityRef): number {
  return entityKey(left).localeCompare(entityKey(right));
}

function compareEntityRecords(
  left: EntityIndexRecordDto,
  right: EntityIndexRecordDto,
): number {
  return compareRefs(
    { domain: left.domain, id: left.id },
    { domain: right.domain, id: right.id },
  );
}

function compareRelationships(
  left: RelationshipRecordDto,
  right: RelationshipRecordDto,
): number {
  return left.relationship_id.localeCompare(right.relationship_id);
}

function setDifference<T>(left: ReadonlySet<T>, right: ReadonlySet<T>): T[] {
  return [...left].filter((value) => !right.has(value)).sort();
}

function displayKey(key: EntityKey, knownRefs: ReadonlyMap<EntityKey, EntityRef>): string {
  const ref = knownRefs.get(key);
  return ref ? `${ref.domain}:${ref.id}` : readableKey(key);
}

function readableKey(key: EntityKey): string {
  const separator = key.indexOf("\u0000");
  if (separator < 0) {
    return key;
  }
  return `${key.slice(0, separator)}:${key.slice(separator + 1)}`;
}
