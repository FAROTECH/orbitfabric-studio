import { createCoreDomainSurface } from "./CoreDomainSurface";
import type { DomainSurfaceDefinition } from "./domainSurfaceModel";

const modesDomainDefinition: DomainSurfaceDefinition = {
  id: "modes",
  label: "Modes",
  coreDomainId: "modes",
  expectedSourceFile: "modes.yaml",
  lifecycleStatus: "implementable",
  dataSources: ["workspace-inspection", "core-model-summary", "core-entity-index"],
};

export const ModesDomainSurface = createCoreDomainSurface({
  definition: modesDomainDefinition,
  description: "Read-only Modes domain surface backed by structural workspace inspection and Core-reported entity records.",
  boundary: "This surface does not parse modes YAML semantically, does not infer autonomous transitions, and does not represent runtime spacecraft mode state.",
  emptySelectionDetail: "Select a Core-reported mode entity to inspect its read-only detail.",
});
