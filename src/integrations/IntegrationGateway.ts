import type { IntegrationBundleRead } from "./contracts";

export type IntegrationTextRead = {
  path: string;
  text: string;
};

export interface IntegrationGateway {
  readPackageManifest(path: string): Promise<IntegrationTextRead>;
  readResultBundle(path: string): Promise<IntegrationBundleRead>;
}
