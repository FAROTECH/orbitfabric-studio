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

const commandabilityDomainDefinition: DomainSurfaceDefinition = {
  id: "commandability",
  label: "Commandability",
  coreDomainId: "commandability",
  expectedSourceFile: "commandability.yaml",
  lifecycleStatus: "conservative",
  dataSources: ["workspace-inspection", "core-model-summary", "core-entity-index"],
};

export function CommandabilityDomainSurface({
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
      definition={commandabilityDomainDefinition}
      workspace={workspace}
      modelSummary={modelSummary}
      entityIndex={entityIndex}
      selectedEntity={selectedEntity}
      onSelectEntity={onSelectEntity}
      onOpenFile={onOpenFile}
      description="Read-only Commandability domain surface backed by structural workspace inspection and Core-reported entity records."
      boundary="This surface shows commandability contract records only as reported by Core. It does not authorize, schedule or execute operational commands."
      emptySelectionDetail="Select a Core-reported commandability entity to inspect its read-only detail."
    />
  );
}
