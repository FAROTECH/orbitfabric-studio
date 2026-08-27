import type {
  IntegrationPluginContext,
  IntegrationPluginDefinition,
  IntegrationTargetInspectionInput,
  IntegrationTargetInspectionModel,
  IntegrationTargetInspectorContribution,
} from "./plugin-api";

export type IntegrationTargetInspectorMatch = {
  pluginId: string;
  pluginVersion: string;
  pluginDisplayName: string;
  contributionId: string;
  model: IntegrationTargetInspectionModel;
};

export type IntegrationPluginContributionFailure = {
  pluginId: string;
  contributionId: string;
  phase: "matches" | "inspect";
  message: string;
};

export type IntegrationTargetInspectorDispatch = {
  matches: IntegrationTargetInspectorMatch[];
  failures: IntegrationPluginContributionFailure[];
};

type RegisteredContribution = {
  definition: IntegrationPluginDefinition;
  contribution: IntegrationTargetInspectorContribution;
};

export class IntegrationPluginRegistry {
  private readonly definitions = new Map<string, IntegrationPluginDefinition>();

  register(definition: IntegrationPluginDefinition): void {
    validateDefinition(definition);
    if (this.definitions.has(definition.plugin.id)) {
      throw new Error(`Integration Plugin ${definition.plugin.id} is already registered.`);
    }
    this.definitions.set(definition.plugin.id, definition);
  }

  unregister(pluginId: string): void {
    this.definitions.delete(pluginId);
  }

  clear(): void {
    this.definitions.clear();
  }

  list(): IntegrationPluginDefinition[] {
    return [...this.definitions.values()].sort((a, b) =>
      a.plugin.id.localeCompare(b.plugin.id),
    );
  }

  compatibleWith(integrationId: string): IntegrationPluginDefinition[] {
    return this.list().filter((definition) =>
      definition.compatibility.integrationIds.includes(integrationId),
    );
  }

  inspectTarget(
    input: IntegrationTargetInspectionInput,
    context: IntegrationPluginContext,
  ): IntegrationTargetInspectorDispatch {
    const matches: IntegrationTargetInspectorMatch[] = [];
    const failures: IntegrationPluginContributionFailure[] = [];

    for (const entry of this.targetInspectorContributions(context.integration.package.integrationId)) {
      let accepted = false;
      try {
        accepted = entry.contribution.matches(input);
      } catch (error) {
        failures.push(failure(entry, "matches", error));
        continue;
      }
      if (!accepted) {
        continue;
      }

      try {
        const model = entry.contribution.inspect(input, context);
        validateInspectionModel(model);
        matches.push({
          pluginId: entry.definition.plugin.id,
          pluginVersion: entry.definition.plugin.version,
          pluginDisplayName: entry.definition.plugin.displayName,
          contributionId: entry.contribution.id,
          model,
        });
      } catch (error) {
        failures.push(failure(entry, "inspect", error));
      }
    }

    return { matches, failures };
  }

  private targetInspectorContributions(integrationId: string): RegisteredContribution[] {
    const entries: RegisteredContribution[] = [];
    for (const definition of this.compatibleWith(integrationId)) {
      for (const contribution of definition.contributions.targetInspectors) {
        entries.push({ definition, contribution });
      }
    }
    return entries.sort((a, b) => {
      const pluginOrder = a.definition.plugin.id.localeCompare(b.definition.plugin.id);
      return pluginOrder !== 0
        ? pluginOrder
        : a.contribution.id.localeCompare(b.contribution.id);
    });
  }
}

function validateDefinition(definition: IntegrationPluginDefinition): void {
  if (definition.apiVersion !== "0.1-candidate") {
    throw new Error(`Unsupported Integration Plugin API version: ${definition.apiVersion}.`);
  }
  nonEmpty(definition.plugin.id, "plugin.id");
  nonEmpty(definition.plugin.version, "plugin.version");
  nonEmpty(definition.plugin.displayName, "plugin.displayName");
  if (definition.compatibility.integrationIds.length === 0) {
    throw new Error("Integration Plugin must declare at least one compatible integration.id.");
  }
  const integrationIds = new Set<string>();
  for (const integrationId of definition.compatibility.integrationIds) {
    nonEmpty(integrationId, "compatibility.integrationIds[]");
    if (integrationIds.has(integrationId)) {
      throw new Error(`Duplicate compatible integration.id: ${integrationId}.`);
    }
    integrationIds.add(integrationId);
  }

  const contributionIds = new Set<string>();
  for (const contribution of definition.contributions.targetInspectors) {
    nonEmpty(contribution.id, "targetInspector.id");
    if (contributionIds.has(contribution.id)) {
      throw new Error(`Duplicate target inspector contribution id: ${contribution.id}.`);
    }
    contributionIds.add(contribution.id);
  }
}

function validateInspectionModel(model: IntegrationTargetInspectionModel): void {
  nonEmpty(model.title, "inspection.title");
  if (!Array.isArray(model.sections)) {
    throw new Error("Target inspection sections must be an array.");
  }
  const sectionIds = new Set<string>();
  for (const section of model.sections) {
    nonEmpty(section.id, "inspection.section.id");
    if (sectionIds.has(section.id)) {
      throw new Error(`Duplicate target inspection section id: ${section.id}.`);
    }
    sectionIds.add(section.id);
    if (!Array.isArray(section.rows)) {
      throw new Error(`Target inspection section ${section.id} rows must be an array.`);
    }
    for (const row of section.rows) {
      nonEmpty(row.label, "inspection.row.label");
      if (typeof row.value !== "string") {
        throw new Error("Target inspection row value must be a string.");
      }
    }
  }
}

function failure(
  entry: RegisteredContribution,
  phase: IntegrationPluginContributionFailure["phase"],
  error: unknown,
): IntegrationPluginContributionFailure {
  return {
    pluginId: entry.definition.plugin.id,
    contributionId: entry.contribution.id,
    phase,
    message: error instanceof Error ? error.message : String(error),
  };
}

function nonEmpty(value: string, label: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
}
