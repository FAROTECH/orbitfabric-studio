import { useEffect, useMemo, useState, type ReactNode } from "react";

import missionOverviewPatch from "./assets/mission/mission-overview-patch.png";
import { type GeneratedArtifactDashboardSummary } from "./GeneratedArtifactExplorer";
import type { ActiveSurface, TargetDomainId } from "./navigationModel";
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

interface ReferenceDisplayModel {
  missionName: string;
  description: string;
  missionId: string;
  phase: string;
  owner: string;
  updated: string;
  healthValue: string;
  healthLabel: string;
  completenessValue: string;
  completenessLabel: string;
  lintErrors: string;
  lintWarnings: string;
  lintPassed: string;
  loadDataProducts: string;
  loadScenarios: string;
  loadCommands: string;
  spacecraftCount: string;
  payloadCount: string;
  dataProductValue: string;
  dataProductCoverage: string;
  scenarioValue: string;
  scenarioCoverage: string;
  downlinkWindows: string;
  contacts: string;
  commandValue: string;
  commandCoverage: string;
  spacecraftRows: Array<[string, string]>;
  payloadRows: Array<[string, string]>;
  dataProductRows: {
    coverage: string;
    coveragePercent: number;
    producers: string;
    producerName: string;
    downlink: string;
  };
  scenarioRows: Array<[string, string, string]>;
  artifactTiles: Array<[string, string, string]>;
  warningRows: Array<[string, string, string, string]>;
  evidence: {
    status: string;
    validation: string;
    passed: string;
    warning: string;
    failed: string;
    traceCoverage: string;
    traceCoveragePercent: number;
    requirements: string;
    requirementsPercent: number;
    lastValidation: string;
  };
  coreLoaded: boolean;
}

const emptyReferenceDisplay: ReferenceDisplayModel = {
  coreLoaded: false,
  missionName: "Mission workspace",
  description:
    "Workspace-backed mission overview. Load Core reports to populate mission health, coverage, relationships, and validation evidence.",
  missionId: "not reported",
  phase: "not reported",
  owner: "not reported",
  updated: "not reported",
  healthValue: "pending",
  healthLabel: "Load Core",
  completenessValue: "not reported",
  completenessLabel: "Load Core reports",
  lintErrors: "not reported",
  lintWarnings: "not reported",
  lintPassed: "not reported",
  loadDataProducts: "not reported",
  loadScenarios: "not reported",
  loadCommands: "not reported",
  spacecraftCount: "not reported",
  payloadCount: "not reported",
  dataProductValue: "not reported",
  dataProductCoverage: "coverage not reported",
  scenarioValue: "not reported",
  scenarioCoverage: "scenario runs not reported",
  downlinkWindows: "not reported",
  contacts: "not reported",
  commandValue: "not reported",
  commandCoverage: "coverage not reported",
  spacecraftRows: [
    ["Bus", "not reported"],
    ["Configuration", "not reported"],
    ["Mass", "not reported"],
    ["Power (EOL)", "not reported"],
    ["Modes", "not reported"],
  ],
  payloadRows: [["Payload inventory", "not loaded"]],
  dataProductRows: {
    coverage: "not reported",
    coveragePercent: 0,
    producers: "not reported",
    producerName: "not reported",
    downlink: "not reported",
  },
  scenarioRows: [],
  artifactTiles: [
    ["Docs", "not reported", "Core artifact inventory not loaded"],
    ["Reports", "not reported", "Core artifact inventory not loaded"],
    ["Runtime", "not reported", "Core artifact inventory not loaded"],
    ["Ground", "not reported", "Core artifact inventory not loaded"],
    ["Warnings", "not reported", "Core artifact inventory not loaded"],
  ],
  warningRows: [["INFO", "No warning evidence loaded", "Load Core reports to verify current warning posture.", "not reported"]],
  evidence: {
    status: "Load Core",
    validation: "not reported",
    warning: "not reported",
    failed: "not reported",
    passed: "not reported",
    traceCoverage: "not reported",
    traceCoveragePercent: 0,
    requirements: "not reported",
    requirementsPercent: 0,
    lastValidation: "not reported",
  },
};

export function MissionCockpit({
  workspace,
  coreResult,
  coreReportSnapshots,
  generatedArtifactSummary,
  onNavigate,
}: {
  workspace: WorkspaceInspection | null;
  coreResult: CoreCommandResult | null;
  coreReportSnapshots: CoreReportSnapshots;
  generatedArtifactSummary: GeneratedArtifactDashboardSummary | null;
  onNavigate: (surface: ActiveSurface, navigationId?: TargetDomainId) => void;
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

  const missionContent = createMissionContentViewModel({
    workspace,
    snapshots: {
      lintReport,
      modelSummary,
      entityIndex,
      dashboardSummary,
      scenarioRunIndex,
      coverageSummary,
      simulationReport,
    },
    relationshipManifest,
    generatedArtifactSummary,
  });

  const display = createReferenceDisplayModel(missionContent);

  return (
    <section
      id="studio-dashboard"
      className="mission-target"
      aria-label="Mission Overview"
    >
      <header className="mission-target-heading">
        <div className="mission-target-heading-title">
          <h2>Mission Overview</h2>
          <span aria-hidden="true">ⓘ</span>
        </div>
        <button type="button" className="mission-target-report-button">
          View Mission Report ↗
        </button>
      </header>

      <section className="mission-target-hero" aria-label="Mission identity and posture">
        <div className="mission-target-identity">
          <MissionPatch />
          <div className="mission-target-copy">
            <div className="mission-target-name-line">
              <div>
                <h1>{display.missionName}</h1>
                <p>{display.description}</p>
              </div>
              <span className="mission-target-health-badge">{display.healthLabel}</span>
            </div>

            <div className="mission-target-meta">
              <MetaItem label="Mission ID" value={display.missionId} />
              <MetaItem label="Phase" value={display.phase} />
              <MetaItem label="Owner" value={display.owner} />
              <MetaItem label="Last Updated" value={display.updated} />
            </div>
          </div>
        </div>

        <div className="mission-target-posture">
          <PostureBlock
            icon="♡"
            title="Mission Health"
            value={display.healthValue}
            subtitle={display.healthLabel}
            progress={display.coreLoaded ? 100 : 100}
            tone="green"
          />
          <PostureBlock
            icon="◎"
            title="Model Completeness"
            value={display.completenessValue}
            subtitle={display.completenessLabel}
            progress={94}
            tone="blue"
          />
          <div className="mission-target-lint">
            <div className="mission-target-mini-title">
              <span>⚠</span>
              <strong>Lint Status</strong>
            </div>
            <div className="mission-target-lint-row mission-target-lint-error">
              <span>✖</span>
              <strong>{display.lintErrors}</strong>
              <small>Errors</small>
            </div>
            <div className="mission-target-lint-row mission-target-lint-warning">
              <span>▲</span>
              <strong>{display.lintWarnings}</strong>
              <small>Warnings</small>
            </div>
            <div className="mission-target-lint-row mission-target-lint-pass">
              <span>✔</span>
              <strong>{display.lintPassed}</strong>
              <small>Checks Passed</small>
            </div>
            <em>Last run: 2 min ago</em>
          </div>
          <div className="mission-target-load">
            <div className="mission-target-mini-title">
              <span>▤</span>
              <strong>Load Core Posture</strong>
            </div>
            <LoadRow label="Data Products" value={display.loadDataProducts} percent={90} />
            <LoadRow label="Scenarios" value={display.loadScenarios} percent={82} />
            <LoadRow label="Commands" value={display.loadCommands} percent={88} />
          </div>
        </div>
      </section>

      <section className="mission-target-quick" aria-label="Mission Quick Stats">
        <h3>Mission Quick Stats</h3>
        <div className="mission-target-quick-grid">
          <QuickStat
            icon="⌘"
            label="Spacecraft"
            value={display.spacecraftCount}
            detail={display.spacecraftCount === "not reported" ? "entity not reported" : "entity loaded"}
          />
          <QuickStat
            icon="▣"
            label="Payloads"
            value={display.payloadCount}
            detail={display.payloadCount === "not reported" ? "inventory not reported" : "payload records loaded"}
          />
          <QuickStat
            icon="▤"
            label="Data Products"
            value={display.dataProductValue}
            detail={display.dataProductCoverage}
          />
          <QuickStat
            icon="〽"
            label="Scenarios"
            value={display.scenarioValue}
            detail={display.scenarioCoverage}
          />
          <QuickStat
            icon="⌁"
            label="Downlink Windows"
            value={display.downlinkWindows}
            detail={display.downlinkWindows === "not reported" ? "downlink not reported" : "windows detected"}
          />
          <QuickStat
            icon="◎"
            label="Contacts"
            value={display.contacts}
            detail={display.contacts === "not reported" ? "contacts not reported" : "contact evidence loaded"}
          />
          <QuickStat
            icon="▷"
            label="Commands Modeled"
            value={display.commandValue}
            detail={display.commandCoverage}
          />
        </div>
      </section>

      <section className="mission-target-domain-grid" aria-label="Mission domain cards">
        <SpacecraftCard
          display={display}
          onOpen={() => onNavigate("model-inventory", "spacecraft")}
        />
        <PayloadsCard
          display={display}
          onOpen={() => onNavigate("model-inventory", "payloads")}
        />
        <DataProductsCard
          display={display}
          onOpen={() => onNavigate("model-inventory", "data-products")}
        />
        <ScenariosCard
          display={display}
          onOpen={() => onNavigate("scenario-evidence", "scenarios")}
        />
      </section>

      <section className="mission-target-bottom-grid" aria-label="Generated artifacts and evidence">
        <GeneratedArtifactsCard
          display={display}
          onOpen={() => onNavigate("generated-artifacts", "generated-artifacts")}
        />
        <WarningsCard display={display} warnings={missionContent.warnings} />
        <EvidenceCard display={display} />
      </section>
    </section>
  );
}

function createReferenceDisplayModel(model: MissionContentViewModel): ReferenceDisplayModel {
  const coreLoaded = model.evidence.items.some((item) => item.key !== "workspace" && item.available);
  const workspaceTitle = titleFromWorkspaceName(model.mission.workspaceName);
  const missionName =
    model.mission.name && model.mission.name !== "OrbitFabric mission workspace"
      ? model.mission.name
      : workspaceTitle;
  const missionId =
    model.mission.id && model.mission.id !== model.mission.workspaceName
      ? model.mission.id
      : "not reported";
  const validation = model.support.validation;
  const lintReported =
    validation.errors !== null || validation.warnings !== null || validation.info !== null;
  const dataProductCoverage = model.dataProducts.coverage.percent;
  const commandCoverage = model.commandability.percent;
  const scenarioRunsReported = model.scenarios.passed !== null || model.scenarios.failed !== null;
  const scenarioPassed = model.scenarios.passed ?? null;
  const scenarioFailed = model.scenarios.failed ?? null;
  const scenarioTotal = scenarioRunsReported
    ? (model.scenarios.passed ?? 0) + (model.scenarios.failed ?? 0)
    : null;
  const contactWindows = uniqueContactWindows(model.dataProducts.observedProducts);
  const downlinkFlows = uniqueDownlinkFlows(model.dataProducts.observedProducts);
  const spacecraftEntity = model.spacecraft.items[0] ?? null;

  return {
    ...emptyReferenceDisplay,
    coreLoaded,
    missionName,
    description: coreLoaded
      ? "End-to-end mission data contract overview for payload, downlink, autonomy, generated artifacts, and scenario evidence."
      : emptyReferenceDisplay.description,
    missionId,
    phase: "not reported",
    owner: "not reported",
    updated: "not reported",
    healthValue: coreLoaded ? (model.warnings.some((warning) => warning.severity === "critical") ? "action" : "reported") : "pending",
    healthLabel: coreLoaded ? (model.warnings.length > 0 ? "Warnings" : "Healthy") : "Load Core",
    completenessValue: coreLoaded ? `${model.evidence.reported} / ${model.evidence.total}` : "not reported",
    completenessLabel: coreLoaded ? "Evidence loaded" : "Load Core reports",
    lintErrors: lintReported ? String(validation.errors ?? 0) : "not reported",
    lintWarnings: lintReported ? String(validation.warnings ?? 0) : "not reported",
    lintPassed: lintReported ? String(validation.info ?? 0) : "not reported",
    loadDataProducts:
      model.dataProducts.coverage.covered !== null && model.dataProducts.coverage.total !== null
        ? `${model.dataProducts.coverage.covered} / ${model.dataProducts.coverage.total}`
        : "not reported",
    loadScenarios:
      scenarioTotal !== null && scenarioPassed !== null
        ? `${scenarioPassed} / ${scenarioTotal}`
        : "not reported",
    loadCommands:
      model.commandability.covered !== null && model.commandability.total !== null
        ? `${model.commandability.covered} / ${model.commandability.total}`
        : "not reported",
    spacecraftCount: entityCountLabel(model.spacecraft),
    payloadCount: entityCountLabel(model.payloads),
    dataProductValue:
      model.dataProducts.coverage.covered !== null && model.dataProducts.coverage.total !== null
        ? `${model.dataProducts.coverage.covered} / ${model.dataProducts.coverage.total}`
        : entityCountLabel(model.dataProducts),
    dataProductCoverage:
      dataProductCoverage !== null ? `${dataProductCoverage}% Coverage` : "coverage not reported",
    scenarioValue:
      scenarioTotal !== null && scenarioPassed !== null
        ? `${scenarioPassed} / ${scenarioTotal}`
        : String(model.scenarios.sourceCount),
    scenarioCoverage:
      scenarioTotal !== null && scenarioPassed !== null
        ? `${Math.round((scenarioPassed / Math.max(scenarioTotal, 1)) * 100)}% Covered`
        : `${model.scenarios.sourceCount} scenario sources`,
    downlinkWindows: downlinkFlows.length > 0 ? String(downlinkFlows.length) : "not reported",
    contacts: contactWindows.length > 0 ? String(contactWindows.length) : "not reported",
    commandValue:
      model.commandability.covered !== null && model.commandability.total !== null
        ? `${model.commandability.covered} / ${model.commandability.total}`
        : "not reported",
    commandCoverage:
      commandCoverage !== null ? `${commandCoverage}% Coverage` : "coverage not reported",
    spacecraftRows: [
      ["Bus", spacecraftEntity?.label ?? "not reported"],
      ["Configuration", spacecraftEntity?.entityType ?? "not reported"],
      ["Mass", "not reported"],
      ["Power (EOL)", "not reported"],
      ["Modes", "not reported"],
    ],
    payloadRows:
      model.payloads.items.length > 0
        ? model.payloads.items.slice(0, 3).map((item) => [item.label, "MODELED"] as [string, string])
        : emptyReferenceDisplay.payloadRows,
    dataProductRows: {
      coverage: dataProductCoverage !== null ? `${dataProductCoverage}%` : "not reported",
      coveragePercent: dataProductCoverage ?? 0,
      producers: formatRelationship(model.dataProducts.producedBy),
      producerName: model.dataProducts.observedProducts[0]?.producer ?? "not reported",
      downlink: formatRelationship(model.dataProducts.downlinkLinked),
    },
    scenarioRows:
      model.scenarios.items.length > 0
        ? model.scenarios.items.slice(0, 3).map((item) => [
            item.label,
            scenarioStatusLabel(item.result),
            item.reportFile ? "reported" : "source only",
          ] as [string, string, string])
        : emptyReferenceDisplay.scenarioRows,
    artifactTiles: [
      ["Docs", artifactLocationLabel(model.generatedArtifacts.docs), "Generated location"],
      ["Reports", artifactLocationLabel(model.generatedArtifacts.reports), "Generated location"],
      ["Runtime", artifactLocationLabel(model.generatedArtifacts.runtime), "Generated location"],
      ["Ground", artifactLocationLabel(model.generatedArtifacts.ground), "Generated location"],
      ["Warnings", formatNullableNumber(model.generatedArtifacts.warnings), "Artifact warnings"],
    ],
    warningRows:
      model.warnings.length > 0
        ? model.warnings.slice(0, 3).map((warning, index) => [
            warning.severity === "critical" ? "HIGH" : index === 0 ? "MEDIUM" : "LOW",
            warning.title,
            warning.detail,
            warning.source,
          ] as [string, string, string, string])
        : emptyReferenceDisplay.warningRows,
    evidence: {
      status: coreLoaded ? (model.warnings.length > 0 ? "Review" : "Good") : "Load Core",
      validation: validation.result ?? "not reported",
      passed: lintReported ? `${validation.info ?? 0} Info` : "not reported",
      warning: lintReported ? `${validation.warnings ?? 0} Warnings` : "not reported",
      failed: lintReported ? `${validation.errors ?? 0} Errors` : "not reported",
      traceCoverage:
        model.support.expectationCoverage.percent !== null
          ? `${model.support.expectationCoverage.percent}%`
          : "not reported",
      traceCoveragePercent: model.support.expectationCoverage.percent ?? 0,
      requirements:
        model.support.relationships.total !== null
          ? `${model.support.relationships.total} relationships`
          : "not reported",
      requirementsPercent: model.support.relationships.total !== null ? 100 : 0,
      lastValidation: coreLoaded ? "loaded" : "not reported",
    },
  };
}

function MissionPatch() {
  return (
    <div className="mission-target-patch" aria-label="Reference mission patch">
      <img
        src={missionOverviewPatch}
        alt="Reference mission patch"
        className="mission-target-patch-image"
      />
    </div>
  );
}

function PostureBlock({
  icon,
  title,
  value,
  subtitle,
  progress,
  tone,
}: {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  progress: number;
  tone: "green" | "blue";
}) {
  return (
    <article className={`mission-target-posture-block mission-target-posture-${tone}`}>
      <div className="mission-target-posture-title">
        <span>{icon}</span>
        <strong>{title}</strong>
      </div>
      <b>{value}</b>
      <small>{subtitle}</small>
      <Progress percent={progress} />
    </article>
  );
}

function LoadRow({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <div className="mission-target-load-row">
      <span>{label}</span>
      <Progress percent={percent} />
      <strong>{value}</strong>
    </div>
  );
}

function QuickStat({ icon, label, value, detail }: { icon: string; label: string; value: string; detail: string }) {
  const isUnavailable =
    value.toLowerCase().includes("not reported") || detail.toLowerCase().includes("not reported");
  const hasEvidence = !isUnavailable && !value.toLowerCase().includes("not loaded");

  return (
    <article
      className={[
        "mission-target-quick-stat",
        isUnavailable ? "mission-target-quick-stat-muted" : "",
        hasEvidence ? "mission-target-quick-stat-evidence" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="mission-target-quick-icon" aria-hidden="true">{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function TargetCard({
  title,
  value,
  action,
  onOpen,
  children,
  className,
}: {
  title: string;
  value?: string;
  action?: string;
  onOpen?: () => void;
  children: ReactNode;
  className?: string;
}) {
  const isValueUnavailable = value?.toLowerCase().includes("not reported") ?? false;

  return (
    <article className={["mission-target-card", className].filter(Boolean).join(" ")}>
      <header className="mission-target-card-header">
        <h3>{title}</h3>
        <div title={action}>
          {value ? (
            <strong className={isValueUnavailable ? "mission-target-card-status-muted" : undefined}>
              {value}
            </strong>
          ) : null}
        </div>
      </header>
      {children}
    </article>
  );
}

function SpacecraftCard({ display, onOpen }: { display: ReferenceDisplayModel; onOpen: () => void }) {
  return (
    <TargetCard
      title="Spacecraft"
      value={display.spacecraftCount}
      action="View Spacecraft"
      onOpen={onOpen}
      className="mission-target-spacecraft-card"
    >
      <div className="mission-target-card-body">
        <div className="mission-target-spacecraft-body">
          <dl className="mission-target-detail-list">
            {display.spacecraftRows.map(([label, value]) => (
              <MetaDefinition label={label} value={value} key={label} />
            ))}
          </dl>
          <div className="mission-target-cubesat" aria-hidden="true">
            <span className="mission-target-cubesat-panel-left" />
            <span className="mission-target-cubesat-body" />
            <span className="mission-target-cubesat-panel-right" />
          </div>
        </div>
      </div>
      <button type="button" className="mission-target-card-footer-button" onClick={onOpen}>View Spacecraft</button>
    </TargetCard>
  );
}

function PayloadsCard({ display, onOpen }: { display: ReferenceDisplayModel; onOpen: () => void }) {
  const inventoryUnavailable =
    display.payloadRows.length === 1 &&
    display.payloadRows[0][1].toLowerCase().includes("not");

  return (
    <TargetCard
      title="Payloads"
      value={display.payloadCount}
      action="View Payloads"
      onOpen={onOpen}
      className="mission-target-payloads-card"
    >
      <div className="mission-target-card-body">
        {inventoryUnavailable ? (
          <div className="mission-target-empty-state mission-target-payload-empty">
            <span aria-hidden="true">▣</span>
            <div>
              <strong>Payload inventory not loaded</strong>
              <small>Load Core evidence to inspect modeled payload records.</small>
            </div>
          </div>
        ) : (
          <ul className="mission-target-payload-list">
            {display.payloadRows.map(([name, status]) => (
              <li key={name}>
                <span>{name}</span>
                <strong>{status}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="button" className="mission-target-card-footer-button" onClick={onOpen}>View Payloads</button>
    </TargetCard>
  );
}

function DataProductsCard({ display, onOpen }: { display: ReferenceDisplayModel; onOpen: () => void }) {
  return (
    <TargetCard
      title="Data Products"
      value={display.dataProductValue}
      action="View Data Products"
      onOpen={onOpen}
      className="mission-target-data-products-card"
    >
      <div className="mission-target-card-body">
        <MetricLine label="Coverage" value={display.dataProductRows.coverage} percent={display.dataProductRows.coveragePercent} />
        <div className="mission-target-data-product-grid">
          <div>
            <span>Producers</span>
            <strong>{display.dataProductRows.producers}</strong>
          </div>
          <div>
            <span>Downlink Linkage</span>
            <strong>{display.dataProductRows.downlink}</strong>
          </div>
        </div>
        <div className="mission-target-flow">
          <span>{display.dataProductRows.producerName}</span>
          <i aria-hidden="true">→</i>
          <strong>L1C_TILE_16BIT</strong>
          <small>+3</small>
        </div>
      </div>
      <button type="button" className="mission-target-card-footer-button" onClick={onOpen}>View Data Products</button>
    </TargetCard>
  );
}

function ScenariosCard({ display, onOpen }: { display: ReferenceDisplayModel; onOpen: () => void }) {
  const runEvidenceReported = display.scenarioCoverage.toLowerCase().includes("covered");
  const sourceSummary = runEvidenceReported ? display.scenarioValue : display.scenarioCoverage;
  const runSummary = runEvidenceReported ? display.scenarioCoverage : "run evidence not reported";

  return (
    <TargetCard
      title="Scenarios"
      value={display.scenarioValue}
      action="View Scenarios"
      onOpen={onOpen}
      className="mission-target-scenarios-card"
    >
      <div className="mission-target-card-body">
        <div className="mission-target-scenario-metadata">
          <span>Sources</span>
          <strong>{sourceSummary}</strong>
          <span>Run Evidence</span>
          <strong>{runSummary}</strong>
        </div>
        <ul className="mission-target-scenario-list">
          {display.scenarioRows.map(([name, status, time]) => (
            <li key={name}>
              <span>{name}</span>
              <strong className={`mission-target-scenario-status mission-target-scenario-status-${status.toLowerCase().replace(/\s+/g, "-")}`}>
                {status}
              </strong>
              <small>{time}</small>
            </li>
          ))}
        </ul>
      </div>
      <button type="button" className="mission-target-card-footer-button" onClick={onOpen}>View Scenarios</button>
    </TargetCard>
  );
}

function GeneratedArtifactsCard({ display, onOpen }: { display: ReferenceDisplayModel; onOpen: () => void }) {
  return (
    <article className="mission-target-card mission-target-artifacts">
      <header className="mission-target-card-header">
        <h3>Generated Artifacts</h3>
      </header>
      <div className="mission-target-artifact-grid">
        {display.artifactTiles.map(([label, value, detail]) => (
          <div key={label}>
            <i aria-hidden="true">{artifactIcon(label)}</i>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{detail}</small>
          </div>
        ))}
      </div>
      <button type="button" className="mission-target-card-footer-button" onClick={onOpen}>Open Artifacts Folder</button>
    </article>
  );
}

function WarningsCard({
  display,
}: {
  display: ReferenceDisplayModel;
  warnings: MissionContentWarning[];
}) {
  return (
    <article className="mission-target-card mission-target-warnings">
      <header className="mission-target-card-header">
        <h3>Warnings</h3>
        <strong>1</strong>
      </header>
      <ul>
        {display.warningRows.map(([level, title, detail, time]) => (
          <li key={`${level}:${title}`}>
            <small>{level}</small>
            <div>
              <strong>{title}</strong>
              <span>{detail}</span>
            </div>
            <em>{time}</em>
          </li>
        ))}
      </ul>
      <button type="button" className="mission-target-card-footer-button">View All Warnings →</button>
    </article>
  );
}

function EvidenceCard({ display }: { display: ReferenceDisplayModel }) {
  return (
    <article className="mission-target-card mission-target-evidence">
      <header className="mission-target-card-header">
        <h3>Evidence Posture</h3>
        <strong>{display.evidence.status}</strong>
      </header>
      <div className="mission-target-evidence-validation">
        <span>Validation</span>
        <strong>{display.evidence.passed}</strong>
        <small>{display.evidence.warning}</small>
        <em>{display.evidence.failed}</em>
      </div>
      <MetricLine label="Trace Coverage" value={display.evidence.traceCoverage} percent={display.evidence.traceCoveragePercent} />
      <MetricLine label="Requirements Connected" value={display.evidence.requirements} percent={display.evidence.requirementsPercent} />
      <div className="mission-target-last-validation">
        <span>Last Validation</span>
        <strong>{display.evidence.lastValidation}</strong>
      </div>
      <button type="button" className="mission-target-card-footer-button">Open Validation Report +</button>
    </article>
  );
}

function MetricLine({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <div className="mission-target-metric-line">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <Progress percent={percent} />
    </div>
  );
}

function Progress({ percent }: { percent: number }) {
  return (
    <div className="mission-target-progress" aria-hidden="true">
      <span style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
    </div>
  );
}

function MetaDefinition({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <article>
      <span>{label}</span>
      <strong title={value}>{value}</strong>
    </article>
  );
}


function titleFromWorkspaceName(workspaceName: string): string {
  if (!workspaceName || workspaceName === "No workspace") {
    return "Mission workspace";
  }

  return workspaceName
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => {
      if (/^\d+u$/i.test(part)) {
        return part.toUpperCase();
      }

      if (part.toLowerCase() === "eo") {
        return "EO";
      }

      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function entityCountLabel(group: MissionContentEntityGroup): string {
  return group.items.length > 0 ? String(group.items.length) : "not reported";
}

function uniqueContactWindows(products: MissionContentDataProductGroup["observedProducts"]): string[] {
  return [...new Set(products.flatMap((product) => product.contactWindows))];
}

function uniqueDownlinkFlows(products: MissionContentDataProductGroup["observedProducts"]): string[] {
  return [...new Set(products.flatMap((product) => product.downlinkFlows))];
}

function formatRelationship(value: { covered: number | null; total: number | null }): string {
  if (value.covered !== null && value.total !== null) {
    return `${value.covered} / ${value.total}`;
  }

  if (value.total !== null) {
    return String(value.total);
  }

  return "not reported";
}

function scenarioStatusLabel(result: string): string {
  const normalized = result.toLowerCase().replace(/[_-]+/g, " ");

  if (normalized.includes("not") && normalized.includes("run")) {
    return "NOT RUN";
  }

  if (normalized.includes("source")) {
    return "SOURCE";
  }

  if (normalized.includes("pass")) {
    return "PASSED";
  }

  if (normalized.includes("fail")) {
    return "FAILED";
  }

  if (normalized.includes("running") || normalized.includes("progress")) {
    return "RUNNING";
  }

  return "NOT RUN";
}

function artifactLocationLabel(value: number | null): string {
  if (value === null) {
    return "not reported";
  }

  return value > 0 ? "detected" : "not detected";
}

function formatNullableNumber(value: number | null): string {
  return value === null ? "not reported" : String(value);
}

function artifactIcon(label: string): string {
  switch (label) {
    case "Docs":
      return "▤";
    case "Reports":
      return "▥";
    case "Runtime":
      return "</>";
    case "Ground":
      return "⌁";
    case "Warnings":
      return "⚠";
    default:
      return "•";
  }
}


function formatDisplayNumber(value: number | string): string {
  return String(value);
}
