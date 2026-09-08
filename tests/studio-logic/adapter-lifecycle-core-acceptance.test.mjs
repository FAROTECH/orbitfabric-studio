import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const {
  parseAdapterVerificationReport,
  parseExactCatalogReleaseSelection,
  parseInstalledAdapterRecords,
  parseProjectLockCheckReport,
} = require("../../.test-dist/convergence/adapterLifecycleContracts.js");
const { AdapterLifecycleHydrator } = require("../../.test-dist/convergence/AdapterLifecycleHydrator.js");

const root = process.env.ORBITFABRIC_STUDIO_LIFECYCLE_SURFACES;
if (!root) {
  throw new Error("ORBITFABRIC_STUDIO_LIFECYCLE_SURFACES is required for lifecycle acceptance.");
}

function text(name) {
  return readFileSync(join(root, name), "utf8");
}

function invocation(stdout, exitCode) {
  return {
    operation: "lifecycle-acceptance",
    executable: "orbitfabric",
    args: [],
    exitCode,
    processCompleted: true,
    timedOut: false,
    stdout,
    stderr: "",
    reportPath: null,
    reportText: null,
  };
}

test("Studio consumes exact Core v1.3.0 Adapter Lifecycle surfaces without reinterpretation", async () => {
  const installedText = text("installed.json");
  const verifyText = text("verify.json");
  const lockText = text("lock.json");
  const catalogText = text("catalog.json");

  const records = parseInstalledAdapterRecords(installedText);
  assert.equal(records.length, 1);
  const record = records[0];
  assert.equal(record.instanceId, "studio-lifecycle-fixture");
  assert.equal(record.releaseVersion, "1.0.0");

  const verification = parseAdapterVerificationReport(verifyText);
  assert.equal(verification.instanceId, record.instanceId);
  assert.equal(verification.releaseDescriptorIntegrity.status, "PASS");
  assert.equal(verification.manifestIntegrity.status, "PASS");
  assert.equal(verification.manifestConformance.status, "PASS");
  assert.equal(verification.executionBinding.status, "PASS");
  assert.equal(verification.backendMaterialization.status, "FAIL");

  const lock = parseProjectLockCheckReport(lockText);
  assert.equal(lock.status, "NOT_SATISFIED");
  assert.equal(lock.adapters.length, 1);
  assert.equal(lock.adapters[0].status, "MISMATCH");
  assert.deepEqual(lock.adapters[0].candidateMismatches[0].dimensions, ["artifact_sha256"]);

  const catalog = parseExactCatalogReleaseSelection(catalogText);
  assert.equal(catalog.releaseVersion, "1.0.0");
  assert.equal(
    `${catalog.sourceCoordinate.authority}:${catalog.sourceCoordinate.publisher}/${catalog.sourceCoordinate.name}`,
    "test.local:fixture/studio-lifecycle",
  );

  const gateway = {
    listInstalled: async () => invocation(installedText, 0),
    verifyInstalled: async () => invocation(verifyText, 1),
    checkProjectLock: async () => invocation(lockText, 1),
    selectCatalogRelease: async () => invocation(catalogText, 0),
    readTextFile: async (path) => ({ path, text: readFileSync(path, "utf8") }),
  };
  const hydrator = new AdapterLifecycleHydrator(gateway);
  const membership = { sessionId: "acceptance", generation: 1 };

  const hydratedVerify = await hydrator.hydrateVerify("orbitfabric", {
    membership,
    requestToken: "verify",
    mode: "replace",
    target: record.instanceId,
  });
  assert.equal(hydratedVerify.backendMaterialization.status, "FAIL");

  const hydratedLock = await hydrator.hydrateProjectLock("orbitfabric", {
    membership,
    requestToken: "lock",
    mode: "replace",
    target: join(root, "adapter-project-lock.json"),
  });
  assert.equal(hydratedLock.adapters[0].status, "MISMATCH");

  const binding = await hydrator.hydratePackageBinding({
    membership,
    requestToken: "package",
    mode: "replace",
    instanceId: record.instanceId,
    manifestPath: record.manifestPath,
    expectedManifestSha256: record.manifestSha256,
  });
  assert.equal(binding.manifestSha256, record.manifestSha256);
  assert.equal(binding.descriptor.integrationId, "fixture-zero-input");
});
