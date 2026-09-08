import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const {
  parseAdapterVerificationReport,
  parseExactCatalogReleaseSelection,
  parseInstalledAdapterRecords,
  parseProjectLockCheckReport,
} = require("../../.test-dist/convergence/adapterLifecycleContracts.js");
const {
  emptyAdapterLifecycleState,
  reduceInstalledFacet,
  reduceProjectLockFacet,
  reduceVerifyFacet,
} = require("../../.test-dist/convergence/adapterLifecycleSlot.js");
const {
  AdapterLifecycleConsistencyError,
  AdapterLifecycleHydrator,
  AdapterLifecycleTransportError,
} = require("../../.test-dist/convergence/AdapterLifecycleHydrator.js");
const { initialStudioState, studioReducer } = require("../../.test-dist/app/studioState.js");
const { emptyMissionReadModel } = require("../../.test-dist/mission/MissionSession.js");

const SHA_DESCRIPTOR = "1".repeat(64);
const SHA_ARTIFACT = "2".repeat(64);
const SHA_MANIFEST = "3".repeat(64);
const SOURCE = { authority: "github", publisher: "FAROTECH", name: "fixture-adapter" };

function membership(sessionId = "session-1", generation = 1) {
  return { sessionId, generation };
}

function request(requestToken, mode = "refresh", member = membership()) {
  return { membership: member, requestToken, mode };
}

function targeted(target, requestToken, mode = "refresh", member = membership()) {
  return { ...request(requestToken, mode, member), target };
}

function installedRecord(instanceId = "instance-1") {
  return {
    instanceId,
    sourceCoordinate: SOURCE,
    releaseVersion: "1.0.0",
    releaseDescriptorPath: "/tmp/release.json",
    releaseDescriptorSha256: SHA_DESCRIPTOR,
    artifactId: "wheel",
    artifactSha256: SHA_ARTIFACT,
    backendId: "python-wheel-managed-env",
    installRoot: "/tmp/instance",
    manifestPath: "/tmp/instance/integration_package.json",
    manifestSha256: SHA_MANIFEST,
    executionArgvPrefix: ["/tmp/instance/bin/adapter"],
    acceptancePolicy: "development-explicit-source",
    acceptanceWarnings: [],
  };
}

function verification(status = "PASS", instanceId = "instance-1") {
  const dimension = { status, detail: status === "PASS" ? null : "fixture" };
  return {
    instanceId,
    releaseDescriptorIntegrity: dimension,
    manifestIntegrity: dimension,
    manifestConformance: dimension,
    executionBinding: dimension,
    backendMaterialization: dimension,
  };
}

function projectLock(status = "NOT_SATISFIED", adapterStatus = "MISMATCH") {
  return {
    lockPath: "/tmp/adapter-project-lock.json",
    lockVersion: "0.1-candidate",
    status,
    adapters: [
      {
        sourceCoordinate: SOURCE,
        releaseVersion: "1.0.0",
        status: adapterStatus,
        matchingInstanceIds: [],
        candidateInstanceIds: ["instance-1"],
        candidateMismatches: [
          { instanceId: "instance-1", dimensions: ["artifact_sha256"] },
        ],
      },
    ],
  };
}

function coreInvocation(stdout, exitCode = 0, stderr = "") {
  return {
    operation: "fixture",
    executable: "orbitfabric",
    args: [],
    exitCode,
    processCompleted: true,
    timedOut: false,
    stdout,
    stderr,
    reportPath: null,
    reportText: null,
  };
}

function manifestText() {
  return JSON.stringify({
    kind: "orbitfabric.integration_package",
    manifest_version: "0.1-candidate",
    integration: { id: "fixture-integration" },
    adapter: { id: "fixture-adapter", version: "1.0.0" },
    core_input_compatibility: {
      input_set_versions: ["0.1-candidate"],
      surfaces: [],
      relationship_families: [],
    },
    profile_compatibility: { profile_versions: ["0.1-candidate"] },
    result_compatibility: {
      result_versions: ["0.1-candidate"],
      default_result_version: "0.1-candidate",
    },
    capabilities: [],
    operations: [{ id: "project", capabilities: [] }],
    profile_schemas: [],
    execution: { protocol: "orbitfabric.adapter_cli.v0", argv_prefix: ["fixture-adapter"] },
  });
}

function session(sessionId, generation) {
  return {
    sessionId,
    generation,
    source: { selectedPath: "/tmp", missionDir: "/tmp/mission" },
    core: { executable: "orbitfabric", orbitfabricVersion: "1.3.0", versionText: "orbitfabric 1.3.0" },
    snapshot: {
      kind: "orbitfabric.mission_snapshot",
      snapshot_version: "0.1-candidate",
      orbitfabric_version: "1.3.0",
      result: "loaded",
      mission: { id: "mission-1", name: "Mission 1", model_version: "1" },
      source: { mission_dir: "/tmp/mission" },
      boundaries: {},
      diagnostics: [],
      model: {
        spacecraft: { id: "spacecraft-1", model_version: "1" },
        subsystems: [],
        modes: {},
        mode_transitions: [],
        telemetry: [],
        commands: [],
        events: [],
        faults: [],
        packets: [],
        policies: {},
        payloads: [],
        data_products: [],
        contacts: {},
        commandability: {},
      },
    },
    entityIndex: null,
    relationships: null,
    lint: null,
    readiness: { entities: "pending", relationships: "pending", lint: "pending" },
    failures: [],
    readModel: emptyMissionReadModel(),
    openedAt: 0,
    lastSuccessfulRefreshAt: null,
  };
}

test("Core lifecycle JSON contracts preserve exact installed, verification, lock and catalog facts", () => {
  const installed = parseInstalledAdapterRecords(JSON.stringify([
    {
      instance_id: "instance-1",
      source_coordinate: SOURCE,
      release_version: "1.0.0",
      release_descriptor_path: "/tmp/release.json",
      release_descriptor_sha256: SHA_DESCRIPTOR,
      artifact_id: "wheel",
      artifact_sha256: SHA_ARTIFACT,
      backend_id: "python-wheel-managed-env",
      install_root: "/tmp/instance",
      manifest_path: "/tmp/instance/integration_package.json",
      manifest_sha256: SHA_MANIFEST,
      execution_argv_prefix: ["/tmp/instance/bin/adapter"],
      acceptance_policy: "development-explicit-source",
      acceptance_warnings: [],
    },
  ]));
  assert.deepEqual(installed, [installedRecord()]);

  const verify = parseAdapterVerificationReport(JSON.stringify({
    instance_id: "instance-1",
    release_descriptor_integrity: { status: "FAIL", detail: "descriptor drift" },
    manifest_integrity: { status: "UNKNOWN", detail: null },
    manifest_conformance: { status: "PASS", detail: null },
    execution_binding: { status: "PASS", detail: null },
    backend_materialization: { status: "PASS", detail: null },
  }));
  assert.equal(verify.releaseDescriptorIntegrity.status, "FAIL");
  assert.equal(verify.manifestIntegrity.status, "UNKNOWN");

  const lock = parseProjectLockCheckReport(JSON.stringify({
    lock_path: "/tmp/adapter-project-lock.json",
    lock_version: "0.1-candidate",
    status: "NOT_SATISFIED",
    adapters: [{
      source_coordinate: SOURCE,
      release_version: "1.0.0",
      status: "MISMATCH",
      matching_instance_ids: [],
      candidate_instance_ids: ["instance-1"],
      candidate_mismatches: [{ instance_id: "instance-1", dimensions: ["artifact_sha256"] }],
    }],
  }));
  assert.equal(lock.status, "NOT_SATISFIED");
  assert.equal(lock.adapters[0].status, "MISMATCH");

  const selection = parseExactCatalogReleaseSelection(JSON.stringify({
    source_coordinate: SOURCE,
    release_version: "1.0.0",
    release_descriptor_digest: { algorithm: "sha256", value: SHA_DESCRIPTOR },
    sources: [{
      binding: { id: "github", provider: "github-release", config: {} },
      release_ref: "v1.0.0",
    }],
  }));
  assert.equal(selection.releaseDescriptorDigest.value, SHA_DESCRIPTOR);
  assert.equal(selection.sources[0].releaseRef, "v1.0.0");
});

test("lifecycle reducer rejects stale generations and superseded same-generation responses", () => {
  const active = membership();
  let state = emptyAdapterLifecycleState();
  const first = request("inventory-1", "replace");
  const second = request("inventory-2", "refresh");

  state = reduceInstalledFacet(state, active, { type: "requested", request: first });
  state = reduceInstalledFacet(state, active, { type: "requested", request: second });

  const staleSameGeneration = reduceInstalledFacet(state, active, {
    type: "ready",
    request: first,
    records: [installedRecord("stale")],
  });
  assert.equal(staleSameGeneration, state);

  state = reduceInstalledFacet(state, active, {
    type: "ready",
    request: second,
    records: [installedRecord()],
  });
  assert.equal(state.installed.accepted[0].instanceId, "instance-1");

  const staleGeneration = reduceInstalledFacet(state, active, {
    type: "requested",
    request: request("inventory-old", "refresh", membership("session-old", 0)),
  });
  assert.equal(staleGeneration, state);
});

test("valid Core FAIL and MISMATCH reports remain accepted domain observations", () => {
  const active = membership();
  let state = emptyAdapterLifecycleState();

  const verifyRequest = targeted("instance-1", "verify-1", "replace");
  state = reduceVerifyFacet(state, active, { type: "requested", request: verifyRequest });
  state = reduceVerifyFacet(state, active, {
    type: "ready",
    request: verifyRequest,
    report: verification("FAIL"),
  });
  assert.equal(state.verifyByInstance.get("instance-1").accepted.manifestIntegrity.status, "FAIL");
  assert.equal(state.verifyByInstance.get("instance-1").failure, null);

  const lockRequest = targeted("/tmp/adapter-project-lock.json", "lock-1", "replace");
  state = reduceProjectLockFacet(state, active, { type: "requested", request: lockRequest });
  state = reduceProjectLockFacet(state, active, {
    type: "ready",
    request: lockRequest,
    report: projectLock(),
  });
  assert.equal(state.projectLock.accepted.status, "NOT_SATISFIED");
  assert.equal(state.projectLock.accepted.adapters[0].status, "MISMATCH");
});

test("failed refresh retains accepted lifecycle observation while replace clears it", () => {
  const active = membership();
  let state = emptyAdapterLifecycleState();
  const initial = targeted("/tmp/lock-a.json", "lock-a", "replace");
  state = reduceProjectLockFacet(state, active, { type: "requested", request: initial });
  state = reduceProjectLockFacet(state, active, {
    type: "ready",
    request: initial,
    report: projectLock("MATCH", "MATCH"),
  });

  const refresh = targeted("/tmp/lock-a.json", "lock-refresh", "refresh");
  state = reduceProjectLockFacet(state, active, { type: "requested", request: refresh });
  state = reduceProjectLockFacet(state, active, {
    type: "failed",
    request: refresh,
    failure: { class: "transport", message: "offline" },
  });
  assert.equal(state.projectLock.accepted.status, "MATCH");
  assert.equal(state.projectLock.failure.message, "offline");

  const replacement = targeted("/tmp/lock-b.json", "lock-b", "replace");
  state = reduceProjectLockFacet(state, active, { type: "requested", request: replacement });
  assert.equal(state.projectLock.accepted, null);
  assert.equal(state.projectLock.pending.target, "/tmp/lock-b.json");
});

test("hydrator accepts nonzero verify and lock domain outcomes instead of inventing transport failure", async () => {
  const verifyJson = JSON.stringify({
    instance_id: "instance-1",
    release_descriptor_integrity: { status: "PASS", detail: null },
    manifest_integrity: { status: "FAIL", detail: "drift" },
    manifest_conformance: { status: "FAIL", detail: "invalid" },
    execution_binding: { status: "PASS", detail: null },
    backend_materialization: { status: "PASS", detail: null },
  });
  const lockJson = JSON.stringify({
    lock_path: "/tmp/adapter-project-lock.json",
    lock_version: "0.1-candidate",
    status: "NOT_SATISFIED",
    adapters: [{
      source_coordinate: SOURCE,
      release_version: "1.0.0",
      status: "MISSING",
      matching_instance_ids: [],
      candidate_instance_ids: [],
      candidate_mismatches: [],
    }],
  });
  const gateway = {
    listInstalled: async () => coreInvocation("[]"),
    verifyInstalled: async () => coreInvocation(verifyJson, 1),
    checkProjectLock: async () => coreInvocation(lockJson, 1),
    selectCatalogRelease: async () => coreInvocation("{}"),
    readTextFile: async () => ({ path: "/tmp/manifest.json", text: manifestText() }),
  };
  const hydrator = new AdapterLifecycleHydrator(gateway);

  const verify = await hydrator.hydrateVerify("orbitfabric", targeted("instance-1", "verify"));
  assert.equal(verify.manifestIntegrity.status, "FAIL");

  const lock = await hydrator.hydrateProjectLock(
    "orbitfabric",
    targeted("/tmp/adapter-project-lock.json", "lock"),
  );
  assert.equal(lock.adapters[0].status, "MISSING");
});

test("hydrator binds installed manifest bytes to the exact Core manifest SHA-256", async () => {
  const text = manifestText();
  const digest = createHash("sha256").update(text, "utf8").digest("hex");
  const gateway = {
    listInstalled: async () => coreInvocation("[]"),
    verifyInstalled: async () => coreInvocation("{}"),
    checkProjectLock: async () => coreInvocation("{}"),
    selectCatalogRelease: async () => coreInvocation("{}"),
    readTextFile: async (path) => ({ path, text }),
  };
  const hydrator = new AdapterLifecycleHydrator(gateway);
  const binding = await hydrator.hydratePackageBinding({
    ...request("package-1", "replace"),
    instanceId: "instance-1",
    manifestPath: "/tmp/integration_package.json",
    expectedManifestSha256: digest,
  });
  assert.equal(binding.manifestSha256, digest);
  assert.equal(binding.descriptor.integrationId, "fixture-integration");

  await assert.rejects(
    () => hydrator.hydratePackageBinding({
      ...request("package-2", "replace"),
      instanceId: "instance-1",
      manifestPath: "/tmp/integration_package.json",
      expectedManifestSha256: "f".repeat(64),
    }),
    AdapterLifecycleConsistencyError,
  );
});

test("verify report identity mismatch is a consistency failure and empty nonzero output is transport failure", async () => {
  const wrongVerify = JSON.stringify({
    instance_id: "other-instance",
    release_descriptor_integrity: { status: "PASS", detail: null },
    manifest_integrity: { status: "PASS", detail: null },
    manifest_conformance: { status: "PASS", detail: null },
    execution_binding: { status: "PASS", detail: null },
    backend_materialization: { status: "PASS", detail: null },
  });
  let empty = false;
  const gateway = {
    listInstalled: async () => coreInvocation("[]"),
    verifyInstalled: async () => empty ? coreInvocation("", 1, "missing") : coreInvocation(wrongVerify),
    checkProjectLock: async () => coreInvocation("{}"),
    selectCatalogRelease: async () => coreInvocation("{}"),
    readTextFile: async () => ({ path: "/tmp/manifest.json", text: manifestText() }),
  };
  const hydrator = new AdapterLifecycleHydrator(gateway);

  await assert.rejects(
    () => hydrator.hydrateVerify("orbitfabric", targeted("instance-1", "verify-a")),
    AdapterLifecycleConsistencyError,
  );

  empty = true;
  await assert.rejects(
    () => hydrator.hydrateVerify("orbitfabric", targeted("instance-1", "verify-b")),
    AdapterLifecycleTransportError,
  );
});

test("Studio reducer enforces lifecycle generation membership and clears observations on new mission generation", () => {
  const active = session("session-1", 1);
  let state = { ...initialStudioState, activeSession: active };
  const lifecycleRequest = request("inventory-1", "replace");

  state = studioReducer(state, {
    type: "ADAPTER_LIFECYCLE_INSTALLED_REQUESTED",
    request: lifecycleRequest,
  });
  state = studioReducer(state, {
    type: "ADAPTER_LIFECYCLE_INSTALLED_READY",
    request: lifecycleRequest,
    records: [installedRecord()],
  });
  assert.equal(state.lifecycle.installed.accepted[0].instanceId, "instance-1");

  const beforeStale = state;
  state = studioReducer(state, {
    type: "ADAPTER_LIFECYCLE_INSTALLED_REQUESTED",
    request: request("old", "refresh", membership("old-session", 0)),
  });
  assert.equal(state, beforeStale);

  const nextSession = session("session-2", 2);
  state = {
    ...state,
    opening: {
      requestId: "session-2",
      generation: 2,
      selectedPath: "/tmp",
      isRefresh: true,
    },
  };
  state = studioReducer(state, { type: "MISSION_PRIMARY_COMMITTED", session: nextSession });
  assert.equal(state.lifecycle.installed.accepted, null);
  assert.equal(state.lifecycle.verifyByInstance.size, 0);
});
