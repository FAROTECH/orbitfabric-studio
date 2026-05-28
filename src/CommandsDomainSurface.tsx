import { createCoreDomainSurface } from "./CoreDomainSurface";
import type { DomainSurfaceDefinition } from "./domainSurfaceModel";

const commandsDomainDefinition: DomainSurfaceDefinition = {
  id: "commands",
  label: "Commands",
  coreDomainId: "commands",
  expectedSourceFile: "commands.yaml",
  lifecycleStatus: "implementable",
  dataSources: [
    "workspace-inspection",
    "core-model-summary",
    "core-entity-index",
    "generated-artifact-inventory",
  ],
};

export const CommandsDomainSurface = createCoreDomainSurface({
  definition: commandsDomainDefinition,
  description: "Read-only Commands domain surface backed by structural workspace inspection and Core-reported entity records.",
  boundary: "This surface shows command contract records only as reported by Core. It does not implement operational command behavior.",
  emptySelectionDetail: "Select a Core-reported command entity to inspect its read-only detail.",
});
