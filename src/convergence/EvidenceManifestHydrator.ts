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

    const manifestSha256 = await sha256Utf8(read.text);
    const references = [];
    for (const record of manifest.records) {
      try {
        const source = this.gateway.readRetainedReference ? await this.gateway.readRetainedReference({
          parentPath: read.path, parentSha256: manifestSha256,
          relativePath: record.content.reference.path, expectedSha256: record.content.reference.sha256,
        }) : { status: "unavailable" as const, path: null, sha256: null, text: null, reason: "Bounded byte-reference reader is unavailable." };
        references.push({ recordId: record.id, ...source });
      } catch (error) {
        references.push({ recordId: record.id, status: "failure" as const, path: null, sha256: null, text: null, reason: error instanceof Error ? error.message : String(error) });
      }
    }

    return {
      membership: request.membership,
      targetPath: request.targetPath,
      manifestSha256,
      manifest,
      references,
    };
  }
}
