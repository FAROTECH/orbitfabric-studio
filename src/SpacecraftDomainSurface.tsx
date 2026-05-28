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

const spacecraftDomainDefinition: DomainSurfaceDefinition = {
  id: "spacecraft",
  label: "Spacecraft",
  coreDomainId: "spacecraft",
  expectedSourceFile: "spacecraft.yaml",
  lifecycleStatus: "implementable",
  dataSources: ["workspace-inspection", "core-model-summary", "core-entity-index"],
};

export function SpacecraftDomainSurface({
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
      definition={spacecraftDomainDefinition}
      workspace={workspace}
      modelSummary={modelSummary}
      entityIndex={entityIndex}
      selectedEntity={selectedEntity}
      onSelectEntity={onSelectEntity}
      onOpenFile={onOpenFile}
      description="Read-only Spacecraft domain surface backed by structural workspace inspection and Core-reported entity records."
      boundary="This surface does not parse spacecraft YAML semantically, does not compute readiness or health, and does not infer runtime spacecraft state."
      emptySelectionDetail="Select a Core-reported spacecraft entity to inspect its read-only detail."
    />
  );
}
