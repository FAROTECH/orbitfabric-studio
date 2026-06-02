import { useEffect, useMemo, useState } from "react";

import { ProvenanceBadge, StatusBadge } from "./Badges";
import { type GeneratedArtifactDashboardSummary } from "./GeneratedArtifactExplorer";
import type { ActiveSurface } from "./navigationModel";
import {
  parseCoreCoverageSummary,
  parseCoreDashboardSummary,
  parseCoreEntityIndex,
  parseCoreLintReport,
  parseCoreModelSummary,
  parseCoreRelationshipManifest,
  parseCoreScenarioRunIndex,
  parseCoreSimulationReport,
} from "./coreReports";
import {
  createMissionContentViewModel,
  type MissionContentDataProductGroup,
  type MissionContentEntityGroup,
  type MissionContentGeneratedArtifacts,
  type MissionContentScenarioGroup,
  type MissionContentViewModel,
  type MissionContentWarning,
} from "./missionContentViewModel";
import type {
  CoreCommandResult,
  CoreRelationshipManifest,
  WorkspaceInspection,
} from "./types/workspace";
import type { CoreReportSnapshots } from "./missionCockpitModel";

export function MissionCockpit({
  workspace,
  coreResult,
  coreReportSnapshots,
  generatedArtifactSummary,
  onActiveSurfaceChange,
}: {
  workspace: WorkspaceInspection | null;
  coreResult: CoreCommandResult | null;
  coreReportSnapshots: CoreReportSnapshots;
  generatedArtifactSummary: GeneratedArtifactDashboardSummary | null;
  onActiveSurfaceChange: (surface: ActiveSurface) => void;
}) {
  const currentReportContent = coreResult?.json_report_content ?? null;
  const currentRelationshipManifest = useMemo(
    () => parseCoreRelationshipManifest(currentReportContent),
    [currentReportContent],
  );
  const [relationshipManifestSnapshot, setRelationshipManifestSnapshot] =
    useState<CoreRelationshipManifest | null>(null);

  useEffect(() => {
    setRelationshipManifestSnapshot(null);
  }, [workspace?.selected_path]);

  useEffect(() => {
    if (currentRelationshipManifest) {
      setRelationshipManifestSnapshot(currentRelationshipManifest);
    }
  }, [currentRelationshipManifest]);

  const lintReport =
    parseCoreLintReport(currentReportContent) ?? coreReportSnapshots.lintReport;
  const modelSummary =
    parseCoreModelSummary(currentReportContent) ?? coreReportSnapshots.modelSummary;
  const entityIndex =
    parseCoreEntityIndex(currentReportContent) ?? coreReportSnapshots.entityIndex;
  const relationshipManifest = currentRelationshipManifest ?? relationshipManifestSnapshot;
  const dashboardSummary =
    parseCoreDashboardSummary(currentReportContent) ?? coreReportSnapshots.dashboardSummary;
  const scenarioRunIndex =
    parseCoreScenarioRunIndex(currentReportContent) ?? coreReportSnapshots.scenarioRunIndex;
  const coverageSummary =
    parseCoreCoverageSummary(currentReportContent) ?? coreReportSnapshots.coverageSummary;
  const simulationReport =
    parseCoreSimulationReport(currentReportContent) ?? coreReportSnapshots.simulationReport;

  const effectiveCoreReportSnapshots: CoreReportSnapshots = {
    lintReport,
    modelSummary,
    entityIndex,
    dashboardSummary,
    scenarioRunIndex,
    coverageSummary,
    simulationReport,
  };

  const missionContent = createMissionContentViewModel({
    workspace,
    snapshots: effectiveCoreReportSnapshots,
    relationshipManifest,
    generatedArtifactSummary,
  });

  return (
    <section
      id="studio-dashboard"
      className="workspace-dashboard cockpit-dashboard cockpit-instrument-panel mission-content-cockpit"
      aria-label="Mission content cockpit"
    >
      <MissionContentHero model={missionContent} />

      <section className="mission-content-summary-grid" aria-label="Mission content summary">
        <EntitySummaryCard
          title="Spacecraft"
          group={missionContent.spacecraft}
          actionLabel="Open spacecraft"
          onOpen={() => onActiveSurfaceChange("model-inventory")}
        />
        <EntitySummaryCard
          title="Payloads"
          group={missionContent.payloads}
          actionLabel="Open payloads"
          onOpen={() => onActiveSurfaceChange("model-inventory")}
        />
        <DataProductsCard
          dataProducts={missionContent.dataProducts}
          onOpen={() => onActiveSurfaceChange("model-inventory")}
        />
        <ScenariosCard
          scenarios={missionContent.scenarios}
          onOpen={() => onActiveSurfaceChange("scenario-evidence")}
        />
      </section>

      <section className="mission-content-work-grid" aria-label="Mission content workbench cards">
        <GeneratedArtifactsCard
          artifacts={missionContent.generatedArtifacts}
          onOpen={() => onActiveSurfaceChange("generated-artifacts")}
        />
        <MissionContentWarnings warnings={missionContent.warnings} />
        <MissionContentEvidence model={missionContent} />
      </section>
    </section>
  );
}

function MissionContentHero({ model }: { model: MissionContentViewModel }) {
  const warningCount = model.warnings.length;
  const criticalCount = model.warnings.filter((warning) => warning.severity === "critical").length;

  return (
    <header className="mission-content-hero" aria-label="Mission identity">
      <div className="mission-content-hero-copy">
        <span className="cockpit-eyebrow">Mission Cockpit</span>
        <h2>{model.mission.name}</h2>
        <p>
          {model.mission.id} · model {model.mission.modelVersion} · workspace {model.mission.workspaceName}
        </p>
      </div>
      <div className="mission-content-hero-posture" aria-label="Mission cockpit posture">
        <StatusBadge label={criticalCount > 0 ? "ACTION" : warningCount > 0 ? "WARNINGS" : "READY"} />
        <ProvenanceBadge label="MISSION CONTENT FIRST" />
        <ProvenanceBadge label="CORE-DERIVED" />
        <ProvenanceBadge label="READ-ONLY" />
      </div>
    </header>
  );
}

function EntitySummaryCard({
  title,
  group,
  actionLabel,
  onOpen,
}: {
  title: string;
  group: MissionContentEntityGroup;
  actionLabel: string;
  onOpen: () => void;
}) {
  return (
    <article className="mission-content-card" aria-label={title}>
      <MissionContentCardHeader title={title} value={formatOptionalCount(group.count)} source={group.source} />
      <MissionContentEntityList group={group} />
      <button type="button" className="mission-content-link-button" onClick={onOpen}>
        {actionLabel}
      </button>
    </article>
  );
}

function DataProductsCard({
  dataProducts,
  onOpen,
}: {
  dataProducts: MissionContentDataProductGroup;
  onOpen: () => void;
}) {
  return (
    <article className="mission-content-card mission-content-data-products" aria-label="Data products">
      <MissionContentCardHeader
        title="Data Products"
        value={formatOptionalCount(dataProducts.count)}
        source={dataProducts.source}
      />
      <div className="mission-content-metric-row">
        <MetricPill label="Coverage" value={formatPercent(dataProducts.coverage.percent)} />
        <MetricPill
          label="Produced by"
          value={formatRelationshipValue(dataProducts.producedBy.total, dataProducts.producedBy.covered)}
        />
        <MetricPill
          label="Downlink"
          value={formatRelationshipValue(dataProducts.downlinkLinked.total, dataProducts.downlinkLinked.covered)}
        />
      </div>
      {dataProducts.observedProducts.length > 0 ? (
        <ul className="mission-content-entity-list">
          {dataProducts.observedProducts.slice(0, 3).map((item) => (
            <li key={item.id}>
              <strong>{item.id}</strong>
              <span>
                {item.producer ?? "producer not reported"} · {item.downlinkFlows.length} downlink flows
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mission-content-empty">No simulation data-product evidence loaded.</p>
      )}
      <button type="button" className="mission-content-link-button" onClick={onOpen}>
        Open data products
      </button>
    </article>
  );
}

function ScenariosCard({
  scenarios,
  onOpen,
}: {
  scenarios: MissionContentScenarioGroup;
  onOpen: () => void;
}) {
  return (
    <article className="mission-content-card" aria-label="Scenarios">
      <MissionContentCardHeader
        title="Scenarios"
        value={String(scenarios.count)}
        source={scenarios.source}
      />
      <div className="mission-content-metric-row">
        <MetricPill label="Sources" value={String(scenarios.sourceCount)} />
        <MetricPill label="Passed" value={formatOptionalCount(scenarios.passed)} />
        <MetricPill label="Failed" value={formatOptionalCount(scenarios.failed)} />
      </div>
      <ul className="mission-content-entity-list">
        {scenarios.items.slice(0, 4).map((scenario) => (
          <li key={scenario.id}>
            <strong>{scenario.label}</strong>
            <span>{scenario.result}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="mission-content-link-button" onClick={onOpen}>
        Open scenarios
      </button>
    </article>
  );
}

function GeneratedArtifactsCard({
  artifacts,
  onOpen,
}: {
  artifacts: MissionContentGeneratedArtifacts;
  onOpen: () => void;
}) {
  return (
    <article className="mission-content-card mission-content-generated" aria-label="Generated artifacts">
      <MissionContentCardHeader
        title="Generated Artifacts"
        value={formatOptionalCount(artifacts.total)}
        source={artifacts.source}
      />
      <div className="mission-content-metric-row mission-content-artifact-row">
        <MetricPill label="Docs" value={formatDetected(artifacts.docs)} />
        <MetricPill label="Reports" value={formatDetected(artifacts.reports)} />
        <MetricPill label="Runtime" value={formatDetected(artifacts.runtime)} />
        <MetricPill label="Ground" value={formatDetected(artifacts.ground)} />
        <MetricPill label="Warnings" value={formatOptionalCount(artifacts.warnings)} />
      </div>
      <button type="button" className="mission-content-link-button" onClick={onOpen}>
        Open generated artifacts
      </button>
    </article>
  );
}

function MissionContentWarnings({ warnings }: { warnings: MissionContentWarning[] }) {
  return (
    <article className="mission-content-card mission-content-warnings" aria-label="Warnings">
      <MissionContentCardHeader title="Warnings" value={String(warnings.length)} source="Mission content view model" />
      {warnings.length > 0 ? (
        <ul className="mission-content-warning-list">
          {warnings.slice(0, 5).map((warning) => (
            <li className={`mission-content-warning mission-content-warning-${warning.severity}`} key={warning.id}>
              <strong>{warning.title}</strong>
              <span>{warning.detail}</span>
              <small>{warning.source}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mission-content-empty">No blocking warning is reported by the loaded evidence.</p>
      )}
    </article>
  );
}

function MissionContentEvidence({ model }: { model: MissionContentViewModel }) {
  return (
    <article className="mission-content-card mission-content-evidence" aria-label="Evidence posture">
      <MissionContentCardHeader
        title="Evidence Posture"
        value={`${model.evidence.reported}/${model.evidence.total}`}
        source="Core reports and workspace inspection"
      />
      <div className="mission-content-evidence-grid">
        {model.evidence.items.map((item) => (
          <span
            className={`mission-content-evidence-chip ${item.available ? "mission-content-evidence-on" : "mission-content-evidence-off"}`}
            key={item.key}
            title={item.detail}
          >
            {item.label}
          </span>
        ))}
      </div>
      <div className="mission-content-support-strip" aria-label="Support evidence">
        <MetricPill label="Validation" value={model.support.validation.result ?? "not reported"} />
        <MetricPill label="Relationships" value={formatOptionalCount(model.support.relationships.total)} />
        <MetricPill label="Expectations" value={formatPercent(model.support.expectationCoverage.percent)} />
      </div>
    </article>
  );
}

function MissionContentCardHeader({
  title,
  value,
  source,
}: {
  title: string;
  value: string;
  source: string;
}) {
  return (
    <header className="mission-content-card-header">
      <div>
        <span className="cockpit-eyebrow">{source}</span>
        <h3>{title}</h3>
      </div>
      <strong>{value}</strong>
    </header>
  );
}

function MissionContentEntityList({ group }: { group: MissionContentEntityGroup }) {
  if (group.items.length === 0) {
    return <p className="mission-content-empty">No entity record loaded for this domain.</p>;
  }

  return (
    <ul className="mission-content-entity-list">
      {group.items.slice(0, 4).map((item) => (
        <li key={`${item.domain}:${item.id}`}>
          <strong>{item.label}</strong>
          <span>{item.entityType}</span>
        </li>
      ))}
    </ul>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="mission-content-metric-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </span>
  );
}

function formatOptionalCount(value: number | null | undefined): string {
  return value === null || value === undefined ? "not reported" : String(value);
}

function formatPercent(value: number | null): string {
  return value === null ? "not reported" : `${value}%`;
}

function formatRelationshipValue(total: number | null, covered: number | null): string {
  if (total === null) {
    return "not reported";
  }

  return covered === null ? String(total) : `${covered}/${total}`;
}

function formatDetected(value: number | null): string {
  return value === null ? "not reported" : "detected";
}
