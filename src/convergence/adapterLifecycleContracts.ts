export type LifecycleEvidenceStatus = "PASS" | "FAIL" | "UNKNOWN";
export type ProjectAdapterState = "MATCH" | "MISSING" | "MISMATCH";
export type ProjectOverallState = "MATCH" | "NOT_SATISFIED";

export interface AdapterSourceCoordinate {
  authority: string;
  publisher: string;
  name: string;
}

export interface InstalledAdapterRecord {
  instanceId: string;
  sourceCoordinate: AdapterSourceCoordinate;
  releaseVersion: string;
  releaseDescriptorPath: string;
  releaseDescriptorSha256: string;
  artifactId: string;
  artifactSha256: string;
  backendId: string;
  installRoot: string;
  manifestPath: string;
  manifestSha256: string;
  executionArgvPrefix: string[];
  acceptancePolicy: string;
  acceptanceWarnings: string[];
}

export interface VerificationDimension {
  status: LifecycleEvidenceStatus;
  detail: string | null;
}

export interface AdapterVerificationReport {
  instanceId: string;
  releaseDescriptorIntegrity: VerificationDimension;
  manifestIntegrity: VerificationDimension;
  manifestConformance: VerificationDimension;
  executionBinding: VerificationDimension;
  backendMaterialization: VerificationDimension;
}

export interface ProjectLockCandidateMismatch {
  instanceId: string;
  dimensions: string[];
}

export interface ProjectAdapterStateReport {
  sourceCoordinate: AdapterSourceCoordinate;
  releaseVersion: string;
  status: ProjectAdapterState;
  matchingInstanceIds: string[];
  candidateInstanceIds: string[];
  candidateMismatches: ProjectLockCandidateMismatch[];
}

export interface ProjectLockCheckReport {
  lockPath: string;
  lockVersion: string;
  status: ProjectOverallState;
  adapters: ProjectAdapterStateReport[];
}

export interface CatalogDigest {
  algorithm: "sha256";
  value: string;
}

export interface CatalogSourceBinding {
  id: string;
  provider: string;
  config: Record<string, unknown>;
}

export interface ExactCatalogReleaseSource {
  binding: CatalogSourceBinding;
  releaseRef: string;
}

export interface ExactCatalogReleaseSelection {
  sourceCoordinate: AdapterSourceCoordinate;
  releaseVersion: string;
  releaseDescriptorDigest: CatalogDigest;
  sources: ExactCatalogReleaseSource[];
}

const SHA256 = /^[0-9a-f]{64}$/;

function object(value: unknown, label: string): Record<string, unknown> {
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

function optionalString(value: unknown, label: string): string | null {
  if (value === null || value === undefined) return null;
  return stringValue(value, label);
}

function sha256(value: unknown, label: string): string {
  const result = stringValue(value, label);
  if (!SHA256.test(result)) throw new Error(`${label} must be a lowercase SHA-256 digest.`);
  return result;
}

function array(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
  return value;
}

function stringArray(value: unknown, label: string): string[] {
  return array(value, label).map((item, index) => stringValue(item, `${label}[${index}]`));
}

function sourceCoordinate(value: unknown, label: string): AdapterSourceCoordinate {
  const item = object(value, label);
  return {
    authority: stringValue(item.authority, `${label}.authority`),
    publisher: stringValue(item.publisher, `${label}.publisher`),
    name: stringValue(item.name, `${label}.name`),
  };
}

function exactEnum<T extends string>(value: unknown, values: readonly T[], label: string): T {
  const candidate = stringValue(value, label);
  if (!values.includes(candidate as T)) {
    throw new Error(`${label} has unsupported value ${candidate}.`);
  }
  return candidate as T;
}

export function parseInstalledAdapterRecords(text: string): InstalledAdapterRecord[] {
  const parsed = JSON.parse(text) as unknown;
  return array(parsed, "installed adapter records").map((item, index) =>
    installedAdapterRecord(item, `installed[${index}]`),
  );
}

export function parseInstalledAdapterRecord(text: string): InstalledAdapterRecord {
  return installedAdapterRecord(JSON.parse(text) as unknown, "installed adapter record");
}

function installedAdapterRecord(value: unknown, label: string): InstalledAdapterRecord {
  const item = object(value, label);
  return {
    instanceId: stringValue(item.instance_id, `${label}.instance_id`),
    sourceCoordinate: sourceCoordinate(item.source_coordinate, `${label}.source_coordinate`),
    releaseVersion: stringValue(item.release_version, `${label}.release_version`),
    releaseDescriptorPath: stringValue(item.release_descriptor_path, `${label}.release_descriptor_path`),
    releaseDescriptorSha256: sha256(item.release_descriptor_sha256, `${label}.release_descriptor_sha256`),
    artifactId: stringValue(item.artifact_id, `${label}.artifact_id`),
    artifactSha256: sha256(item.artifact_sha256, `${label}.artifact_sha256`),
    backendId: stringValue(item.backend_id, `${label}.backend_id`),
    installRoot: stringValue(item.install_root, `${label}.install_root`),
    manifestPath: stringValue(item.manifest_path, `${label}.manifest_path`),
    manifestSha256: sha256(item.manifest_sha256, `${label}.manifest_sha256`),
    executionArgvPrefix: stringArray(item.execution_argv_prefix, `${label}.execution_argv_prefix`),
    acceptancePolicy: stringValue(item.acceptance_policy, `${label}.acceptance_policy`),
    acceptanceWarnings: stringArray(item.acceptance_warnings, `${label}.acceptance_warnings`),
  };
}

function verificationDimension(value: unknown, label: string): VerificationDimension {
  const item = object(value, label);
  return {
    status: exactEnum(item.status, ["PASS", "FAIL", "UNKNOWN"] as const, `${label}.status`),
    detail: optionalString(item.detail, `${label}.detail`),
  };
}

export function parseAdapterVerificationReport(text: string): AdapterVerificationReport {
  const item = object(JSON.parse(text) as unknown, "adapter verification report");
  return {
    instanceId: stringValue(item.instance_id, "verification.instance_id"),
    releaseDescriptorIntegrity: verificationDimension(item.release_descriptor_integrity, "verification.release_descriptor_integrity"),
    manifestIntegrity: verificationDimension(item.manifest_integrity, "verification.manifest_integrity"),
    manifestConformance: verificationDimension(item.manifest_conformance, "verification.manifest_conformance"),
    executionBinding: verificationDimension(item.execution_binding, "verification.execution_binding"),
    backendMaterialization: verificationDimension(item.backend_materialization, "verification.backend_materialization"),
  };
}

export function parseProjectLockCheckReport(text: string): ProjectLockCheckReport {
  const item = object(JSON.parse(text) as unknown, "project lock check report");
  return {
    lockPath: stringValue(item.lock_path, "lock.lock_path"),
    lockVersion: stringValue(item.lock_version, "lock.lock_version"),
    status: exactEnum(item.status, ["MATCH", "NOT_SATISFIED"] as const, "lock.status"),
    adapters: array(item.adapters, "lock.adapters").map((entry, index) => projectAdapterState(entry, index)),
  };
}

function projectAdapterState(value: unknown, index: number): ProjectAdapterStateReport {
  const label = `lock.adapters[${index}]`;
  const item = object(value, label);
  return {
    sourceCoordinate: sourceCoordinate(item.source_coordinate, `${label}.source_coordinate`),
    releaseVersion: stringValue(item.release_version, `${label}.release_version`),
    status: exactEnum(item.status, ["MATCH", "MISSING", "MISMATCH"] as const, `${label}.status`),
    matchingInstanceIds: stringArray(item.matching_instance_ids, `${label}.matching_instance_ids`),
    candidateInstanceIds: stringArray(item.candidate_instance_ids, `${label}.candidate_instance_ids`),
    candidateMismatches: array(item.candidate_mismatches, `${label}.candidate_mismatches`).map((entry, mismatchIndex) => {
      const mismatch = object(entry, `${label}.candidate_mismatches[${mismatchIndex}]`);
      return {
        instanceId: stringValue(mismatch.instance_id, `${label}.candidate_mismatches[${mismatchIndex}].instance_id`),
        dimensions: stringArray(mismatch.dimensions, `${label}.candidate_mismatches[${mismatchIndex}].dimensions`),
      };
    }),
  };
}

export function parseExactCatalogReleaseSelection(text: string): ExactCatalogReleaseSelection {
  const item = object(JSON.parse(text) as unknown, "catalog release selection");
  const digest = object(item.release_descriptor_digest, "catalog.release_descriptor_digest");
  return {
    sourceCoordinate: sourceCoordinate(item.source_coordinate, "catalog.source_coordinate"),
    releaseVersion: stringValue(item.release_version, "catalog.release_version"),
    releaseDescriptorDigest: {
      algorithm: exactEnum(digest.algorithm, ["sha256"] as const, "catalog.release_descriptor_digest.algorithm"),
      value: sha256(digest.value, "catalog.release_descriptor_digest.value"),
    },
    sources: array(item.sources, "catalog.sources").map((entry, index) => {
      const source = object(entry, `catalog.sources[${index}]`);
      const binding = object(source.binding, `catalog.sources[${index}].binding`);
      return {
        binding: {
          id: stringValue(binding.id, `catalog.sources[${index}].binding.id`),
          provider: stringValue(binding.provider, `catalog.sources[${index}].binding.provider`),
          config: object(binding.config, `catalog.sources[${index}].binding.config`),
        },
        releaseRef: stringValue(source.release_ref, `catalog.sources[${index}].release_ref`),
      };
    }),
  };
}
