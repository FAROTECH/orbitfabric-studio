import { createCoreDomainSurface } from "./CoreDomainSurface";
import type { DomainSurfaceDefinition } from "./domainSurfaceModel";

const packetsDomainDefinition: DomainSurfaceDefinition = {
  id: "packets",
  label: "Packets",
  coreDomainId: "packets",
  expectedSourceFile: "packets.yaml",
  lifecycleStatus: "implementable",
  dataSources: [
    "workspace-inspection",
    "core-model-summary",
    "core-entity-index",
    "generated-artifact-inventory",
  ],
};

export const PacketsDomainSurface = createCoreDomainSurface({
  definition: packetsDomainDefinition,
  description: "Read-only Packets domain surface backed by structural workspace inspection and Core-reported entity records.",
  boundary: "This surface shows packet contract records only as reported by Core. It does not perform protocol execution or live decoding.",
  emptySelectionDetail: "Select a Core-reported packet entity to inspect its read-only detail.",
});
