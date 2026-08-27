import type {
  IntegrationAdapterInvocation,
  IntegrationAdapterRunRequest,
  IntegrationBundleRead,
  IntegrationExecutionAuthorization,
  IntegrationTextDigestRead,
} from "./contracts";

export type IntegrationTextRead = {
  path: string;
  text: string;
};

export interface IntegrationGateway {
  readPackageManifest(path: string): Promise<IntegrationTextRead>;
  readTextFile(path: string): Promise<IntegrationTextRead>;
  readPackageProfileSchema(
    manifestPath: string,
    schemaPath: string,
    expectedSha256: string,
  ): Promise<IntegrationTextDigestRead>;
  readResultBundle(path: string): Promise<IntegrationBundleRead>;
  runAdapter(
    authorization: IntegrationExecutionAuthorization,
    request: IntegrationAdapterRunRequest,
  ): Promise<IntegrationAdapterInvocation>;
}
