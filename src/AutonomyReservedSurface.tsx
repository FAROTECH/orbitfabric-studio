import { createCoreDomainSurface } from "./CoreDomainSurface";
import type { DomainSurfaceDefinition } from "./domainSurfaceModel";

const autonomyReservedDomainDefinition: DomainSurfaceDefinition = {
  id: "autonomy",
  label: "Autonomy",
  coreDomainId: null,
  expectedSourceFile: null,
  lifecycleStatus: "reserved",
  dataSources: ["explicit-unavailable-state"],
};

export const AutonomyReservedSurface = createCoreDomainSurface({
  definition: autonomyReservedDomainDefinition,
  description:
    "Reserved Autonomy domain surface. This domain is intentionally not implemented in v0.11.x.",
  boundary:
    "Autonomy is reserved. This surface does not parse autonomy contracts, does not infer autonomous behavior, does not represent runtime mode logic and does not implement onboard autonomy behavior.",
  emptySelectionDetail:
    "Autonomy is reserved in this release. No Core-reported autonomy entities are exposed.",
});
