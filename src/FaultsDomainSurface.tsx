import { createCoreDomainSurface } from "./CoreDomainSurface";
import type { DomainSurfaceDefinition } from "./domainSurfaceModel";

const faultsDomainDefinition: DomainSurfaceDefinition = {
  id: "faults",
  label: "Faults",
  coreDomainId: "faults",
  expectedSourceFile: "faults.yaml",
  lifecycleStatus: "implementable",
  dataSources: [
    "workspace-inspection",
    "core-model-summary",
    "core-entity-index",
    "generated-artifact-inventory",
  ],
};

export const FaultsDomainSurface = createCoreDomainSurface({
  definition: faultsDomainDefinition,
  description: "Read-only Faults domain surface backed by structural workspace inspection and Core-reported entity records.",
  boundary: "This surface shows fault contract records only as reported by Core. It does not compute operational status.",
  emptySelectionDetail: "Select a Core-reported fault entity to inspect its read-only detail.",
});
