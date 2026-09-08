import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  assessIntegrationObservationFreshness,
  emptyIntegrationSlot,
  getIntegrationContext,
  integrationResultExactIdentity,
  reduceIntegrationSlot,
} = require("../../.test-dist/convergence/integrationSlot.js");
const {
  IntegrationResultConsistencyError,
  IntegrationResultHydrator,
  IntegrationResultProtocolError,
} = require("../../.test-dist/convergence/IntegrationResultHydrator.js");
const { studioReducer } = require("../../.test-dist/app/studioState.js");
const { emptyMissionReadModel } = require("../../.test-dist/mission/MissionSession.js");
const { emptyScenarioSlot } = require("../../.test-dist/convergence/scenarioSlot.js");

function membership(sessionId = "session-1", generation = 1) {
  return { sessionId, generation };
}

function context(integrationId, operationId) {
  return {
    integrationId,
    adapterId: `${integrationId}-adapter`,
    adapterVersion: "1.0.0",
    operationId,
  };
}

function request(member, token, ctx, resultPath = `/tmp/${ctx.integrationId}/${ctx.operationId}/integration_result.json`) {
  return {
    membership: member,
    requestToken: token,
    context: ctx,
    resultPath,
  };
}

function resultText(ctx, state = "succeeded", scenarioSha = null) {
  const inputs = {
    core_input_set: { status: "available", sha256: "core-sha" },
    profile: { status: "available", sha256: "profile-sha" },
    operation_inputs: scenarioSha
      ? [{ role: "scenario", status: "available", id: "scenario-1", sha256: scenarioSha, reason: null }]
      : [],
  };

  return JSON.stringify({
    kind: "orbitfabric.integration_result",
    result_version: "0.2-candidate",
    result: state,
    integration: { id: ctx.integrationId, schema_version: "0.2-candidate" },
    adapter: { id: ctx.adapterId, version: ctx.adapterVersion },
    operation: { id: ctx.operationId },
    mission: { status: "available" },
    inputs,
    capabilities: [],
    artifacts: [],
    mappings: [],
    resolutions: [],
    diagnostics: [],
    coverage: {
      status: "complete",
      scope: { domains: [] },
      reason: null,
      summary: {},
      records: [],
    },
    evidence: [],
    external_tools: [],
  });
}

function bundle(path, text) {
  return {
    resultPath: path,
    resultText: text,
    artifactChecks: [],
  };
}

function observation(req, result, sha = "a".repeat(64)) {
  return {
    membership: req.membership,
    context: req.context,
    resultPath: req.resultPath,
    resultSha256: sha,
    result,
    bundle: { resultPath: req.resultPath, resultText: "{}", artifactChecks: [] },
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

function studioState(session) {
  return {
    activeSession: session,
    opening: null,
    openFailure: null,
    scenario: emptyScenarioSlot(),
    integration: emptyIntegrationSlot(),
    selection: { subject: null, origin: null, contextPath: [] },
    operationsMode: null,
    view: "overview",
  };
}

test("independent Integration contexts coexist in one MissionSession generation", () => {
  const member = membership();
  const flight = context("fprime", "project-flight");
  const ground = context("cosmos", "project-ground");
  const flightRequest = request(member, "F1", flight);
  const groundRequest = request(member, "G1", ground);

  let slot = emptyIntegrationSlot();
  slot = reduceIntegrationSlot(slot, member, { type: "requested", request: flightRequest });
  slot = reduceIntegrationSlot(slot, member, { type: "requested", request: groundRequest });
  slot = reduceIntegrationSlot(slot, member, {
    type: "ready",
    request: groundRequest,
    observation: observation(groundRequest, { result: "succeeded" }, "b".repeat(64)),
  });
  slot = reduceIntegrationSlot(slot, member, {
    type: "ready",
    request: flightRequest,
    observation: observation(flightRequest, { result: "succeeded" }, "a".repeat(64)),
  });

  assert.equal(slot.contexts.size, 2);
  assert.equal(getIntegrationContext(slot, flight).accepted.resultSha256, "a".repeat(64));
  assert.equal(getIntegrationContext(slot, ground).accepted.resultSha256, "b".repeat(64));
});

test("same-context superseded request token is reject-only", () => {
  const member = membership();
  const ctx = context("cosmos", "verify");
  const first = request(member, "R1", ctx);
  const second = request(member, "R2", ctx);
  let slot = emptyIntegrationSlot();
  slot = reduceIntegrationSlot(slot, member, { type: "requested", request: first });
  slot = reduceIntegrationSlot(slot, member, { type: "requested", request: second });

  const afterOld = reduceIntegrationSlot(slot, member, {
    type: "ready",
    request: first,
    observation: observation(first, { result: "succeeded" }),
  });
  assert.equal(afterOld, slot);

  const afterCurrent = reduceIntegrationSlot(afterOld, member, {
    type: "ready",
    request: second,
    observation: observation(second, { result: "succeeded" }),
  });
  assert.equal(getIntegrationContext(afterCurrent, ctx).accepted.membership.sessionId, "session-1");
});

test("Studio reducer resets Integration contexts on primary generation replacement and rejects late old response", () => {
  const oldSession = missionSession("session-1", 1);
  const ctx = context("fprime", "project");
  const oldRequest = request(membership("session-1", 1), "R1", ctx);
  let state = studioState(oldSession);
  state = studioReducer(state, { type: "INTEGRATION_RESULT_REQUESTED", request: oldRequest });
  assert.equal(getIntegrationContext(state.integration, ctx).pending.requestToken, "R1");

  const newSession = missionSession("session-2", 2);
  state = studioReducer(state, {
    type: "MISSION_OPEN_REQUESTED",
    opening: { requestId: "session-2", generation: 2, selectedPath: "/tmp", isRefresh: true },
  });
  state = studioReducer(state, { type: "MISSION_PRIMARY_COMMITTED", session: newSession });
  assert.equal(state.integration.contexts.size, 0);

  const afterLate = studioReducer(state, {
    type: "INTEGRATION_RESULT_READY",
    request: oldRequest,
    observation: observation(oldRequest, { result: "succeeded" }),
  });
  assert.equal(afterLate, state);
});

test("valid adapter result=failed is retained as an Integration observation", async () => {
  const member = membership();
  const ctx = context("cosmos", "verify");
  const req = request(member, "R1", ctx);
  const text = resultText(ctx, "failed");
  const hydrator = new IntegrationResultHydrator({
    async readResultBundle() {
      return bundle(req.resultPath, text);
    },
  });

  const hydrated = await hydrator.hydrate(req);
  assert.equal(hydrated.result.result, "failed");

  let slot = reduceIntegrationSlot(emptyIntegrationSlot(), member, { type: "requested", request: req });
  slot = reduceIntegrationSlot(slot, member, { type: "ready", request: req, observation: hydrated });
  assert.equal(getIntegrationContext(slot, ctx).accepted.result.result, "failed");
  assert.equal(getIntegrationContext(slot, ctx).hydrationFailure, null);
});

test("Integration Result exact identity is SHA-256 of the exact Result text read by Studio", async () => {
  const member = membership();
  const ctx = context("fprime", "project");
  const req = request(member, "R1", ctx);
  const text = resultText(ctx);
  const expected = createHash("sha256").update(text, "utf8").digest("hex");
  const hydrator = new IntegrationResultHydrator({
    async readResultBundle() {
      return bundle(req.resultPath, text);
    },
  });

  const hydrated = await hydrator.hydrate(req);
  assert.equal(integrationResultExactIdentity(hydrated), expected);
});

test("Integration Result context mismatch fails closed", async () => {
  const member = membership();
  const requestedContext = context("fprime", "project");
  const actualContext = context("cosmos", "project");
  const req = request(member, "R1", requestedContext);
  const hydrator = new IntegrationResultHydrator({
    async readResultBundle() {
      return bundle(req.resultPath, resultText(actualContext));
    },
  });

  await assert.rejects(() => hydrator.hydrate(req), IntegrationResultConsistencyError);
});

test("invalid Result protocol is hydration failure rather than an accepted observation", async () => {
  const member = membership();
  const ctx = context("cosmos", "verify");
  const req = request(member, "R1", ctx);
  const text = resultText(ctx, "succeeded_with_warnings");
  const hydrator = new IntegrationResultHydrator({
    async readResultBundle() {
      return bundle(req.resultPath, text);
    },
  });

  await assert.rejects(() => hydrator.hydrate(req), IntegrationResultProtocolError);
});

test("Integration observation freshness reuses exact Core, Profile and Scenario provenance", () => {
  const member = membership();
  const ctx = context("cosmos", "verify");
  const req = request(member, "R1", ctx);
  const parsedResult = {
    resultVersion: "0.2-candidate",
    inputs: {
      coreInputSet: { status: "available", sha256: "core-sha" },
      profile: { status: "available", sha256: "profile-sha" },
      operationInputs: [
        { role: "scenario", status: "available", id: "scenario-1", sha256: "scenario-sha", reason: null },
      ],
    },
  };
  const accepted = observation(req, parsedResult);

  const freshness = assessIntegrationObservationFreshness(
    accepted,
    { inputSetSha256: "core-sha" },
    { sha256: "profile-sha" },
    [{ role: "scenario", sha256: "scenario-sha" }],
  );
  assert.equal(freshness.state, "fresh");
});
