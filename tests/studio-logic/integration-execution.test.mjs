import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const {
  assessAdapterInvocation,
  createExecutionAuthorization,
  validateAdapterRunPreflight,
  validateExecutionAuthorization,
} = require("../../.test-dist/integrations/execution.js");

const DESCRIPTOR = {
  manifestPath: "/tmp/package/integration_package.json",
  kind: "orbitfabric.integration_package",
  manifestVersion: "0.1-candidate",
  integrationId: "example-integration",
  adapterId: "example-adapter",
  adapterVersion: "1.2.3",
  coreInputCompatibility: {
    inputSetVersions: ["0.1-candidate"],
    surfaces: [],
    relationshipFamilies: [],
  },
  profileCompatibility: { profileVersions: ["0.1-candidate"] },
  resultCompatibility: {
    resultVersions: ["0.1-candidate"],
    defaultResultVersion: "0.1-candidate",
  },
  advertisedCapabilities: ["projection"],
  operations: [{ id: "project", capabilities: ["projection"] }],
  profileSchemas: [],
  execution: {
    protocol: "orbitfabric.adapter_cli.v0",
    argvPrefix: ["example-adapter", "--fixed-prefix"],
  },
};

const REQUEST = {
  operation: "project",
  inputSetManifestPath: "/tmp/input/integration_input_manifest.json",
  profilePath: "/tmp/profile.yaml",
  outputDir: "/tmp/out",
};

function resultText(state = "succeeded", overrides = {}) {
  const root = {
    kind: "orbitfabric.integration_result",
    result_version: "0.1-candidate",
    result: state,
    integration: { id: "example-integration", schema_version: "0.1-candidate" },
    adapter: { id: "example-adapter", version: "1.2.3" },
    operation: { id: "project" },
    mission: { status: "available" },
    inputs: {
      core_input_set: { status: "available" },
      profile: { status: "available", sha256: "profile-sha" },
    },
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
    ...overrides,
  };
  return JSON.stringify(root);
}

function invocation(exitCode, text) {
  return {
    operation: "project",
    executable: "example-adapter",
    args: ["--fixed-prefix", "run", "--operation", "project"],
    exitCode,
    processCompleted: true,
    timedOut: false,
    stdout: "human log only",
    stderr: "",
    outputDir: "/tmp/out",
    resultPath: "/tmp/out/integration_result.json",
    resultText: text,
  };
}

test("execution authorization is bound to exact package identity and argv prefix", () => {
  const authorization = createExecutionAuthorization(DESCRIPTOR);
  assert.deepEqual(validateExecutionAuthorization(DESCRIPTOR, authorization), []);

  const changed = { ...authorization, argvPrefix: ["other-adapter"] };
  assert.ok(
    validateExecutionAuthorization(DESCRIPTOR, changed).some((item) => item.includes("argv prefix")),
  );
});

test("preflight rejects unknown operations and unsupported protocols without guessing", () => {
  const authorization = createExecutionAuthorization(DESCRIPTOR);
  const unknown = validateAdapterRunPreflight(
    DESCRIPTOR,
    authorization,
    { ...REQUEST, operation: "guessed-operation" },
  );
  assert.ok(unknown.some((item) => item.includes("exactly one advertised operation")));

  const wrongProtocol = {
    ...DESCRIPTOR,
    execution: { ...DESCRIPTOR.execution, protocol: "future.protocol" },
  };
  const protocolErrors = validateAdapterRunPreflight(wrongProtocol, authorization, REQUEST);
  assert.ok(protocolErrors.some((item) => item.includes("Unsupported integration execution protocol")));
});

test("exit zero without Integration Result is a protocol violation", () => {
  const assessment = assessAdapterInvocation(DESCRIPTOR, REQUEST, invocation(0, null), null);
  assert.equal(assessment.valid, false);
  assert.ok(assessment.issues.some((item) => item.code === "protocol.zero_without_result"));
});

test("exit zero with failed Result is a protocol violation", () => {
  const assessment = assessAdapterInvocation(
    DESCRIPTOR,
    REQUEST,
    invocation(0, resultText("failed")),
    null,
  );
  assert.equal(assessment.valid, false);
  assert.ok(assessment.issues.some((item) => item.code === "protocol.zero_failed_result"));
});

test("non-zero exit with successful Result is a protocol violation", () => {
  const assessment = assessAdapterInvocation(
    DESCRIPTOR,
    REQUEST,
    invocation(7, resultText("succeeded")),
    null,
  );
  assert.equal(assessment.valid, false);
  assert.ok(assessment.issues.some((item) => item.code === "protocol.nonzero_success_result"));
});

test("non-zero exit with failed Result is a valid failed operation", () => {
  const assessment = assessAdapterInvocation(
    DESCRIPTOR,
    REQUEST,
    invocation(7, resultText("failed")),
    null,
  );
  assert.equal(assessment.valid, true, assessment.issues.map((item) => item.message).join("\n"));
  assert.equal(assessment.result.result, "failed");
});

test("Result identity must match exact requested operation and executed adapter", () => {
  const text = resultText("succeeded", {
    adapter: { id: "different-adapter", version: "1.2.3" },
    operation: { id: "different-operation" },
  });
  const assessment = assessAdapterInvocation(DESCRIPTOR, REQUEST, invocation(0, text), null);
  assert.equal(assessment.valid, false);
  assert.ok(assessment.issues.some((item) => item.code === "protocol.adapter_identity"));
  assert.ok(assessment.issues.some((item) => item.code === "protocol.operation_identity"));
});

test("timeout remains a transport failure and is not inferred from stdout or stderr", () => {
  const timedOut = { ...invocation(null, null), processCompleted: false, timedOut: true, stdout: "succeeded" };
  const assessment = assessAdapterInvocation(DESCRIPTOR, REQUEST, timedOut, null);
  assert.equal(assessment.valid, false);
  assert.ok(assessment.issues.some((item) => item.code === "transport.incomplete"));
  assert.equal(assessment.result, null);
});
