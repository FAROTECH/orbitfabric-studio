import type { ScenarioDeclaration } from "./consumer-contracts";

export interface ScenarioGenerationMembership {
  sessionId: string;
  generation: number;
}

export type ScenarioRequestMode = "replace" | "refresh";

export interface ScenarioSlotRequest {
  membership: ScenarioGenerationMembership;
  requestToken: string;
  targetPath: string;
  mode: ScenarioRequestMode;
}

export type ScenarioHydrationFailureClass = "transport" | "protocol" | "consistency";

export interface ScenarioHydrationFailure {
  class: ScenarioHydrationFailureClass;
  message: string;
}

export interface ScenarioAcceptedObservation {
  membership: ScenarioGenerationMembership;
  targetPath: string;
  declaration: ScenarioDeclaration;
}

export interface ScenarioSlotState {
  accepted: ScenarioAcceptedObservation | null;
  pending: ScenarioSlotRequest | null;
  hydrationFailure: ScenarioHydrationFailure | null;
}

export type ScenarioSlotReadiness =
  | "unselected"
  | "pending"
  | "loaded"
  | "declared_failed"
  | "hydration_failed";

export type ScenarioSlotAction =
  | { type: "requested"; request: ScenarioSlotRequest }
  | { type: "ready"; request: ScenarioSlotRequest; declaration: ScenarioDeclaration }
  | { type: "hydration_failed"; request: ScenarioSlotRequest; failure: ScenarioHydrationFailure };

export function emptyScenarioSlot(): ScenarioSlotState {
  return {
    accepted: null,
    pending: null,
    hydrationFailure: null,
  };
}

export function scenarioSlotReadiness(slot: ScenarioSlotState): ScenarioSlotReadiness {
  if (slot.pending) return "pending";
  if (slot.accepted?.declaration.result === "loaded") return "loaded";
  if (slot.accepted?.declaration.result === "failed") return "declared_failed";
  if (slot.hydrationFailure) return "hydration_failed";
  return "unselected";
}

export function reduceScenarioSlot(
  slot: ScenarioSlotState,
  activeMembership: ScenarioGenerationMembership,
  action: ScenarioSlotAction,
): ScenarioSlotState {
  if (!sameScenarioMembership(activeMembership, action.request.membership)) {
    return slot;
  }

  switch (action.type) {
    case "requested":
      return beginScenarioRequest(slot, action.request);
    case "ready":
      return acceptScenarioObservation(slot, action.request, action.declaration);
    case "hydration_failed":
      return failScenarioHydration(slot, action.request, action.failure);
  }
}

export function beginScenarioRequest(
  slot: ScenarioSlotState,
  request: ScenarioSlotRequest,
): ScenarioSlotState {
  const retainAccepted =
    request.mode === "refresh" && slot.accepted?.targetPath === request.targetPath;

  return {
    accepted: retainAccepted ? slot.accepted : null,
    pending: request,
    hydrationFailure: null,
  };
}

export function acceptScenarioObservation(
  slot: ScenarioSlotState,
  request: ScenarioSlotRequest,
  declaration: ScenarioDeclaration,
): ScenarioSlotState {
  if (!samePendingRequest(slot.pending, request)) return slot;

  return {
    accepted: {
      membership: request.membership,
      targetPath: request.targetPath,
      declaration,
    },
    pending: null,
    hydrationFailure: null,
  };
}

export function failScenarioHydration(
  slot: ScenarioSlotState,
  request: ScenarioSlotRequest,
  failure: ScenarioHydrationFailure,
): ScenarioSlotState {
  if (!samePendingRequest(slot.pending, request)) return slot;

  return {
    accepted: slot.accepted,
    pending: null,
    hydrationFailure: failure,
  };
}

export function sameScenarioMembership(
  left: ScenarioGenerationMembership,
  right: ScenarioGenerationMembership,
): boolean {
  return left.sessionId === right.sessionId && left.generation === right.generation;
}

function samePendingRequest(
  pending: ScenarioSlotRequest | null,
  request: ScenarioSlotRequest,
): boolean {
  return Boolean(
    pending &&
      sameScenarioMembership(pending.membership, request.membership) &&
      pending.requestToken === request.requestToken &&
      pending.targetPath === request.targetPath,
  );
}
