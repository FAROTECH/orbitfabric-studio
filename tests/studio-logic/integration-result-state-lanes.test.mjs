import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { parseIntegrationResult, validateIntegrationResult } = require(
  "../../.test-dist/integrations/result.js",
);
const { assessAdapterInvocation } = require("../../.test-dist/integrations/execution.js");

const REQUEST = {
  operation: "project",
  inputSetManifestPath: "/tmp/input/integration_input_manifest.json",
  profilePath: "/tmp/profile.yaml",
  outputDir: "/tmp/out",
};

function descriptor(resultVersion, protocol, adapterVersion) {
  return {
    manifestPath: "/tmp/package/integration_package.json",
    kind: "orbitfabric.integration_package",
    manifestVersion: resultVersion === "0.1-candidate" ? "0.1-candidate" : "0.2-candidate",
    integrationId: "example-integration",
    adapterId: "example-adapter",
    adapterVersion,
    coreInputCompatibility: {
      inputSetVersions: ["0.1-candidate"],
      surfaces: [],
      relationshipFamilies: [],
    },
    profileCompatibility: { profileVersions: ["0.1-candidate"] },
    resultCompatibility: {
      resultVersions: [resultVersion],
      defaultResultVersion: resultVersion,
    },
    advertisedCapabilities: ["projection"],
    operations: [{ id: "project", capabilities: ["projection"], inputRequirements: [] }],
    profileSchemas: [],
    execution: {
      protocol,
      argvPrefix: ["example-adapter"],
    },
  };
}

function resultText(resultVersion, state, adapterVersion) {
  const inputs = {
    core_input_set: { status: "available" },
    profile: { status: "available", sha256: "profile-sha" },
  };
  if (resultVersion === "0.2-candidate") {
    inputs.operation_inputs = [];
  }

  return JSON.stringify({
    kind: "orbitfabric.integration_result",
    result_version: resultVersion,
    result: state,
    integration: { id: "example-integration", schema_version: resultVersion },
    adapter: { id: "example-adapter", version: adapterVersion },
    operation: { id: "project" },
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

function invocation(text) {
  return {
    operation: "project",
    executable: "example-adapter",
    args: ["run", "--operation", "project"],
    exitCode: 0,
    processCompleted: true,
    timedOut: false,
    stdout: "",
    stderr: "",
    outputDir: "/tmp/out",
    resultPath: "/tmp/out/integration_result.json",
    resultText: text,
  };
}

test("frozen Result v0 retains succeeded_with_warnings as a valid success state", () => {
  const text = resultText("0.1-candidate", "succeeded_with_warnings", "1.2.3");
  const parsed = parseIntegrationResult(text);
  const validation = validateIntegrationResult(parsed);

  assert.equal(validation.usable, true, validation.issues.map((item) => item.message).join("\n"));

  const assessment = assessAdapterInvocation(
    descriptor("0.1-candidate", "orbitfabric.adapter_cli.v0", "1.2.3"),
    REQUEST,
    invocation(text),
    null,
  );
  assert.equal(assessment.valid, true, assessment.issues.map((item) => item.message).join("\n"));
});

test("Result v1 rejects succeeded_with_warnings and propagates the contract failure", () => {
  const text = resultText("0.2-candidate", "succeeded_with_warnings", "2.0.0-dev.1");
  const parsed = parseIntegrationResult(text);
  const validation = validateIntegrationResult(parsed);

  assert.equal(validation.usable, false);
  assert.ok(validation.issues.some((item) => item.code === "result.state"));

  const assessment = assessAdapterInvocation(
    descriptor("0.2-candidate", "orbitfabric.adapter_cli.v1", "2.0.0-dev.1"),
    REQUEST,
    invocation(text),
    null,
  );
  assert.equal(assessment.valid, false);
  assert.ok(assessment.issues.some((item) => item.code === "result.result.state"));
});
