import { createCoreDomainSurface } from "./CoreDomainSurface";
import type { DomainSurfaceDefinition } from "./domainSurfaceModel";

const contactsDownlinkDomainDefinition: DomainSurfaceDefinition = {
  id: "contacts-downlink",
  label: "Contacts & Downlink",
  coreDomainId: "contacts",
  expectedSourceFile: "contacts.yaml",
  lifecycleStatus: "conservative",
  dataSources: [
    "workspace-inspection",
    "core-model-summary",
    "core-entity-index",
    "core-simulation-report",
    "generated-artifact-inventory",
  ],
};

export const ContactsDownlinkDomainSurface = createCoreDomainSurface({
  definition: contactsDownlinkDomainDefinition,
  description: "Read-only Contacts & Downlink domain surface backed by structural workspace inspection and Core-reported entity records.",
  boundary: "This surface shows contact contract records only as reported by Core. It does not perform ground operations or scheduling behavior.",
  emptySelectionDetail: "Select a Core-reported contact entity to inspect its read-only detail.",
});
