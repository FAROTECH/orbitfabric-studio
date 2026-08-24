import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { entityKey } = require("../../.test-dist/mission/entityRef.js");
const {
  CONTEXT_NODE_HEIGHT,
  CONTEXT_NODE_WIDTH,
  layoutContextGraph,
} = require("../../.test-dist/graph/contextGraphLayout.js");
const {
  OPERATION_MODE_NODE_HEIGHT,
  OPERATION_MODE_NODE_WIDTH,
  layoutOperationalStateMap,
} = require("../../.test-dist/features/operations/operationalStateLayout.js");

const oreSatModes = [
  "SAFE",
  "STANDBY",
  "NOMINAL",
  "PAYLOAD_ACQUISITION",
  "DOWNLINK",
  "LOW_POWER",
  "FAULT_RECOVERY",
];

const oreSatTransitions = [
  ["STANDBY", "NOMINAL", "ground_authorized_nominal"],
  ["NOMINAL", "PAYLOAD_ACQUISITION", "cfc_capture_scheduled"],
  ["PAYLOAD_ACQUISITION", "NOMINAL", "cfc_data_generated"],
  ["NOMINAL", "LOW_POWER", "eps_low_power_warning"],
  ["PAYLOAD_ACQUISITION", "LOW_POWER", "eps_low_power_warning"],
  ["LOW_POWER", "DOWNLINK", "contact_window_started"],
  ["NOMINAL", "DOWNLINK", "contact_window_started"],
  ["DOWNLINK", "LOW_POWER", "contact_window_ended"],
  ["LOW_POWER", "SAFE", "eps_low_battery_critical"],
  ["SAFE", "FAULT_RECOVERY", "ground_clear_fault"],
  ["FAULT_RECOVERY", "STANDBY", "recovery_completed"],
];

test("Operational State Map uses complete orthogonal ELK routes around unrelated nodes", async () => {
  const model = {
    modes: oreSatModes.map((id) => ({
      ref: { domain: "modes", id },
      description: null,
      initial: id === "NOMINAL",
    })),
    transitions: oreSatTransitions.map(([from, to, reason], index) => ({
      key: `${index}:${from}:${to}:${reason}`,
      from,
      to,
      reason,
      description: null,
    })),
    commands: [],
    commandabilityRules: [],
    autonomousActions: [],
    faultRecoveries: [],
    recoveryIntents: [],
  };

  const layout = await layoutOperationalStateMap(model);
  assert.equal(layout.positions.size, oreSatModes.length);
  assert.equal(layout.routes.size, oreSatTransitions.length);

  assertRoutedGraph({
    positions: layout.positions,
    routes: layout.routes,
    edges: model.transitions.map((transition) => ({
      id: transition.key,
      source: transition.from,
      target: transition.to,
    })),
    width: OPERATION_MODE_NODE_WIDTH,
    height: OPERATION_MODE_NODE_HEIGHT,
  });
});

test("Context Map uses complete orthogonal ELK routes around unrelated nodes", async () => {
  const refs = ["command", "mode", "fault", "recovery"].map((id) => ({
    domain: id === "mode" ? "modes" : `${id}s`,
    id,
  }));
  const [command, mode, fault, recovery] = refs;
  const relationships = [
    [command, mode, "commandability_rule_constrains_command"],
    [fault, recovery, "fault_recovery_dispatches_command"],
    [recovery, mode, "recovery_intent_targets_mode"],
    [mode, fault, "fault_sourced_from_subsystem"],
  ];
  const model = {
    root: command,
    nodes: refs.map((entity, depth) => ({ entity, key: entityKey(entity), depth })),
    edges: relationships.map(([source, target, relationshipType], index) => ({
      relationshipId: `relationship-${index}`,
      relationshipType,
      source,
      target,
    })),
  };

  const layout = await layoutContextGraph(model);
  assert.equal(layout.positions.size, refs.length);
  assert.equal(layout.routes.size, relationships.length);

  assertRoutedGraph({
    positions: layout.positions,
    routes: layout.routes,
    edges: model.edges.map((edge) => ({
      id: edge.relationshipId,
      source: entityKey(edge.source),
      target: entityKey(edge.target),
    })),
    width: CONTEXT_NODE_WIDTH,
    height: CONTEXT_NODE_HEIGHT,
  });
});

function assertRoutedGraph({ positions, routes, edges, width, height }) {
  for (const edge of edges) {
    const route = routes.get(edge.id);
    assert.ok(route, `missing route ${edge.id}`);
    assert.ok(route.points.length >= 2, `route ${edge.id} has fewer than two points`);

    for (let index = 1; index < route.points.length; index += 1) {
      const start = route.points[index - 1];
      const end = route.points[index];
      assert.ok(
        start.x === end.x || start.y === end.y,
        `route ${edge.id} contains a non-orthogonal segment`,
      );

      for (const [nodeId, position] of positions) {
        if (nodeId === edge.source || nodeId === edge.target) {
          continue;
        }
        assert.equal(
          segmentIntersectsInterior(start, end, position, width, height),
          false,
          `route ${edge.id} crosses unrelated node ${nodeId}`,
        );
      }
    }
  }
}

function segmentIntersectsInterior(start, end, position, width, height) {
  const left = position.x + 1;
  const right = position.x + width - 1;
  const top = position.y + 1;
  const bottom = position.y + height - 1;
  if (start.x === end.x) {
    return start.x > left && start.x < right && rangesOverlap(start.y, end.y, top, bottom);
  }
  return start.y > top && start.y < bottom && rangesOverlap(start.x, end.x, left, right);
}

function rangesOverlap(firstStart, firstEnd, secondStart, secondEnd) {
  const firstMin = Math.min(firstStart, firstEnd);
  const firstMax = Math.max(firstStart, firstEnd);
  return firstMax > secondStart && firstMin < secondEnd;
}
