import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);
const {
  parseIntegrationPackageManifest,
} = require("../../.test-dist/integrations/manifest.js");
const {
  evaluateIntegrationCompatibility,
  parseCoreIntegrationInputManifest,
} = require("../../.test-dist/integrations/compatibility.js");
const {
  parseProjectionProfile,
  selectProfileSchema,
  validateProjectionProfile,
} = require("../../.test-dist/integrations/profile.js");
const {
  createExecutionAuthorization,
  validateAdapterRunPreflight,
} = require("../../.test-dist/integrations/execution.js");
const {
  parseIntegrationResult,
  validateIntegrationResult,
} = require("../../.test-dist/integrations/result.js");
const {
  assessIntegrationFreshness,
} = require("../../.test-dist/integrations/staleness.js");

const pocRoot = requiredEnv("ORBITFABRIC_STUDIO_REFERENCE_POC");
const inputManifestPath = requiredEnv("ORBITFABRIC_STUDIO_REFERENCE_INPUT_MANIFEST");
const resultPath = requiredEnv("ORBITFABRIC_STUDIO_REFERENCE_RESULT");

const packageManifestPath = join(
  pocRoot,
  "reference_adapter",
  "src",
  "orbitfabric_openobsw_opensvf",
  "integration_package.json",
);
const profilePath = join(
  pocRoot,
  "orbitfabric_models",
  "profiles",
  "openobsw_opensvf_poc_v0.yaml",
);

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for reference integration acceptance.`);
  return value;
}

function sha256Bytes(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function readBytes(path) {
  return readFileSync(path);
}

function readText(path) {
  return readFileSync(path, "utf8");
}

function containedFile(root, relativePath) {
  if (!relativePath || isAbsolute(relativePath)) return false;
  const resolvedRoot = resolve(root);
  const candidate = resolve(resolvedRoot, relativePath);
  return candidate.startsWith(`${resolvedRoot}${sep}`);
}

function artifactChecks(result, bundleRoot) {
  return result.artifacts.map((artifact) => {
    if (artifact.status !== "generated") {
      return {
        artifactId: artifact.id,
        path: artifact.path,
        exists: null,
        sha256Matches: null,
        contained: null,
      };
    }

    const contained = containedFile(bundleRoot, artifact.path);
    const candidate = artifact.path && contained ? join(bundleRoot, artifact.path) : null;
    const exists = candidate ? existsSync(candidate) : false;
    const sha256Matches =
      candidate && exists && artifact.sha256
        ? sha256Bytes(readBytes(candidate)).toLowerCase() === artifact.sha256.toLowerCase()
        : false;

    return {
      artifactId: artifact.id,
      path: artifact.path,
      exists,
      sha256Matches,
      contained,
    };
  });
}

function entityIndexPath(inputManifest) {
  const surface = inputManifest.surfaces.find((item) => item.role === "entity_index");
  assert.ok(surface, "reference Input Set must declare Entity Index surface");
  assert.equal(surface.status, "available");
  assert.ok(surface.path, "available Entity Index surface must have a path");
  return resolve(dirname(inputManifestPath), surface.path);
}

test("Studio consumes the real reference Integration Package end-to-end", () => {
  const packageText = readText(packageManifestPath);
  const descriptor = parseIntegrationPackageManifest(packageManifestPath, packageText);

  assert.equal(descriptor.integrationId, "orbitfabric-openobsw-opensvf");
  assert.equal(descriptor.execution.protocol, "orbitfabric.adapter_cli.v0");
  assert.deepEqual(descriptor.operations.map((item) => item.id), ["project"]);

  const inputText = readText(inputManifestPath);
  const inputSet = parseCoreIntegrationInputManifest(inputText);
  const compatibility = evaluateIntegrationCompatibility(descriptor, inputSet);
  assert.deepEqual(
    compatibility,
    { state: "compatible", reasons: [] },
    compatibility.reasons.map((item) => item.message).join("\n"),
  );

  const profileBytes = readBytes(profilePath);
  const profileText = profileBytes.toString("utf8");
  const profile = parseProjectionProfile(profilePath, sha256Bytes(profileBytes), profileText);
  const schemaDescriptor = selectProfileSchema(descriptor, profile.identity.schemaVersion);
  const schemaPath = resolve(dirname(packageManifestPath), schemaDescriptor.path);
  const schemaBytes = readBytes(schemaPath);
  const schemaSha = sha256Bytes(schemaBytes);
  const schemaRelative = relative(dirname(packageManifestPath), schemaPath);
  const schemaRead = {
    path: schemaPath,
    text: schemaBytes.toString("utf8"),
    sha256: schemaSha,
    contained: !schemaRelative.startsWith("..") && !isAbsolute(schemaRelative),
    sha256Matches: schemaSha.toLowerCase() === schemaDescriptor.sha256.toLowerCase(),
  };
  const profileValidation = validateProjectionProfile(descriptor, schemaRead, profile);
  assert.equal(
    profileValidation.valid,
    true,
    profileValidation.errors.join("\n"),
  );

  const authorization = createExecutionAuthorization(descriptor);
  const runRequest = {
    operation: "project",
    inputSetManifestPath: inputManifestPath,
    profilePath,
    outputDir: dirname(resultPath),
  };
  assert.deepEqual(validateAdapterRunPreflight(descriptor, authorization, runRequest), []);

  const resultText = readText(resultPath);
  const result = parseIntegrationResult(resultText);
  const bundle = {
    resultPath,
    resultText,
    artifactChecks: artifactChecks(result, dirname(resultPath)),
  };
  const resultValidation = validateIntegrationResult(result, bundle);
  assert.equal(
    resultValidation.usable,
    true,
    resultValidation.issues.map((item) => `${item.code}: ${item.message}`).join("\n"),
  );

  assert.equal(result.result, "succeeded");
  assert.equal(result.integration.id, descriptor.integrationId);
  assert.equal(result.adapter.id, descriptor.adapterId);
  assert.equal(result.adapter.version, descriptor.adapterVersion);
  assert.equal(result.operation.id, "project");

  const packageCapabilities = new Set(descriptor.advertisedCapabilities);
  const operation = descriptor.operations.find((item) => item.id === result.operation.id);
  assert.ok(operation);
  const operationCapabilities = new Set(operation.capabilities);
  assert.ok(result.capabilities.every((item) => packageCapabilities.has(item)));
  assert.ok(result.capabilities.every((item) => operationCapabilities.has(item)));

  assert.equal(result.coverage.status, "complete");
  const coverageStates = new Set(result.coverage.records.map((item) => item.state));
  assert.ok(coverageStates.has("projected"));
  assert.ok(
    coverageStates.has("not_projected"),
    "reference mission must prove complete accounting without full projection",
  );

  const entityIndex = JSON.parse(readText(entityIndexPath(inputSet)));
  const entityKeys = new Set(
    entityIndex.entities.map((item) => `${item.domain}\u0000${item.id}`),
  );
  for (const mapping of result.mappings) {
    for (const source of mapping.sources) {
      assert.ok(
        entityKeys.has(`${source.domain}\u0000${source.id}`),
        `mapping ${mapping.id} source ${source.domain}/${source.id} must resolve in Core Entity Index`,
      );
    }
  }

  const profileBindingIds = new Set(
    Array.isArray(profile.value.bindings)
      ? profile.value.bindings
          .map((item) => (item && typeof item === "object" ? item.id : null))
          .filter((item) => typeof item === "string")
      : [],
  );
  for (const mapping of result.mappings) {
    for (const binding of mapping.profileBindings) {
      assert.ok(profileBindingIds.has(binding), `mapping ${mapping.id} binding ${binding} must resolve`);
    }
  }

  const freshness = assessIntegrationFreshness(result, inputSet, profile);
  assert.equal(freshness.state, "fresh", freshness.reason);
});
