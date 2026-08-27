import type {
  CoreIntegrationInputSet,
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

  return {
    state: "fresh",
    reason: "Result matches the exact current Core Input Set and Projection Profile bytes.",
  };
}
