import { useMemo, useState } from "react";

import { DashboardIcon } from "./DashboardIcon";
import { ProvenanceBadge, StatusBadge } from "./Badges";
import type {
  CoreCommandResult,
  CoreCoverageSummary,
  CoreDashboardSummary,
  CoreEntityIndex,
  CoreLintReport,
  CoreModelSummary,
  CoreRelationshipManifest,
  CoreScenarioRunIndex,
  CoreSimulationReport,
  ProjectEntry,
  WorkspaceInspection,
} from "./types/workspace";

export interface CoreReportRunnerReports {
  lintReport: CoreLintReport | null;
  modelSummary: CoreModelSummary | null;
  entityIndex: CoreEntityIndex | null;
  relationshipManifest: CoreRelationshipManifest | null;
  dashboardSummary: CoreDashboardSummary | null;
  scenarioRunIndex: CoreScenarioRunIndex | null;
  coverageSummary: CoreCoverageSummary | null;
  simulationReports: CoreSimulationReport[];
}

export interface CoreReportRunnerSurfaceProps {
  workspace: WorkspaceInspection;
  coreExecutable: string;
  coreResult: CoreCommandResult | null;
  coreError: string | null;
  isRunningCoreCommand: boolean;
  reports: CoreReportRunnerReports;
  onCoreExecutableChange: (value: string) => void;
  onCoreVersion: () => Promise<void>;
  onCoreInspectMission: () => Promise<void>;
  onCoreLintMission: () => Promise<void>;
  onCoreExportModelSummary: () => Promise<void>;
  onCoreExportEntityIndex: () => Promise<void>;
  onCoreExportRelationshipManifest: () => Promise<void>;
  onCoreExportDashboardSummary: () => Promise<void>;
  onCoreExportScenarioRunIndex: () => Promise<void>;
  onCoreExportCoverageSummary: () => Promise<void>;
  onOpenFile: (entry: ProjectEntry) => void;
}

type RunnerOutputTab = "stdout" | "stderr" | "command" | "report-json";

type CoreReportRunnerActionId =
  | "core-version"
  | "inspect-mission"
  | "validate-mission"
  | "model-summary"
  | "entity-index"
  | "relationship-manifest"
  | "dashboard-summary"
  | "scenario-run-index"
  | "coverage-summary";

interface CoreReportRunnerAction {
  id: CoreReportRunnerActionId;
  group: "environment" | "mission" | "model" | "scenario";
  icon: "core" | "artifacts" | "shield" | "model" | "relationships" | "reports" | "scenario" | "coverage";
  title: string;
  description: string;
  expectedOutput: string;
  commandPreview: string;
  buttonLabel: "Run" | "Refresh";
  consumers: string[];
  disabledReason: string | null;
  run: () => Promise<void>;
}

interface ReportPreviewModel {
  kind:
    | "lint"
    | "model-summary"
    | "entity-index"
    | "relationship-manifest"
    | "dashboard-summary"
    | "scenario-run-index"
    | "coverage-summary";
  title: string;
  source: "latest" | "snapshot";
  metrics: { label: string; value: string }[];
  files: string[];
  companionEvidence: string[];
  consumers: string[];
  note: string;
}

const actionGroupLabels: Record<CoreReportRunnerAction["group"], string> = {
  environment: "A. Environment",
  mission: "B. Mission structure",
  model: "C. Model evidence",
  scenario: "D. Scenario evidence",
};

const reportFileByAction: Partial<Record<CoreReportRunnerActionId, string>> = {
  "validate-mission": "lint_report.json",
  "model-summary": "model_summary.json",
  "entity-index": "entity_index.json",
  "relationship-manifest": "relationship_manifest.json",
  "dashboard-summary": "dashboard_summary.json",
  "scenario-run-index": "scenario_run_index.json",
  "coverage-summary": "coverage_summary.json",
};

export function CoreReportRunnerSurface({
  workspace,
  coreExecutable,
  coreResult,
  coreError,
  isRunningCoreCommand,
  reports,
  onCoreExecutableChange,
  onCoreVersion,
  onCoreInspectMission,
  onCoreLintMission,
  onCoreExportModelSummary,
  onCoreExportEntityIndex,
  onCoreExportRelationshipManifest,
  onCoreExportDashboardSummary,
  onCoreExportScenarioRunIndex,
  onCoreExportCoverageSummary,
  onOpenFile,
}: CoreReportRunnerSurfaceProps) {
  const [focusedActionId, setFocusedActionId] =
    useState<CoreReportRunnerActionId>("scenario-run-index");
  const [outputTab, setOutputTab] = useState<RunnerOutputTab>("stdout");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const generatedInventory = useMemo(
    () => summarizeGeneratedInventory(workspace, reports),
    [workspace, reports],
  );
  const latestPreview = useMemo(
    () => resolveReportPreview(coreResult, reports),
    [coreResult, reports],
  );

  const actions = buildCoreActions({
    workspace,
    coreExecutable,
    isRunningCoreCommand,
    onCoreVersion,
    onCoreInspectMission,
    onCoreLintMission,
    onCoreExportModelSummary,
    onCoreExportEntityIndex,
    onCoreExportRelationshipManifest,
    onCoreExportDashboardSummary,
    onCoreExportScenarioRunIndex,
    onCoreExportCoverageSummary,
  });

  const focusedAction = actions.find((action) => action.id === focusedActionId) ?? actions[0];
  const executionContextCards = [
    {
      icon: "core" as const,
      label: "Core executable",
      value: coreExecutable.trim() ? "available" : "not configured",
      state: coreExecutable.trim() ? "positive" : "blocked",
    },
    {
      icon: "artifacts" as const,
      label: "Mission directory",
      value: workspace.mission_dir ? "available" : "not available",
      state: workspace.mission_dir ? "positive" : "blocked",
    },
    {
      icon: "reports" as const,
      label: "Generated directory",
      value: workspace.generated_dir ? "available" : "not available",
      state: workspace.generated_dir ? "positive" : "blocked",
    },
    {
      icon: "evidence" as const,
      label: "Reports detected",
      value: generatedInventory.reports,
      state: generatedInventory.reports === "not reported" ? "neutral" : "positive",
    },
    {
      icon: "coverage" as const,
      label: "Last Core run",
      value: coreResult ? (coreResult.success ? "completed" : "failed") : "not reported",
      state: coreResult ? (coreResult.success ? "positive" : "blocked") : "neutral",
    },
  ];

  async function handleRunAction(action: CoreReportRunnerAction) {
    setFocusedActionId(action.id);
    await action.run();
  }

  function handleOpenProducedReport() {
    if (!coreResult?.json_report_available || !coreResult.json_report_path) {
      return;
    }

    onOpenFile({
      name: basename(coreResult.json_report_path),
      path: coreResult.json_report_path,
      kind: "file",
      category: "derivedReport",
    });
  }

  async function handleCopyCommand() {
    const command = coreResult
      ? formatCoreCommand(coreResult)
      : focusedAction?.commandPreview ?? coreExecutable;

    try {
      await navigator.clipboard?.writeText(command);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("failed");
      window.setTimeout(() => setCopyState("idle"), 1800);
    }
  }

  return (
    <section
      id="studio-core-report-runner"
      className="core-report-runner-surface"
      aria-label="Core Report Runner"
    >
      <section className="core-runner-hero" aria-labelledby="core-runner-title">
        <div className="core-runner-hero-copy">
          <span className="core-runner-eyebrow">Mission Evidence Control</span>
          <h1 id="core-runner-title">Core Report Runner</h1>
          <p className="core-runner-lead">
            Run fixed Core wrappers and inspect generated mission reports.
          </p>
          <div className="badge-row core-runner-badge-row">
            <ProvenanceBadge label="READ-ONLY" />
            <ProvenanceBadge label="CORE-OWNED" />
            <StatusBadge label="FIXED WRAPPERS" />
            <StatusBadge label="NO YAML EDITOR" />
            <StatusBadge label="NO COMMAND UPLINK" />
          </div>
        </div>

        <div className="core-runner-generated-strip" aria-label="Generated inventory summary">
          <InventoryPill icon="artifacts" label="Docs" value={generatedInventory.docs} />
          <InventoryPill icon="reports" label="Reports" value={generatedInventory.reports} />
          <InventoryPill icon="evidence" label="Logs" value={generatedInventory.logs} />
          <InventoryPill icon="raw" label="Runtime" value={generatedInventory.runtime} />
          <InventoryPill icon="ground" label="Ground" value={generatedInventory.ground} />
        </div>
      </section>

      <section className="core-runner-readiness-grid" aria-label="Core execution context">
        {executionContextCards.map((card) => (
          <div key={card.label} className={`core-runner-readiness-card core-runner-state-${card.state}`}>
            <DashboardIcon kind={card.icon} />
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </section>

      <section className="core-runner-executable-card" aria-label="Core executable binding">
        <div>
          <span className="core-runner-section-kicker">Executable binding</span>
          <h2>OrbitFabric Core executable</h2>
          <p>
            This binding is passed only to fixed Core wrappers. Studio does not expose a free shell.
          </p>
        </div>
        <label className="core-runner-executable-field">
          <span>Executable</span>
          <input
            value={coreExecutable}
            onChange={(event) => onCoreExecutableChange(event.target.value)}
            aria-label="OrbitFabric Core executable"
          />
        </label>
      </section>

      <div className="core-runner-main-grid">
        <section className="core-runner-action-deck" aria-label="Fixed Core report actions">
          {(["environment", "mission", "model", "scenario"] as const).map((group) => {
            const groupActions = actions.filter((action) => action.group === group);

            return (
              <section key={group} className={`core-runner-action-group core-runner-action-group-${group}`}>
                <div className="core-runner-group-heading">
                  <h2>{actionGroupLabels[group]}</h2>
                  <StatusBadge label="FIXED WRAPPERS" />
                </div>
                <div className="core-runner-action-grid">
                  {groupActions.map((action) => (
                    <CoreActionCard
                      key={action.id}
                      action={action}
                      isFocused={focusedActionId === action.id}
                      status={resolveActionStatus(action, coreResult, reports)}
                      isRunning={isRunningCoreCommand && focusedActionId === action.id}
                      onRun={() => void handleRunAction(action)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        <section className="core-runner-output-card" aria-label="Process output">
          <div className="core-runner-card-header">
            <span className="core-runner-section-kicker">Process output</span>
            <StatusBadge label={coreResult ? "AVAILABLE" : "IDLE"} />
          </div>
          <div className="core-runner-output-tabs" role="tablist" aria-label="Core process output tabs">
            {(["stdout", "stderr", "command", "report-json"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={outputTab === tab}
                onClick={() => setOutputTab(tab)}
              >
                {formatOutputTab(tab)}
              </button>
            ))}
          </div>
          <pre className="core-runner-process-output">{resolveOutputText(outputTab, coreResult)}</pre>
        </section>
        </section>

        <aside className="core-runner-side-column" aria-label="Latest Core execution and report preview">
          <section className="core-runner-latest-card">
            <div className="core-runner-card-header">
              <span className="core-runner-section-kicker">Latest execution</span>
              <StatusBadge
                label={
                  isRunningCoreCommand
                    ? "RUNNING"
                    : coreResult
                      ? coreResult.success
                        ? "COMPLETED"
                        : "FAILED"
                      : "NO SESSION RUN"
                }
              />
            </div>
            <div className="core-runner-latest-title">
              <DashboardIcon kind={coreResult ? (coreResult.success === false ? "validation" : "scenario") : "core"} />
              <h2>{resolveLatestActionTitle(coreResult, focusedAction)}</h2>
            </div>

            {!coreResult ? (
              <p className="core-runner-latest-context">
                No Core action executed in this Studio session. Preview uses existing Core-generated reports.
              </p>
            ) : latestPreview?.source === "snapshot" ? (
              <p className="core-runner-latest-context">
                Latest process output is available. Preview uses the current Core-generated workspace snapshot.
              </p>
            ) : null}

            <div className="core-runner-detail-grid">
              <RunnerDetail
                label="Status"
                value={
                  isRunningCoreCommand
                    ? "running"
                    : coreResult
                      ? coreResult.success
                        ? "completed"
                        : "failed"
                      : "waiting for first run"
                }
              />
              <RunnerDetail label="Exit code" value={coreResult?.exit_code ?? "not available"} />
              <RunnerDetail
                label="Produced report"
                value={coreResult?.json_report_path ?? "not produced"}
                title={coreResult?.json_report_path ?? undefined}
              />
              <RunnerDetail
                label="Recognized by Studio"
                value={resolveRecognitionLabel(coreResult, latestPreview)}
              />
            </div>

            <div className="core-runner-consumer-list" aria-label="Evidence consumers">
              <span>Evidence consumers</span>
              <div>
                {resolveConsumerLabels(coreResult, latestPreview, focusedAction).map((consumer) => (
                  <span key={consumer}>{consumer}</span>
                ))}
              </div>
            </div>

            {coreError ? <p className="core-runner-error-text">{coreError}</p> : null}

            <div className="core-runner-latest-actions">
              <button
                type="button"
                onClick={handleOpenProducedReport}
                disabled={!coreResult?.json_report_available || !coreResult.json_report_path}
              >
                Open report
              </button>
              <button type="button" onClick={() => void handleCopyCommand()}>
                {copyState === "copied"
                  ? "Copied"
                  : copyState === "failed"
                    ? "Copy failed"
                    : "Copy Core command"}
              </button>
            </div>
          </section>

          <section className="core-runner-preview-card">
            <div className="core-runner-card-header">
              <span className="core-runner-section-kicker">
                {latestPreview?.source === "snapshot"
                  ? "Loaded Core report preview"
                  : "Recognized report preview"}
              </span>
              <StatusBadge
                label={latestPreview ? (latestPreview.source === "snapshot" ? "LOADED" : "RENDERED") : "UNAVAILABLE"}
              />
            </div>

            {latestPreview ? (
              <>
                <h2>{latestPreview.title}</h2>
                <p className="core-runner-preview-context">
                  {latestPreview.source === "snapshot"
                    ? "Loaded from existing Core-generated reports."
                    : "Rendered from the latest Core action report."}
                </p>
                <div className="core-runner-preview-metrics">
                  {latestPreview.metrics.map((metric) => (
                    <RunnerDetail key={metric.label} label={metric.label} value={metric.value} />
                  ))}
                </div>
                {latestPreview.files.length > 0 ? (
                  <div className="core-runner-preview-files">
                    <span>Available reports</span>
                    <div>
                      {latestPreview.files.slice(0, 6).map((file) => (
                        <span key={file}>{file}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="core-runner-companion-evidence">
                  <span>Companion evidence</span>
                  <div>
                    {latestPreview.companionEvidence.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
                <p className="core-runner-note">{latestPreview.note}</p>
              </>
            ) : (
              <p className="core-runner-empty-copy">
                No recognized Core JSON report is available for structured preview yet.
              </p>
            )}
          </section>

        <section className="core-runner-failure-card" aria-label="Failure behavior">
          <div className="core-runner-card-header">
            <span className="core-runner-section-kicker">If a run fails</span>
            <DashboardIcon kind="validation" />
          </div>
          <ul>
            <li>Non-zero exit codes are surfaced explicitly.</li>
            <li>If the expected report is not produced, Studio keeps previous evidence unchanged.</li>
            <li>Raw stdout and stderr remain available for inspection.</li>
          </ul>
        </section>
        </aside>
      </div>

    </section>
  );
}

function CoreActionCard({
  action,
  isFocused,
  status,
  isRunning,
  onRun,
}: {
  action: CoreReportRunnerAction;
  isFocused: boolean;
  status: string;
  isRunning: boolean;
  onRun: () => void;
}) {
  return (
    <article
      className={[
        "core-runner-action-card",
        isFocused ? "core-runner-action-card-focused" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="core-runner-action-title">
        <DashboardIcon kind={action.icon} />
        <div>
          <h3>{action.title}</h3>
          <p>{action.description}</p>
        </div>
      </div>
      <div className="core-runner-action-meta">
        <span>Expected output</span>
        <strong title={action.expectedOutput}>{action.expectedOutput}</strong>
      </div>
      <div className="core-runner-action-footer">
        <span>
          Last result: <strong>{isRunning ? "running" : status}</strong>
        </span>
        <button
          type="button"
          onClick={onRun}
          disabled={Boolean(action.disabledReason) || isRunning}
          title={action.disabledReason ?? action.commandPreview}
        >
          {isRunning ? "Running" : action.buttonLabel}
        </button>
      </div>
    </article>
  );
}

function InventoryPill({
  icon,
  label,
  value,
}: {
  icon: "artifacts" | "reports" | "evidence" | "raw" | "ground";
  label: string;
  value: string;
}) {
  const state = resolveInventoryState(value);

  return (
    <div className={`core-runner-inventory-pill core-runner-inventory-${state}`}>
      <DashboardIcon kind={icon} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RunnerDetail({
  label,
  value,
  title,
}: {
  label: string;
  value: string | number | null | undefined;
  title?: string;
}) {
  const renderedValue = value === null || value === undefined || value === "" ? "not reported" : String(value);

  return (
    <div className="core-runner-detail" title={title ?? renderedValue}>
      <span>{label}</span>
      <strong>{renderedValue}</strong>
    </div>
  );
}

function buildCoreActions({
  workspace,
  coreExecutable,
  isRunningCoreCommand,
  onCoreVersion,
  onCoreInspectMission,
  onCoreLintMission,
  onCoreExportModelSummary,
  onCoreExportEntityIndex,
  onCoreExportRelationshipManifest,
  onCoreExportDashboardSummary,
  onCoreExportScenarioRunIndex,
  onCoreExportCoverageSummary,
}: {
  workspace: WorkspaceInspection;
  coreExecutable: string;
  isRunningCoreCommand: boolean;
  onCoreVersion: () => Promise<void>;
  onCoreInspectMission: () => Promise<void>;
  onCoreLintMission: () => Promise<void>;
  onCoreExportModelSummary: () => Promise<void>;
  onCoreExportEntityIndex: () => Promise<void>;
  onCoreExportRelationshipManifest: () => Promise<void>;
  onCoreExportDashboardSummary: () => Promise<void>;
  onCoreExportScenarioRunIndex: () => Promise<void>;
  onCoreExportCoverageSummary: () => Promise<void>;
}): CoreReportRunnerAction[] {
  const noExecutable = coreExecutable.trim() ? null : "Core executable is not configured.";
  const noMissionDir = workspace.mission_dir ? null : "Mission directory is not available.";
  const noWorkspace = workspace.selected_path ? null : "Workspace is not available.";
  const busy = isRunningCoreCommand ? "Another fixed Core action is already running." : null;

  const baseDisabled = noExecutable ?? busy;
  const missionDisabled = baseDisabled ?? noMissionDir;
  const workspaceDisabled = baseDisabled ?? noWorkspace;
  const executable = coreExecutable.trim() || "orbitfabric";

  return [
    {
      id: "core-version",
      group: "environment",
      icon: "core",
      title: "Check Core version",
      description: "Verifies executable binding.",
      expectedOutput: "stdout",
      commandPreview: `${executable} --version`,
      buttonLabel: "Run",
      consumers: ["Core Report Runner"],
      disabledReason: baseDisabled,
      run: onCoreVersion,
    },
    {
      id: "inspect-mission",
      group: "mission",
      icon: "artifacts",
      title: "Inspect mission",
      description: "Checks workspace and source reachability.",
      expectedOutput: "mission_inspect.json",
      commandPreview: `${executable} inspect mission`,
      buttonLabel: "Run",
      consumers: ["Mission Overview"],
      disabledReason: missionDisabled,
      run: onCoreInspectMission,
    },
    {
      id: "validate-mission",
      group: "mission",
      icon: "shield",
      title: "Validate mission",
      description: "Runs validation and refreshes lint evidence.",
      expectedOutput: "lint_report.json",
      commandPreview: `${executable} lint mission`,
      buttonLabel: "Run",
      consumers: ["Mission Overview", "Data Products"],
      disabledReason: missionDisabled,
      run: onCoreLintMission,
    },
    {
      id: "model-summary",
      group: "model",
      icon: "model",
      title: "Refresh model summary",
      description: "Rebuilds Core model summary.",
      expectedOutput: "model_summary.json",
      commandPreview: `${executable} export model-summary`,
      buttonLabel: "Refresh",
      consumers: ["Mission Overview", "Domain surfaces"],
      disabledReason: missionDisabled,
      run: onCoreExportModelSummary,
    },
    {
      id: "entity-index",
      group: "model",
      icon: "core",
      title: "Refresh entity index",
      description: "Rebuilds Core entity index.",
      expectedOutput: "entity_index.json",
      commandPreview: `${executable} export entity-index`,
      buttonLabel: "Refresh",
      consumers: ["Mission Overview", "Domain surfaces"],
      disabledReason: missionDisabled,
      run: onCoreExportEntityIndex,
    },
    {
      id: "relationship-manifest",
      group: "model",
      icon: "relationships",
      title: "Refresh relationship manifest",
      description: "Rebuilds relationship manifest.",
      expectedOutput: "relationship_manifest.json",
      commandPreview: `${executable} export relationship-manifest`,
      buttonLabel: "Refresh",
      consumers: ["Data Flow Workbench", "Data Products"],
      disabledReason: missionDisabled,
      run: onCoreExportRelationshipManifest,
    },
    {
      id: "dashboard-summary",
      group: "model",
      icon: "reports",
      title: "Refresh dashboard summary",
      description: "Recomputes dashboard metrics.",
      expectedOutput: "dashboard_summary.json",
      commandPreview: `${executable} export dashboard-summary`,
      buttonLabel: "Refresh",
      consumers: ["Mission Overview", "Generated Artifacts"],
      disabledReason: missionDisabled,
      run: onCoreExportDashboardSummary,
    },
    {
      id: "scenario-run-index",
      group: "scenario",
      icon: "scenario",
      title: "Refresh scenario run index",
      description: "Indexes Core scenario reports.",
      expectedOutput: "scenario_run_index.json",
      commandPreview: `${executable} export scenario-run-index`,
      buttonLabel: "Refresh",
      consumers: ["Scenario Evidence", "Data Products", "Data Flow Workbench"],
      disabledReason: workspaceDisabled,
      run: onCoreExportScenarioRunIndex,
    },
    {
      id: "coverage-summary",
      group: "scenario",
      icon: "coverage",
      title: "Refresh coverage summary",
      description: "Recomputes coverage summary.",
      expectedOutput: "coverage_summary.json",
      commandPreview: `${executable} export coverage-summary`,
      buttonLabel: "Refresh",
      consumers: ["Scenario Evidence", "Data Products"],
      disabledReason: missionDisabled,
      run: onCoreExportCoverageSummary,
    },
  ];
}

function resolveActionStatus(
  action: CoreReportRunnerAction,
  coreResult: CoreCommandResult | null,
  reports: CoreReportRunnerReports,
): string {
  const expectedFile = reportFileByAction[action.id];

  if (expectedFile && coreResult?.json_report_path?.includes(expectedFile)) {
    return coreResult.success ? "completed" : "failed";
  }

  if (action.id === "core-version" || action.id === "inspect-mission") {
    return coreResult ? (coreResult.success ? "completed" : "failed") : "ready";
  }

  switch (action.id) {
    case "validate-mission":
      return reports.lintReport ? "reported" : "not reported";
    case "model-summary":
      return reports.modelSummary ? "reported" : "not reported";
    case "entity-index":
      return reports.entityIndex ? "reported" : "not reported";
    case "relationship-manifest":
      return reports.relationshipManifest ? "reported" : "not reported";
    case "dashboard-summary":
      return reports.dashboardSummary ? "reported" : "not reported";
    case "scenario-run-index":
      return reports.scenarioRunIndex ? "reported" : "not reported";
    case "coverage-summary":
      return reports.coverageSummary ? "reported" : "not reported";
    default:
      return "not reported";
  }
}

function resolveReportPreview(
  coreResult: CoreCommandResult | null,
  reports: CoreReportRunnerReports,
): ReportPreviewModel | null {
  const latestPath = normalizePath(coreResult?.json_report_path ?? "");
  const source = coreResult?.json_report_available ? "latest" : "snapshot";

  if (latestPath.includes("lint_report") && reports.lintReport) {
    return createLintPreview(reports.lintReport, source);
  }

  if (latestPath.includes("model_summary") && reports.modelSummary) {
    return createModelSummaryPreview(reports.modelSummary, source);
  }

  if (latestPath.includes("entity_index") && reports.entityIndex) {
    return createEntityIndexPreview(reports.entityIndex, source);
  }

  if (latestPath.includes("relationship_manifest") && reports.relationshipManifest) {
    return createRelationshipPreview(reports.relationshipManifest, source);
  }

  if (latestPath.includes("dashboard_summary") && reports.dashboardSummary) {
    return createDashboardPreview(reports.dashboardSummary, source);
  }

  if (latestPath.includes("scenario_run_index") && reports.scenarioRunIndex) {
    return createScenarioRunIndexPreview(reports.scenarioRunIndex, source);
  }

  if (latestPath.includes("coverage_summary") && reports.coverageSummary) {
    return createCoveragePreview(reports.coverageSummary, source);
  }

  if (reports.scenarioRunIndex) {
    return createScenarioRunIndexPreview(reports.scenarioRunIndex, "snapshot");
  }

  if (reports.coverageSummary) {
    return createCoveragePreview(reports.coverageSummary, "snapshot");
  }

  if (reports.dashboardSummary) {
    return createDashboardPreview(reports.dashboardSummary, "snapshot");
  }

  if (reports.relationshipManifest) {
    return createRelationshipPreview(reports.relationshipManifest, "snapshot");
  }

  if (reports.entityIndex) {
    return createEntityIndexPreview(reports.entityIndex, "snapshot");
  }

  if (reports.modelSummary) {
    return createModelSummaryPreview(reports.modelSummary, "snapshot");
  }

  if (reports.lintReport) {
    return createLintPreview(reports.lintReport, "snapshot");
  }

  return null;
}

function createLintPreview(report: CoreLintReport, source: ReportPreviewModel["source"]): ReportPreviewModel {
  return {
    kind: "lint",
    title: "Lint Report",
    source,
    metrics: [
      { label: "Result", value: report.result },
      { label: "Errors", value: String(report.summary.errors) },
      { label: "Warnings", value: String(report.summary.warnings) },
      { label: "Info", value: String(report.summary.info) },
    ],
    files: report.findings.slice(0, 6).map((finding) => finding.file ?? finding.code),
    companionEvidence: ["model_summary.json", "dashboard_summary.json"],
    consumers: ["Mission Overview", "Data Products"],
    note: "Studio renders Core validation output without editing or repairing Mission Model YAML.",
  };
}

function createModelSummaryPreview(
  report: CoreModelSummary,
  source: ReportPreviewModel["source"],
): ReportPreviewModel {
  return {
    kind: "model-summary",
    title: "Model Summary",
    source,
    metrics: [
      { label: "Mission", value: report.mission.name || report.mission.id },
      { label: "Domains", value: String(report.domains.length) },
      { label: "Reported counts", value: String(Object.keys(report.counts).length) },
      { label: "Core version", value: report.orbitfabric_version },
    ],
    files: report.domains.slice(0, 6).map((domain) => domain.source_file),
    companionEvidence: ["entity_index.json", "relationship_manifest.json"],
    consumers: ["Mission Overview", "Domain surfaces"],
    note: "Studio displays only the counts and domains reported by Core model_summary.json.",
  };
}

function createEntityIndexPreview(
  report: CoreEntityIndex,
  source: ReportPreviewModel["source"],
): ReportPreviewModel {
  return {
    kind: "entity-index",
    title: "Entity Index",
    source,
    metrics: [
      { label: "Total entities", value: String(report.counts.total_entities) },
      { label: "Indexed domains", value: String(report.domains.filter((domain) => domain.indexed).length) },
      { label: "Entity records", value: String(report.entities.length) },
      { label: "Core version", value: report.orbitfabric_version },
    ],
    files: report.domains.slice(0, 6).map((domain) => domain.source_file),
    companionEvidence: ["model_summary.json", "relationship_manifest.json"],
    consumers: ["Mission Overview", "Domain surfaces", "Data Flow Workbench"],
    note: "Studio uses Core entity records as read-only inspection evidence without raw YAML scanning.",
  };
}

function createRelationshipPreview(
  report: CoreRelationshipManifest,
  source: ReportPreviewModel["source"],
): ReportPreviewModel {
  return {
    kind: "relationship-manifest",
    title: "Relationship Manifest",
    source,
    metrics: [
      { label: "Relationships", value: String(report.counts.total_relationships) },
      { label: "Types", value: String(report.relationship_types.length) },
      { label: "Status", value: report.status },
      { label: "Core version", value: report.orbitfabric_version },
    ],
    files: report.relationship_types.slice(0, 6).map((type) => type.display_name),
    companionEvidence: ["entity_index.json", "dashboard_summary.json"],
    consumers: ["Data Flow Workbench", "Data Products", "Mission Overview"],
    note: "Relationship evidence is shown only from Core relationship_manifest.json derivation policy.",
  };
}

function createDashboardPreview(
  report: CoreDashboardSummary,
  source: ReportPreviewModel["source"],
): ReportPreviewModel {
  return {
    kind: "dashboard-summary",
    title: "Dashboard Summary",
    source,
    metrics: [
      { label: "Validation", value: report.validation.result },
      { label: "Entities", value: String(report.entity_inventory.total_entities) },
      { label: "Relationships", value: String(report.relationship_inventory.total_relationships) },
      { label: "Coverage", value: report.coverage.status },
    ],
    files: report.model_domains.domains.slice(0, 6).map((domain) => domain.source_file),
    companionEvidence: ["model_summary.json", "entity_index.json", "relationship_manifest.json"],
    consumers: ["Mission Overview", "Generated Artifacts"],
    note: "Dashboard values are Core-owned summary fields, not Studio-computed health scores.",
  };
}

function createScenarioRunIndexPreview(
  report: CoreScenarioRunIndex,
  source: ReportPreviewModel["source"],
): ReportPreviewModel {
  return {
    kind: "scenario-run-index",
    title: "Scenario Run Index",
    source,
    metrics: [
      { label: "Scenario reports", value: String(report.summary.total) },
      { label: "Passed", value: String(report.summary.passed) },
      { label: "Failed", value: String(report.summary.failed) },
      { label: "Input tool", value: report.source.input_report_tool },
    ],
    files: report.runs.slice(0, 6).map((run) => run.report_file),
    companionEvidence: ["lint_report.json", "coverage_summary.json", "dashboard_summary.json"],
    consumers: ["Scenario Evidence", "Data Products", "Data Flow Workbench"],
    note: "Studio renders recognized Core JSON reports without inferring private runtime state.",
  };
}

function createCoveragePreview(
  report: CoreCoverageSummary,
  source: ReportPreviewModel["source"],
): ReportPreviewModel {
  return {
    kind: "coverage-summary",
    title: "Coverage Summary",
    source,
    metrics: [
      { label: "Scenario runs", value: String(report.scenario_runs.total) },
      { label: "Expectations", value: String(report.expectation_coverage.total) },
      { label: "Relationships", value: String(report.relationship_coverage.total_supported_relationships) },
      { label: "Unsupported scope", value: String(report.unsupported.entity_domains.length + report.unsupported.relationship_types.length) },
    ],
    files: Object.keys(report.entity_coverage).slice(0, 6),
    companionEvidence: ["scenario_run_index.json", "relationship_manifest.json", "entity_index.json"],
    consumers: ["Scenario Evidence", "Data Products"],
    note: "Coverage is displayed only from Core coverage_summary.json, without private completeness scoring.",
  };
}

function resolveRecognitionLabel(
  coreResult: CoreCommandResult | null,
  preview: ReportPreviewModel | null,
): string {
  if (!coreResult) {
    return "not reported";
  }

  if (!coreResult.json_report_available) {
    return "not available";
  }

  return preview?.source === "latest" ? "yes" : "raw only";
}

function resolveLatestActionTitle(
  coreResult: CoreCommandResult | null,
  focusedAction: CoreReportRunnerAction | undefined,
): string {
  if (!coreResult) {
    return "No Core action executed in this session";
  }

  const path = normalizePath(coreResult.json_report_path ?? "");

  if (path.includes("scenario_run_index")) return "Refresh scenario run index";
  if (path.includes("coverage_summary")) return "Refresh coverage summary";
  if (path.includes("dashboard_summary")) return "Refresh dashboard summary";
  if (path.includes("relationship_manifest")) return "Refresh relationship manifest";
  if (path.includes("entity_index")) return "Refresh entity index";
  if (path.includes("model_summary")) return "Refresh model summary";
  if (path.includes("lint_report")) return "Validate mission";

  return focusedAction?.title ?? coreResult.command;
}

function resolveOutputText(tab: RunnerOutputTab, coreResult: CoreCommandResult | null): string {
  if (!coreResult) {
    return [
      "No Core process output is available for this Studio session yet.",
      "Run a fixed Core report action to populate this panel.",
      "Existing previews come from Core-generated reports already present in the workspace.",
    ].join("\n");
  }

  switch (tab) {
    case "stdout":
      return coreResult.stdout || "stdout was empty.";
    case "stderr":
      return coreResult.stderr || "stderr was empty.";
    case "command":
      return formatCoreCommand(coreResult);
    case "report-json":
      return coreResult.json_report_content ?? "No JSON report content was returned by this Core action.";
  }
}

function summarizeGeneratedInventory(
  workspace: WorkspaceInspection,
  reports: CoreReportRunnerReports,
) {
  const docsCount = countGeneratedFilesBySegment(workspace, "docs");
  const logsCount = countGeneratedFilesBySegment(workspace, "logs");
  const reportFileCount = countGeneratedFilesBySegment(workspace, "reports");
  const recognizedReports = [
    reports.lintReport,
    reports.modelSummary,
    reports.entityIndex,
    reports.relationshipManifest,
    reports.dashboardSummary,
    reports.scenarioRunIndex,
    reports.coverageSummary,
  ].filter(Boolean).length + reports.simulationReports.length;
  const reportsCount = Math.max(reportFileCount, recognizedReports);

  return {
    docs: formatGeneratedInventoryCount(docsCount, hasGeneratedPathSegment(workspace, "docs")),
    reports: formatGeneratedInventoryCount(reportsCount, hasGeneratedPathSegment(workspace, "reports")),
    logs: formatGeneratedInventoryCount(logsCount, hasGeneratedPathSegment(workspace, "logs")),
    runtime: inferGeneratedVariant(workspace, "runtime") ?? "not reported",
    ground: inferGeneratedVariant(workspace, "ground") ?? "not reported",
  };
}

function formatGeneratedInventoryCount(count: number, segmentReported: boolean): string {
  if (count > 0) {
    return String(count);
  }

  return segmentReported ? "available" : "not reported";
}

function countGeneratedFilesBySegment(workspace: WorkspaceInspection, segment: string): number {
  const token = `/${segment}/`;

  return workspace.generated_locations.filter((entry) => {
    const normalized = normalizePath(entry.path);
    return entry.kind === "file" && normalized.includes(token);
  }).length;
}

function hasGeneratedPathSegment(workspace: WorkspaceInspection, segment: string): boolean {
  const token = `/${segment}/`;

  return workspace.generated_locations.some((entry) => {
    const normalized = normalizePath(entry.path);
    return normalized.includes(token) || normalized.endsWith(`/${segment}`) || entry.name === segment;
  });
}

function inferGeneratedVariant(workspace: WorkspaceInspection, segment: string): string | null {
  const entry = workspace.generated_locations.find((candidate) => {
    const normalized = normalizePath(candidate.path);
    return normalized.includes(`/${segment}/`) || normalized.endsWith(`/${segment}`) || candidate.name === segment;
  });

  if (!entry) {
    return null;
  }

  const normalized = normalizePath(entry.path);
  const parts = normalized.split("/").filter(Boolean);
  const segmentIndex = parts.indexOf(segment);

  if (segmentIndex >= 0 && parts[segmentIndex + 1]) {
    return parts[segmentIndex + 1];
  }

  return "available";
}

function resolveInventoryState(value: string): "positive" | "neutral" | "blocked" {
  if (value === "not reported" || value === "not available") {
    return "blocked";
  }

  if (value === "available" || /^[1-9][0-9]*$/.test(value) || value === "cpp17" || value === "generic") {
    return "positive";
  }

  return "neutral";
}

function resolveConsumerLabels(
  coreResult: CoreCommandResult | null,
  preview: ReportPreviewModel | null,
  focusedAction: CoreReportRunnerAction | undefined,
): string[] {
  if (coreResult && preview?.consumers.length) {
    return preview.consumers;
  }

  if (!coreResult && focusedAction?.consumers.length) {
    return focusedAction.consumers;
  }

  if (preview?.consumers.length) {
    return preview.consumers;
  }

  return ["not reported"];
}

function formatOutputTab(tab: RunnerOutputTab): string {
  switch (tab) {
    case "stdout":
      return "stdout";
    case "stderr":
      return "stderr";
    case "command":
      return "command";
    case "report-json":
      return "report json";
  }
}

function formatCoreCommand(coreResult: CoreCommandResult): string {
  return [coreResult.command, ...coreResult.args].filter(Boolean).join(" ") || "fixed Core command";
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}

function basename(path: string): string {
  return normalizePath(path).split("/").filter(Boolean).slice(-1)[0] ?? path;
}
