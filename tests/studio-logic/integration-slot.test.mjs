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

const sha256 = (text) => createHash("sha256").update(text).digest("hex");

function accountingFixture(content = null) {
  const ctx = context("generic-producer", "projection");
  const req = request(membership(), "accounting", ctx);
  const text = content ?? JSON.stringify({
    kind: "orbitfabric.scenario_projection_accounting", accounting_version: "0.1-candidate",
    scenario: { id: "scenario-1", sha256: "1".repeat(64) }, completeness: "complete",
    records: [{ atom_id: "atom-1", disposition: "projected", mapping_ids: [] }],
  });
  const raw = JSON.parse(resultText(ctx, "succeeded", "1".repeat(64)));
  raw.artifacts = [{ id: "producer-owned-id", kind: "orbitfabric.scenario_projection_accounting", status: "generated",
    requirement: "optional", media_type: "application/json", path: "nested/accounting.json", sha256: sha256(text), derived_from_mappings: [] }];
  raw.evidence = [{ producer_statement: "unclassified observation" }];
  const resultBytes = JSON.stringify(raw);
  const checkedBundle = { ...bundle(req.resultPath, resultBytes), artifactChecks: [{ artifactId: "producer-owned-id", path: "nested/accounting.json", contained: true, exists: true, sha256Matches: true }] };
  return { req, text, raw, checkedBundle };
}

test("accounting hydration reads only the explicit parent-owned reference and exact digests", async () => {
  const fixture = accountingFixture();
  const { req, text, checkedBundle } = fixture;
  const calls = [];
  const hydrated = await new IntegrationResultHydrator({
    async readResultBundle() { return checkedBundle; },
    async readRetainedReference(reference) {
      calls.push(reference);
      return { status: "verified", path: "/tmp/nested/accounting.json", sha256: sha256(text), text, reason: null };
    },
    async readTextFile() { assert.fail("No guessed sibling or unbounded fallback is permitted"); },
  }).hydrate(req);
  assert.deepEqual(calls, [{ parentPath: req.resultPath, parentSha256: sha256(checkedBundle.resultText), relativePath: "nested/accounting.json", expectedSha256: sha256(text) }]);
  assert.equal(hydrated.scenarioAccounting.resultSha256, hydrated.resultSha256);
  assert.equal(hydrated.scenarioAccounting.artifactId, "producer-owned-id");
  assert.deepEqual(hydrated.scenarioAccounting.accounting.records[0].mappingIds, []);
});

test("unsupported or invalid accounting content is localized to its interpretation", async () => {
  const future = JSON.stringify({ kind: "orbitfabric.scenario_projection_accounting", accounting_version: "future", new_format: { opaque: true } });
  for (const [text, state] of [[future, "unsupported"], ["invalid JSON", "failure"]]) {
    const { req, checkedBundle } = accountingFixture(text);
    const hydrated = await new IntegrationResultHydrator({
      async readResultBundle() { return checkedBundle; },
      async readRetainedReference() { return { status: "verified", path: "/tmp/content", sha256: sha256(text), text, reason: null }; },
    }).hydrate(req);
    assert.equal(hydrated.accountingIssue.state, state);
    assert.equal(hydrated.scenarioAccounting, null);
    assert.equal(hydrated.accountingReference.status, "verified");
    assert.equal(hydrated.accountingReference.text, text);
    assert.equal(hydrated.result.result, "succeeded");
    assert.deepEqual(hydrated.result.evidence, [{ producer_statement: "unclassified observation" }]);
  }
});

test("accounting reference availability and byte integrity remain separate from content meaning", async () => {
  const { req, text, checkedBundle } = accountingFixture();
  for (const status of ["missing", "digest_mismatch", "failure"]) {
    const hydrated = await new IntegrationResultHydrator({
      async readResultBundle() { return checkedBundle; },
      async readRetainedReference() { return { status, path: null, sha256: null, text: null, reason: `reference ${status}` }; },
    }).hydrate(req);
    assert.equal(hydrated.accountingIssue.state, status);
    assert.equal(hydrated.accountingReference.status, status);
    assert.equal(hydrated.result.result, "succeeded");
    assert.equal(hydrated.scenarioAccounting, null);
  }
  const binary = await new IntegrationResultHydrator({
    async readResultBundle() { return checkedBundle; },
    async readRetainedReference() { return { status: "verified", path: "/tmp/content", sha256: sha256(text), text: null, reason: null }; },
  }).hydrate(req);
  assert.equal(binary.accountingReference.status, "verified");
  assert.equal(binary.accountingIssue.state, "unsupported");
  const unavailable = await new IntegrationResultHydrator({ async readResultBundle() { return checkedBundle; } }).hydrate(req);
  assert.equal(unavailable.accountingIssue.state, "unavailable");
});

test("accounting digest mismatch cannot consume bytes even when a gateway reports verified", async () => {
  const { req, text, checkedBundle } = accountingFixture();
  const hydrated = await new IntegrationResultHydrator({
    async readResultBundle() { return checkedBundle; },
    async readRetainedReference() { return { status: "verified", path: "/tmp/content", sha256: sha256(text), text: `${text} `, reason: null }; },
  }).hydrate(req);
  assert.equal(hydrated.scenarioAccounting, null);
  assert.equal(hydrated.accountingIssue.state, "failure");
  assert.match(hydrated.accountingIssue.reason, /digest/);
});

test("unknown artifact kind is not interpreted by matching content shape", async () => {
  const { req, raw, checkedBundle } = accountingFixture();
  raw.artifacts[0].kind = "producer.opaque";
  checkedBundle.resultText = JSON.stringify(raw);
  const hydrated = await new IntegrationResultHydrator({
    async readResultBundle() { return checkedBundle; },
    async readRetainedReference() { assert.fail("No shape-based discovery"); },
  }).hydrate(req);
  assert.equal(hydrated.scenarioAccounting, null);
  assert.equal(hydrated.accountingIssue, null);
});

test("multiple accounting identities localize ambiguity without rejecting the valid Result", async () => {
  const { req, raw, checkedBundle } = accountingFixture();
  raw.artifacts.push({ ...raw.artifacts[0], id: "second-id", path: "other.json" });
  checkedBundle.artifactChecks.push({ ...checkedBundle.artifactChecks[0], artifactId: "second-id", path: "other.json" });
  checkedBundle.resultText = JSON.stringify(raw);
  const hydrated = await new IntegrationResultHydrator({
    async readResultBundle() { return checkedBundle; },
    async readRetainedReference() { assert.fail("Ambiguous identities must not select the first artifact"); },
  }).hydrate(req);
  assert.equal(hydrated.accountingIssue.state, "failure");
  assert.equal(hydrated.result.artifacts.length, 2);
  assert.equal(hydrated.scenarioAccounting, null);
});

test("Result byte changes between picker preview and hydration fail exact binding", async () => {
  const { req, checkedBundle } = accountingFixture();
  req.expectedResultSha256 = sha256(checkedBundle.resultText);
  checkedBundle.resultText += "\n";
  await assert.rejects(() => new IntegrationResultHydrator({ async readResultBundle() { return checkedBundle; } }).hydrate(req), /Selected Result bytes changed/);
});

test("ready observations reject mismatched membership, context and selected digest", () => {
  const ctx = context("generic", "project");
  const req = { ...request(membership(), "token", ctx), expectedResultSha256: "a".repeat(64) };
  const slot = reduceIntegrationSlot(emptyIntegrationSlot(), membership(), { type: "requested", request: req });
  for (const mutate of [
    (o) => { o.membership = membership("other", 1); },
    (o) => { o.membership = membership("session-1", 2); },
    (o) => { o.context = context("other", "project"); },
    (o) => { o.resultSha256 = "b".repeat(64); },
  ]) {
    const candidate = observation(req, { result: "succeeded" }); mutate(candidate);
    assert.equal(reduceIntegrationSlot(slot, membership(), { type: "ready", request: req, observation: candidate }), slot);
  }
});
