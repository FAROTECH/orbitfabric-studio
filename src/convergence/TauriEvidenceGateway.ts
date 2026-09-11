import { invoke } from "@tauri-apps/api/core";
import type { EvidenceGateway, EvidenceTextRead } from "./EvidenceGateway";
import type { RetainedReferenceRead, RetainedReferenceRequest } from "./retainedReference";

export class TauriEvidenceGateway implements EvidenceGateway {
  async readRetainedReference(request: RetainedReferenceRequest): Promise<RetainedReferenceRead> {
    return invoke<RetainedReferenceRead>("read_retained_reference", { ...request });
  }
  async readTextFile(path: string): Promise<EvidenceTextRead> {
    return invoke<EvidenceTextRead>("read_integration_text_file", { path });
  }
}
