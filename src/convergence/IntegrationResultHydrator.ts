import type { IntegrationGateway } from "../integrations/IntegrationGateway";
import type { IntegrationIntegrityIssue } from "../integrations/contracts";
import { parseIntegrationResult, validateIntegrationResult } from "../integrations/result";
import { sha256Utf8 } from "../integrations/sha256";
import type {
  IntegrationContextRequest,
  IntegrationResultObservation,
} from "./integrationSlot";

export class IntegrationResultProtocolError extends Error {
  constructor(readonly issues: IntegrationIntegrityIssue[]) {
    super(issues.map((issue) => issue.message).join("\n") || "Integration Result is not usable.");
    this.name = "IntegrationResultProtocolError";
  }
}

export class IntegrationResultConsistencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IntegrationResultConsistencyError";
  }
}

export class IntegrationResultHydrator {
  constructor(private readonly gateway: IntegrationGateway) {}

  async hydrate(request: IntegrationContextRequest): Promise<IntegrationResultObservation> {
    const bundle = await this.gateway.readResultBundle(request.resultPath);
    const resultSha256 = await sha256Utf8(bundle.resultText);
    const result = parseIntegrationResult(bundle.resultText);
    const validation = validateIntegrationResult(result, bundle);

    if (!validation.usable) {
      throw new IntegrationResultProtocolError(validation.issues);
    }

    assertContextMatches(request, result.integration.id, result.adapter.id, result.adapter.version, result.operation.id);

    return {
      membership: request.membership,
      context: request.context,
      resultPath: bundle.resultPath,
      resultSha256,
      result,
      bundle,
    };
  }
}

function assertContextMatches(
  request: IntegrationContextRequest,
  integrationId: string,
  adapterId: string,
  adapterVersion: string,
  operationId: string,
): void {
  const expected = request.context;
  if (
    integrationId !== expected.integrationId ||
    adapterId !== expected.adapterId ||
    adapterVersion !== expected.adapterVersion ||
    operationId !== expected.operationId
  ) {
    throw new IntegrationResultConsistencyError(
      `Integration Result identifies ${integrationId}/${adapterId}@${adapterVersion}/${operationId}, expected ${expected.integrationId}/${expected.adapterId}@${expected.adapterVersion}/${expected.operationId}.`,
    );
  }
}
