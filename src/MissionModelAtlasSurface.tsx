import { useEffect, useMemo, useState } from "react";

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
  preferredDomainId?: string;
}

type FabricDomainState = "indexed" | "reported" | "source" | "missing";

interface FabricDomain {
  id: string;
  label: string;
  sourceFile: string | null;
  required: boolean;
  present: boolean;
  modelCount: number | null;
  entityCount: number;
  state: FabricDomainState;
  sourceEntry: ProjectEntry | null;
  entities: DomainEntitySummary[];
}

interface FabricLane {
  sourceFile: string;
  sourceEntry: ProjectEntry | null;
  sourceCategory: string | null;
  missing: boolean;
  domains: FabricDomain[];
}

interface MissionModelFabric {
  domains: FabricDomain[];
  lanes: FabricLane[];
  counts: {
    sourceFiles: number;
    missingFiles: number;
    modelDomains: number;
    entityRecords: number;
    indexedDomains: number;
  };
}

const missionSourceOrder = [
  "spacecraft.yaml",
  "subsystems.yaml",
  "modes.yaml",
  "telemetry.yaml",
  "commands.yaml",
  "events.yaml",
  "faults.yaml",
  "packets.yaml",
  "payloads.yaml",
  "data_products.yaml",
  "contacts.yaml",
  "commandability.yaml",
  "policies.yaml",
];

const stateCopy: Record<FabricDomainState, string> = {
  source: "Workspace source exists, but Core reports are not attached to this domain yet.",
  reported: "Core reported this contract domain, with no indexed entity records attached.",
  indexed: "Core reported this domain and entity-index records are available.",
  missing: "This expected source lane is missing or not present in the workspace.",
};

const stateLabels: Record<FabricDomainState, string> = {
  indexed: "Indexed",
  reported: "Reported",
  source: "Source",
  missing: "Missing",
};

export function MissionModelAtlasSurface({
  workspace,
  modelSummary,
  entityIndex,
  selectedEntity,
  onSelectEntity,
  onOpenFile,
  preferredDomainId,
}: MissionModelAtlasSurfaceProps) {
  const fabric = useMemo(
    () => createMissionModelFabric(workspace, modelSummary, entityIndex),
    [workspace, modelSummary, entityIndex],
  );
  const preferredResolvedDomainId = useMemo(
    () => resolvePreferredDomainId(preferredDomainId, fabric.domains),
    [preferredDomainId, fabric.domains],
  );
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(preferredResolvedDomainId);
  const reportsMissing = !modelSummary || !entityIndex;

  useEffect(() => {
    setSelectedDomainId(preferredResolvedDomainId);
  }, [preferredResolvedDomainId]);

  const selectedDomain =
    fabric.domains.find((domain) => domain.id === selectedDomainId) ??
    fabric.domains.find((domain) => domain.id === preferredResolvedDomainId) ??
    fabric.domains[0] ??
    null;

  return (
    <section id="studio-model" className="mission-model-atlas mission-model-fabric" aria-label="Mission Model Fabric">
      <header className="mission-model-fabric-hero">
        <div>
          <span className="cockpit-eyebrow">Mission Model Fabric</span>
          <h2>Source-to-contract weave</h2>
          <p>
            Workspace YAML lanes, Core domain capsules and entity-index evidence in one read-only contract fabric.
          </p>
        </div>
        <div className="badge-row mission-model-fabric-hero-badges">
          <ProvenanceBadge label="READ-ONLY" />
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="NO YAML AUTHORING" />
          <StatusBadge label="NO GRAPH INFERENCE" />
        </div>
      </header>

      <ContractSpine
        fabric={fabric}
        modelSummary={modelSummary}
        entityIndex={entityIndex}
        selectedDomain={selectedDomain}
        reportsMissing={reportsMissing}
      />

      <section className="mission-model-fabric-workbench" aria-label="Mission Model Fabric workbench">
        <FabricMatrix
          lanes={fabric.lanes}
          selectedDomain={selectedDomain}
          onOpenFile={onOpenFile}
          onSelectDomain={setSelectedDomainId}
        />

        <FocusedContractPanel
          domain={selectedDomain}
          selectedEntity={selectedEntity}
          onOpenFile={onOpenFile}
          onSelectEntity={onSelectEntity}
        />
      </section>
    </section>
  );
}

function ContractSpine({
  fabric,
  modelSummary,
  entityIndex,
  selectedDomain,
  reportsMissing,
}: {
  fabric: MissionModelFabric;
  modelSummary: CoreModelSummary | null;
  entityIndex: CoreEntityIndex | null;
  selectedDomain: FabricDomain | null;
  reportsMissing: boolean;
}) {
  return (
    <section className="mission-model-contract-spine" aria-label="Mission Model contract spine">
      <div className="mission-model-spine-steps">
        <SpineCell
          label="Workspace sources"
          value={`${fabric.counts.sourceFiles} files`}
          state={fabric.counts.missingFiles > 0 ? "missing" : "source"}
        />
        <SpineCell
          label="Model summary"
          value={modelSummary ? `${fabric.counts.modelDomains} domains` : "not reported"}
          state={modelSummary ? "reported" : "missing"}
        />
        <SpineCell
          label="Entity index"
          value={entityIndex ? `${fabric.counts.entityRecords} records` : "not reported"}
          state={entityIndex ? "indexed" : "missing"}
        />
        <SpineCell
          label="Focused contract"
          value={selectedDomain?.label ?? "none"}
          state={selectedDomain?.state ?? "source"}
        />
      </div>

      {reportsMissing ? (
        <div className="mission-model-spine-remediation" aria-label="Core report refresh path">
          <span>Refresh Core</span>
          <span>Export model summary</span>
          <span>Export entity index</span>
          <span>Return to Model</span>
        </div>
      ) : null}
    </section>
  );
}

function SpineCell({
  label,
  value,
  state,
}: {
  label: string;
  value: string;
  state: FabricDomainState;
}) {
  return (
    <article className={`mission-model-spine-cell mission-model-fabric-state-${state}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function FabricMatrix({
  lanes,
  selectedDomain,
  onOpenFile,
  onSelectDomain,
}: {
  lanes: FabricLane[];
  selectedDomain: FabricDomain | null;
  onOpenFile: (entry: ProjectEntry) => void;
  onSelectDomain: (domainId: string) => void;
}) {
  return (
    <section className="mission-model-fabric-matrix" aria-label="Mission Model source lanes">
      <div className="mission-model-fabric-panel-heading">
        <div>
          <span className="cockpit-eyebrow">Fabric Matrix</span>
          <h3>Source lanes and Core domain capsules</h3>
          <p>Each lane is a workspace source. Each capsule is a Core-facing contract domain attached to that source.</p>
        </div>
        <div className="mission-model-fabric-legend" aria-label="Fabric state legend">
          <LegendItem state="indexed" />
          <LegendItem state="reported" />
          <LegendItem state="source" />
          <LegendItem state="missing" />
        </div>
      </div>

      <div className="mission-model-source-lanes">
        {lanes.map((lane) => (
          <article className={`mission-model-source-lane ${lane.missing ? "mission-model-source-lane-missing" : ""}`} key={lane.sourceFile}>
            <div className="mission-model-source-lane-header">
              <button
                type="button"
                disabled={!lane.sourceEntry}
                onClick={() => {
                  if (lane.sourceEntry) {
                    onOpenFile(lane.sourceEntry);
                  }
                }}
              >
                <strong>{lane.sourceFile}</strong>
                <span>{lane.missing ? "Missing YAML" : "YAML source"}</span>
              </button>
            </div>

            <div className="mission-model-domain-capsule-rail">
              {lane.domains.length > 0 ? (
                lane.domains.map((domain) => {
                  const focused = selectedDomain?.id === domain.id;

                  return (
                    <button
                      type="button"
                      className={`mission-model-domain-capsule mission-model-fabric-state-${domain.state}`}
                      key={domain.id}
                      onClick={() => onSelectDomain(domain.id)}
                      aria-current={focused ? "true" : undefined}
                      title={`${domain.label}: ${stateCopy[domain.state]}`}
                    >
                      <strong>{domain.label}</strong>
                      <span>{stateLabels[domain.state]}</span>
                      <small>{domain.entityCount} entities</small>
                      {focused ? <em>Focused</em> : null}
                    </button>
                  );
                })
              ) : (
                <span className="mission-model-empty-capsule">No Core domain capsule</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FocusedContractPanel({
  domain,
  selectedEntity,
  onOpenFile,
  onSelectEntity,
}: {
  domain: FabricDomain | null;
  selectedEntity: DomainEntitySummary | null;
  onOpenFile: (entry: ProjectEntry) => void;
  onSelectEntity: (entity: DomainEntitySummary) => void;
}) {
  if (!domain) {
    return (
      <aside className="mission-model-focused-contract" aria-label="Focused contract">
        <span className="cockpit-eyebrow">Focused contract</span>
        <h3>No contract selected</h3>
        <p>Select a Core domain capsule from the Fabric Matrix.</p>
      </aside>
    );
  }

  return (
    <aside className="mission-model-focused-contract" aria-label="Focused contract">
      <div className="mission-model-focused-contract-header">
        <div>
          <span className="cockpit-eyebrow">Focused contract</span>
          <h3>{domain.label}</h3>
        </div>
        <StatusBadge label={domain.state.toUpperCase()} />
      </div>

      <div className="mission-model-focused-metrics">
        <FocusedMetric label="Source" value={domain.sourceFile ?? "not reported"} />
        <FocusedMetric label="Model" value={domain.modelCount === null ? "not reported" : String(domain.modelCount)} />
        <FocusedMetric label="Entities" value={String(domain.entityCount)} />
        <FocusedMetric label="Required" value={domain.required ? "yes" : "no"} />
      </div>

      <div className="mission-model-focused-actions">
        {domain.sourceEntry ? (
          <button type="button" onClick={() => onOpenFile(domain.sourceEntry!)}>
            Inspect source
          </button>
        ) : null}
        <span>{domain.present ? "present" : "not present"}</span>
      </div>

      <section className="mission-model-entity-ribbon" aria-label="Focused contract entity ribbon">
        <div className="mission-model-entity-ribbon-heading">
          <span>Entity ribbon</span>
          <strong>{domain.entities.length}</strong>
        </div>
        {domain.entities.length > 0 ? (
          <div className="mission-model-entity-ribbon-items">
            {domain.entities.map((entity) => (
              <button
                type="button"
                key={`${entity.domain}-${entity.id}`}
                onClick={() => onSelectEntity(entity)}
                aria-current={selectedEntity?.id === entity.id ? "true" : undefined}
              >
                <strong>{entity.displayName || entity.id}</strong>
                <span>{entity.entityType}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="empty-text">No entity records are reported for this contract domain.</p>
        )}
      </section>
    </aside>
  );
}

function FocusedMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="mission-model-focused-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function LegendItem({ state }: { state: FabricDomainState }) {
  return <span className={`mission-model-fabric-legend-item mission-model-fabric-state-${state}`}>{stateLabels[state]}</span>;
}

function createMissionModelFabric(
  workspace: WorkspaceInspection,
  modelSummary: CoreModelSummary | null,
  entityIndex: CoreEntityIndex | null,
): MissionModelFabric {
  const sourceByName = new Map(workspace.source_model_files.map((entry) => [entry.name, entry]));
  const modelById = new Map((modelSummary?.domains ?? []).map((domain) => [domain.id, domain]));
  const entityDomainById = new Map((entityIndex?.domains ?? []).map((domain) => [domain.id, domain]));
  const missingSourceFiles = new Set(workspace.missing_expected_source_files);
  const ids = new Set<string>();

  modelById.forEach((_, id) => ids.add(id));
  entityDomainById.forEach((_, id) => ids.add(id));
  workspace.source_model_files.forEach((entry) => ids.add(sourceFileNameToDomainId(entry.name)));
  workspace.missing_expected_source_files.forEach((file) => ids.add(sourceFileNameToDomainId(file)));

  const entitiesByDomain = groupEntities(entityIndex?.entities ?? []);
  const domains = [...ids].sort((left, right) => left.localeCompare(right)).map((id): FabricDomain => {
    const modelDomain = modelById.get(id) ?? null;
    const entityDomain = entityDomainById.get(id) ?? null;
    const sourceFile = entityDomain?.source_file ?? modelDomain?.source_file ?? domainIdToSourceFileName(id);
    const sourceEntry = sourceByName.get(sourceFile) ?? null;
    const entities = entitiesByDomain[id] ?? [];
    const indexed = Boolean(entityDomain?.indexed);
    const present = entityDomain?.present ?? modelDomain?.present ?? Boolean(sourceEntry);
    const state: FabricDomainState = missingSourceFiles.has(sourceFile)
      ? "missing"
      : indexed
        ? "indexed"
        : entityDomain || modelDomain
          ? present
            ? "reported"
            : "missing"
          : "source";

    return {
      id,
      label: labelFromId(id),
      sourceFile,
      required: entityDomain?.required ?? modelDomain?.required ?? false,
      present,
      modelCount: entityDomain?.model_count ?? modelDomain?.count ?? null,
      entityCount: entityDomain?.entity_count ?? entities.length,
      state,
      sourceEntry,
      entities,
    };
  });

  const laneNames = createLaneNames(workspace, domains);
  const lanes = laneNames.map((sourceFile): FabricLane => {
    const sourceEntry = sourceByName.get(sourceFile) ?? null;
    const missing = missingSourceFiles.has(sourceFile);

    return {
      sourceFile,
      sourceEntry,
      sourceCategory: sourceEntry ? formatSourceCategory(sourceEntry.category) : null,
      missing,
      domains: domains
        .filter((domain) => domain.sourceFile === sourceFile)
        .sort(sortDomainsForLane(sourceFile)),
    };
  });

  return {
    domains,
    lanes,
    counts: {
      sourceFiles: workspace.source_model_files.length,
      missingFiles: workspace.missing_expected_source_files.length,
      modelDomains: modelSummary?.domains.length ?? 0,
      entityRecords: entityIndex?.counts.total_entities ?? 0,
      indexedDomains: domains.filter((domain) => domain.state === "indexed").length,
    },
  };
}

function createLaneNames(workspace: WorkspaceInspection, domains: FabricDomain[]): string[] {
  const orderedNames: string[] = [];
  const seen = new Set<string>();
  const sourceNames = new Set(workspace.source_model_files.map((entry) => entry.name));
  const missingNames = new Set(workspace.missing_expected_source_files);
  const domainSourceNames = new Set(domains.map((domain) => domain.sourceFile).filter(Boolean) as string[]);

  function addName(name: string | null) {
    if (!name || seen.has(name)) {
      return;
    }
    seen.add(name);
    orderedNames.push(name);
  }

  missionSourceOrder.forEach((name) => {
    if (sourceNames.has(name) || missingNames.has(name) || domainSourceNames.has(name)) {
      addName(name);
    }
  });
  workspace.source_model_files.forEach((entry) => addName(entry.name));
  workspace.missing_expected_source_files.forEach(addName);
  domains.forEach((domain) => addName(domain.sourceFile));

  return orderedNames;
}

function sortDomainsForLane(sourceFile: string) {
  const primaryDomainId = sourceFileNameToDomainId(sourceFile);

  return (left: FabricDomain, right: FabricDomain) => {
    if (left.id === primaryDomainId && right.id !== primaryDomainId) {
      return -1;
    }
    if (right.id === primaryDomainId && left.id !== primaryDomainId) {
      return 1;
    }
    return left.label.localeCompare(right.label);
  };
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

function resolvePreferredDomainId(
  preferredDomainId: string | undefined,
  domains: FabricDomain[],
): string | null {
  if (!preferredDomainId) {
    return domains[0]?.id ?? null;
  }

  const normalizedPreferredId = preferredDomainId.replace(/-/g, "_");
  const preferredAliases = createPreferredDomainAliases(normalizedPreferredId);

  for (const alias of preferredAliases) {
    if (domains.some((domain) => domain.id === alias)) {
      return alias;
    }
  }

  return domains[0]?.id ?? null;
}

function createPreferredDomainAliases(preferredDomainId: string): string[] {
  const aliases: Record<string, string[]> = {
    contacts_downlink: ["contacts", "contact_profiles", "contact_windows", "downlink_flows"],
    data_products: ["data_products"],
    commandability: ["commandability", "command_sources", "commandability_rules", "autonomous_actions", "recovery_intents"],
  };

  return aliases[preferredDomainId] ?? [preferredDomainId];
}

function sourceFileNameToDomainId(name: string): string {
  return name.replace(/\.ya?ml$/i, "").replace(/-/g, "_");
}

function domainIdToSourceFileName(id: string): string {
  return `${id}.yaml`;
}

function formatSourceCategory(category: string): string {
  if (category === "sourceModel") {
    return "Source model";
  }

  return category.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (value) => value.toUpperCase());
}

function labelFromId(id: string): string {
  return id.replace(/[_-]/g, " ").replace(/\b\w/g, (value) => value.toUpperCase());
}
