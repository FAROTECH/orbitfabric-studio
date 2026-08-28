import type {
  IntegrationInspectorAction,
  IntegrationPluginContext,
  IntegrationTargetInspectionInput,
} from "./plugin-api";

export async function executeIntegrationInspectorAction(
  action: IntegrationInspectorAction,
  input: IntegrationTargetInspectionInput,
  context: IntegrationPluginContext,
): Promise<void> {
  switch (action.request.kind) {
    case "open_core_entity": {
      const ref = action.request.ref;
      const allowed = input.mapping.sources.some(
        (source) => source.domain === ref.domain && source.id === ref.id,
      );
      if (!allowed) {
        throw new Error(
          `Integration Plugin action cannot open Core entity ${ref.domain}/${ref.id}: it is not a source of the inspected mapping.`,
        );
      }
      await context.actions.openCoreEntity(ref);
      return;
    }
    case "reveal_result_artifact": {
      const result = context.integration.result;
      if (!result) {
        throw new Error("Integration Plugin action cannot reveal an artifact without an Integration Result.");
      }
      const artifactId = action.request.artifactId;
      const artifact = result.artifacts.find((item) => item.id === artifactId);
      if (!artifact) {
        throw new Error(
          `Integration Plugin action references unknown Result artifact ${artifactId}.`,
        );
      }
      if (!artifact.derivedFromMappings.includes(input.mapping.id)) {
        throw new Error(
          `Integration Plugin action cannot reveal artifact ${artifact.id}: it is not linked to mapping ${input.mapping.id}.`,
        );
      }
      await context.actions.revealResultArtifact(artifact.id);
      return;
    }
  }
}
