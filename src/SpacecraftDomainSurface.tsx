import {
  DomainEntityDetail,
  DomainEntityList,
  DomainSurfaceEmptyState,
  DomainSurfaceFrame,
  DomainSurfaceHeader,
  DomainSurfaceSummary,
} from "./DomainSurfaceShell";
import type {
  DomainEntitySummary,
  DomainSurfaceDefinition,
  DomainSurfaceSnapshot,
} from "./domainSurfaceModel";
import type {
  CoreEntityIndex,
  CoreEntityIndexEntity,
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
  const snapshot = createSpacecraftSnapshot(workspace, modelSummary, entityIndex);
  const sourceFile = snapshot.sourceFileState.sourceFile;

  return (
    <DomainSurfaceFrame snapshot={snapshot}>
      <DomainSurfaceHeader
        snapshot={snapshot}
        description="Read-only Spacecraft domain surface backed by structural workspace inspection and Core-reported entity records."
      />

      <DomainSurfaceSummary snapshot={snapshot} />

      <section className="entry-section muted-section" aria-label="Spacecraft domain boundary">
        <h3>Boundary</h3>
        <p>
          This surface does not parse spacecraft YAML semantically, does not compute
          readiness or health, and does not infer runtime spacecraft state.
        </p>
        {sourceFile ? (
          <button
            className="entry-button"
            type="button"
            onClick={() => onOpenFile(sourceFile)}
          >
            Preview spacecraft.yaml
          </button>
        ) : null}
      </section>

      <section className="entry-section" aria-label="Spacecraft Core entities">
        <h3>Core entity records</h3>
        <DomainEntityList entities={snapshot.entities} onSelectEntity={onSelectEntity} />
      </section>

      {selectedEntity ? (
        <DomainEntityDetail entity={selectedEntity} />
      ) : (
        <DomainSurfaceEmptyState
          title="No entity selected"
          detail="Select a Core-reported spacecraft entity to inspect its read-only detail."
        />
      )}
    </DomainSurfaceFrame>
  );
}

function createSpacecraftSnapshot(
  workspace: WorkspaceInspection,
  modelSummary: CoreModelSummary | null,
  entityIndex: CoreEntityIndex | null,
): DomainSurfaceSnapshot {
  const sourceFile =
    workspace.source_model_files.find(
      (entry) => entry.name === spacecraftDomainDefinition.expectedSourceFile,
    ) ?? null;
  const modelSummaryDomain =
    modelSummary?.domains.find(
      (domain) => domain.id === spacecraftDomainDefinition.coreDomainId,
    ) ?? null;
  const entityIndexDomain =
    entityIndex?.domains.find(
      (domain) => domain.id === spacecraftDomainDefinition.coreDomainId,
    ) ?? null;
  const entities =
    entityIndex?.entities
      .filter((entity) => entity.domain === spacecraftDomainDefinition.coreDomainId)
      .map(toDomainEntitySummary) ?? [];

  return {
    definition: spacecraftDomainDefinition,
    sourceFileState: {
      state: sourceFile ? "structural" : "unavailable",
      expectedSourceFile: spacecraftDomainDefinition.expectedSourceFile,
      sourceFile,
    },
    coreReportState: {
      modelSummaryState: modelSummaryDomain ? "reported" : "not-reported",
      entityIndexState: entityIndexDomain ? "reported" : "not-reported",
      modelSummaryDomain,
      entityIndexDomain,
    },
    entityCount: entities.length,
    entities,
  };
}

function toDomainEntitySummary(entity: CoreEntityIndexEntity): DomainEntitySummary {
  return {
    id: entity.id,
    domain: entity.domain,
    entityType: entity.entity_type,
    displayName: entity.display_name,
    sourceFile: entity.source_file,
    provenance: entity.provenance,
    requiredDomain: entity.required_domain,
    present: entity.present,
    raw: entity,
  };
}
