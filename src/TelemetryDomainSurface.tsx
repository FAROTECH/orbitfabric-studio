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

const telemetryDomainDefinition: DomainSurfaceDefinition = {
  id: "telemetry",
  label: "Telemetry",
  coreDomainId: "telemetry",
  expectedSourceFile: "telemetry.yaml",
  lifecycleStatus: "implementable",
  dataSources: [
    "workspace-inspection",
    "core-model-summary",
    "core-entity-index",
    "generated-artifact-inventory",
  ],
};

export function TelemetryDomainSurface({
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
      definition={telemetryDomainDefinition}
      workspace={workspace}
      modelSummary={modelSummary}
      entityIndex={entityIndex}
      selectedEntity={selectedEntity}
      onSelectEntity={onSelectEntity}
      onOpenFile={onOpenFile}
      description="Read-only Telemetry domain surface backed by structural workspace inspection and Core-reported entity records."
      boundary="This surface does not parse telemetry YAML semantically, does not render live telemetry, and does not implement telemetry archive or decoder runtime behavior."
      emptySelectionDetail="Select a Core-reported telemetry entity to inspect its read-only detail."
    />
  );
}
