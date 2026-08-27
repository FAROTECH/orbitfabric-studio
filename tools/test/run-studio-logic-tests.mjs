import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const outDir = ".test-dist";
const tscEntry = join("node_modules", "typescript", "bin", "tsc");

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

try {
  rmSync(outDir, { recursive: true, force: true });
  run(process.execPath, [tscEntry, "-p", "tsconfig.logic-tests.json"]);

  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    join(outDir, "package.json"),
    JSON.stringify({ type: "commonjs" }, null, 2),
  );

  const tests = [
    "tests/studio-logic/entity-ref.test.mjs",
    "tests/studio-logic/context-graph.test.mjs",
    "tests/studio-logic/context-map-evidence.test.mjs",
    "tests/studio-logic/studio-state.test.mjs",
    "tests/studio-logic/validation-findings.test.mjs",
    "tests/studio-logic/operations-model.test.mjs",
    "tests/studio-logic/graph-layout-routing.test.mjs",
    "tests/studio-logic/integrations-foundation.test.mjs",
    "tests/studio-logic/integration-profile.test.mjs",
    "tests/studio-logic/integration-execution.test.mjs",
    "tests/studio-logic/integration-staleness.test.mjs",
  ];

  if (process.env.ORBITFABRIC_STUDIO_CORE_SURFACES) {
    tests.push("tests/studio-logic/context-map-core-regression.test.mjs");
  }

  if (
    process.env.ORBITFABRIC_STUDIO_REFERENCE_POC &&
    process.env.ORBITFABRIC_STUDIO_REFERENCE_INPUT_MANIFEST &&
    process.env.ORBITFABRIC_STUDIO_REFERENCE_RESULT
  ) {
    tests.push("tests/studio-logic/reference-integration-acceptance.test.mjs");
  }

  run(process.execPath, ["--test", ...tests]);
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
