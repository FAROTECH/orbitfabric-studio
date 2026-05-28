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

const dataProductsDomainDefinition: DomainSurfaceDefinition = {
  id: "data-products",
  label: "Data Products",
  coreDomainId: "data_products",
  expectedSourceFile: "data_products.yaml",
  lifecycleStatus: "conservative",
  dataSources: [
    "workspace-inspection",
    "core-model-summary",
    "core-entity-index",
    "core-coverage-summary",
    "generated-artifact-inventory",
  ],
};

export function DataProductsDomainSurface({
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
      definition={dataProductsDomainDefinition}
      workspace={workspace}
      modelSummary={modelSummary}
      entityIndex={entityIndex}
      selectedEntity={selectedEntity}
      onSelectEntity={onSelectEntity}
      onOpenFile={onOpenFile}
      description="Read-only Data Products domain surface backed by structural workspace inspection and Core-reported entity records."
      boundary="This surface shows data-product contract records only as reported by Core. It does not infer storage completion or downlink completion."
      emptySelectionDetail="Select a Core-reported data-product entity to inspect its read-only detail."
    />
  );
}
