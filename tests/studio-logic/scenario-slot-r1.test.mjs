import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { parseScenarioDeclaration } = require("../../.test-dist/convergence/consumer-contracts.js");
const {
  emptyScenarioSlot,
  reduceScenarioSlot,
  scenarioExactIdentity,
  scenarioSlotReadiness,
} = require("../../.test-dist/convergence/scenarioSlot.js");

const EXPECTED_SHA = "b19ff6e1cf3c45cdb81e239d30aad97e8b6f037703c06f27102b762e69a1146a";

test("R1 declaration enters the Scenario slot with exact eight-atom accounting", () => {
  const text = readFileSync("tests/fixtures/convergence/r1-scenario-declaration.json", "utf8");
  const declaration = parseScenarioDeclaration(text);
  assert.equal(declaration.result, "loaded");

  const membership = { sessionId: "r1-session", generation: 1 };
  const request = {
    membership,
    requestToken: "R1-S1",
    targetPath: "scenarios/payload_stop_acquisition_verification.yaml",
    mode: "replace",
  };

  let slot = reduceScenarioSlot(emptyScenarioSlot(), membership, {
    type: "requested",
    request,
  });
  slot = reduceScenarioSlot(slot, membership, {
    type: "ready",
    request,
    declaration,
  });

  assert.equal(scenarioSlotReadiness(slot), "loaded");
  assert.deepEqual(scenarioExactIdentity(slot.accepted.declaration), {
    scenarioId: "payload_stop_acquisition_verification",
    scenarioSha256: EXPECTED_SHA,
  });
  assert.equal(slot.accepted.declaration.atomCount, 8);
  assert.deepEqual(
    slot.accepted.declaration.atoms.map((atom) => atom.id),
    ["atom-0001", "atom-0002", "atom-0003", "atom-0004", "atom-0005", "atom-0006", "atom-0007", "atom-0008"],
  );
  assert.deepEqual(slot.accepted.declaration.atoms[3].references[0].entity, {
    domain: "commands",
    id: "payload.stop_acquisition",
  });
  assert.deepEqual(slot.accepted.declaration.atoms[5].references[0].entity, {
    domain: "telemetry",
    id: "radiation_payload.acquisition_active",
  });
});
