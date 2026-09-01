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
    resultVersion: "0.2-candidate",
    inputs: {
      coreInputSet: { status: "available", sha256: coreSha },
      profile: { status: "available", sha256: profileSha },
      operationInputs: [],
    },
  };
}

function g4Result(scenarioSha = "scenario-sha") {
  const value = vNextResult();
  value.inputs.operationInputs = [
    {
      role: "scenario",
      status: "available",
      id: "scenario.ping",
      sha256: scenarioSha,
      reason: null,
    },
  ];
  return value;
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

test("G4 is fresh only when current Scenario bytes match consumed provenance", () => {
  assert.deepEqual(
    assessIntegrationFreshness(
      g4Result("ABCDEF"),
      inputSet(),
      profile(),
      [{ role: "scenario", sha256: "abcdef" }],
    ),
    {
      state: "fresh",
      reason:
        "Result matches the exact current Core Input Set, Projection Profile and operation-specific input bytes.",
    },
  );
});

test("G4 is stale when Scenario bytes change while Core and Profile remain current", () => {
  const assessment = assessIntegrationFreshness(
    g4Result("old-scenario"),
    inputSet(),
    profile(),
    [{ role: "scenario", sha256: "new-scenario" }],
  );
  assert.equal(assessment.state, "stale");
  assert.match(assessment.reason, /Operation input scenario changed/);
});

test("G4 freshness is unknown without exact current Scenario identity", () => {
  assert.equal(
    assessIntegrationFreshness(g4Result(), inputSet(), profile()).state,
    "unknown",
  );
  assert.equal(
    assessIntegrationFreshness(
      g4Result(),
      inputSet(),
      profile(),
      [{ role: "scenario", sha256: null }],
    ).state,
    "unknown",
  );

  const unavailable = g4Result();
  unavailable.inputs.operationInputs = [
    {
      role: "scenario",
      status: "unavailable",
      id: null,
      sha256: null,
      reason: "not resolved",
    },
  ];
  assert.equal(
    assessIntegrationFreshness(
      unavailable,
      inputSet(),
      profile(),
      [{ role: "scenario", sha256: "scenario-sha" }],
    ).state,
    "unknown",
  );
});

test("vNext freshness is unknown when current bindings exist but Result omitted them", () => {
  const assessment = assessIntegrationFreshness(
    vNextResult(),
    inputSet(),
    profile(),
    [{ role: "scenario", sha256: "scenario-sha" }],
  );
  assert.equal(assessment.state, "unknown");
  assert.match(assessment.reason, /Result contains no consumed operation-input provenance/);
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
