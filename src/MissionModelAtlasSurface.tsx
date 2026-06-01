import { type CSSProperties, useMemo, useState } from "react";

import { ProvenanceBadge, StatusBadge } from "./Badges";
import type { DomainEntitySummary } from "./domainSurfaceModel";
import type {
  CoreEntityIndex,
  CoreEntityIndexEntity,
  CoreModelSummary,
  ProjectEntry,
  WorkspaceInspection,
} from "./types/workspace";

export interface MissionModelAtlasSurfaceProps {
  workspace: WorkspaceInspection;
  modelSummary: CoreModelSummary | null;
  entityIndex: CoreEntityIndex | null;
  selectedEntity: DomainEntitySummary | null;
  onSelectEntity: (entity: DomainEntitySummary) => void;
  onOpenFile: (entry: ProjectEntry) => void;
}

interface AtlasDomain {
  id: string;
  label: string;
  sourceFile: string | null;
  required: boolean;
  present: boolean;
  modelCount: number | null;
  entityCount: number;
  state: "indexed" | "reported" | "source" | "missing";
  sourceEntry: ProjectEntry | null;
  entities: DomainEntitySummary[];
}

export function MissionModelAtlasSurface({
  workspace,
  modelSummary,
  entityIndex,
  selectedEntity,
  onSelectEntity,
  onOpenFile,
}: MissionModelAtlasSurfaceProps) {
  const atlas = useMemo(
    () => createAtlas(workspace, modelSummary, entityIndex),
    [workspace, modelSummary, entityIndex],
  );
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const selectedDomain =
    atlas.domains.find((domain) => domain.id === selectedDomainId) ??
    atlas.domains[0] ??
    null;

  return (
    <section id="studio-model" className="mission-model-atlas" aria-label="Mission Model Atlas">
      <header className="mission-model-atlas-hero">
        <div>
          <span className="cockpit-eyebrow">Mission Model Atlas</span>
          <h2>Contract territory map</h2>
          <p>
            Read-only map of Mission Model source files, Core-reported domains and
            Core-reported entity records. Studio observes the contract posture without
            editing YAML, parsing source semantics or inventing missing model meaning.
          </p>
        </div>
        <div className="badge-row mission-model-atlas-hero-badges">
          <ProvenanceBadge label="READ-ONLY" />
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="NO INFERENCE" />
        </div>
      </header>

      <section className="mission-model-atlas-grid" aria-label="Mission Model posture">
        <article className="mission-model-atlas-panel mission-model-atlas-map-panel">
          <div className="mission-model-atlas-panel-heading">
            <div>
              <span className="cockpit-eyebrow">Atlas map</span>
              <h3>Domain constellation</h3>
            </div>
            <StatusBadge label={`${atlas.domains.length} DOMAINS`} />
          </div>
          <div className="mission-model-orbit">
            {atlas.domains.map((domain, index) => (
              <button
                type="button"
                className={`mission-model-orbit-node mission-model-orbit-node-${domain.state} ${
                  selectedDomain?.id === domain.id ? "mission-model-orbit-node-active" : ""
                }`}
                key={domain.id}
                style={
                  {
                    "--orbit-index": index,
                    "--orbit-total": atlas.domains.length,
                  } as CSSProperties
                }
                onClick={() => setSelectedDomainId(domain.id)}
              >
                <span>{shortLabel(domain.id)}</span>
              </button>
            ))}
            <div className="mission-model-orbit-core">MODEL<br />CONTRACT</div>
          </div>
        </article>

        <article className="mission-model-atlas-panel">
          <div className="mission-model-atlas-panel-heading">
            <div>
              <span className="cockpit-eyebrow">Report rails</span>
              <h3>Core posture</h3>
            </div>
            <StatusBadge label="READ ONLY" />
          </div>
          <div className="mission-model-status-grid">
            <AtlasMetric label="Model summary" value={modelSummary ? "reported" : "not reported"} />
            <AtlasMetric label="Entity index" value={entityIndex ? "reported" : "not reported"} />
            <AtlasMetric label="Source files" value={String(workspace.source_model_files.length)} />
            <AtlasMetric label="Missing files" value={String(workspace.missing_expected_source_files.length)} />
            <AtlasMetric label="Entity records" value={String(entityIndex?.counts.total_entities ?? 0)} />
            <AtlasMetric label="Indexed domains" value={String(atlas.domains.filter((domain) => domain.state === "indexed").length)} />
          </div>
        </article>
      </section>

      <section className="mission-model-atlas-panel" aria-label="Mission Model source rails">
        <div className="mission-model-atlas-panel-heading">
          <div>
            <span className="cockpit-eyebrow">Source rails</span>
            <h3>Workspace contract files</h3>
          </div>
          <StatusBadge label="STRUCTURAL" />
        </div>
        <div className="mission-model-source-grid">
          {workspace.source_model_files.map((entry) => (
            <button
              className="mission-model-source-card"
              type="button"
              key={entry.path}
              disabled={entry.kind !== "file"}
              onClick={() => onOpenFile(entry)}
            >
              <span>{entry.name}</span>
              <strong>{entry.category}</strong>
            </button>
          ))}
          {workspace.missing_expected_source_files.map((file) => (
            <article className="mission-model-source-card mission-model-source-card-missing" key={file}>
              <span>{file}</span>
              <strong>MISSING</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="mission-model-domain-grid" aria-label="Mission Model domains">
        {atlas.domains.map((domain) => (
          <button
            className={`mission-model-domain-card mission-model-domain-card-${domain.state}`}
            type="button"
            key={domain.id}
            onClick={() => setSelectedDomainId(domain.id)}
            aria-current={selectedDomain?.id === domain.id ? "true" : undefined}
          >
            <span>{domain.id}</span>
            <strong>{domain.label}</strong>
            <small>source: {domain.sourceFile ?? "not reported"}</small>
            <small>model: {domain.modelCount ?? "not reported"}</small>
            <small>entities: {domain.entityCount}</small>
            <StatusBadge label={domain.state.toUpperCase()} />
          </button>
        ))}
      </section>

      <section className="mission-model-atlas-panel mission-model-dossier" aria-label="Selected domain dossier">
        {selectedDomain ? (
          <>
            <div className="mission-model-atlas-panel-heading">
              <div>
                <span className="cockpit-eyebrow">Domain dossier</span>
                <h3>{selectedDomain.label}</h3>
                <p>{selectedDomain.id}</p>
              </div>
              <StatusBadge label={selectedDomain.state.toUpperCase()} />
            </div>
            <div className="mission-model-status-grid">
              <AtlasMetric label="Source file" value={selectedDomain.sourceFile ?? "not reported"} />
              <AtlasMetric label="Required" value={selectedDomain.required ? "yes" : "no"} />
              <AtlasMetric label="Present" value={selectedDomain.present ? "yes" : "no"} />
              <AtlasMetric label="Model count" value={selectedDomain.modelCount === null ? "not reported" : String(selectedDomain.modelCount)} />
            </div>
            {selectedDomain.sourceEntry ? (
              <button className="mission-model-open-source" type="button" onClick={() => onOpenFile(selectedDomain.sourceEntry!)}>
                Inspect source file: {selectedDomain.sourceEntry.name}
              </button>
            ) : null}
            {selectedDomain.entities.length > 0 ? (
              <ul className="mission-model-entity-list">
                {selectedDomain.entities.map((entity) => (
                  <li key={`${entity.domain}-${entity.id}`}>
                    <button
                      type="button"
                      onClick={() => onSelectEntity(entity)}
                      aria-current={selectedEntity?.id === entity.id ? "true" : undefined}
                    >
                      <strong>{entity.displayName || entity.id}</strong>
                      <span>{entity.entityType}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-text">No entity records are reported for this domain.</p>
            )}
          </>
        ) : (
          <p className="empty-text">No domain records are available.</p>
        )}
      </section>

      <section className="mission-model-atlas-guardrail" aria-label="Mission Model Atlas guardrails">
        <span>No YAML authoring</span>
        <span>No semantic YAML parsing</span>
        <span>No private completeness score</span>
        <span>No graph inference</span>
        <span>No runtime behavior</span>
      </section>
    </section>
  );
}

function AtlasMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="mission-model-status-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function createAtlas(
  workspace: WorkspaceInspection,
  modelSummary: CoreModelSummary | null,
  entityIndex: CoreEntityIndex | null,
) {
  const sourceByName = new Map(workspace.source_model_files.map((entry) => [entry.name, entry]));
  const modelById = new Map((modelSummary?.domains ?? []).map((domain) => [domain.id, domain]));
  const entityDomainById = new Map((entityIndex?.domains ?? []).map((domain) => [domain.id, domain]));
  const ids = new Set<string>();

  modelById.forEach((_, id) => ids.add(id));
  entityDomainById.forEach((_, id) => ids.add(id));
  workspace.source_model_files.forEach((entry) => ids.add(entry.name.replace(/\.ya?ml$/i, "")));

  const entitiesByDomain = groupEntities(entityIndex?.entities ?? []);
  const domains = [...ids].sort().map((id): AtlasDomain => {
    const modelDomain = modelById.get(id) ?? null;
    const entityDomain = entityDomainById.get(id) ?? null;
    const sourceFile = entityDomain?.source_file ?? modelDomain?.source_file ?? `${id}.yaml`;
    const sourceEntry = sourceByName.get(sourceFile) ?? null;
    const entities = entitiesByDomain[id] ?? [];
    const indexed = Boolean(entityDomain?.indexed);
    const present = entityDomain?.present ?? modelDomain?.present ?? Boolean(sourceEntry);

    return {
      id,
      label: entityDomain?.display_name ?? modelDomain?.display_name ?? labelFromId(id),
      sourceFile,
      required: entityDomain?.required ?? modelDomain?.required ?? false,
      present,
      modelCount: entityDomain?.model_count ?? modelDomain?.count ?? null,
      entityCount: entityDomain?.entity_count ?? entities.length,
      state: indexed ? "indexed" : entityDomain || modelDomain ? (present ? "reported" : "missing") : "source",
      sourceEntry,
      entities,
    };
  });

  return { domains };
}

function groupEntities(entities: CoreEntityIndexEntity[]): Record<string, DomainEntitySummary[]> {
  return entities.reduce<Record<string, DomainEntitySummary[]>>((grouped, entity) => {
    const summary: DomainEntitySummary = {
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

    grouped[entity.domain] = grouped[entity.domain] ?? [];
    grouped[entity.domain].push(summary);
    return grouped;
  }, {});
}

function labelFromId(id: string): string {
  return id.replace(/[_-]/g, " ").replace(/\b\w/g, (value) => value.toUpperCase());
}

function shortLabel(id: string): string {
  return id
    .split(/[_-]/g)
    .map((part) => part.slice(0, 3).toUpperCase())
    .join("/")
    .slice(0, 10);
}
