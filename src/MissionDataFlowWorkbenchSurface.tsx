import { useMemo, useState } from "react";

import { ProvenanceBadge, StatusBadge } from "./Badges";
import { DataFlowWorkbenchContextDrawer } from "./DataFlowWorkbenchContextDrawer";
import { DataFlowWorkbenchScenarioTimeline } from "./DataFlowWorkbenchScenarioTimeline";
import type {
  MissionDataFlowTraceabilityLink,
  MissionDataFlowTraceabilitySummary,
  MissionDataFlowWorkbenchLane,
  MissionDataFlowWorkbenchRecord,
  MissionDataFlowWorkbenchSnapshot,
  MissionDataFlowWorkbenchSourceState,
  MissionDataFlowWorkbenchSourceSummary,
} from "./missionDataFlowWorkbenchModel";
import type {
  CoreCoverageRecord,
  CoreExpectationCoverage,
  CoreRelationshipRecord,
  CoreRelationshipType,
  CoreScenarioRunIndex,
  CoreScenarioRunRecord,
  CoreScenarioRunIndexSummary,
  CoreSimulationDataFlowEvidenceRecord,
  CoreSimulationReport,
  GeneratedArtifactClass,
  GeneratedArtifactEntry,
} from "./types/workspace";

interface WorkbenchViewModel {
  kpis: KpiItem[];
  sourceItems: SourceRailItem[];
  stages: WorkbenchStage[];
  scenarioRows: ScenarioRow[];
  legendItems: LegendItem[];
  selectedPath: WorkbenchPathNode[];
  primarySelection: WorkbenchSelection | null;
  artifactCounts: ArtifactCounts;
  coverageItems: CoverageDisplayItem[];
}

interface KpiItem {
  id: string;
  label: string;
  value: string;
  detail: string;
  state: MissionDataFlowWorkbenchSourceState;
}

interface SourceRailItem {
  id: string;
  label: string;
  shortLabel: string;
  state: MissionDataFlowWorkbenchSourceState | "preview" | "not-wired";
  detail: string;
}

interface WorkbenchStage {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  state: MissionDataFlowWorkbenchSourceState | "preview";
  items: WorkbenchStageItem[];
  footer: string;
}

interface WorkbenchStageItem {
  id: string;
  label: string;
  kind: string;
  meta: string;
  state: MissionDataFlowWorkbenchSourceState | "preview" | "not-wired";
  detail: string;
  source: string;
  raw: unknown;
  selected?: boolean;
}

interface WorkbenchPathNode {
  id: string;
  label: string;
  kind: string;
  state: MissionDataFlowWorkbenchSourceState;
  detail: string;
  source: string;
  raw: unknown;
}

interface WorkbenchSelection {
  id: string;
  label: string;
  kind: string;
  state: MissionDataFlowWorkbenchSourceState | "preview" | "not-wired";
  source: string;
  detail: string;
  raw: unknown;
}

interface ScenarioRow {
  id: string;
  scenario: string;
  status: string;
  evidence: string;
  expectations: string;
  events: string;
  state: MissionDataFlowWorkbenchSourceState;
  source: string;
  detail: string;
  raw: unknown;
}

interface LegendItem {
  label: string;
  detail: string;
  state: "reported" | "not-reported" | "unavailable" | "preview" | "not-wired";
}

interface CoverageDisplayItem {
  id: string;
  label: string;
  value: string;
  detail: string;
  state: MissionDataFlowWorkbenchSourceState;
  raw: unknown;
}

type ArtifactCounts = Record<"docs" | "reports" | "logs" | "ground" | "runtime" | "unknown", number>;

const EMPTY_ARTIFACT_COUNTS: ArtifactCounts = {
  docs: 0,
  reports: 0,
  logs: 0,
  ground: 0,
  runtime: 0,
  unknown: 0,
};

export function MissionDataFlowWorkbenchSurface({
  snapshot,
}: {
  snapshot: MissionDataFlowWorkbenchSnapshot;
}) {
  const viewModel = useMemo(() => createWorkbenchViewModel(snapshot), [snapshot]);
  const [selectedItem, setSelectedItem] = useState<WorkbenchSelection | null>(null);
  const [drawerSelection, setDrawerSelection] = useState<WorkbenchSelection | null>(null);
  const [expandedScenario, setExpandedScenario] = useState<ScenarioRow | null>(null);
  const selection = selectedItem ?? viewModel.primarySelection;
  const relatedTraceabilityLinks = selection
    ? selectTraceabilityLinksForSelection(snapshot.traceability, selection)
    : [];
  const drawerTraceabilityLinks = drawerSelection
    ? selectTraceabilityLinksForSelection(snapshot.traceability, drawerSelection)
    : [];

  return (
    <section
      id="studio-data-flow-workbench"
      className="entry-section mission-data-flow-workbench mission-data-flow-cockpit"
      aria-label="Mission Data Flow Workbench"
    >
      <header className="mission-data-flow-cockpit-header">
        <div>
          <span className="cockpit-eyebrow">MISSION DATA FABRIC</span>
          <h2>Data Flow Workbench</h2>
          <p>
            Core-derived operational cockpit for relationships, scenario evidence,
            coverage and generated outputs.
          </p>
        </div>
        <div className="badge-row mission-data-flow-boundary-badges">
          <ProvenanceBadge label="READ-ONLY" />
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="NO INFERENCE" />
        </div>
      </header>

      <section className="mission-data-flow-kpi-strip" aria-label="Workbench KPI strip">
        {viewModel.kpis.map((kpi) => (
          <button
            className={`mission-data-flow-kpi mission-data-flow-state-${kpi.state}`}
            key={kpi.id}
            title={`${kpi.detail}. Navigation not wired in this step.`}
            type="button"
            disabled
          >
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <small>{kpi.detail}</small>
          </button>
        ))}
      </section>

      <MissionDataFlowWorkbenchSourceRail sources={viewModel.sourceItems} />

      <div className="mission-data-flow-main-grid">
        <section className="mission-data-flow-canvas-panel" aria-label="Core-derived canvas">
          <div className="mission-data-flow-canvas-title">
            <div>
              <span className="cockpit-eyebrow">Core route canvas</span>
              <h3>Mission Model to generated outputs</h3>
            </div>
            <StatusBadge label={`${snapshot.counts.traceabilityLinks} TRACE LINKS`} />
          </div>

          <div className="mission-data-flow-stage-grid">
            {viewModel.stages.map((stage) => (
              <article
                className={`mission-data-flow-stage mission-data-flow-stage-${stage.state}`}
                key={stage.id}
              >
                <header>
                  <span>{stage.index}</span>
                  <div>
                    <strong>{stage.title}</strong>
                    <small>{stage.subtitle}</small>
                  </div>
                </header>

                <div className="mission-data-flow-stage-items">
                  {stage.items.map((item) => (
                    <button
                      className={[
                        "mission-data-flow-stage-item",
                        `mission-data-flow-stage-item-${item.state}`,
                        item.selected ? "mission-data-flow-stage-item-selected" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      key={item.id}
                      type="button"
                      title={item.detail}
                      disabled={item.state === "not-wired"}
                      onClick={() => setSelectedItem(selectionFromStageItem(item))}
                    >
                      <span>{item.label}</span>
                      <strong>{item.kind}</strong>
                      <small>{item.meta}</small>
                    </button>
                  ))}
                </div>

                <footer>{stage.footer}</footer>
              </article>
            ))}
          </div>
        </section>

        <MissionDataFlowWorkbenchInspector
          selection={selection}
          relatedTraceabilityLinks={relatedTraceabilityLinks}
        />
      </div>

      <section className="mission-data-flow-bottom-deck" aria-label="Workbench bottom deck">
        <article className="mission-data-flow-deck-card">
          <header>
            <span className="cockpit-eyebrow">Scenario runs</span>
            <strong>{viewModel.scenarioRows.length} reported rows</strong>
          </header>
          <div className="mission-data-flow-scenario-table" role="table">
            <div className="mission-data-flow-scenario-row mission-data-flow-scenario-head" role="row">
              <span>Scenario</span>
              <span>Status</span>
              <span>Evidence</span>
              <span>Expectations</span>
              <span>Events</span>
            </div>
            {viewModel.scenarioRows.map((row) => (
              <button
                className={`mission-data-flow-scenario-row mission-data-flow-state-${row.state}`}
                key={row.id}
                type="button"
                onClick={() => {
                  setSelectedItem(selectionFromScenarioRow(row));
                  setExpandedScenario(row);
                }}
                role="row"
              >
                <span>{row.scenario}</span>
                <strong>{row.status}</strong>
                <span>{row.evidence}</span>
                <span>{row.expectations}</span>
                <span>{row.events}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="mission-data-flow-deck-card">
          <header>
            <span className="cockpit-eyebrow">Legend</span>
            <strong>UI semantics</strong>
          </header>
          <div className="mission-data-flow-legend-list">
            {viewModel.legendItems.map((item) => (
              <div className={`mission-data-flow-legend mission-data-flow-legend-${item.state}`} key={item.label}>
                <i aria-hidden="true" />
                <span>{item.label}</span>
                <small>{item.detail}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="mission-data-flow-deck-card mission-data-flow-path-card">
          <header>
            <span className="cockpit-eyebrow">Selected flow path</span>
            <strong>{viewModel.selectedPath.length > 0 ? "reported" : "not reported"}</strong>
          </header>
          {viewModel.selectedPath.length > 0 ? (
            <div className="mission-data-flow-path">
              {viewModel.selectedPath.map((node, index) => (
                <button
                  className="mission-data-flow-path-node"
                  key={node.id}
                  type="button"
                  title={node.detail}
                  onClick={() => {
                    const pathSelection = selectionFromPathNode(node);
                    setSelectedItem(pathSelection);
                    setDrawerSelection(pathSelection);
                  }}
                >
                  <span>{node.label}</span>
                  <strong>{node.kind}</strong>
                  {index < viewModel.selectedPath.length - 1 ? <i aria-hidden="true" /> : null}
                </button>
              ))}
            </div>
          ) : (
            <div className="mission-data-flow-empty">
              <strong>No data-flow path reported</strong>
              <span>Load Core simulation evidence to expose command, producer, data product, flow and contact records.</span>
            </div>
          )}
        </article>
      </section>

      {expandedScenario ? (
        <DataFlowWorkbenchScenarioTimeline
          scenario={expandedScenario}
          simulationReports={snapshot.simulationReports}
          onClose={() => setExpandedScenario(null)}
          onSelectDataFlowEvidence={(evidence) => {
            const evidenceSelection = selectionFromDataFlowEvidence(evidence);
            setSelectedItem(evidenceSelection);
            setDrawerSelection(evidenceSelection);
          }}
        />
      ) : null}

      {drawerSelection ? (
        <DataFlowWorkbenchContextDrawer
          selection={drawerSelection}
          selectedPath={viewModel.selectedPath}
          relatedTraceabilityLinks={drawerTraceabilityLinks}
          onClose={() => setDrawerSelection(null)}
          onSelectPathNode={(node) => {
            const pathSelection = selectionFromPathNode(node);
            setSelectedItem(pathSelection);
            setDrawerSelection(pathSelection);
          }}
        />
      ) : null}
    </section>
  );
}

function MissionDataFlowWorkbenchSourceRail({
  sources,
}: {
  sources: SourceRailItem[];
}) {
  return (
    <section className="mission-data-flow-source-rail" aria-label="Workbench source rail">
      <span className="mission-data-flow-source-rail-label">SOURCE READINESS</span>
      <div className="mission-data-flow-source-strip">
        {sources.map((source) => (
          <button
            className={`mission-data-flow-source-node mission-data-flow-source-${source.state}`}
            key={source.id}
            title={`${source.label}: ${source.detail}`}
            type="button"
            disabled
          >
            <i aria-hidden="true" />
            <span>{source.shortLabel}</span>
            <strong>{formatSourceState(source.state)}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

function MissionDataFlowWorkbenchInspector({
  selection,
  relatedTraceabilityLinks,
}: {
  selection: WorkbenchSelection | null;
  relatedTraceabilityLinks: MissionDataFlowTraceabilityLink[];
}) {
  const dataFlowEvidence = selection && isCoreSimulationDataFlowEvidenceRecord(selection.raw)
    ? selection.raw
    : null;

  return (
    <aside className="mission-data-flow-inspector" aria-label="Selected evidence inspector">
      <header>
        <span className="cockpit-eyebrow">Inspector</span>
        <strong>{selection?.label ?? "No selection"}</strong>
        <small>{selection?.kind ?? "Select a Core-reported item"}</small>
      </header>

      {selection ? (
        <>
          <div className="mission-data-flow-property-grid">
            <span>Identifier</span>
            <strong>{selection.id}</strong>
            <span>Type</span>
            <strong>{selection.kind}</strong>
            <span>Status</span>
            <strong>{selection.state}</strong>
            <span>Source</span>
            <strong>{selection.source}</strong>
          </div>

          <div className="mission-data-flow-inspector-note">
            <strong>Read-only detail</strong>
            <span>{selection.detail}</span>
          </div>

          {dataFlowEvidence ? (
            <div className="mission-data-flow-property-grid mission-data-flow-trace-grid">
              <span>producer</span>
              <strong>{dataFlowEvidence.producer ?? "not reported"}</strong>
              <span>producer type</span>
              <strong>{dataFlowEvidence.producer_type ?? "not reported"}</strong>
              <span>triggered by command</span>
              <strong>{dataFlowEvidence.triggered_by_command ?? "not reported"}</strong>
              <span>time</span>
              <strong>{formatTimeSeconds(dataFlowEvidence.t)}</strong>
              <span>storage intent</span>
              <strong>{readIntentField(dataFlowEvidence.storage_intent, "class")}</strong>
              <span>retention</span>
              <strong>{readIntentField(dataFlowEvidence.storage_intent, "retention")}</strong>
              <span>overflow policy</span>
              <strong>{readIntentField(dataFlowEvidence.storage_intent, "overflow_policy")}</strong>
              <span>downlink intent</span>
              <strong>{readIntentField(dataFlowEvidence.downlink_intent, "intent")}</strong>
              <span>policy</span>
              <strong>{readIntentField(dataFlowEvidence.downlink_intent, "policy")}</strong>
              <span>eligible flow</span>
              <strong>{formatStringList(dataFlowEvidence.eligible_downlink_flows, "not reported")}</strong>
              <span>contact window</span>
              <strong>{formatStringList(dataFlowEvidence.contact_windows, "not reported")}</strong>
            </div>
          ) : null}

          <section className="mission-data-flow-related-links">
            <header>
              <span className="cockpit-eyebrow">Related evidence</span>
              <strong>{relatedTraceabilityLinks.length}</strong>
            </header>
            {relatedTraceabilityLinks.slice(0, 4).map((link) => (
              <div className="mission-data-flow-related-link" key={link.id}>
                <span>{link.label}</span>
                <strong>{link.state}</strong>
                <small>{link.detail}</small>
              </div>
            ))}
            {relatedTraceabilityLinks.length === 0 ? (
              <div className="mission-data-flow-empty">
                <strong>No related links reported</strong>
                <span>Studio does not infer missing traceability.</span>
              </div>
            ) : null}
          </section>

          <pre className="raw-output-block mission-data-flow-raw-block">
            {formatWorkbenchRawValue(selection.raw)}
          </pre>
        </>
      ) : (
        <div className="mission-data-flow-empty">
          <strong>No reported evidence selected</strong>
          <span>Select a Core-reported item in the canvas or bottom deck.</span>
        </div>
      )}
    </aside>
  );
}

function createWorkbenchViewModel(
  snapshot: MissionDataFlowWorkbenchSnapshot,
): WorkbenchViewModel {
  const missionDomainRecords = recordsForLane(snapshot, "mission-domains");
  const relationshipRecords = recordsForLane(snapshot, "relationship-manifest");
  const scenarioEvidenceRecords = recordsForLane(snapshot, "scenario-data-flow-evidence");
  const validationRecords = recordsForLane(snapshot, "validation");
  const coverageRecords = recordsForLane(snapshot, "coverage");
  const generatedArtifactRecords = recordsForLane(snapshot, "generated-artifacts");

  const entityCount = deriveEntityCount(missionDomainRecords);
  const scenarioRunSummary =
    selectScenarioRunSummary(coverageRecords) ??
    snapshot.scenarioRunIndex?.summary ?? null;
  const lintSummary = selectLintSummary(validationRecords);
  const expectationCoverage = selectExpectationCoverage(coverageRecords);
  const artifactCounts = aggregateArtifactCounts(generatedArtifactRecords);
  const selectedPath = createSelectedFlowPath(scenarioEvidenceRecords);
  const coverageItems = createCoverageDisplayItems(coverageRecords, validationRecords);

  const stages: WorkbenchStage[] = [
    {
      id: "mission-domains",
      index: 1,
      title: "Mission Domains",
      subtitle: "Entity inventory",
      state: stateForRecords(missionDomainRecords),
      items: createMissionDomainItems(missionDomainRecords),
      footer: `${entityCount} entities reported`,
    },
    {
      id: "contract-links",
      index: 2,
      title: "Contract Links",
      subtitle: "Relationship manifest",
      state: stateForRecords(relationshipRecords),
      items: createRelationshipItems(relationshipRecords),
      footer: `${snapshot.counts.relationshipRecords} relationship records`,
    },
    {
      id: "scenario-evidence",
      index: 3,
      title: "Scenario Evidence",
      subtitle: "Core simulation reports",
      state: stateForRecords(scenarioEvidenceRecords),
      items: createScenarioEvidenceItems(scenarioEvidenceRecords),
      footer: scenarioRunSummary
        ? `${scenarioRunSummary.passed}/${scenarioRunSummary.total} scenario runs passed`
        : "scenario run index not reported",
    },
    {
      id: "coverage-validation",
      index: 4,
      title: "Coverage & Validation",
      subtitle: "Coverage summary and lint",
      state: coverageItems.some((item) => item.state === "reported")
        ? "reported"
        : stateForRecords(validationRecords),
      items: createCoverageStageItems(coverageItems),
      footer: lintSummary
        ? `${lintSummary.result}, ${lintSummary.errors} errors, ${lintSummary.warnings} warnings`
        : "lint summary not reported",
    },
    {
      id: "generated-outputs",
      index: 5,
      title: "Generated Outputs",
      subtitle: "Artifact inventory",
      state: stateForRecords(generatedArtifactRecords),
      items: createArtifactStageItems(generatedArtifactRecords, artifactCounts),
      footer: `${snapshot.counts.generatedArtifacts} artifacts discovered`,
    },
  ];

  const primarySelection =
    selectedPath.length > 0
      ? selectionFromPathNode(selectedPath[Math.min(2, selectedPath.length - 1)])
      : selectPrimaryRecordSelection(snapshot);

  return {
    kpis: [
      {
        id: "entities",
        label: "Entities",
        value: String(entityCount),
        detail: "Core entity index",
        state: entityCount > 0 ? "reported" : "not-reported",
      },
      {
        id: "relationship-types",
        label: "Relationship types",
        value: String(snapshot.counts.relationshipTypes),
        detail: "relationship_manifest.json",
        state: snapshot.counts.relationshipTypes > 0 ? "reported" : "not-reported",
      },
      {
        id: "relationships",
        label: "Relationships",
        value: String(snapshot.counts.relationshipRecords),
        detail: "relationship records",
        state: snapshot.counts.relationshipRecords > 0 ? "reported" : "not-reported",
      },
      {
        id: "scenarios",
        label: "Scenarios",
        value: scenarioRunSummary
          ? `${scenarioRunSummary.passed} / ${scenarioRunSummary.total} passed`
          : "not reported",
        detail: "coverage summary",
        state: scenarioRunSummary ? "reported" : "not-reported",
      },
      {
        id: "lint",
        label: "Lint",
        value: lintSummary?.result ?? "not reported",
        detail: lintSummary
          ? `${lintSummary.errors} errors, ${lintSummary.warnings} warnings`
          : "lint report unavailable",
        state: lintSummary ? "reported" : "not-reported",
      },
      {
        id: "expectations",
        label: "Expectations",
        value: expectationCoverage
          ? `${expectationCoverage.passed} / ${expectationCoverage.total} passed`
          : "not reported",
        detail: expectationCoverage ? "expectation coverage" : "coverage summary unavailable",
        state: expectationCoverage ? "reported" : "not-reported",
      },
    ],
    sourceItems: createSourceItems(snapshot.sources),
    stages,
    scenarioRows: createScenarioRows(
      scenarioEvidenceRecords,
      scenarioRunSummary,
      expectationCoverage,
      snapshot.scenarioRunIndex,
    ),
    legendItems: createLegendItems(),
    selectedPath,
    primarySelection,
    artifactCounts,
    coverageItems,
  };
}

function createSourceItems(
  sources: MissionDataFlowWorkbenchSourceSummary[],
): SourceRailItem[] {
  const order = [
    "core-model-summary",
    "core-entity-index",
    "core-relationship-manifest",
    "core-dashboard-summary",
    "core-lint-report",
    "core-simulation-report",
    "core-coverage-summary",
    "generated-artifact-inventory",
  ];

  return order.map((id) => {
    const source = sources.find((candidate) => candidate.id === id);

    return {
      id,
      label: source?.label ?? id,
      shortLabel: formatSourceShortLabel(id),
      state: source?.state ?? "not-reported",
      detail: source?.detail ?? "not reported",
    };
  });
}

function createMissionDomainItems(
  records: MissionDataFlowWorkbenchRecord[],
): WorkbenchStageItem[] {
  const preferredDomains = ["payloads", "subsystems", "commands", "data_products"];
  const preferredRecords = preferredDomains
    .map((domainId) => records.find((record) => getDomainId(record.raw, record.label) === domainId))
    .filter((record): record is MissionDataFlowWorkbenchRecord => Boolean(record));
  const displayedRecords = preferredRecords.length > 0 ? preferredRecords : records.slice(0, 4);

  return displayedRecords.map((record) => ({
    id: record.id,
    label: record.label,
    kind: record.kind,
    meta: `${deriveDomainCount(record)} entities`,
    state: record.state,
    source: record.provenance,
    detail: record.detail,
    raw: record.raw,
  }));
}

function createRelationshipItems(
  records: MissionDataFlowWorkbenchRecord[],
): WorkbenchStageItem[] {
  const relationshipTypes = records
    .filter((record) => record.kind === "relationship-type")
    .sort(compareRelationshipTypeRecords);
  const relationshipRecordCount = records.filter(
    (record) => record.kind === "relationship-record",
  ).length;

  const items = relationshipTypes.slice(0, 3).map((record) => {
    const relationshipType = isCoreRelationshipType(record.raw) ? record.raw : null;

    return {
      id: record.id,
      label: relationshipType?.relationship_type ?? record.label,
      kind: "relationship",
      meta: relationshipType ? `${relationshipType.relationship_count} records` : record.detail,
      state: record.state,
      source: record.provenance,
      detail: record.detail,
      raw: record.raw,
    };
  });

  const hidden = Math.max(0, relationshipTypes.length - items.length);

  if (hidden > 0) {
    items.push({
      id: "relationship-types:hidden",
      label: `+${hidden} more relationship types`,
      kind: "reported",
      meta: `${relationshipRecordCount} records total`,
      state: "reported",
      source: "core-relationship-manifest",
      detail: "Additional Core-reported relationship types are available in the manifest.",
      raw: { hidden_relationship_types: hidden, relationship_records: relationshipRecordCount },
    });
  }

  return items;
}

function createScenarioEvidenceItems(
  records: MissionDataFlowWorkbenchRecord[],
): WorkbenchStageItem[] {
  if (records.length === 0) {
    return [
      {
        id: "scenario-evidence:not-reported",
        label: "No data-flow evidence",
        kind: "not reported",
        meta: "SIM",
        state: "not-reported",
        source: "core-simulation-report",
        detail: "Core simulation report has not exposed data-flow evidence.",
        raw: null,
      },
    ];
  }

  return records.slice(0, 4).map((record) => {
    const evidence = isCoreSimulationDataFlowEvidenceRecord(record.raw) ? record.raw : null;

    return {
      id: record.id,
      label: record.label,
      kind: "data-flow evidence",
      meta: evidence ? `t=${formatTimeSeconds(evidence.t)}` : record.detail,
      state: record.state,
      source: record.provenance,
      detail: record.detail,
      raw: record.raw,
      selected: Boolean(evidence?.data_product_id),
    };
  });
}

function createCoverageDisplayItems(
  coverageRecords: MissionDataFlowWorkbenchRecord[],
  validationRecords: MissionDataFlowWorkbenchRecord[],
): CoverageDisplayItem[] {
  const commands = selectEntityCoverageRecord(coverageRecords, "commands");
  const dataProducts = selectEntityCoverageRecord(coverageRecords, "data_products");
  const events = selectEntityCoverageRecord(coverageRecords, "events");
  const expectations = coverageRecords.find((record) => record.id === "coverage:expectations:summary");
  const validation = validationRecords.find((record) => record.kind === "validation-summary");

  return [
    coverageItemFromRecord("commands", "Commands", commands),
    coverageItemFromRecord("data-products", "Data products", dataProducts),
    coverageItemFromRecord("events", "Events", events),
    expectationItemFromRecord(expectations),
    validation
      ? {
          id: validation.id,
          label: "Validation",
          value: deriveValidationResult(validation),
          detail: validation.detail,
          state: validation.state,
          raw: validation.raw,
        }
      : {
          id: "validation:not-reported",
          label: "Validation",
          value: "not reported",
          detail: "No lint or validation summary is available.",
          state: "not-reported",
          raw: null,
        },
  ];
}

function createCoverageStageItems(items: CoverageDisplayItem[]): WorkbenchStageItem[] {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    kind: item.value,
    meta: item.state === "reported" ? "Core-derived" : "not reported",
    state: item.state,
    source: "core-coverage-summary",
    detail: item.detail,
    raw: item.raw,
  }));
}

function createArtifactStageItems(
  artifactRecords: MissionDataFlowWorkbenchRecord[],
  counts: ArtifactCounts,
): WorkbenchStageItem[] {
  const classItems: Array<{ label: string; key: keyof ArtifactCounts }> = [
    { label: "Docs", key: "docs" },
    { label: "Reports", key: "reports" },
    { label: "Logs", key: "logs" },
    { label: "Ground", key: "ground" },
    { label: "Runtime", key: "runtime" },
  ];

  if (artifactRecords.length === 0) {
    return [
      {
        id: "artifacts:not-loaded",
        label: "Artifact inventory",
        kind: "not loaded",
        meta: "ART",
        state: "not-reported",
        source: "generated-artifact-inventory",
        detail: "No generated artifact inventory has been loaded.",
        raw: null,
      },
    ];
  }

  return classItems.map(({ label, key }) => ({
    id: `artifact-class:${key}`,
    label,
    kind: "artifact class",
    meta: String(counts[key]),
    state: counts[key] > 0 ? "reported" : "not-reported",
    source: "generated-artifact-inventory",
    detail: `${counts[key]} ${key} artifacts reported by the inventory.`,
    raw: { artifact_class: key, count: counts[key] },
  }));
}

function createScenarioRows(
  scenarioEvidenceRecords: MissionDataFlowWorkbenchRecord[],
  scenarioRunSummary: CoreScenarioRunIndexSummary | null,
  expectationCoverage: CoreExpectationCoverage | null,
  scenarioRunIndex: CoreScenarioRunIndex | null,
): ScenarioRow[] {
  if (scenarioRunIndex?.runs.length) {
    return scenarioRunIndex.runs.map((run, index) => ({
      id: `scenario-run-index:${index}:${run.scenario}`,
      scenario: run.scenario,
      status: run.result,
      evidence: run.report_file,
      expectations: formatRunExpectationSummary(run),
      events: formatRunSummaryNumber(run, "events", "not reported"),
      state: "reported",
      source: "core-scenario-run-index",
      detail: `${run.result}, report ${run.report_file}`,
      raw: run,
    }));
  }

  const rows: ScenarioRow[] = [];

  if (scenarioRunSummary) {
    rows.push({
      id: "scenario-runs:summary",
      scenario: "scenario run index",
      status: `${scenarioRunSummary.passed}/${scenarioRunSummary.total} passed`,
      evidence: "reported",
      expectations: expectationCoverage
        ? `${expectationCoverage.passed}/${expectationCoverage.total}`
        : "not reported",
      events: "not reported",
      state: "reported",
      source: "core-coverage-summary",
      detail: `${scenarioRunSummary.passed}/${scenarioRunSummary.total} scenario runs passed`,
      raw: scenarioRunSummary,
    });
  }

  for (const record of scenarioEvidenceRecords.slice(0, 4)) {
    const evidence = isCoreSimulationDataFlowEvidenceRecord(record.raw) ? record.raw : null;

    rows.push({
      id: record.id,
      scenario: "selected simulation report",
      status: record.state,
      evidence: evidence?.data_product_id ?? record.label,
      expectations: "not reported by record",
      events: evidence ? `t=${formatTimeSeconds(evidence.t)}` : "not reported",
      state: record.state,
      source: record.provenance,
      detail: record.detail,
      raw: record.raw,
    });
  }

  if (rows.length === 0) {
    rows.push({
      id: "scenario-runs:not-reported",
      scenario: "not reported",
      status: "not reported",
      evidence: "not reported",
      expectations: "not reported",
      events: "not reported",
      state: "not-reported",
      source: "core-scenario-run-index",
      detail: "No Core scenario run index or simulation evidence has been reported.",
      raw: null,
    });
  }

  return rows;
}

function formatRunExpectationSummary(run: CoreScenarioRunRecord): string {
  const total = run.summary.expectations;
  const passed = run.summary.passed_expectations;

  if (typeof total === "number" && typeof passed === "number") {
    return `${passed}/${total}`;
  }

  if (typeof total === "number") {
    return `0/${total}`;
  }

  return "not reported";
}

function formatRunSummaryNumber(
  run: CoreScenarioRunRecord,
  key: string,
  fallback: string,
): string {
  const value = run.summary[key];

  return typeof value === "number" ? String(value) : fallback;
}

function createSelectedFlowPath(
  scenarioEvidenceRecords: MissionDataFlowWorkbenchRecord[],
): WorkbenchPathNode[] {
  const evidenceRecord = scenarioEvidenceRecords
    .map((record) => record.raw)
    .find(isCoreSimulationDataFlowEvidenceRecord);

  if (!evidenceRecord) {
    return [];
  }

  const nodes: WorkbenchPathNode[] = [];

  if (evidenceRecord.triggered_by_command) {
    nodes.push({
      id: `path:command:${evidenceRecord.triggered_by_command}`,
      label: evidenceRecord.triggered_by_command,
      kind: "Command",
      state: "reported",
      detail: "Command reported by Core simulation data-flow evidence.",
      source: "core-simulation-report",
      raw: evidenceRecord,
    });
  }

  if (evidenceRecord.producer) {
    nodes.push({
      id: `path:producer:${evidenceRecord.producer}`,
      label: evidenceRecord.producer,
      kind: `Producer${evidenceRecord.producer_type ? ` (${evidenceRecord.producer_type})` : ""}`,
      state: "reported",
      detail: "Producer reported by Core simulation data-flow evidence.",
      source: "core-simulation-report",
      raw: evidenceRecord,
    });
  }

  if (evidenceRecord.data_product_id) {
    nodes.push({
      id: `path:data-product:${evidenceRecord.data_product_id}`,
      label: evidenceRecord.data_product_id,
      kind: "Data product",
      state: "reported",
      detail: "Data product reported by Core simulation data-flow evidence.",
      source: "core-simulation-report",
      raw: evidenceRecord,
    });
  }

  const downlinkFlow = evidenceRecord.eligible_downlink_flows?.[0];

  if (downlinkFlow) {
    nodes.push({
      id: `path:downlink-flow:${downlinkFlow}`,
      label: downlinkFlow,
      kind: "Downlink flow",
      state: "reported",
      detail: "Eligible downlink flow reported by Core simulation data-flow evidence.",
      source: "core-simulation-report",
      raw: evidenceRecord,
    });
  }

  const contactWindow = evidenceRecord.contact_windows?.[0];

  if (contactWindow) {
    nodes.push({
      id: `path:contact-window:${contactWindow}`,
      label: contactWindow,
      kind: "Contact window",
      state: "reported",
      detail: "Contact window reported by Core simulation data-flow evidence.",
      source: "core-simulation-report",
      raw: evidenceRecord,
    });
  }

  return nodes;
}

function createLegendItems(): LegendItem[] {
  return [
    {
      label: "Reported",
      detail: "Data present in Core reports or artifact inventory.",
      state: "reported",
    },
    {
      label: "Not reported",
      detail: "Expected surface field not present in loaded Core evidence.",
      state: "not-reported",
    },
    {
      label: "Unavailable",
      detail: "Not exposed by the loaded Core source.",
      state: "unavailable",
    },
    {
      label: "Preview",
      detail: "Visual shell only, not a generated value.",
      state: "preview",
    },
    {
      label: "Not wired",
      detail: "Control intentionally disabled in this step.",
      state: "not-wired",
    },
  ];
}

function recordsForLane(
  snapshot: MissionDataFlowWorkbenchSnapshot,
  laneId: MissionDataFlowWorkbenchLane["id"],
): MissionDataFlowWorkbenchRecord[] {
  return snapshot.lanes.find((lane) => lane.id === laneId)?.records ?? [];
}

function stateForRecords(
  records: MissionDataFlowWorkbenchRecord[],
): MissionDataFlowWorkbenchSourceState {
  if (records.some((record) => record.state === "reported")) {
    return "reported";
  }

  if (records.some((record) => record.state === "unavailable")) {
    return "unavailable";
  }

  return "not-reported";
}

function deriveEntityCount(records: MissionDataFlowWorkbenchRecord[]): number {
  return records.reduce((total, record) => total + deriveDomainCount(record), 0);
}

function deriveDomainCount(record: MissionDataFlowWorkbenchRecord): number {
  const raw = asObject(record.raw);
  const entityCount = readNumber(raw, "entity_count");
  const count = readNumber(raw, "count");
  const modelCount = readNumber(raw, "model_count");

  return entityCount ?? count ?? modelCount ?? 0;
}

function getDomainId(rawValue: unknown, fallback: string): string {
  const raw = asObject(rawValue);
  const id = readString(raw, "id");

  return normalizeIdentifier(id ?? fallback);
}

function deriveValidationResult(record: MissionDataFlowWorkbenchRecord): string {
  const raw = asObject(record.raw);
  const result = readString(raw, "result");

  return result ?? record.label.replace(/^.*validation\s+/i, "");
}

function selectScenarioRunSummary(
  coverageRecords: MissionDataFlowWorkbenchRecord[],
): CoreScenarioRunIndexSummary | null {
  const record = coverageRecords.find((candidate) => candidate.id === "coverage:scenario-runs");

  return isCoreScenarioRunIndexSummary(record?.raw) ? record.raw : null;
}

function selectLintSummary(records: MissionDataFlowWorkbenchRecord[]): {
  result: string;
  errors: number;
  warnings: number;
} | null {
  const record = records.find((candidate) => candidate.kind === "validation-summary");

  if (!record) {
    return null;
  }

  const raw = asObject(record.raw);
  const result = readString(raw, "result") ?? record.label;
  const summary = asObject(raw?.summary);
  const errors = readNumber(summary, "errors") ?? readNumber(raw, "errors") ?? 0;
  const warnings = readNumber(summary, "warnings") ?? readNumber(raw, "warnings") ?? 0;

  return { result, errors, warnings };
}

function selectExpectationCoverage(
  coverageRecords: MissionDataFlowWorkbenchRecord[],
): CoreExpectationCoverage | null {
  const record = coverageRecords.find((candidate) => candidate.id === "coverage:expectations:summary");

  return isCoreExpectationCoverage(record?.raw) ? record.raw : null;
}

function selectEntityCoverageRecord(
  coverageRecords: MissionDataFlowWorkbenchRecord[],
  domain: string,
): MissionDataFlowWorkbenchRecord | null {
  const normalizedDomain = normalizeIdentifier(domain);

  return (
    coverageRecords.find((record) => {
      const normalizedId = normalizeIdentifier(record.id);
      const normalizedLabel = normalizeIdentifier(record.label);

      return (
        normalizedId === `coverage_entity_${normalizedDomain}` ||
        normalizedId.endsWith(`_${normalizedDomain}`) ||
        normalizedLabel === normalizedDomain
      );
    }) ?? null
  );
}

function coverageItemFromRecord(
  id: string,
  label: string,
  record: MissionDataFlowWorkbenchRecord | null,
): CoverageDisplayItem {
  if (record && isCoreCoverageRecord(record.raw)) {
    return {
      id: record.id,
      label,
      value: `${record.raw.covered} / ${record.raw.total}`,
      detail: `${record.raw.uncovered} uncovered`,
      state: record.state,
      raw: record.raw,
    };
  }

  return {
    id: `coverage:${id}:not-reported`,
    label,
    value: "not reported",
    detail: "Coverage scope is not present in the loaded coverage summary.",
    state: "not-reported",
    raw: null,
  };
}

function expectationItemFromRecord(
  record: MissionDataFlowWorkbenchRecord | undefined,
): CoverageDisplayItem {
  if (record && isCoreExpectationCoverage(record.raw)) {
    return {
      id: record.id,
      label: "Expectations",
      value: `${record.raw.passed} / ${record.raw.total}`,
      detail: `${record.raw.failed} failed`,
      state: record.state,
      raw: record.raw,
    };
  }

  return {
    id: "coverage:expectations:not-reported",
    label: "Expectations",
    value: "not reported",
    detail: "Expectation coverage is not present in the loaded coverage summary.",
    state: "not-reported",
    raw: null,
  };
}

function aggregateArtifactCounts(
  records: MissionDataFlowWorkbenchRecord[],
): ArtifactCounts {
  const counts: ArtifactCounts = { ...EMPTY_ARTIFACT_COUNTS };

  for (const record of records) {
    if (!isGeneratedArtifactEntry(record.raw)) {
      continue;
    }

    const key = normalizeArtifactClass(record.raw.artifact_class);
    counts[key] += 1;
  }

  return counts;
}

function compareRelationshipTypeRecords(
  left: MissionDataFlowWorkbenchRecord,
  right: MissionDataFlowWorkbenchRecord,
): number {
  const preferred = [
    "command_targets_subsystem",
    "data_product_produced_by_payload",
    "downlink_flow_includes_data_product",
  ];
  const leftType = isCoreRelationshipType(left.raw) ? left.raw.relationship_type : left.label;
  const rightType = isCoreRelationshipType(right.raw) ? right.raw.relationship_type : right.label;
  const leftPreferred = preferred.indexOf(leftType);
  const rightPreferred = preferred.indexOf(rightType);

  if (leftPreferred !== -1 || rightPreferred !== -1) {
    return (leftPreferred === -1 ? 999 : leftPreferred) - (rightPreferred === -1 ? 999 : rightPreferred);
  }

  const leftCount = isCoreRelationshipType(left.raw) ? left.raw.relationship_count : 0;
  const rightCount = isCoreRelationshipType(right.raw) ? right.raw.relationship_count : 0;

  return rightCount - leftCount;
}

function selectionFromStageItem(item: WorkbenchStageItem): WorkbenchSelection {
  return {
    id: item.id,
    label: item.label,
    kind: item.kind,
    state: item.state,
    source: item.source,
    detail: item.detail,
    raw: item.raw,
  };
}

function selectionFromPathNode(node: WorkbenchPathNode): WorkbenchSelection {
  return {
    id: node.id,
    label: node.label,
    kind: node.kind,
    state: node.state,
    source: node.source,
    detail: node.detail,
    raw: node.raw,
  };
}

function selectionFromScenarioRow(row: ScenarioRow): WorkbenchSelection {
  return {
    id: row.id,
    label: row.scenario,
    kind: "scenario evidence",
    state: row.state,
    source: row.source,
    detail: row.detail,
    raw: row.raw,
  };
}

function selectionFromDataFlowEvidence(
  evidence: CoreSimulationDataFlowEvidenceRecord,
): WorkbenchSelection {
  return {
    id: `timeline:data-flow:${evidence.t}:${evidence.data_product_id ?? "unknown"}`,
    label: evidence.data_product_id ?? "data-flow evidence",
    kind: "data-flow evidence",
    state: "reported",
    source: "core-simulation-report",
    detail: `${evidence.data_product_id ?? "Data-flow evidence"} produced by ${evidence.producer ?? "not reported"}`,
    raw: evidence,
  };
}

function selectPrimaryRecordSelection(
  snapshot: MissionDataFlowWorkbenchSnapshot,
): WorkbenchSelection | null {
  const candidate =
    recordsForLane(snapshot, "scenario-data-flow-evidence")[0] ??
    recordsForLane(snapshot, "relationship-manifest").find(
      (record) => record.kind === "relationship-record",
    ) ??
    recordsForLane(snapshot, "mission-domains")[0] ??
    null;

  return candidate
    ? {
        id: candidate.id,
        label: candidate.label,
        kind: candidate.kind,
        state: candidate.state,
        source: candidate.provenance,
        detail: candidate.detail,
        raw: candidate.raw,
      }
    : null;
}

function selectTraceabilityLinksForSelection(
  traceability: MissionDataFlowTraceabilitySummary,
  selection: WorkbenchSelection,
): MissionDataFlowTraceabilityLink[] {
  const keys = createSelectionKeys(selection);

  return traceability.groups
    .flatMap((group) => group.links)
    .filter((link) => traceabilityLinkMatchesSelection(link, keys));
}

function createSelectionKeys(selection: WorkbenchSelection): Set<string> {
  const keys = new Set<string>();

  addKey(keys, selection.id);
  addKey(keys, selection.label);

  if (isCoreRelationshipRecord(selection.raw)) {
    addKey(keys, selection.raw.relationship_id);
    addKey(keys, `relationship:${selection.raw.relationship_id}`);
    addEndpointKeys(keys, selection.raw.from.domain, selection.raw.from.id);
    addEndpointKeys(keys, selection.raw.to.domain, selection.raw.to.id);
  }

  if (isCoreSimulationDataFlowEvidenceRecord(selection.raw)) {
    addKey(keys, selection.raw.data_product_id);
    addKey(keys, selection.raw.producer);
    addKey(keys, selection.raw.triggered_by_command);
    selection.raw.eligible_downlink_flows?.forEach((value) => addKey(keys, value));
    selection.raw.contact_windows?.forEach((value) => addKey(keys, value));
  }

  if (selection.id.startsWith("path:")) {
    addKey(keys, selection.label);
  }

  return keys;
}

function traceabilityLinkMatchesSelection(
  link: MissionDataFlowTraceabilityLink,
  keys: Set<string>,
): boolean {
  return (
    keys.has(link.id) ||
    keys.has(link.label) ||
    endpointMatchesSelection(link.from, keys) ||
    endpointMatchesSelection(link.to, keys)
  );
}

function endpointMatchesSelection(
  endpoint: MissionDataFlowTraceabilityLink["from"],
  keys: Set<string>,
): boolean {
  return (
    keys.has(endpoint.label) ||
    Boolean(endpoint.id && keys.has(endpoint.id)) ||
    Boolean(endpoint.recordId && keys.has(endpoint.recordId)) ||
    Boolean(endpoint.domain && endpoint.id && keys.has(`${endpoint.domain}:${endpoint.id}`))
  );
}

function addEndpointKeys(keys: Set<string>, domain: string, id: string) {
  addKey(keys, id);
  addKey(keys, `${domain}:${id}`);
}

function addKey(keys: Set<string>, value: string | null | undefined) {
  if (value && value.trim().length > 0) {
    keys.add(value);
  }
}

function formatSourceShortLabel(id: string): string {
  switch (id) {
    case "core-model-summary":
      return "MODEL";
    case "core-entity-index":
      return "INDEX";
    case "core-relationship-manifest":
      return "REL";
    case "core-dashboard-summary":
      return "DASH";
    case "core-lint-report":
      return "LINT";
    case "core-simulation-report":
      return "SIM";
    case "core-coverage-summary":
      return "COV";
    case "generated-artifact-inventory":
      return "ART";
    default:
      return "SRC";
  }
}

function formatSourceState(
  state: SourceRailItem["state"],
): string {
  if (state === "reported") {
    return "ON";
  }

  if (state === "preview") {
    return "PREVIEW";
  }

  if (state === "not-wired") {
    return "N/W";
  }

  if (state === "unavailable") {
    return "N/A";
  }

  return "N/R";
}

function formatTimeSeconds(value: number): string {
  return `${value} s`;
}

function formatStringList(values: string[] | undefined, fallback: string): string {
  if (!values || values.length === 0) {
    return fallback;
  }

  return values.join(", ");
}

function readIntentField(value: unknown, key: string): string {
  const raw = asObject(value);
  const result = readString(raw, key) ?? readNumber(raw, key);

  if (result === null || result === undefined) {
    return "not reported";
  }

  return String(result);
}

function formatWorkbenchRawValue(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase().replace(/[\s:-]+/g, "_").replace(/-/g, "_");
}

function normalizeArtifactClass(value: GeneratedArtifactClass): keyof ArtifactCounts {
  if (
    value === "docs" ||
    value === "reports" ||
    value === "logs" ||
    value === "ground" ||
    value === "runtime"
  ) {
    return value;
  }

  return "unknown";
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(
  value: Record<string, unknown> | null,
  key: string,
): string | null {
  const result = value?.[key];

  return typeof result === "string" ? result : null;
}

function readNumber(
  value: Record<string, unknown> | null,
  key: string,
): number | null {
  const result = value?.[key];

  return typeof result === "number" ? result : null;
}

function isCoreRelationshipType(value: unknown): value is CoreRelationshipType {
  const candidate = asObject(value);

  return Boolean(
    candidate &&
      typeof candidate.relationship_type === "string" &&
      typeof candidate.relationship_count === "number",
  );
}

function isCoreRelationshipRecord(value: unknown): value is CoreRelationshipRecord {
  const candidate = asObject(value);
  const from = asObject(candidate?.from);
  const to = asObject(candidate?.to);

  return Boolean(
    candidate &&
      typeof candidate.relationship_id === "string" &&
      typeof candidate.relationship_type === "string" &&
      from &&
      typeof from.domain === "string" &&
      typeof from.id === "string" &&
      to &&
      typeof to.domain === "string" &&
      typeof to.id === "string",
  );
}

function isCoreCoverageRecord(value: unknown): value is CoreCoverageRecord {
  const candidate = asObject(value);

  return Boolean(
    candidate &&
      typeof candidate.total === "number" &&
      typeof candidate.covered === "number" &&
      typeof candidate.uncovered === "number",
  );
}

function isCoreExpectationCoverage(value: unknown): value is CoreExpectationCoverage {
  const candidate = asObject(value);

  return Boolean(
    candidate &&
      typeof candidate.total === "number" &&
      typeof candidate.passed === "number" &&
      typeof candidate.failed === "number",
  );
}

function isCoreScenarioRunIndexSummary(value: unknown): value is CoreScenarioRunIndexSummary {
  const candidate = asObject(value);

  return Boolean(
    candidate &&
      typeof candidate.total === "number" &&
      typeof candidate.passed === "number" &&
      typeof candidate.failed === "number",
  );
}

function isGeneratedArtifactEntry(value: unknown): value is GeneratedArtifactEntry {
  const candidate = asObject(value);

  return Boolean(
    candidate &&
      typeof candidate.name === "string" &&
      typeof candidate.relative_path === "string" &&
      typeof candidate.artifact_class === "string",
  );
}

function isCoreSimulationDataFlowEvidenceRecord(
  value: unknown,
): value is CoreSimulationDataFlowEvidenceRecord {
  const candidate = asObject(value);

  return Boolean(candidate && typeof candidate.t === "number");
}

function isCoreSimulationReport(value: unknown): value is CoreSimulationReport {
  const candidate = asObject(value);

  return Boolean(
    candidate &&
      typeof candidate.scenario === "string" &&
      Array.isArray(candidate.timeline) &&
      Array.isArray(candidate.commands) &&
      Array.isArray(candidate.events),
  );
}
void isCoreSimulationReport;
