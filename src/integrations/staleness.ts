import type {
  CoreIntegrationInputSet,
  IntegrationCurrentOperationInput,
  IntegrationProfileDocument,
  IntegrationProfileFreshnessAssessment,
  IntegrationResult,
} from "./contracts";

function availableSha(value: Record<string, unknown>): string | null {
  if (value.status !== "available") {
    return null;
  }
  return typeof value.sha256 === "string" && value.sha256.length > 0 ? value.sha256 : null;
}

export function assessIntegrationFreshness(
  result: IntegrationResult | null,
  inputSet: CoreIntegrationInputSet | null,
  profile: IntegrationProfileDocument | null,
  currentOperationInputs: IntegrationCurrentOperationInput[] = [],
): IntegrationProfileFreshnessAssessment {
  if (!result) {
    return { state: "unknown", reason: "No Integration Result is available." };
  }
  if (!inputSet?.inputSetSha256) {
    return {
      state: "unknown",
      reason: "Current Core Integration Input Set has no reliable SHA-256 fingerprint.",
    };
  }
  if (!profile) {
    return { state: "unknown", reason: "No current Projection Profile is associated." };
  }

  const resultInputSha = availableSha(result.inputs.coreInputSet);
  const resultProfileSha = availableSha(result.inputs.profile);
  if (!resultInputSha || !resultProfileSha) {
    return {
      state: "unknown",
      reason: "Integration Result does not provide complete Core/Profile provenance.",
    };
  }

  if (resultInputSha.toLowerCase() !== inputSet.inputSetSha256.toLowerCase()) {
    return {
      state: "stale",
      reason: "Core Integration Input Set changed after this Result was produced.",
    };
  }
  if (resultProfileSha.toLowerCase() !== profile.sha256.toLowerCase()) {
    return {
      state: "stale",
      reason: "Projection Profile changed after this Result was produced.",
    };
  }

  if (result.resultVersion === "0.2-candidate") {
    const consumed = result.inputs.operationInputs;
    if (consumed.length === 0 && currentOperationInputs.length > 0) {
      return {
        state: "unknown",
        reason: "Current operation-input bindings exist but the Result contains no consumed operation-input provenance.",
      };
    }

    if (consumed.length > 0) {
      const currentByRole = new Map<string, string>();
      for (const input of currentOperationInputs) {
        if (!input.role || !input.sha256) {
          return {
            state: "unknown",
            reason: "Current operation-input identity is incomplete.",
          };
        }
        if (currentByRole.has(input.role)) {
          return {
            state: "unknown",
            reason: `Current operation-input role ${input.role} is represented more than once.`,
          };
        }
        currentByRole.set(input.role, input.sha256);
      }

      if (currentByRole.size !== consumed.length) {
        return {
          state: "unknown",
          reason: "Current operation-input bindings do not exactly correspond to the Result provenance roles.",
        };
      }

      for (const input of consumed) {
        if (input.status !== "available" || !input.sha256) {
          return {
            state: "unknown",
            reason: `Integration Result does not provide reliable provenance for operation input ${input.role}.`,
          };
        }
        const currentSha = currentByRole.get(input.role);
        if (!currentSha) {
          return {
            state: "unknown",
            reason: `No current operation-input identity is available for role ${input.role}.`,
          };
        }
        if (currentSha.toLowerCase() !== input.sha256.toLowerCase()) {
          return {
            state: "stale",
            reason: `Operation input ${input.role} changed after this Result was produced.`,
          };
        }
      }

      return {
        state: "fresh",
        reason:
          "Result matches the exact current Core Input Set, Projection Profile and operation-specific input bytes.",
      };
    }
  }

  return {
    state: "fresh",
    reason: "Result matches the exact current Core Input Set and Projection Profile bytes.",
  };
}
