import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { entityKey } = require("../../.test-dist/mission/entityRef.js");
const { buildMissionReadModel } = require("../../.test-dist/mission/MissionSession.js");
const {
  buildContextGraphModel,
  findContextPath,
  initialContextExpansion,
} = require("../../.test-dist/graph/contextGraphModel.js");
const { buildContextMapEvidence } = require("../../.test-dist/graph/contextMapEvidence.js");

const surfacesDir = process.env.ORBITFABRIC_STUDIO_CORE_SURFACES;
assert.ok(
  surfacesDir,
  "ORBITFABRIC_STUDIO_CORE_SURFACES must point at exported pinned-Core surfaces",
);

const missions = [
  "demo-3u",
  "finch-inspired-minislice",
  "oresat-inspired-minislice",
  "spacelab-inspired-communications-minislice",
];

for (const mission of missions) {
  test(`Context Map exhaustively matches pinned Core facts for ${mission}`, (t) => {
    const session = loadSession(mission);
    const relationships = session.relationships.relationships;
    const relationshipsById = new Map(
      relationships.map((relationship) => [relationship.relationship_id, relationship]),
    );
    const entities = session.entityIndex.entities;

    let rootCases = 0;
    let expandAllCases = 0;
    let directPathCases = 0;
    let individualExpansionCases = 0;
    let pinnedPathCases = 0;

    assertEntityIdentityIsDomainQualified(entities);

    for (const record of entities) {
      const root = { domain: record.domain, id: record.id };
      const rootExpanded = initialContextExpansion(root);
      const initialModel = buildContextGraphModel(session, root, rootExpanded, []);

      assertGraphMatchesCore(session, root, rootExpanded, [], initialModel, relationshipsById);
      assertEvidencePasses(session, root, root, rootExpanded, [], initialModel);
      rootCases += 1;

      const initialNodeKeys = new Set(initialModel.nodes.map((node) => node.key));
      const neighbors = initialModel.nodes.filter((node) => node.key !== entityKey(root));

      for (const neighborNode of neighbors) {
        const path = findContextPath(initialModel, neighborNode.entity);
        assert.ok(path, `No direct path from ${displayRef(root)} to ${displayRef(neighborNode.entity)}`);
        assert.equal(
          path.length,
          1,
          `Immediate Core neighbor ${displayRef(neighborNode.entity)} should be one traversal from ${displayRef(root)}`,
        );
        assertValidPath(root, neighborNode.entity, path, relationshipsById);
        directPathCases += 1;
      }

      // This is the semantic equivalent of the UI's "Expand context": every currently
      // visible node becomes explicitly expanded, revealing exactly one additional layer.
      const expandAll = new Set(initialModel.nodes.map((node) => node.key));
      const expandAllModel = buildContextGraphModel(session, root, expandAll, []);
      assertGraphMatchesCore(session, root, expandAll, [], expandAllModel, relationshipsById);
      assertEvidencePasses(session, root, root, expandAll, [], expandAllModel);
      expandAllCases += 1;

      // Exercise the '+' behavior for every visible one-hop neighbor independently.
      for (const neighborNode of neighbors) {
        const individuallyExpanded = new Set(rootExpanded);
        individuallyExpanded.add(neighborNode.key);
        const expandedModel = buildContextGraphModel(
          session,
          root,
          individuallyExpanded,
          [],
        );

        assertGraphMatchesCore(
          session,
          root,
          individuallyExpanded,
          [],
          expandedModel,
          relationshipsById,
        );
        assertEvidencePasses(
          session,
          root,
          root,
          individuallyExpanded,
          [],
          expandedModel,
        );
        individualExpansionCases += 1;

        // Every node newly revealed by that expansion must be reachable through Core-owned
        // edges. Pin the discovered path back onto the root-only expansion and verify that
        // path visibility does not accidentally expand intermediate neighborhoods.
        for (const targetNode of expandedModel.nodes) {
          if (initialNodeKeys.has(targetNode.key)) {
            continue;
          }

          const path = findContextPath(expandedModel, targetNode.entity);
          assert.ok(
            path,
            `No Core path from ${displayRef(root)} to newly revealed ${displayRef(targetNode.entity)}`,
          );
          assert.ok(
            path.length >= 2,
            `${displayRef(targetNode.entity)} was new after second-level expansion but resolved to a one-hop path`,
          );
          assertValidPath(root, targetNode.entity, path, relationshipsById);

          const pinnedModel = buildContextGraphModel(
            session,
            root,
            rootExpanded,
            path,
          );
          assertGraphMatchesCore(
            session,
            root,
            rootExpanded,
            path,
            pinnedModel,
            relationshipsById,
          );
          assertEvidencePasses(
            session,
            root,
            targetNode.entity,
            rootExpanded,
            path,
            pinnedModel,
          );
          pinnedPathCases += 1;
        }
      }
    }

    if (mission === "finch-inspired-minislice") {
      const duplicate = entities.filter((entity) => entity.id === "hyperspectral_payload");
      const domains = new Set(duplicate.map((entity) => entity.domain));
      assert.ok(domains.has("payloads"));
      assert.ok(domains.has("subsystems"));

      const payloadRoot = { domain: "payloads", id: "hyperspectral_payload" };
      const payloadModel = buildContextGraphModel(
        session,
        payloadRoot,
        initialContextExpansion(payloadRoot),
        [],
      );
      const payloadKeys = new Set(payloadModel.nodes.map((node) => node.key));
      assert.ok(payloadKeys.has(entityKey(payloadRoot)));
      assert.ok(
        payloadKeys.has(entityKey({ domain: "subsystems", id: "hyperspectral_payload" })),
        "Domain-qualified FINCH payload/subsystem identity collapsed in Context Map",
      );
    }

    t.diagnostic(
      [
        `${entities.length} roots`,
        `${directPathCases} direct traversals`,
        `${individualExpansionCases} individual expansions`,
        `${expandAllCases} expand-context cases`,
        `${pinnedPathCases} second-level pinned paths`,
      ].join(" · "),
    );
  });
}

function loadSession(mission) {
  const root = join(surfacesDir, mission);
  const snapshot = readJson(join(root, "mission_snapshot.json"));
  const entityIndex = readJson(join(root, "entity_index.json"));
  const relationships = readJson(join(root, "relationship_manifest.json"));

  assert.equal(snapshot.kind, "orbitfabric.mission_snapshot");
  assert.equal(entityIndex.kind, "orbitfabric.entity_index");
  assert.equal(relationships.kind, "orbitfabric.relationship_manifest");

  return {
    sessionId: `core-regression:${mission}`,
    generation: 1,
    source: { missionDir: `pinned-core:${mission}` },
    core: {
      executable: "orbitfabric",
      orbitfabricVersion: snapshot.orbitfabric_version ?? null,
      versionText: snapshot.orbitfabric_version ?? "pinned-core",
    },
    snapshot,
    entityIndex,
    relationships,
    lint: null,
    readiness: { entities: "ready", relationships: "ready", lint: "pending" },
    failures: [],
    readModel: buildMissionReadModel(entityIndex, relationships),
    openedAt: 0,
    lastSuccessfulRefreshAt: null,
  };
}

function assertEntityIdentityIsDomainQualified(entities) {
  const qualified = entities.map((record) =>
    entityKey({ domain: record.domain, id: record.id }),
  );
  assert.equal(
    new Set(qualified).size,
    entities.length,
    "Entity Index contains duplicate {domain,id} identities",
  );

  const byTextId = new Map();
  for (const record of entities) {
    const domains = byTextId.get(record.id) ?? new Set();
    domains.add(record.domain);
    byTextId.set(record.id, domains);
  }

  for (const [id, domains] of byTextId) {
    if (domains.size < 2) {
      continue;
    }
    const keys = [...domains].map((domain) => entityKey({ domain, id }));
    assert.equal(
      new Set(keys).size,
      domains.size,
      `Textual id ${id} collapsed across domains`,
    );
  }
}

function assertGraphMatchesCore(
  session,
  root,
  expanded,
  contextPath,
  model,
  relationshipsById,
) {
  const expected = expectedFromCore(session, root, expanded, contextPath);
  const modelNodeKeys = model.nodes.map((node) => node.key);
  const modelRelationshipIds = model.edges.map((edge) => edge.relationshipId);

  assert.deepEqual(
    [...new Set(modelNodeKeys)].sort(),
    [...expected.nodeKeys].sort(),
    `Context nodes differ from Core expectation for root ${displayRef(root)}`,
  );
  assert.equal(
    new Set(modelNodeKeys).size,
    model.nodes.length,
    `Duplicate Context Map node identity for root ${displayRef(root)}`,
  );
  assert.deepEqual(
    [...new Set(modelRelationshipIds)].sort(),
    [...expected.relationshipIds].sort(),
    `Context relationships differ from Core expectation for root ${displayRef(root)}`,
  );
  assert.equal(
    new Set(modelRelationshipIds).size,
    model.edges.length,
    `Duplicate Context Map relationship id for root ${displayRef(root)}`,
  );

  for (const edge of model.edges) {
    const relationship = relationshipsById.get(edge.relationshipId);
    assert.ok(relationship, `Rendered model edge ${edge.relationshipId} does not exist in Core`);
    assert.equal(edge.relationshipType, relationship.relationship_type);
    assert.deepEqual(edge.source, relationship.from);
    assert.deepEqual(edge.target, relationship.to);
  }

  for (const node of model.nodes) {
    assert.ok(
      session.readModel.entityRecordsByKey.has(node.key),
      `Context node ${displayRef(node.entity)} does not exist in the Core Entity Index`,
    );
  }
}

function expectedFromCore(session, root, expanded, contextPath) {
  const relationshipIds = new Set();
  const relationshipsById = session.readModel.relationshipsById;

  for (const relationship of session.relationships.relationships) {
    if (
      expanded.has(entityKey(relationship.from)) ||
      expanded.has(entityKey(relationship.to))
    ) {
      relationshipIds.add(relationship.relationship_id);
    }
  }

  for (const step of contextPath) {
    assert.ok(
      relationshipsById.has(step.relationshipId),
      `Context Path references non-Core relationship ${step.relationshipId}`,
    );
    relationshipIds.add(step.relationshipId);
  }

  const nodeKeys = new Set([entityKey(root), ...expanded]);
  for (const relationshipId of relationshipIds) {
    const relationship = relationshipsById.get(relationshipId);
    assert.ok(relationship);
    nodeKeys.add(entityKey(relationship.from));
    nodeKeys.add(entityKey(relationship.to));
  }

  return { nodeKeys, relationshipIds };
}

function assertValidPath(root, target, path, relationshipsById) {
  let cursor = root;

  for (const step of path) {
    assert.deepEqual(step.from, cursor, "Context Path is not contiguous");
    const relationship = relationshipsById.get(step.relationshipId);
    assert.ok(relationship, `Context Path relationship ${step.relationshipId} is not Core-owned`);

    if (step.direction === "forward") {
      assert.deepEqual(step.from, relationship.from);
      assert.deepEqual(step.to, relationship.to);
    } else {
      assert.equal(step.direction, "inverse");
      assert.deepEqual(step.from, relationship.to);
      assert.deepEqual(step.to, relationship.from);
    }

    cursor = step.to;
  }

  assert.deepEqual(cursor, target, `Context Path does not terminate at ${displayRef(target)}`);
}

function assertEvidencePasses(session, root, current, expanded, contextPath, model) {
  const rendered = renderedEvidenceFromModel(
    session,
    root,
    current,
    expanded,
    contextPath,
    model,
  );
  const evidence = buildContextMapEvidence({
    session,
    root,
    current,
    expanded,
    contextPath,
    model,
    renderedNodes: rendered.nodes,
    renderedEdges: rendered.edges,
  });

  assert.equal(
    evidence.checks.all_pass,
    true,
    `Context Map evidence failed for ${displayRef(root)} -> ${displayRef(current)}: ${JSON.stringify(evidence.checks.differences)}`,
  );
}

function renderedEvidenceFromModel(session, root, current, expanded, contextPath, model) {
  const visibleKeys = new Set(model.nodes.map((node) => node.key));
  const pathIds = new Set(contextPath.map((step) => step.relationshipId));
  const currentKey = entityKey(current);
  const rootKey = entityKey(root);

  const nodes = model.nodes.map((node, index) => {
    const record = session.readModel.entityRecordsByKey.get(node.key);
    return {
      entity: node.entity,
      entityType: record?.entity_type ?? node.entity.domain,
      displayName: record?.display_name ?? node.entity.id,
      root: node.key === rootKey,
      current: node.key === currentKey,
      expanded: expanded.has(node.key),
      expandable: hasHiddenCoreNeighbor(session.relationships.relationships, node.entity, visibleKeys),
      position: { x: node.depth, y: index },
    };
  });

  const edges = model.edges.map((edge) => ({
    relationshipId: edge.relationshipId,
    relationshipType: edge.relationshipType,
    source: edge.source,
    target: edge.target,
    label: edge.relationshipType,
    inContextPath: pathIds.has(edge.relationshipId),
    adjacentToCurrent:
      entityKey(edge.source) === currentKey || entityKey(edge.target) === currentKey,
  }));

  return { nodes, edges };
}

function hasHiddenCoreNeighbor(relationships, entity, visibleKeys) {
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

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function displayRef(ref) {
  return `${ref.domain}:${ref.id}`;
}
