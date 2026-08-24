import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { studioReducer } = require("../../.test-dist/app/studioState.js");
const { emptyMissionReadModel } = require("../../.test-dist/mission/MissionSession.js");

function snapshotWithModes(modeIds) {
  return {
    kind: "orbitfabric.mission_snapshot",
    snapshot_version: "0.1-candidate",
    orbitfabric_version: "1.1.0",
    result: "loaded",
    mission: { id: "mission-1", name: "Mission 1", model_version: "1" },
    source: { mission_dir: "/tmp/mission" },
    boundaries: {},
    diagnostics: [],
    model: {
      spacecraft: { id: "spacecraft-1" },
      subsystems: [],
      modes: Object.fromEntries(modeIds.map((id) => [id, {}])),
      mode_transitions: [],
      telemetry: [],
      commands: [],
      events: [],
      faults: [],
      packets: [],
      policies: {},
      payloads: [],
      data_products: [],
      contacts: {},
      commandability: {},
    },
  };
}

function session(sessionId, modeIds) {
  return {
    sessionId,
    generation: 2,
    source: { selectedPath: "/tmp", missionDir: "/tmp/mission" },
    core: { executable: "orbitfabric", orbitfabricVersion: "1.1.0", versionText: "1.1.0" },
    snapshot: snapshotWithModes(modeIds),
    entityIndex: null,
    relationships: null,
    lint: null,
    readiness: { entities: "pending", relationships: "pending", lint: "pending" },
    failures: [],
    readModel: emptyMissionReadModel(),
    openedAt: 0,
    lastSuccessfulRefreshAt: null,
  };
}

test("refresh preserves a valid Context Path, then truncates it when the relationship disappears", () => {
  const modeA = { domain: "modes", id: "A" };
  const modeB = { domain: "modes", id: "B" };
  const step = {
    relationshipId: "r-a-b",
    from: modeA,
    to: modeB,
    direction: "forward",
  };

  const oldSession = session("old", ["A", "B"]);
  const refreshingSession = session("refresh", ["A", "B"]);

  const state = {
    activeSession: oldSession,
    opening: {
      requestId: "refresh",
      generation: 2,
      selectedPath: "/tmp",
      isRefresh: true,
    },
    openFailure: null,
    selection: {
      subject: modeB,
      origin: "context-map",
      contextPath: [step],
    },
    operationsMode: modeB,
    view: "relations",
  };

  const primaryCommitted = studioReducer(state, {
    type: "MISSION_PRIMARY_COMMITTED",
    session: refreshingSession,
  });

  assert.deepEqual(primaryCommitted.selection.subject, modeB);
  assert.equal(primaryCommitted.selection.contextPath.length, 1);
  assert.equal(primaryCommitted.view, "relations");
  assert.deepEqual(primaryCommitted.operationsMode, modeB);

  const relationshipsReady = studioReducer(primaryCommitted, {
    type: "MISSION_RELATIONSHIPS_READY",
    sessionId: "refresh",
    relationships: {
      kind: "orbitfabric.relationship_manifest",
      manifest_version: "0.1-candidate",
      orbitfabric_version: "1.1.0",
      mission: { id: "mission-1" },
      counts: { total_relationships: 0, relationship_types: {} },
      boundaries: {},
      relationships: [],
    },
  });

  assert.deepEqual(relationshipsReady.selection.subject, modeA);
  assert.equal(relationshipsReady.selection.contextPath.length, 0);
});

test("inspecting another entity preserves the last Operations Mode Focus", () => {
  const mode = { domain: "modes", id: "LOW_POWER" };
  const command = { domain: "commands", id: "comms.start_downlink" };
  const state = {
    activeSession: session("active", ["NOMINAL", "LOW_POWER"]),
    opening: null,
    openFailure: null,
    selection: { subject: mode, origin: "operations", contextPath: [] },
    operationsMode: mode,
    view: "operations",
  };

  const inspecting = studioReducer(state, {
    type: "SELECTION_CHANGED",
    subject: command,
    origin: "operations",
  });

  assert.deepEqual(inspecting.selection.subject, command);
  assert.deepEqual(inspecting.operationsMode, mode);
});
