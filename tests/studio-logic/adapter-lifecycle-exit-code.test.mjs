import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const {
  AdapterLifecycleHydrator,
  AdapterLifecycleTransportError,
} = require("../../.test-dist/convergence/AdapterLifecycleHydrator.js");

const verifyJson = JSON.stringify({
  instance_id: "instance-1",
  release_descriptor_integrity: { status: "PASS", detail: null },
  manifest_integrity: { status: "FAIL", detail: "drift" },
  manifest_conformance: { status: "FAIL", detail: "invalid" },
  execution_binding: { status: "PASS", detail: null },
  backend_materialization: { status: "PASS", detail: null },
});

function invocation(exitCode) {
  return {
    operation: "adapter-verify",
    executable: "orbitfabric",
    args: [],
    exitCode,
    processCompleted: true,
    timedOut: false,
    stdout: verifyJson,
    stderr: "fixture failure",
    reportPath: null,
    reportText: null,
  };
}

function request() {
  return {
    membership: { sessionId: "session-1", generation: 1 },
    requestToken: "verify-1",
    mode: "replace",
    target: "instance-1",
  };
}

test("verify accepts Core domain failure exit 1 but rejects unexpected exit 2", async () => {
  let exitCode = 1;
  const gateway = {
    listInstalled: async () => invocation(0),
    verifyInstalled: async () => invocation(exitCode),
    checkProjectLock: async () => invocation(exitCode),
    selectCatalogRelease: async () => invocation(0),
    readTextFile: async () => ({ path: "/tmp/unused", text: "{}" }),
  };
  const hydrator = new AdapterLifecycleHydrator(gateway);

  const accepted = await hydrator.hydrateVerify("orbitfabric", request());
  assert.equal(accepted.manifestIntegrity.status, "FAIL");

  exitCode = 2;
  await assert.rejects(
    () => hydrator.hydrateVerify("orbitfabric", request()),
    AdapterLifecycleTransportError,
  );
});
