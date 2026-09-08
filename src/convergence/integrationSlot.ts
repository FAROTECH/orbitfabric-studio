import type {
  CoreIntegrationInputSet,
  IntegrationBundleRead,
  IntegrationCurrentOperationInput,
  IntegrationProfileDocument,
  IntegrationProfileFreshnessAssessment,
  IntegrationResult,
} from "../integrations/contracts";
import { assessIntegrationFreshness } from "../integrations/staleness";

export interface IntegrationGenerationMembership {
  sessionId: string;
  generation: number;
}

export interface IntegrationOperationContextIdentity {
  integrationId: string;
  adapterId: string;
  adapterVersion: string;
  operationId: string;
}

export interface IntegrationResultObservation {
  membership: IntegrationGenerationMembership;
  context: IntegrationOperationContextIdentity;
  resultPath: string;
  resultSha256: string;
  result: IntegrationResult;
  bundle: IntegrationBundleRead;
}

export interface IntegrationContextRequest {
  membership: IntegrationGenerationMembership;
  requestToken: string;
  context: IntegrationOperationContextIdentity;
  resultPath: string;
}

export type IntegrationHydrationFailureClass = "transport" | "protocol" | "consistency";

export interface IntegrationHydrationFailure {
  class: IntegrationHydrationFailureClass;
  message: string;
}

export interface IntegrationContextState {
  accepted: IntegrationResultObservation | null;
  pending: IntegrationContextRequest | null;
  hydrationFailure: IntegrationHydrationFailure | null;
}

export interface IntegrationSlotState {
  contexts: ReadonlyMap<string, IntegrationContextState>;
}

export type IntegrationContextAction =
  | { type: "requested"; request: IntegrationContextRequest }
  | { type: "ready"; request: IntegrationContextRequest; observation: IntegrationResultObservation }
  | { type: "hydration_failed"; request: IntegrationContextRequest; failure: IntegrationHydrationFailure };

export function emptyIntegrationSlot(): IntegrationSlotState {
  return { contexts: new Map() };
}

export function emptyIntegrationContext(): IntegrationContextState {
  return { accepted: null, pending: null, hydrationFailure: null };
}

export function integrationOperationContextKey(
  identity: IntegrationOperationContextIdentity,
): string {
  return [
    identity.integrationId,
    identity.adapterId,
    identity.adapterVersion,
    identity.operationId,
  ].map(escapeKeyPart).join("|");
}

export function integrationResultExactIdentity(
  observation: IntegrationResultObservation,
): string {
  return observation.resultSha256;
}

export function getIntegrationContext(
  slot: IntegrationSlotState,
  identity: IntegrationOperationContextIdentity,
): IntegrationContextState {
  return slot.contexts.get(integrationOperationContextKey(identity)) ?? emptyIntegrationContext();
}

export function reduceIntegrationSlot(
  slot: IntegrationSlotState,
  activeMembership: IntegrationGenerationMembership,
  action: IntegrationContextAction,
): IntegrationSlotState {
  if (!sameIntegrationMembership(activeMembership, action.request.membership)) {
    return slot;
  }

  const key = integrationOperationContextKey(action.request.context);
  const current = slot.contexts.get(key) ?? emptyIntegrationContext();
  let next: IntegrationContextState;

  switch (action.type) {
    case "requested":
      next = {
        accepted: current.accepted,
        pending: action.request,
        hydrationFailure: null,
      };
      break;
    case "ready":
      if (!samePendingRequest(current.pending, action.request)) return slot;
      next = {
        accepted: action.observation,
        pending: null,
        hydrationFailure: null,
      };
      break;
    case "hydration_failed":
      if (!samePendingRequest(current.pending, action.request)) return slot;
      next = {
        accepted: current.accepted,
        pending: null,
        hydrationFailure: action.failure,
      };
      break;
  }

  const contexts = new Map(slot.contexts);
  contexts.set(key, next);
  return { contexts };
}

export function assessIntegrationObservationFreshness(
  observation: IntegrationResultObservation | null,
  inputSet: CoreIntegrationInputSet | null,
  profile: IntegrationProfileDocument | null,
  currentOperationInputs: IntegrationCurrentOperationInput[] = [],
): IntegrationProfileFreshnessAssessment {
  return assessIntegrationFreshness(
    observation?.result ?? null,
    inputSet,
    profile,
    currentOperationInputs,
  );
}

export function sameIntegrationMembership(
  left: IntegrationGenerationMembership,
  right: IntegrationGenerationMembership,
): boolean {
  return left.sessionId === right.sessionId && left.generation === right.generation;
}

function samePendingRequest(
  pending: IntegrationContextRequest | null,
  request: IntegrationContextRequest,
): boolean {
  return Boolean(
    pending &&
      sameIntegrationMembership(pending.membership, request.membership) &&
      pending.requestToken === request.requestToken &&
      integrationOperationContextKey(pending.context) === integrationOperationContextKey(request.context) &&
      pending.resultPath === request.resultPath,
  );
}

function escapeKeyPart(value: string): string {
  return `${value.length}:${value}`;
}
