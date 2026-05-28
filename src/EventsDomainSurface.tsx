import { createCoreDomainSurface } from "./CoreDomainSurface";
import type { DomainSurfaceDefinition } from "./domainSurfaceModel";

const eventsDomainDefinition: DomainSurfaceDefinition = {
  id: "events",
  label: "Events",
  coreDomainId: "events",
  expectedSourceFile: "events.yaml",
  lifecycleStatus: "implementable",
  dataSources: [
    "workspace-inspection",
    "core-model-summary",
    "core-entity-index",
    "generated-artifact-inventory",
  ],
};

export const EventsDomainSurface = createCoreDomainSurface({
  definition: eventsDomainDefinition,
  description: "Read-only Events domain surface backed by structural workspace inspection and Core-reported entity records.",
  boundary: "This surface shows event contract records only as reported by Core. It does not represent runtime event handling.",
  emptySelectionDetail: "Select a Core-reported event entity to inspect its read-only detail.",
});
