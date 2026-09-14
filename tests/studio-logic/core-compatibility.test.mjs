import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const {
  CORE_EXECUTABLE_STORAGE_KEY,
  CoreCompatibilityError,
  STUDIO_CORE_REQUIREMENTS,
  coreConfigurationState,
  evaluateCoreCompatibility,
  parseCoreInterfaceManifest,
  requireCoreDomain,
} = require("../../.test-dist/core/coreCompatibility.js");
const { MissionHydrator } = require("../../.test-dist/mission/MissionHydrator.js");
const { ScenarioHydrator } = require("../../.test-dist/convergence/ScenarioHydrator.js");

const SHA = "e10314cad28a1cfe14cea89f24d334524c7b401a2149c6e63d0d27ceaac8c029";

function manifest(overrides = {}) {
  return {
    kind: "orbitfabric.core_interface",
    interface_version: "0.1-candidate",
    orbitfabric_version: "1.3.0",
    interface_sha256: SHA,
    capabilities: [
      ["mission_snapshot", "orbitfabric.mission_snapshot", "0.1-candidate"],
      ["entity_index", "orbitfabric.entity_index", "0.1"],
      ["relationship_manifest", "orbitfabric.relationship_manifest", "0.1-candidate"],
      ["scenario_declaration", "orbitfabric.scenario_declaration", "0.1-candidate"],
      ["integration_input_set", "orbitfabric.integration_input_set", "0.1-candidate"],
    ].map(([id, contract_kind, contract_version]) => ({
      id, contract_kind, contract_version,
    })),
    ...overrides,
  };
}

function parse(value = manifest()) {
  return parseCoreInterfaceManifest(JSON.stringify(value));
}

test("Studio requirements are explicit and derived only from current consumers", () => {
  assert.deepEqual(
    STUDIO_CORE_REQUIREMENTS.map(item => [
      item.domain, item.id, item.contractKind, item.contractVersion,
    ]),
    [
      ["primary", "mission_snapshot", "orbitfabric.mission_snapshot", "0.1-candidate"],
      ["entities", "entity_index", "orbitfabric.entity_index", "0.1"],
      ["relationships", "relationship_manifest", "orbitfabric.relationship_manifest", "0.1-candidate"],
      ["scenarios", "scenario_declaration", "orbitfabric.scenario_declaration", "0.1-candidate"],
      ["integrations", "integration_input_set", "orbitfabric.integration_input_set", "0.1-candidate"],
    ],
  );
  assert.equal(STUDIO_CORE_REQUIREMENTS.some(item => /adapter|lint|simulation/.test(item.id)), false);
});

test("strict parser accepts the candidate manifest and compatibility ignores fingerprint equality", () => {
  const first = parse();
  const second = parse(manifest({ interface_sha256: "a".repeat(64) }));
  assert.equal(first.orbitfabric_version, "1.3.0");
  assert.equal(first.capabilities.length, 5);
  assert.equal(evaluateCoreCompatibility(first).state, "compatible");
  assert.equal(evaluateCoreCompatibility(second).state, "compatible");
});

test("strict parser preserves distinct protocol failure states", () => {
  const cases = [
    ["not json", "compatibility_response_malformed"],
    [JSON.stringify(manifest({ kind: "wrong" })), "compatibility_protocol_failed"],
    [JSON.stringify(manifest({ interface_version: "9" })), "compatibility_protocol_failed"],
    [JSON.stringify(manifest({ orbitfabric_version: "" })), "version_unavailable"],
    [JSON.stringify(manifest({ interface_sha256: "bad" })), "interface_identity_unavailable"],
    [JSON.stringify(manifest({ capabilities: {} })), "compatibility_response_malformed"],
    [JSON.stringify(manifest({ capabilities: [
      { id: "same", contract_kind: "one", contract_version: "1" },
      { id: "same", contract_kind: "two", contract_version: "2" },
    ] })), "compatibility_response_malformed"],
    [JSON.stringify(manifest({ capabilities: [
      { id: "Invalid-Id", contract_kind: "one", contract_version: "1" },
    ] })), "compatibility_response_malformed"],
  ];
  for (const [wire, expected] of cases) {
    assert.throws(
      () => parseCoreInterfaceManifest(wire),
      error => error instanceof CoreCompatibilityError && error.state === expected,
    );
  }
});

test("missing and wrong capabilities are localized by consumer domain", () => {
  const missingScenario = parse(manifest({
    capabilities: manifest().capabilities.filter(item => item.id !== "scenario_declaration"),
  }));
  const assessment = evaluateCoreCompatibility(missingScenario);
  assert.equal(assessment.state, "known_incompatible");
  assert.equal(assessment.domains.primary.state, "compatible");
  assert.equal(assessment.domains.scenarios.state, "known_incompatible");
  assert.doesNotThrow(() => requireCoreDomain(assessment, "primary"));
  assert.throws(
    () => requireCoreDomain(assessment, "scenarios"),
    error => error.state === "known_incompatible" &&
      error.findings[0].reason === "missing_capability",
  );

  const wrongEntityVersion = manifest();
  wrongEntityVersion.capabilities.find(item => item.id === "entity_index").contract_version = "9";
  const entityAssessment = evaluateCoreCompatibility(parse(wrongEntityVersion));
  assert.equal(entityAssessment.domains.primary.state, "compatible");
  assert.equal(entityAssessment.domains.entities.findings[0].reason, "contract_version_mismatch");
});

test("MissionSession binds one resolved executable and configuration changes wait for a generation", async () => {
  const calls = [];
  const compatibility = evaluateCoreCompatibility(parse());
  const gateway = {
    async resolveCoreExecutable(configuredExecutable) {
      calls.push(["resolve", configuredExecutable]);
      return {
        configuredExecutable,
        resolvedExecutable: configuredExecutable === "orbitfabric"
          ? "/venv/bin/orbitfabric" : "/next/bin/orbitfabric",
      };
    },
    async probeCore(executable) {
      calls.push(["probe", executable.resolvedExecutable]);
      const parsed = parse();
      return { ...executable, orbitfabricVersion: "1.3.0", interfaceVersion: "0.1-candidate",
        interfaceSha256: SHA, capabilities: parsed.capabilities, manifest: parsed, compatibility };
    },
    async resolveMissionSource(selectedPath) {
      return { selectedPath, missionDir: `${selectedPath}/mission` };
    },
    async exportMissionSnapshot(executable) {
      calls.push(["snapshot", executable]);
      return { surface: { kind: "orbitfabric.mission_snapshot", snapshot_version: "0.1-candidate",
        orbitfabric_version: "1.3.0", result: "loaded",
        mission: { id: "m", name: "Mission", model_version: "1" },
        source: { mission_dir: "/m/mission" }, boundaries: {}, diagnostics: [], model: {} } };
    },
    async clearRequestTemp() {},
  };
  const hydrator = new MissionHydrator(gateway);
  const first = await hydrator.openPrimary({ selectedPath: "/m", configuredExecutable: "orbitfabric",
    requestId: "session-1", generation: 1 });
  assert.equal(first.core.configuredExecutable, "orbitfabric");
  assert.equal(first.core.resolvedExecutable, "/venv/bin/orbitfabric");
  assert.deepEqual(calls.slice(0, 3), [
    ["resolve", "orbitfabric"], ["probe", "/venv/bin/orbitfabric"],
    ["snapshot", "/venv/bin/orbitfabric"],
  ]);
  assert.equal(
    coreConfigurationState("orbitfabric", "/new/core", first.core.compatibility.state),
    "configuration_changed",
  );
  assert.equal(first.core.resolvedExecutable, "/venv/bin/orbitfabric");

  const second = await hydrator.openPrimary({ selectedPath: "/m",
    configuredExecutable: "/new/core", requestId: "session-2", generation: 2 });
  assert.equal(second.generation, 2);
  assert.equal(second.core.configuredExecutable, "/new/core");
  assert.equal(second.core.resolvedExecutable, "/next/bin/orbitfabric");
  assert.equal(CORE_EXECUTABLE_STORAGE_KEY, "orbitfabric-studio.core-executable");
});

test("Scenario incompatibility fails before invocation and preserves primary session", async () => {
  const withoutScenario = manifest({
    capabilities: manifest().capabilities.filter(item => item.id !== "scenario_declaration"),
  });
  let invoked = false;
  const session = {
    sessionId: "session-1", generation: 1,
    core: { resolvedExecutable: "/core", compatibility: evaluateCoreCompatibility(parse(withoutScenario)) },
    snapshot: { mission: { id: "m", model_version: "1" } },
  };
  const hydrator = new ScenarioHydrator({
    async exportScenarioDeclaration() { invoked = true; },
    async clearRequestTemp() {},
  });
  await assert.rejects(
    () => hydrator.hydrate(session, "/scenario.yaml", "request"),
    error => error.state === "known_incompatible",
  );
  assert.equal(invoked, false);
  assert.equal(session.snapshot.mission.id, "m");
});
