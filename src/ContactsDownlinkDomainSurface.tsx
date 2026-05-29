import { createCoreDomainSurface } from "./CoreDomainSurface";
import type { DomainSurfaceDefinition } from "./domainSurfaceModel";

const contactsDownlinkDomainDefinition: DomainSurfaceDefinition = {
  id: "contacts-downlink",
  label: "Contacts & Downlink",
  coreDomainId: "contacts",
  coreDomainIds: [
    "contacts",
    "contact_profiles",
    "link_profiles",
    "contact_windows",
    "downlink_flows",
  ],
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
  description:
    "Read-only conservative Contacts & Downlink surface backed by structural workspace inspection and Core-reported contact, link, window and downlink records when those domains are present.",
  boundary:
    "This surface aggregates only Core-reported contact/downlink domains. It does not schedule contacts, perform ground operations or infer link availability.",
  emptySelectionDetail:
    "Select a Core-reported contact, link, contact-window or downlink-flow entity to inspect its read-only detail. If Core has not reported those domains, the surface remains conservative.",
});
