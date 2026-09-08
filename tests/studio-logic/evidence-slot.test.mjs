import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  currentEvidenceRecords,
  emptyEvidenceSlot,
  evidenceSlotReadiness,
  recomputeEvidenceCorrelations,
  reduceEvidenceSlot,
} = require("../../.test-dist/convergence/evidenceSlot.js");
const {
  EvidenceManifestHydrator,
  EvidenceManifestProtocolError,
} = require("../../.test-dist/convergence/EvidenceManifestHydrator.js");
const { emptyIntegrationSlot } = require("../../.test-dist/convergence/integrationSlot.js");
const { emptyScenarioSlot } = require("../../.test-dist/convergence/scenarioSlot.js");
const { studioReducer } = require("../../.test-dist/app/studioState.js");
const { emptyMissionReadModel } = require("../../.test-dist/mission/MissionSession.js");

const SHA_SCENARIO = "1".repeat(64);
const SHA_SCENARIO_NEW = "2".repeat(64);
const SHA_RESULT = "3".repeat(64);
const SHA_CONTENT = "4".repeat(64);

function membership(sessionId = "session-1", generation = 1) {
  return { sessionId, generation };
}

function request(token = "e1", mode = "replace", targetPath = "/tmp/evidence.json", member = membership()) {
  return { membership: member, requestToken: token, targetPath, mode };
}

function manifest(subjects) {
  return {
    kind: "orbitfabric.evidence_set_manifest",
    manifestVersion: "0.1-candidate",
    evidenceSet: { id: "evidence-set-1" },
    curator: { id: "curator" },
    records: [
      {
        id: "record-1",
        content: {
          kind: "example",
          producer: { id: "producer" },
          reference: { path: "evidence.txt", sha256: SHA_CONTENT },
        },
        subjects,
      },
    ],
  };
}

function observation(subjects, member = membership(), targetPath = "/tmp/evidence.json") {
  return {
    membership: member,
    targetPath,
    manifestSha256: "5".repeat(64),
    manifest: manifest(subjects),
  };
}

function loadedScenario(sha = SHA_SCENARIO) {
  return {
    accepted: {
      membership: membership(),
      targetPath: "/tmp/scenario.json",
      declaration: {
        kind: "orbitfabric.scenario_declaration",
        declarationVersion: "0.1-candidate",
        orbitfabricVersion: "1.3.0",
        result: "loaded",
        scenario: { id: "scenario-1", name: "Scenario 1", description: null },
        mission: { id: "mission-1", modelVersion: "1" },
        source: { scenarioSha256: sha },
        boundaries: {},
        atomCount: 1,
        atoms: [
          {
            id: "atom-1",
            role: "step",
            kind: "command",
            stepIndex: 0,
            withinStepOrdinal: 0,
            scenarioTimeS: null,
            references: [],
            declaration: {},
          },
        ],
        diagnostics: [],
      },
    },
    pending: null,
    hydrationFailure: null,
  };
}

function integrationWithResult() {
  return {
    contexts: new Map([
      [
        "ctx",
        {
          accepted: {
            membership: membership(),
            context: {
              integrationId: "integration-1",
              adapterId: "adapter-1",
              adapterVersion: "1.0.0",
              operationId: "project",
            },
            resultPath: "/tmp/result.json",
            resultSha256: SHA_RESULT,
            result: {
              mappings: [{ id: "mapping-1" }],
              artifacts: [{ id: "artifact-1" }],
            },
            bundle: { resultPath: "/tmp/result.json", resultText: "{}", artifactChecks: [] },
          },
          pending: null,
          hydrationFailure: null,
        },
      ],
    ]),
  };
}

const ALL_SUBJECTS = [
  { type: "scenario_source", scenarioId: "scenario-1", scenarioSha256: SHA_SCENARIO },
  { type: "scenario_atom", scenarioSha256: SHA_SCENARIO, atomId: "atom-1" },
  { type: "integration_result", resultSha256: SHA_RESULT },
  { type: "integration_mapping", resultSha256: SHA_RESULT, mappingId: "mapping-1" },
  { type: "integration_artifact", resultSha256: SHA_RESULT, artifactId: "artifact-1" },
];

test("Evidence slot rejects stale generations and same-generation superseded completions", () => {
  const active = membership();
  let slot = emptyEvidenceSlot();
  const first = request("first");
  const second = request("second");

  slot = reduceEvidenceSlot(slot, active, emptyScenarioSlot(), emptyIntegrationSlot(), {
    type: "requested",
    request: first,
  });
  slot = reduceEvidenceSlot(slot, active, emptyScenarioSlot(), emptyIntegrationSlot(), {
    type: "requested",
    request: second,
  });

  const afterOld = reduceEvidenceSlot(slot, active, emptyScenarioSlot(), emptyIntegrationSlot(), {
    type: "ready",
    request: first,
    observation: observation([]),
  });
  assert.equal(afterOld, slot);

  const staleGeneration = request("stale", "replace", "/tmp/evidence.json", membership("old", 0));
  const afterStale = reduceEvidenceSlot(slot, active, emptyScenarioSlot(), emptyIntegrationSlot(), {
    type: "requested",
    request: staleGeneration,
  });
  assert.equal(afterStale, slot);
});

test("same-target Evidence refresh preserves accepted manifest on hydration failure", () => {
  const active = membership();
  const initialRequest = request("load");
  let slot = reduceEvidenceSlot(emptyEvidenceSlot(), active, loadedScenario(), integrationWithResult(), {
    type: "requested",
    request: initialRequest,
  });
  slot = reduceEvidenceSlot(slot, active, loadedScenario(), integrationWithResult(), {
    type: "ready",
    request: initialRequest,
    observation: observation(ALL_SUBJECTS),
  });
  assert.equal(evidenceSlotReadiness(slot), "ready");
  const accepted = slot.accepted;

  const refresh = request("refresh", "refresh");
  slot = reduceEvidenceSlot(slot, active, loadedScenario(), integrationWithResult(), {
    type: "requested",
    request: refresh,
  });
  assert.equal(slot.accepted, accepted);
  assert.equal(evidenceSlotReadiness(slot), "pending");

  slot = reduceEvidenceSlot(slot, active, loadedScenario(), integrationWithResult(), {
    type: "hydration_failed",
    request: refresh,
    failure: { class: "transport", message: "read failed" },
  });
  assert.equal(slot.accepted, accepted);
  assert.equal(slot.hydrationFailure.message, "read failed");
});

test("typed Evidence subjects resolve current, stale and unresolved without inference", () => {
  const active = membership();
  const load = request("load");
  let slot = reduceEvidenceSlot(emptyEvidenceSlot(), active, loadedScenario(), integrationWithResult(), {
    type: "requested",
    request: load,
  });
  slot = reduceEvidenceSlot(slot, active, loadedScenario(), integrationWithResult(), {
    type: "ready",
    request: load,
    observation: observation(ALL_SUBJECTS),
  });

  assert.deepEqual(slot.accepted.records[0].subjects.map((item) => item.state), [
    "current",
    "current",
    "current",
    "current",
    "current",
  ]);

  const scenarioChanged = recomputeEvidenceCorrelations(
    slot,
    loadedScenario(SHA_SCENARIO_NEW),
    integrationWithResult(),
  );
  assert.deepEqual(scenarioChanged.accepted.records[0].subjects.map((item) => item.state), [
    "stale",
    "stale",
    "current",
    "current",
    "current",
  ]);

  const resultMissing = recomputeEvidenceCorrelations(
    scenarioChanged,
    loadedScenario(SHA_SCENARIO_NEW),
    emptyIntegrationSlot(),
  );
  assert.deepEqual(resultMissing.accepted.records[0].subjects.map((item) => item.state), [
    "stale",
    "stale",
    "unresolved",
    "unresolved",
    "unresolved",
  ]);
});

test("no current correlated Evidence is a valid empty query result", () => {
  const active = membership();
  const load = request("load");
  let slot = reduceEvidenceSlot(emptyEvidenceSlot(), active, emptyScenarioSlot(), emptyIntegrationSlot(), {
    type: "requested",
    request: load,
  });
  slot = reduceEvidenceSlot(slot, active, emptyScenarioSlot(), emptyIntegrationSlot(), {
    type: "ready",
    request: load,
    observation: observation([{ type: "integration_result", resultSha256: SHA_RESULT }]),
  });

  assert.deepEqual(currentEvidenceRecords(slot), []);
  assert.equal(slot.hydrationFailure, null);
  assert.equal(evidenceSlotReadiness(slot), "ready");
});

test("Evidence hydrator parses the accepted manifest and fingerprints the exact text", async () => {
  const text = JSON.stringify({
    kind: "orbitfabric.evidence_set_manifest",
    manifest_version: "0.1-candidate",
    evidence_set: { id: "set-1" },
    curator: { id: "curator" },
    records: [
      {
        id: "record-1",
        content: {
          kind: "example",
          producer: { id: "producer" },
          reference: { path: "evidence.txt", sha256: SHA_CONTENT },
        },
        subjects: [{ type: "integration_result", result_sha256: SHA_RESULT }],
      },
    ],
  });
  const hydrator = new EvidenceManifestHydrator({
    async readTextFile(path) {
      return { path, text };
    },
  });

  const hydrated = await hydrator.hydrate(request("hydrate"));
  assert.equal(hydrated.manifest.evidenceSet.id, "set-1");
  assert.equal(
    hydrated.manifestSha256,
    createHash("sha256").update(text, "utf8").digest("hex"),
  );
});

test("Evidence hydrator keeps protocol failure distinct from transport failure", async () => {
  const hydrator = new EvidenceManifestHydrator({
    async readTextFile(path) {
      return { path, text: "{}" };
    },
  });

  await assert.rejects(() => hydrator.hydrate(request("bad")), EvidenceManifestProtocolError);
});

test("primary generation replacement clears Evidence state through studioReducer", () => {
  const activeSession = session("active", 1);
  const nextSession = session("next", 2);
  const acceptedEvidence = {
    accepted: {
      ...observation([]),
      records: [],
    },
    pending: null,
    hydrationFailure: null,
  };
  const state = {
    activeSession,
    opening: { requestId: "next", generation: 2, selectedPath: "/tmp", isRefresh: true },
    openFailure: null,
    scenario: emptyScenarioSlot(),
    integration: emptyIntegrationSlot(),
    evidence: acceptedEvidence,
    selection: { subject: null, origin: null, contextPath: [] },
    operationsMode: null,
    view: "overview",
  };

  const next = studioReducer(state, { type: "MISSION_PRIMARY_COMMITTED", session: nextSession });
  assert.equal(next.evidence.accepted, null);
  assert.equal(next.evidence.pending, null);
});

function session(sessionId, generation) {
  return {
    sessionId,
    generation,
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
        subsystems: [],
        modes: {},
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
