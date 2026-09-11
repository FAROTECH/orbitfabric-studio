import type {
  IntegrationAdapterInvocation,
  IntegrationAdapterRunRequest,
  IntegrationBundleRead,
  IntegrationExecutionAuthorization,
  IntegrationTextDigestRead,
} from "./contracts";
import type { RetainedReferenceRead, RetainedReferenceRequest } from "../convergence/retainedReference";

export type IntegrationTextRead = {
  path: string;
  text: string;
};

export interface IntegrationGateway {
  readRetainedReference?(request: RetainedReferenceRequest): Promise<RetainedReferenceRead>;
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
