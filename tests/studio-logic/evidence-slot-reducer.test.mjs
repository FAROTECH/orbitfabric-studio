import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { studioReducer } = require("../../.test-dist/app/studioState.js");
const { emptyMissionReadModel } = require("../../.test-dist/mission/MissionSession.js");

const OLD_SCENARIO_SHA = "1".repeat(64);
const OLD_RESULT_SHA = "2".repeat(64);
const NEW_RESULT_SHA = "3".repeat(64);

function membership() {
  return { sessionId: "session-1", generation: 1 };
}

function session() {
  return {
    sessionId: "session-1",
    generation: 1,
    source: { selectedPath: "/tmp", missionDir: "/tmp/mission" },
    core: { executable: "orbitfabric", orbitfabricVersion: "1.3.0", versionText: "1.3.0" },
    snapshot: {
      kind: "orbitfabric.mission_snapshot",
      snapshot_version: "0.1-candidate",
      orbitfabric_version: "1.3.0",
      result: "loaded",
      mission: { id: "mission-1", name: "Mission 1", model_version: "1" },
      source: { mission_dir: "/tmp/mission" },
      boundaries: {},
      diagnostics: [],
      model: {
        spacecraft: { id: "spacecraft-1" },
        subsystems: [], modes: {}, mode_transitions: [], telemetry: [], commands: [], events: [], faults: [], packets: [], policies: {}, payloads: [], data_products: [], contacts: {}, commandability: {},
      },
    },
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

function scenarioSlot() {
  return {
    accepted: {
      membership: membership(),
      targetPath: "/tmp/scenario-a.json",
      declaration: {
        kind: "orbitfabric.scenario_declaration",
        declarationVersion: "0.1-candidate",
        orbitfabricVersion: "1.3.0",
        result: "loaded",
        scenario: { id: "scenario-1", name: "Scenario", description: null },
        mission: { id: "mission-1", modelVersion: "1" },
        source: { scenarioSha256: OLD_SCENARIO_SHA },
        boundaries: {},
        atomCount: 0,
        atoms: [],
        diagnostics: [],
      },
    },
    pending: null,
    hydrationFailure: null,
  };
}

function integrationObservation(sha) {
  return {
    membership: membership(),
    context: { integrationId: "int", adapterId: "adapter", adapterVersion: "1", operationId: "project" },
    resultPath: `/tmp/${sha}.json`,
    resultSha256: sha,
    result: { mappings: [], artifacts: [] },
    bundle: { resultPath: `/tmp/${sha}.json`, resultText: "{}", artifactChecks: [] },
  };
}

function integrationSlot() {
  return {
    contexts: new Map([
      [
        "ctx",
        { accepted: integrationObservation(OLD_RESULT_SHA), pending: null, hydrationFailure: null },
      ],
    ]),
  };
}

function evidenceSlot() {
  const manifest = {
    kind: "orbitfabric.evidence_set_manifest",
    manifestVersion: "0.1-candidate",
    evidenceSet: { id: "set" },
    curator: { id: "curator" },
    records: [
      {
        id: "record",
        content: { kind: "example", producer: { id: "producer" }, reference: { path: "a.txt", sha256: "4".repeat(64) } },
        subjects: [
          { type: "scenario_source", scenarioId: "scenario-1", scenarioSha256: OLD_SCENARIO_SHA },
          { type: "integration_result", resultSha256: OLD_RESULT_SHA },
        ],
      },
    ],
  };
  return {
    accepted: {
      membership: membership(),
      targetPath: "/tmp/evidence.json",
      manifestSha256: "5".repeat(64),
      manifest,
      records: [
        {
          record: manifest.records[0],
          subjects: manifest.records[0].subjects.map((subject) => ({ subject, state: "current", reason: "fixture" })),
        },
      ],
    },
    pending: null,
    hydrationFailure: null,
  };
}

function baseState() {
  return {
    activeSession: session(),
    opening: null,
    openFailure: null,
    scenario: scenarioSlot(),
    integration: integrationSlot(),
    evidence: evidenceSlot(),
    selection: { subject: null, origin: null, contextPath: [] },
    operationsMode: null,
    view: "overview",
  };
}

test("Studio reducer recomputes Evidence correlations when Scenario target is replaced", () => {
  const state = baseState();
  const manifest = state.evidence.accepted.manifest;
  const next = studioReducer(state, {
    type: "SCENARIO_REQUESTED",
    request: {
      membership: membership(),
      requestToken: "scenario-replace",
      targetPath: "/tmp/scenario-b.json",
      mode: "replace",
    },
  });

  assert.equal(next.evidence.accepted.manifest, manifest);
  assert.deepEqual(next.evidence.accepted.records[0].subjects.map((subject) => subject.state), [
    "unresolved",
    "current",
  ]);
});

test("Studio reducer recomputes Evidence Result correlation after a new exact Result is accepted", () => {
  let state = baseState();
  const context = { integrationId: "int", adapterId: "adapter", adapterVersion: "1", operationId: "project" };
  const request = {
    membership: membership(),
    requestToken: "new-result",
    context,
    resultPath: "/tmp/new-result.json",
  };

  state = studioReducer(state, { type: "INTEGRATION_RESULT_REQUESTED", request });
  assert.equal(state.evidence.accepted.records[0].subjects[1].state, "current");

  state = studioReducer(state, {
    type: "INTEGRATION_RESULT_READY",
    request,
    observation: { ...integrationObservation(NEW_RESULT_SHA), context, resultPath: request.resultPath },
  });
  assert.equal(state.evidence.accepted.records[0].subjects[1].state, "unresolved");
});
