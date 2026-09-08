import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { parseEvidenceSetManifest, parseScenarioDeclaration } = require(
  "../../.test-dist/convergence/consumer-contracts.js",
);
const {
  currentEvidenceRecords,
  emptyEvidenceSlot,
  reduceEvidenceSlot,
} = require("../../.test-dist/convergence/evidenceSlot.js");

const SCENARIO = readFileSync("tests/fixtures/convergence/r1-scenario-declaration.json", "utf8");
const EVIDENCE = readFileSync("tests/fixtures/convergence/r1-evidence-set.json", "utf8");

const FPRIME_RESULT_SHA = "9e348163162a279eb8e0df3a466b55f2d53a613170782596f4d20cb0b8c08ae9";
const COSMOS_RESULT_SHA = "02e831f236d50531bb290f37b278527615785cfaae675de26ab615d544e365c9";

function membership() {
  return { sessionId: "r1", generation: 1 };
}

function request() {
  return {
    membership: membership(),
    requestToken: "r1-evidence",
    targetPath: "tests/fixtures/convergence/r1-evidence-set.json",
    mode: "replace",
  };
}

function scenarioSlot() {
  return {
    accepted: {
      membership: membership(),
      targetPath: "tests/fixtures/convergence/r1-scenario-declaration.json",
      declaration: parseScenarioDeclaration(SCENARIO),
    },
    pending: null,
    hydrationFailure: null,
  };
}

function resultObservation(resultSha256, integrationId, adapterId, mappings, artifacts) {
  return {
    membership: membership(),
    context: {
      integrationId,
      adapterId,
      adapterVersion: "r1",
      operationId: "project",
    },
    resultPath: `/tmp/${adapterId}/integration_result.json`,
    resultSha256,
    result: {
      mappings: mappings.map((id) => ({ id })),
      artifacts: artifacts.map((id) => ({ id })),
    },
    bundle: {
      resultPath: `/tmp/${adapterId}/integration_result.json`,
      resultText: "{}",
      artifactChecks: [],
    },
  };
}

function integrationSlot() {
  return {
    contexts: new Map([
      [
        "fprime",
        {
          accepted: resultObservation(
            FPRIME_RESULT_SHA,
            "fprime",
            "orbitfabric-fprime-adapter",
            ["mapping.payload-stop"],
            [],
          ),
          pending: null,
          hydrationFailure: null,
        },
      ],
      [
        "cosmos",
        {
          accepted: resultObservation(
            COSMOS_RESULT_SHA,
            "openc3-cosmos",
            "orbitfabric-openc3-cosmos-adapter",
            ["mapping.op-0001", "mapping.op-0002"],
            ["verification.cosmos_procedure"],
          ),
          pending: null,
          hydrationFailure: null,
        },
      ],
    ]),
  };
}

test("R1 Evidence Set resolves every curator-authored subject against exact Scenario and plural Results", () => {
  const manifest = parseEvidenceSetManifest(EVIDENCE);
  const load = request();
  let slot = reduceEvidenceSlot(
    emptyEvidenceSlot(),
    membership(),
    scenarioSlot(),
    integrationSlot(),
    { type: "requested", request: load },
  );
  slot = reduceEvidenceSlot(
    slot,
    membership(),
    scenarioSlot(),
    integrationSlot(),
    {
      type: "ready",
      request: load,
      observation: {
        membership: membership(),
        targetPath: load.targetPath,
        manifestSha256: "a".repeat(64),
        manifest,
      },
    },
  );

  assert.equal(slot.accepted.manifest.evidenceSet.id, "engineering-story-01-r1-retained-evidence");
  assert.equal(slot.accepted.records.length, 3);
  for (const record of slot.accepted.records) {
    assert.ok(record.subjects.length > 0);
    assert.ok(
      record.subjects.every((subject) => subject.state === "current"),
      `${record.record.id}: ${record.subjects.map((subject) => `${subject.subject.type}=${subject.state}`).join(", ")}`,
    );
  }

  assert.deepEqual(
    currentEvidenceRecords(slot).map((record) => record.id),
    ["fprime-native-runtime", "cosmos-runtime", "live-flight-ground-proof"],
  );
});

test("R1 Evidence does not collapse the independent F Prime and COSMOS Result identities", () => {
  const manifest = parseEvidenceSetManifest(EVIDENCE);
  const resultSubjects = manifest.records.flatMap((record) =>
    record.subjects.filter((subject) => subject.type === "integration_result"),
  );

  assert.deepEqual(
    new Set(resultSubjects.map((subject) => subject.resultSha256)),
    new Set([FPRIME_RESULT_SHA, COSMOS_RESULT_SHA]),
  );
});
