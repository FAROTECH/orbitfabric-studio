import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import test from "node:test";
const require = createRequire(import.meta.url);
const { mockIPC, clearMocks } = require("@tauri-apps/api/mocks");
const { TauriCoreGateway } = require("../../.test-dist/core/TauriCoreGateway.js");
const { MissionHydrator } = require("../../.test-dist/mission/MissionHydrator.js");
const { ScenarioHydrator } = require("../../.test-dist/convergence/ScenarioHydrator.js");
const { requestScenario } = require("../../.test-dist/convergence/requestScenario.js");
const { buildScenarioUnderstanding } = require("../../.test-dist/convergence/scenarioUnderstanding.js");
const { presentScenarioAtom } = require("../../.test-dist/features/scenarios/scenarioPresentation.js");
const { initialStudioState, studioReducer } = require("../../.test-dist/app/studioState.js");

test("native R1 invocations traverse the actual gateway, hydrators, reducer and understanding model", async () => {
  const output = process.env.ORBITFABRIC_STUDIO_R1_OUTPUT;
  assert.ok(output, "acceptance output must be supplied");
  const loaded = JSON.parse(readFileSync(join(output, "native-loaded.json"), "utf8"));
  const failed = JSON.parse(readFileSync(join(output, "native-failed.json"), "utf8"));
  const reports = JSON.parse(readFileSync(".sp2-acceptance/reports.json", "utf8"));
  let scenarioResponse = loaded;
  const calls = [];
  global.window = {};
  mockIPC((command, args) => {
    calls.push({ command, args });
    if (command === "resolve_mission_source") return { selectedPath: reports.missionPath, missionDir: reports.missionPath };
    if (command === "clear_core_request_temp") return null;
    if (command === "run_core_export_scenario_declaration") return scenarioResponse;
    assert.ok(Object.hasOwn(reports.invocations, command), `unexpected command: ${command}`);
    return reports.invocations[command];
  });
  try {
    const core = new TauriCoreGateway();
    const missionHydrator = new MissionHydrator(core);
    const session = await missionHydrator.openPrimary({ selectedPath: reports.missionPath, executable: "orbitfabric", requestId: "r1-native", generation: 1 });
    let state = initialStudioState;
    const dispatch = action => { state = studioReducer(state, action); };
    dispatch({ type: "MISSION_OPEN_REQUESTED", opening: { requestId: session.sessionId, generation: 1 } });
    dispatch({ type: "MISSION_PRIMARY_COMMITTED", session });
    const hydrator = new ScenarioHydrator(core);
    await requestScenario(hydrator, dispatch, session, reports.scenarioPath, "replace", "native-s1");
    const model = buildScenarioUnderstanding(state.scenario);
    assert.equal(model.exactIdentity.scenarioId, "payload_stop_acquisition_verification");
    assert.equal(model.exactIdentity.scenarioSha256, "b19ff6e1cf3c45cdb81e239d30aad97e8b6f037703c06f27102b762e69a1146a");
    assert.deepEqual(model.atoms.map(atom => atom.id), Array.from({ length: 8 }, (_, i) => `atom-000${i + 1}`));
    assert.deepEqual(model.atoms[3].references[0].entity, { domain: "commands", id: "payload.stop_acquisition" });
    assert.deepEqual(model.atoms[5].references[0].entity, { domain: "telemetry", id: "radiation_payload.acquisition_active" });
    assert.equal(presentScenarioAtom(model.atoms[7]).fields[0].value, "PASSED");
    assert.equal(model.atoms[7].role, "expectation");
    assert.equal(model.availability.runtimeBehavior, "not_in_declaration");
    assert.deepEqual(state.lifecycle, initialStudioState.lifecycle);

    scenarioResponse = failed;
    await requestScenario(hydrator, dispatch, session, reports.scenarioPath, "refresh", "native-s2");
    const negative = buildScenarioUnderstanding(state.scenario);
    assert.equal(negative.result, "failed");
    assert.equal(negative.hydrationFailure, null);
    assert.equal(negative.exactIdentity, null);
    assert.deepEqual(negative.atoms, []);
    assert.ok(negative.diagnostics.length > 0);
    assert.equal(state.activeSession, session);

    scenarioResponse = { ...loaded, reportText: "malformed JSON" };
    await requestScenario(hydrator, dispatch, session, reports.scenarioPath, "refresh", "native-s3");
    assert.equal(state.scenario.hydrationFailure.class, "protocol");
    scenarioResponse = { ...loaded, reportText: null };
    await requestScenario(hydrator, dispatch, session, reports.scenarioPath, "refresh", "native-s4");
    assert.equal(state.scenario.hydrationFailure.class, "transport");
    assert.equal(calls.filter(call => call.command === "run_core_export_scenario_declaration").length, 4);
  } finally { clearMocks(); delete global.window; }
});
