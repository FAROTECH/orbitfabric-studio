export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue | undefined };

export interface MissionSource {
  selectedPath: string;
  missionDir: string;
}

export interface CoreInvocationResult {
  operation: string;
  executable: string;
  args: string[];
  exitCode: number | null;
  processCompleted: boolean;
  timedOut: boolean;
  stdout: string;
  stderr: string;
  reportPath: string | null;
  reportText: string | null;
}

export interface CoreExecutableResolution {
  configuredExecutable: string;
  resolvedExecutable: string;
}

export interface CoreCapabilityDeclaration {
  id: string;
  contract_kind: string;
  contract_version: string;
}

export interface CoreInterfaceManifest {
  kind: "orbitfabric.core_interface";
  interface_version: "0.1-candidate";
  orbitfabric_version: string;
  interface_sha256: string;
  capabilities: CoreCapabilityDeclaration[];
}

export type StudioCoreCapabilityDomain =
  | "primary"
  | "entities"
  | "relationships"
  | "scenarios"
  | "integrations";

export interface StudioCoreCapabilityRequirement {
  domain: StudioCoreCapabilityDomain;
  id: string;
  contractKind: string;
  contractVersion: string;
}

export type CoreCompatibilityFindingReason =
  | "missing_capability"
  | "contract_kind_mismatch"
  | "contract_version_mismatch";

export interface CoreCompatibilityFinding {
  domain: StudioCoreCapabilityDomain;
  capabilityId: string;
  reason: CoreCompatibilityFindingReason;
  requiredContractKind: string;
  requiredContractVersion: string;
  declaredContractKind: string | null;
  declaredContractVersion: string | null;
}

export interface CoreDomainCompatibility {
  state: "compatible" | "known_incompatible";
  requirements: StudioCoreCapabilityRequirement[];
  findings: CoreCompatibilityFinding[];
}

export interface CoreCompatibilityAssessment {
  state: "compatible" | "known_incompatible";
  domains: Record<StudioCoreCapabilityDomain, CoreDomainCompatibility>;
  findings: CoreCompatibilityFinding[];
}

export type CoreCompatibilityState =
  | "executable_unavailable"
  | "invocation_failed"
  | "compatibility_protocol_failed"
  | "version_unavailable"
  | "interface_identity_unavailable"
  | "compatibility_response_malformed"
  | "known_incompatible"
  | "compatible"
  | "configuration_changed";

export interface CoreProbeResult extends CoreExecutableResolution {
  orbitfabricVersion: string;
  interfaceVersion: string;
  interfaceSha256: string;
  capabilities: CoreCapabilityDeclaration[];
  manifest: CoreInterfaceManifest;
  compatibility: CoreCompatibilityAssessment;
}

export interface MissionIdentityDto {
  id: string;
  name: string;
  model_version: string;
}

export interface CoreDiagnosticDto {
  severity: string;
  code: string;
  file: string | null;
  domain: string | null;
  object_id: string | null;
  message: string;
  suggestion: string | null;
}

export interface MissionContractObject {
  id: string;
  name?: string;
  description?: string;
  [key: string]: JsonValue | undefined;
}

export interface SpacecraftContractDto extends MissionContractObject {
  model_version: string;
}

export interface MissionModelDto {
  spacecraft: SpacecraftContractDto;
  subsystems: MissionContractObject[];
  modes: Record<string, JsonObject>;
  mode_transitions: JsonObject[];
  telemetry: MissionContractObject[];
  commands: MissionContractObject[];
  events: MissionContractObject[];
  faults: MissionContractObject[];
  packets: MissionContractObject[];
  policies: JsonObject;
  payloads: MissionContractObject[];
  data_products: MissionContractObject[];
  contacts: JsonObject;
  commandability: JsonObject;
}

export interface MissionSnapshotDto {
  kind: "orbitfabric.mission_snapshot";
  snapshot_version: string;
  orbitfabric_version: string;
  result: "loaded" | "failed";
  mission: MissionIdentityDto | null;
  source: {
    mission_dir: string;
  };
  boundaries: JsonObject;
  diagnostics: CoreDiagnosticDto[];
  model: MissionModelDto | null;
}

export interface EntityIndexRecordDto {
  id: string;
  domain: string;
  entity_type: string;
  display_name: string;
  source_file: string;
  provenance: string;
  required_domain: boolean;
  present: boolean;
}

export interface EntityIndexDto {
  kind: "orbitfabric.entity_index";
  index_version: string;
  orbitfabric_version: string;
  mission: MissionIdentityDto;
  entities: EntityIndexRecordDto[];
}

export interface RelationshipEndpointDto {
  domain: string;
  id: string;
}

export interface RelationshipRecordDto {
  relationship_id: string;
  relationship_type: string;
  from: RelationshipEndpointDto;
  to: RelationshipEndpointDto;
  derived_from: {
    model_field: string;
  };
}

export interface RelationshipManifestDto {
  kind: "orbitfabric.relationship_manifest";
  manifest_version: string;
  orbitfabric_version: string;
  mission: MissionIdentityDto;
  relationships: RelationshipRecordDto[];
}

export interface LintFindingDto {
  severity: string;
  code: string;
  file: string | null;
  domain: string | null;
  object_id: string | null;
  message: string;
  suggestion: string | null;
}

export interface LintReportDto {
  tool: "orbitfabric-lint";
  version: string;
  mission: string;
  model_version: string;
  result: "passed" | "passed_with_warnings" | "failed";
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
  findings: LintFindingDto[];
}
