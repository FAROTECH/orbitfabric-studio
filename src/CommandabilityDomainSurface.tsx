import { createCoreDomainSurface } from "./CoreDomainSurface";
import type { DomainSurfaceDefinition } from "./domainSurfaceModel";

const commandabilityDomainDefinition: DomainSurfaceDefinition = {
  id: "commandability",
  label: "Commandability",
  coreDomainId: "commandability",
  expectedSourceFile: "commandability.yaml",
  lifecycleStatus: "conservative",
  dataSources: ["workspace-inspection", "core-model-summary", "core-entity-index"],
};

export const CommandabilityDomainSurface = createCoreDomainSurface({
  definition: commandabilityDomainDefinition,
  description: "Read-only Commandability domain surface backed by structural workspace inspection and Core-reported entity records.",
  boundary: "This surface shows commandability contract records only as reported by Core. It does not authorize, schedule or execute operational commands.",
  emptySelectionDetail: "Select a Core-reported commandability entity to inspect its read-only detail.",
});
