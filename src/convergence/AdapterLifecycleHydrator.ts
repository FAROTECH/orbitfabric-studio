import { parseIntegrationPackageManifest } from "../integrations/manifest";
import { sha256Utf8 } from "../integrations/sha256";
import type { CoreInvocationResult } from "../core/contracts";
import type { AdapterLifecycleGateway } from "./AdapterLifecycleGateway";
import {
  parseAdapterVerificationReport,
  parseExactCatalogReleaseSelection,
  parseInstalledAdapterRecords,
  parseProjectLockCheckReport,
  type AdapterVerificationReport,
  type ExactCatalogReleaseSelection,
  type InstalledAdapterRecord,
  type ProjectLockCheckReport,
} from "./adapterLifecycleContracts";
import type {
  CatalogLifecycleRequest,
  LifecycleRequest,
  PackageBindingObservation,
  PackageBindingRequest,
  TargetedLifecycleRequest,
} from "./adapterLifecycleSlot";

export class AdapterLifecycleTransportError extends Error {
  constructor(message: string, readonly invocation?: CoreInvocationResult) {
    super(message);
    this.name = "AdapterLifecycleTransportError";
  }
}

export class AdapterLifecycleProtocolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdapterLifecycleProtocolError";
  }
}

export class AdapterLifecycleConsistencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdapterLifecycleConsistencyError";
  }
}

export class AdapterLifecycleHydrator {
  constructor(private readonly gateway: AdapterLifecycleGateway) {}

  async hydrateInstalled(
    executable: string,
    _request: LifecycleRequest,
  ): Promise<InstalledAdapterRecord[]> {
    const invocation = await this.gateway.listInstalled(executable);
    const text = requireJsonStdout("Installed adapter inventory", invocation, false);
    return parseProtocol("Installed adapter inventory", () => parseInstalledAdapterRecords(text));
  }

  async hydrateVerify(
    executable: string,
    request: TargetedLifecycleRequest,
  ): Promise<AdapterVerificationReport> {
    const invocation = await this.gateway.verifyInstalled(executable, request.target);
    const text = requireJsonStdout("Adapter verification report", invocation, true);
    const report = parseProtocol("Adapter verification report", () =>
      parseAdapterVerificationReport(text),
    );
    if (report.instanceId !== request.target) {
      throw new AdapterLifecycleConsistencyError(
        `Adapter verification report identifies instance ${report.instanceId}, expected ${request.target}.`,
      );
    }
    return report;
  }

  async hydrateProjectLock(
    executable: string,
    request: TargetedLifecycleRequest,
  ): Promise<ProjectLockCheckReport> {
    const invocation = await this.gateway.checkProjectLock(executable, request.target);
    const text = requireJsonStdout("Adapter Project Lock check report", invocation, true);
    return parseProtocol("Adapter Project Lock check report", () =>
      parseProjectLockCheckReport(text),
    );
  }

  async hydrateCatalogRelease(
    executable: string,
    request: CatalogLifecycleRequest,
  ): Promise<ExactCatalogReleaseSelection> {
    const invocation = await this.gateway.selectCatalogRelease(
      executable,
      request.catalogPath,
      request.sourceCoordinate,
      request.releaseVersion,
    );
    const text = requireJsonStdout("Adapter Catalog exact release selection", invocation, false);
    const selection = parseProtocol("Adapter Catalog exact release selection", () =>
      parseExactCatalogReleaseSelection(text),
    );
    const actualCoordinate = formatSourceCoordinate(selection.sourceCoordinate);
    if (
      actualCoordinate !== request.sourceCoordinate ||
      selection.releaseVersion !== request.releaseVersion
    ) {
      throw new AdapterLifecycleConsistencyError(
        `Adapter Catalog selected ${actualCoordinate}@${selection.releaseVersion}, expected ${request.sourceCoordinate}@${request.releaseVersion}.`,
      );
    }
    return selection;
  }

  async hydratePackageBinding(
    request: PackageBindingRequest,
  ): Promise<PackageBindingObservation> {
    const read = await this.gateway.readTextFile(request.manifestPath);
    const manifestSha256 = await sha256Utf8(read.text);
    if (manifestSha256 !== request.expectedManifestSha256) {
      throw new AdapterLifecycleConsistencyError(
        `Installed Integration Package manifest SHA-256 ${manifestSha256} does not match Core installed record ${request.expectedManifestSha256}.`,
      );
    }

    const descriptor = parseProtocol("Installed Integration Package manifest", () =>
      parseIntegrationPackageManifest(read.path, read.text),
    );
    return {
      instanceId: request.instanceId,
      manifestPath: read.path,
      manifestSha256,
      descriptor,
    };
  }
}

function requireJsonStdout(
  label: string,
  invocation: CoreInvocationResult,
  allowDomainFailureExit: boolean,
): string {
  if (!invocation.processCompleted || invocation.timedOut) {
    throw new AdapterLifecycleTransportError(
      `${label} process did not complete.`,
      invocation,
    );
  }

  const allowedExit =
    invocation.exitCode === 0 ||
    (allowDomainFailureExit && invocation.exitCode === 1);
  if (!allowedExit) {
    const detail = invocation.stderr.trim();
    throw new AdapterLifecycleTransportError(
      `${label} failed with exit ${invocation.exitCode ?? "unknown"}${detail ? `: ${detail}` : "."}`,
      invocation,
    );
  }

  const text = invocation.stdout.trim();
  if (text.length === 0) {
    const detail = invocation.stderr.trim();
    throw new AdapterLifecycleTransportError(
      `${label} did not produce structured JSON${detail ? `: ${detail}` : "."}`,
      invocation,
    );
  }

  return text;
}

function parseProtocol<T>(label: string, parse: () => T): T {
  try {
    return parse();
  } catch (error) {
    if (error instanceof AdapterLifecycleConsistencyError) throw error;
    throw new AdapterLifecycleProtocolError(
      `${label} is not usable: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function formatSourceCoordinate(coordinate: {
  authority: string;
  publisher: string;
  name: string;
}): string {
  return `${coordinate.authority}:${coordinate.publisher}/${coordinate.name}`;
}
