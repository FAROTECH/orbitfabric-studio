import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { entityKey } = require("../../.test-dist/mission/entityRef.js");
const {
  buildContextGraphModel,
  initialContextExpansion,
} = require("../../.test-dist/graph/contextGraphModel.js");
const {
  buildContextMapEvidence,
} = require("../../.test-dist/graph/contextMapEvidence.js");

function relationship(id, type, from, to) {
  return {
    relationship_id: id,
    relationship_type: type,
    from,
    to,
    derived_from: { model_field: "test" },
  };
}

function entityRecord(ref, entityType) {
  return {
    id: ref.id,
    domain: ref.domain,
    entity_type: entityType,
    display_name: ref.id,
    source_file: "test.yaml",
    provenance: "test",
    required_domain: false,
    present: true,
  };
}

function fixture() {
  const root = { domain: "payloads", id: "hyperspectral_payload" };
  const command = { domain: "commands", id: "payload.compress_image_data" };
  const event = { domain: "events", id: "payload.image_compressed" };
  const rootToCommand = relationship(
    "r-root-command",
    "payload_accepts_command",
    root,
    command,
  );
  const commandToEvent = relationship(
    "r-command-event",
    "command_emits_event",
    command,
    event,
  );
  const records = [
    entityRecord(root, "payload"),
    entityRecord(command, "command"),
    entityRecord(event, "event"),
  ];

  const session = {
    sessionId: "test-session",
    generation: 1,
    source: {
      selectedPath: "test",
      missionDir: "test/mission",
    },
    core: {
      executable: "orbitfabric",
      orbitfabricVersion: "1.1.0",
      versionText: "orbitfabric 1.1.0",
    },
    snapshot: {
      kind: "orbitfabric.mission_snapshot",
      snapshot_version: "1",
      orbitfabric_version: "1.1.0",
      result: "loaded",
      mission: {
        id: "test-mission",
        name: "Test Mission",
        model_version: "test",
      },
      source: { mission_dir: "test/mission" },
      boundaries: {},
      diagnostics: [],
      model: null,
    },
    entityIndex: {
      kind: "orbitfabric.entity_index",
      index_version: "1",
      orbitfabric_version: "1.1.0",
      mission: {
        id: "test-mission",
        name: "Test Mission",
        model_version: "test",
      },
      entities: records,
    },
    relationships: {
      kind: "orbitfabric.relationship_manifest",
      manifest_version: "1",
      orbitfabric_version: "1.1.0",
      mission: {
        id: "test-mission",
        name: "Test Mission",
        model_version: "test",
      },
      relationships: [rootToCommand, commandToEvent],
    },
    lint: null,
    readiness: {
      entities: "ready",
      relationships: "ready",
      lint: "pending",
    },
    failures: [],
    readModel: {
      entityRecordsByKey: new Map(records.map((record) => [
        entityKey({ domain: record.domain, id: record.id }),
        record,
      ])),
      entityRefsByDomain: new Map(),
      relationshipsById: new Map([
        [rootToCommand.relationship_id, rootToCommand],
        [commandToEvent.relationship_id, commandToEvent],
      ]),
      outgoingByEntity: new Map([
        [entityKey(root), [rootToCommand]],
        [entityKey(command), [commandToEvent]],
      ]),
      incomingByEntity: new Map([
        [entityKey(command), [rootToCommand]],
        [entityKey(event), [commandToEvent]],
      ]),
    },
    openedAt: 0,
    lastSuccessfulRefreshAt: null,
  };

  return { root, command, event, rootToCommand, commandToEvent, session };
}

function renderedNodes(model, expanded, root, current) {
  const visibleKeys = new Set(model.nodes.map((node) => node.key));
  return model.nodes.map((node, index) => ({
    entity: node.entity,
    entityType: node.entity.domain === "payloads" ? "payload" : "command",
    displayName: node.entity.id,
    root: node.key === entityKey(root),
    current: node.key === entityKey(current),
    expanded: expanded.has(node.key),
    expandable:
      node.key === entityKey(current) && !visibleKeys.has(entityKey({
        domain: "events",
        id: "payload.image_compressed",
      })),
    position: { x: index * 100, y: 0 },
  }));
}

test("Context Map evidence independently reconstructs the expected Core neighborhood", () => {
  const { root, command, rootToCommand, session } = fixture();
  const expanded = initialContextExpansion(root);
  const path = [{
    relationshipId: rootToCommand.relationship_id,
    from: root,
    to: command,
    direction: "forward",
  }];
  const model = buildContextGraphModel(session, root, expanded, path);
  const nodes = renderedNodes(model, expanded, root, command);
  const edges = model.edges.map((edge) => ({
    relationshipId: edge.relationshipId,
    relationshipType: edge.relationshipType,
    source: edge.source,
    target: edge.target,
    label: edge.relationshipType,
    inContextPath: true,
    adjacentToCurrent: true,
  }));

  const evidence = buildContextMapEvidence({
    session,
    root,
    current: command,
    expanded,
    contextPath: path,
    model,
    renderedNodes: nodes,
    renderedEdges: edges,
  });

  assert.deepEqual(evidence.expected_from_core.relationship_ids, ["r-root-command"]);
  assert.deepEqual(
    evidence.expected_from_core.nodes.map((node) => `${node.domain}:${node.id}`),
    ["commands:payload.compress_image_data", "payloads:hyperspectral_payload"],
  );
  assert.equal(evidence.checks.all_pass, true);
});

test("Context Map evidence detects a rendered edge with reversed Core direction", () => {
  const { root, command, rootToCommand, session } = fixture();
  const expanded = initialContextExpansion(root);
  const path = [{
    relationshipId: rootToCommand.relationship_id,
    from: root,
    to: command,
    direction: "forward",
  }];
  const model = buildContextGraphModel(session, root, expanded, path);
  const nodes = renderedNodes(model, expanded, root, command);
  const reversedEdges = model.edges.map((edge) => ({
    relationshipId: edge.relationshipId,
    relationshipType: edge.relationshipType,
    source: edge.target,
    target: edge.source,
    label: edge.relationshipType,
    inContextPath: true,
    adjacentToCurrent: true,
  }));

  const evidence = buildContextMapEvidence({
    session,
    root,
    current: command,
    expanded,
    contextPath: path,
    model,
    renderedNodes: nodes,
    renderedEdges: reversedEdges,
  });

  assert.equal(evidence.checks.summary.all_rendered_relationships_match_core, false);
  assert.equal(evidence.checks.all_pass, false);
});
