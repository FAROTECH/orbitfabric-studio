import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const {
  evaluateIntegrationCompatibility,
  parseCoreIntegrationInputManifest,
} = require("../../.test-dist/integrations/compatibility.js");
const { parseIntegrationPackageManifest } = require("../../.test-dist/integrations/manifest.js");
const {
  parseIntegrationResult,
  validateIntegrationResult,
} = require("../../.test-dist/integrations/result.js");
const { IntegrationPackageRegistry } = require("../../.test-dist/integrations/registry.js");

const PACKAGE = {
  kind: "orbitfabric.integration_package",
  manifest_version: "0.1-candidate",
  integration: { id: "example-integration" },
  adapter: { id: "example-adapter", version: "0.1.0" },
  core_input_compatibility: {
    input_set_versions: ["0.1-candidate"],
    surfaces: [
      { role: "mission_snapshot", kind: "orbitfabric.mission_snapshot", format_versions: ["0.1-candidate"] },
      { role: "entity_index", kind: "orbitfabric.entity_index", format_versions: ["0.1"] },
    ],
    relationship_families: [],
  },
  profile_compatibility: { profile_versions: ["0.1-candidate"] },
  result_compatibility: {
    result_versions: ["0.1-candidate"],
    default_result_version: "0.1-candidate",
  },
  capabilities: ["profile_validation", "projection", "artifact_generation", "traceability"],
  operations: [
    { id: "project", capabilities: ["profile_validation", "projection", "artifact_generation", "traceability"] },
  ],
  profile_schemas: [
    {
      schema_version: "0.1-candidate",
      format: "json-schema-2020-12",
      path: "schemas/profile.json",
      sha256: "0123456789abcdef",
    },
  ],
  execution: { protocol: "orbitfabric.adapter_cli.v0", argv_prefix: ["example-adapter"] },
};

function vNextPackage() {
  const value = structuredClone(PACKAGE);
  value.manifest_version = "0.2-candidate";
  value.adapter.version = "0.2.0.dev1";
  value.result_compatibility = {
    result_versions: ["0.2-candidate"],
    default_result_version: "0.2-candidate",
  };
  value.operations[0].input_requirements = [];
  value.execution.protocol = "orbitfabric.adapter_cli.v1";
  return value;
}

const INPUT = {
  kind: "orbitfabric.integration_input_set",
  input_set_version: "0.1-candidate",
  input_set_sha256: "core-sha",
  orbitfabric_version: "1.1.0",
  mission: { id: "demo", model_version: "1" },
  load_result: "loaded",
  lint_result: "passed",
  surfaces: [
    {
      role: "mission_snapshot",
      requirement: "required",
      status: "available",
      kind: "orbitfabric.mission_snapshot",
      format_version: "0.1-candidate",
      path: "mission_snapshot.json",
      sha256: "a",
      unavailable_reason: null,
    },
    {
      role: "entity_index",
      requirement: "required",
      status: "available",
      kind: "orbitfabric.entity_index",
      format_version: "0.1",
      path: "entity_index.json",
      sha256: "b",
      unavailable_reason: null,
    },
  ],
};

function resultFixture() {
  return {
    kind: "orbitfabric.integration_result",
    result_version: "0.1-candidate",
    result: "succeeded",
    integration: { id: "example-integration", schema_version: "0.1-candidate" },
    adapter: { id: "example-adapter", version: "0.1.0" },
    operation: { id: "project" },
    mission: { status: "available", id: "demo", model_version: "1", reason: null },
    inputs: {
      core_input_set: { status: "available", kind: "orbitfabric.integration_input_set", version: "0.1-candidate", sha256: "core-sha", reason: null },
      profile: { status: "available", kind: "orbitfabric.projection_profile", profile_version: "0.1-candidate", id: "p", version: "1", sha256: "profile-sha", reason: null },
    },
    capabilities: ["profile_validation", "projection", "artifact_generation", "traceability"],
    artifacts: [
      {
        id: "artifact.contract",
        kind: "contract",
        requirement: "required",
        status: "generated",
        path: "artifacts/contract.h",
        media_type: "text/x-c",
        sha256: "artifact-sha",
        reason: null,
        retained_partial: false,
        derived_from_mappings: ["mapping.tm.voltage"],
      },
    ],
    mappings: [
      {
        id: "mapping.tm.voltage",
        sources: [{ domain: "telemetry", id: "eps.voltage" }],
        profile_bindings: ["tm.voltage"],
        targets: [{ namespace: "example", kind: "parameter", id: "VOLTAGE" }],
      },
    ],
    resolutions: [
      {
        id: "resolution.tm.voltage.name",
        mapping: "mapping.tm.voltage",
        binding: "tm.voltage",
        sources: [{ domain: "telemetry", id: "eps.voltage" }],
        property: "target.name",
        value: "VOLTAGE",
        origin: "profile",
      },
    ],
    diagnostics: [],
    coverage: {
      status: "complete",
      scope: { domains: ["telemetry"] },
      reason: null,
      summary: { projected: 1, not_projected: 1 },
      records: [
        {
          source: { domain: "telemetry", id: "eps.voltage" },
          state: "projected",
          mappings: ["mapping.tm.voltage"],
          profile_bindings: ["tm.voltage"],
          diagnostics: [],
          reason: null,
        },
        {
          source: { domain: "telemetry", id: "eps.current" },
          state: "not_projected",
          mappings: [],
          profile_bindings: [],
          diagnostics: [],
          reason: "No authored projection",
        },
      ],
    },
    evidence: [],
    external_tools: [],
  };
}

test("parses generic Integration Package manifest without target-specific semantics", () => {
  const descriptor = parseIntegrationPackageManifest("/tmp/integration_package.json", JSON.stringify(PACKAGE));
  assert.equal(descriptor.integrationId, "example-integration");
  assert.equal(descriptor.execution.protocol, "orbitfabric.adapter_cli.v0");
  assert.deepEqual(descriptor.operations[0].capabilities, descriptor.advertisedCapabilities);
  assert.deepEqual(descriptor.operations[0].inputRequirements, []);
});

test("accepts the explicit zero-input vNext lab package lane", () => {
  const descriptor = parseIntegrationPackageManifest(
    "/tmp/integration_package.json",
    JSON.stringify(vNextPackage()),
  );
  assert.equal(descriptor.manifestVersion, "0.2-candidate");
  assert.equal(descriptor.execution.protocol, "orbitfabric.adapter_cli.v1");
  assert.deepEqual(descriptor.operations[0].inputRequirements, []);
});

test("accepts the minimal G4 role-only operation-input requirement", () => {
  const value = vNextPackage();
  value.operations.push({
    id: "verification_projection",
    capabilities: ["projection", "artifact_generation", "traceability"],
    input_requirements: [{ role: "scenario" }],
  });
  const descriptor = parseIntegrationPackageManifest("/tmp/g4.json", JSON.stringify(value));
  assert.deepEqual(descriptor.operations[1].inputRequirements, [{ role: "scenario" }]);
});

test("G4 does not silently generalize the operation-input requirement shape", () => {
  const overStructured = vNextPackage();
  overStructured.operations[0].input_requirements = [{ role: "scenario", required: true }];
  assert.throws(
    () => parseIntegrationPackageManifest("/tmp/g4.json", JSON.stringify(overStructured)),
    /must contain exactly the v1 role field/,
  );

  const duplicate = vNextPackage();
  duplicate.operations[0].input_requirements = [{ role: "scenario" }, { role: "scenario" }];
  assert.throws(
    () => parseIntegrationPackageManifest("/tmp/g4.json", JSON.stringify(duplicate)),
    /at most one role/,
  );

  const unknownRole = vNextPackage();
  unknownRole.operations[0].input_requirements = [{ role: "adapter_private" }];
  assert.throws(
    () => parseIntegrationPackageManifest("/tmp/v1.json", JSON.stringify(unknownRole)),
    /role must be scenario/,
  );
});

test("keeps frozen v0 and vNext protocol identities isolated", () => {
  const v0WithVNextProtocol = structuredClone(PACKAGE);
  v0WithVNextProtocol.execution.protocol = "orbitfabric.adapter_cli.v1";
  assert.throws(
    () => parseIntegrationPackageManifest("/tmp/v0.json", JSON.stringify(v0WithVNextProtocol)),
    /requires execution protocol orbitfabric\.adapter_cli\.v0/,
  );

  const vNextWithV0Protocol = vNextPackage();
  vNextWithV0Protocol.execution.protocol = "orbitfabric.adapter_cli.v0";
  assert.throws(
    () => parseIntegrationPackageManifest("/tmp/vnext.json", JSON.stringify(vNextWithV0Protocol)),
    /requires execution protocol orbitfabric\.adapter_cli\.v1/,
  );
});

test("does not silently extend frozen v0 with operation-input declarations", () => {
  const invalid = structuredClone(PACKAGE);
  invalid.operations[0].input_requirements = [];
  assert.throws(
    () => parseIntegrationPackageManifest("/tmp/v0.json", JSON.stringify(invalid)),
    /not part of frozen Integration Package manifest v0/,
  );
});

test("rejects escaping Profile schema paths before package execution", () => {
  const invalid = structuredClone(PACKAGE);
  invalid.profile_schemas[0].path = "../escape.json";
  assert.throws(
    () => parseIntegrationPackageManifest("/tmp/integration_package.json", JSON.stringify(invalid)),
    /package-relative/,
  );
});

test("evaluates package compatibility only from declared static contracts", () => {
  const descriptor = parseIntegrationPackageManifest("/tmp/integration_package.json", JSON.stringify(PACKAGE));
  const input = parseCoreIntegrationInputManifest(JSON.stringify(INPUT));
  assert.deepEqual(evaluateIntegrationCompatibility(descriptor, input), {
    state: "compatible",
    reasons: [],
  });

  const incompatible = structuredClone(INPUT);
  incompatible.surfaces[0].format_version = "future";
  const evaluation = evaluateIntegrationCompatibility(
    descriptor,
    parseCoreIntegrationInputManifest(JSON.stringify(incompatible)),
  );
  assert.equal(evaluation.state, "incompatible");
  assert.ok(evaluation.reasons.some((reason) => reason.code === "surface.version"));
});

test("complete coverage accounting can contain not_projected entities", () => {
  const parsed = parseIntegrationResult(JSON.stringify(resultFixture()));
  const bundle = {
    resultPath: "/tmp/result/integration_result.json",
    resultText: JSON.stringify(resultFixture()),
    artifactChecks: [
      {
        artifactId: "artifact.contract",
        path: "artifacts/contract.h",
        exists: true,
        sha256Matches: true,
        contained: true,
      },
    ],
  };
  const validation = validateIntegrationResult(parsed, bundle);
  assert.equal(validation.usable, true);
  assert.deepEqual(parsed.inputs.operationInputs, []);
  assert.equal(parsed.coverage.status, "complete");
  assert.deepEqual(parsed.coverage.summary, { projected: 1, not_projected: 1 });
});

test("accepts explicit empty operation-input provenance only in vNext Result", () => {
  const next = resultFixture();
  next.result_version = "0.2-candidate";
  next.adapter.version = "0.2.0.dev1";
  next.inputs.operation_inputs = [];

  const parsed = parseIntegrationResult(JSON.stringify(next));
  assert.equal(parsed.resultVersion, "0.2-candidate");
  assert.deepEqual(parsed.inputs.operationInputs, []);
  assert.equal(validateIntegrationResult(parsed).usable, true);
});

test("accepts exact available G4 consumed Scenario provenance", () => {
  const next = resultFixture();
  next.result_version = "0.2-candidate";
  next.adapter.version = "0.2.0.dev2";
  next.operation = { id: "verification_projection" };
  next.inputs.operation_inputs = [
    {
      role: "scenario",
      status: "available",
      id: "scenario.ping",
      sha256: "abc123",
      reason: null,
    },
  ];

  const parsed = parseIntegrationResult(JSON.stringify(next));
  assert.deepEqual(parsed.inputs.operationInputs, [
    {
      role: "scenario",
      status: "available",
      id: "scenario.ping",
      sha256: "abc123",
      reason: null,
    },
  ]);
  assert.equal(validateIntegrationResult(parsed).usable, true);
});

test("G4 consumed provenance fails closed on invented fields and invalid availability", () => {
  const extra = resultFixture();
  extra.result_version = "0.2-candidate";
  extra.inputs.operation_inputs = [
    {
      role: "scenario",
      status: "available",
      id: "scenario.ping",
      sha256: "abc123",
      reason: null,
      path: "/tmp/scenario.yaml",
    },
  ];
  assert.throws(
    () => parseIntegrationResult(JSON.stringify(extra)),
    /must contain exactly role, status, id, sha256 and reason/,
  );

  const unavailableSuccess = resultFixture();
  unavailableSuccess.result_version = "0.2-candidate";
  unavailableSuccess.inputs.operation_inputs = [
    {
      role: "scenario",
      status: "unavailable",
      id: null,
      sha256: null,
      reason: "not resolved",
    },
  ];
  const validation = validateIntegrationResult(
    parseIntegrationResult(JSON.stringify(unavailableSuccess)),
  );
  assert.equal(validation.usable, false);
  assert.ok(
    validation.issues.some((issue) => issue.code === "operation_input.success_without_provenance"),
  );
});

test("does not silently extend frozen Result v0 with operation-input provenance", () => {
  const invalid = resultFixture();
  invalid.inputs.operation_inputs = [];
  assert.throws(
    () => parseIntegrationResult(JSON.stringify(invalid)),
    /not part of frozen Integration Result v0/,
  );
});

test("Result integrity detects broken mapping and artifact references", () => {
  const broken = resultFixture();
  broken.artifacts[0].derived_from_mappings = ["mapping.missing"];
  broken.coverage.records[0].mappings = ["mapping.missing"];
  const validation = validateIntegrationResult(parseIntegrationResult(JSON.stringify(broken)));
  assert.equal(validation.usable, false);
  assert.ok(validation.issues.some((issue) => issue.code === "artifact.mapping_ref"));
  assert.ok(validation.issues.some((issue) => issue.code === "coverage.mapping_ref"));
});

test("Result integrity does not trust Profile binding refs without Profile provenance", () => {
  const broken = resultFixture();
  broken.result = "failed";
  broken.inputs.profile.status = "unavailable";
  broken.inputs.profile.id = null;
  const validation = validateIntegrationResult(parseIntegrationResult(JSON.stringify(broken)));
  assert.equal(validation.usable, false);
  assert.ok(
    validation.issues.some((issue) => issue.code === "profile.binding_without_provenance"),
  );
});

test("registry is explicit, deterministic and keeps degraded package entries", () => {
  const registry = new IntegrationPackageRegistry();
  const descriptor = parseIntegrationPackageManifest("/z/package.json", JSON.stringify(PACKAGE));
  registry.register({ manifestPath: "/z/package.json", descriptor, error: null });
  registry.register({ manifestPath: "/a/broken.json", descriptor: null, error: "invalid JSON" });

  assert.deepEqual(
    registry.list().map((item) => item.manifestPath),
    ["/a/broken.json", "/z/package.json"],
  );
  assert.equal(registry.get("/a/broken.json")?.error, "invalid JSON");

  registry.unregister("/z/package.json");
  assert.equal(registry.get("/z/package.json"), undefined);
});
