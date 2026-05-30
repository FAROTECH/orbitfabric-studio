import { useEffect, useMemo, useState } from "react";

import { ProvenanceBadge, StatusBadge } from "./Badges";
import { DashboardIcon } from "./DashboardIcon";
import {
  MissionCockpitKpiCard,
  type MissionCockpitKpiCardIconKind,
  type MissionCockpitKpiCardVariant,
} from "./MissionCockpitKpiCard";
import { MissionCockpitEvidenceLanes } from "./MissionCockpitEvidenceLanes";
import { MissionCockpitPanelHeader } from "./MissionCockpitPanelHeader";
import { MissionDataFlowWorkbenchSurface } from "./MissionDataFlowWorkbenchSurface";
import { type GeneratedArtifactDashboardSummary } from "./GeneratedArtifactExplorer";
import { type ActiveSurface } from "./navigationModel";
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
import type {
  CoreCommandResult,
  CoreRelationshipManifest,
  WorkspaceInspection,
} from "./types/workspace";
import {
  createMissionCockpitPostureModel,
  dashboardTopCoverageRecords,
  dashboardTopEntries,
  type CoreReportSnapshots,
  type MissionCockpitMetricKind,
  type MissionCockpitMetricState,
} from "./missionCockpitModel";
import { createMissionDataFlowWorkbenchSnapshot } from "./missionDataFlowWorkbenchModel";


interface MissionCockpitKpiPresentation {
  variant: MissionCockpitKpiCardVariant;
  iconKind: MissionCockpitKpiCardIconKind;
  action: {
    label: string;
    surface: ActiveSurface;
    disabled: boolean;
  } | null;
}

function formatCockpitMetricStateLabel(state: MissionCockpitMetricState): string {
  if (state === "core-reported") {
    return "CORE REPORTED";
  }

  if (state === "not-reported") {
    return "NOT REPORTED";
  }

  return "UNAVAILABLE";
}

function getMissionCockpitKpiPresentation(
  kind: MissionCockpitMetricKind,
  hasWorkspace: boolean,
): MissionCockpitKpiPresentation {
  switch (kind) {
    case "mission-health":
      return {
        variant: "health",
        iconKind: "shield",
        action: null,
      };

    case "model-completeness":
      return {
        variant: "completeness",
        iconKind: "model",
        action: null,
      };

    case "lint-status":
      return {
        variant: "lint",
        iconKind: "validation",
        action: {
          label: "Reports",
          surface: "reports-logs",
          disabled: !hasWorkspace,
        },
      };

    case "scenario-coverage":
      return {
        variant: "scenario",
        iconKind: "scenario",
        action: {
          label: "Scenarios",
          surface: "scenario-evidence",
          disabled: !hasWorkspace,
        },
      };

    case "data-product-coverage":
      return {
        variant: "data-products",
        iconKind: "artifacts",
        action: {
          label: "Data products",
          surface: "model-inventory",
          disabled: !hasWorkspace,
        },
      };

    case "commandability-coverage":
      return {
        variant: "commandability",
        iconKind: "core",
        action: {
          label: "Commands",
          surface: "model-inventory",
          disabled: !hasWorkspace,
        },
      };
  }
}

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
  const relationshipManifest =
    currentRelationshipManifest ?? relationshipManifestSnapshot;
  const dashboardSummary =
    parseCoreDashboardSummary(currentReportContent) ??
    coreReportSnapshots.dashboardSummary;
  const scenarioRunIndex =
    parseCoreScenarioRunIndex(currentReportContent) ??
    coreReportSnapshots.scenarioRunIndex;
  const coverageSummary =
    parseCoreCoverageSummary(currentReportContent) ??
    coreReportSnapshots.coverageSummary;
  const simulationReport =
    parseCoreSimulationReport(currentReportContent) ??
    coreReportSnapshots.simulationReport;
  const effectiveCoreReportSnapshots: CoreReportSnapshots = {
    lintReport,
    modelSummary,
    entityIndex,
    dashboardSummary,
    scenarioRunIndex,
    coverageSummary,
    simulationReport,
  };
  const missionCockpitPosture = createMissionCockpitPostureModel({
    workspace,
    snapshots: effectiveCoreReportSnapshots,
  });
  const missionDataFlowWorkbenchSnapshot = createMissionDataFlowWorkbenchSnapshot({
    modelSummary,
    entityIndex,
    relationshipManifest,
    dashboardSummary,
    lintReport,
    simulationReport,
    coverageSummary,
    generatedArtifactInventory: null,
  });

  const dashboardValidation = dashboardSummary?.validation ?? null;
  const validationResult = lintReport?.result ?? dashboardValidation?.result ?? null;
  const validationErrors =
    lintReport?.summary.errors ?? dashboardValidation?.errors ?? null;
  const validationWarnings =
    lintReport?.summary.warnings ?? dashboardValidation?.warnings ?? null;
  const validationInfo =
    lintReport?.summary.info ?? dashboardValidation?.info ?? null;
  const validationReportSource = lintReport
    ? "Core lint report"
    : dashboardValidation
      ? "Core dashboard validation summary"
      : "not reported";
  const validationSummaryCards = [
    {
      label: "Result",
      value: validationResult ?? "not reported",
      state: validationResult ? "core-reported" : "unavailable",
    },
    {
      label: "Errors",
      value: String(validationErrors ?? 0),
      state: validationErrors && validationErrors > 0 ? "attention" : "nominal",
    },
    {
      label: "Warnings",
      value: String(validationWarnings ?? 0),
      state: validationWarnings && validationWarnings > 0 ? "attention" : "nominal",
    },
    {
      label: "Info",
      value: String(validationInfo ?? 0),
      state: validationInfo && validationInfo > 0 ? "reported" : "not-reported",
    },
  ];
  const validationFindingRows = lintReport?.findings.slice(0, 5) ?? [];

  const dashboardDomains = dashboardSummary?.model_domains.domains ?? [];
  const topEntityDomains = dashboardSummary
    ? dashboardTopEntries(dashboardSummary.entity_inventory.domains, 5)
    : [];
  const topRelationshipTypes = dashboardSummary
    ? dashboardTopEntries(dashboardSummary.relationship_inventory.relationship_types, 4)
    : [];
  const displayedIndexedScenarioRuns = scenarioRunIndex?.runs.slice(0, 3) ?? [];
  const scenarioReportSource = scenarioRunIndex
    ? "Core scenario run index"
    : simulationReport
      ? "Core simulation report"
      : "not reported";
  const scenarioSummaryCards = [
    {
      label: "Indexed",
      value: String(scenarioRunIndex?.summary.total ?? 0),
      state: scenarioRunIndex ? "core-reported" : "unavailable",
    },
    {
      label: "Passed",
      value: String(scenarioRunIndex?.summary.passed ?? 0),
      state:
        scenarioRunIndex && scenarioRunIndex.summary.passed > 0
          ? "reported"
          : "not-reported",
    },
    {
      label: "Failed",
      value: String(scenarioRunIndex?.summary.failed ?? 0),
      state:
        scenarioRunIndex && scenarioRunIndex.summary.failed > 0
          ? "attention"
          : "nominal",
    },
    {
      label: "Latest sim",
      value: simulationReport?.result ?? "not reported",
      state: simulationReport ? simulationReport.result : "not-reported",
    },
  ];
  const latestSimulationSummaryRows = simulationReport
    ? [
        ["Scenario", simulationReport.scenario],
        ["Events", String(simulationReport.summary.events)],
        ["Commands", String(simulationReport.summary.commands)],
        ["Mode transitions", String(simulationReport.summary.mode_transitions)],
        ["Data-flow evidence", String(simulationReport.summary.data_flow_evidence)],
        [
          "Failed expectations",
          String(simulationReport.summary.failed_expectations),
        ],
      ]
    : [];
  const topEntityCoverageRecords = coverageSummary
    ? dashboardTopCoverageRecords(coverageSummary.entity_coverage, 4)
    : [];
  const topExpectationCoverageTypes = coverageSummary
    ? dashboardTopEntries(
        Object.fromEntries(
          Object.entries(coverageSummary.expectation_coverage.by_type).map(
            ([expectationType, coverage]) => [expectationType, coverage.total],
          ),
        ),
        3,
      )
    : [];
  const unsupportedCoverageEntityDomains =
    coverageSummary?.unsupported.entity_domains ?? [];
  const unsupportedCoverageRelationshipTypes =
    coverageSummary?.unsupported.relationship_types ?? [];
  const generatedArtifactStatusItems = generatedArtifactSummary
    ? [
        ["Known", generatedArtifactSummary.knownArtifacts],
        ["Unknown", generatedArtifactSummary.unknownArtifacts],
        ["Previewable", generatedArtifactSummary.previewableArtifacts],
        ["Warnings", generatedArtifactSummary.warningCount],
      ]
    : [];
  const generatedLocationNames = new Set(
    (workspace?.generated_locations ?? []).map((entry) => entry.name.toLowerCase()),
  );
  const generatedArtifactCockpitCards = [
    {
      label: "Documentation",
      detail: "Generated Markdown documentation",
      location: "docs",
      value: generatedLocationNames.has("docs") ? "detected" : "not detected",
      state: generatedLocationNames.has("docs") ? "detected" : "not-detected",
    },
    {
      label: "Evidence reports",
      detail: "Validation, dashboard, scenario and coverage reports",
      location: "reports",
      value: generatedLocationNames.has("reports") ? "detected" : "not detected",
      state: generatedLocationNames.has("reports") ? "detected" : "not-detected",
    },
    {
      label: "Runtime skeleton",
      detail: "Runtime-facing generated contract outputs",
      location: "runtime",
      value: generatedLocationNames.has("runtime") ? "detected" : "not detected",
      state: generatedLocationNames.has("runtime") ? "detected" : "not-detected",
    },
    {
      label: "Ground artifacts",
      detail: "Ground-facing generated contract outputs",
      location: "ground",
      value: generatedLocationNames.has("ground") ? "detected" : "not detected",
      state: generatedLocationNames.has("ground") ? "detected" : "not-detected",
    },
  ];
  const generatedArtifactInventoryCards = generatedArtifactSummary
    ? [
        {
          label: "Total",
          value: String(generatedArtifactSummary.totalArtifacts),
          state: "inventory-reported",
        },
        {
          label: "Known",
          value: String(generatedArtifactSummary.knownArtifacts),
          state: "inventory-reported",
        },
        {
          label: "Previewable",
          value: String(generatedArtifactSummary.previewableArtifacts),
          state: "inventory-reported",
        },
        {
          label: "Warnings",
          value: String(generatedArtifactSummary.warningCount),
          state:
            generatedArtifactSummary.warningCount > 0
              ? "attention"
              : "inventory-reported",
        },
      ]
    : [
        {
          label: "Inventory",
          value: "not loaded",
          state: "not-loaded",
        },
      ];
  const hasReportsLocation = workspace?.generated_locations.some(
    (entry) => entry.name === "reports",
  );
  const hasLogsLocation = workspace?.generated_locations.some(
    (entry) => entry.name === "logs",
  );
  const workspaceCockpitName = workspace?.selected_path
    ? workspace.selected_path.split(/[\\/]/).filter(Boolean).slice(-1)[0]
    : null;
  const reportedEvidenceItems = [
    {
      label: "Contract",
      value: dashboardSummary ? "Core report" : "structural",
      isReported: Boolean(dashboardSummary),
    },
    {
      label: "Validation",
      value: validationResult ?? "not reported",
      isReported: Boolean(validationResult),
    },
    {
      label: "Scenario",
      value: scenarioRunIndex ? `${scenarioRunIndex.summary.total} indexed` : "unavailable",
      isReported: Boolean(scenarioRunIndex),
    },
    {
      label: "Coverage",
      value: coverageSummary ? "Core report" : "not reported",
      isReported: Boolean(coverageSummary),
    },
    {
      label: "Artifacts",
      value: generatedArtifactSummary
        ? `${generatedArtifactSummary.totalArtifacts} files`
        : "unavailable",
      isReported: Boolean(generatedArtifactSummary),
    },
  ] as const;
  const reportedEvidenceCount = reportedEvidenceItems.filter(
    (item) => item.isReported,
  ).length;
  const entityDomainIndex = new Map(
    (entityIndex?.domains ?? []).map((domain) => [domain.id, domain]),
  );
  const contractOverviewRows =
    dashboardDomains.length > 0
      ? dashboardDomains.map((domain) => {
          const indexedDomain = entityDomainIndex.get(domain.id);

          return {
            id: domain.id,
            label: domain.display_name,
            sourceFile: domain.source_file,
            required: domain.required ? "required" : "optional",
            present: domain.present ? "present" : "missing",
            count: String(domain.count),
            indexed: indexedDomain
              ? indexedDomain.indexed
                ? "indexed"
                : "not indexed"
              : "not reported",
            provenance: "Core dashboard summary",
          };
        })
      : (workspace?.source_model_files ?? []).slice(0, 12).map((entry) => ({
          id: entry.path,
          label: entry.name.replace(/\.ya?ml$/i, ""),
          sourceFile: entry.name,
          required: "not reported",
          present: "detected",
          count: "not reported",
          indexed: "not reported",
          provenance: "Workspace structural inspection",
        }));
  const contractOverviewSummaryItems = [
    {
      label: "Domains",
      value: dashboardSummary
        ? String(dashboardSummary.model_domains.domains.length)
        : String(workspace?.source_model_files.length ?? 0),
      state: dashboardSummary ? "core-reported" : workspace ? "structural" : "unavailable",
    },
    {
      label: "Entities",
      value: dashboardSummary
        ? String(dashboardSummary.entity_inventory.total_entities)
        : "not reported",
      state: dashboardSummary ? "core-reported" : "not-reported",
    },
    {
      label: "Relationships",
      value: dashboardSummary
        ? String(dashboardSummary.relationship_inventory.total_relationships)
        : "not reported",
      state: dashboardSummary ? "core-reported" : "not-reported",
    },
    {
      label: "Missing sources",
      value: String(workspace?.missing_expected_source_files.length ?? 0),
      state:
        workspace && workspace.missing_expected_source_files.length === 0
          ? "detected"
          : "attention",
    },
  ];


  return (
    <section
      id="studio-dashboard"
      className="workspace-dashboard cockpit-dashboard"
      aria-label="Mission cockpit dashboard"
    >
      <div className="cockpit-status-strip">
        <div className="cockpit-status-main">
          <DashboardIcon kind="mission" />
          <div>
            <span className="cockpit-eyebrow">Mission cockpit</span>
            <h2>OrbitFabric Studio</h2>
          </div>
        </div>

        <div className="cockpit-status-metrics" aria-label="Workspace quick metrics">
          <div className="cockpit-status-chip">
            <strong>{workspace?.source_model_files.length ?? 0}</strong>
            <span>Source files</span>
          </div>
          <div className="cockpit-status-chip">
            <strong>{workspace?.scenario_files.length ?? 0}</strong>
            <span>Scenarios</span>
          </div>
          <div className="cockpit-status-chip">
            <strong>{workspace?.generated_locations.length ?? 0}</strong>
            <span>Generated paths</span>
          </div>
        </div>

        <div className="cockpit-status-workspace">
          <div className="badge-row">
            <ProvenanceBadge label="READ-ONLY" />
            <ProvenanceBadge label="CORE-DERIVED" />
            <StatusBadge label={workspace ? "WORKSPACE OPEN" : "UNAVAILABLE"} />
          </div>
          <strong title={workspace?.selected_path ?? undefined}>
            {workspaceCockpitName ?? "No workspace selected"}
          </strong>
          <span title={workspace?.selected_path ?? undefined}>
            {workspace?.selected_path ?? "Open a workspace to inspect it."}
          </span>
        </div>
      </div>

      <div
        className="cockpit-kpi-grid cockpit-kpi-grid-north-star"
        aria-label="Mission cockpit north-star status cards"
      >
        {missionCockpitPosture.metrics.map((metric) => {
          const presentation = getMissionCockpitKpiPresentation(
            metric.kind,
            Boolean(workspace),
          );
          const kpiAction = presentation.action;

          return (
            <MissionCockpitKpiCard
              key={metric.kind}
              variant={presentation.variant}
              iconKind={presentation.iconKind}
              isReported={metric.state === "core-reported"}
              state={metric.state}
              title={metric.label}
              value={metric.value}
              detail={
                <>
                  <span>{metric.detail}</span>
                  <small className="cockpit-kpi-provenance">
                    {metric.provenance}
                  </small>
                </>
              }
              status={
                <StatusBadge label={formatCockpitMetricStateLabel(metric.state)} />
              }
              action={
                kpiAction
                  ? {
                      label: kpiAction.label,
                      onClick: () => onActiveSurfaceChange(kpiAction.surface),
                      disabled: kpiAction.disabled,
                    }
                  : undefined
              }
            />
          );
        })}
      </div>

      <MissionCockpitEvidenceLanes
        reportedEvidenceCount={reportedEvidenceCount}
        reportedEvidenceItems={reportedEvidenceItems}
      />

      <div className="cockpit-work-grid">
        <article className="cockpit-panel cockpit-panel-large cockpit-contract-overview-panel">
          <MissionCockpitPanelHeader
            eyebrow="Mission data contract"
            title={
              dashboardSummary
                ? "Core-derived contract overview"
                : "Workspace structural overview"
            }
            trailing={
              <div className="badge-row">
                <StatusBadge
                  label={dashboardSummary ? "CORE DASHBOARD" : "STRUCTURAL"}
                />
                <StatusBadge label={entityIndex ? "ENTITY INDEX" : "NO INDEX"} />
              </div>
            }
          />

          <div className="cockpit-contract-overview-shell">
            <div
              className="cockpit-contract-summary-strip"
              aria-label="Mission contract overview summary"
            >
              {contractOverviewSummaryItems.map((item) => (
                <div
                  className={`cockpit-contract-summary-card cockpit-contract-summary-${item.state}`}
                  key={item.label}
                >
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <small>{item.state}</small>
                </div>
              ))}
            </div>

            <div
              className="cockpit-contract-overview-table"
              role="table"
              aria-label="Mission data contract domain overview"
            >
              <div className="cockpit-contract-overview-row cockpit-contract-overview-head" role="row">
                <span role="columnheader">Domain</span>
                <span role="columnheader">Source</span>
                <span role="columnheader">Required</span>
                <span role="columnheader">Presence</span>
                <span role="columnheader">Entities</span>
                <span role="columnheader">Index</span>
              </div>

              {contractOverviewRows.length > 0 ? (
                contractOverviewRows.map((row) => (
                  <div
                    className={`cockpit-contract-overview-row cockpit-contract-overview-row-${row.present}`}
                    role="row"
                    key={row.id}
                  >
                    <span role="cell">
                      <strong>{row.label}</strong>
                      <small>{row.provenance}</small>
                    </span>
                    <span role="cell">{row.sourceFile}</span>
                    <span role="cell">{row.required}</span>
                    <span role="cell">
                      <StatusBadge label={row.present.toUpperCase()} />
                    </span>
                    <span role="cell">{row.count}</span>
                    <span role="cell">{row.indexed}</span>
                  </div>
                ))
              ) : (
                <div className="cockpit-empty-module cockpit-empty-module-dormant">
                  <strong>No contract overview available</strong>
                  <span>Open a workspace or run Core dashboard-summary.</span>
                </div>
              )}
            </div>

            <div className="cockpit-contract-side-grid">
              <div className="cockpit-compact-list">
                <h4>Top entity domains</h4>
                {topEntityDomains.length > 0 ? (
                  topEntityDomains.map(([domain, count]) => (
                    <div className="cockpit-row" key={domain}>
                      <span>{domain}</span>
                      <strong>{count}</strong>
                    </div>
                  ))
                ) : (
                  <div className="cockpit-empty-module cockpit-empty-module-dormant">
                    <strong>No entity inventory</strong>
                    <span>Core dashboard summary required.</span>
                  </div>
                )}
              </div>

              <div className="cockpit-compact-list">
                <h4>Top relationships</h4>
                {topRelationshipTypes.length > 0 ? (
                  topRelationshipTypes.map(([relationshipType, count]) => (
                    <div className="cockpit-row" key={relationshipType}>
                      <span>{relationshipType}</span>
                      <strong>{count}</strong>
                    </div>
                  ))
                ) : (
                  <div className="cockpit-empty-module cockpit-empty-module-dormant">
                    <strong>No relationship inventory</strong>
                    <span>Core dashboard summary required.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="cockpit-contract-overview-actions">
              <button
                type="button"
                className="cockpit-secondary-action"
                onClick={() => onActiveSurfaceChange("model-inventory")}
                disabled={!workspace}
              >
                Open Model Inventory
              </button>
              <button
                type="button"
                className="cockpit-secondary-action"
                onClick={() => onActiveSurfaceChange("contracts")}
                disabled={!workspace}
              >
                Open Contracts
              </button>
              <button
                type="button"
                className="cockpit-secondary-action"
                onClick={() => onActiveSurfaceChange("mission-data-flow-workbench")}
                disabled={!workspace}
              >
                Inspect Data Flow
              </button>
            </div>
          </div>
        </article>

        <article className="cockpit-panel cockpit-panel-validation cockpit-validation-results-panel">
          <MissionCockpitPanelHeader
            eyebrow="Validation"
            title="Recent validation results"
            trailing={
              <div className="badge-row">
                <StatusBadge
                  label={validationResult ? validationResult.toUpperCase() : "UNAVAILABLE"}
                />
                <StatusBadge label={lintReport ? "LINT REPORT" : "DASHBOARD FALLBACK"} />
              </div>
            }
          />

          <div className="cockpit-validation-shell">
            <div
              className="cockpit-validation-summary-strip"
              aria-label="Recent validation summary"
            >
              {validationSummaryCards.map((item) => (
                <div
                  className={`cockpit-validation-summary-card cockpit-validation-summary-${item.state}`}
                  key={item.label}
                >
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <small>{item.state}</small>
                </div>
              ))}
            </div>

            <div className="cockpit-validation-source-line">
              <span>Source</span>
              <strong>{validationReportSource}</strong>
            </div>

            <div
              className="cockpit-validation-findings-table"
              role="table"
              aria-label="Recent Core validation findings"
            >
              <div className="cockpit-validation-finding-row cockpit-validation-finding-head" role="row">
                <span role="columnheader">Code</span>
                <span role="columnheader">Domain</span>
                <span role="columnheader">Object</span>
                <span role="columnheader">File</span>
                <span role="columnheader">Message</span>
              </div>

              {validationFindingRows.length > 0 ? (
                validationFindingRows.map((finding) => (
                  <div
                    className="cockpit-validation-finding-row"
                    role="row"
                    key={`${finding.code}-${finding.domain ?? "domain"}-${finding.object_id ?? "object"}-${finding.message}`}
                  >
                    <span role="cell">
                      <strong>{finding.code}</strong>
                    </span>
                    <span role="cell">{finding.domain ?? "not reported"}</span>
                    <span role="cell">{finding.object_id ?? "not reported"}</span>
                    <span role="cell">{finding.file ?? "not reported"}</span>
                    <span role="cell">
                      <strong>{finding.message}</strong>
                      {finding.suggestion ? <small>{finding.suggestion}</small> : null}
                    </span>
                  </div>
                ))
              ) : validationResult ? (
                <div className="cockpit-empty-module cockpit-empty-module-dormant">
                  <strong>No detailed findings reported</strong>
                  <span>Core validation status is available, but no finding rows were reported.</span>
                </div>
              ) : (
                <div className="cockpit-empty-module">
                  <strong>No validation report</strong>
                  <span>Run Core validation to populate this module.</span>
                </div>
              )}
            </div>

            <div className="cockpit-validation-actions">
              <button
                type="button"
                className="cockpit-secondary-action"
                onClick={() => onActiveSurfaceChange("reports-logs")}
                disabled={!workspace}
              >
                Open Reports
              </button>
              <button
                type="button"
                className="cockpit-secondary-action"
                onClick={() => onActiveSurfaceChange("core-commands")}
                disabled={!workspace}
              >
                Open Core
              </button>
            </div>
          </div>
        </article>

        <article className="cockpit-panel cockpit-panel-scenario cockpit-scenario-runs-panel">
          <MissionCockpitPanelHeader
            eyebrow="Scenario"
            title="Recent scenario runs"
            trailing={
              <div className="badge-row">
                <StatusBadge
                  label={scenarioRunIndex ? "RUN INDEX" : "NO INDEX"}
                />
                <StatusBadge
                  label={simulationReport ? "SIM REPORT" : "NO SIM REPORT"}
                />
              </div>
            }
          />

          <div className="cockpit-scenario-shell">
            <div
              className="cockpit-scenario-summary-strip"
              aria-label="Recent scenario run summary"
            >
              {scenarioSummaryCards.map((item) => (
                <div
                  className={`cockpit-scenario-summary-card cockpit-scenario-summary-${item.state}`}
                  key={item.label}
                >
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <small>{item.state}</small>
                </div>
              ))}
            </div>

            <div className="cockpit-scenario-source-line">
              <span>Source</span>
              <strong>{scenarioReportSource}</strong>
            </div>

            <div
              className="cockpit-scenario-runs-table"
              role="table"
              aria-label="Recent Core scenario runs"
            >
              <div className="cockpit-scenario-run-row cockpit-scenario-run-head" role="row">
                <span role="columnheader">Scenario</span>
                <span role="columnheader">Mission</span>
                <span role="columnheader">Result</span>
                <span role="columnheader">Report</span>
              </div>

              {displayedIndexedScenarioRuns.length > 0 ? (
                displayedIndexedScenarioRuns.map((run) => (
                  <div
                    className={`cockpit-scenario-run-row cockpit-scenario-run-${run.result}`}
                    role="row"
                    key={`${run.report_path}-${run.scenario}`}
                  >
                    <span role="cell">
                      <strong>{run.scenario}</strong>
                    </span>
                    <span role="cell">{run.mission}</span>
                    <span role="cell">
                      <StatusBadge label={run.result.toUpperCase()} />
                    </span>
                    <span role="cell">{run.report_file}</span>
                  </div>
                ))
              ) : scenarioRunIndex ? (
                <div className="cockpit-empty-module cockpit-empty-module-dormant">
                  <strong>Scenario index reported</strong>
                  <span>No scenario runs indexed yet.</span>
                </div>
              ) : (
                <div className="cockpit-empty-module cockpit-empty-module-dormant">
                  <strong>No scenario index</strong>
                  <span>Run scenario-run-index to populate this module.</span>
                </div>
              )}
            </div>

            <div className="cockpit-scenario-latest-report">
              <div className="cockpit-scenario-latest-header">
                <span>Latest simulation report</span>
                <strong>{simulationReport ? simulationReport.result : "not reported"}</strong>
              </div>

              {latestSimulationSummaryRows.length > 0 ? (
                <div className="cockpit-scenario-latest-grid">
                  {latestSimulationSummaryRows.map(([label, value]) => (
                    <div className="cockpit-scenario-latest-cell" key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cockpit-empty-module cockpit-empty-module-dormant">
                  <strong>No simulation report</strong>
                  <span>Load or run a Core simulation report to populate latest run details.</span>
                </div>
              )}
            </div>

            <div className="cockpit-scenario-actions">
              <button
                type="button"
                className="cockpit-secondary-action"
                onClick={() => onActiveSurfaceChange("scenario-evidence")}
                disabled={!workspace}
              >
                Open Scenario Evidence
              </button>
              <button
                type="button"
                className="cockpit-secondary-action"
                onClick={() => onActiveSurfaceChange("mission-data-flow-workbench")}
                disabled={!workspace}
              >
                Inspect Data Flow
              </button>
            </div>
          </div>
        </article>

        <article className="cockpit-panel cockpit-panel-coverage">
          <MissionCockpitPanelHeader
            eyebrow="Coverage"
            title="Reported scopes"
            trailing={<DashboardIcon kind="coverage" />}
          />

          <div className="cockpit-compact-list">
            {topEntityCoverageRecords.length > 0 ? (
              topEntityCoverageRecords.map(([domain, coverage]) => (
                <div className="cockpit-row" key={domain}>
                  <span>{domain}</span>
                  <strong>
                    {coverage.covered}/{coverage.total}
                  </strong>
                </div>
              ))
            ) : (
              <div className="cockpit-empty-module">
                <strong>No coverage records</strong>
                <span>Run Core coverage-summary to populate this module.</span>
              </div>
            )}
          </div>

          <div className="cockpit-mini-status">
            <span>Expectation types</span>
            <strong>{topExpectationCoverageTypes.length}</strong>
          </div>
        </article>

        <article className="cockpit-panel cockpit-panel-generated cockpit-generated-artifacts-panel">
          <MissionCockpitPanelHeader
            eyebrow="Generated"
            title="Generated artifacts"
            trailing={
              <div className="badge-row">
                <StatusBadge
                  label={generatedArtifactSummary ? "INVENTORY LOADED" : "NO INVENTORY"}
                />
                <StatusBadge
                  label={workspace?.generated_dir ? "GENERATED DIR" : "NO GENERATED DIR"}
                />
              </div>
            }
          />

          <div className="cockpit-generated-shell">
            <div
              className="cockpit-generated-card-grid"
              aria-label="Generated artifact class cards"
            >
              {generatedArtifactCockpitCards.map((card) => (
                <div
                  className={`cockpit-generated-card cockpit-generated-card-${card.state}`}
                  key={card.label}
                >
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                  <small>{card.detail}</small>
                  <em>{card.location}</em>
                </div>
              ))}
            </div>

            <div
              className="cockpit-generated-inventory-strip"
              aria-label="Generated artifact inventory summary"
            >
              {generatedArtifactInventoryCards.map((item) => (
                <div
                  className={`cockpit-generated-inventory-card cockpit-generated-inventory-${item.state}`}
                  key={item.label}
                >
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="cockpit-generated-source-line">
              <span>Inventory source</span>
              <strong>
                {generatedArtifactSummary
                  ? generatedArtifactSummary.generatedDir ?? "generated directory"
                  : "open Generated Artifacts to inspect inventory"}
              </strong>
            </div>

            <div className="cockpit-generated-actions">
              <button
                type="button"
                className="cockpit-secondary-action"
                onClick={() => onActiveSurfaceChange("generated-artifacts")}
                disabled={!workspace}
              >
                Open Generated Artifacts
              </button>
              <button
                type="button"
                className="cockpit-secondary-action"
                onClick={() => onActiveSurfaceChange("reports-logs")}
                disabled={!workspace}
              >
                Open Reports
              </button>
            </div>
          </div>
        </article>
      </div>

      <MissionDataFlowWorkbenchSurface snapshot={missionDataFlowWorkbenchSnapshot} />

      <div className="cockpit-bottom-rail" aria-label="Mission cockpit status rail">
        <div className="cockpit-bottom-cell cockpit-bottom-cell-primary">
          <DashboardIcon kind="shield" />
          <div>
            <span className="cockpit-eyebrow">Boundary</span>
            <strong>Read-only Studio surface</strong>
          </div>
        </div>

        <div className="cockpit-bottom-guardrails">
          <span>No editing</span>
          <span>No uplink</span>
          <span>No live telemetry</span>
          <span>No private coverage</span>
        </div>

        <div className="cockpit-bottom-cell">
          <span>Reports</span>
          <strong>{hasReportsLocation ? "detected" : "not detected"}</strong>
        </div>

        <div className="cockpit-bottom-cell">
          <span>Logs</span>
          <strong>{hasLogsLocation ? "detected" : "not detected"}</strong>
        </div>

        <div className="cockpit-bottom-cell cockpit-bottom-cell-wide">
          <span>Unsupported coverage</span>
          <strong>
            Entities: {" "}
            {unsupportedCoverageEntityDomains.length > 0
              ? unsupportedCoverageEntityDomains.join(", ")
              : "none"}{" "}
            · Relationships: {" "}
            {unsupportedCoverageRelationshipTypes.length > 0
              ? unsupportedCoverageRelationshipTypes.join(", ")
              : "none"}
          </strong>
        </div>

        <button
          type="button"
          className="cockpit-secondary-action"
          onClick={() => onActiveSurfaceChange("core-commands")}
          disabled={!workspace}
        >
          Run Core
        </button>
      </div>
    </section>
  );
}
