import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { mockIPC, clearMocks } = require("@tauri-apps/api/mocks");
const { TauriCoreGateway } = require("../../.test-dist/core/TauriCoreGateway.js");

test("real same-version Core revisions classify by manifest capabilities", async () => {
  const root = process.env.ORBITFABRIC_STUDIO_H4_OUTPUT;
  assert.ok(root, "H4 native output must be supplied");
  const evidence = JSON.parse(
    readFileSync(join(root, "core-compatibility.json"), "utf8"),
  );

  assert.equal(evidence.historical.version.stdout.trim(), "orbitfabric 1.3.0");
  assert.equal(evidence.current.version.stdout.trim(), "orbitfabric 1.3.0");
  assert.notEqual(evidence.historical.interface.exitCode, 0);
  assert.equal(evidence.historical.interface.reportText, null);
  assert.equal(evidence.current.interface.exitCode, 0);
  assert.ok(evidence.current.interface.reportText);
  assert.equal(evidence.current.bareResolution.configuredExecutable, "orbitfabric");
  assert.equal(
    evidence.current.bareResolution.resolvedExecutable,
    evidence.current.resolution.resolvedExecutable,
  );

  const calls = [];
  let selected = evidence.current;
  global.window = {};
  mockIPC((command, args) => {
    calls.push({ command, args });
    if (command === "resolve_core_executable") {
      return args.configuredExecutable === "orbitfabric"
        ? evidence.current.bareResolution
        : selected.resolution;
    }
    if (command === "run_core_interface_manifest") return selected.interface;
    throw new Error(`unexpected native command: ${command}`);
  });

  try {
    const gateway = new TauriCoreGateway();
    const currentResolution = await gateway.resolveCoreExecutable("orbitfabric");
    const current = await gateway.probeCore(currentResolution, "current");
    assert.equal(current.orbitfabricVersion, "1.3.0");
    assert.equal(current.interfaceVersion, "0.1-candidate");
    assert.equal(current.compatibility.state, "compatible");
    assert.equal(current.compatibility.domains.scenarios.state, "compatible");

    selected = evidence.historical;
    const historicalResolution = await gateway.resolveCoreExecutable(
      evidence.historical.resolution.configuredExecutable,
    );
    await assert.rejects(
      () => gateway.probeCore(historicalResolution, "historical"),
      error => error.state === "interface_identity_unavailable",
    );

    assert.deepEqual(
      calls.filter(call => call.command === "run_core_interface_manifest")
        .map(call => call.args.executable),
      [
        evidence.current.resolution.resolvedExecutable,
        evidence.historical.resolution.resolvedExecutable,
      ],
    );
    assert.equal(
      calls.some(call => JSON.stringify(call.args).includes("--help")),
      false,
    );
  } finally {
    clearMocks();
    delete global.window;
  }
});
