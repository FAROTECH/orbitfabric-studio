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
  operations: [{ id: "project", capabilities: ["projection"], inputRequirements: [] }],
  profileSchemas: [],
  execution: {
    protocol: "orbitfabric.adapter_cli.v0",
    argvPrefix: ["example-adapter", "--fixed-prefix"],
  },
};

function vNextDescriptor() {
  return {
    ...DESCRIPTOR,
    manifestVersion: "0.2-lab",
    adapterVersion: "2.0.0-dev.1",
    resultCompatibility: {
      resultVersions: ["0.2-lab"],
      defaultResultVersion: "0.2-lab",
    },
    operations: [{ id: "project", capabilities: ["projection"], inputRequirements: [] }],
    execution: {
      ...DESCRIPTOR.execution,
      protocol: "orbitfabric.adapter_cli.vnext-lab",
    },
  };
}

function g4Descriptor() {
  const descriptor = vNextDescriptor();
  descriptor.adapterVersion = "0.2.0.dev2";
  descriptor.operations = [
    { id: "project", capabilities: ["projection"], inputRequirements: [] },
    {
      id: "verification_projection",
      capabilities: ["projection"],
      inputRequirements: [{ role: "scenario" }],
    },
  ];
  return descriptor;
}

const REQUEST = {
  operation: "project",
  inputSetManifestPath: "/tmp/input/integration_input_manifest.json",
  profilePath: "/tmp/profile.yaml",
  outputDir: "/tmp/out",
};

const G4_REQUEST = {
  ...REQUEST,
  operation: "verification_projection",
  operationInputs: [{ role: "scenario", path: "/tmp/scenario.yaml" }],
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

function invocation(exitCode, text, operation = "project") {
  return {
    operation,
    executable: "example-adapter",
    args: ["--fixed-prefix", "run", "--operation", operation],
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

test("execution authorization is bound to exact package identity, protocol and argv prefix", () => {
  const authorization = createExecutionAuthorization(DESCRIPTOR);
  assert.deepEqual(validateExecutionAuthorization(DESCRIPTOR, authorization), []);

  const changedArgv = { ...authorization, argvPrefix: ["other-adapter"] };
  assert.ok(
    validateExecutionAuthorization(DESCRIPTOR, changedArgv).some((item) => item.includes("argv prefix")),
  );

  const changedProtocol = { ...authorization, protocol: "orbitfabric.adapter_cli.vnext-lab" };
  assert.ok(
    validateExecutionAuthorization(DESCRIPTOR, changedProtocol).some((item) => item.includes("protocol")),
  );
});

test("preflight accepts both frozen v0 and explicit zero-input vNext lanes", () => {
  const v0Authorization = createExecutionAuthorization(DESCRIPTOR);
  assert.deepEqual(validateAdapterRunPreflight(DESCRIPTOR, v0Authorization, REQUEST), []);

  const vNext = vNextDescriptor();
  const vNextAuthorization = createExecutionAuthorization(vNext);
  assert.deepEqual(validateAdapterRunPreflight(vNext, vNextAuthorization, REQUEST), []);
});

test("G4 preflight requires an exact role-to-path binding", () => {
  const descriptor = g4Descriptor();
  const authorization = createExecutionAuthorization(descriptor);

  assert.deepEqual(validateAdapterRunPreflight(descriptor, authorization, G4_REQUEST), []);

  const missing = validateAdapterRunPreflight(
    descriptor,
    authorization,
    { ...G4_REQUEST, operationInputs: [] },
  );
  assert.ok(missing.some((item) => item.includes("missing required input roles: scenario")));

  const duplicate = validateAdapterRunPreflight(
    descriptor,
    authorization,
    {
      ...G4_REQUEST,
      operationInputs: [
        { role: "scenario", path: "/tmp/one.yaml" },
        { role: "scenario", path: "/tmp/two.yaml" },
      ],
    },
  );
  assert.ok(duplicate.some((item) => item.includes("bound more than once")));

  const unexpected = validateAdapterRunPreflight(
    descriptor,
    authorization,
    {
      ...G4_REQUEST,
      operationInputs: [{ role: "campaign", path: "/tmp/campaign.yaml" }],
    },
  );
  assert.ok(unexpected.some((item) => item.includes("missing required input roles: scenario")));
  assert.ok(unexpected.some((item) => item.includes("unexpected input roles: campaign")));

  const projectWithScenario = validateAdapterRunPreflight(
    descriptor,
    authorization,
    { ...REQUEST, operationInputs: [{ role: "scenario", path: "/tmp/scenario.yaml" }] },
  );
  assert.ok(projectWithScenario.some((item) => item.includes("unexpected input roles: scenario")));
});

test("preflight rejects unknown operations and unsupported protocols", () => {
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

test("vNext Result with explicit empty operation provenance is accepted by its vNext package", () => {
  const descriptor = vNextDescriptor();
  const text = resultText("succeeded", {
    result_version: "0.2-lab",
    adapter: { id: "example-adapter", version: "2.0.0-dev.1" },
    inputs: {
      core_input_set: { status: "available" },
      profile: { status: "available", sha256: "profile-sha" },
      operation_inputs: [],
    },
  });
  const assessment = assessAdapterInvocation(descriptor, REQUEST, invocation(0, text), null);
  assert.equal(assessment.valid, true, assessment.issues.map((item) => item.message).join("\n"));
  assert.deepEqual(assessment.result.inputs.operationInputs, []);
});

test("G4 successful Result must correlate exact consumed operation-input roles", () => {
  const descriptor = g4Descriptor();
  const text = resultText("succeeded", {
    result_version: "0.2-lab",
    adapter: { id: "example-adapter", version: "0.2.0.dev2" },
    operation: { id: "verification_projection" },
    inputs: {
      core_input_set: { status: "available" },
      profile: { status: "available", sha256: "profile-sha" },
      operation_inputs: [
        {
          role: "scenario",
          status: "available",
          id: "scenario.ping",
          sha256: "scenario-sha",
          reason: null,
        },
      ],
    },
  });
  const assessment = assessAdapterInvocation(
    descriptor,
    G4_REQUEST,
    invocation(0, text, "verification_projection"),
    null,
  );
  assert.equal(assessment.valid, true, assessment.issues.map((item) => item.message).join("\n"));

  const wrongRequest = {
    ...G4_REQUEST,
    operationInputs: [{ role: "campaign", path: "/tmp/campaign.yaml" }],
  };
  const mismatch = assessAdapterInvocation(
    descriptor,
    wrongRequest,
    invocation(0, text, "verification_projection"),
    null,
  );
  assert.equal(mismatch.valid, false);
  assert.ok(mismatch.issues.some((item) => item.code === "protocol.operation_input_roles"));
});

test("timeout remains a transport failure and is not inferred from stdout or stderr", () => {
  const timedOut = { ...invocation(null, null), processCompleted: false, timedOut: true, stdout: "succeeded" };
  const assessment = assessAdapterInvocation(DESCRIPTOR, REQUEST, timedOut, null);
  assert.equal(assessment.valid, false);
  assert.ok(assessment.issues.some((item) => item.code === "transport.incomplete"));
  assert.equal(assessment.result, null);
});
