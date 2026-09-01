import type {
  IntegrationOperationInputRequirement,
  IntegrationPackageDescriptor,
  IntegrationPackageOperation,
  IntegrationProfileSchema,
  IntegrationSurfaceCompatibility,
} from "./contracts";

const MANIFEST_V0 = "0.1-candidate";
const PROTOCOL_V0 = "orbitfabric.adapter_cli.v0";
const MANIFEST_VNEXT_LAB = "0.2-lab";
const PROTOCOL_VNEXT_LAB = "orbitfabric.adapter_cli.vnext-lab";

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

function stringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${label} must be an array of strings.`);
  }
  return [...value];
}

function arrayValue(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }
  return value;
}

function surface(item: unknown, index: number): IntegrationSurfaceCompatibility {
  const value = record(item, `core_input_compatibility.surfaces[${index}]`);
  return {
    role: stringValue(value.role, `surfaces[${index}].role`),
    kind: stringValue(value.kind, `surfaces[${index}].kind`),
    formatVersions: stringArray(value.format_versions, `surfaces[${index}].format_versions`),
  };
}

function operationRequirement(
  item: unknown,
  operationIndex: number,
  requirementIndex: number,
): IntegrationOperationInputRequirement {
  return {
    ...record(
      item,
      `operations[${operationIndex}].input_requirements[${requirementIndex}]`,
    ),
  };
}

function operation(
  item: unknown,
  index: number,
  manifestVersion: string,
): IntegrationPackageOperation {
  const value = record(item, `operations[${index}]`);
  let inputRequirements: IntegrationOperationInputRequirement[] = [];

  if (manifestVersion === MANIFEST_V0) {
    if (value.input_requirements !== undefined) {
      throw new Error(
        `operations[${index}].input_requirements is not part of frozen Integration Package manifest v0.`,
      );
    }
  } else if (manifestVersion === MANIFEST_VNEXT_LAB) {
    inputRequirements = arrayValue(
      value.input_requirements,
      `operations[${index}].input_requirements`,
    ).map((entry, requirementIndex) => operationRequirement(entry, index, requirementIndex));

    if (inputRequirements.length > 0) {
      throw new Error(
        `operations[${index}] declares operation inputs that this zero-input vNext control does not support yet.`,
      );
    }
  }

  return {
    id: stringValue(value.id, `operations[${index}].id`),
    capabilities: stringArray(value.capabilities, `operations[${index}].capabilities`),
    inputRequirements,
  };
}

function profileSchema(item: unknown, index: number): IntegrationProfileSchema {
  const value = record(item, `profile_schemas[${index}]`);
  const path = stringValue(value.path, `profile_schemas[${index}].path`);
  if (path.startsWith("/") || path.split(/[\\/]+/).includes("..")) {
    throw new Error(`profile_schemas[${index}].path must remain package-relative.`);
  }
  return {
    schemaVersion: stringValue(value.schema_version, `profile_schemas[${index}].schema_version`),
    format: stringValue(value.format, `profile_schemas[${index}].format`),
    path,
    sha256: stringValue(value.sha256, `profile_schemas[${index}].sha256`),
  };
}

export function parseIntegrationPackageManifest(
  manifestPath: string,
  text: string,
): IntegrationPackageDescriptor {
  const parsed = JSON.parse(text) as unknown;
  const root = record(parsed, "Integration Package manifest");
  const manifestVersion = stringValue(root.manifest_version, "manifest_version");
  if (![MANIFEST_V0, MANIFEST_VNEXT_LAB].includes(manifestVersion)) {
    throw new Error(`Unsupported Integration Package manifest version: ${manifestVersion}`);
  }

  const integration = record(root.integration, "integration");
  const adapter = record(root.adapter, "adapter");
  const core = record(root.core_input_compatibility, "core_input_compatibility");
  const profile = record(root.profile_compatibility, "profile_compatibility");
  const result = record(root.result_compatibility, "result_compatibility");
  const execution = record(root.execution, "execution");

  const descriptor: IntegrationPackageDescriptor = {
    manifestPath,
    kind: stringValue(root.kind, "kind"),
    manifestVersion,
    integrationId: stringValue(integration.id, "integration.id"),
    adapterId: stringValue(adapter.id, "adapter.id"),
    adapterVersion: stringValue(adapter.version, "adapter.version"),
    coreInputCompatibility: {
      inputSetVersions: stringArray(core.input_set_versions, "core_input_compatibility.input_set_versions"),
      surfaces: arrayValue(core.surfaces, "core_input_compatibility.surfaces").map(surface),
      relationshipFamilies: stringArray(
        core.relationship_families,
        "core_input_compatibility.relationship_families",
      ),
    },
    profileCompatibility: {
      profileVersions: stringArray(profile.profile_versions, "profile_compatibility.profile_versions"),
    },
    resultCompatibility: {
      resultVersions: stringArray(result.result_versions, "result_compatibility.result_versions"),
      defaultResultVersion: stringValue(
        result.default_result_version,
        "result_compatibility.default_result_version",
      ),
    },
    advertisedCapabilities: stringArray(root.capabilities, "capabilities"),
    operations: arrayValue(root.operations, "operations").map((item, index) =>
      operation(item, index, manifestVersion),
    ),
    profileSchemas: arrayValue(root.profile_schemas, "profile_schemas").map(profileSchema),
    execution: {
      protocol: stringValue(execution.protocol, "execution.protocol"),
      argvPrefix: stringArray(execution.argv_prefix, "execution.argv_prefix"),
    },
  };

  if (descriptor.kind !== "orbitfabric.integration_package") {
    throw new Error(`Unsupported Integration Package kind: ${descriptor.kind}`);
  }

  const expectedProtocol =
    descriptor.manifestVersion === MANIFEST_V0 ? PROTOCOL_V0 : PROTOCOL_VNEXT_LAB;
  if (descriptor.execution.protocol !== expectedProtocol) {
    throw new Error(
      `Integration Package manifest ${descriptor.manifestVersion} requires execution protocol ${expectedProtocol}; received ${descriptor.execution.protocol}.`,
    );
  }
  if (descriptor.execution.argvPrefix.length === 0) {
    throw new Error("execution.argv_prefix must contain at least the adapter executable.");
  }

  const packageCapabilities = new Set(descriptor.advertisedCapabilities);
  for (const item of descriptor.operations) {
    for (const capability of item.capabilities) {
      if (!packageCapabilities.has(capability)) {
        throw new Error(
          `Operation ${item.id} advertises capability ${capability} outside package capabilities.`,
        );
      }
    }
  }

  return descriptor;
}
