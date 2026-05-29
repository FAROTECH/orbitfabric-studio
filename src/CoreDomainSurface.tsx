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

export function CoreDomainSurface({
  definition,
  workspace,
  modelSummary,
  entityIndex,
  selectedEntity,
  onSelectEntity,
  onOpenFile,
  description,
  boundary,
  emptySelectionDetail,
}: {
  definition: DomainSurfaceDefinition;
  workspace: WorkspaceInspection;
  modelSummary: CoreModelSummary | null;
  entityIndex: CoreEntityIndex | null;
  selectedEntity: DomainEntitySummary | null;
  onSelectEntity: (entity: DomainEntitySummary) => void;
  onOpenFile: (entry: ProjectEntry) => void;
  description: string;
  boundary: string;
  emptySelectionDetail: string;
}) {
  const snapshot = createCoreDomainSnapshot(workspace, modelSummary, entityIndex, definition);
  const sourceFile = snapshot.sourceFileState.sourceFile;

  return (
    <DomainSurfaceFrame snapshot={snapshot}>
      <DomainSurfaceHeader snapshot={snapshot} description={description} />

      <DomainSurfaceSummary snapshot={snapshot} />

      <section className="entry-section muted-section" aria-label={`${definition.label} domain boundary`}>
        <h3>Boundary</h3>
        <p>{boundary}</p>
        {sourceFile ? (
          <button
            className="entry-button"
            type="button"
            onClick={() => onOpenFile(sourceFile)}
          >
            Inspect source file: {definition.expectedSourceFile ?? sourceFile.name}
          </button>
        ) : null}
      </section>

      <section className="entry-section" aria-label={`${definition.label} Core entities`}>
        <h3>Core entity records</h3>
        <DomainEntityList entities={snapshot.entities} onSelectEntity={onSelectEntity} />
      </section>

      {selectedEntity ? (
        <DomainEntityDetail entity={selectedEntity} />
      ) : (
        <DomainSurfaceEmptyState
          title="No entity selected"
          detail={emptySelectionDetail}
        />
      )}
    </DomainSurfaceFrame>
  );
}


export interface CoreDomainSurfaceRuntimeProps {
  workspace: WorkspaceInspection;
  modelSummary: CoreModelSummary | null;
  entityIndex: CoreEntityIndex | null;
  selectedEntity: DomainEntitySummary | null;
  onSelectEntity: (entity: DomainEntitySummary) => void;
  onOpenFile: (entry: ProjectEntry) => void;
}

export interface CoreDomainSurfaceFactoryConfig {
  definition: DomainSurfaceDefinition;
  description: string;
  boundary: string;
  emptySelectionDetail: string;
}

export function createCoreDomainSurface({
  definition,
  description,
  boundary,
  emptySelectionDetail,
}: CoreDomainSurfaceFactoryConfig) {
  return function ConfiguredCoreDomainSurface({
    workspace,
    modelSummary,
    entityIndex,
    selectedEntity,
    onSelectEntity,
    onOpenFile,
  }: CoreDomainSurfaceRuntimeProps) {
    return (
      <CoreDomainSurface
        definition={definition}
        workspace={workspace}
        modelSummary={modelSummary}
        entityIndex={entityIndex}
        selectedEntity={selectedEntity}
        onSelectEntity={onSelectEntity}
        onOpenFile={onOpenFile}
        description={description}
        boundary={boundary}
        emptySelectionDetail={emptySelectionDetail}
      />
    );
  };
}

function createCoreDomainSnapshot(
  workspace: WorkspaceInspection,
  modelSummary: CoreModelSummary | null,
  entityIndex: CoreEntityIndex | null,
  definition: DomainSurfaceDefinition,
): DomainSurfaceSnapshot {
  const coreDomainIds = resolveCoreDomainIds(definition);
  const sourceFile = definition.expectedSourceFile
    ? workspace.source_model_files.find(
        (entry) => entry.name === definition.expectedSourceFile,
      ) ?? null
    : null;

  const modelSummaryDomain = coreDomainIds.length > 0
    ? modelSummary?.domains.find((domain) => coreDomainIds.includes(domain.id)) ?? null
    : null;

  const entityIndexDomain = coreDomainIds.length > 0
    ? entityIndex?.domains.find((domain) => coreDomainIds.includes(domain.id)) ?? null
    : null;

  const entities = coreDomainIds.length > 0
    ? entityIndex?.entities
        .filter((entity) => coreDomainIds.includes(entity.domain))
        .map(toDomainEntitySummary) ?? []
    : [];

  return {
    definition,
    sourceFileState: {
      state: sourceFile
        ? "structural"
        : definition.expectedSourceFile
          ? "unavailable"
          : definition.lifecycleStatus === "reserved"
            ? "reserved"
            : "not-reported",
      expectedSourceFile: definition.expectedSourceFile,
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

function resolveCoreDomainIds(definition: DomainSurfaceDefinition): readonly string[] {
  if (definition.coreDomainIds && definition.coreDomainIds.length > 0) {
    return definition.coreDomainIds;
  }

  return definition.coreDomainId ? [definition.coreDomainId] : [];
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
