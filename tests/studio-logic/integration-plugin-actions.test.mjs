import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { executeIntegrationInspectorAction } = require("../../.test-dist/integrations/plugin-actions.js");

const input = {
  source: { domain: "telemetry", id: "eps.voltage" },
  mapping: {
    id: "mapping.tm.voltage",
    sources: [{ domain: "telemetry", id: "eps.voltage" }],
    profileBindings: [],
    targets: [{ namespace: "example", kind: "parameter", id: "VOLTAGE" }],
  },
  target: { namespace: "example", kind: "parameter", id: "VOLTAGE" },
};

function context() {
  const calls = [];
  return {
    calls,
    value: {
      mission: { selectedEntity: input.source },
      integration: {
        package: {
          manifestPath: "/tmp/package.json",
          kind: "orbitfabric.integration_package",
          manifestVersion: "0.1-candidate",
          integrationId: "example-integration",
          adapterId: "adapter",
          adapterVersion: "1",
          coreInputCompatibility: { inputSetVersions: [], surfaces: [], relationshipFamilies: [] },
          profileCompatibility: { profileVersions: [] },
          resultCompatibility: { resultVersions: [], defaultResultVersion: "0.1-candidate" },
          advertisedCapabilities: [],
          operations: [],
          profileSchemas: [],
          execution: { protocol: "orbitfabric.adapter_cli.v0", argvPrefix: ["adapter"] },
        },
        profile: null,
        result: {
          kind: "orbitfabric.integration_result",
          resultVersion: "0.1-candidate",
          result: "succeeded",
          integration: { id: "example-integration", schemaVersion: "0.1-candidate" },
          adapter: { id: "adapter", version: "1" },
          operation: { id: "project" },
          mission: {},
          inputs: { coreInputSet: {}, profile: {} },
          capabilities: [],
          artifacts: [
            {
              id: "artifact.good",
              kind: "contract",
              requirement: "required",
              status: "generated",
              path: "contract.h",
              mediaType: "text/x-c",
              sha256: "x",
              reason: null,
              retainedPartial: false,
              derivedFromMappings: ["mapping.tm.voltage"],
            },
            {
              id: "artifact.other",
              kind: "contract",
              requirement: "required",
              status: "generated",
              path: "other.h",
              mediaType: "text/x-c",
              sha256: "y",
              reason: null,
              retainedPartial: false,
              derivedFromMappings: ["mapping.other"],
            },
          ],
          mappings: [], resolutions: [], diagnostics: [],
          coverage: { status: "complete", scope: { domains: [] }, reason: null, summary: {}, records: [] },
          evidence: [], externalTools: [],
        },
        compatibility: { state: "compatible", reasons: [] },
        freshness: { state: "fresh", reason: "fixture" },
      },
      actions: {
        async openCoreEntity(ref) { calls.push(["core", ref]); },
        async revealResultArtifact(id) { calls.push(["artifact", id]); },
      },
    },
  };
}

test("open_core_entity is limited to sources of the inspected mapping", async () => {
  const ctx = context();
  await executeIntegrationInspectorAction({
    id: "open-source",
    label: "Open source",
    request: { kind: "open_core_entity", ref: { domain: "telemetry", id: "eps.voltage" } },
  }, input, ctx.value);
  assert.deepEqual(ctx.calls, [["core", { domain: "telemetry", id: "eps.voltage" }]]);

  await assert.rejects(
    executeIntegrationInspectorAction({
      id: "escape",
      label: "Escape",
      request: { kind: "open_core_entity", ref: { domain: "commands", id: "obc.reset" } },
    }, input, ctx.value),
    /not a source of the inspected mapping/,
  );
});

test("reveal_result_artifact is limited to Result artifacts linked to the mapping", async () => {
  const ctx = context();
  await executeIntegrationInspectorAction({
    id: "reveal",
    label: "Reveal",
    request: { kind: "reveal_result_artifact", artifactId: "artifact.good" },
  }, input, ctx.value);
  assert.deepEqual(ctx.calls, [["artifact", "artifact.good"]]);

  await assert.rejects(
    executeIntegrationInspectorAction({
      id: "unlinked",
      label: "Reveal other",
      request: { kind: "reveal_result_artifact", artifactId: "artifact.other" },
    }, input, ctx.value),
    /not linked to mapping/,
  );

  await assert.rejects(
    executeIntegrationInspectorAction({
      id: "missing",
      label: "Reveal missing",
      request: { kind: "reveal_result_artifact", artifactId: "artifact.missing" },
    }, input, ctx.value),
    /unknown Result artifact/,
  );
});
