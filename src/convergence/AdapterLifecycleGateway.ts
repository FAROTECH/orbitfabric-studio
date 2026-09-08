import type { CoreInvocationResult } from "../core/contracts";

export interface LifecycleTextRead {
  path: string;
  text: string;
}

export interface AdapterLifecycleGateway {
  listInstalled(executable: string): Promise<CoreInvocationResult>;
  verifyInstalled(executable: string, instanceId: string): Promise<CoreInvocationResult>;
  checkProjectLock(executable: string, lockPath: string): Promise<CoreInvocationResult>;
  selectCatalogRelease(
    executable: string,
    catalogPath: string,
    sourceCoordinate: string,
    releaseVersion: string,
  ): Promise<CoreInvocationResult>;
  readTextFile(path: string): Promise<LifecycleTextRead>;
}
