import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { consumeScenarioReport } = require("../../.test-dist/convergence/scenarioProtocol.js");
const { buildScenarioUnderstanding } = require("../../.test-dist/convergence/scenarioUnderstanding.js");
const { emptyScenarioSlot, beginScenarioRequest, failScenarioHydration } = require("../../.test-dist/convergence/scenarioSlot.js");
const { MalformedCoreSurfaceError } = require("../../.test-dist/core/surfaceValidation.js");
const fixture = () => JSON.parse(readFileSync("tests/fixtures/convergence/r1-scenario-declaration.json", "utf8"));
const membership = { sessionId: "r1", generation: 1 };
const slotFor = (wire) => ({ ...emptyScenarioSlot(), accepted: {
  membership, targetPath: "/r1.yaml", declaration: consumeScenarioReport(JSON.stringify(wire)),
} });

test("R1 understanding preserves exact identity, all eight atoms and declared values", () => {
  const wire = fixture();
  const model = buildScenarioUnderstanding(slotFor(wire));
  assert.deepEqual(model.exactIdentity, { scenarioId: wire.scenario.id, scenarioSha256: wire.source.scenario_sha256 });
  assert.deepEqual(model.atoms.map(a => a.id), wire.atoms.map(a => a.id));
  assert.deepEqual(model.atoms.map(a => a.declarationPosition), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(model.atoms[3].exactIdentity, { scenarioSha256: wire.source.scenario_sha256, atomId: "atom-0004" });
  assert.equal(model.atoms[5].declaration.expected, false);
  assert.equal(model.atoms[7].declaration.expected, "PASSED");
  assert.equal(model.atoms[7].role, "expectation");
  assert.equal(model.atoms[1].scenarioTimeS, null);
  assert.equal(model.atoms[3].scenarioTimeS, 1);
  assert.equal(model.participants.length, 5);
  assert.equal(model.availability.targetProjection, "not_in_declaration");
  assert.equal(model.availability.runtimeBehavior, "not_in_declaration");
  assert.equal("verdict" in model, false);
});

test("unknown labels, Core array order, equal times and domain-qualified references are preserved", () => {
  const wire = fixture();
  wire.scenario.description = null;
  wire.atoms[3].kind = "future_kind";
  wire.atoms[3].role = "future_role";
  wire.atoms[3].scenario_time_s = 0;
  wire.atoms[4].scenario_time_s = 0;
  wire.atoms[3].references = [{ role: "one", entity: { domain: "commands", id: "same" } }];
  wire.atoms[4].references = [{ role: "two", entity: { domain: "events", id: "same" } }];
  delete wire.boundaries.contains_target_projection;
  const model = buildScenarioUnderstanding(slotFor(wire));
  assert.equal(model.availability.description, "unavailable");
  assert.equal(model.availability.targetProjection, "unavailable");
  assert.equal(model.atoms[3].kind, "future_kind");
  assert.equal(model.atoms[3].role, "future_role");
  assert.equal(model.atoms[3].scenarioTimeS, 0);
  assert.deepEqual(model.participants.filter(p => p.entity.id === "same").map(p => p.entity.domain), ["commands", "events"]);
  assert.deepEqual(model.atoms.map(a => a.id), wire.atoms.map(a => a.id));
});

test("Core failure has diagnostics and no fabricated scenario or partial atoms", () => {
  const wire = fixture();
  Object.assign(wire, { result: "failed", scenario: null, mission: null, atoms: null, atom_count: null,
    diagnostics: [{ severity: "ERROR", code: "OF-SCN-X", file: null, domain: null, object_id: null, message: "Unsupported declaration", suggestion: null }] });
  const model = buildScenarioUnderstanding(slotFor(wire));
  assert.equal(model.result, "failed");
  assert.equal(model.exactIdentity, null);
  assert.equal(model.mission, null);
  assert.deepEqual(model.atoms, []);
  assert.equal(model.diagnostics[0].code, "OF-SCN-X");
  assert.equal(model.hydrationFailure, null);
});

test("retained refresh observation stays distinct from failure and replacement", () => {
  const request = { membership, requestToken: "s2", targetPath: "/r1.yaml", mode: "refresh" };
  const pending = beginScenarioRequest(slotFor(fixture()), request);
  assert.equal(buildScenarioUnderstanding(pending).retainedObservation, true);
  const failed = failScenarioHydration(pending, request, { class: "transport", message: "Disconnected" });
  const model = buildScenarioUnderstanding(failed);
  assert.equal(model.retainedObservation, true);
  assert.equal(model.atoms.length, 8);
  assert.equal(model.hydrationFailure.class, "transport");
  const replacing = beginScenarioRequest(failed, { ...request, mode: "replace", targetPath: "/other.yaml" });
  assert.equal(buildScenarioUnderstanding(replacing).exactIdentity, null);
  assert.equal(buildScenarioUnderstanding(emptyScenarioSlot()).readiness, "unselected");
});

test("malformed JSON and unsupported contract produce typed protocol errors", () => {
  assert.throws(() => consumeScenarioReport("{"), MalformedCoreSurfaceError);
  assert.throws(() => consumeScenarioReport(JSON.stringify({ ...fixture(), declaration_version: "future" })), MalformedCoreSurfaceError);
});
