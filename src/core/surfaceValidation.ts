import type {
  CoreDiagnosticDto,
  EntityIndexDto,
  LintReportDto,
  MissionIdentityDto,
  MissionModelDto,
  MissionSnapshotDto,
  RelationshipManifestDto,
} from "./contracts";

export class MalformedCoreSurfaceError extends Error {
  constructor(
    readonly surfaceName: string,
    message: string,
  ) {
    super(`${surfaceName}: ${message}`);
    this.name = "MalformedCoreSurfaceError";
  }
}

export class UnsupportedCoreSurfaceError extends Error {
  constructor(
    readonly surfaceName: string,
    readonly version: string,
  ) {
    super(`${surfaceName}: unsupported surface version ${version}`);
    this.name = "UnsupportedCoreSurfaceError";
  }
}

const SUPPORTED_MISSION_SNAPSHOT_VERSIONS = new Set(["0.1-candidate"]);
const SUPPORTED_ENTITY_INDEX_VERSIONS = new Set(["0.1"]);
const SUPPORTED_RELATIONSHIP_MANIFEST_VERSIONS = new Set(["0.1-candidate"]);

export function parseMissionSnapshot(text: string): MissionSnapshotDto {
  const value = parseObject(text, "Mission Snapshot");
  requireStringValue(value.kind, "orbitfabric.mission_snapshot", "Mission Snapshot", "kind");
  const version = requireString(value.snapshot_version, "Mission Snapshot", "snapshot_version");
  requireSupportedVersion("Mission Snapshot", version, SUPPORTED_MISSION_SNAPSHOT_VERSIONS);
  requireString(value.orbitfabric_version, "Mission Snapshot", "orbitfabric_version");

  const result = requireString(value.result, "Mission Snapshot", "result");
  if (result !== "loaded" && result !== "failed") {
    throw malformed("Mission Snapshot", `unexpected result ${JSON.stringify(result)}`);
  }

  const diagnostics = parseDiagnostics(value.diagnostics, "Mission Snapshot");
  const source = requireObject(value.source, "Mission Snapshot", "source");
  requireString(source.mission_dir, "Mission Snapshot", "source.mission_dir");

  if (result === "loaded") {
    parseMissionIdentity(value.mission, "Mission Snapshot", "mission");
    parseMissionModel(value.model, "Mission Snapshot");
  } else {
    if (value.mission !== null) {
      throw malformed("Mission Snapshot", "failed result must expose mission=null");
    }
    if (value.model !== null) {
      throw malformed("Mission Snapshot", "failed result must expose model=null");
    }
    if (diagnostics.length === 0) {
      throw malformed("Mission Snapshot", "failed result must include structured diagnostics");
    }
  }

  return value as unknown as MissionSnapshotDto;
}

export function parseEntityIndex(text: string): EntityIndexDto {
  const value = parseObject(text, "Entity Index");
  requireStringValue(value.kind, "orbitfabric.entity_index", "Entity Index", "kind");
  const version = requireString(value.index_version, "Entity Index", "index_version");
  requireSupportedVersion("Entity Index", version, SUPPORTED_ENTITY_INDEX_VERSIONS);
  requireString(value.orbitfabric_version, "Entity Index", "orbitfabric_version");
  parseMissionIdentity(value.mission, "Entity Index", "mission");

  const entities = requireArray(value.entities, "Entity Index", "entities");
  for (const [index, entityValue] of entities.entries()) {
    const entity = requireObject(entityValue, "Entity Index", `entities[${index}]`);
    requireString(entity.id, "Entity Index", `entities[${index}].id`);
    requireString(entity.domain, "Entity Index", `entities[${index}].domain`);
    requireString(entity.entity_type, "Entity Index", `entities[${index}].entity_type`);
    requireString(entity.display_name, "Entity Index", `entities[${index}].display_name`);
    requireString(entity.source_file, "Entity Index", `entities[${index}].source_file`);
  }

  return value as unknown as EntityIndexDto;
}

export function parseRelationshipManifest(text: string): RelationshipManifestDto {
  const value = parseObject(text, "Relationship Manifest");
  requireStringValue(
    value.kind,
    "orbitfabric.relationship_manifest",
    "Relationship Manifest",
    "kind",
  );
  const version = requireString(
    value.manifest_version,
    "Relationship Manifest",
    "manifest_version",
  );
  requireSupportedVersion(
    "Relationship Manifest",
    version,
    SUPPORTED_RELATIONSHIP_MANIFEST_VERSIONS,
  );
  requireString(value.orbitfabric_version, "Relationship Manifest", "orbitfabric_version");
  parseMissionIdentity(value.mission, "Relationship Manifest", "mission");

  const relationships = requireArray(
    value.relationships,
    "Relationship Manifest",
    "relationships",
  );
  for (const [index, relationshipValue] of relationships.entries()) {
    const relationship = requireObject(
      relationshipValue,
      "Relationship Manifest",
      `relationships[${index}]`,
    );
    requireString(
      relationship.relationship_id,
      "Relationship Manifest",
      `relationships[${index}].relationship_id`,
    );
    requireString(
      relationship.relationship_type,
      "Relationship Manifest",
      `relationships[${index}].relationship_type`,
    );
    parseEndpoint(
      relationship.from,
      "Relationship Manifest",
      `relationships[${index}].from`,
    );
    parseEndpoint(
      relationship.to,
      "Relationship Manifest",
      `relationships[${index}].to`,
    );
    const derivedFrom = requireObject(
      relationship.derived_from,
      "Relationship Manifest",
      `relationships[${index}].derived_from`,
    );
    requireString(
      derivedFrom.model_field,
      "Relationship Manifest",
      `relationships[${index}].derived_from.model_field`,
    );
  }

  return value as unknown as RelationshipManifestDto;
}

export function parseLintReport(text: string): LintReportDto {
  const value = parseObject(text, "Lint Report");
  requireStringValue(value.tool, "orbitfabric-lint", "Lint Report", "tool");
  requireString(value.version, "Lint Report", "version");
  requireString(value.mission, "Lint Report", "mission");
  requireString(value.model_version, "Lint Report", "model_version");

  const result = requireString(value.result, "Lint Report", "result");
  if (!new Set(["passed", "passed_with_warnings", "failed"]).has(result)) {
    throw malformed("Lint Report", `unexpected result ${JSON.stringify(result)}`);
  }

  const summary = requireObject(value.summary, "Lint Report", "summary");
  requireNumber(summary.errors, "Lint Report", "summary.errors");
  requireNumber(summary.warnings, "Lint Report", "summary.warnings");
  requireNumber(summary.info, "Lint Report", "summary.info");

  const findings = requireArray(value.findings, "Lint Report", "findings");
  for (const [index, findingValue] of findings.entries()) {
    const finding = requireObject(findingValue, "Lint Report", `findings[${index}]`);
    requireString(finding.severity, "Lint Report", `findings[${index}].severity`);
    requireString(finding.code, "Lint Report", `findings[${index}].code`);
    requireString(finding.message, "Lint Report", `findings[${index}].message`);
  }

  return value as unknown as LintReportDto;
}

function parseMissionModel(value: unknown, surfaceName: string): MissionModelDto {
  const model = requireObject(value, surfaceName, "model");
  const spacecraft = requireObject(model.spacecraft, surfaceName, "model.spacecraft");
  requireString(spacecraft.id, surfaceName, "model.spacecraft.id");
  requireString(spacecraft.name, surfaceName, "model.spacecraft.name");
  requireString(spacecraft.model_version, surfaceName, "model.spacecraft.model_version");

  for (const field of [
    "subsystems",
    "mode_transitions",
    "telemetry",
    "commands",
    "events",
    "faults",
    "packets",
    "payloads",
    "data_products",
  ]) {
    requireArray(model[field], surfaceName, `model.${field}`);
  }

  requireObject(model.modes, surfaceName, "model.modes");
  requireObject(model.policies, surfaceName, "model.policies");
  requireObject(model.contacts, surfaceName, "model.contacts");
  requireObject(model.commandability, surfaceName, "model.commandability");

  return model as unknown as MissionModelDto;
}

function parseMissionIdentity(
  value: unknown,
  surfaceName: string,
  path: string,
): MissionIdentityDto {
  const mission = requireObject(value, surfaceName, path);
  requireString(mission.id, surfaceName, `${path}.id`);
  requireString(mission.name, surfaceName, `${path}.name`);
  requireString(mission.model_version, surfaceName, `${path}.model_version`);
  return mission as unknown as MissionIdentityDto;
}

function parseDiagnostics(value: unknown, surfaceName: string): CoreDiagnosticDto[] {
  const diagnostics = requireArray(value, surfaceName, "diagnostics");
  for (const [index, diagnosticValue] of diagnostics.entries()) {
    const diagnostic = requireObject(
      diagnosticValue,
      surfaceName,
      `diagnostics[${index}]`,
    );
    requireString(diagnostic.severity, surfaceName, `diagnostics[${index}].severity`);
    requireString(diagnostic.code, surfaceName, `diagnostics[${index}].code`);
    requireString(diagnostic.message, surfaceName, `diagnostics[${index}].message`);
  }
  return diagnostics as unknown as CoreDiagnosticDto[];
}

function parseEndpoint(value: unknown, surfaceName: string, path: string): void {
  const endpoint = requireObject(value, surfaceName, path);
  requireString(endpoint.domain, surfaceName, `${path}.domain`);
  requireString(endpoint.id, surfaceName, `${path}.id`);
}

function parseObject(text: string, surfaceName: string): Record<string, unknown> {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    throw malformed(
      surfaceName,
      `report is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  return requireObject(value, surfaceName, "root");
}

function requireObject(
  value: unknown,
  surfaceName: string,
  path: string,
): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw malformed(surfaceName, `${path} must be an object`);
  }
  return value as Record<string, unknown>;
}

function requireArray(value: unknown, surfaceName: string, path: string): unknown[] {
  if (!Array.isArray(value)) {
    throw malformed(surfaceName, `${path} must be an array`);
  }
  return value;
}

function requireString(value: unknown, surfaceName: string, path: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw malformed(surfaceName, `${path} must be a non-empty string`);
  }
  return value;
}

function requireNumber(value: unknown, surfaceName: string, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw malformed(surfaceName, `${path} must be a finite number`);
  }
  return value;
}

function requireStringValue(
  value: unknown,
  expected: string,
  surfaceName: string,
  path: string,
): void {
  const actual = requireString(value, surfaceName, path);
  if (actual !== expected) {
    throw malformed(surfaceName, `${path} must be ${JSON.stringify(expected)}`);
  }
}

function requireSupportedVersion(
  surfaceName: string,
  version: string,
  supported: Set<string>,
): void {
  if (!supported.has(version)) {
    throw new UnsupportedCoreSurfaceError(surfaceName, version);
  }
}

function malformed(surfaceName: string, message: string): MalformedCoreSurfaceError {
  return new MalformedCoreSurfaceError(surfaceName, message);
}
