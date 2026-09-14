import type {
  CoreCapabilityDeclaration,
  CoreCompatibilityAssessment,
  CoreCompatibilityFinding,
  CoreCompatibilityState,
  CoreDomainCompatibility,
  CoreInterfaceManifest,
  StudioCoreCapabilityDomain,
  StudioCoreCapabilityRequirement,
} from "./contracts";

export const CORE_EXECUTABLE_STORAGE_KEY = "orbitfabric-studio.core-executable";
export const DEFAULT_CORE_EXECUTABLE = "orbitfabric";

const CORE_INTERFACE_KIND = "orbitfabric.core_interface";
const SUPPORTED_CORE_INTERFACE_VERSION = "0.1-candidate";
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const CAPABILITY_ID_PATTERN = /^[a-z][a-z0-9_]*$/;
const PRODUCT_VERSION_PATTERN = /^[0-9A-Za-z]+(?:[._+-][0-9A-Za-z]+)*$/;

export const STUDIO_CORE_REQUIREMENTS: StudioCoreCapabilityRequirement[] = [
  {
    domain: "primary",
    id: "mission_snapshot",
    contractKind: "orbitfabric.mission_snapshot",
    contractVersion: "0.1-candidate",
  },
  {
    domain: "entities",
    id: "entity_index",
    contractKind: "orbitfabric.entity_index",
    contractVersion: "0.1",
  },
  {
    domain: "relationships",
    id: "relationship_manifest",
    contractKind: "orbitfabric.relationship_manifest",
    contractVersion: "0.1-candidate",
  },
  {
    domain: "scenarios",
    id: "scenario_declaration",
    contractKind: "orbitfabric.scenario_declaration",
    contractVersion: "0.1-candidate",
  },
  {
    domain: "integrations",
    id: "integration_input_set",
    contractKind: "orbitfabric.integration_input_set",
    contractVersion: "0.1-candidate",
  },
];

const DOMAINS: StudioCoreCapabilityDomain[] = [
  "primary",
  "entities",
  "relationships",
  "scenarios",
  "integrations",
];

export class CoreCompatibilityError extends Error {
  constructor(
    readonly state: CoreCompatibilityState,
    message: string,
    readonly findings: CoreCompatibilityFinding[] = [],
  ) {
    super(message);
    this.name = "CoreCompatibilityError";
  }
}

export function parseCoreInterfaceManifest(text: string): CoreInterfaceManifest {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw responseMalformed("Core Interface Manifest is not valid JSON.");
  }

  const value = requireObject(parsed, "Core Interface Manifest root");
  if (value.kind !== CORE_INTERFACE_KIND) {
    throw new CoreCompatibilityError(
      "compatibility_protocol_failed",
      `Unsupported Core Interface Manifest kind: ${display(value.kind)}.`,
    );
  }
  if (value.interface_version !== SUPPORTED_CORE_INTERFACE_VERSION) {
    throw new CoreCompatibilityError(
      "compatibility_protocol_failed",
      `Unsupported Core Interface Manifest version: ${display(value.interface_version)}.`,
    );
  }

  const productVersion = requireString(
    value.orbitfabric_version,
    "orbitfabric_version",
    "version_unavailable",
  );
  if (!PRODUCT_VERSION_PATTERN.test(productVersion)) {
    throw new CoreCompatibilityError(
      "version_unavailable",
      "Core Interface Manifest contains an invalid product version.",
    );
  }

  const interfaceSha256 = requireString(
    value.interface_sha256,
    "interface_sha256",
    "interface_identity_unavailable",
  );
  if (!SHA256_PATTERN.test(interfaceSha256)) {
    throw new CoreCompatibilityError(
      "interface_identity_unavailable",
      "Core Interface Manifest contains an invalid interface SHA-256.",
    );
  }

  if (!Array.isArray(value.capabilities)) {
    throw responseMalformed("Core Interface Manifest capabilities must be an array.");
  }

  const capabilities: CoreCapabilityDeclaration[] = [];
  const capabilityIds = new Set<string>();
  for (const [index, item] of value.capabilities.entries()) {
    const capability = requireObject(item, `capabilities[${index}]`);
    const id = requireString(capability.id, `capabilities[${index}].id`);
    const contractKind = requireString(
      capability.contract_kind,
      `capabilities[${index}].contract_kind`,
    );
    const contractVersion = requireString(
      capability.contract_version,
      `capabilities[${index}].contract_version`,
    );
    if (!CAPABILITY_ID_PATTERN.test(id)) {
      throw responseMalformed(`Invalid capability id: ${display(id)}.`);
    }
    if (capabilityIds.has(id)) {
      throw responseMalformed(`Duplicate capability id: ${id}.`);
    }
    capabilityIds.add(id);
    capabilities.push({
      id,
      contract_kind: contractKind,
      contract_version: contractVersion,
    });
  }

  return {
    kind: CORE_INTERFACE_KIND,
    interface_version: SUPPORTED_CORE_INTERFACE_VERSION,
    orbitfabric_version: productVersion,
    interface_sha256: interfaceSha256,
    capabilities,
  };
}

export function evaluateCoreCompatibility(
  manifest: CoreInterfaceManifest,
): CoreCompatibilityAssessment {
  const declared = new Map(manifest.capabilities.map((item) => [item.id, item]));
  const domains = {} as Record<StudioCoreCapabilityDomain, CoreDomainCompatibility>;
  const allFindings: CoreCompatibilityFinding[] = [];

  for (const domain of DOMAINS) {
    const requirements = STUDIO_CORE_REQUIREMENTS.filter((item) => item.domain === domain);
    const findings = requirements.flatMap((requirement) => {
      const capability = declared.get(requirement.id);
      const finding = compareCapability(requirement, capability);
      return finding ? [finding] : [];
    });
    allFindings.push(...findings);
    domains[domain] = {
      state: findings.length === 0 ? "compatible" : "known_incompatible",
      requirements,
      findings,
    };
  }

  return {
    state: allFindings.length === 0 ? "compatible" : "known_incompatible",
    domains,
    findings: allFindings,
  };
}

export function requireCoreDomain(
  assessment: CoreCompatibilityAssessment,
  domain: StudioCoreCapabilityDomain,
): void {
  const result = assessment.domains[domain];
  if (result.state === "known_incompatible") {
    throw new CoreCompatibilityError(
      "known_incompatible",
      `Configured Core is incompatible with Studio's ${domain} requirements.`,
      result.findings,
    );
  }
}

export function coreConfigurationState(
  sessionConfiguredExecutable: string,
  currentConfiguredExecutable: string,
  compatibilityState: CoreCompatibilityAssessment["state"],
): CoreCompatibilityState {
  return normalizeCoreExecutable(sessionConfiguredExecutable) ===
    normalizeCoreExecutable(currentConfiguredExecutable)
    ? compatibilityState
    : "configuration_changed";
}

export function normalizeCoreExecutable(value: string): string {
  return value.trim() || DEFAULT_CORE_EXECUTABLE;
}

function compareCapability(
  requirement: StudioCoreCapabilityRequirement,
  capability: CoreCapabilityDeclaration | undefined,
): CoreCompatibilityFinding | null {
  const base = {
    domain: requirement.domain,
    capabilityId: requirement.id,
    requiredContractKind: requirement.contractKind,
    requiredContractVersion: requirement.contractVersion,
    declaredContractKind: capability?.contract_kind ?? null,
    declaredContractVersion: capability?.contract_version ?? null,
  };
  if (!capability) return { ...base, reason: "missing_capability" };
  if (capability.contract_kind !== requirement.contractKind) {
    return { ...base, reason: "contract_kind_mismatch" };
  }
  if (capability.contract_version !== requirement.contractVersion) {
    return { ...base, reason: "contract_version_mismatch" };
  }
  return null;
}

function requireObject(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw responseMalformed(`${path} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requireString(
  value: unknown,
  path: string,
  state: CoreCompatibilityState = "compatibility_response_malformed",
): string {
  if (typeof value !== "string" || value.length === 0 || value.trim() !== value) {
    throw new CoreCompatibilityError(state, `${path} must be a non-empty exact string.`);
  }
  return value;
}

function responseMalformed(message: string): CoreCompatibilityError {
  return new CoreCompatibilityError("compatibility_response_malformed", message);
}

function display(value: unknown): string {
  return JSON.stringify(value) ?? String(value);
}
