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

const faultsDomainDefinition: DomainSurfaceDefinition = {
  id: "faults",
  label: "Faults",
  coreDomainId: "faults",
  expectedSourceFile: "faults.yaml",
  lifecycleStatus: "implementable",
  dataSources: [
    "workspace-inspection",
    "core-model-summary",
    "core-entity-index",
    "generated-artifact-inventory",
  ],
};

export function FaultsDomainSurface({
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
      definition={faultsDomainDefinition}
      workspace={workspace}
      modelSummary={modelSummary}
      entityIndex={entityIndex}
      selectedEntity={selectedEntity}
      onSelectEntity={onSelectEntity}
      onOpenFile={onOpenFile}
      description="Read-only Faults domain surface backed by structural workspace inspection and Core-reported entity records."
      boundary="This surface shows fault contract records only as reported by Core. It does not compute operational status."
      emptySelectionDetail="Select a Core-reported fault entity to inspect its read-only detail."
    />
  );
}
