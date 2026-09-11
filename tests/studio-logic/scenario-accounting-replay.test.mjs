import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { parseAndValidateScenarioAccounting, parseScenarioAccounting, validateAccountingAgainstScenario, UnsupportedAccountingVersion } = require("../../.test-dist/convergence/scenarioProjectionAccounting.js");
const { buildEvidenceUnderstanding } = require("../../.test-dist/convergence/evidenceUnderstanding.js");
const { ReplayRequestGuard } = require("../../.test-dist/convergence/replayRequestGuard.js");

const SHA = "a".repeat(64);
const RESULT_SHA = "b".repeat(64);

function accountingValue() {
  return {
    kind: "orbitfabric.scenario_projection_accounting",
    accounting_version: "0.1-candidate",
    scenario: { id: "r1", sha256: SHA },
    completeness: "complete",
    records: [
      { atom_id: "atom-0001", disposition: "projected", mapping_ids: [] },
      { atom_id: "atom-0002", disposition: "not_projected", mapping_ids: [], reason: "Producer did not project this atom." },
      { atom_id: "atom-0003", disposition: "projected", mapping_ids: ["mapping.op-1"] },
    ],
  };
}

function result(artifactSha) {
  return {
    resultVersion: "0.2-candidate", mission: { status: "available", id: "m", model_version: "1" }, result: { status: "completed" }, evidence: [],
    integration: { id: "generic" }, adapter: { id: "adapter", version: "2.0.0" }, operation: { id: "project" },
    inputs: { operationInputs: [{ role: "scenario", status: "available", id: "r1", sha256: SHA, reason: null }] },
    mappings: [{ id: "mapping.op-1", sources: [], profileBindings: [], targets: [] }],
    artifacts: [{ id: "scenario.accounting", kind: "orbitfabric.scenario_projection_accounting", status: "generated", mediaType: "application/json", sha256: artifactSha, derivedFromMappings: ["mapping.op-1"], path: "scenario.json" }, { id: "native.output", kind: "native", status: "generated", sha256: "c".repeat(64), derivedFromMappings: ["mapping.op-1"], path: "native.txt" }],
  };
}

function declaration() {
  return { result: "loaded", scenario: { id: "r1", name: "R1", description: null }, mission: { id: "m", modelVersion: "1" }, source: { scenarioSha256: SHA }, atoms: [
    { id: "atom-0001", role: "metadata", kind: "scenario_metadata" },
    { id: "atom-0002", role: "initial", kind: "initial_mode" },
    { id: "atom-0003", role: "action", kind: "send_command" },
  ] };
}

test("generic accounting verifies exact bytes, parent Scenario input and mapping union", async () => {
  const text = JSON.stringify(accountingValue());
  const digest = createHash("sha256").update(text).digest("hex");
  const parent = result(digest);
  const parsed = await parseAndValidateScenarioAccounting(text, parent.artifacts[0], parent, "/tmp/scenario.json", RESULT_SHA);
  assert.equal(parsed.accounting.records[0].disposition, "projected");
  assert.deepEqual(parsed.accounting.records[0].mappingIds, []);
  assert.equal(parsed.accounting.records[1].disposition, "not_projected");
  await assert.rejects(() => parseAndValidateScenarioAccounting(`${text} `, parent.artifacts[0], parent, "/tmp/scenario.json", RESULT_SHA), /bytes do not match/);
});

test("generic accounting fails closed on unknown version and illegal negative mapping", () => {
  const unknown = accountingValue(); unknown.accounting_version = "0.2-candidate";
  assert.throws(() => parseScenarioAccounting(JSON.stringify(unknown)), /Unsupported Scenario accounting version/);
  const illegal = accountingValue(); illegal.records[1].mapping_ids = ["mapping.op-1"];
  assert.throws(() => parseScenarioAccounting(JSON.stringify(illegal)), /requires empty mappings/);
});

test("replay follows exact atom to producer disposition, mapping, artifact and curator evidence", async () => {
  const text = JSON.stringify(accountingValue());
  const digest = createHash("sha256").update(text).digest("hex");
  const parent = result(digest);
  const parsed = await parseAndValidateScenarioAccounting(text, parent.artifacts[0], parent, "/tmp/scenario.json", RESULT_SHA);
  const observation = { resultSha256: RESULT_SHA, result: result(digest), scenarioAccounting: parsed };
  const model = buildEvidenceUnderstanding(
    { accepted: { declaration: declaration() } },
    { contexts: new Map([["result", { accepted: observation }]]) },
    evidence([{ type: "scenario_atom", scenarioSha256: SHA, atomId: "atom-0003" }, { type: "integration_mapping", resultSha256: RESULT_SHA, mappingId: "mapping.op-1" }]),
  );
  const projected = model.atoms[2].projections[0];
  assert.equal(projected.disposition, "projected");
  assert.deepEqual(projected.mappings.map((item) => item.id), ["mapping.op-1"]);
  assert.deepEqual(projected.artifacts.map((item) => item.id), ["scenario.accounting", "native.output"]);
  assert.equal(projected.evidence[0].id, "runtime");
  assert.equal(projected.evidence[0].verdict, "unavailable");
});

function evidence(subjects, states = []) {
  return { accepted: { manifestSha256: "d".repeat(64), manifest: { evidenceSet: { id: "set" }, curator: { id: "curator" } }, records: [{ record: { id: "runtime", content: { kind: "producer.runtime", producer: { id: "producer" }, reference: { path: "runtime.json", sha256: "e".repeat(64) } }, subjects }, subjects: subjects.map((subject, index) => ({ subject, state: states[index] ?? "current", reason: "Authored reference" })) }] } };
}

async function observed(value = accountingValue(), mutate = () => {}) {
  const text = JSON.stringify(value);
  const parent = result(createHash("sha256").update(text).digest("hex"));
  mutate(parent);
  const scenarioAccounting = await parseAndValidateScenarioAccounting(text, parent.artifacts[0], parent, "/tmp/scenario.json", RESULT_SHA);
  return { resultSha256: RESULT_SHA, result: parent, scenarioAccounting };
}

function modelFor(observation, subjects = [], declared = declaration(), states = []) {
  return buildEvidenceUnderstanding({ accepted: { declaration: declared } }, { contexts: new Map([["one", { accepted: observation }]]) }, evidence(subjects, states));
}

test("rejects exact parent input, owned artifact, mapping and version violations", async () => {
  for (const mutate of [
    (r) => { r.inputs.operationInputs = []; },
    (r) => { r.inputs.operationInputs[0].id = "other"; },
    (r) => { r.inputs.operationInputs[0].sha256 = "0".repeat(64); },
    (r) => { r.inputs.operationInputs[0].status = "unavailable"; },
    (r) => { r.artifacts[0].derivedFromMappings = []; },
    (r) => { r.mappings = []; },
    (r) => { r.resultVersion = "0.1-candidate"; },
    (r) => { r.artifacts[0].mediaType = "text/plain"; },
    (r) => { r.artifacts[0].path = "../foreign.json"; },
    (r) => { r.artifacts.push({ ...r.artifacts[0] }); },
  ]) await assert.rejects(() => observed(accountingValue(), mutate));
  const text = JSON.stringify(accountingValue());
  const parent = result(createHash("sha256").update(text).digest("hex"));
  await assert.rejects(() => parseAndValidateScenarioAccounting(text, { ...parent.artifacts[0] }, parent, "other", RESULT_SHA), /owned/);
  await assert.rejects(() => parseAndValidateScenarioAccounting(text, parent.artifacts[0], parent, "other", ""), /parent Result SHA/);
});

test("negative schema cases remain distinct and unknown versions are unsupported without shape fallback", () => {
  for (const mutate of [
    (a) => { a.records.push(a.records[0]); },
    (a) => { a.records[0].atom_id = "  "; },
    (a) => { a.records[1].reason = null; },
    (a) => { a.records[1].reason = "  "; },
    (a) => { a.records[1].disposition = "unsupported"; a.records[1].mapping_ids = ["mapping.op-1"]; },
    (a) => { a.records[2].mapping_ids.push("mapping.op-1"); },
    (a) => { a.completeness = "partial"; },
    (a) => { a.inferred_timing = 100; },
  ]) { const value = accountingValue(); mutate(value); assert.throws(() => parseScenarioAccounting(JSON.stringify(value))); }
  const future = { ...accountingValue(), accounting_version: "future", records: "opaque future shape", future_field: true };
  assert.throws(() => parseScenarioAccounting(JSON.stringify(future)), UnsupportedAccountingVersion);
});

test("exact Scenario inventory rejects missing, extra and foreign atoms; partial omissions stay unavailable", async () => {
  const value = accountingValue(); value.records.shift();
  const missing = await observed(value);
  assert.equal(modelFor(missing).atoms[0].projections[0].availability, "failure");
  value.completeness = "partial"; value.reason = "Producer omitted metadata";
  const partial = await observed(value);
  assert.equal(modelFor(partial).atoms[0].projections[0].availability, "unavailable");
  const extra = accountingValue(); extra.records.push({ atom_id: "extra", disposition: "projected", mapping_ids: [] });
  assert.throws(() => validateAccountingAgainstScenario(parseScenarioAccounting(JSON.stringify(extra)), declaration()), /unknown atom/);
  const original = await observed();
  const stale = declaration(); stale.source.scenarioSha256 = "f".repeat(64);
  assert.equal(modelFor(original, [], stale).atoms[0].projections[0].availability, "stale");
  const foreign = declaration(); foreign.scenario.id = "other";
  assert.equal(modelFor(original, [], foreign).atoms[0].projections[0].availability, "unresolved");
  const parentChanged = { ...original, resultSha256: "c".repeat(64) };
  assert.equal(modelFor(parentChanged).atoms[0].projections[0].availability, "failure");
});

test("curator co-membership creates no inferred pairwise edge and preserves each subject state", async () => {
  const observation = await observed();
  const subjects = [
    { type: "scenario_atom", scenarioSha256: SHA, atomId: "atom-0003" },
    { type: "integration_result", resultSha256: RESULT_SHA },
    { type: "integration_mapping", resultSha256: "c".repeat(64), mappingId: "mapping.op-1" },
  ];
  const model = modelFor(observation, subjects, declaration(), ["current", "unresolved", "stale"]);
  assert.equal(model.atoms[2].directEvidence.length, 1);
  assert.equal(model.results[0].evidence.length, 1);
  assert.equal(model.atoms[2].projections[0].evidence.length, 0);
  assert.deepEqual(model.records[0].subjects.map((s) => s.state), ["current", "unresolved", "stale"]);
  assert.deepEqual(model.atoms[2].directEvidence[0].matchedSubjects.map((s) => s.state), ["current"]);
  assert.deepEqual(model.results[0].evidence[0].matchedSubjects.map((s) => s.state), ["unresolved"]);
  assert.equal("correlation" in model.records[0], false);
  subjects[0].scenarioSha256 = "0".repeat(64);
  assert.equal(modelFor(observation, subjects).atoms[2].directEvidence.length, 0);
});

test("only producer mapping ids and explicit Result artifact relations are traversed", async () => {
  const observation = await observed();
  observation.result.artifacts.push({ id: "unrelated", derivedFromMappings: [], status: "generated", kind: "opaque" });
  const model = modelFor(observation);
  assert.deepEqual(model.atoms[0].projections[0].mappings, []);
  assert.deepEqual(model.atoms[0].projections[0].artifacts, []);
  assert.equal(model.atoms[0].projections[0].disposition, "projected");
  assert.equal(model.atoms[2].projections[0].artifacts.some((a) => a.id === "unrelated"), false);
});

test("picker/preview completions reject old session, generation and request tokens", () => {
  const guard = new ReplayRequestGuard();
  const membership = { sessionId: "session", generation: 1 };
  const first = { membership, requestToken: "one" };
  const second = { membership, requestToken: "two" };
  guard.begin(first); assert.equal(guard.accepts(first, membership), true);
  guard.begin(second); assert.equal(guard.accepts(first, membership), false);
  assert.equal(guard.accepts(second, { ...membership, generation: 2 }), false);
  assert.equal(guard.accepts(second, { ...membership, sessionId: "different" }), false);
  assert.equal(guard.accepts(second, null), false);
  guard.invalidate(); assert.equal(guard.accepts(second, membership), false);
});

test("Scenario-free Result stays unavailable and expected intent never becomes observed PASS", () => {
  const scenarioFree = { resultSha256: RESULT_SHA, result: { ...result("f".repeat(64)), inputs: { operationInputs: [] } }, scenarioAccounting: null };
  const declared = declaration();
  declared.atoms[2].declaration = { expected: "PASSED" };
  const model = buildEvidenceUnderstanding({ accepted: { declaration: declared } }, { contexts: new Map([["fprime", { accepted: scenarioFree }]]) }, { accepted: null });
  assert.equal(model.atoms[2].projections[0].disposition, "unavailable");
  assert.deepEqual(model.atoms[2].declaration, { expected: "PASSED" });
  assert.deepEqual(model.results[0].producerStatements, []);
  assert.equal(JSON.stringify(model).includes('"verdict":"PASS"'), false);
  assert.equal("executionState" in model.atoms[2], false);
  assert.equal("timestamp" in model.atoms[2].projections[0], false);
});

test("asynchronous picker failure and finalizer cannot replace newer UI state", async () => {
  const guard = new ReplayRequestGuard();
  let active = { sessionId: "session", generation: 1 };
  const first = { membership: active, requestToken: "old" };
  let finish;
  const pending = new Promise((_, reject) => { finish = reject; });
  let ui = { busy: "old", failure: null };
  guard.begin(first);
  const oldCompletion = (async () => {
    try { await pending; }
    catch (error) { if (guard.accepts(first, active)) ui.failure = error.message; }
    finally { if (guard.accepts(first, active)) ui.busy = null; }
  })();
  active = { sessionId: "replacement", generation: 2 };
  const next = { membership: active, requestToken: "new" };
  guard.begin(next);
  ui = { busy: "new", failure: "new failure" };
  finish(new Error("old failure"));
  await oldCompletion;
  assert.deepEqual(ui, { busy: "new", failure: "new failure" });
});
