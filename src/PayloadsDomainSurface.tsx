import { createCoreDomainSurface } from "./CoreDomainSurface";
import type { DomainSurfaceDefinition } from "./domainSurfaceModel";

const payloadsDomainDefinition: DomainSurfaceDefinition = {
  id: "payloads",
  label: "Payloads",
  coreDomainId: "payloads",
  expectedSourceFile: "payloads.yaml",
  lifecycleStatus: "implementable",
  dataSources: ["workspace-inspection", "core-model-summary", "core-entity-index"],
};

export const PayloadsDomainSurface = createCoreDomainSurface({
  definition: payloadsDomainDefinition,
  description: "Read-only Payloads domain surface backed by structural workspace inspection and Core-reported entity records.",
  boundary: "This surface shows payload contract records only as reported by Core. It does not represent payload runtime behavior or acquisition state.",
  emptySelectionDetail: "Select a Core-reported payload entity to inspect its read-only detail.",
});
