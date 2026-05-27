import { ProvenanceBadge, StatusBadge } from "./Badges";
import { DashboardIcon } from "./DashboardIcon";
import { type GeneratedArtifactDashboardSummary } from "./GeneratedArtifactExplorer";
import { type ActiveSurface } from "./navigationModel";
import {
  parseCoreCoverageSummary,
  parseCoreDashboardSummary,
  parseCoreLintReport,
  parseCoreScenarioRunIndex,
  parseCoreSimulationReport,
} from "./coreReports";
import type {
  CoreCommandResult,
  WorkspaceInspection,
} from "./types/workspace";
import {
  dashboardTopCoverageRecords,
  dashboardTopEntries,
  formatDashboardStatusLabel,
  type CoreReportSnapshots,
} from "./missionCockpitModel";

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
  const lintReport =
    parseCoreLintReport(currentReportContent) ?? coreReportSnapshots.lintReport;
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

  const dashboardValidation = dashboardSummary?.validation ?? null;
  const validationResult = lintReport?.result ?? dashboardValidation?.result ?? null;
  const validationErrors =
    lintReport?.summary.errors ?? dashboardValidation?.errors ?? null;
  const validationWarnings =
    lintReport?.summary.warnings ?? dashboardValidation?.warnings ?? null;
  const validationInfo =
    lintReport?.summary.info ?? dashboardValidation?.info ?? null;

  const dashboardDomains = dashboardSummary?.model_domains.domains ?? [];
  const topEntityDomains = dashboardSummary
    ? dashboardTopEntries(dashboardSummary.entity_inventory.domains, 5)
    : [];
  const topRelationshipTypes = dashboardSummary
    ? dashboardTopEntries(dashboardSummary.relationship_inventory.relationship_types, 4)
    : [];
  const displayedIndexedScenarioRuns = scenarioRunIndex?.runs.slice(0, 3) ?? [];
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
  const cockpitContractMapItems =
    dashboardDomains.length > 0
      ? dashboardDomains.slice(0, 6).map((domain) => ({
          label: domain.display_name,
          value: String(domain.count),
          state: "reported",
        }))
      : [
          {
            label: "Source files",
            value: String(workspace?.source_model_files.length ?? 0),
            state: workspace ? "detected" : "missing",
          },
          {
            label: "Scenarios",
            value: String(workspace?.scenario_files.length ?? 0),
            state: workspace ? "detected" : "missing",
          },
          {
            label: "Generated",
            value: String(workspace?.generated_locations.length ?? 0),
            state: workspace ? "detected" : "missing",
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

      <div className="cockpit-kpi-grid" aria-label="Mission cockpit status cards">
        <article
          className={`cockpit-kpi-card cockpit-kpi-card-validation ${
            validationResult ? "cockpit-kpi-state-reported" : "cockpit-kpi-state-unavailable"
          }`}
        >
          <DashboardIcon kind="validation" />
          <div>
            <h3>Validation</h3>
            <strong>{validationResult ?? "Unavailable"}</strong>
            <span>
              {validationErrors === null &&
              validationWarnings === null &&
              validationInfo === null
                ? "Run validation to populate status"
                : `Errors ${validationErrors ?? 0} · Warnings ${
                    validationWarnings ?? 0
                  } · Info ${validationInfo ?? 0}`}
            </span>
          </div>
          <StatusBadge label={formatDashboardStatusLabel(validationResult)} />
        </article>

        <article
          className={`cockpit-kpi-card cockpit-kpi-card-model ${
            workspace ? "cockpit-kpi-state-reported" : "cockpit-kpi-state-unavailable"
          }`}
        >
          <DashboardIcon kind="model" />
          <div>
            <h3>{dashboardSummary ? "Core entity inventory" : "Workspace source files"}</h3>
            <strong>
              {dashboardSummary
                ? `${dashboardSummary.entity_inventory.total_entities} entities`
                : workspace
                  ? `${workspace.source_model_files.length} files`
                  : "Unavailable"}
            </strong>
            <span>
              {dashboardSummary
                ? `${dashboardSummary.relationship_inventory.total_relationships} relationships`
                : workspace ? "Structural workspace detection" : "Core dashboard summary not loaded"}
            </span>
          </div>
          <button
            type="button"
            className="cockpit-card-action"
            onClick={() => onActiveSurfaceChange("model-inventory")}
            disabled={!workspace}
          >
            Detail
          </button>
        </article>

        <article
          className={`cockpit-kpi-card cockpit-kpi-card-scenario ${
            scenarioRunIndex ? "cockpit-kpi-state-reported" : "cockpit-kpi-state-unavailable"
          }`}
        >
          <DashboardIcon kind="scenario" />
          <div>
            <h3>Scenario run index</h3>
            <strong>
              {scenarioRunIndex
                ? `${scenarioRunIndex.summary.total} indexed`
                : "Unavailable"}
            </strong>
            <span>
              {scenarioRunIndex
                ? `${scenarioRunIndex.summary.passed} passed, ${scenarioRunIndex.summary.failed} failed`
                : "Run Core scenario-run-index"}
            </span>
          </div>
          <button
            type="button"
            className="cockpit-card-action"
            onClick={() => onActiveSurfaceChange("scenario-evidence")}
            disabled={!workspace}
          >
            Evidence
          </button>
        </article>

        <article
          className={`cockpit-kpi-card cockpit-kpi-card-coverage ${
            coverageSummary ? "cockpit-kpi-state-reported" : "cockpit-kpi-state-unavailable"
          }`}
        >
          <DashboardIcon kind="coverage" />
          <div>
            <h3>Coverage summary</h3>
            <strong>{coverageSummary ? "Reported" : "Not reported"}</strong>
            <span>
              {coverageSummary
                ? `${coverageSummary.expectation_coverage.passed}/${coverageSummary.expectation_coverage.total} expectations`
                : "Run Core coverage-summary"}
            </span>
          </div>
          <button
            type="button"
            className="cockpit-card-action"
            onClick={() => onActiveSurfaceChange("reports-logs")}
            disabled={!workspace}
          >
            Report
          </button>
        </article>

        <article
          className={`cockpit-kpi-card cockpit-kpi-card-artifacts ${
            generatedArtifactSummary ? "cockpit-kpi-state-reported" : "cockpit-kpi-state-unavailable"
          }`}
        >
          <DashboardIcon kind="artifacts" />
          <div>
            <h3>Generated artifact inventory</h3>
            <strong>
              {generatedArtifactSummary
                ? `${generatedArtifactSummary.totalArtifacts} files`
                : "Unavailable"}
            </strong>
            <span>
              {generatedArtifactSummary
                ? `${generatedArtifactSummary.previewableArtifacts} previewable`
                : "Inspect generated artifacts to load inventory"}
            </span>
          </div>
          <button
            type="button"
            className="cockpit-card-action"
            onClick={() => onActiveSurfaceChange("generated-artifacts")}
            disabled={!workspace}
          >
            Open
          </button>
        </article>
      </div>

      <div className="cockpit-tactical-band" aria-label="Reported evidence lanes band">
        <div className="cockpit-tactical-summary">
          <span className="cockpit-eyebrow">Reported evidence lanes</span>
          <strong>
            {reportedEvidenceCount}/{reportedEvidenceItems.length} evidence lanes populated
          </strong>
        </div>

        <div className="cockpit-tactical-segments">
          {reportedEvidenceItems.map((item) => (
            <div
              className={`cockpit-tactical-segment ${
                item.isReported
                  ? "cockpit-tactical-segment-ready"
                  : "cockpit-tactical-segment-missing"
              }`}
              key={item.label}
            >
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="cockpit-work-grid">
        <article className="cockpit-panel cockpit-panel-large">
          <div className="cockpit-panel-header">
            <div>
              <span className="cockpit-eyebrow">Mission data contract</span>
              <h3>{dashboardSummary ? "Core-derived contract map" : "Workspace structural map"}</h3>
            </div>
            <StatusBadge label={dashboardSummary ? "CORE-REPORTED" : "STRUCTURAL"} />
          </div>

          <div className="cockpit-contract-topology" aria-label="Mission contract topology map">
            {cockpitContractMapItems.map((item, index) => (
              <div
                className={`cockpit-contract-node ${
                  item.state === "missing"
                    ? "cockpit-contract-node-missing"
                    : "cockpit-contract-node-detected"
                }`}
                key={`${item.label}-${index}`}
              >
                <span className="cockpit-contract-node-index">
                  {index + 1 < 10 ? `0${index + 1}` : index + 1}
                </span>
                <div>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
                <small>{item.state}</small>
              </div>
            ))}
          </div>

          <div className="cockpit-two-column">
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
                  <span>Run Core dashboard-summary to populate this lane.</span>
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
                  <span>Run Core dashboard-summary to populate this lane.</span>
                </div>
              )}
            </div>
          </div>
        </article>

        <article className="cockpit-panel cockpit-panel-validation">
          <div className="cockpit-panel-header">
            <div>
              <span className="cockpit-eyebrow">Validation</span>
              <h3>Recent results</h3>
            </div>
            <DashboardIcon kind="validation" />
          </div>

          <div className="cockpit-compact-list">
            {validationResult ? (
              <>
                <div className="cockpit-row">
                  <span>Result</span>
                  <strong>{validationResult}</strong>
                </div>
                <div className="cockpit-row">
                  <span>Errors</span>
                  <strong>{validationErrors ?? 0}</strong>
                </div>
                <div className="cockpit-row">
                  <span>Warnings</span>
                  <strong>{validationWarnings ?? 0}</strong>
                </div>
                <div className="cockpit-row">
                  <span>Info</span>
                  <strong>{validationInfo ?? 0}</strong>
                </div>
              </>
            ) : (
              <div className="cockpit-empty-module">
                <strong>No validation report</strong>
                <span>Run Core validation to populate this module.</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="cockpit-secondary-action"
            onClick={() => onActiveSurfaceChange("core-commands")}
            disabled={!workspace}
          >
            Open Core
          </button>
        </article>

        <article className="cockpit-panel cockpit-panel-scenario">
          <div className="cockpit-panel-header">
            <div>
              <span className="cockpit-eyebrow">Scenario</span>
              <h3>Recent runs</h3>
            </div>
            <DashboardIcon kind="evidence" />
          </div>

          <div className="cockpit-compact-list">
            {displayedIndexedScenarioRuns.length > 0 ? (
              displayedIndexedScenarioRuns.map((run) => (
                <div className="cockpit-row" key={`${run.report_path}-${run.scenario}`}>
                  <span>{run.scenario}</span>
                  <strong>{run.result}</strong>
                </div>
              ))
            ) : (
              <div className="cockpit-empty-module">
                <strong>No scenario index</strong>
                <span>Run scenario-run-index to populate this module.</span>
              </div>
            )}
          </div>

          <div className="cockpit-mini-status">
            <span>Latest sim</span>
            <strong>{simulationReport ? simulationReport.result : "not reported"}</strong>
          </div>

          <button
            type="button"
            className="cockpit-secondary-action"
            onClick={() => onActiveSurfaceChange("scenario-evidence")}
            disabled={!workspace}
          >
            Open evidence
          </button>
        </article>

        <article className="cockpit-panel cockpit-panel-coverage">
          <div className="cockpit-panel-header">
            <div>
              <span className="cockpit-eyebrow">Coverage</span>
              <h3>Reported scopes</h3>
            </div>
            <DashboardIcon kind="coverage" />
          </div>

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

        <article className="cockpit-panel cockpit-panel-generated">
          <div className="cockpit-panel-header">
            <div>
              <span className="cockpit-eyebrow">Generated</span>
              <h3>Artifact state</h3>
            </div>
            <DashboardIcon kind="artifacts" />
          </div>

          <div className="cockpit-compact-list">
            {generatedArtifactStatusItems.length > 0 ? (
              generatedArtifactStatusItems.map(([label, value]) => (
                <div className="cockpit-row" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))
            ) : (
              <div className="cockpit-empty-module">
                <strong>No artifact inventory</strong>
                <span>Open the generated artifact surface to load inventory.</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="cockpit-secondary-action"
            onClick={() => onActiveSurfaceChange("generated-artifacts")}
            disabled={!workspace}
          >
            Open artifact surface
          </button>
        </article>


      </div>

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
            Entities:{" "}
            {unsupportedCoverageEntityDomains.length > 0
              ? unsupportedCoverageEntityDomains.join(", ")
              : "none"}{" "}
            · Relationships:{" "}
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
