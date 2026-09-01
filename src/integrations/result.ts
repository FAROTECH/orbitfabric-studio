import type {
  IntegrationArtifact,
  IntegrationBundleRead,
  IntegrationConsumedOperationInput,
  IntegrationCoreRef,
  IntegrationCoverage,
  IntegrationCoverageRecord,
  IntegrationDiagnostic,
  IntegrationMapping,
  IntegrationResolution,
  IntegrationResult,
  IntegrationResultValidation,
  IntegrationTargetRef,
} from "./contracts";

const RESULT_V0 = "0.1-candidate";
const RESULT_VNEXT_LAB = "0.2-lab";

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

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function strictNullableString(value: unknown, label: string): string | null {
  if (value === null) return null;
  if (typeof value === "string" && value.length > 0) return value;
  throw new Error(`${label} must be null or a non-empty string.`);
}

function strings(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${label} must be an array of strings.`);
  }
  return [...value];
}

function items(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }
  return value;
}

function consumedOperationInput(value: unknown, index: number): IntegrationConsumedOperationInput {
  const label = `inputs.operation_inputs[${index}]`;
  const item = record(value, label);
  const keys = Object.keys(item).sort();
  const expected = ["id", "reason", "role", "sha256", "status"];
  if (JSON.stringify(keys) !== JSON.stringify(expected)) {
    throw new Error(`${label} must contain exactly role, status, id, sha256 and reason.`);
  }

  const status = stringValue(item.status, `${label}.status`);
  if (status !== "available" && status !== "unavailable") {
    throw new Error(`${label}.status must be available or unavailable.`);
  }

  const parsed: IntegrationConsumedOperationInput = {
    role: stringValue(item.role, `${label}.role`),
    status,
    id: strictNullableString(item.id, `${label}.id`),
    sha256: strictNullableString(item.sha256, `${label}.sha256`),
    reason: strictNullableString(item.reason, `${label}.reason`),
  };

  if (status === "available") {
    if (!parsed.id || !parsed.sha256 || parsed.reason !== null) {
      throw new Error(
        `${label} available provenance requires id and sha256 and requires reason=null.`,
      );
    }
  } else if (parsed.id !== null || parsed.sha256 !== null || parsed.reason === null) {
    throw new Error(
      `${label} unavailable provenance requires id=null, sha256=null and a non-empty reason.`,
    );
  }

  return parsed;
}

function operationInputs(
  inputs: Record<string, unknown>,
  resultVersion: string,
): IntegrationConsumedOperationInput[] {
  if (resultVersion === RESULT_V0) {
    if (inputs.operation_inputs !== undefined) {
      throw new Error("inputs.operation_inputs is not part of frozen Integration Result v0.");
    }
    return [];
  }

  if (resultVersion === RESULT_VNEXT_LAB) {
    const values = items(inputs.operation_inputs, "inputs.operation_inputs").map(
      consumedOperationInput,
    );
    const seen = new Set<string>();
    for (const item of values) {
      if (seen.has(item.role)) {
        throw new Error(`inputs.operation_inputs contains duplicate role ${item.role}.`);
      }
      seen.add(item.role);
    }
    return values;
  }

  throw new Error(`Unsupported Result version: ${resultVersion}.`);
}

function coreRef(value: unknown, label: string): IntegrationCoreRef {
  const item = record(value, label);
  return {
    domain: stringValue(item.domain, `${label}.domain`),
    id: stringValue(item.id, `${label}.id`),
  };
}

function targetRef(value: unknown, label: string): IntegrationTargetRef {
  const item = record(value, label);
  return {
    namespace: stringValue(item.namespace, `${label}.namespace`),
    kind: stringValue(item.kind, `${label}.kind`),
    id: stringValue(item.id, `${label}.id`),
  };
}

function artifact(value: unknown, index: number): IntegrationArtifact {
  const item = record(value, `artifacts[${index}]`);
  return {
    id: stringValue(item.id, `artifacts[${index}].id`),
    kind: stringValue(item.kind, `artifacts[${index}].kind`),
    requirement: stringValue(item.requirement, `artifacts[${index}].requirement`),
    status: stringValue(item.status, `artifacts[${index}].status`),
    path: nullableString(item.path),
    mediaType: nullableString(item.media_type),
    sha256: nullableString(item.sha256),
    reason: nullableString(item.reason),
    retainedPartial: item.retained_partial === true,
    derivedFromMappings: strings(
      item.derived_from_mappings,
      `artifacts[${index}].derived_from_mappings`,
    ),
  };
}

function mapping(value: unknown, index: number): IntegrationMapping {
  const item = record(value, `mappings[${index}]`);
  return {
    id: stringValue(item.id, `mappings[${index}].id`),
    sources: items(item.sources, `mappings[${index}].sources`).map((entry, sourceIndex) =>
      coreRef(entry, `mappings[${index}].sources[${sourceIndex}]`),
    ),
    profileBindings: strings(item.profile_bindings, `mappings[${index}].profile_bindings`),
    targets: items(item.targets, `mappings[${index}].targets`).map((entry, targetIndex) =>
      targetRef(entry, `mappings[${index}].targets[${targetIndex}]`),
    ),
  };
}

function resolution(value: unknown, index: number): IntegrationResolution {
  const item = record(value, `resolutions[${index}]`);
  return {
    id: stringValue(item.id, `resolutions[${index}].id`),
    mapping: nullableString(item.mapping),
    binding: nullableString(item.binding),
    sources: items(item.sources, `resolutions[${index}].sources`).map((entry, sourceIndex) =>
      coreRef(entry, `resolutions[${index}].sources[${sourceIndex}]`),
    ),
    property: stringValue(item.property, `resolutions[${index}].property`),
    value: item.value,
    origin: stringValue(item.origin, `resolutions[${index}].origin`),
  };
}

function diagnostic(value: unknown, index: number): IntegrationDiagnostic {
  const item = record(value, `diagnostics[${index}]`);
  return {
    id: stringValue(item.id, `diagnostics[${index}].id`),
    owner: stringValue(item.owner, `diagnostics[${index}].owner`),
    producer: stringValue(item.producer, `diagnostics[${index}].producer`),
    phase: stringValue(item.phase, `diagnostics[${index}].phase`),
    severity: stringValue(item.severity, `diagnostics[${index}].severity`),
    code: stringValue(item.code, `diagnostics[${index}].code`),
    message: stringValue(item.message, `diagnostics[${index}].message`),
    sources: items(item.sources, `diagnostics[${index}].sources`).map((entry, sourceIndex) =>
      coreRef(entry, `diagnostics[${index}].sources[${sourceIndex}]`),
    ),
    profileBindings: strings(item.profile_bindings, `diagnostics[${index}].profile_bindings`),
    targets: items(item.targets, `diagnostics[${index}].targets`).map((entry, targetIndex) =>
      targetRef(entry, `diagnostics[${index}].targets[${targetIndex}]`),
    ),
  };
}

function coverageRecord(value: unknown, index: number): IntegrationCoverageRecord {
  const item = record(value, `coverage.records[${index}]`);
  return {
    source: coreRef(item.source, `coverage.records[${index}].source`),
    state: stringValue(item.state, `coverage.records[${index}].state`),
    mappings: strings(item.mappings, `coverage.records[${index}].mappings`),
    profileBindings: strings(item.profile_bindings, `coverage.records[${index}].profile_bindings`),
    diagnostics: strings(item.diagnostics, `coverage.records[${index}].diagnostics`),
    reason: nullableString(item.reason),
  };
}

function coverage(value: unknown): IntegrationCoverage {
  const item = record(value, "coverage");
  const scope = record(item.scope, "coverage.scope");
  const summaryValue = record(item.summary, "coverage.summary");
  const summary: Record<string, number> = {};
  for (const [key, count] of Object.entries(summaryValue)) {
    if (typeof count !== "number" || !Number.isInteger(count) || count < 0) {
      throw new Error(`coverage.summary.${key} must be a non-negative integer.`);
    }
    summary[key] = count;
  }
  return {
    status: stringValue(item.status, "coverage.status"),
    scope: { domains: strings(scope.domains, "coverage.scope.domains") },
    reason: nullableString(item.reason),
    summary,
    records: items(item.records, "coverage.records").map(coverageRecord),
  };
}

export function parseIntegrationResult(text: string): IntegrationResult {
  const root = record(JSON.parse(text) as unknown, "Integration Result");
  const resultVersion = stringValue(root.result_version, "result_version");
  const integration = record(root.integration, "integration");
  const adapter = record(root.adapter, "adapter");
  const operation = record(root.operation, "operation");
  const inputs = record(root.inputs, "inputs");

  return {
    kind: stringValue(root.kind, "kind"),
    resultVersion,
    result: stringValue(root.result, "result"),
    integration: {
      id: stringValue(integration.id, "integration.id"),
      schemaVersion: nullableString(integration.schema_version),
    },
    adapter: {
      id: stringValue(adapter.id, "adapter.id"),
      version: stringValue(adapter.version, "adapter.version"),
    },
    operation: { id: stringValue(operation.id, "operation.id") },
    mission: record(root.mission, "mission"),
    inputs: {
      coreInputSet: record(inputs.core_input_set, "inputs.core_input_set"),
      profile: record(inputs.profile, "inputs.profile"),
      operationInputs: operationInputs(inputs, resultVersion),
    },
    capabilities: strings(root.capabilities, "capabilities"),
    artifacts: items(root.artifacts, "artifacts").map(artifact),
    mappings: items(root.mappings, "mappings").map(mapping),
    resolutions: items(root.resolutions, "resolutions").map(resolution),
    diagnostics: items(root.diagnostics, "diagnostics").map(diagnostic),
    coverage: coverage(root.coverage),
    evidence: items(root.evidence, "evidence").map((item, index) =>
      record(item, `evidence[${index}]`),
    ),
    externalTools: items(root.external_tools, "external_tools").map((item, index) =>
      record(item, `external_tools[${index}]`),
    ),
  };
}

function available(recordValue: Record<string, unknown>): boolean {
  return recordValue.status === "available";
}

export function validateIntegrationResult(
  result: IntegrationResult,
  bundle?: IntegrationBundleRead,
): IntegrationResultValidation {
  const issues: { code: string; message: string }[] = [];
  if (result.kind !== "orbitfabric.integration_result") {
    issues.push({ code: "result.kind", message: `Unsupported Result kind: ${result.kind}.` });
  }
  if (![RESULT_V0, RESULT_VNEXT_LAB].includes(result.resultVersion)) {
    issues.push({
      code: "result.version",
      message: `Unsupported Result version: ${result.resultVersion}.`,
    });
  }
  if (!["succeeded", "succeeded_with_warnings", "failed"].includes(result.result)) {
    issues.push({ code: "result.state", message: `Unsupported Result state: ${result.result}.` });
  }

  if (result.resultVersion === RESULT_VNEXT_LAB) {
    for (const input of result.inputs.operationInputs) {
      if (input.status === "available") {
        if (!input.id || !input.sha256 || input.reason !== null) {
          issues.push({
            code: "operation_input.available_provenance",
            message: `Operation input ${input.role} has incomplete available provenance.`,
          });
        }
      } else if (input.id !== null || input.sha256 !== null || !input.reason) {
        issues.push({
          code: "operation_input.unavailable_provenance",
          message: `Operation input ${input.role} has invalid unavailable provenance.`,
        });
      }
      if (result.result !== "failed" && input.status !== "available") {
        issues.push({
          code: "operation_input.success_without_provenance",
          message: `Successful Result cannot claim unavailable required operation input ${input.role}.`,
        });
      }
    }
  }

  const mappingIds = new Set<string>();
  for (const item of result.mappings) {
    if (mappingIds.has(item.id)) {
      issues.push({ code: "mapping.duplicate", message: `Duplicate mapping id: ${item.id}.` });
    }
    mappingIds.add(item.id);
    if (item.sources.length === 0 || item.targets.length === 0) {
      issues.push({
        code: "mapping.cardinality",
        message: `Mapping ${item.id} must contain at least one source and target.`,
      });
    }
  }

  const diagnosticIds = new Set<string>();
  for (const item of result.diagnostics) {
    if (diagnosticIds.has(item.id)) {
      issues.push({ code: "diagnostic.duplicate", message: `Duplicate diagnostic id: ${item.id}.` });
    }
    diagnosticIds.add(item.id);
  }

  const profileAvailable = available(result.inputs.profile);
  const coreAvailable = available(result.inputs.coreInputSet);
  for (const item of result.mappings) {
    if (!profileAvailable && item.profileBindings.length > 0) {
      issues.push({
        code: "profile.binding_without_provenance",
        message: `Mapping ${item.id} asserts Profile bindings without available Profile provenance.`,
      });
    }
    if (!coreAvailable && item.sources.length > 0) {
      issues.push({
        code: "core.ref_without_provenance",
        message: `Mapping ${item.id} asserts Core sources without available Core provenance.`,
      });
    }
  }

  for (const item of result.resolutions) {
    if (item.mapping && !mappingIds.has(item.mapping)) {
      issues.push({
        code: "resolution.mapping_ref",
        message: `Resolution ${item.id} references unknown mapping ${item.mapping}.`,
      });
    }
    if (!profileAvailable && item.binding) {
      issues.push({
        code: "resolution.binding_without_provenance",
        message: `Resolution ${item.id} asserts a Profile binding without Profile provenance.`,
      });
    }
  }

  for (const item of result.artifacts) {
    for (const mappingId of item.derivedFromMappings) {
      if (!mappingIds.has(mappingId)) {
        issues.push({
          code: "artifact.mapping_ref",
          message: `Artifact ${item.id} references unknown mapping ${mappingId}.`,
        });
      }
    }
    if (item.status === "generated" && (!item.path || !item.sha256)) {
      issues.push({
        code: "artifact.generated_metadata",
        message: `Generated artifact ${item.id} requires path and sha256.`,
      });
    }
  }

  const seenCoverage = new Set<string>();
  const coverageCounts: Record<string, number> = {};
  for (const item of result.coverage.records) {
    const sourceKey = `${item.source.domain}\u0000${item.source.id}`;
    if (seenCoverage.has(sourceKey)) {
      issues.push({
        code: "coverage.duplicate_source",
        message: `Coverage contains duplicate source ${item.source.domain}:${item.source.id}.`,
      });
    }
    seenCoverage.add(sourceKey);
    coverageCounts[item.state] = (coverageCounts[item.state] ?? 0) + 1;
    for (const mappingId of item.mappings) {
      if (!mappingIds.has(mappingId)) {
        issues.push({
          code: "coverage.mapping_ref",
          message: `Coverage source ${item.source.id} references unknown mapping ${mappingId}.`,
        });
      }
    }
    for (const diagnosticId of item.diagnostics) {
      if (!diagnosticIds.has(diagnosticId)) {
        issues.push({
          code: "coverage.diagnostic_ref",
          message: `Coverage source ${item.source.id} references unknown diagnostic ${diagnosticId}.`,
        });
      }
    }
    if (!profileAvailable && item.profileBindings.length > 0) {
      issues.push({
        code: "coverage.binding_without_provenance",
        message: `Coverage source ${item.source.id} asserts Profile bindings without provenance.`,
      });
    }
    if (!coreAvailable) {
      issues.push({
        code: "coverage.core_ref_without_provenance",
        message: `Coverage source ${item.source.id} exists while Core provenance is unavailable.`,
      });
    }
  }

  if (Object.keys(result.coverage.summary).length > 0) {
    const expected = JSON.stringify(Object.entries(coverageCounts).sort());
    const actual = JSON.stringify(Object.entries(result.coverage.summary).sort());
    if (actual !== expected) {
      issues.push({
        code: "coverage.summary",
        message: "Coverage summary is not exactly derivable from coverage records.",
      });
    }
  }

  if (bundle) {
    const checks = new Map(bundle.artifactChecks.map((item) => [item.artifactId, item]));
    for (const artifactValue of result.artifacts) {
      if (artifactValue.status !== "generated") continue;
      const check = checks.get(artifactValue.id);
      if (!check) {
        issues.push({
          code: "artifact.check_missing",
          message: `No filesystem integrity check is available for ${artifactValue.id}.`,
        });
        continue;
      }
      if (check.contained !== true) {
        issues.push({
          code: "artifact.path_escape",
          message: `Artifact ${artifactValue.id} path escapes the Result bundle root.`,
        });
      }
      if (check.exists !== true) {
        issues.push({
          code: "artifact.missing",
          message: `Generated artifact ${artifactValue.id} is missing from the bundle.`,
        });
      }
      if (check.sha256Matches !== true) {
        issues.push({
          code: "artifact.digest",
          message: `Generated artifact ${artifactValue.id} does not match its declared SHA-256.`,
        });
      }
    }
  }

  const requiredArtifactFailure = result.artifacts.some(
    (item) => item.requirement === "required" && item.status !== "generated",
  );
  if (result.result !== "failed" && requiredArtifactFailure) {
    issues.push({
      code: "result.required_artifact",
      message: "Successful Result contains a required artifact that was not generated.",
    });
  }

  return { usable: issues.length === 0, issues };
}
