import Ajv2020 from "ajv/dist/2020.js";
import type { AnySchema } from "ajv";
import { parseDocument } from "yaml";
import type {
  IntegrationPackageDescriptor,
  IntegrationProfileDocument,
  IntegrationProfileFreshnessAssessment,
  IntegrationProfileSchema,
  IntegrationProfileValidation,
  IntegrationResult,
  IntegrationTextDigestRead,
} from "./contracts";

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function stringValue(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value;
}

export function selectProfileSchema(
  descriptor: IntegrationPackageDescriptor,
  schemaVersion: string,
): IntegrationProfileSchema {
  const matches = descriptor.profileSchemas.filter((item) => item.schemaVersion === schemaVersion);
  if (matches.length !== 1) {
    throw new Error(
      `Integration Package must publish exactly one Profile schema for ${schemaVersion}; found ${matches.length}.`,
    );
  }
  return matches[0];
}

export function parseProjectionProfile(
  path: string,
  sha256: string,
  text: string,
): IntegrationProfileDocument {
  const document = parseDocument(text, {
    version: "1.2",
    uniqueKeys: true,
    prettyErrors: true,
  });
  if (document.errors.length > 0) {
    throw new Error(document.errors.map((error) => error.message).join("\n"));
  }
  const value = record(document.toJS({ maxAliasCount: 100 }), "Projection Profile");
  const profile = record(value.profile, "profile");
  const integration = record(value.integration, "integration");
  return {
    path,
    sha256,
    identity: {
      kind: stringValue(value.kind, "kind"),
      profileVersion: stringValue(value.profile_version, "profile_version"),
      id: stringValue(profile.id, "profile.id"),
      version: stringValue(profile.version, "profile.version"),
      integrationId: stringValue(integration.id, "integration.id"),
      schemaVersion: stringValue(integration.schema_version, "integration.schema_version"),
    },
    value,
  };
}

export function validateProjectionProfile(
  descriptor: IntegrationPackageDescriptor,
  schemaRead: IntegrationTextDigestRead,
  profile: IntegrationProfileDocument,
): IntegrationProfileValidation {
  const errors: string[] = [];
  if (schemaRead.contained !== true) {
    errors.push("Published Profile schema does not resolve inside the Integration Package root.");
  }
  if (schemaRead.sha256Matches !== true) {
    errors.push("Published Profile schema does not match its manifest SHA-256.");
  }
  if (profile.identity.kind !== "orbitfabric.projection_profile") {
    errors.push(`Unsupported Profile kind: ${profile.identity.kind}.`);
  }
  if (!descriptor.profileCompatibility.profileVersions.includes(profile.identity.profileVersion)) {
    errors.push(`Unsupported Profile envelope version: ${profile.identity.profileVersion}.`);
  }
  if (profile.identity.integrationId !== descriptor.integrationId) {
    errors.push(
      `Profile integration.id ${profile.identity.integrationId} does not match package ${descriptor.integrationId}.`,
    );
  }
  const selected = selectProfileSchema(descriptor, profile.identity.schemaVersion);
  if (selected.format !== "json-schema-2020-12") {
    errors.push(`Unsupported Profile schema format: ${selected.format}.`);
  }

  if (errors.length === 0) {
    let schema: AnySchema;
    try {
      schema = JSON.parse(schemaRead.text) as AnySchema;
    } catch (error) {
      errors.push(`Published Profile schema is not valid JSON: ${String(error)}`);
      return { valid: false, errors };
    }

    try {
      // Keep AJV strict checks enabled, but do not impose its optional strictTypes
      // authoring convention on package-owned Draft 2020-12 schemas. A valid schema
      // may use properties in a conditional/allOf subschema without repeating
      // type: object at that exact schema location.
      const ajv = new Ajv2020({ allErrors: true, strict: true, strictTypes: false });
      const validate = ajv.compile(schema);
      if (!validate(profile.value)) {
        for (const error of validate.errors ?? []) {
          errors.push(`${error.instancePath || "/"} ${error.message ?? "is invalid"}`);
        }
      }
    } catch (error) {
      errors.push(`Published Profile schema cannot be compiled offline: ${String(error)}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function assessProfileFreshness(
  result: IntegrationResult | null,
  profile: IntegrationProfileDocument,
): IntegrationProfileFreshnessAssessment {
  if (!result) {
    return { state: "unknown", reason: "No Integration Result is associated with this Profile." };
  }
  const provenance = result.inputs.profile;
  if (provenance.status !== "available") {
    return { state: "unknown", reason: "Integration Result has no reliable Profile provenance." };
  }
  const resultSha = typeof provenance.sha256 === "string" ? provenance.sha256 : null;
  if (!resultSha) {
    return { state: "unknown", reason: "Integration Result does not declare the exact Profile SHA-256." };
  }
  if (resultSha.toLowerCase() === profile.sha256.toLowerCase()) {
    return { state: "fresh", reason: "Integration Result was produced from these exact Profile bytes." };
  }
  return { state: "stale", reason: "Projection Profile bytes changed after the Integration Result was produced." };
}
