import type {
  CompatibilityReason,
  CoreIntegrationInputSet,
  CoreIntegrationInputSurface,
  IntegrationCompatibility,
  IntegrationPackageDescriptor,
} from "./contracts";

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function stringValue(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value;
}

function surface(item: unknown, index: number): CoreIntegrationInputSurface {
  const value = record(item, `surfaces[${index}]`);
  return {
    role: stringValue(value.role, `surfaces[${index}].role`),
    requirement: stringValue(value.requirement, `surfaces[${index}].requirement`),
    status: stringValue(value.status, `surfaces[${index}].status`),
    kind: nullableString(value.kind),
    formatVersion: nullableString(value.format_version),
    path: nullableString(value.path),
    sha256: nullableString(value.sha256),
    unavailableReason: nullableString(value.unavailable_reason),
  };
}

export function parseCoreIntegrationInputManifest(text: string): CoreIntegrationInputSet {
  const parsed = JSON.parse(text) as unknown;
  const root = record(parsed, "Core Integration Input Set manifest");
  const missionValue = root.mission;
  const mission = missionValue && typeof missionValue === "object" && !Array.isArray(missionValue)
    ? record(missionValue, "mission")
    : null;
  const surfacesValue = root.surfaces;
  if (!Array.isArray(surfacesValue)) {
    throw new Error("surfaces must be an array.");
  }

  const relationshipFamiliesValue = root.relationship_families;
  const relationshipFamilies = Array.isArray(relationshipFamiliesValue)
    ? relationshipFamiliesValue.filter((item): item is string => typeof item === "string")
    : [];

  return {
    kind: stringValue(root.kind, "kind"),
    inputSetVersion: stringValue(root.input_set_version, "input_set_version"),
    inputSetSha256: nullableString(root.input_set_sha256),
    orbitfabricVersion: nullableString(root.orbitfabric_version),
    mission: mission
      ? {
          id: nullableString(mission.id),
          modelVersion: nullableString(mission.model_version),
        }
      : null,
    loadResult: nullableString(root.load_result),
    lintResult: nullableString(root.lint_result),
    surfaces: surfacesValue.map(surface),
    relationshipFamilies,
  };
}

export function evaluateIntegrationCompatibility(
  packageDescriptor: IntegrationPackageDescriptor,
  inputSet: CoreIntegrationInputSet,
): IntegrationCompatibility {
  const reasons: CompatibilityReason[] = [];

  if (inputSet.kind !== "orbitfabric.integration_input_set") {
    return {
      state: "incompatible",
      reasons: [
        {
          code: "input.kind",
          message: `Expected orbitfabric.integration_input_set, got ${inputSet.kind}.`,
        },
      ],
    };
  }

  if (!packageDescriptor.coreInputCompatibility.inputSetVersions.includes(inputSet.inputSetVersion)) {
    reasons.push({
      code: "input.version",
      message: `Input Set version ${inputSet.inputSetVersion} is not supported by this package.`,
    });
  }

  const byRole = new Map(inputSet.surfaces.map((item) => [item.role, item]));
  for (const expected of packageDescriptor.coreInputCompatibility.surfaces) {
    const actual = byRole.get(expected.role);
    if (!actual) {
      reasons.push({
        code: "surface.missing",
        message: `Required compatible surface role ${expected.role} is not declared by the Input Set.`,
      });
      continue;
    }
    if (actual.status !== "available") {
      reasons.push({
        code: "surface.unavailable",
        message: `Surface ${expected.role} is ${actual.status}, not available.`,
      });
      continue;
    }
    if (actual.kind !== expected.kind) {
      reasons.push({
        code: "surface.kind",
        message: `Surface ${expected.role} kind ${actual.kind ?? "<none>"} is incompatible with ${expected.kind}.`,
      });
    }
    if (!actual.formatVersion || !expected.formatVersions.includes(actual.formatVersion)) {
      reasons.push({
        code: "surface.version",
        message: `Surface ${expected.role} format ${actual.formatVersion ?? "<none>"} is not supported.`,
      });
    }
  }

  const requiredFamilies = packageDescriptor.coreInputCompatibility.relationshipFamilies;
  for (const family of requiredFamilies) {
    if (!inputSet.relationshipFamilies.includes(family)) {
      reasons.push({
        code: "relationship_family.missing",
        message: `Required relationship family ${family} is not declared by the Input Set.`,
      });
    }
  }

  if (reasons.length > 0) {
    return { state: "incompatible", reasons };
  }

  if (inputSet.loadResult !== "loaded") {
    return {
      state: "unknown",
      reasons: [
        {
          code: "input.load_state",
          message: `Input Set load state is ${inputSet.loadResult ?? "unknown"}.`,
        },
      ],
    };
  }

  return { state: "compatible", reasons: [] };
}
