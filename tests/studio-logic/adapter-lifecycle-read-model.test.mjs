import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const {
  buildAdapterLifecycleReadModel,
  exactReleaseIdentity,
} = require("../../.test-dist/convergence/adapterLifecycleReadModel.js");
const {
  emptyAdapterLifecycleState,
  reduceCatalogFacet,
  reduceInstalledFacet,
  reducePackageBindingFacet,
  reduceProjectLockFacet,
  reduceVerifyFacet,
} = require("../../.test-dist/convergence/adapterLifecycleSlot.js");

const MEMBER = { sessionId: "session-1", generation: 1 };
const SHA_DESCRIPTOR = "1".repeat(64);
const SHA_ARTIFACT = "2".repeat(64);
const SHA_MANIFEST = "3".repeat(64);
const HISTORICAL = {
  authority: "github.com/FAROTECH",
  publisher: "orbitfabric",
  name: "openc3-cosmos",
};
const CURRENT = {
  authority: "github.com/OrbitFabric",
  publisher: "orbitfabric",
  name: "openc3-cosmos",
};

function request(requestToken, mode = "replace") {
  return { membership: MEMBER, requestToken, mode };
}

function installed(instanceId, sourceCoordinate, releaseVersion) {
  return {
    instanceId,
    sourceCoordinate,
    releaseVersion,
    releaseDescriptorPath: `/state/${instanceId}/release.json`,
    releaseDescriptorSha256: SHA_DESCRIPTOR,
    artifactId: `${instanceId}-wheel`,
    artifactSha256: SHA_ARTIFACT,
    backendId: "python-wheel-managed-env",
    installRoot: `/state/${instanceId}`,
    manifestPath: `/state/${instanceId}/integration_package.json`,
    manifestSha256: SHA_MANIFEST,
    executionArgvPrefix: [`/state/${instanceId}/bin/adapter`],
    acceptancePolicy: "development-explicit-source",
    acceptanceWarnings: [],
  };
}

function verification(instanceId, statuses) {
  const dimension = (status) => ({ status, detail: status === "PASS" ? null : `${status} fixture` });
  return {
    instanceId,
    releaseDescriptorIntegrity: dimension(statuses[0]),
    manifestIntegrity: dimension(statuses[1]),
    manifestConformance: dimension(statuses[2]),
    executionBinding: dimension(statuses[3]),
    backendMaterialization: dimension(statuses[4]),
  };
}

function packageObservation(instanceId) {
  return {
    instanceId,
    manifestPath: `/state/${instanceId}/integration_package.json`,
    manifestSha256: SHA_MANIFEST,
    descriptor: {
      manifestPath: `/state/${instanceId}/integration_package.json`,
      kind: "orbitfabric.integration_package",
      manifestVersion: "0.2-candidate",
      integrationId: `${instanceId}-integration`,
      adapterId: "openc3-cosmos",
      adapterVersion: "0.2.0",
      coreInputCompatibility: { inputSetVersions: [], surfaces: [], relationshipFamilies: [] },
      profileCompatibility: { profileVersions: [] },
      resultCompatibility: { resultVersions: [], defaultResultVersion: "0.2-candidate" },
      advertisedCapabilities: ["project"],
      operations: [{ id: "project", capabilities: ["project"], inputRequirements: [] }],
      profileSchemas: [],
      execution: { protocol: "orbitfabric.adapter_cli.v1", argvPrefix: ["adapter"] },
    },
  };
}

test("SP4 read model preserves historical and current exact authorities without aliasing", () => {
  let state = emptyAdapterLifecycleState();
  const inventoryRequest = request("inventory");
  const historical = installed("historical-instance", HISTORICAL, "0.1.0");
  const current = installed("current-instance", CURRENT, "0.2.0");
  state = reduceInstalledFacet(state, MEMBER, { type: "requested", request: inventoryRequest });
  state = reduceInstalledFacet(state, MEMBER, {
    type: "ready",
    request: inventoryRequest,
    records: [historical, current],
  });

  const model = buildAdapterLifecycleReadModel(state);
  assert.deepEqual(
    model.installed.map((item) => item.identity.display),
    [
      "github.com/FAROTECH:orbitfabric/openc3-cosmos@0.1.0",
      "github.com/OrbitFabric:orbitfabric/openc3-cosmos@0.2.0",
    ],
  );
  assert.equal(model.exactReleaseChoices.length, 2);
  assert.notEqual(model.installed[0].identity.key, model.installed[1].identity.key);
});

test("SP4 read model presents Core comparison and verification dimensions without a synthetic health state", () => {
  let state = emptyAdapterLifecycleState();
  const inventoryRequest = request("inventory");
  const record = installed("instance-1", CURRENT, "0.2.0");
  state = reduceInstalledFacet(state, MEMBER, { type: "requested", request: inventoryRequest });
  state = reduceInstalledFacet(state, MEMBER, { type: "ready", request: inventoryRequest, records: [record] });

  const verifyRequest = { ...request("verify"), target: record.instanceId };
  state = reduceVerifyFacet(state, MEMBER, { type: "requested", request: verifyRequest });
  state = reduceVerifyFacet(state, MEMBER, {
    type: "ready",
    request: verifyRequest,
    report: verification(record.instanceId, ["PASS", "FAIL", "UNKNOWN", "PASS", "PASS"]),
  });

  const lockRequest = { ...request("lock"), target: "/mission/adapter-project-lock.json" };
  const mismatch = {
    sourceCoordinate: CURRENT,
    releaseVersion: "0.2.0",
    status: "MISMATCH",
    matchingInstanceIds: [],
    candidateInstanceIds: [record.instanceId],
    candidateMismatches: [{ instanceId: record.instanceId, dimensions: ["artifact_sha256"] }],
  };
  state = reduceProjectLockFacet(state, MEMBER, { type: "requested", request: lockRequest });
  state = reduceProjectLockFacet(state, MEMBER, {
    type: "ready",
    request: lockRequest,
    report: {
      lockPath: lockRequest.target,
      lockVersion: "0.1-candidate",
      status: "NOT_SATISFIED",
      adapters: [mismatch],
    },
  });

  const model = buildAdapterLifecycleReadModel(state);
  assert.equal(model.installed[0].verification.value.manifestIntegrity.status, "FAIL");
  assert.equal(model.installed[0].verification.value.manifestConformance.status, "UNKNOWN");
  assert.equal(model.installed[0].desiredComparisons[0], mismatch);
  assert.equal(model.desired[0].comparison.status, "MISMATCH");
  assert.equal("health" in model.installed[0], false);
});

test("SP4 operations exist only for the exact accepted digest-bound installed package", () => {
  let state = emptyAdapterLifecycleState();
  const inventoryRequest = request("inventory");
  const bound = installed("bound", CURRENT, "0.2.0");
  const invalid = installed("invalid", HISTORICAL, "0.1.0");
  state = reduceInstalledFacet(state, MEMBER, { type: "requested", request: inventoryRequest });
  state = reduceInstalledFacet(state, MEMBER, {
    type: "ready",
    request: inventoryRequest,
    records: [bound, invalid],
  });

  const boundRequest = {
    ...request("package-bound"),
    instanceId: bound.instanceId,
    manifestPath: bound.manifestPath,
    expectedManifestSha256: bound.manifestSha256,
  };
  state = reducePackageBindingFacet(state, MEMBER, { type: "requested", request: boundRequest });
  state = reducePackageBindingFacet(state, MEMBER, {
    type: "ready",
    request: boundRequest,
    observation: packageObservation(bound.instanceId),
  });

  const invalidRequest = {
    ...request("package-invalid"),
    instanceId: invalid.instanceId,
    manifestPath: invalid.manifestPath,
    expectedManifestSha256: invalid.manifestSha256,
  };
  state = reducePackageBindingFacet(state, MEMBER, { type: "requested", request: invalidRequest });
  state = reducePackageBindingFacet(state, MEMBER, {
    type: "failed",
    request: invalidRequest,
    failure: { class: "consistency", message: "digest mismatch" },
  });

  const model = buildAdapterLifecycleReadModel(state);
  assert.deepEqual(model.installed[0].operations.map((operation) => operation.id), ["project"]);
  assert.equal(model.installed[0].packageBinding.value.manifestSha256, SHA_MANIFEST);
  assert.deepEqual(model.installed[1].operations, []);
  assert.equal(model.installed[1].packageBinding.availability, "failed");
  assert.equal(model.installed[1].packageBinding.failure.class, "consistency");
});

test("Catalog exact availability and provider provenance remain separate from installed state", () => {
  let state = emptyAdapterLifecycleState();
  const inventoryRequest = request("inventory");
  const record = installed("instance-1", CURRENT, "0.2.0");
  state = reduceInstalledFacet(state, MEMBER, { type: "requested", request: inventoryRequest });
  state = reduceInstalledFacet(state, MEMBER, { type: "ready", request: inventoryRequest, records: [record] });

  let model = buildAdapterLifecycleReadModel(state);
  assert.equal(model.catalog.availability, "unavailable");
  assert.equal(model.installed[0].catalogSelection, null);

  const catalogRequest = {
    ...request("catalog"),
    catalogPath: "/catalog.json",
    sourceCoordinate: exactReleaseIdentity(CURRENT, "0.2.0").sourceCoordinateText,
    releaseVersion: "0.2.0",
  };
  state = reduceCatalogFacet(state, MEMBER, { type: "requested", request: catalogRequest });
  state = reduceCatalogFacet(state, MEMBER, {
    type: "ready",
    request: catalogRequest,
    selection: {
      sourceCoordinate: CURRENT,
      releaseVersion: "0.2.0",
      releaseDescriptorDigest: { algorithm: "sha256", value: SHA_DESCRIPTOR },
      sources: [{
        binding: { id: "github", provider: "github-release", config: { repository: "OrbitFabric/openc3-cosmos" } },
        releaseRef: "v0.2.0",
      }],
    },
  });

  model = buildAdapterLifecycleReadModel(state);
  assert.equal(model.catalogIdentity.display, "github.com/OrbitFabric:orbitfabric/openc3-cosmos@0.2.0");
  assert.equal(model.installed[0].catalogSelection.sources[0].binding.provider, "github-release");
  assert.equal(model.installed[0].installed.instanceId, "instance-1");
});

test("MATCH, MISSING and MISMATCH remain exact Core-owned desired-state results", () => {
  let state = emptyAdapterLifecycleState();
  const lockRequest = { ...request("lock"), target: "/mission/adapter-project-lock.json" };
  const comparisons = [
    {
      sourceCoordinate: HISTORICAL,
      releaseVersion: "0.1.0",
      status: "MATCH",
      matchingInstanceIds: ["historical-instance"],
      candidateInstanceIds: [],
      candidateMismatches: [],
    },
    {
      sourceCoordinate: CURRENT,
      releaseVersion: "0.2.0",
      status: "MISSING",
      matchingInstanceIds: [],
      candidateInstanceIds: [],
      candidateMismatches: [],
    },
    {
      sourceCoordinate: { ...CURRENT, name: "fprime" },
      releaseVersion: "0.1.1",
      status: "MISMATCH",
      matchingInstanceIds: [],
      candidateInstanceIds: ["fprime-old"],
      candidateMismatches: [{ instanceId: "fprime-old", dimensions: ["release_version"] }],
    },
  ];
  state = reduceProjectLockFacet(state, MEMBER, { type: "requested", request: lockRequest });
  state = reduceProjectLockFacet(state, MEMBER, {
    type: "ready",
    request: lockRequest,
    report: {
      lockPath: lockRequest.target,
      lockVersion: "0.1-candidate",
      status: "NOT_SATISFIED",
      adapters: comparisons,
    },
  });

  const model = buildAdapterLifecycleReadModel(state);
  assert.deepEqual(model.desired.map((item) => item.comparison.status), ["MATCH", "MISSING", "MISMATCH"]);
  assert.equal(model.projectLock.value.status, "NOT_SATISFIED");
});

test("Catalog absence is a localized unavailable observation with no fabricated provider", () => {
  let state = emptyAdapterLifecycleState();
  const catalogRequest = {
    ...request("catalog"),
    catalogPath: "/catalog.json",
    sourceCoordinate: exactReleaseIdentity(CURRENT, "9.9.9").sourceCoordinateText,
    releaseVersion: "9.9.9",
  };
  state = reduceCatalogFacet(state, MEMBER, { type: "requested", request: catalogRequest });
  state = reduceCatalogFacet(state, MEMBER, {
    type: "failed",
    request: catalogRequest,
    failure: {
      class: "transport",
      message: "Expected one exact Catalog release, found 0",
    },
  });

  const model = buildAdapterLifecycleReadModel(state);
  assert.equal(model.catalog.availability, "failed");
  assert.equal(model.catalog.value, null);
  assert.equal(model.catalogIdentity, null);
  assert.match(model.catalog.failure.message, /found 0/);
});

test("localized lifecycle failure remains observable without changing accepted inventory", () => {
  let state = emptyAdapterLifecycleState();
  const first = request("inventory-first");
  const record = installed("instance-1", CURRENT, "0.2.0");
  state = reduceInstalledFacet(state, MEMBER, { type: "requested", request: first });
  state = reduceInstalledFacet(state, MEMBER, { type: "ready", request: first, records: [record] });
  const refresh = request("inventory-refresh", "refresh");
  state = reduceInstalledFacet(state, MEMBER, { type: "requested", request: refresh });
  state = reduceInstalledFacet(state, MEMBER, {
    type: "failed",
    request: refresh,
    failure: { class: "transport", message: "Core unavailable" },
  });

  const model = buildAdapterLifecycleReadModel(state);
  assert.equal(model.inventory.availability, "available");
  assert.equal(model.inventory.failure.message, "Core unavailable");
  assert.equal(model.installed[0].installed.instanceId, "instance-1");
});
