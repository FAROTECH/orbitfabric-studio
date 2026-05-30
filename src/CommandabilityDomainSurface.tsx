import { createCoreDomainSurface } from "./CoreDomainSurface";
import type { DomainSurfaceDefinition } from "./domainSurfaceModel";

const commandabilityDomainDefinition: DomainSurfaceDefinition = {
  id: "commandability",
  label: "Commandability",
  coreDomainId: "commandability",
  coreDomainIds: [
    "commandability",
    "command_sources",
    "commandability_rules",
    "autonomous_actions",
    "recovery_intents",
  ],
  expectedSourceFile: "commandability.yaml",
  lifecycleStatus: "conservative",
  dataSources: ["workspace-inspection", "core-model-summary", "core-entity-index"],
};

export const CommandabilityDomainSurface = createCoreDomainSurface({
  definition: commandabilityDomainDefinition,
  description:
    "Read-only conservative Commandability surface backed by structural workspace inspection and Core-reported command source, rule, autonomous-action and recovery-intent records when present.",
  boundary:
    "This surface aggregates only Core-reported commandability-related domains. It does not authorize, schedule or execute operational commands.",
  emptySelectionDetail:
    "Select a Core-reported commandability, command-source, rule, autonomous-action or recovery-intent entity to inspect its read-only detail. If Core has not reported those domains, the surface remains conservative.",
});
