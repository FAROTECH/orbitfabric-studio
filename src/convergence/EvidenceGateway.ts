import type { RetainedReferenceRead, RetainedReferenceRequest } from "./retainedReference";

export type EvidenceTextRead = {
  path: string;
  text: string;
};

export interface EvidenceGateway {
  readTextFile(path: string): Promise<EvidenceTextRead>;
  readRetainedReference?(request: RetainedReferenceRequest): Promise<RetainedReferenceRead>;
}
