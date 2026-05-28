import { createCoreDomainSurface } from "./CoreDomainSurface";
import type { DomainSurfaceDefinition } from "./domainSurfaceModel";

const spacecraftDomainDefinition: DomainSurfaceDefinition = {
  id: "spacecraft",
  label: "Spacecraft",
  coreDomainId: "spacecraft",
  expectedSourceFile: "spacecraft.yaml",
  lifecycleStatus: "implementable",
  dataSources: ["workspace-inspection", "core-model-summary", "core-entity-index"],
};

export const SpacecraftDomainSurface = createCoreDomainSurface({
  definition: spacecraftDomainDefinition,
  description: "Read-only Spacecraft domain surface backed by structural workspace inspection and Core-reported entity records.",
  boundary: "This surface does not parse spacecraft YAML semantically, does not compute readiness or health, and does not infer runtime spacecraft state.",
  emptySelectionDetail: "Select a Core-reported spacecraft entity to inspect its read-only detail.",
});
