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
    "Reserved Autonomy domain surface for v0.13.0. Related Core-reported records may appear in conservative commandability or Workbench evidence surfaces, but Autonomy is not promoted to an implemented Studio domain in this release.",
  boundary:
    "Autonomy is reserved. This surface does not parse autonomy contracts, infer autonomous behavior, represent runtime mode logic or implement onboard autonomy behavior.",
  emptySelectionDetail:
    "Autonomy is reserved in v0.13.0. No dedicated Core-reported autonomy domain surface is exposed here.",
});
