import type {
  IntegrationAdapterInvocation,
  IntegrationAdapterRunRequest,
  IntegrationBundleRead,
  IntegrationExecutionAssessment,
  IntegrationExecutionAuthorization,
  IntegrationPackageDescriptor,
  IntegrationResult,
} from "./contracts";
import type { IntegrationGateway } from "./IntegrationGateway";
import { parseIntegrationResult, validateIntegrationResult } from "./result";

const ADAPTER_CLI_V0 = "orbitfabric.adapter_cli.v0";

function arraysEqual(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

export function createExecutionAuthorization(
  descriptor: IntegrationPackageDescriptor,
): IntegrationExecutionAuthorization {
  return {
    integrationId: descriptor.integrationId,
    adapterId: descriptor.adapterId,
    adapterVersion: descriptor.adapterVersion,
    argvPrefix: [...descriptor.execution.argvPrefix],
  };
}

export function validateExecutionAuthorization(
  descriptor: IntegrationPackageDescriptor,
  authorization: IntegrationExecutionAuthorization,
): string[] {
  const errors: string[] = [];
  if (authorization.integrationId !== descriptor.integrationId) {
    errors.push("Execution authorization integration identity does not match the package.");
  }
  if (authorization.adapterId !== descriptor.adapterId) {
    errors.push("Execution authorization adapter identity does not match the package.");
  }
  if (authorization.adapterVersion !== descriptor.adapterVersion) {
    errors.push("Execution authorization adapter version does not match the package.");
  }
  if (!arraysEqual(authorization.argvPrefix, descriptor.execution.argvPrefix)) {
    errors.push("Execution authorization argv prefix does not exactly match the package declaration.");
  }
  return errors;
}

export function validateAdapterRunPreflight(
  descriptor: IntegrationPackageDescriptor,
  authorization: IntegrationExecutionAuthorization,
  request: IntegrationAdapterRunRequest,
): string[] {
  const errors = validateExecutionAuthorization(descriptor, authorization);
  if (descriptor.execution.protocol !== ADAPTER_CLI_V0) {
    errors.push(`Unsupported integration execution protocol: ${descriptor.execution.protocol}.`);
  }
  if (descriptor.execution.argvPrefix.length === 0) {
    errors.push("Integration Package argv prefix is empty.");
  }
  const operationMatches = descriptor.operations.filter((item) => item.id === request.operation);
  if (operationMatches.length !== 1) {
    errors.push(
      `Requested integration operation must match exactly one advertised operation; found ${operationMatches.length}.`,
    );
  }
  if (!request.inputSetManifestPath) {
    errors.push("Core Integration Input Set manifest path is empty.");
  }
  if (!request.profilePath) {
    errors.push("Projection Profile path is empty.");
  }
  if (!request.outputDir) {
    errors.push("Integration output directory is empty.");
  }
  return errors;
}

function resultIdentityIssues(
  descriptor: IntegrationPackageDescriptor,
  request: IntegrationAdapterRunRequest,
  result: IntegrationResult,
): { code: string; message: string }[] {
  const issues: { code: string; message: string }[] = [];
  if (result.integration.id !== descriptor.integrationId) {
    issues.push({
      code: "protocol.integration_identity",
      message: `Result integration ${result.integration.id} does not match package ${descriptor.integrationId}.`,
    });
  }
  if (result.adapter.id !== descriptor.adapterId) {
    issues.push({
      code: "protocol.adapter_identity",
      message: `Result adapter ${result.adapter.id} does not match package ${descriptor.adapterId}.`,
    });
  }
  if (result.adapter.version !== descriptor.adapterVersion) {
    issues.push({
      code: "protocol.adapter_version",
      message: `Result adapter version ${result.adapter.version} does not match executed package ${descriptor.adapterVersion}.`,
    });
  }
  if (result.operation.id !== request.operation) {
    issues.push({
      code: "protocol.operation_identity",
      message: `Result operation ${result.operation.id} does not match requested operation ${request.operation}.`,
    });
  }
  if (!descriptor.resultCompatibility.resultVersions.includes(result.resultVersion)) {
    issues.push({
      code: "protocol.result_version",
      message: `Result version ${result.resultVersion} is not declared as supported by the package.`,
    });
  }
  if (result.resultVersion !== descriptor.resultCompatibility.defaultResultVersion) {
    issues.push({
      code: "protocol.default_result_version",
      message: `Adapter emitted Result version ${result.resultVersion} instead of declared v0 default ${descriptor.resultCompatibility.defaultResultVersion}.`,
    });
  }
  return issues;
}

export function assessAdapterInvocation(
  descriptor: IntegrationPackageDescriptor,
  request: IntegrationAdapterRunRequest,
  invocation: IntegrationAdapterInvocation,
  bundle: IntegrationBundleRead | null,
): IntegrationExecutionAssessment {
  const issues: { code: string; message: string }[] = [];

  if (invocation.operation !== request.operation) {
    issues.push({
      code: "transport.operation_identity",
      message: "Adapter transport result does not preserve the requested operation identity.",
    });
  }
  if (invocation.timedOut || !invocation.processCompleted) {
    issues.push({
      code: "transport.incomplete",
      message: "Integration adapter process did not complete normally.",
    });
  }
  if (invocation.exitCode === null) {
    issues.push({
      code: "transport.no_exit_status",
      message: "Integration adapter process did not provide a normal exit status.",
    });
  }

  let result: IntegrationResult | null = null;
  if (invocation.resultText !== null) {
    try {
      result = parseIntegrationResult(invocation.resultText);
      const validation = validateIntegrationResult(result, bundle ?? undefined);
      for (const issue of validation.issues) {
        issues.push({ code: `result.${issue.code}`, message: issue.message });
      }
      issues.push(...resultIdentityIssues(descriptor, request, result));
    } catch (error) {
      issues.push({
        code: "protocol.result_parse",
        message: `Integration Result cannot be parsed: ${String(error)}`,
      });
    }
  }

  const exitCode = invocation.exitCode;
  if (exitCode === 0) {
    if (!result) {
      issues.push({
        code: "protocol.zero_without_result",
        message: "Adapter exited with code 0 without a valid Integration Result.",
      });
    } else if (!["succeeded", "succeeded_with_warnings"].includes(result.result)) {
      issues.push({
        code: "protocol.zero_failed_result",
        message: `Adapter exited with code 0 but Result state is ${result.result}.`,
      });
    }
  } else if (exitCode !== null) {
    if (result && result.result !== "failed") {
      issues.push({
        code: "protocol.nonzero_success_result",
        message: `Adapter exited with non-zero status but Result state is ${result.result}.`,
      });
    }
  }

  return { valid: issues.length === 0, issues, result };
}

export async function executeIntegrationAdapter(
  gateway: IntegrationGateway,
  descriptor: IntegrationPackageDescriptor,
  authorization: IntegrationExecutionAuthorization,
  request: IntegrationAdapterRunRequest,
): Promise<{ invocation: IntegrationAdapterInvocation; assessment: IntegrationExecutionAssessment }> {
  const preflight = validateAdapterRunPreflight(descriptor, authorization, request);
  if (preflight.length > 0) {
    throw new Error(preflight.join("\n"));
  }

  const invocation = await gateway.runAdapter(authorization, request);
  let bundle: IntegrationBundleRead | null = null;
  let bundleError: string | null = null;
  if (invocation.resultText !== null) {
    try {
      bundle = await gateway.readResultBundle(invocation.resultPath);
    } catch (error) {
      bundleError = String(error);
    }
  }

  const assessment = assessAdapterInvocation(descriptor, request, invocation, bundle);
  if (bundleError !== null) {
    assessment.issues.push({
      code: "result.bundle_read",
      message: `Integration Result bundle could not be verified: ${bundleError}`,
    });
    assessment.valid = false;
  }

  return { invocation, assessment };
}
