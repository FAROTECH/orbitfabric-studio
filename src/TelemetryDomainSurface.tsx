import { createCoreDomainSurface } from "./CoreDomainSurface";
import type { DomainSurfaceDefinition } from "./domainSurfaceModel";

const telemetryDomainDefinition: DomainSurfaceDefinition = {
  id: "telemetry",
  label: "Telemetry",
  coreDomainId: "telemetry",
  expectedSourceFile: "telemetry.yaml",
  lifecycleStatus: "implementable",
  dataSources: [
    "workspace-inspection",
    "core-model-summary",
    "core-entity-index",
    "generated-artifact-inventory",
  ],
};

export const TelemetryDomainSurface = createCoreDomainSurface({
  definition: telemetryDomainDefinition,
  description: "Read-only Telemetry domain surface backed by structural workspace inspection and Core-reported entity records.",
  boundary: "This surface does not parse telemetry YAML semantically, does not render live telemetry, and does not implement telemetry archive or decoder runtime behavior.",
  emptySelectionDetail: "Select a Core-reported telemetry entity to inspect its read-only detail.",
});
