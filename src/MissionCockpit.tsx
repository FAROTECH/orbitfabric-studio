import { useEffect, useMemo, useState, type ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";

import missionOverviewPatch from "./assets/mission/mission-overview-patch.png";
import spacecraftCardIllustration from "./assets/mission/spacecraft-card-illustration.png";
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
  CoreEntityIndex,
  CoreRelationshipManifest,
  GeneratedArtifactInventory,
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
    targetName: string;
    targetExtra: string | null;
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

interface ExistingCoreReportContents {
  lintReport: string | null;
  modelSummary: string | null;
  entityIndex: string | null;
  relationshipManifest: string | null;
  dashboardSummary: string | null;
  scenarioRunIndex: string | null;
  coverageSummary: string | null;
  simulationReport: string | null;
}

interface GeneratedArtifactClassPresence {
  docs: boolean;
  reports: boolean;
  runtime: boolean;
  ground: boolean;
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
  healthValue: "Not reported",
  healthLabel: "Core metric not available",
  completenessValue: "Not reported",
  completenessLabel: "Core metric not available",
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
    targetName: "data product not resolved",
    targetExtra: null,
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
  const [existingReportSnapshots, setExistingReportSnapshots] =
    useState<CoreReportSnapshots>(() => createEmptyCoreReportSnapshots());
  const [relationshipManifestSnapshot, setRelationshipManifestSnapshot] =
    useState<CoreRelationshipManifest | null>(null);
  const [observedGeneratedArtifactSummary, setObservedGeneratedArtifactSummary] =
    useState<GeneratedArtifactDashboardSummary | null>(null);
  const [observedGeneratedArtifactClasses, setObservedGeneratedArtifactClasses] =
    useState<GeneratedArtifactClassPresence | null>(null);

  useEffect(() => {
    let cancelled = false;

    setExistingReportSnapshots(createEmptyCoreReportSnapshots());
    setRelationshipManifestSnapshot(null);
    setObservedGeneratedArtifactSummary(null);
    setObservedGeneratedArtifactClasses(null);

    if (!workspace) {
      return () => {
        cancelled = true;
      };
    }

    const workspacePath = workspace.selected_path;

    async function loadExistingWorkspaceEvidence() {
      try {
        const existingReports = await readExistingCoreReports(workspacePath);

        if (!cancelled) {
          setExistingReportSnapshots(createCoreReportSnapshotsFromExistingReports(existingReports));
          setRelationshipManifestSnapshot(parseCoreRelationshipManifest(existingReports.relationshipManifest));
        }
      } catch {
        if (!cancelled) {
          setExistingReportSnapshots(createEmptyCoreReportSnapshots());
          setRelationshipManifestSnapshot(null);
        }
      }

      try {
        const inventory = await invoke<GeneratedArtifactInventory>(
          "inspect_generated_artifacts",
          { workspacePath },
        );

        if (!cancelled) {
          setObservedGeneratedArtifactSummary(toGeneratedArtifactDashboardSummary(inventory));
          setObservedGeneratedArtifactClasses(toGeneratedArtifactClassPresence(inventory));
        }
      } catch {
        if (!cancelled) {
          setObservedGeneratedArtifactSummary(null);
          setObservedGeneratedArtifactClasses(null);
        }
      }
    }

    void loadExistingWorkspaceEvidence();

    return () => {
      cancelled = true;
    };
  }, [workspace?.selected_path]);

  useEffect(() => {
    if (currentRelationshipManifest) {
      setRelationshipManifestSnapshot(currentRelationshipManifest);
    }
  }, [currentRelationshipManifest]);

  const lintReport =
    parseCoreLintReport(currentReportContent) ?? coreReportSnapshots.lintReport ?? existingReportSnapshots.lintReport;
  const modelSummary =
    parseCoreModelSummary(currentReportContent) ?? coreReportSnapshots.modelSummary ?? existingReportSnapshots.modelSummary;
  const entityIndex =
    parseCoreEntityIndex(currentReportContent) ?? coreReportSnapshots.entityIndex ?? existingReportSnapshots.entityIndex;
  const relationshipManifest = currentRelationshipManifest ?? relationshipManifestSnapshot;
  const dashboardSummary =
    parseCoreDashboardSummary(currentReportContent) ?? coreReportSnapshots.dashboardSummary ?? existingReportSnapshots.dashboardSummary;
  const scenarioRunIndex =
    parseCoreScenarioRunIndex(currentReportContent) ?? coreReportSnapshots.scenarioRunIndex ?? existingReportSnapshots.scenarioRunIndex;
  const coverageSummary =
    parseCoreCoverageSummary(currentReportContent) ?? coreReportSnapshots.coverageSummary ?? existingReportSnapshots.coverageSummary;
  const simulationReport =
    parseCoreSimulationReport(currentReportContent) ?? coreReportSnapshots.simulationReport ?? existingReportSnapshots.simulationReport;
  const effectiveGeneratedArtifactSummary = generatedArtifactSummary ?? observedGeneratedArtifactSummary;

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
    generatedArtifactSummary: effectiveGeneratedArtifactSummary,
  });

  const display = createReferenceDisplayModel(
    missionContent,
    entityIndex,
    observedGeneratedArtifactClasses,
  );

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
        <button
          type="button"
          className="mission-target-report-button"
          onClick={() => onNavigate("generated-artifacts", "generated-artifacts")}
        >
          View Generated Reports ↗
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
            title="Contract Health"
            value={display.healthValue}
            subtitle={display.healthLabel}
            progress={0}
            tone="green"
          />
          <PostureBlock
            icon="◎"
            title="Contract Completeness"
            value={display.completenessValue}
            subtitle={display.completenessLabel}
            progress={display.completenessValue === "Not reported" ? 0 : 0}
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
            <em>Validation report: {display.evidence.lastValidation}</em>
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
            icon="∿"
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
        <WarningsCard
          display={display}
          warnings={missionContent.warnings}
          onOpen={() => onNavigate("generated-artifacts", "generated-artifacts")}
        />
        <EvidenceCard
          display={display}
          onOpen={() => onNavigate("generated-artifacts", "generated-artifacts")}
        />
      </section>
    </section>
  );
}

function createReferenceDisplayModel(
  model: MissionContentViewModel,
  entityIndex: CoreEntityIndex | null,
  generatedArtifactClasses: GeneratedArtifactClassPresence | null,
): ReferenceDisplayModel {
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
  const scenarioRunsReported = model.scenarios.passed !== null || model.scenarios.failed !== null;
  const scenarioPassed = model.scenarios.passed ?? null;
  const scenarioFailed = model.scenarios.failed ?? null;
  const scenarioTotal = scenarioRunsReported
    ? (model.scenarios.passed ?? 0) + (model.scenarios.failed ?? 0)
    : null;
  const contactWindows = uniqueContactWindows(model.dataProducts.observedProducts);
  const downlinkFlows = uniqueDownlinkFlows(model.dataProducts.observedProducts);
  const spacecraftEntity = model.spacecraft.items[0] ?? null;
  const downlinkFlowCount = entityDomainCount(entityIndex, ["downlink_flows"]);
  const contactWindowCount = entityDomainCount(entityIndex, ["contact_windows"]);
  const commandModeledCount = entityDomainCount(entityIndex, ["commands"]) ?? model.commandability.total;
  const commandCoverageDetail =
    model.commandability.covered !== null && model.commandability.total !== null
      ? `${model.commandability.covered}/${model.commandability.total} covered`
      : "coverage not reported";
  const selectedDataProduct = selectDataProductFlowTarget(model.dataProducts);

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
    healthValue: "Not reported",
    healthLabel: "Core metric not available",
    completenessValue: "Not reported",
    completenessLabel: "Core metric not available",
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
    downlinkWindows:
      downlinkFlowCount !== null
        ? String(downlinkFlowCount)
        : downlinkFlows.length > 0
          ? String(downlinkFlows.length)
          : "not reported",
    contacts:
      contactWindowCount !== null
        ? String(contactWindowCount)
        : contactWindows.length > 0
          ? String(contactWindows.length)
          : "not reported",
    commandValue: commandModeledCount !== null ? String(commandModeledCount) : "not reported",
    commandCoverage: commandCoverageDetail,
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
      targetName: selectedDataProduct.targetName,
      targetExtra: selectedDataProduct.targetExtra,
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
      ["Docs", artifactPresenceLabel(generatedArtifactClasses?.docs, model.generatedArtifacts.docs), "Generated docs"],
      ["Reports", artifactPresenceLabel(generatedArtifactClasses?.reports, model.generatedArtifacts.reports), "Generated reports"],
      ["Runtime", artifactPresenceLabel(generatedArtifactClasses?.runtime, model.generatedArtifacts.runtime), "C++17 runtime"],
      ["Ground", artifactPresenceLabel(generatedArtifactClasses?.ground, model.generatedArtifacts.ground), "Ground artifacts"],
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
          <div
            className="mission-target-spacecraft-illustration"
            aria-hidden="true"
          >
            <img
              src={spacecraftCardIllustration}
              alt=""
              className="mission-target-spacecraft-illustration-image"
            />
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
          <strong>{display.dataProductRows.targetName}</strong>
          {display.dataProductRows.targetExtra ? <small>{display.dataProductRows.targetExtra}</small> : null}
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
      <div className="mission-target-card-body">
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
      </div>
      <button type="button" className="mission-target-card-footer-button" onClick={onOpen}>Open Artifacts Folder</button>
    </article>
  );
}

function WarningsCard({
  display,
  warnings,
  onOpen,
}: {
  display: ReferenceDisplayModel;
  warnings: MissionContentWarning[];
  onOpen: () => void;
}) {
  const warningCount = warnings.length;
  const hasReportedWarnings = warningCount > 0;

  return (
    <article
      className={[
        "mission-target-card",
        "mission-target-warnings",
        hasReportedWarnings ? "" : "mission-target-warnings-empty",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="mission-target-card-header">
        <h3>Warnings</h3>
        <strong>{hasReportedWarnings ? String(warningCount) : "Load Core"}</strong>
      </header>
      <div className="mission-target-card-body">
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
      </div>
      <button type="button" className="mission-target-card-footer-button" onClick={onOpen}>
        {hasReportedWarnings ? "Review Warning Artifacts →" : "Review Warning Evidence →"}
      </button>
    </article>
  );
}

function EvidenceCard({ display, onOpen }: { display: ReferenceDisplayModel; onOpen: () => void }) {
  const evidenceUnavailable = display.evidence.status.toLowerCase().includes("load");

  return (
    <article
      className={[
        "mission-target-card",
        "mission-target-evidence",
        evidenceUnavailable ? "mission-target-evidence-empty" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="mission-target-card-header">
        <h3>Evidence Posture</h3>
        <strong>{display.evidence.status}</strong>
      </header>
      <div className="mission-target-card-body">
        <div className="mission-target-evidence-validation">
          <span>Validation</span>
          <strong>{display.evidence.validation}</strong>
          <small>{display.evidence.warning}</small>
          <em>{display.evidence.failed}</em>
        </div>
        <MetricLine label="Trace Coverage" value={display.evidence.traceCoverage} percent={display.evidence.traceCoveragePercent} />
        <MetricLine label="Relationships Indexed" value={display.evidence.requirements} percent={display.evidence.requirementsPercent} />
        <div className="mission-target-last-validation">
          <span>Validation report</span>
          <strong>{display.evidence.lastValidation}</strong>
        </div>
      </div>
      <button type="button" className="mission-target-card-footer-button" onClick={onOpen}>Open Generated Reports +</button>
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

function createEmptyCoreReportSnapshots(): CoreReportSnapshots {
  return {
    lintReport: null,
    modelSummary: null,
    entityIndex: null,
    dashboardSummary: null,
    scenarioRunIndex: null,
    coverageSummary: null,
    simulationReport: null,
  };
}

async function readExistingCoreReports(workspacePath: string): Promise<ExistingCoreReportContents> {
  const readFirstAvailableReport = async (relativePaths: string[]): Promise<string | null> => {
    for (const relativePath of relativePaths) {
      try {
        const file = await invoke<{ content: string }>("read_text_file", {
          workspacePath,
          filePath: joinWorkspacePath(workspacePath, "generated", "reports", ...relativePath.split("/")),
        });

        return file.content;
      } catch {
        continue;
      }
    }

    return null;
  };

  return {
    lintReport: await readFirstAvailableReport([
      "lint_report.json",
      "orbitfabric_studio_lint_report.json",
    ]),
    modelSummary: await readFirstAvailableReport([
      "model_summary.json",
      "orbitfabric_studio_model_summary.json",
    ]),
    entityIndex: await readFirstAvailableReport([
      "entity_index.json",
      "orbitfabric_studio_entity_index.json",
    ]),
    relationshipManifest: await readFirstAvailableReport([
      "relationship_manifest.json",
      "orbitfabric_studio_relationship_manifest.json",
    ]),
    dashboardSummary: await readFirstAvailableReport([
      "dashboard_summary.json",
      "orbitfabric_studio_dashboard_summary.json",
    ]),
    scenarioRunIndex: await readFirstAvailableReport([
      "scenario_run_index.json",
      "orbitfabric_studio_scenario_run_index.json",
    ]),
    coverageSummary: await readFirstAvailableReport([
      "coverage_summary.json",
      "orbitfabric_studio_coverage_summary.json",
    ]),
    simulationReport: await readFirstAvailableReport([
      "nominal_payload_acquisition_report.json",
      "delayed_sband_downlink_backlog_pending_report.json",
      "eclipse_low_power_payload_suspension_report.json",
      "adcs_degraded_pointing_payload_inhibit_report.json",
    ]),
  };
}

function createCoreReportSnapshotsFromExistingReports(
  reports: ExistingCoreReportContents,
): CoreReportSnapshots {
  return {
    lintReport: parseCoreLintReport(reports.lintReport),
    modelSummary: parseCoreModelSummary(reports.modelSummary),
    entityIndex: parseCoreEntityIndex(reports.entityIndex),
    dashboardSummary: parseCoreDashboardSummary(reports.dashboardSummary),
    scenarioRunIndex: parseCoreScenarioRunIndex(reports.scenarioRunIndex),
    coverageSummary: parseCoreCoverageSummary(reports.coverageSummary),
    simulationReport: parseCoreSimulationReport(reports.simulationReport),
  };
}

function joinWorkspacePath(basePath: string, ...segments: string[]): string {
  const separator = basePath.includes("\\") ? "\\" : "/";
  const normalizedBase = basePath.replace(/[\\/]+$/, "");
  const normalizedSegments = segments.map((segment) => segment.replace(/^[\\/]+|[\\/]+$/g, ""));

  return [normalizedBase, ...normalizedSegments].filter(Boolean).join(separator);
}

function toGeneratedArtifactDashboardSummary(
  inventory: GeneratedArtifactInventory,
): GeneratedArtifactDashboardSummary {
  return {
    generatedDir: inventory.generated_dir,
    totalArtifacts: inventory.counts.total_artifacts,
    knownArtifacts: inventory.counts.known_artifacts,
    unknownArtifacts: inventory.counts.unknown_artifacts,
    previewableArtifacts: inventory.counts.previewable_artifacts,
    notPreviewableArtifacts: inventory.counts.not_previewable_artifacts,
    warningCount: inventory.warnings.length,
  };
}

function toGeneratedArtifactClassPresence(
  inventory: GeneratedArtifactInventory,
): GeneratedArtifactClassPresence {
  return {
    docs: inventory.artifacts.some((artifact) => artifact.artifact_class === "docs"),
    reports: inventory.artifacts.some((artifact) => artifact.artifact_class === "reports"),
    runtime: inventory.artifacts.some((artifact) => artifact.artifact_class === "runtime"),
    ground: inventory.artifacts.some((artifact) => artifact.artifact_class === "ground"),
  };
}

function entityDomainCount(entityIndex: CoreEntityIndex | null, domainIds: string[]): number | null {
  if (!entityIndex) {
    return null;
  }

  for (const domainId of domainIds) {
    const count = entityIndex.counts.domains[domainId];

    if (typeof count === "number") {
      return count;
    }
  }

  return null;
}

function artifactPresenceLabel(
  detectedByInventory: boolean | undefined,
  detectedByWorkspace: number | null,
): string {
  if (detectedByInventory || detectedByWorkspace !== null) {
    return "detected";
  }

  return "not reported";
}

function entityCountLabel(group: MissionContentEntityGroup): string {
  return group.items.length > 0 ? String(group.items.length) : "not reported";
}


function selectDataProductFlowTarget(dataProducts: MissionContentDataProductGroup): {
  targetName: string;
  targetExtra: string | null;
} {
  const observedId = dataProducts.observedProducts[0]?.id ?? null;
  const matchingObservedEntity = observedId
    ? dataProducts.items.find((item) => item.id === observedId)
    : null;
  const targetName =
    matchingObservedEntity?.label ??
    observedId ??
    dataProducts.items[0]?.label ??
    "data product not resolved";

  const totalProducts =
    dataProducts.coverage.total ??
    dataProducts.count ??
    dataProducts.items.length;
  const targetResolved = targetName !== "data product not resolved";
  const remainingProducts = targetResolved
    ? Math.max(0, totalProducts - 1)
    : 0;

  return {
    targetName,
    targetExtra: remainingProducts > 0 ? `+${remainingProducts}` : null,
  };
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
