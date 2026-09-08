export type ScenarioEntityRef = {
  domain: string;
  id: string;
};

export type ScenarioAtomReference = {
  role: string;
  entity: ScenarioEntityRef;
};

export type ScenarioDeclarationAtom = {
  id: string;
  role: string;
  kind: string;
  stepIndex: number | null;
  withinStepOrdinal: number | null;
  scenarioTimeS: number | null;
  references: ScenarioAtomReference[];
  declaration: unknown;
};

export type ScenarioDeclarationDiagnostic = {
  severity: string;
  code: string;
  file: string | null;
  domain: string | null;
  objectId: string | null;
  message: string;
  suggestion: string | null;
};

export type ScenarioDeclarationLoaded = {
  kind: "orbitfabric.scenario_declaration";
  declarationVersion: "0.1-candidate";
  orbitfabricVersion: string;
  result: "loaded";
  scenario: {
    id: string;
    name: string;
    description: string | null;
  };
  mission: {
    id: string;
    modelVersion: string;
  };
  source: {
    scenarioSha256: string;
  };
  boundaries: Record<string, unknown>;
  atomCount: number;
  atoms: ScenarioDeclarationAtom[];
  diagnostics: [];
};

export type ScenarioDeclarationFailed = {
  kind: "orbitfabric.scenario_declaration";
  declarationVersion: "0.1-candidate";
  orbitfabricVersion: string;
  result: "failed";
  scenario: null;
  mission: null;
  source: {
    scenarioSha256: string | null;
  };
  boundaries: Record<string, unknown>;
  atomCount: null;
  atoms: null;
  diagnostics: ScenarioDeclarationDiagnostic[];
};

export type ScenarioDeclaration = ScenarioDeclarationLoaded | ScenarioDeclarationFailed;

export type EvidenceProductIdentity = {
  id: string;
  version?: string;
  revision?: string;
};

export type EvidenceScenarioSourceSubject = {
  type: "scenario_source";
  scenarioId: string;
  scenarioSha256: string;
};

export type EvidenceScenarioAtomSubject = {
  type: "scenario_atom";
  scenarioSha256: string;
  atomId: string;
};

export type EvidenceIntegrationResultSubject = {
  type: "integration_result";
  resultSha256: string;
};

export type EvidenceIntegrationMappingSubject = {
  type: "integration_mapping";
  resultSha256: string;
  mappingId: string;
};

export type EvidenceIntegrationArtifactSubject = {
  type: "integration_artifact";
  resultSha256: string;
  artifactId: string;
};

export type EvidenceSubject =
  | EvidenceScenarioSourceSubject
  | EvidenceScenarioAtomSubject
  | EvidenceIntegrationResultSubject
  | EvidenceIntegrationMappingSubject
  | EvidenceIntegrationArtifactSubject;

export type EvidenceSetRecord = {
  id: string;
  content: {
    kind: string;
    formatVersion?: string;
    producer: EvidenceProductIdentity;
    reference: {
      path: string;
      mediaType?: string;
      sha256: string;
    };
  };
  subjects: EvidenceSubject[];
};

export type EvidenceSetManifest = {
  kind: "orbitfabric.evidence_set_manifest";
  manifestVersion: "0.1-candidate";
  evidenceSet: {
    id: string;
  };
  curator: EvidenceProductIdentity;
  records: EvidenceSetRecord[];
};

const SHA256 = /^[0-9a-f]{64}$/;

function objectValue(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function arrayValue(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }
  return value;
}

function stringValue(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value;
}

function textValue(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new Error(`${label} must be a string.`);
  }
  return value;
}

function nullableString(value: unknown, label: string): string | null {
  if (value === null) return null;
  return stringValue(value, label);
}

function nullableText(value: unknown, label: string): string | null {
  if (value === null) return null;
  return textValue(value, label);
}

function nullableNumber(value: unknown, label: string): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number or null.`);
  }
  return value;
}

function nullableInteger(value: unknown, label: string): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer or null.`);
  }
  return value;
}

function sha256(value: unknown, label: string): string {
  const parsed = stringValue(value, label);
  if (!SHA256.test(parsed)) {
    throw new Error(`${label} must be a lowercase 64-character SHA-256.`);
  }
  return parsed;
}

function optionalSha256(value: unknown, label: string): string | null {
  if (value === null) return null;
  return sha256(value, label);
}

function rejectUnknownKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  label: string,
): void {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) {
    throw new Error(`${label} contains unsupported field(s): ${unknown.sort().join(", ")}.`);
  }
}

function parseScenarioReference(value: unknown, label: string): ScenarioAtomReference {
  const item = objectValue(value, label);
  rejectUnknownKeys(item, ["role", "entity"], label);
  const entity = objectValue(item.entity, `${label}.entity`);
  rejectUnknownKeys(entity, ["domain", "id"], `${label}.entity`);
  return {
    role: stringValue(item.role, `${label}.role`),
    entity: {
      domain: stringValue(entity.domain, `${label}.entity.domain`),
      id: stringValue(entity.id, `${label}.entity.id`),
    },
  };
}

function parseScenarioAtom(value: unknown, index: number): ScenarioDeclarationAtom {
  const label = `atoms[${index}]`;
  const item = objectValue(value, label);
  rejectUnknownKeys(
    item,
    [
      "id",
      "role",
      "kind",
      "step_index",
      "within_step_ordinal",
      "scenario_time_s",
      "references",
      "declaration",
    ],
    label,
  );
  return {
    id: stringValue(item.id, `${label}.id`),
    role: stringValue(item.role, `${label}.role`),
    kind: stringValue(item.kind, `${label}.kind`),
    stepIndex: nullableInteger(item.step_index, `${label}.step_index`),
    withinStepOrdinal: nullableInteger(item.within_step_ordinal, `${label}.within_step_ordinal`),
    scenarioTimeS: nullableNumber(item.scenario_time_s, `${label}.scenario_time_s`),
    references: arrayValue(item.references, `${label}.references`).map((entry, referenceIndex) =>
      parseScenarioReference(entry, `${label}.references[${referenceIndex}]`),
    ),
    declaration: item.declaration,
  };
}

function parseScenarioDiagnostic(value: unknown, index: number): ScenarioDeclarationDiagnostic {
  const label = `diagnostics[${index}]`;
  const item = objectValue(value, label);
  rejectUnknownKeys(
    item,
    ["severity", "code", "file", "domain", "object_id", "message", "suggestion"],
    label,
  );
  return {
    severity: stringValue(item.severity, `${label}.severity`),
    code: stringValue(item.code, `${label}.code`),
    file: nullableString(item.file, `${label}.file`),
    domain: nullableString(item.domain, `${label}.domain`),
    objectId: nullableString(item.object_id, `${label}.object_id`),
    message: stringValue(item.message, `${label}.message`),
    suggestion: nullableString(item.suggestion, `${label}.suggestion`),
  };
}

export function parseScenarioDeclaration(text: string): ScenarioDeclaration {
  const root = objectValue(JSON.parse(text) as unknown, "Scenario Declaration");
  const kind = stringValue(root.kind, "kind");
  const version = stringValue(root.declaration_version, "declaration_version");
  const orbitfabricVersion = stringValue(root.orbitfabric_version, "orbitfabric_version");
  const result = stringValue(root.result, "result");
  if (kind !== "orbitfabric.scenario_declaration") {
    throw new Error(`Unsupported Scenario Declaration kind: ${kind}.`);
  }
  if (version !== "0.1-candidate") {
    throw new Error(`Unsupported Scenario Declaration version: ${version}.`);
  }
  if (result !== "loaded" && result !== "failed") {
    throw new Error(`Unsupported Scenario Declaration result: ${result}.`);
  }

  const source = objectValue(root.source, "source");
  const boundaries = objectValue(root.boundaries, "boundaries");
  const diagnostics = arrayValue(root.diagnostics, "diagnostics");

  if (result === "failed") {
    if (root.scenario !== null || root.mission !== null || root.atom_count !== null || root.atoms !== null) {
      throw new Error("Failed Scenario Declaration must not contain partial Scenario semantics.");
    }
    if (diagnostics.length === 0) {
      throw new Error("Failed Scenario Declaration must contain structured diagnostics.");
    }
    return {
      kind: "orbitfabric.scenario_declaration",
      declarationVersion: "0.1-candidate",
      orbitfabricVersion,
      result: "failed",
      scenario: null,
      mission: null,
      source: { scenarioSha256: optionalSha256(source.scenario_sha256, "source.scenario_sha256") },
      boundaries,
      atomCount: null,
      atoms: null,
      diagnostics: diagnostics.map(parseScenarioDiagnostic),
    };
  }

  const scenario = objectValue(root.scenario, "scenario");
  const mission = objectValue(root.mission, "mission");
  const atomCount = nullableInteger(root.atom_count, "atom_count");
  if (atomCount === null) {
    throw new Error("Loaded Scenario Declaration requires atom_count.");
  }
  const atoms = arrayValue(root.atoms, "atoms").map(parseScenarioAtom);
  if (atoms.length !== atomCount) {
    throw new Error(`Scenario Declaration atom_count ${atomCount} does not match atoms length ${atoms.length}.`);
  }
  const atomIds = atoms.map((atom) => atom.id);
  if (new Set(atomIds).size !== atomIds.length) {
    throw new Error("Scenario Declaration atom ids must be unique.");
  }
  if (diagnostics.length !== 0) {
    throw new Error("Loaded Scenario Declaration must not contain failure diagnostics.");
  }

  return {
    kind: "orbitfabric.scenario_declaration",
    declarationVersion: "0.1-candidate",
    orbitfabricVersion,
    result: "loaded",
    scenario: {
      id: stringValue(scenario.id, "scenario.id"),
      name: stringValue(scenario.name, "scenario.name"),
      description: nullableText(scenario.description, "scenario.description"),
    },
    mission: {
      id: stringValue(mission.id, "mission.id"),
      modelVersion: stringValue(mission.model_version, "mission.model_version"),
    },
    source: { scenarioSha256: sha256(source.scenario_sha256, "source.scenario_sha256") },
    boundaries,
    atomCount,
    atoms,
    diagnostics: [],
  };
}

function parseProductIdentity(value: unknown, label: string): EvidenceProductIdentity {
  const item = objectValue(value, label);
  rejectUnknownKeys(item, ["id", "version", "revision"], label);
  const identity: EvidenceProductIdentity = { id: stringValue(item.id, `${label}.id`) };
  if (item.version !== undefined) identity.version = stringValue(item.version, `${label}.version`);
  if (item.revision !== undefined) identity.revision = stringValue(item.revision, `${label}.revision`);
  return identity;
}

function parseEvidenceSubject(value: unknown, label: string): EvidenceSubject {
  const item = objectValue(value, label);
  const type = stringValue(item.type, `${label}.type`);
  if (type === "scenario_source") {
    rejectUnknownKeys(item, ["type", "scenario_id", "scenario_sha256"], label);
    return {
      type,
      scenarioId: stringValue(item.scenario_id, `${label}.scenario_id`),
      scenarioSha256: sha256(item.scenario_sha256, `${label}.scenario_sha256`),
    };
  }
  if (type === "scenario_atom") {
    rejectUnknownKeys(item, ["type", "scenario_sha256", "atom_id"], label);
    return {
      type,
      scenarioSha256: sha256(item.scenario_sha256, `${label}.scenario_sha256`),
      atomId: stringValue(item.atom_id, `${label}.atom_id`),
    };
  }
  if (type === "integration_result") {
    rejectUnknownKeys(item, ["type", "result_sha256"], label);
    return { type, resultSha256: sha256(item.result_sha256, `${label}.result_sha256`) };
  }
  if (type === "integration_mapping") {
    rejectUnknownKeys(item, ["type", "result_sha256", "mapping_id"], label);
    return {
      type,
      resultSha256: sha256(item.result_sha256, `${label}.result_sha256`),
      mappingId: stringValue(item.mapping_id, `${label}.mapping_id`),
    };
  }
  if (type === "integration_artifact") {
    rejectUnknownKeys(item, ["type", "result_sha256", "artifact_id"], label);
    return {
      type,
      resultSha256: sha256(item.result_sha256, `${label}.result_sha256`),
      artifactId: stringValue(item.artifact_id, `${label}.artifact_id`),
    };
  }
  throw new Error(`Unsupported Evidence Set subject type: ${type}.`);
}

function validatePortableEvidencePath(value: string, label: string): void {
  if (value.startsWith("/") || /^[A-Za-z]:\//.test(value) || value.includes("\\")) {
    throw new Error(`${label} must be a portable bundle-relative path.`);
  }
  const parts = value.split("/");
  if (parts.some((part) => part === "" || part === "." || part === "..")) {
    throw new Error(`${label} must be a normalized bundle-relative path.`);
  }
}

function parseEvidenceRecord(value: unknown, index: number): EvidenceSetRecord {
  const label = `records[${index}]`;
  const item = objectValue(value, label);
  rejectUnknownKeys(item, ["id", "content", "subjects"], label);
  const content = objectValue(item.content, `${label}.content`);
  rejectUnknownKeys(content, ["kind", "format_version", "producer", "reference"], `${label}.content`);
  const reference = objectValue(content.reference, `${label}.content.reference`);
  rejectUnknownKeys(reference, ["path", "media_type", "sha256"], `${label}.content.reference`);
  const path = stringValue(reference.path, `${label}.content.reference.path`);
  validatePortableEvidencePath(path, `${label}.content.reference.path`);

  const parsed: EvidenceSetRecord = {
    id: stringValue(item.id, `${label}.id`),
    content: {
      kind: stringValue(content.kind, `${label}.content.kind`),
      producer: parseProductIdentity(content.producer, `${label}.content.producer`),
      reference: {
        path,
        sha256: sha256(reference.sha256, `${label}.content.reference.sha256`),
      },
    },
    subjects: arrayValue(item.subjects, `${label}.subjects`).map((subject, subjectIndex) =>
      parseEvidenceSubject(subject, `${label}.subjects[${subjectIndex}]`),
    ),
  };
  if (parsed.subjects.length === 0) {
    throw new Error(`${label}.subjects must contain at least one typed subject.`);
  }
  if (content.format_version !== undefined) {
    parsed.content.formatVersion = stringValue(content.format_version, `${label}.content.format_version`);
  }
  if (reference.media_type !== undefined) {
    parsed.content.reference.mediaType = stringValue(reference.media_type, `${label}.content.reference.media_type`);
  }
  return parsed;
}

export function parseEvidenceSetManifest(text: string): EvidenceSetManifest {
  const root = objectValue(JSON.parse(text) as unknown, "Evidence Set Manifest");
  rejectUnknownKeys(root, ["kind", "manifest_version", "evidence_set", "curator", "records"], "Evidence Set Manifest");
  const kind = stringValue(root.kind, "kind");
  const version = stringValue(root.manifest_version, "manifest_version");
  if (kind !== "orbitfabric.evidence_set_manifest") {
    throw new Error(`Unsupported Evidence Set kind: ${kind}.`);
  }
  if (version !== "0.1-candidate") {
    throw new Error(`Unsupported Evidence Set version: ${version}.`);
  }
  const evidenceSet = objectValue(root.evidence_set, "evidence_set");
  rejectUnknownKeys(evidenceSet, ["id"], "evidence_set");
  const records = arrayValue(root.records, "records").map(parseEvidenceRecord);
  const recordIds = records.map((record) => record.id);
  if (new Set(recordIds).size !== recordIds.length) {
    throw new Error("Evidence Set record ids must be unique within the set.");
  }
  return {
    kind: "orbitfabric.evidence_set_manifest",
    manifestVersion: "0.1-candidate",
    evidenceSet: { id: stringValue(evidenceSet.id, "evidence_set.id") },
    curator: parseProductIdentity(root.curator, "curator"),
    records,
  };
}

export function evidenceSubjectKey(subject: EvidenceSubject): string {
  if (subject.type === "scenario_source") {
    return `scenario:${subject.scenarioSha256}`;
  }
  if (subject.type === "scenario_atom") {
    return `scenario:${subject.scenarioSha256}:atom:${subject.atomId}`;
  }
  if (subject.type === "integration_result") {
    return `result:${subject.resultSha256}`;
  }
  if (subject.type === "integration_mapping") {
    return `result:${subject.resultSha256}:mapping:${subject.mappingId}`;
  }
  return `result:${subject.resultSha256}:artifact:${subject.artifactId}`;
}

export function evidenceRecordsForSubject(
  manifest: EvidenceSetManifest,
  subject: EvidenceSubject,
): EvidenceSetRecord[] {
  const key = evidenceSubjectKey(subject);
  return manifest.records.filter((record) =>
    record.subjects.some((candidate) => evidenceSubjectKey(candidate) === key),
  );
}
