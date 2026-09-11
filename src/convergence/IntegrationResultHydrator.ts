import type { IntegrationGateway } from "../integrations/IntegrationGateway";
import type { IntegrationIntegrityIssue } from "../integrations/contracts";
import { parseIntegrationResult, validateIntegrationResult } from "../integrations/result";
import { sha256Utf8 } from "../integrations/sha256";
import type {
  IntegrationContextRequest,
  IntegrationResultObservation,
} from "./integrationSlot";
import {
  parseAndValidateScenarioAccounting,
  SCENARIO_ACCOUNTING_KIND,
  UnsupportedAccountingVersion,
} from "./scenarioProjectionAccounting";
import type { ScenarioProjectionAccountingObservation } from "./scenarioProjectionAccounting";

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
    if (request.expectedResultSha256 !== undefined && request.expectedResultSha256 !== resultSha256) {
      throw new IntegrationResultConsistencyError("Selected Result bytes changed before hydration completed.");
    }
    const result = parseIntegrationResult(bundle.resultText);
    const validation = validateIntegrationResult(result, bundle);

    if (!validation.usable) {
      throw new IntegrationResultProtocolError(validation.issues);
    }

    assertContextMatches(request, result.integration.id, result.adapter.id, result.adapter.version, result.operation.id);

    const accountingArtifacts = result.artifacts.filter((artifact) => artifact.kind === SCENARIO_ACCOUNTING_KIND);
    let scenarioAccounting: ScenarioProjectionAccountingObservation | null = null;
    let accountingIssue: IntegrationResultObservation["accountingIssue"] = null;
    let accountingReference: IntegrationResultObservation["accountingReference"] = null;
    if (accountingArtifacts.length > 1) {
      accountingIssue = { state: "failure", reason: "Result-owned accounting artifact selection is ambiguous." };
    }
    if (accountingArtifacts.length === 1) {
      const artifact = accountingArtifacts[0];
      try {
        if (!artifact.path || !artifact.sha256 || !this.gateway.readRetainedReference) {
          accountingIssue = { state: "unavailable", reason: "Bounded accounting byte reader or artifact reference is unavailable." };
        } else {
          const source = await this.gateway.readRetainedReference({ parentPath: bundle.resultPath, parentSha256: resultSha256, relativePath: artifact.path, expectedSha256: artifact.sha256 });
          accountingReference = source;
          if (source.status !== "verified") {
            accountingIssue = { state: source.status, reason: source.reason ?? "Accounting reference bytes are unavailable." };
          } else if (source.text === null) {
            accountingIssue = { state: "unsupported", reason: "Accounting reference is digest-verified but UTF-8 interpretation is unavailable." };
          } else {
            if (source.path === null) throw new Error("Accounting reference has no verified source path.");
            scenarioAccounting = await parseAndValidateScenarioAccounting(source.text, artifact, result, source.path, resultSha256);
          }
        }
      } catch (error) {
        accountingIssue = { state: error instanceof UnsupportedAccountingVersion ? "unsupported" : "failure", reason: error instanceof Error ? error.message : String(error) };
      }
    }

    return {
      membership: request.membership,
      context: request.context,
      resultPath: bundle.resultPath,
      resultSha256,
      result,
      bundle,
      scenarioAccounting,
      accountingIssue,
      accountingReference,
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
