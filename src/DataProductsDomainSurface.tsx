import { createCoreDomainSurface } from "./CoreDomainSurface";
import type { DomainSurfaceDefinition } from "./domainSurfaceModel";

const dataProductsDomainDefinition: DomainSurfaceDefinition = {
  id: "data-products",
  label: "Data Products",
  coreDomainId: "data_products",
  expectedSourceFile: "data_products.yaml",
  lifecycleStatus: "conservative",
  dataSources: [
    "workspace-inspection",
    "core-model-summary",
    "core-entity-index",
    "core-coverage-summary",
    "generated-artifact-inventory",
  ],
};

export const DataProductsDomainSurface = createCoreDomainSurface({
  definition: dataProductsDomainDefinition,
  description: "Read-only Data Products domain surface backed by structural workspace inspection and Core-reported entity records.",
  boundary: "This surface shows data-product contract records only as reported by Core. It does not infer storage completion or downlink completion.",
  emptySelectionDetail: "Select a Core-reported data-product entity to inspect its read-only detail.",
});
