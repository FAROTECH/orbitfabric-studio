import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const {
  evidenceRecordsForSubject,
  parseEvidenceSetManifest,
  parseScenarioDeclaration,
} = require("../../.test-dist/convergence/consumer-contracts.js");

const R1_SCENARIO_PATH = "tests/fixtures/convergence/r1-scenario-declaration.json";
const R1_EVIDENCE_PATH = "tests/fixtures/convergence/r1-evidence-set.json";
const R1_SCENARIO_SHA = "b19ff6e1cf3c45cdb81e239d30aad97e8b6f037703c06f27102b762e69a1146a";
const COSMOS_RESULT_SHA = "02e831f236d50531bb290f37b278527615785cfaae675de26ab615d544e365c9";

function fixture(path) {
  return readFileSync(path, "utf8");
}

test("R1 Scenario Declaration consumes the exact eight-source-atom contract", () => {
  const declaration = parseScenarioDeclaration(fixture(R1_SCENARIO_PATH));

  assert.equal(declaration.result, "loaded");
  assert.equal(declaration.source.scenarioSha256, R1_SCENARIO_SHA);
  assert.equal(declaration.scenario.id, "payload_stop_acquisition_verification");
  assert.equal(declaration.mission.id, "of-rm-1");
  assert.equal(declaration.atomCount, 8);
  assert.deepEqual(
    declaration.atoms.map((atom) => atom.id),
    [
      "atom-0001",
      "atom-0002",
      "atom-0003",
      "atom-0004",
      "atom-0005",
      "atom-0006",
      "atom-0007",
      "atom-0008",
    ],
  );

  const command = declaration.atoms.find((atom) => atom.id === "atom-0004");
  assert.equal(command.kind, "command");
  assert.equal(command.scenarioTimeS, 1);
  assert.deepEqual(command.references[0], {
    role: "command",
    entity: { domain: "commands", id: "payload.stop_acquisition" },
  });

  const telemetry = declaration.atoms.find((atom) => atom.id === "atom-0006");
  assert.equal(telemetry.kind, "expect_telemetry");
  assert.deepEqual(telemetry.references[0], {
    role: "telemetry",
    entity: { domain: "telemetry", id: "radiation_payload.acquisition_active" },
  });
});

test("Scenario consumer preserves multi-atom steps without inventing micro-timing", () => {
  const value = JSON.parse(fixture(R1_SCENARIO_PATH));
  value.atoms.push({
    id: "atom-0009",
    role: "expectation",
    kind: "expect_command_status",
    step_index: 0,
    within_step_ordinal: 1,
    scenario_time_s: 1,
    references: [
      {
        role: "command",
        entity: { domain: "commands", id: "payload.stop_acquisition" },
      },
    ],
    declaration: { expected: "ACCEPTED" },
  });
  value.atom_count = 9;

  const declaration = parseScenarioDeclaration(JSON.stringify(value));
  const sameStep = declaration.atoms.filter((atom) => atom.stepIndex === 0);

  assert.equal(sameStep.length, 2);
  assert.deepEqual(
    sameStep.map((atom) => atom.withinStepOrdinal),
    [0, 1],
  );
  assert.deepEqual(
    sameStep.map((atom) => atom.scenarioTimeS),
    [1, 1],
  );
});

test("structured Scenario failure is consumable and partial semantics fail closed", () => {
  const failure = {
    kind: "orbitfabric.scenario_declaration",
    declaration_version: "0.1-candidate",
    orbitfabric_version: "1.3.0",
    result: "failed",
    scenario: null,
    mission: null,
    source: { scenario_sha256: null },
    boundaries: {},
    atom_count: null,
    atoms: null,
    diagnostics: [
      {
        severity: "ERROR",
        code: "OF-SCN-020",
        file: "scenario.yaml",
        domain: "scenario",
        object_id: "broken",
        message: "cannot normalize scenario",
        suggestion: "Use documented Core Scenario semantics.",
      },
    ],
  };

  const parsed = parseScenarioDeclaration(JSON.stringify(failure));
  assert.equal(parsed.result, "failed");
  assert.equal(parsed.atoms, null);
  assert.equal(parsed.diagnostics[0].code, "OF-SCN-020");

  const partial = { ...failure, atoms: [] };
  assert.throws(
    () => parseScenarioDeclaration(JSON.stringify(partial)),
    /must not contain partial Scenario semantics/,
  );
});

test("R1 Evidence Set resolves typed subjects without filename heuristics", () => {
  const manifest = parseEvidenceSetManifest(fixture(R1_EVIDENCE_PATH));

  assert.equal(manifest.evidenceSet.id, "engineering-story-01-r1-retained-evidence");
  assert.equal(manifest.records.length, 3);

  const atom6 = evidenceRecordsForSubject(manifest, {
    type: "scenario_atom",
    scenarioSha256: R1_SCENARIO_SHA,
    atomId: "atom-0006",
  });
  assert.deepEqual(
    atom6.map((record) => record.id).sort(),
    ["cosmos-runtime", "live-flight-ground-proof"],
  );

  const mapping = evidenceRecordsForSubject(manifest, {
    type: "integration_mapping",
    resultSha256: COSMOS_RESULT_SHA,
    mappingId: "mapping.op-0002",
  });
  assert.deepEqual(
    mapping.map((record) => record.id).sort(),
    ["cosmos-runtime", "live-flight-ground-proof"],
  );

  const artifact = evidenceRecordsForSubject(manifest, {
    type: "integration_artifact",
    resultSha256: COSMOS_RESULT_SHA,
    artifactId: "verification.cosmos_procedure",
  });
  assert.deepEqual(artifact.map((record) => record.id), ["live-flight-ground-proof"]);
});

test("R1 evidence Scenario subjects resolve only to declared Scenario identities", () => {
  const declaration = parseScenarioDeclaration(fixture(R1_SCENARIO_PATH));
  const manifest = parseEvidenceSetManifest(fixture(R1_EVIDENCE_PATH));
  assert.equal(declaration.result, "loaded");

  const atomIds = new Set(declaration.atoms.map((atom) => atom.id));
  for (const record of manifest.records) {
    for (const subject of record.subjects) {
      if (subject.type === "scenario_source") {
        assert.equal(subject.scenarioSha256, declaration.source.scenarioSha256);
        assert.equal(subject.scenarioId, declaration.scenario.id);
      }
      if (subject.type === "scenario_atom") {
        assert.equal(subject.scenarioSha256, declaration.source.scenarioSha256);
        assert.equal(atomIds.has(subject.atomId), true, subject.atomId);
      }
    }
  }
});

test("Evidence Set consumer rejects target-specific generic subject fields", () => {
  const value = JSON.parse(fixture(R1_EVIDENCE_PATH));
  value.records[1].subjects[4].cosmos_target = "FPRIME";

  assert.throws(
    () => parseEvidenceSetManifest(JSON.stringify(value)),
    /unsupported field\(s\): cosmos_target/,
  );
});

test("Evidence Set consumer fails closed on unknown subjects and unsafe paths", () => {
  const unknown = JSON.parse(fixture(R1_EVIDENCE_PATH));
  unknown.records[0].subjects[0] = { type: "cosmos_runtime", target: "FPRIME" };
  assert.throws(
    () => parseEvidenceSetManifest(JSON.stringify(unknown)),
    /Unsupported Evidence Set subject type/,
  );

  const unsafe = JSON.parse(fixture(R1_EVIDENCE_PATH));
  unsafe.records[0].content.reference.path = "../fprime-runtime.txt";
  assert.throws(
    () => parseEvidenceSetManifest(JSON.stringify(unsafe)),
    /normalized bundle-relative path/,
  );
});
