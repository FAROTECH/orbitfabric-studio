import type { IntegrationPackageDescriptor } from "../integrations/contracts";
import type {
  AdapterVerificationReport,
  ExactCatalogReleaseSelection,
  InstalledAdapterRecord,
  ProjectLockCheckReport,
} from "./adapterLifecycleContracts";

export interface LifecycleMembership {
  sessionId: string;
  generation: number;
}

export type LifecycleFailureClass = "transport" | "protocol" | "consistency";
export type LifecycleRequestMode = "replace" | "refresh";

export interface LifecycleHydrationFailure {
  class: LifecycleFailureClass;
  message: string;
}

export interface LifecycleRequest {
  membership: LifecycleMembership;
  requestToken: string;
  mode: LifecycleRequestMode;
}

export interface TargetedLifecycleRequest extends LifecycleRequest {
  target: string;
}

export interface CatalogLifecycleRequest extends LifecycleRequest {
  catalogPath: string;
  sourceCoordinate: string;
  releaseVersion: string;
}

export interface PackageBindingRequest extends LifecycleRequest {
  instanceId: string;
  manifestPath: string;
  expectedManifestSha256: string;
}

export interface PackageBindingObservation {
  instanceId: string;
  manifestPath: string;
  manifestSha256: string;
  descriptor: IntegrationPackageDescriptor;
}

export interface LifecycleFacetState<T, R extends LifecycleRequest = LifecycleRequest> {
  accepted: T | null;
  pending: R | null;
  failure: LifecycleHydrationFailure | null;
}

export interface AdapterLifecycleState {
  installed: LifecycleFacetState<InstalledAdapterRecord[]>;
  verifyByInstance: Map<string, LifecycleFacetState<AdapterVerificationReport, TargetedLifecycleRequest>>;
  projectLock: LifecycleFacetState<ProjectLockCheckReport, TargetedLifecycleRequest>;
  catalogRelease: LifecycleFacetState<ExactCatalogReleaseSelection, CatalogLifecycleRequest>;
  packageBindingByInstance: Map<string, LifecycleFacetState<PackageBindingObservation, PackageBindingRequest>>;
}

export type InstalledAction =
  | { type: "requested"; request: LifecycleRequest }
  | { type: "ready"; request: LifecycleRequest; records: InstalledAdapterRecord[] }
  | { type: "failed"; request: LifecycleRequest; failure: LifecycleHydrationFailure };

export type VerifyAction =
  | { type: "requested"; request: TargetedLifecycleRequest }
  | { type: "ready"; request: TargetedLifecycleRequest; report: AdapterVerificationReport }
  | { type: "failed"; request: TargetedLifecycleRequest; failure: LifecycleHydrationFailure };

export type ProjectLockAction =
  | { type: "requested"; request: TargetedLifecycleRequest }
  | { type: "ready"; request: TargetedLifecycleRequest; report: ProjectLockCheckReport }
  | { type: "failed"; request: TargetedLifecycleRequest; failure: LifecycleHydrationFailure };

export type CatalogAction =
  | { type: "requested"; request: CatalogLifecycleRequest }
  | { type: "ready"; request: CatalogLifecycleRequest; selection: ExactCatalogReleaseSelection }
  | { type: "failed"; request: CatalogLifecycleRequest; failure: LifecycleHydrationFailure };

export type PackageBindingAction =
  | { type: "requested"; request: PackageBindingRequest }
  | { type: "ready"; request: PackageBindingRequest; observation: PackageBindingObservation }
  | { type: "failed"; request: PackageBindingRequest; failure: LifecycleHydrationFailure };

export function emptyAdapterLifecycleState(): AdapterLifecycleState {
  return {
    installed: emptyFacet(),
    verifyByInstance: new Map(),
    projectLock: emptyFacet(),
    catalogRelease: emptyFacet(),
    packageBindingByInstance: new Map(),
  };
}

export function reduceInstalledFacet(
  state: AdapterLifecycleState,
  active: LifecycleMembership,
  action: InstalledAction,
): AdapterLifecycleState {
  if (!sameMembership(active, action.request.membership)) return state;
  const next = reduceFacet(state.installed, action, action.type === "ready" ? action.records : null);
  if (next === state.installed) return state;
  return { ...state, installed: next };
}

export function reduceVerifyFacet(
  state: AdapterLifecycleState,
  active: LifecycleMembership,
  action: VerifyAction,
): AdapterLifecycleState {
  if (!sameMembership(active, action.request.membership)) return state;
  const key = action.request.target;
  const current = state.verifyByInstance.get(key) ?? emptyFacet<AdapterVerificationReport, TargetedLifecycleRequest>();
  const next = reduceFacet(current, action, action.type === "ready" ? action.report : null);
  if (next === current) return state;
  const verifyByInstance = new Map(state.verifyByInstance);
  verifyByInstance.set(key, next);
  return { ...state, verifyByInstance };
}

export function reduceProjectLockFacet(
  state: AdapterLifecycleState,
  active: LifecycleMembership,
  action: ProjectLockAction,
): AdapterLifecycleState {
  if (!sameMembership(active, action.request.membership)) return state;
  const next = reduceFacet(state.projectLock, action, action.type === "ready" ? action.report : null);
  if (next === state.projectLock) return state;
  return { ...state, projectLock: next };
}

export function reduceCatalogFacet(
  state: AdapterLifecycleState,
  active: LifecycleMembership,
  action: CatalogAction,
): AdapterLifecycleState {
  if (!sameMembership(active, action.request.membership)) return state;
  const next = reduceFacet(state.catalogRelease, action, action.type === "ready" ? action.selection : null);
  if (next === state.catalogRelease) return state;
  return { ...state, catalogRelease: next };
}

export function reducePackageBindingFacet(
  state: AdapterLifecycleState,
  active: LifecycleMembership,
  action: PackageBindingAction,
): AdapterLifecycleState {
  if (!sameMembership(active, action.request.membership)) return state;
  const key = action.request.instanceId;
  const current =
    state.packageBindingByInstance.get(key) ??
    emptyFacet<PackageBindingObservation, PackageBindingRequest>();
  const next = reduceFacet(current, action, action.type === "ready" ? action.observation : null);
  if (next === current) return state;
  const packageBindingByInstance = new Map(state.packageBindingByInstance);
  packageBindingByInstance.set(key, next);
  return { ...state, packageBindingByInstance };
}

export function installedRecordByInstance(
  state: AdapterLifecycleState,
  instanceId: string,
): InstalledAdapterRecord | null {
  return state.installed.accepted?.find((record) => record.instanceId === instanceId) ?? null;
}

export function sameMembership(left: LifecycleMembership, right: LifecycleMembership): boolean {
  return left.sessionId === right.sessionId && left.generation === right.generation;
}

function emptyFacet<T, R extends LifecycleRequest = LifecycleRequest>(): LifecycleFacetState<T, R> {
  return { accepted: null, pending: null, failure: null };
}

function reduceFacet<T, R extends LifecycleRequest>(
  facet: LifecycleFacetState<T, R>,
  action: { type: "requested" | "ready" | "failed"; request: R; failure?: LifecycleHydrationFailure },
  readyValue: T | null,
): LifecycleFacetState<T, R> {
  if (action.type === "requested") {
    return {
      accepted: action.request.mode === "refresh" ? facet.accepted : null,
      pending: action.request,
      failure: null,
    };
  }
  if (!samePending(facet.pending, action.request)) return facet;
  if (action.type === "ready") {
    if (readyValue === null) return facet;
    return { accepted: readyValue, pending: null, failure: null };
  }
  return {
    accepted: facet.accepted,
    pending: null,
    failure: action.failure ?? { class: "transport", message: "Lifecycle hydration failed." },
  };
}

function samePending<R extends LifecycleRequest>(pending: R | null, request: R): boolean {
  return Boolean(
    pending &&
      sameMembership(pending.membership, request.membership) &&
      pending.requestToken === request.requestToken,
  );
}
