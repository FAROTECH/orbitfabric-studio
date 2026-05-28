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

const subsystemsDomainDefinition: DomainSurfaceDefinition = {
  id: "subsystems",
  label: "Subsystems",
  coreDomainId: "subsystems",
  expectedSourceFile: "subsystems.yaml",
  lifecycleStatus: "implementable",
  dataSources: ["workspace-inspection", "core-model-summary", "core-entity-index"],
};

export function SubsystemsDomainSurface({
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
      definition={subsystemsDomainDefinition}
      workspace={workspace}
      modelSummary={modelSummary}
      entityIndex={entityIndex}
      selectedEntity={selectedEntity}
      onSelectEntity={onSelectEntity}
      onOpenFile={onOpenFile}
      description="Read-only Subsystems domain surface backed by structural workspace inspection and Core-reported entity records."
      boundary="This surface does not parse subsystem YAML semantically, does not compute subsystem health, and does not infer runtime subsystem state or dependencies."
      emptySelectionDetail="Select a Core-reported subsystem entity to inspect its read-only detail."
    />
  );
}
