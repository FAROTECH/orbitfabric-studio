import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
const require = createRequire(import.meta.url);
const { consumeScenarioReport } = require("../../.test-dist/convergence/scenarioProtocol.js");
const { ScenarioHydrator } = require("../../.test-dist/convergence/ScenarioHydrator.js");
const { requestScenario } = require("../../.test-dist/convergence/requestScenario.js");
const { initialStudioState, studioReducer } = require("../../.test-dist/app/studioState.js");
const { emptyMissionReadModel } = require("../../.test-dist/mission/MissionSession.js");
const { presentScenarioAtom, declarationFields } = require("../../.test-dist/features/scenarios/scenarioPresentation.js");
const { buildScenarioUnderstanding } = require("../../.test-dist/convergence/scenarioUnderstanding.js");
const wire = JSON.parse(readFileSync("tests/fixtures/convergence/r1-scenario-declaration.json", "utf8"));
const declaration = consumeScenarioReport(JSON.stringify(wire));
function session(generation = 1) {
  return { sessionId: `mission-${generation}`, generation, core: { executable: "orbitfabric" },
    snapshot: { mission: { id: wire.mission.id, model_version: wire.mission.model_version }, model: null },
    readModel: emptyMissionReadModel() };
}
function harness(gateway) {
  const s = session();
  let state = { ...initialStudioState, activeSession: s };
  const dispatch = a => { state = studioReducer(state, a); };
  return { s, dispatch, state: () => state, hydrator: new ScenarioHydrator({ clearRequestTemp: async () => {}, ...gateway }) };
}
test("UI request coordinator uses real SP1 reducer and preserves domain-qualified navigation", async () => {
  const h = harness({ exportScenarioDeclaration: async () => ({ surface: declaration }) });
  await requestScenario(h.hydrator, h.dispatch, h.s, "/r1.yaml", "replace", "s1");
  assert.equal(h.state().scenario.accepted.declaration.scenario.id, wire.scenario.id);
  const model = buildScenarioUnderstanding(h.state().scenario);
  h.dispatch({ type: "WORKSPACE_VIEW_CHANGED", view: "scenarios" });
  h.dispatch({ type: "SELECTION_CHANGED", origin: "scenarios", subject: model.atoms[3].references[0].entity });
  assert.deepEqual(h.state().selection.subject, { domain: "commands", id: "payload.stop_acquisition" });
  assert.equal(h.state().view, "scenarios");
  assert.deepEqual(h.state().lifecycle, initialStudioState.lifecycle);
});
test("transport, protocol and consistency failures remain separate through the UI coordinator", async () => {
  for (const [expected, exportScenarioDeclaration] of [
    ["transport", async () => { throw new Error("Process unavailable"); }],
    ["protocol", async () => ({ surface: consumeScenarioReport("not JSON") })],
    ["consistency", async () => ({ surface: { ...declaration, mission: { id: "other", modelVersion: "1" } } })],
  ]) {
    const h = harness({ exportScenarioDeclaration });
    await requestScenario(h.hydrator, h.dispatch, h.s, "/r1.yaml", "replace", "s1");
    assert.equal(h.state().scenario.hydrationFailure.class, expected);
    assert.equal(h.state().activeSession, h.s);
  }
});
test("request completing after a new mission generation cannot populate understanding", async () => {
  let finish;
  const h = harness({ exportScenarioDeclaration: () => new Promise(resolve => { finish = resolve; }) });
  const pending = requestScenario(h.hydrator, h.dispatch, h.s, "/r1.yaml", "replace", "s1");
  const next = session(2);
  h.dispatch({ type: "MISSION_OPEN_REQUESTED", opening: { requestId: next.sessionId, generation: 2 } });
  h.dispatch({ type: "MISSION_PRIMARY_COMMITTED", session: next });
  finish({ surface: declaration });
  await pending;
  assert.equal(buildScenarioUnderstanding(h.state().scenario).exactIdentity, null);
  assert.equal(h.state().scenario.hydrationFailure, null);
});
test("presentation preserves false, zero, nested values and labels expected status", () => {
  const h = { ...initialStudioState.scenario, accepted: { declaration, targetPath: "/r1.yaml" } };
  const model = buildScenarioUnderstanding(h);
  const expected = presentScenarioAtom(model.atoms[7]);
  assert.equal(expected.title, "Scenario status expectation");
  assert.deepEqual(expected.fields, [{ name: "expected", value: "PASSED" }]);
  assert.equal(presentScenarioAtom(model.atoms[1]).declaredTime, null);
  assert.deepEqual(declarationFields({ zero: 0, false: false, nested: [1, 2] }), [
    { name: "zero", value: "0" }, { name: "false", value: "false" }, { name: "nested", value: "[\n  1,\n  2\n]" },
  ]);
});
