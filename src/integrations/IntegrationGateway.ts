import type { IntegrationBundleRead, IntegrationTextDigestRead } from "./contracts";

export type IntegrationTextRead = {
  path: string;
  text: string;
};

export interface IntegrationGateway {
  readPackageManifest(path: string): Promise<IntegrationTextRead>;
  readPackageProfileSchema(
    manifestPath: string,
    schemaPath: string,
    expectedSha256: string,
  ): Promise<IntegrationTextDigestRead>;
  readResultBundle(path: string): Promise<IntegrationBundleRead>;
}
