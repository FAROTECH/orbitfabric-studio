import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  emptyScenarioSlot,
  reduceScenarioSlot,
  scenarioSlotReadiness,
} = require("../../.test-dist/convergence/scenarioSlot.js");
const {
  ScenarioConsistencyError,
  ScenarioHydrator,
} = require("../../.test-dist/convergence/ScenarioHydrator.js");
const { emptyMissionReadModel } = require("../../.test-dist/mission/MissionSession.js");

const SHA = "b19ff6e1cf3c45cdb81e239d30aad97e8b6f037703c06f27102b762e69a1146a";

function membership(sessionId, generation) {
  return { sessionId, generation };
}

function request(member, token, mode = "replace") {
  return {
    membership: member,
    requestToken: token,
    targetPath: "/tmp/scenario.yaml",
    mode,
  };
}

function loadedDeclaration() {
  return {
    kind: "orbitfabric.scenario_declaration",
    declarationVersion: "0.1-candidate",
    orbitfabricVersion: "1.3.0",
    result: "loaded",
    scenario: { id: "scenario-1", name: "Scenario 1", description: null },
    mission: { id: "mission-1", modelVersion: "1" },
    source: { scenarioSha256: SHA },
    boundaries: {},
    atomCount: 1,
    atoms: [
      {
        id: "atom-0001",
        role: "action",
        kind: "command",
        stepIndex: 0,
        withinStepOrdinal: 0,
        scenarioTimeS: 1,
        references: [{ role: "command", entity: { domain: "commands", id: "payload.stop" } }],
        declaration: { arguments: {} },
      },
    ],
    diagnostics: [],
  };
}

function failedDeclaration() {
  return {
    kind: "orbitfabric.scenario_declaration",
    declarationVersion: "0.1-candidate",
    orbitfabricVersion: "1.3.0",
    result: "failed",
    scenario: null,
    mission: null,
    source: { scenarioSha256: SHA },
    boundaries: {},
    atomCount: null,
    atoms: null,
    diagnostics: [
      {
        severity: "error",
        code: "scenario.invalid",
        file: null,
        domain: null,
        objectId: null,
        message: "Scenario is invalid.",
        suggestion: null,
      },
    ],
  };
}

function missionSession(sessionId = "session-1", generation = 1) {
  return {
    sessionId,
    generation,
    source: { selectedPath: "/tmp", missionDir: "/tmp/mission" },
    core: { executable: "orbitfabric", orbitfabricVersion: "1.3.0", versionText: "orbitfabric 1.3.0" },
    snapshot: {
      kind: "orbitfabric.mission_snapshot",
      snapshot_version: "0.1-candidate",
      orbitfabric_version: "1.3.0",
      result: "loaded",
      mission: { id: "mission-1", name: "Mission 1", model_version: "1" },
      source: { mission_dir: "/tmp/mission" },
      boundaries: {},
      diagnostics: [],
      model: {},
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

test("late response from generation N cannot mutate generation N+1", () => {
  const gen1 = membership("session-1", 1);
  const gen2 = membership("session-2", 2);
  const req = request(gen1, "S1");
  let slot = reduceScenarioSlot(emptyScenarioSlot(), gen1, { type: "requested", request: req });

  const after = reduceScenarioSlot(slot, gen2, {
    type: "ready",
    request: req,
    declaration: loadedDeclaration(),
  });

  assert.equal(after, slot);
  assert.equal(after.accepted, null);
});

test("same-generation superseded request token is reject-only", () => {
  const member = membership("session-1", 1);
  const s1 = request(member, "S1");
  const s2 = request(member, "S2");
  let slot = reduceScenarioSlot(emptyScenarioSlot(), member, { type: "requested", request: s1 });
  slot = reduceScenarioSlot(slot, member, { type: "requested", request: s2 });

  const afterOld = reduceScenarioSlot(slot, member, {
    type: "ready",
    request: s1,
    declaration: loadedDeclaration(),
  });
  assert.equal(afterOld, slot);

  const afterCurrent = reduceScenarioSlot(afterOld, member, {
    type: "ready",
    request: s2,
    declaration: loadedDeclaration(),
  });
  assert.equal(afterCurrent.accepted.declaration.result, "loaded");
});

test("Core-declared failed Scenario is an accepted domain observation", () => {
  const member = membership("session-1", 1);
  const req = request(member, "S1");
  let slot = reduceScenarioSlot(emptyScenarioSlot(), member, { type: "requested", request: req });
  slot = reduceScenarioSlot(slot, member, {
    type: "ready",
    request: req,
    declaration: failedDeclaration(),
  });

  assert.equal(scenarioSlotReadiness(slot), "declared_failed");
  assert.equal(slot.hydrationFailure, null);
  assert.equal(slot.accepted.declaration.diagnostics[0].code, "scenario.invalid");
});

test("same-target failed refresh preserves the previously accepted observation", () => {
  const member = membership("session-1", 1);
  const first = request(member, "S1");
  let slot = reduceScenarioSlot(emptyScenarioSlot(), member, { type: "requested", request: first });
  slot = reduceScenarioSlot(slot, member, {
    type: "ready",
    request: first,
    declaration: loadedDeclaration(),
  });

  const accepted = slot.accepted;
  const refresh = request(member, "S2", "refresh");
  slot = reduceScenarioSlot(slot, member, { type: "requested", request: refresh });
  slot = reduceScenarioSlot(slot, member, {
    type: "hydration_failed",
    request: refresh,
    failure: { class: "transport", message: "Core unavailable" },
  });

  assert.deepEqual(slot.accepted, accepted);
  assert.equal(slot.hydrationFailure.class, "transport");
});

test("ScenarioHydrator preserves Core EntityRefs and exact identity", async () => {
  const declaration = loadedDeclaration();
  const gateway = {
    async exportScenarioDeclaration() {
      return { invocation: {}, surface: declaration };
    },
  };
  const hydrator = new ScenarioHydrator(gateway);
  const result = await hydrator.hydrate(missionSession(), "/tmp/scenario.yaml", "S1");

  assert.equal(result.declaration.scenario.id, "scenario-1");
  assert.equal(result.declaration.source.scenarioSha256, SHA);
  assert.deepEqual(result.declaration.atoms[0].references[0].entity, {
    domain: "commands",
    id: "payload.stop",
  });
});

test("ScenarioHydrator fails closed on Mission binding mismatch", async () => {
  const declaration = loadedDeclaration();
  declaration.mission = { id: "other-mission", modelVersion: "1" };
  const gateway = {
    async exportScenarioDeclaration() {
      return { invocation: {}, surface: declaration };
    },
  };
  const hydrator = new ScenarioHydrator(gateway);

  await assert.rejects(
    () => hydrator.hydrate(missionSession(), "/tmp/scenario.yaml", "S1"),
    ScenarioConsistencyError,
  );
});
