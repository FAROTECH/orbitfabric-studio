import type { IntegrationPackageOperation } from "../integrations/contracts";
import type {
  AdapterSourceCoordinate,
  AdapterVerificationReport,
  ExactCatalogReleaseSelection,
  InstalledAdapterRecord,
  ProjectAdapterStateReport,
  ProjectLockCheckReport,
} from "./adapterLifecycleContracts";
import type {
  AdapterLifecycleState,
  LifecycleFacetState,
  LifecycleHydrationFailure,
  LifecycleRequest,
  PackageBindingObservation,
} from "./adapterLifecycleSlot";

export type LifecycleObservationAvailability =
  | "unavailable"
  | "pending"
  | "available"
  | "failed";

export interface LifecycleObservation<T> {
  availability: LifecycleObservationAvailability;
  value: T | null;
  refreshing: boolean;
  failure: LifecycleHydrationFailure | null;
}

export interface ExactAdapterReleaseIdentity {
  sourceCoordinate: AdapterSourceCoordinate;
  sourceCoordinateText: string;
  releaseVersion: string;
  key: string;
  display: string;
}

export interface InstalledAdapterLifecycleView {
  identity: ExactAdapterReleaseIdentity;
  installed: InstalledAdapterRecord;
  verification: LifecycleObservation<AdapterVerificationReport>;
  desiredComparisons: ProjectAdapterStateReport[];
  packageBinding: LifecycleObservation<PackageBindingObservation>;
  operations: IntegrationPackageOperation[];
  catalogSelection: ExactCatalogReleaseSelection | null;
}

export interface DesiredAdapterLifecycleView {
  identity: ExactAdapterReleaseIdentity;
  comparison: ProjectAdapterStateReport;
}

export interface AdapterLifecycleReadModel {
  inventory: LifecycleObservation<InstalledAdapterRecord[]>;
  installed: InstalledAdapterLifecycleView[];
  projectLock: LifecycleObservation<ProjectLockCheckReport>;
  desired: DesiredAdapterLifecycleView[];
  catalog: LifecycleObservation<ExactCatalogReleaseSelection>;
  catalogIdentity: ExactAdapterReleaseIdentity | null;
  exactReleaseChoices: ExactAdapterReleaseIdentity[];
}

export function buildAdapterLifecycleReadModel(
  state: AdapterLifecycleState,
): AdapterLifecycleReadModel {
  const inventory = observeFacet(state.installed);
  const projectLock = observeFacet(state.projectLock);
  const catalog = observeFacet(state.catalogRelease);
  const desired = (projectLock.value?.adapters ?? []).map((comparison) => ({
    identity: exactReleaseIdentity(comparison.sourceCoordinate, comparison.releaseVersion),
    comparison,
  }));
  const catalogIdentity = catalog.value
    ? exactReleaseIdentity(catalog.value.sourceCoordinate, catalog.value.releaseVersion)
    : null;

  const installed = (inventory.value ?? []).map((record) => {
    const verification = observeFacet(state.verifyByInstance.get(record.instanceId));
    const packageBinding = observeFacet(state.packageBindingByInstance.get(record.instanceId));
    const identity = exactReleaseIdentity(record.sourceCoordinate, record.releaseVersion);
    const desiredComparisons = (projectLock.value?.adapters ?? []).filter((comparison) =>
      comparison.matchingInstanceIds.includes(record.instanceId) ||
      comparison.candidateInstanceIds.includes(record.instanceId),
    );

    return {
      identity,
      installed: record,
      verification,
      desiredComparisons,
      packageBinding,
      operations: packageBinding.value?.descriptor.operations ?? [],
      catalogSelection:
        catalogIdentity?.key === identity.key ? catalog.value : null,
    };
  });

  return {
    inventory,
    installed,
    projectLock,
    desired,
    catalog,
    catalogIdentity,
    exactReleaseChoices: uniqueExactIdentities([
      ...installed.map((item) => item.identity),
      ...desired.map((item) => item.identity),
    ]),
  };
}

export function exactReleaseIdentity(
  sourceCoordinate: AdapterSourceCoordinate,
  releaseVersion: string,
): ExactAdapterReleaseIdentity {
  const sourceCoordinateText = formatSourceCoordinate(sourceCoordinate);
  return {
    sourceCoordinate,
    sourceCoordinateText,
    releaseVersion,
    key: `${sourceCoordinateText}\u0000${releaseVersion}`,
    display: `${sourceCoordinateText}@${releaseVersion}`,
  };
}

export function formatSourceCoordinate(coordinate: AdapterSourceCoordinate): string {
  return `${coordinate.authority}:${coordinate.publisher}/${coordinate.name}`;
}

function observeFacet<T, R extends LifecycleRequest = LifecycleRequest>(
  facet: LifecycleFacetState<T, R> | undefined,
): LifecycleObservation<T> {
  if (!facet) {
    return { availability: "unavailable", value: null, refreshing: false, failure: null };
  }
  if (facet.accepted !== null) {
    return {
      availability: "available",
      value: facet.accepted,
      refreshing: facet.pending !== null,
      failure: facet.failure,
    };
  }
  if (facet.pending !== null) {
    return { availability: "pending", value: null, refreshing: false, failure: null };
  }
  if (facet.failure !== null) {
    return { availability: "failed", value: null, refreshing: false, failure: facet.failure };
  }
  return { availability: "unavailable", value: null, refreshing: false, failure: null };
}

function uniqueExactIdentities(
  identities: ExactAdapterReleaseIdentity[],
): ExactAdapterReleaseIdentity[] {
  const byKey = new Map<string, ExactAdapterReleaseIdentity>();
  for (const identity of identities) {
    if (!byKey.has(identity.key)) byKey.set(identity.key, identity);
  }
  return [...byKey.values()].sort((left, right) => left.display.localeCompare(right.display));
}
