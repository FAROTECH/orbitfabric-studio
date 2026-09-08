import { invoke } from "@tauri-apps/api/core";
import type { EvidenceGateway, EvidenceTextRead } from "./EvidenceGateway";

export class TauriEvidenceGateway implements EvidenceGateway {
  async readTextFile(path: string): Promise<EvidenceTextRead> {
    return invoke<EvidenceTextRead>("read_integration_text_file", { path });
  }
}
