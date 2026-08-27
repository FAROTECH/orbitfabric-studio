export type IntegrationCompatibilityState = "compatible" | "incompatible" | "unknown";

export type IntegrationSurfaceCompatibility = {
  role: string;
  kind: string;
  formatVersions: string[];
};

export type IntegrationPackageOperation = {
  id: string;
  capabilities: string[];
};

export type IntegrationProfileSchema = {
  schemaVersion: string;
  format: string;
  path: string;
  sha256: string;
};

export type IntegrationExecutionDescriptor = {
  protocol: string;
  argvPrefix: string[];
};

export type IntegrationPackageDescriptor = {
  manifestPath: string;
  kind: string;
  manifestVersion: string;
  integrationId: string;
  adapterId: string;
  adapterVersion: string;
  coreInputCompatibility: {
    inputSetVersions: string[];
    surfaces: IntegrationSurfaceCompatibility[];
    relationshipFamilies: string[];
  };
  profileCompatibility: {
    profileVersions: string[];
  };
  resultCompatibility: {
    resultVersions: string[];
    defaultResultVersion: string;
  };
  advertisedCapabilities: string[];
  operations: IntegrationPackageOperation[];
  profileSchemas: IntegrationProfileSchema[];
  execution: IntegrationExecutionDescriptor;
};

export type IntegrationTextDigestRead = {
  path: string;
  text: string;
  sha256: string;
  contained: boolean | null;
  sha256Matches: boolean | null;
};

export type IntegrationProfileIdentity = {
  kind: string;
  profileVersion: string;
  id: string;
  version: string;
  integrationId: string;
  schemaVersion: string;
};

export type IntegrationProfileDocument = {
  path: string;
  sha256: string;
  identity: IntegrationProfileIdentity;
  value: Record<string, unknown>;
};

export type IntegrationProfileValidation = {
  valid: boolean;
  errors: string[];
};

export type IntegrationProfileFreshness = "fresh" | "stale" | "unknown";

export type IntegrationProfileFreshnessAssessment = {
  state: IntegrationProfileFreshness;
  reason: string;
};

export type CoreIntegrationInputSurface = {
  role: string;
  requirement: string;
  status: string;
  kind: string | null;
  formatVersion: string | null;
  path: string | null;
  sha256: string | null;
  unavailableReason: string | null;
};

export type CoreIntegrationInputSet = {
  kind: string;
  inputSetVersion: string;
  inputSetSha256: string | null;
  orbitfabricVersion: string | null;
  mission: {
    id: string | null;
    modelVersion: string | null;
  } | null;
  loadResult: string | null;
  lintResult: string | null;
  surfaces: CoreIntegrationInputSurface[];
  relationshipFamilies: string[];
};

export type CompatibilityReason = {
  code: string;
  message: string;
};

export type IntegrationCompatibility = {
  state: IntegrationCompatibilityState;
  reasons: CompatibilityReason[];
};

export type IntegrationAvailability = "available" | "unavailable";

export type IntegrationTargetRef = {
  namespace: string;
  kind: string;
  id: string;
};

export type IntegrationCoreRef = {
  domain: string;
  id: string;
};

export type IntegrationArtifact = {
  id: string;
  kind: string;
  requirement: string;
  status: string;
  path: string | null;
  mediaType: string | null;
  sha256: string | null;
  reason: string | null;
  retainedPartial: boolean;
  derivedFromMappings: string[];
};

export type IntegrationMapping = {
  id: string;
  sources: IntegrationCoreRef[];
  profileBindings: string[];
  targets: IntegrationTargetRef[];
};

export type IntegrationResolution = {
  id: string;
  mapping: string | null;
  binding: string | null;
  sources: IntegrationCoreRef[];
  property: string;
  value: unknown;
  origin: string;
};

export type IntegrationDiagnostic = {
  id: string;
  owner: string;
  producer: string;
  phase: string;
  severity: string;
  code: string;
  message: string;
  sources: IntegrationCoreRef[];
  profileBindings: string[];
  targets: IntegrationTargetRef[];
};

export type IntegrationCoverageRecord = {
  source: IntegrationCoreRef;
  state: string;
  mappings: string[];
  profileBindings: string[];
  diagnostics: string[];
  reason: string | null;
};

export type IntegrationCoverage = {
  status: string;
  scope: {
    domains: string[];
  };
  reason: string | null;
  summary: Record<string, number>;
  records: IntegrationCoverageRecord[];
};

export type IntegrationResult = {
  kind: string;
  resultVersion: string;
  result: string;
  integration: {
    id: string;
    schemaVersion: string | null;
  };
  adapter: {
    id: string;
    version: string;
  };
  operation: {
    id: string;
  };
  mission: Record<string, unknown>;
  inputs: {
    coreInputSet: Record<string, unknown>;
    profile: Record<string, unknown>;
  };
  capabilities: string[];
  artifacts: IntegrationArtifact[];
  mappings: IntegrationMapping[];
  resolutions: IntegrationResolution[];
  diagnostics: IntegrationDiagnostic[];
  coverage: IntegrationCoverage;
  evidence: Record<string, unknown>[];
  externalTools: Record<string, unknown>[];
};

export type IntegrationIntegrityIssue = {
  code: string;
  message: string;
};

export type IntegrationBundleFileCheck = {
  artifactId: string;
  path: string | null;
  exists: boolean | null;
  sha256Matches: boolean | null;
  contained: boolean | null;
};

export type IntegrationBundleRead = {
  resultPath: string;
  resultText: string;
  artifactChecks: IntegrationBundleFileCheck[];
};

export type IntegrationResultValidation = {
  usable: boolean;
  issues: IntegrationIntegrityIssue[];
};
