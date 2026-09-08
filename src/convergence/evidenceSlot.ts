import type {
  EvidenceSetManifest,
  EvidenceSetRecord,
  EvidenceSubject,
} from "./consumer-contracts";
import type { IntegrationResultObservation, IntegrationSlotState } from "./integrationSlot";
import type { ScenarioSlotState } from "./scenarioSlot";

export interface EvidenceGenerationMembership {
  sessionId: string;
  generation: number;
}

export type EvidenceRequestMode = "replace" | "refresh";

export interface EvidenceSlotRequest {
  membership: EvidenceGenerationMembership;
  requestToken: string;
  targetPath: string;
  mode: EvidenceRequestMode;
}

export type EvidenceHydrationFailureClass = "transport" | "protocol";

export interface EvidenceHydrationFailure {
  class: EvidenceHydrationFailureClass;
  message: string;
}

export interface EvidenceManifestObservation {
  membership: EvidenceGenerationMembership;
  targetPath: string;
  manifestSha256: string;
  manifest: EvidenceSetManifest;
}

export type EvidenceCorrelationState = "current" | "stale" | "unresolved";

export interface EvidenceSubjectCorrelation {
  subject: EvidenceSubject;
  state: EvidenceCorrelationState;
  reason: string;
}

export interface EvidenceRecordCorrelation {
  record: EvidenceSetRecord;
  subjects: EvidenceSubjectCorrelation[];
}

export interface EvidenceAcceptedObservation extends EvidenceManifestObservation {
  records: EvidenceRecordCorrelation[];
}

export interface EvidenceSlotState {
  accepted: EvidenceAcceptedObservation | null;
  pending: EvidenceSlotRequest | null;
  hydrationFailure: EvidenceHydrationFailure | null;
}

export type EvidenceSlotReadiness = "unselected" | "pending" | "ready" | "hydration_failed";

export type EvidenceSlotAction =
  | { type: "requested"; request: EvidenceSlotRequest }
  | { type: "ready"; request: EvidenceSlotRequest; observation: EvidenceManifestObservation }
  | { type: "hydration_failed"; request: EvidenceSlotRequest; failure: EvidenceHydrationFailure };

export function emptyEvidenceSlot(): EvidenceSlotState {
  return {
    accepted: null,
    pending: null,
    hydrationFailure: null,
  };
}

export function evidenceSlotReadiness(slot: EvidenceSlotState): EvidenceSlotReadiness {
  if (slot.pending) return "pending";
  if (slot.accepted) return "ready";
  if (slot.hydrationFailure) return "hydration_failed";
  return "unselected";
}

export function reduceEvidenceSlot(
  slot: EvidenceSlotState,
  activeMembership: EvidenceGenerationMembership,
  scenario: ScenarioSlotState,
  integration: IntegrationSlotState,
  action: EvidenceSlotAction,
): EvidenceSlotState {
  if (!sameEvidenceMembership(activeMembership, action.request.membership)) {
    return slot;
  }

  switch (action.type) {
    case "requested":
      return beginEvidenceRequest(slot, action.request);
    case "ready":
      return acceptEvidenceObservation(slot, action.request, action.observation, scenario, integration);
    case "hydration_failed":
      return failEvidenceHydration(slot, action.request, action.failure);
  }
}

export function beginEvidenceRequest(
  slot: EvidenceSlotState,
  request: EvidenceSlotRequest,
): EvidenceSlotState {
  const retainAccepted =
    request.mode === "refresh" && slot.accepted?.targetPath === request.targetPath;

  return {
    accepted: retainAccepted ? slot.accepted : null,
    pending: request,
    hydrationFailure: null,
  };
}

export function acceptEvidenceObservation(
  slot: EvidenceSlotState,
  request: EvidenceSlotRequest,
  observation: EvidenceManifestObservation,
  scenario: ScenarioSlotState,
  integration: IntegrationSlotState,
): EvidenceSlotState {
  if (!samePendingRequest(slot.pending, request)) return slot;
  if (
    !sameEvidenceMembership(observation.membership, request.membership) ||
    observation.targetPath !== request.targetPath
  ) {
    return slot;
  }

  return {
    accepted: correlateEvidenceObservation(observation, scenario, integration),
    pending: null,
    hydrationFailure: null,
  };
}

export function failEvidenceHydration(
  slot: EvidenceSlotState,
  request: EvidenceSlotRequest,
  failure: EvidenceHydrationFailure,
): EvidenceSlotState {
  if (!samePendingRequest(slot.pending, request)) return slot;

  return {
    accepted: slot.accepted,
    pending: null,
    hydrationFailure: failure,
  };
}

export function recomputeEvidenceCorrelations(
  slot: EvidenceSlotState,
  scenario: ScenarioSlotState,
  integration: IntegrationSlotState,
): EvidenceSlotState {
  if (!slot.accepted) return slot;

  const observation: EvidenceManifestObservation = {
    membership: slot.accepted.membership,
    targetPath: slot.accepted.targetPath,
    manifestSha256: slot.accepted.manifestSha256,
    manifest: slot.accepted.manifest,
  };
  return {
    ...slot,
    accepted: correlateEvidenceObservation(observation, scenario, integration),
  };
}

export function currentEvidenceRecords(slot: EvidenceSlotState): EvidenceSetRecord[] {
  return (
    slot.accepted?.records
      .filter((record) => record.subjects.some((subject) => subject.state === "current"))
      .map((record) => record.record) ?? []
  );
}

export function correlateEvidenceObservation(
  observation: EvidenceManifestObservation,
  scenario: ScenarioSlotState,
  integration: IntegrationSlotState,
): EvidenceAcceptedObservation {
  return {
    ...observation,
    records: observation.manifest.records.map((record) => ({
      record,
      subjects: record.subjects.map((subject) => correlateSubject(subject, scenario, integration)),
    })),
  };
}

export function sameEvidenceMembership(
  left: EvidenceGenerationMembership,
  right: EvidenceGenerationMembership,
): boolean {
  return left.sessionId === right.sessionId && left.generation === right.generation;
}

function correlateSubject(
  subject: EvidenceSubject,
  scenario: ScenarioSlotState,
  integration: IntegrationSlotState,
): EvidenceSubjectCorrelation {
  if (subject.type === "scenario_source") {
    const declaration = scenario.accepted?.declaration;
    if (!declaration || declaration.result !== "loaded") {
      return unresolved(subject, "No loaded Scenario observation is available in the active generation.");
    }
    if (declaration.scenario.id !== subject.scenarioId) {
      return unresolved(subject, `Loaded Scenario id ${declaration.scenario.id} does not match ${subject.scenarioId}.`);
    }
    if (declaration.source.scenarioSha256 !== subject.scenarioSha256) {
      return stale(subject, "The logical Scenario is loaded, but its exact SHA-256 differs from the curator-authored subject.");
    }
    return current(subject, "The curator-authored Scenario id and exact SHA-256 match the active Scenario observation.");
  }

  if (subject.type === "scenario_atom") {
    const declaration = scenario.accepted?.declaration;
    if (!declaration || declaration.result !== "loaded") {
      return unresolved(subject, "No loaded Scenario observation is available in the active generation.");
    }
    if (declaration.source.scenarioSha256 !== subject.scenarioSha256) {
      return stale(subject, "The active Scenario exact SHA-256 differs from the curator-authored atom subject.");
    }
    if (!declaration.atoms.some((atom) => atom.id === subject.atomId)) {
      return unresolved(subject, `Scenario atom ${subject.atomId} does not exist in the exact loaded Scenario.`);
    }
    return current(subject, "The exact Scenario SHA-256 and atom id resolve in the active Scenario observation.");
  }

  const result = integrationObservationBySha(integration, subject.resultSha256);
  if (!result) {
    return unresolved(subject, "The exact Integration Result SHA-256 is not loaded in the active generation.");
  }

  if (subject.type === "integration_result") {
    return current(subject, "The exact curator-authored Integration Result SHA-256 is loaded in the active generation.");
  }

  if (subject.type === "integration_mapping") {
    if (!result.result.mappings.some((mapping) => mapping.id === subject.mappingId)) {
      return unresolved(subject, `Mapping ${subject.mappingId} does not exist inside the exact correlated Integration Result.`);
    }
    return current(subject, "The exact Result SHA-256 and mapping id resolve in the active Integration observation.");
  }

  if (!result.result.artifacts.some((artifact) => artifact.id === subject.artifactId)) {
    return unresolved(subject, `Artifact ${subject.artifactId} does not exist inside the exact correlated Integration Result.`);
  }
  return current(subject, "The exact Result SHA-256 and artifact id resolve in the active Integration observation.");
}

function integrationObservationBySha(
  slot: IntegrationSlotState,
  sha256: string,
): IntegrationResultObservation | null {
  for (const context of slot.contexts.values()) {
    if (context.accepted?.resultSha256 === sha256) {
      return context.accepted;
    }
  }
  return null;
}

function current(subject: EvidenceSubject, reason: string): EvidenceSubjectCorrelation {
  return { subject, state: "current", reason };
}

function stale(subject: EvidenceSubject, reason: string): EvidenceSubjectCorrelation {
  return { subject, state: "stale", reason };
}

function unresolved(subject: EvidenceSubject, reason: string): EvidenceSubjectCorrelation {
  return { subject, state: "unresolved", reason };
}

function samePendingRequest(
  pending: EvidenceSlotRequest | null,
  request: EvidenceSlotRequest,
): boolean {
  return Boolean(
    pending &&
      sameEvidenceMembership(pending.membership, request.membership) &&
      pending.requestToken === request.requestToken &&
      pending.targetPath === request.targetPath &&
      pending.mode === request.mode,
  );
}
