import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { IntegrationPluginRegistry } = require("../../.test-dist/integrations/plugin-registry.js");

function plugin(id, integrationIds, targetInspectors) {
  return {
    apiVersion: "0.1-candidate",
    plugin: { id, version: "1.0.0", displayName: id },
    compatibility: { integrationIds },
    contributions: { targetInspectors },
  };
}

function inspector(id, matches, inspect) {
  return { id, matches, inspect };
}

const source = { domain: "telemetry", id: "eps.voltage" };
const input = {
  mapping: {
    id: "mapping.tm.voltage",
    sources: [source],
    profileBindings: ["tm.voltage"],
    targets: [{ namespace: "example", kind: "parameter", id: "VOLTAGE" }],
  },
  target: { namespace: "example", kind: "parameter", id: "VOLTAGE" },
};

function context(integrationId = "example-integration") {
  return {
    integration: {
      id: integrationId,
      result: null,
    },
    actions: {
      async openCoreEntity() {},
      async revealResultArtifact() {},
    },
  };
}

function model(title) {
  return {
    title,
    sections: [
      {
        id: "identity",
        rows: [{ label: "Target", value: input.target.id, monospace: true }],
      },
    ],
  };
}

test("zero-plugin dispatch is a normal empty result", () => {
  const registry = new IntegrationPluginRegistry();
  assert.deepEqual(registry.inspectTarget(input, context()), { matches: [], failures: [] });
});

test("registry filters plugins by exact integration.id before contribution matching", () => {
  const registry = new IntegrationPluginRegistry();
  let wrongIntegrationWasCalled = false;
  registry.register(plugin("wrong", ["other-integration"], [
    inspector("wrong.target", () => {
      wrongIntegrationWasCalled = true;
      return true;
    }, () => model("wrong")),
  ]));
  registry.register(plugin("right", ["example-integration"], [
    inspector("right.target", () => true, () => model("right")),
  ]));

  const dispatch = registry.inspectTarget(input, context());
  assert.equal(wrongIntegrationWasCalled, false);
  assert.deepEqual(dispatch.matches.map((item) => item.pluginId), ["right"]);
  assert.deepEqual(dispatch.failures, []);
});

test("multiple matching contributions are returned deterministically and never silently collapsed", () => {
  const registry = new IntegrationPluginRegistry();
  registry.register(plugin("z-plugin", ["example-integration"], [
    inspector("b", () => true, () => model("z/b")),
    inspector("a", () => true, () => model("z/a")),
  ]));
  registry.register(plugin("a-plugin", ["example-integration"], [
    inspector("target", () => true, () => model("a")),
  ]));

  const dispatch = registry.inspectTarget(input, context());
  assert.deepEqual(
    dispatch.matches.map((item) => `${item.pluginId}/${item.contributionId}`),
    ["a-plugin/target", "z-plugin/a", "z-plugin/b"],
  );
});

test("matches and inspect exceptions are isolated as contribution failures", () => {
  const registry = new IntegrationPluginRegistry();
  registry.register(plugin("broken", ["example-integration"], [
    inspector("throws-in-matches", () => {
      throw new Error("match failure");
    }, () => model("unused")),
    inspector("throws-in-inspect", () => true, () => {
      throw new Error("inspect failure");
    }),
    inspector("still-works", () => true, () => model("survives")),
  ]));

  const dispatch = registry.inspectTarget(input, context());
  assert.deepEqual(dispatch.matches.map((item) => item.model.title), ["survives"]);
  assert.deepEqual(
    dispatch.failures.map((item) => [item.contributionId, item.phase, item.message]),
    [
      ["throws-in-inspect", "inspect", "inspect failure"],
      ["throws-in-matches", "matches", "match failure"],
    ].sort((a, b) => a[0].localeCompare(b[0])),
  );
});

test("registry rejects duplicate plugin ids and duplicate contribution ids", () => {
  const registry = new IntegrationPluginRegistry();
  registry.register(plugin("one", ["example-integration"], []));
  assert.throws(
    () => registry.register(plugin("one", ["example-integration"], [])),
    /already registered/,
  );

  assert.throws(
    () => new IntegrationPluginRegistry().register(plugin("bad", ["example-integration"], [
      inspector("duplicate", () => false, () => model("unused")),
      inspector("duplicate", () => false, () => model("unused")),
    ])),
    /Duplicate target inspector contribution id/,
  );
});
