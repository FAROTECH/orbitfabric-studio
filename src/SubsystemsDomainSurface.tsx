import { createCoreDomainSurface } from "./CoreDomainSurface";
import type { DomainSurfaceDefinition } from "./domainSurfaceModel";

const subsystemsDomainDefinition: DomainSurfaceDefinition = {
  id: "subsystems",
  label: "Subsystems",
  coreDomainId: "subsystems",
  expectedSourceFile: "subsystems.yaml",
  lifecycleStatus: "implementable",
  dataSources: ["workspace-inspection", "core-model-summary", "core-entity-index"],
};

export const SubsystemsDomainSurface = createCoreDomainSurface({
  definition: subsystemsDomainDefinition,
  description: "Read-only Subsystems domain surface backed by structural workspace inspection and Core-reported entity records.",
  boundary: "This surface does not parse subsystem YAML semantically, does not compute subsystem health, and does not infer runtime subsystem state or dependencies.",
  emptySelectionDetail: "Select a Core-reported subsystem entity to inspect its read-only detail.",
});
