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

const commandsDomainDefinition: DomainSurfaceDefinition = {
  id: "commands",
  label: "Commands",
  coreDomainId: "commands",
  expectedSourceFile: "commands.yaml",
  lifecycleStatus: "implementable",
  dataSources: [
    "workspace-inspection",
    "core-model-summary",
    "core-entity-index",
    "generated-artifact-inventory",
  ],
};

export function CommandsDomainSurface({
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
      definition={commandsDomainDefinition}
      workspace={workspace}
      modelSummary={modelSummary}
      entityIndex={entityIndex}
      selectedEntity={selectedEntity}
      onSelectEntity={onSelectEntity}
      onOpenFile={onOpenFile}
      description="Read-only Commands domain surface backed by structural workspace inspection and Core-reported entity records."
      boundary="This surface shows command contract records only as reported by Core. It does not implement operational command behavior."
      emptySelectionDetail="Select a Core-reported command entity to inspect its read-only detail."
    />
  );
}
