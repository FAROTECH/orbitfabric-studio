import { CoreDomainSurface } from "./CoreDomainSurface";
import type {
  DomainEntitySummary,
  DomainSurfaceDefinition,
} from "./domainSurfaceModel";
import type {
  CoreEntityIndex,
  CoreModelSummary,
  ProjectEntry,
  WorkspaceInspection,
} from "./types/workspace";

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

export function ContactsDownlinkDomainSurface({
  workspace,
  modelSummary,
  entityIndex,
  selectedEntity,
  onSelectEntity,
  onOpenFile,
}: {
  workspace: WorkspaceInspection;
  modelSummary: CoreModelSummary | null;
  entityIndex: CoreEntityIndex | null;
  selectedEntity: DomainEntitySummary | null;
  onSelectEntity: (entity: DomainEntitySummary) => void;
  onOpenFile: (entry: ProjectEntry) => void;
}) {
  return (
    <CoreDomainSurface
      definition={contactsDownlinkDomainDefinition}
      workspace={workspace}
      modelSummary={modelSummary}
      entityIndex={entityIndex}
      selectedEntity={selectedEntity}
      onSelectEntity={onSelectEntity}
      onOpenFile={onOpenFile}
      description="Read-only Contacts & Downlink domain surface backed by structural workspace inspection and Core-reported entity records."
      boundary="This surface shows contact contract records only as reported by Core. It does not perform ground operations or scheduling behavior."
      emptySelectionDetail="Select a Core-reported contact entity to inspect its read-only detail."
    />
  );
}
