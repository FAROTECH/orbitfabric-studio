import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);
const { createBundledIntegrationPluginRegistry } = require("../../.test-dist/integrations/bundled-plugin-registry.js");
const { parseIntegrationPackageManifest } = require("../../.test-dist/integrations/manifest.js");
const { parseIntegrationResult } = require("../../.test-dist/integrations/result.js");

const pocRoot = requiredEnv("ORBITFABRIC_STUDIO_REFERENCE_POC");
const resultPath = requiredEnv("ORBITFABRIC_STUDIO_REFERENCE_RESULT");
const packageManifestPath = join(
  pocRoot,
  "reference_adapter",
  "src",
  "orbitfabric_openobsw_opensvf",
  "integration_package.json",
);

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for reference plugin acceptance.`);
  return value;
}

function readText(path) {
  return readFileSync(path, "utf8");
}

function context(descriptor, result) {
  return {
    integration: {
      id: descriptor.integrationId,
      result,
    },
    actions: {
      async openCoreEntity() {},
      async revealResultArtifact() {},
    },
  };
}

test("bundled OpenOBSW/OpenSVF plugin presents real Result target refs without reconstructing mappings", () => {
  const descriptor = parseIntegrationPackageManifest(packageManifestPath, readText(packageManifestPath));
  const result = parseIntegrationResult(readText(resultPath));
  const registry = createBundledIntegrationPluginRegistry();

  assert.equal(descriptor.integrationId, "orbitfabric-openobsw-opensvf");
  assert.deepEqual(registry.compatibleWith(descriptor.integrationId).map((item) => item.plugin.id), [
    "orbitfabric-studio.openobsw-opensvf",
  ]);

  const observed = new Set();
  let inspected = 0;
  const pluginContext = context(descriptor, result);

  for (const mapping of result.mappings) {
    assert.ok(mapping.sources.length > 0, `${mapping.id} must have an explicit Core source`);

    for (const target of mapping.targets) {
      if (
        !(
          (target.namespace === "openobsw" && target.kind === "contract_symbol") ||
          (target.namespace === "opensvf" && target.kind === "srdb_parameter")
        )
      ) {
        continue;
      }

      observed.add(`${target.namespace}/${target.kind}`);
      const dispatch = registry.inspectTarget({ mapping, target }, pluginContext);
      assert.deepEqual(dispatch.failures, [], `${mapping.id} ${target.namespace}/${target.kind}`);
      assert.equal(dispatch.matches.length, 1, `${mapping.id} ${target.namespace}/${target.kind}`);

      const model = dispatch.matches[0].model;
      assert.ok(model.title.length > 0);
      assert.equal(model.subtitle, target.id);
      assert.ok(
        model.sections.some((section) =>
          section.rows.some((row) => row.value === mapping.id),
        ),
        "presentation must retain explicit Result mapping identity",
      );
      for (const source of mapping.sources) {
        assert.ok(
          model.sections.some((section) =>
            section.rows.some((row) => row.value === `${source.domain}/${source.id}`),
          ),
          `presentation must retain mapping source ${source.domain}/${source.id}`,
        );
        assert.ok(
          model.actions?.some(
            (action) =>
              action.request.kind === "open_core_entity" &&
              action.request.ref.domain === source.domain &&
              action.request.ref.id === source.id,
          ),
          `reference inspector must expose navigation for ${source.domain}/${source.id}`,
        );
      }

      const linkedArtifacts = result.artifacts.filter((artifact) =>
        artifact.derivedFromMappings.includes(mapping.id),
      );
      if (target.namespace === "openobsw") {
        assert.ok(linkedArtifacts.some((artifact) => artifact.id === "flight.mission_contract"));
        assert.ok(
          model.actions?.some(
            (action) =>
              action.request.kind === "reveal_result_artifact" &&
              action.request.artifactId === "flight.mission_contract",
          ),
        );
      }
      if (target.namespace === "opensvf") {
        assert.ok(linkedArtifacts.some((artifact) => artifact.id === "ground.opensvf_srdb"));
        assert.ok(
          model.actions?.some(
            (action) =>
              action.request.kind === "reveal_result_artifact" &&
              action.request.artifactId === "ground.opensvf_srdb",
          ),
        );
      }
      inspected += 1;
    }
  }

  assert.ok(inspected > 0, "reference Result must expose target refs for plugin acceptance");
  assert.deepEqual([...observed].sort(), [
    "openobsw/contract_symbol",
    "opensvf/srdb_parameter",
  ]);
});
