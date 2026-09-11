import type { IntegrationArtifact, IntegrationMapping } from "../integrations/contracts";
import type { EvidenceAcceptedObservation, EvidenceRecordCorrelation, EvidenceSlotState, EvidenceSubjectCorrelation, EvidenceReferenceObservation } from "./evidenceSlot";
import type { EvidenceSubject } from "./consumer-contracts";
import type { IntegrationResultObservation, IntegrationSlotState } from "./integrationSlot";
import type { ScenarioSlotState } from "./scenarioSlot";
import { validateAccountingAgainstScenario, type ScenarioProjectionAccountingRecord } from "./scenarioProjectionAccounting";

export type ProjectionAvailability = "current" | "stale" | "unresolved" | "unavailable" | "missing" | "digest_mismatch" | "unsupported" | "failure";

export interface ReplayEvidenceRecord {
  id: string;
  kind: string;
  producerId: string;
  path: string;
  sha256: string;
  matchedSubjects: EvidenceSubjectCorrelation[];
  subjects: EvidenceSubjectCorrelation[];
  reference: EvidenceReferenceObservation | null;
  verdict: "unavailable";
}

export interface ReplayProjection {
  resultSha256: string;
  integrationId: string;
  adapterId: string;
  adapterVersion: string;
  operationId: string;
  availability: ProjectionAvailability;
  disposition: ScenarioProjectionAccountingRecord["disposition"] | "unavailable";
  reason: string;
  mappings: IntegrationMapping[];
  artifacts: IntegrationArtifact[];
  evidence: ReplayEvidenceRecord[];
}

export interface ReplayAtom {
  atomId: string;
  role: string;
  kind: string;
  declarationPosition: number;
  declaration: unknown;
  projections: ReplayProjection[];
  directEvidence: ReplayEvidenceRecord[];
}

export function buildEvidenceUnderstanding(
  scenarioSlot: ScenarioSlotState,
  integrationSlot: IntegrationSlotState,
  evidenceSlot: EvidenceSlotState,
) {
  const declaration = scenarioSlot.accepted?.declaration;
  const loaded = declaration?.result === "loaded" ? declaration : null;
  const results = [...integrationSlot.contexts.values()]
    .map((context) => context.accepted)
    .filter((value): value is IntegrationResultObservation => value !== null)
    .sort((left, right) => left.resultSha256 < right.resultSha256 ? -1 : left.resultSha256 > right.resultSha256 ? 1 : 0);
  const evidence = evidenceSlot.accepted ?? null;

  const atoms: ReplayAtom[] = loaded ? loaded.atoms.map((atom, index) => ({
    atomId: atom.id,
    role: atom.role,
    kind: atom.kind,
    declarationPosition: index + 1,
    declaration: atom.declaration,
    projections: results.map((result) => projectionForAtom(result, atom.id, loaded, evidence)),
    directEvidence: recordsForAtom(evidence, loaded.source.scenarioSha256, atom.id),
  })) : [];

  return {
    scenario: loaded ? { id: loaded.scenario.id, sha256: loaded.source.scenarioSha256 } : null,
    atoms,
    results: results.map((result) => ({
      sha256: result.resultSha256,
      integrationId: result.result.integration.id,
      adapterId: result.result.adapter.id,
      adapterVersion: result.result.adapter.version,
      operationId: result.result.operation.id,
      accounting: result.accountingIssue?.state ?? (result.scenarioAccounting ? "available" : "unavailable"),
      accountingReference: result.accountingReference ?? null,
      operationResult: result.result.result,
      producerStatements: result.result.evidence,
      mappings: result.result.mappings,
      artifacts: result.result.artifacts,
      evidence: selectRecords(evidence, (subject) => subject.type === "integration_result" && subject.resultSha256 === result.resultSha256),
    })),
    evidenceSet: evidence ? {
      id: evidence.manifest.evidenceSet.id,
      curator: evidence.manifest.curator.id,
      sha256: evidence.manifestSha256,
      recordCount: evidence.records.length,
    } : null,
    records: evidence?.records.map((record) => presentEvidenceRecord(record, () => true, evidence)) ?? [],
    pending: { scenario: Boolean(scenarioSlot.pending), evidence: Boolean(evidenceSlot.pending), results: [...integrationSlot.contexts.values()].some((context) => Boolean(context.pending)) },
    failures: [scenarioSlot.hydrationFailure, evidenceSlot.hydrationFailure, ...[...integrationSlot.contexts.values()].map((context) => context.hydrationFailure)].filter(Boolean),
    availability: {
      scenario: loaded ? "available" : "unavailable",
      results: results.length ? "available" : "unavailable",
      evidence: evidence ? "available" : "unavailable",
    },
  };
}

export type EvidenceUnderstandingModel = ReturnType<typeof buildEvidenceUnderstanding>;

function projectionForAtom(
  observation: IntegrationResultObservation,
  atomId: string,
  declaration: NonNullable<ScenarioSlotState["accepted"]>["declaration"] & { result: "loaded" },
  evidence: EvidenceAcceptedObservation | null,
): ReplayProjection {
  const base = {
    resultSha256: observation.resultSha256,
    integrationId: observation.result.integration.id,
    adapterId: observation.result.adapter.id,
    adapterVersion: observation.result.adapter.version,
    operationId: observation.result.operation.id,
  };
  const accounting = observation.scenarioAccounting?.accounting;
  if (!accounting) {
    return { ...base, availability: observation.accountingIssue?.state ?? "unavailable", disposition: "unavailable", reason: observation.accountingIssue?.reason ?? "This Result supplies no generic Scenario Projection Accounting artifact.", mappings: [], artifacts: [], evidence: [] };
  }
  if (observation.scenarioAccounting?.resultSha256 !== observation.resultSha256) return { ...base, availability: "failure", disposition: "unavailable", reason: "Accounting observation belongs to another exact parent Result.", mappings: [], artifacts: [], evidence: [] };
  if (accounting.scenario.id !== declaration.scenario.id) return { ...base, availability: "unresolved", disposition: "unavailable", reason: "Accounting identifies another Scenario id.", mappings: [], artifacts: [], evidence: [] };
  if (accounting.scenario.sha256 !== declaration.source.scenarioSha256) return { ...base, availability: "stale", disposition: "unavailable", reason: "Accounting identifies different bytes of this Scenario.", mappings: [], artifacts: [], evidence: [] };
  try {
    if (observation.result.mission.status !== "available" || observation.result.mission.id !== declaration.mission.id || observation.result.mission.model_version !== declaration.mission.modelVersion) throw new Error("Result and Scenario Declaration mission binding differs.");
    validateAccountingAgainstScenario(accounting, declaration);
  } catch (error) {
    return { ...base, availability: "failure", disposition: "unavailable", reason: error instanceof Error ? error.message : String(error), mappings: [], artifacts: [], evidence: [] };
  }
  const record = accounting.records.find((candidate) => candidate.atomId === atomId);
  if (!record) {
    return { ...base, availability: "unavailable", disposition: "unavailable", reason: accounting.completeness === "partial" ? accounting.reason ?? "Partial producer accounting omits this atom." : "Accounting record unavailable.", mappings: [], artifacts: [], evidence: [] };
  }
  const mappings = record.mappingIds.map((mappingId) => observation.result.mappings.find((mapping) => mapping.id === mappingId)!).filter(Boolean);
  const mappingIds = new Set(record.mappingIds);
  const artifacts = observation.result.artifacts.filter((artifact) => artifact.derivedFromMappings.some((mappingId) => mappingIds.has(mappingId)));
  return {
    ...base,
    availability: "current",
    disposition: record.disposition,
    reason: record.reason ?? "Producer supplied no additional reason.",
    mappings,
    artifacts,
    evidence: recordsForProjection(evidence, observation.resultSha256, mappingIds, new Set(artifacts.map((artifact) => artifact.id))),
  };
}

function recordsForAtom(evidence: EvidenceAcceptedObservation | null, scenarioSha256: string, atomId: string): ReplayEvidenceRecord[] {
  return selectRecords(evidence, (subject) => subject.type === "scenario_atom" && subject.scenarioSha256 === scenarioSha256 && subject.atomId === atomId);
}

function recordsForProjection(evidence: EvidenceAcceptedObservation | null, resultSha256: string, mappingIds: Set<string>, artifactIds: Set<string>): ReplayEvidenceRecord[] {
  return selectRecords(evidence, (subject) =>
    (subject.type === "integration_mapping" && subject.resultSha256 === resultSha256 && mappingIds.has(subject.mappingId)) ||
    (subject.type === "integration_artifact" && subject.resultSha256 === resultSha256 && artifactIds.has(subject.artifactId)));
}

function selectRecords(evidence: EvidenceAcceptedObservation | null, matches: (subject: EvidenceSubject) => boolean): ReplayEvidenceRecord[] {
  return evidence?.records.filter((record) => record.record.subjects.some(matches)).map((record) => presentEvidenceRecord(record, matches, evidence)) ?? [];
}

function presentEvidenceRecord(record: EvidenceRecordCorrelation, matches: (subject: EvidenceSubject) => boolean, evidence: EvidenceAcceptedObservation): ReplayEvidenceRecord {
  return {
    id: record.record.id,
    kind: record.record.content.kind,
    producerId: record.record.content.producer.id,
    path: record.record.content.reference.path,
    sha256: record.record.content.reference.sha256,
    matchedSubjects: record.subjects.filter((subject) => matches(subject.subject)),
    subjects: record.subjects,
    reference: evidence.references?.find((reference) => reference.recordId === record.record.id) ?? null,
    verdict: "unavailable",
  };
}
