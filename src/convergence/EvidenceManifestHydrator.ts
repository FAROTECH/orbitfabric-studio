import { sha256Utf8 } from "../integrations/sha256";
import { parseEvidenceSetManifest } from "./consumer-contracts";
import type { EvidenceGateway } from "./EvidenceGateway";
import type { EvidenceManifestObservation, EvidenceSlotRequest } from "./evidenceSlot";

export class EvidenceManifestProtocolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvidenceManifestProtocolError";
  }
}

export class EvidenceManifestHydrator {
  constructor(private readonly gateway: EvidenceGateway) {}

  async hydrate(request: EvidenceSlotRequest): Promise<EvidenceManifestObservation> {
    const read = await this.gateway.readTextFile(request.targetPath);
    let manifest;
    try {
      manifest = parseEvidenceSetManifest(read.text);
    } catch (error) {
      throw new EvidenceManifestProtocolError(
        error instanceof Error ? error.message : "Evidence Set manifest is not usable.",
      );
    }

    return {
      membership: request.membership,
      targetPath: request.targetPath,
      manifestSha256: await sha256Utf8(read.text),
      manifest,
    };
  }
}
