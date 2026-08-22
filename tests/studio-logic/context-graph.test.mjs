import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { entityKey } = require("../../.test-dist/mission/entityRef.js");
const {
  buildContextGraphModel,
  expandContextEntity,
  initialContextExpansion,
} = require("../../.test-dist/graph/contextGraphModel.js");

function relationship(id, type, from, to) {
  return {
    relationship_id: id,
    relationship_type: type,
    from,
    to,
    derived_from: { model_field: "test" },
  };
}

function sessionFixture() {
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

  const records = new Map([
    [entityKey(root), { domain: root.domain, id: root.id }],
    [entityKey(command), { domain: command.domain, id: command.id }],
    [entityKey(event), { domain: event.domain, id: event.id }],
  ]);

  return {
    root,
    command,
    event,
    session: {
      readModel: {
        entityRecordsByKey: records,
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
    },
    rootToCommand,
  };
}

test("Context Path visibility does not implicitly expand the selected node", () => {
  const { root, command, event, session, rootToCommand } = sessionFixture();
  const path = [{
    relationshipId: rootToCommand.relationship_id,
    from: root,
    to: command,
    direction: "forward",
  }];

  const initial = buildContextGraphModel(
    session,
    root,
    initialContextExpansion(root),
    path,
  );

  const initialKeys = new Set(initial.nodes.map((node) => node.key));
  assert.equal(initialKeys.has(entityKey(root)), true);
  assert.equal(initialKeys.has(entityKey(command)), true);
  assert.equal(initialKeys.has(entityKey(event)), false);

  const expanded = buildContextGraphModel(
    session,
    root,
    expandContextEntity(initialContextExpansion(root), command),
    path,
  );

  const expandedKeys = new Set(expanded.nodes.map((node) => node.key));
  assert.equal(expandedKeys.has(entityKey(event)), true);
});
