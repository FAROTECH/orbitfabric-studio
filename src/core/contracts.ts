export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | JsonObject
  | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

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

export interface CoreProbeResult {
  executable: string;
  versionText: string;
  orbitfabricVersion: string | null;
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

export interface MissionContractObject extends JsonObject {
  id: string;
  name?: string;
  description?: string;
}

export interface SpacecraftContractDto extends MissionContractObject {
  model_version: string;
}

export interface MissionModelDto extends JsonObject {
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
  [key: string]: JsonValue;
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
  [key: string]: JsonValue;
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
  [key: string]: JsonValue;
}
