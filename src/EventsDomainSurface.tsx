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

export function EventsDomainSurface({
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
      definition={eventsDomainDefinition}
      workspace={workspace}
      modelSummary={modelSummary}
      entityIndex={entityIndex}
      selectedEntity={selectedEntity}
      onSelectEntity={onSelectEntity}
      onOpenFile={onOpenFile}
      description="Read-only Events domain surface backed by structural workspace inspection and Core-reported entity records."
      boundary="This surface shows event contract records only as reported by Core. It does not represent runtime event handling."
      emptySelectionDetail="Select a Core-reported event entity to inspect its read-only detail."
    />
  );
}
