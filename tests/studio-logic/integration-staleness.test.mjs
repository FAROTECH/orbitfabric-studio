import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { assessIntegrationFreshness } = require("../../.test-dist/integrations/staleness.js");

function result(coreSha = "core-sha", profileSha = "profile-sha") {
  return {
    resultVersion: "0.1-candidate",
    inputs: {
      coreInputSet: { status: "available", sha256: coreSha },
      profile: { status: "available", sha256: profileSha },
      operationInputs: [],
    },
  };
}

function vNextResult(coreSha = "core-sha", profileSha = "profile-sha") {
  return {
    resultVersion: "0.2-lab",
    inputs: {
      coreInputSet: { status: "available", sha256: coreSha },
      profile: { status: "available", sha256: profileSha },
      operationInputs: [],
    },
  };
}

function inputSet(sha = "core-sha") {
  return { inputSetSha256: sha };
}

function profile(sha = "profile-sha") {
  return { sha256: sha };
}

test("integration freshness is fresh only when both exact fingerprints match", () => {
  assert.deepEqual(
    assessIntegrationFreshness(result(), inputSet(), profile()),
    {
      state: "fresh",
      reason: "Result matches the exact current Core Input Set and Projection Profile bytes.",
    },
  );
});

test("zero-input vNext uses the same exact Core/Profile freshness rule", () => {
  assert.deepEqual(
    assessIntegrationFreshness(vNextResult(), inputSet(), profile()),
    {
      state: "fresh",
      reason: "Result matches the exact current Core Input Set and Projection Profile bytes.",
    },
  );
});

test("vNext freshness is unknown when operation-specific provenance is not yet modeled", () => {
  const value = vNextResult();
  value.inputs.operationInputs = [
    {
      role: "scenario",
      status: "available",
      sha256: "scenario-sha",
    },
  ];

  const assessment = assessIntegrationFreshness(value, inputSet(), profile());
  assert.equal(assessment.state, "unknown");
  assert.match(assessment.reason, /operation-specific semantic inputs/);
});

test("integration freshness is stale when the Core Input Set changes", () => {
  const assessment = assessIntegrationFreshness(result(), inputSet("new-core-sha"), profile());
  assert.equal(assessment.state, "stale");
  assert.match(assessment.reason, /Core Integration Input Set changed/);
});

test("integration freshness is stale when the Projection Profile changes", () => {
  const assessment = assessIntegrationFreshness(result(), inputSet(), profile("new-profile-sha"));
  assert.equal(assessment.state, "stale");
  assert.match(assessment.reason, /Projection Profile changed/);
});

test("integration freshness stays unknown when provenance is unavailable", () => {
  const missingProfileProvenance = result();
  missingProfileProvenance.inputs.profile = { status: "unavailable", sha256: null };

  assert.equal(
    assessIntegrationFreshness(missingProfileProvenance, inputSet(), profile()).state,
    "unknown",
  );
  assert.equal(assessIntegrationFreshness(null, inputSet(), profile()).state, "unknown");
  assert.equal(assessIntegrationFreshness(result(), null, profile()).state, "unknown");
  assert.equal(assessIntegrationFreshness(result(), inputSet(), null).state, "unknown");
});

test("fingerprints are compared case-insensitively and never by timestamp", () => {
  assert.equal(
    assessIntegrationFreshness(
      result("ABCDEF", "1234AB"),
      inputSet("abcdef"),
      profile("1234ab"),
    ).state,
    "fresh",
  );
});
