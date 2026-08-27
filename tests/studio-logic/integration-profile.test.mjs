import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const {
  assessProfileFreshness,
  parseProjectionProfile,
  selectProfileSchema,
  validateProjectionProfile,
} = require("../../.test-dist/integrations/profile.js");
const { parseIntegrationPackageManifest } = require("../../.test-dist/integrations/manifest.js");
const { parseIntegrationResult } = require("../../.test-dist/integrations/result.js");
const { sha256Utf8 } = require("../../.test-dist/integrations/sha256.js");

const PACKAGE = {
  kind: "orbitfabric.integration_package",
  manifest_version: "0.1-candidate",
  integration: { id: "example-integration" },
  adapter: { id: "example-adapter", version: "0.1.0" },
  core_input_compatibility: { input_set_versions: ["0.1-candidate"], surfaces: [], relationship_families: [] },
  profile_compatibility: { profile_versions: ["0.1-candidate"] },
  result_compatibility: { result_versions: ["0.1-candidate"], default_result_version: "0.1-candidate" },
  capabilities: ["profile_validation"],
  operations: [{ id: "project", capabilities: ["profile_validation"] }],
  profile_schemas: [{
    schema_version: "0.1-candidate",
    format: "json-schema-2020-12",
    path: "schemas/profile.json",
    sha256: "schema-sha",
  }],
  execution: { protocol: "orbitfabric.adapter_cli.v0", argv_prefix: ["example-adapter"] },
};

const SCHEMA = JSON.stringify({
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["kind", "profile_version", "profile", "integration", "settings", "bindings"],
  properties: {
    kind: { const: "orbitfabric.projection_profile" },
    profile_version: { const: "0.1-candidate" },
    profile: {
      type: "object",
      required: ["id", "version"],
      properties: { id: { type: "string" }, version: { type: "string" } },
      additionalProperties: true,
    },
    integration: {
      type: "object",
      required: ["id", "schema_version"],
      properties: {
        id: { const: "example-integration" },
        schema_version: { const: "0.1-candidate" },
      },
      additionalProperties: false,
    },
    settings: { type: "object" },
    bindings: { type: "array" },
  },
  additionalProperties: false,
});

const PROFILE = `kind: orbitfabric.projection_profile
profile_version: 0.1-candidate
profile:
  id: demo-profile
  version: 1.0.0
integration:
  id: example-integration
  schema_version: 0.1-candidate
settings: {}
bindings: []
`;

function descriptor() {
  return parseIntegrationPackageManifest("/tmp/package/integration_package.json", JSON.stringify(PACKAGE));
}

function resultWithProfileSha(sha256) {
  return parseIntegrationResult(JSON.stringify({
    kind: "orbitfabric.integration_result",
    result_version: "0.1-candidate",
    result: "succeeded",
    integration: { id: "example-integration", schema_version: "0.1-candidate" },
    adapter: { id: "example-adapter", version: "0.1.0" },
    operation: { id: "project" },
    mission: { status: "available" },
    inputs: {
      core_input_set: { status: "available" },
      profile: { status: "available", sha256 },
    },
    capabilities: [], artifacts: [], mappings: [], resolutions: [], diagnostics: [],
    coverage: { status: "complete", scope: { domains: [] }, reason: null, summary: {}, records: [] },
    evidence: [], external_tools: [],
  }));
}

test("parses YAML 1.2 Profile and validates it with the package JSON Schema", async () => {
  const sha = await sha256Utf8(PROFILE);
  const profile = parseProjectionProfile("/tmp/profile.yaml", sha, PROFILE);
  const schemaSha = await sha256Utf8(SCHEMA);
  const validation = validateProjectionProfile(descriptor(), {
    path: "/tmp/package/schemas/profile.json",
    text: SCHEMA,
    sha256: schemaSha,
    contained: true,
    sha256Matches: true,
  }, profile);
  assert.equal(validation.valid, true, validation.errors.join("\n"));
  assert.equal(profile.identity.integrationId, "example-integration");
});

test("rejects duplicate YAML keys instead of silently accepting authored ambiguity", async () => {
  const duplicate = `${PROFILE}\nsettings: {}\n`;
  const sha = await sha256Utf8(duplicate);
  assert.throws(() => parseProjectionProfile("/tmp/profile.yaml", sha, duplicate), /Map keys must be unique|unique/i);
});

test("rejects untrusted or digest-mismatched published schemas", async () => {
  const profile = parseProjectionProfile("/tmp/profile.yaml", await sha256Utf8(PROFILE), PROFILE);
  const validation = validateProjectionProfile(descriptor(), {
    path: "/outside/profile.json",
    text: SCHEMA,
    sha256: await sha256Utf8(SCHEMA),
    contained: false,
    sha256Matches: false,
  }, profile);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((item) => item.includes("package root")));
  assert.ok(validation.errors.some((item) => item.includes("SHA-256")));
});

test("selects Profile schemas by exact integration schema identity", () => {
  assert.equal(selectProfileSchema(descriptor(), "0.1-candidate").path, "schemas/profile.json");
  assert.throws(() => selectProfileSchema(descriptor(), "future"), /exactly one/);
});

test("freshness compares exact Profile digests and never timestamps", async () => {
  const sha = await sha256Utf8(PROFILE);
  const profile = parseProjectionProfile("/tmp/profile.yaml", sha, PROFILE);
  assert.equal(assessProfileFreshness(resultWithProfileSha(sha), profile).state, "fresh");
  assert.equal(assessProfileFreshness(resultWithProfileSha("different"), profile).state, "stale");
  assert.equal(assessProfileFreshness(null, profile).state, "unknown");
});
