import type {
  IntegrationCoreRef,
  IntegrationMapping,
  IntegrationResult,
  IntegrationTargetRef,
} from "./contracts";

export type IntegrationPluginApiVersion = "0.1-candidate";

export type IntegrationPluginDefinition = {
  apiVersion: IntegrationPluginApiVersion;
  plugin: {
    id: string;
    version: string;
    displayName: string;
  };
  compatibility: {
    integrationIds: string[];
  };
  contributions: {
    targetInspectors: IntegrationTargetInspectorContribution[];
  };
};

export type IntegrationPluginIntegrationContext = {
  readonly id: string;
  readonly result: IntegrationResult | null;
};

export type IntegrationPluginActions = {
  openCoreEntity(ref: IntegrationCoreRef): Promise<void>;
  revealResultArtifact(artifactId: string): Promise<void>;
};

export type IntegrationPluginContext = {
  readonly integration: IntegrationPluginIntegrationContext;
  readonly actions: IntegrationPluginActions;
};

export type IntegrationTargetInspectionInput = {
  readonly mapping: IntegrationMapping;
  readonly target: IntegrationTargetRef;
};

export type IntegrationTargetInspectorContribution = {
  id: string;
  matches(input: IntegrationTargetInspectionInput): boolean;
  inspect(
    input: IntegrationTargetInspectionInput,
    context: IntegrationPluginContext,
  ): IntegrationTargetInspectionModel;
};

export type IntegrationInspectorRow = {
  label: string;
  value: string;
  emphasis?: "normal" | "strong" | "muted";
  monospace?: boolean;
};

export type IntegrationInspectorSection = {
  id: string;
  title?: string;
  rows: IntegrationInspectorRow[];
};

export type IntegrationInspectorBadge = {
  label: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
};

export type IntegrationInspectorAction =
  | {
      id: string;
      label: string;
      request: {
        kind: "open_core_entity";
        ref: IntegrationCoreRef;
      };
    }
  | {
      id: string;
      label: string;
      request: {
        kind: "reveal_result_artifact";
        artifactId: string;
      };
    };

export type IntegrationTargetInspectionModel = {
  title: string;
  subtitle?: string;
  badges?: IntegrationInspectorBadge[];
  sections: IntegrationInspectorSection[];
  actions?: IntegrationInspectorAction[];
};
