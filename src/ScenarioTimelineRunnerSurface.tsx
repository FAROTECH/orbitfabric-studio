import { useEffect, useLayoutEffect, useMemo, useState } from "react";

import { ProvenanceBadge, StatusBadge } from "./Badges";
import { DesktopSurface } from "./desktopEnvelopePrimitives";
import type { GeneratedEvidenceArtifactSummary } from "./GeneratedArtifactExplorer";
import {
  hydrateGeneratedReportsFromWorkspace,
  type GeneratedReportHydrationResult,
} from "./generatedReportHydration";
import type {
  CoreCommandResult,
  CoreSimulationCommandRecord,
  CoreSimulationDataFlowEvidenceRecord,
  CoreSimulationEventRecord,
  CoreSimulationExpectationRecord,
  CoreSimulationModeTransitionRecord,
  CoreSimulationReport,
  CoreSimulationTimelineEntry,
  CoreSimulationJsonValue,
  CoreScenarioRunIndex,
  CoreScenarioRunRecord,
  ProjectEntry,
  WorkspaceInspection,
} from "./types/workspace";

import "./scenarioEvidenceCockpit.css";

export type ScenarioTimelineRecordKind =
  | "timeline"
  | "event"
  | "command"
  | "modeTransition"
  | "dataFlowEvidence"
  | "failedExpectation";

export interface ScenarioTimelineInspectorRecord {
  kind: ScenarioTimelineRecordKind;
  title: string;
  record: unknown;
}

interface ScenarioTimelineRunnerSurfaceProps {
  workspace: WorkspaceInspection;
  generatedEvidenceArtifactSummary: GeneratedEvidenceArtifactSummary | null;
  coreResult: CoreCommandResult | null;
  simulationReport: CoreSimulationReport | null;
  simulationReportSource: string | null;
  isRunningCoreCommand: boolean;
  onOpenFile: (entry: ProjectEntry) => void;
  onRunScenario: (entry: ProjectEntry) => void;
  onSelectSimulationRecord: (record: ScenarioTimelineInspectorRecord) => void;
}

type PassiveArtifactCandidate =
  | GeneratedEvidenceArtifactSummary["reportCandidates"][number]
  | GeneratedEvidenceArtifactSummary["logCandidates"][number];

type EvidenceLaneId =
  | "all"
  | "commands"
  | "events"
  | "modes"
  | "dataFlow"
  | "expectations"
  | "artifacts";

interface TimelineDisplayRecord {
  id: string;
  time: string;
  sortTime: number;
  badge: string;
  kind: ScenarioTimelineRecordKind;
  lane: EvidenceLaneId;
  title: string;
  detail: string;
  source: string;
  record: unknown;
}

interface ScenarioCatalogRow {
  scenario: ProjectEntry;
  result: string;
  tone: "passed" | "failed" | "not-run" | "running" | "reported";
  commands: string;
  events: string;
  modes: string;
  expectations: string;
  dataFlow: string;
  reportState: string;
  reportPath: string;
}

interface ScenarioArtifactCard {
  id: string;
  title: string;
  name: string;
  detail: string;
  badge: string;
  entry: ProjectEntry | null;
}

const NOT_REPORTED = "not reported";
const NOT_AVAILABLE = "not available";

export function ScenarioTimelineRunnerSurface({
  workspace,
  generatedEvidenceArtifactSummary,
  coreResult,
  simulationReport,
  simulationReportSource,
  isRunningCoreCommand,
  onOpenFile,
  onRunScenario,
  onSelectSimulationRecord,
}: ScenarioTimelineRunnerSurfaceProps) {
  const scenarioFiles = workspace.scenario_files;
  const [selectedScenarioPath, setSelectedScenarioPath] = useState<string | null>(null);
  const [activeLane, setActiveLane] = useState<EvidenceLaneId>("all");
  const [selectedTimelineRecordId, setSelectedTimelineRecordId] = useState<string | null>(null);
  const [generatedHydration, setGeneratedHydration] =
    useState<GeneratedReportHydrationResult | null>(null);
  const [isHydratingGeneratedReports, setIsHydratingGeneratedReports] = useState(false);

  useLayoutEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    type StyleBackup = {
      element: HTMLElement;
      values: Partial<Record<keyof CSSStyleDeclaration, string>>;
    };

    const styleBackups: StyleBackup[] = [];
    let cleanupAppliedStyles = () => {};

    function applyInlineStyles(
      element: Element | null | undefined,
      styles: Partial<Record<keyof CSSStyleDeclaration, string>>,
    ) {
      if (!(element instanceof HTMLElement)) {
        return;
      }

      const values: Partial<Record<keyof CSSStyleDeclaration, string>> = {};

      for (const key of Object.keys(styles) as Array<keyof CSSStyleDeclaration>) {
        const currentValue = element.style[key];

        if (typeof currentValue === "string") {
          values[key] = currentValue;
        }
      }

      styleBackups.push({ element, values });

      for (const [key, value] of Object.entries(styles) as Array<[keyof CSSStyleDeclaration, string]>) {
        // CSSStyleDeclaration is indexable at runtime, but TypeScript keeps the
        // DOM type intentionally strict. This localized assignment keeps the
        // Scenarios scroll fix isolated from the rest of the shell.
        (element.style as unknown as Record<string, string>)[key as string] = value;
      }
    }

    const animationFrame = requestAnimationFrame(() => {
      const surface = document.getElementById("studio-evidence");
      const mainSurface = surface?.closest(".main-surface");
      const layout = surface?.closest(".workbench-layout");
      const appShell = surface?.closest(".studio-app-shell");
      const inspector = layout?.querySelector(".workbench-inspector");
      const sidebar = layout?.querySelector(".primary-sidebar");
      const layoutHeight = "calc(100vh - 116px)";

      document.body.classList.add("scenario-evidence-scroll-active");

      applyInlineStyles(appShell, {
        height: "100vh",
        maxHeight: "100vh",
        minHeight: "0",
        overflow: "hidden",
      });

      applyInlineStyles(layout, {
        height: layoutHeight,
        maxHeight: layoutHeight,
        minHeight: "0",
        overflow: "hidden",
        alignItems: "stretch",
      });

      applyInlineStyles(mainSurface, {
        height: "100%",
        maxHeight: "100%",
        minHeight: "0",
        overflowX: "hidden",
        overflowY: "auto",
        overscrollBehavior: "contain",
        scrollbarGutter: "stable",
        paddingBottom: "120px",
      });

      applyInlineStyles(surface, {
        height: "auto",
        maxHeight: "none",
        minHeight: "0",
        overflow: "visible",
        paddingBottom: "120px",
      });

      applyInlineStyles(inspector, {
        height: "100%",
        maxHeight: "100%",
        minHeight: "0",
        overflowX: "hidden",
        overflowY: "auto",
        overscrollBehavior: "contain",
      });

      applyInlineStyles(sidebar, {
        height: "100%",
        maxHeight: "100%",
        minHeight: "0",
        overflowX: "hidden",
        overflowY: "auto",
        overscrollBehavior: "contain",
      });

      cleanupAppliedStyles = () => {
        document.body.classList.remove("scenario-evidence-scroll-active");

        for (const backup of styleBackups.reverse()) {
          for (const [key, value] of Object.entries(backup.values) as Array<[keyof CSSStyleDeclaration, string]>) {
            (backup.element.style as unknown as Record<string, string>)[key as string] = value;
          }
        }
      };
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      cleanupAppliedStyles();
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    setGeneratedHydration(null);
    setIsHydratingGeneratedReports(true);

    hydrateGeneratedReportsFromWorkspace(workspace.selected_path)
      .then((result) => {
        if (!isCancelled) {
          setGeneratedHydration(result);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setGeneratedHydration(null);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsHydratingGeneratedReports(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [workspace.selected_path]);

  const artifactCandidates: PassiveArtifactCandidate[] = generatedEvidenceArtifactSummary
    ? [
        ...generatedEvidenceArtifactSummary.reportCandidates,
        ...generatedEvidenceArtifactSummary.logCandidates,
      ]
    : [];

  const scenarioRunIndex = generatedHydration?.coreReportSnapshots.scenarioRunIndex ?? null;
  const allSimulationReports = useMemo(
    () =>
      mergeSimulationReports([
        ...(generatedHydration?.coreReportSnapshots.simulationReports ?? []),
        ...(simulationReport ? [simulationReport] : []),
      ]),
    [generatedHydration, simulationReport],
  );

  const reportMatchedScenario =
    scenarioFiles.find(
      (scenario) => simulationReport && scenarioMatchesReport(scenario, simulationReport),
    ) ??
    scenarioFiles.find((scenario) => findSimulationReportForScenario(scenario, allSimulationReports)) ??
    scenarioFiles.find((scenario) => findScenarioRunRecord(scenario, scenarioRunIndex));
  const selectedScenario =
    scenarioFiles.find((scenario) => scenario.path === selectedScenarioPath) ??
    reportMatchedScenario ??
    scenarioFiles[0] ??
    null;
  const selectedReport = selectedScenario
    ? findSimulationReportForScenario(selectedScenario, allSimulationReports)
    : null;
  const selectedRunRecord = selectedScenario
    ? findScenarioRunRecord(selectedScenario, scenarioRunIndex)
    : null;
  const selectedSimulationReportSource = selectedReport
    ? simulationReport && selectedReport.scenario === simulationReport.scenario
      ? simulationReportSource ?? "Core simulation JSON"
      : "generated simulation report"
    : selectedRunRecord
      ? "scenario run index"
      : null;
  const selectedArtifacts = selectedScenario
    ? buildScenarioArtifactCards({
        scenario: selectedScenario,
        selectedReport,
        selectedRunRecord,
        coreResult,
        artifactCandidates,
      })
    : [];

  const timelineRecords = useMemo(
    () => createTimelineDisplayRecords(selectedReport),
    [selectedReport],
  );
  const filteredTimelineRecords = timelineRecords.filter((record) =>
    activeLane === "all" ? true : record.lane === activeLane,
  );
  const selectedTimelineRecord =
    filteredTimelineRecords.find((record) => record.id === selectedTimelineRecordId) ??
    timelineRecords.find((record) => record.id === selectedTimelineRecordId) ??
    filteredTimelineRecords[0] ??
    timelineRecords[0] ??
    null;
  const laneSummaries = createEvidenceLaneSummaries(selectedReport, selectedRunRecord, selectedArtifacts.length);
  const catalogRows = scenarioFiles.map((scenario) =>
    createScenarioCatalogRow({
      scenario,
      simulationReports: allSimulationReports,
      scenarioRunIndex,
      isSelected: selectedScenario?.path === scenario.path,
      isRunningCoreCommand,
      artifactCandidates,
    }),
  );

  return (
    <DesktopSurface
      id="studio-evidence"
      label="Scenario Evidence Cockpit"
      className="scenario-evidence-cockpit scenario-evidence-desktop-surface"
      width="full"
      density="compact"
    >
      <ScenarioEvidenceHeader
        scenarioFiles={scenarioFiles}
        selectedReport={selectedReport}
        scenarioRunIndex={scenarioRunIndex}
        generatedHydration={generatedHydration}
        generatedEvidenceArtifactSummary={generatedEvidenceArtifactSummary}
        isHydratingGeneratedReports={isHydratingGeneratedReports}
      />

      <section className="scenario-cockpit-main-grid" aria-label="Scenario evidence cockpit main grid">
        <ScenarioCatalog
          rows={catalogRows}
          selectedScenario={selectedScenario}
          onSelectScenario={(scenario) => {
            setSelectedScenarioPath(scenario.path);
            setActiveLane("all");
            setSelectedTimelineRecordId(null);
          }}
        />

        <SelectedScenarioOverview
          selectedScenario={selectedScenario}
          selectedReport={selectedReport}
          selectedRunRecord={selectedRunRecord}
          simulationReportSource={selectedSimulationReportSource}
          coreResult={coreResult}
          selectedArtifacts={selectedArtifacts}
          onOpenFile={onOpenFile}
          onRunScenario={onRunScenario}
          isRunningCoreCommand={isRunningCoreCommand}
        />
      </section>

      <ScenarioConstructionPanel
        selectedScenario={selectedScenario}
        selectedReport={selectedReport}
        selectedRunRecord={selectedRunRecord}
        timelineRecords={timelineRecords}
        onOpenFile={onOpenFile}
        onRunScenario={onRunScenario}
        onSelectSimulationRecord={onSelectSimulationRecord}
        isRunningCoreCommand={isRunningCoreCommand}
      />

      <section className="scenario-evidence-work-grid" aria-label="Scenario run evidence">
        <TimelineEvidencePanel
          activeLane={activeLane}
          laneSummaries={laneSummaries}
          records={filteredTimelineRecords}
          totalRecords={timelineRecords.length}
          selectedRecordId={selectedTimelineRecord?.id ?? null}
          onSelectLane={setActiveLane}
          onSelectRecord={(record) => {
            setSelectedTimelineRecordId(record.id);
            onSelectSimulationRecord({
              kind: record.kind,
              title: record.title,
              record: record.record,
            });
          }}
        />

        <ScenarioInspectorPreview
          selectedReport={selectedReport}
          selectedRecord={selectedTimelineRecord}
          onSelectRecord={onSelectSimulationRecord}
        />
      </section>

      <ScenarioArtifactDock artifacts={selectedArtifacts} onOpenFile={onOpenFile} />

      <ScenarioGuardrailStrip />
    </DesktopSurface>
  );
}

function ScenarioEvidenceHeader({
  scenarioFiles,
  selectedReport,
  scenarioRunIndex,
  generatedHydration,
  generatedEvidenceArtifactSummary,
  isHydratingGeneratedReports,
}: {
  scenarioFiles: ProjectEntry[];
  selectedReport: CoreSimulationReport | null;
  scenarioRunIndex: CoreScenarioRunIndex | null;
  generatedHydration: GeneratedReportHydrationResult | null;
  generatedEvidenceArtifactSummary: GeneratedEvidenceArtifactSummary | null;
  isHydratingGeneratedReports: boolean;
}) {
  const artifactCount = generatedEvidenceArtifactSummary
    ? generatedEvidenceArtifactSummary.reportCandidates.length +
      generatedEvidenceArtifactSummary.logCandidates.length
    : generatedHydration?.artifactCount ?? null;
  const indexedRunCount = scenarioRunIndex?.summary.total ?? null;
  const parsedReportCount = generatedHydration?.parsedReportCount ?? null;

  return (
    <header className="scenario-evidence-header">
      <div className="scenario-evidence-title-block">
        <span className="cockpit-eyebrow">Scenario Evidence</span>
        <h2>Scenarios</h2>
        <p>
          Inspect scenario sources, Core simulation reports, and generated evidence.
        </p>
      </div>

      <div className="scenario-posture-grid" aria-label="Scenario evidence posture">
        <ScenarioPostureCard label="Mission" value={selectedReport?.mission ?? NOT_REPORTED} />
        <ScenarioPostureCard label="Scenario sources" value={String(scenarioFiles.length)} />
        <ScenarioPostureCard
          label="Scenario run index"
          value={
            isHydratingGeneratedReports
              ? "reading"
              : indexedRunCount === null
                ? NOT_REPORTED
                : `${indexedRunCount} runs`
          }
        />
        <ScenarioPostureCard
          label="Generated reports"
          value={
            parsedReportCount === null
              ? selectedReport
                ? "1 active"
                : NOT_REPORTED
              : String(parsedReportCount)
          }
          tone={selectedReport?.result ?? "neutral"}
        />
        <ScenarioPostureCard
          label="Artifacts"
          value={artifactCount === null ? "not inspected" : String(artifactCount)}
        />
      </div>

      <div className="scenario-boundary-row" aria-label="Scenario cockpit boundaries">
        <ProvenanceBadge label="READ-ONLY" />
        <ProvenanceBadge label="CORE-DERIVED" />
        <StatusBadge label="NO INFERENCE" />
        <StatusBadge label="NO YAML EDITOR" />
      </div>
    </header>
  );
}

function ScenarioPostureCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <article className={`scenario-posture-card scenario-posture-card-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ScenarioCatalog({
  rows,
  selectedScenario,
  onSelectScenario,
}: {
  rows: ScenarioCatalogRow[];
  selectedScenario: ProjectEntry | null;
  onSelectScenario: (scenario: ProjectEntry) => void;
}) {
  return (
    <section className="scenario-panel scenario-catalog-panel" aria-label="Scenario catalog">
      <div className="scenario-panel-heading">
        <div>
          <span className="cockpit-eyebrow">Scenario Catalog</span>
          <h3>Scenario YAML sources and reported run state</h3>
        </div>
        <StatusBadge label={`${rows.length} SCENARIOS`} />
      </div>

      {rows.length > 0 ? (
        <div className="scenario-catalog-table" role="table" aria-label="Scenario catalog table">
          <div className="scenario-catalog-row scenario-catalog-row-head" role="row">
            <span>Scenario YAML</span>
            <span>Result</span>
            <span>Cmds</span>
            <span>Events</span>
            <span>Modes</span>
            <span>Expect.</span>
            <span>DF Evid.</span>
            <span>Report</span>
          </div>
          {rows.map((row) => {
            const isSelected = selectedScenario?.path === row.scenario.path;

            return (
              <button
                className={[
                  "scenario-catalog-row",
                  "scenario-catalog-row-button",
                  isSelected ? "scenario-catalog-row-selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={row.scenario.path}
                type="button"
                onClick={() => onSelectScenario(row.scenario)}
                role="row"
              >
                <strong title={row.scenario.path}>{row.scenario.name}</strong>
                <span className={`scenario-result-pill scenario-result-pill-${row.tone}`}>
                  {row.result}
                </span>
                <span>{row.commands}</span>
                <span>{row.events}</span>
                <span>{row.modes}</span>
                <span>{row.expectations}</span>
                <span>{row.dataFlow}</span>
                <span title={row.reportPath}>{row.reportState}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <ScenarioEmptyState
          title="No scenario sources detected"
          detail="No YAML files were detected in the workspace scenarios area."
        />
      )}
    </section>
  );
}

function SelectedScenarioOverview({
  selectedScenario,
  selectedReport,
  selectedRunRecord,
  simulationReportSource,
  coreResult,
  selectedArtifacts,
  onOpenFile,
  onRunScenario,
  isRunningCoreCommand,
}: {
  selectedScenario: ProjectEntry | null;
  selectedReport: CoreSimulationReport | null;
  selectedRunRecord: CoreScenarioRunRecord | null;
  simulationReportSource: string | null;
  coreResult: CoreCommandResult | null;
  selectedArtifacts: ScenarioArtifactCard[];
  onOpenFile: (entry: ProjectEntry) => void;
  onRunScenario: (entry: ProjectEntry) => void;
  isRunningCoreCommand: boolean;
}) {
  const reportPath = selectedReport && coreResult?.json_report_available
    ? coreResult.json_report_path
    : selectedRunRecord?.report_path ?? null;
  const logPath = selectedReport && coreResult?.log_available ? coreResult.log_path : null;
  const resultLabel = selectedReport?.result ?? selectedRunRecord?.result ?? "not run";
  const missionLabel = selectedReport?.mission ?? selectedRunRecord?.mission ?? NOT_REPORTED;

  return (
    <section className="scenario-panel scenario-selected-overview" aria-label="Selected scenario overview">
      <div className="scenario-panel-heading">
        <div>
          <span className="cockpit-eyebrow">Selected Scenario Overview</span>
          <h3>{selectedScenario ? stripYamlExtension(selectedScenario.name) : "No scenario selected"}</h3>
        </div>
        <StatusBadge label={resultLabel.toUpperCase()} />
      </div>

      {selectedScenario ? (
        <>
          <div className="scenario-overview-grid">
            <ScenarioFact label="Mission" value={missionLabel} />
            <ScenarioFact label="Source YAML" value={selectedScenario.path} />
            <ScenarioFact label="Result" value={resultLabel.toUpperCase()} />
            <ScenarioFact label="Report source" value={simulationReportSource ?? NOT_REPORTED} />
            <ScenarioFact label="Report JSON" value={reportPath ?? NOT_REPORTED} />
            <ScenarioFact label="Log" value={logPath ?? NOT_REPORTED} />
            <ScenarioFact label="Final mode" value={selectedReport?.final_state.mode ?? NOT_REPORTED} />
            <ScenarioFact label="Expectations" value={formatExpectationSummary(selectedReport, selectedRunRecord)} />
            <ScenarioFact
              label="Data-flow evidence"
              value={formatScenarioCount(selectedReport, selectedRunRecord, "data_flow_evidence")}
            />
            <ScenarioFact label="Linked artifacts" value={String(selectedArtifacts.length)} />
          </div>

          <div className="scenario-overview-actions">
            <button
              type="button"
              className="scenario-secondary-button"
              onClick={() => onOpenFile(selectedScenario)}
              disabled={selectedScenario.kind !== "file"}
            >
              Open YAML source
            </button>
            <button
              type="button"
              className="scenario-primary-button"
              onClick={() => onRunScenario(selectedScenario)}
              disabled={selectedScenario.kind !== "file" || isRunningCoreCommand}
            >
              {isRunningCoreCommand ? "Running through Core" : "Run through Core"}
            </button>
          </div>
        </>
      ) : (
        <ScenarioEmptyState
          title="No scenario selected"
          detail="Open a workspace with scenario YAML sources to inspect scenario evidence."
        />
      )}
    </section>
  );
}

function ScenarioFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="scenario-fact" title={value}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ScenarioConstructionPanel({
  selectedScenario,
  selectedReport,
  selectedRunRecord,
  timelineRecords,
  onOpenFile,
  onRunScenario,
  onSelectSimulationRecord,
  isRunningCoreCommand,
}: {
  selectedScenario: ProjectEntry | null;
  selectedReport: CoreSimulationReport | null;
  selectedRunRecord: CoreScenarioRunRecord | null;
  timelineRecords: TimelineDisplayRecord[];
  onOpenFile: (entry: ProjectEntry) => void;
  onRunScenario: (entry: ProjectEntry) => void;
  onSelectSimulationRecord: (record: ScenarioTimelineInspectorRecord) => void;
  isRunningCoreCommand: boolean;
}) {
  const planSteps = createScenarioPlanSteps(selectedReport, selectedRunRecord, timelineRecords);

  return (
    <section className="scenario-panel scenario-construction-panel" aria-label="Scenario construction">
      <div className="scenario-panel-heading">
        <div>
          <span className="cockpit-eyebrow">Scenario Construction</span>
          <h3>How the selected scenario is built and what it exercises</h3>
          <p>
            The source YAML remains authoritative. Studio previews source identity and
            shows the execution flow only from Core-reported simulation evidence.
          </p>
        </div>
        <ProvenanceBadge label="SOURCE + CORE EVIDENCE" />
      </div>

      <div className="scenario-construction-grid">
        <article className="scenario-source-contract-card">
          <div className="scenario-source-card-header">
            <span>YAML source identity</span>
            <StatusBadge label="READ-ONLY" />
          </div>
          <div className="scenario-source-lines" aria-label="Scenario source metadata">
            <ScenarioSourceLine label="scenario_file" value={selectedScenario?.name ?? NOT_AVAILABLE} />
            <ScenarioSourceLine label="source_path" value={selectedScenario?.path ?? NOT_AVAILABLE} />
            <ScenarioSourceLine label="yaml_semantics" value="source of truth" />
            <ScenarioSourceLine label="studio_parsing" value="not performed" />
            <ScenarioSourceLine
              label="core_report"
              value={selectedReport ? selectedReport.scenario : NOT_REPORTED}
            />
            <ScenarioSourceLine label="description" value="not reported by Core" />
          </div>
          <div className="scenario-source-actions">
            <button
              type="button"
              className="scenario-secondary-button"
              onClick={() => selectedScenario && onOpenFile(selectedScenario)}
              disabled={!selectedScenario || selectedScenario.kind !== "file"}
            >
              Open source
            </button>
            <button
              type="button"
              className="scenario-primary-button"
              onClick={() => selectedScenario && onRunScenario(selectedScenario)}
              disabled={!selectedScenario || selectedScenario.kind !== "file" || isRunningCoreCommand}
            >
              {isRunningCoreCommand ? "Running" : "Run Core"}
            </button>
          </div>
        </article>

        <article className="scenario-execution-flow-card">
          <div className="scenario-source-card-header">
            <span>Scenario plan / execution flow</span>
            <StatusBadge label={selectedReport ? "CORE REPORTED" : "WAITING"} />
          </div>
          <div className="scenario-plan-flow" aria-label="Scenario execution flow">
            {planSteps.map((step, index) => (
              <div className="scenario-plan-step-wrap" key={step.id}>
                <button
                  className={`scenario-plan-step scenario-plan-step-${step.tone}`}
                  type="button"
                  onClick={() => {
                    if (!step.record) {
                      return;
                    }

                    onSelectSimulationRecord({
                      kind: step.kind,
                      title: step.title,
                      record: step.record,
                    });
                  }}
                  disabled={!step.record}
                >
                  <span>{step.time}</span>
                  <strong>{step.title}</strong>
                  <small>{step.detail}</small>
                </button>
                {index < planSteps.length - 1 ? <span className="scenario-plan-arrow">→</span> : null}
              </div>
            ))}
          </div>
          <div className="scenario-plan-summary-strip">
            <ScenarioMiniMetric label="Commands" value={formatScenarioCount(selectedReport, selectedRunRecord, "commands")} />
            <ScenarioMiniMetric label="Events" value={formatScenarioCount(selectedReport, selectedRunRecord, "events")} />
            <ScenarioMiniMetric label="Modes" value={formatScenarioCount(selectedReport, selectedRunRecord, "mode_transitions")} />
            <ScenarioMiniMetric label="Expectations" value={formatExpectationMetric(selectedReport, selectedRunRecord)} />
            <ScenarioMiniMetric label="Data-flow" value={formatScenarioCount(selectedReport, selectedRunRecord, "data_flow_evidence")} />
          </div>
        </article>
      </div>
    </section>
  );
}

interface ScenarioPlanStep {
  id: string;
  time: string;
  title: string;
  detail: string;
  tone: string;
  record: unknown | null;
  kind: ScenarioTimelineRecordKind;
}

function ScenarioSourceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="scenario-source-line">
      <code>{label}:</code>
      <span title={value}>{value}</span>
    </div>
  );
}

function ScenarioMiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="scenario-mini-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TimelineEvidencePanel({
  activeLane,
  laneSummaries,
  records,
  totalRecords,
  selectedRecordId,
  onSelectLane,
  onSelectRecord,
}: {
  activeLane: EvidenceLaneId;
  laneSummaries: Array<{ id: EvidenceLaneId; label: string; count: string }>;
  records: TimelineDisplayRecord[];
  totalRecords: number;
  selectedRecordId: string | null;
  onSelectLane: (lane: EvidenceLaneId) => void;
  onSelectRecord: (record: TimelineDisplayRecord) => void;
}) {
  return (
    <section className="scenario-panel scenario-timeline-evidence" aria-label="Timeline evidence">
      <div className="scenario-panel-heading scenario-timeline-heading">
        <div>
          <span className="cockpit-eyebrow">Timeline Evidence</span>
          <h3>Chronological records reported by Core</h3>
        </div>
        <StatusBadge label={`${totalRecords} RECORDS`} />
      </div>

      <div className="scenario-lane-filter-row" aria-label="Evidence lane filters">
        {laneSummaries.map((lane) => (
          <button
            className={[
              "scenario-lane-filter",
              activeLane === lane.id ? "scenario-lane-filter-active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={lane.id}
            type="button"
            onClick={() => onSelectLane(lane.id)}
          >
            <span>{lane.label}</span>
            <strong>{lane.count}</strong>
          </button>
        ))}
      </div>

      {activeLane === "artifacts" ? (
        <ScenarioEmptyState
          title="Artifacts are listed in the dock"
          detail="Generated files are preview-only and do not create scenario state."
        />
      ) : records.length > 0 ? (
        <div className="scenario-timeline-compact-list">
          {records.map((record) => (
            <button
              className={[
                  "scenario-timeline-compact-row",
                  selectedRecordId === record.id ? "scenario-timeline-compact-row-selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              key={record.id}
              type="button"
              onClick={() => onSelectRecord(record)}
            >
              <span className="scenario-timeline-compact-node" aria-hidden="true" />
              <span className="scenario-timeline-compact-time">{record.time}</span>
              <span className={`scenario-timeline-compact-badge scenario-timeline-compact-badge-${record.lane}`}>
                {record.badge}
              </span>
              <strong>{record.title}</strong>
              <span className="scenario-timeline-compact-detail">{record.detail}</span>
              <small className="scenario-timeline-compact-source">{record.source}</small>
            </button>
          ))}
        </div>
      ) : (
        <ScenarioEmptyState
          title="No timeline records reported"
          detail="Run the selected scenario through Core or select a valid simulation report."
        />
      )}
    </section>
  );
}

function ScenarioInspectorPreview({
  selectedReport,
  selectedRecord,
  onSelectRecord,
}: {
  selectedReport: CoreSimulationReport | null;
  selectedRecord: TimelineDisplayRecord | null;
  onSelectRecord: (record: ScenarioTimelineInspectorRecord) => void;
}) {
  const activeTab = selectedRecord ? getInspectorTabForTimelineRecord(selectedRecord) : "Scenario";
  const inspectorFields = selectedRecord ? createTimelineInspectorFields(selectedRecord) : [];
  const jsonPreview = selectedRecord ? JSON.stringify(selectedRecord.record, null, 2) : "not reported";

  return (
    <aside className="scenario-panel scenario-local-inspector" aria-label="Scenario inspector preview">
      <div className="scenario-panel-heading">
        <div>
          <span className="cockpit-eyebrow">Scenario Inspector</span>
          <h3>{selectedRecord ? selectedRecord.title : "Selected evidence preview"}</h3>
        </div>
        <StatusBadge label={selectedRecord ? selectedRecord.badge : "WAITING"} />
      </div>

      <div className="scenario-inspector-tabs" aria-label="Scenario inspector tabs">
        {["Scenario", "Timeline", "Commands", "Events", "Modes", "Data Flow", "Expectations", "Artifacts", "JSON"].map((tab) => (
          <span
            className={tab === activeTab ? "scenario-inspector-tab-active" : ""}
            key={tab}
          >
            {tab}
          </span>
        ))}
      </div>

      {selectedRecord ? (
        <>
          <div className="scenario-selected-record-summary">
            <span>{selectedRecord.time}</span>
            <strong>{selectedRecord.badge}</strong>
            <em>{selectedRecord.source}</em>
          </div>

          <div className="scenario-inspector-fields">
            {inspectorFields.map((field) => (
              <ScenarioFact key={field.label} label={field.label} value={field.value} />
            ))}
          </div>

          <button
            type="button"
            className="scenario-secondary-button scenario-inspector-open-button"
            onClick={() =>
              onSelectRecord({
                kind: selectedRecord.kind,
                title: selectedRecord.title,
                record: selectedRecord.record,
              })
            }
          >
            Open record in Inspector
          </button>

          <div className="scenario-json-preview">
            <span>Raw JSON record preview</span>
            <pre>{jsonPreview}</pre>
          </div>
        </>
      ) : (
        <ScenarioEmptyState
          title="No timeline record selected"
          detail={
            selectedReport
              ? "Select a command, event, mode transition, data-flow record or expectation from the timeline."
              : "No valid simulation report is selected."
          }
        />
      )}
    </aside>
  );
}

function getInspectorTabForTimelineRecord(record: TimelineDisplayRecord): string {
  switch (record.lane) {
    case "commands":
      return "Commands";
    case "events":
      return "Events";
    case "modes":
      return "Modes";
    case "dataFlow":
      return "Data Flow";
    case "expectations":
      return "Expectations";
    case "artifacts":
      return "Artifacts";
    default:
      return record.kind === "timeline" ? "Timeline" : "Scenario";
  }
}

function createTimelineInspectorFields(record: TimelineDisplayRecord): Array<{ label: string; value: string }> {
  const raw = record.record;

  switch (record.kind) {
    case "command":
      return [
        { label: "t", value: record.time },
        { label: "command_id", value: formatInspectorValue(getRecordValue(raw, "command_id")) },
        { label: "status", value: formatInspectorValue(getRecordValue(raw, "status")) },
        { label: "dispatch", value: formatInspectorValue(getRecordValue(raw, "dispatch")) },
        { label: "source", value: record.source },
        { label: "inference", value: "none" },
      ];
    case "event":
      return [
        { label: "t", value: record.time },
        { label: "event_id", value: formatInspectorValue(getRecordValue(raw, "event_id")) },
        { label: "severity", value: formatInspectorValue(getRecordValue(raw, "severity")) },
        { label: "detail", value: record.detail },
        { label: "source", value: record.source },
        { label: "inference", value: "none" },
      ];
    case "modeTransition":
      return [
        { label: "t", value: record.time },
        { label: "from", value: formatInspectorValue(getRecordValue(raw, "from")) },
        { label: "to", value: formatInspectorValue(getRecordValue(raw, "to")) },
        { label: "reason", value: formatInspectorValue(getRecordValue(raw, "reason")) },
        { label: "source", value: record.source },
        { label: "inference", value: "none" },
      ];
    case "dataFlowEvidence":
      return [
        { label: "t", value: record.time },
        { label: "data_product_id", value: formatInspectorValue(getRecordValue(raw, "data_product_id")) },
        { label: "producer", value: formatInspectorValue(getRecordValue(raw, "producer")) },
        { label: "triggered_by_command", value: formatInspectorValue(getRecordValue(raw, "triggered_by_command")) },
        { label: "storage_intent", value: formatInspectorValue(getRecordValue(raw, "storage_intent")) },
        { label: "downlink_intent", value: formatInspectorValue(getRecordValue(raw, "downlink_intent")) },
        { label: "eligible_downlink_flows", value: formatInspectorValue(getRecordValue(raw, "eligible_downlink_flows")) },
        { label: "contact_windows", value: formatInspectorValue(getRecordValue(raw, "contact_windows")) },
        { label: "inference", value: "none" },
      ];
    case "failedExpectation":
      return [
        { label: "t", value: record.time },
        { label: "expectation_type", value: formatInspectorValue(getRecordValue(raw, "expectation_type")) },
        { label: "target", value: formatInspectorValue(getRecordValue(raw, "target")) },
        { label: "result", value: formatInspectorValue(getRecordValue(raw, "result")) },
        { label: "message", value: formatInspectorValue(getRecordValue(raw, "message")) },
        { label: "inference", value: "none" },
      ];
    default:
      return [
        { label: "t", value: record.time },
        { label: "title", value: record.title },
        { label: "detail", value: record.detail },
        { label: "source", value: record.source },
        { label: "inference", value: "none" },
      ];
  }
}

function getRecordValue(record: unknown, key: string): unknown {
  if (!record || typeof record !== "object") {
    return undefined;
  }

  return (record as Record<string, unknown>)[key];
}

function formatInspectorValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim() ? value : NOT_REPORTED;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? `[${value.map((item) => formatInspectorValue(item)).join(", ")}]` : NOT_REPORTED;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);

    if (entries.length === 0) {
      return NOT_REPORTED;
    }

    if (entries.length <= 2) {
      return entries.map(([key, entryValue]) => `${key}: ${formatInspectorValue(entryValue)}`).join(" / ");
    }

    return `${entries.length} fields`;
  }

  return NOT_REPORTED;
}

function ScenarioArtifactDock({
  artifacts,
  onOpenFile,
}: {
  artifacts: ScenarioArtifactCard[];
  onOpenFile: (entry: ProjectEntry) => void;
}) {
  return (
    <section className="scenario-panel scenario-artifact-dock" aria-label="Scenario artifact dock">
      <div className="scenario-panel-heading">
        <div>
          <span className="cockpit-eyebrow">Artifact Dock</span>
          <h3>Read-only scenario artifacts and evidence files</h3>
        </div>
        <StatusBadge label={`${artifacts.length} LINKS`} />
      </div>

      {artifacts.length > 0 ? (
        <div className="scenario-artifact-card-row">
          {artifacts.map((artifact) => (
            <button
              className="scenario-artifact-card"
              key={artifact.id}
              type="button"
              onClick={() => artifact.entry && onOpenFile(artifact.entry)}
              disabled={!artifact.entry}
            >
              <span>{artifact.title}</span>
              <strong title={artifact.name}>{artifact.name}</strong>
              <small title={artifact.detail}>{artifact.detail}</small>
              <em>{artifact.badge}</em>
            </button>
          ))}
        </div>
      ) : (
        <ScenarioEmptyState
          title="No artifact links reported"
          detail="Artifact links are shown only when the source file or generated candidates are available."
        />
      )}
    </section>
  );
}

function ScenarioGuardrailStrip() {
  const guardrails = [
    "READ-ONLY",
    "CORE JSON ONLY",
    "NO YAML EDITOR",
    "NO LOG-DERIVED STATE",
    "NO UPLINK",
    "NO LIVE TELEMETRY",
    "NO PRIVATE SIMULATION",
  ];

  return (
    <section className="scenario-cockpit-guardrails" aria-label="Scenario cockpit guardrails">
      {guardrails.map((guardrail) => (
        <span key={guardrail}>{guardrail}</span>
      ))}
    </section>
  );
}

function ScenarioEmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="scenario-empty-state">
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

function createScenarioCatalogRow({
  scenario,
  simulationReports,
  scenarioRunIndex,
  isSelected,
  isRunningCoreCommand,
  artifactCandidates,
}: {
  scenario: ProjectEntry;
  simulationReports: CoreSimulationReport[];
  scenarioRunIndex: CoreScenarioRunIndex | null;
  isSelected: boolean;
  isRunningCoreCommand: boolean;
  artifactCandidates: PassiveArtifactCandidate[];
}): ScenarioCatalogRow {
  const matchingReport = findSimulationReportForScenario(scenario, simulationReports);
  const matchingRunRecord = findScenarioRunRecord(scenario, scenarioRunIndex);
  const hasArtifactCandidate = artifactCandidates.some((artifact) =>
    artifactMatchesScenario(artifact.name, scenario),
  );

  if (isSelected && isRunningCoreCommand) {
    return {
      scenario,
      result: "RUNNING",
      tone: "running",
      commands: NOT_REPORTED,
      events: NOT_REPORTED,
      modes: NOT_REPORTED,
      expectations: NOT_REPORTED,
      dataFlow: NOT_REPORTED,
      reportState: "running",
      reportPath: NOT_REPORTED,
    };
  }

  if (matchingReport) {
    return {
      scenario,
      result: matchingReport.result.toUpperCase(),
      tone: matchingReport.result,
      commands: String(matchingReport.summary.commands),
      events: String(matchingReport.summary.events),
      modes: String(matchingReport.summary.mode_transitions),
      expectations: formatExpectationMetric(matchingReport, matchingRunRecord),
      dataFlow: String(matchingReport.summary.data_flow_evidence),
      reportState: "loaded",
      reportPath: matchingRunRecord?.report_path ?? "simulation report loaded",
    };
  }

  if (matchingRunRecord) {
    return {
      scenario,
      result: matchingRunRecord.result.toUpperCase(),
      tone: matchingRunRecord.result,
      commands: formatRunSummaryCount(matchingRunRecord, "commands"),
      events: formatRunSummaryCount(matchingRunRecord, "events"),
      modes: formatRunSummaryCount(matchingRunRecord, "mode_transitions"),
      expectations: formatRunSummaryCount(matchingRunRecord, "expectations"),
      dataFlow: formatRunSummaryCount(matchingRunRecord, "data_flow_evidence"),
      reportState: "indexed",
      reportPath: matchingRunRecord.report_path,
    };
  }

  return {
    scenario,
    result: hasArtifactCandidate ? "REPORT" : "NOT RUN",
    tone: hasArtifactCandidate ? "reported" : "not-run",
    commands: NOT_REPORTED,
    events: NOT_REPORTED,
    modes: NOT_REPORTED,
    expectations: NOT_REPORTED,
    dataFlow: NOT_REPORTED,
    reportState: hasArtifactCandidate ? "candidate" : "not reported",
    reportPath: hasArtifactCandidate ? "generated artifact candidate" : NOT_REPORTED,
  };
}

function createTimelineDisplayRecords(
  simulationReport: CoreSimulationReport | null,
): TimelineDisplayRecord[] {
  if (!simulationReport) {
    return [];
  }

  const records: TimelineDisplayRecord[] = [
    ...simulationReport.commands.map(mapCommandRecord),
    ...simulationReport.events.map(mapEventRecord),
    ...simulationReport.mode_transitions.map(mapModeTransitionRecord),
    ...simulationReport.data_flow_evidence.map(mapDataFlowRecord),
    ...(simulationReport.expectations?.records ?? []).map(mapExpectationRecord),
  ];

  if (records.length === 0) {
    return simulationReport.timeline.map(mapTimelineRecord);
  }

  return records.sort((left, right) => left.sortTime - right.sortTime || left.id.localeCompare(right.id));
}

function mapCommandRecord(record: CoreSimulationCommandRecord, index: number): TimelineDisplayRecord {
  return {
    id: `command-${record.t}-${record.command_id}-${index}`,
    time: formatTime(record.t),
    sortTime: record.t,
    badge: "COMMAND",
    kind: "command",
    lane: "commands",
    title: record.command_id,
    detail: `${record.status} / ${record.dispatch}`,
    source: "Core sim",
    record,
  };
}

function mapEventRecord(record: CoreSimulationEventRecord, index: number): TimelineDisplayRecord {
  return {
    id: `event-${record.t}-${record.event_id}-${index}`,
    time: formatTime(record.t),
    sortTime: record.t,
    badge: "EVENT",
    kind: "event",
    lane: "events",
    title: record.event_id,
    detail: `severity: ${record.severity}`,
    source: "Core sim",
    record,
  };
}

function mapModeTransitionRecord(
  record: CoreSimulationModeTransitionRecord,
  index: number,
): TimelineDisplayRecord {
  return {
    id: `mode-${record.t}-${record.from}-${record.to}-${index}`,
    time: formatTime(record.t),
    sortTime: record.t,
    badge: "MODE",
    kind: "modeTransition",
    lane: "modes",
    title: `${record.from} → ${record.to}`,
    detail: record.reason,
    source: "Core sim",
    record,
  };
}

function mapDataFlowRecord(
  record: CoreSimulationDataFlowEvidenceRecord,
  index: number,
): TimelineDisplayRecord {
  return {
    id: `data-flow-${record.t}-${record.data_product_id ?? index}`,
    time: formatTime(record.t),
    sortTime: record.t,
    badge: "DATA FLOW",
    kind: "dataFlowEvidence",
    lane: "dataFlow",
    title: record.data_product_id ?? "data-flow evidence",
    detail: record.producer ? `producer: ${record.producer}` : "producer not reported",
    source: "Core sim",
    record,
  };
}

function mapExpectationRecord(
  record: CoreSimulationExpectationRecord,
  index: number,
): TimelineDisplayRecord {
  return {
    id: `expectation-${record.t}-${record.target}-${index}`,
    time: formatTime(record.t),
    sortTime: record.t,
    badge: "EXPECTATION",
    kind: "failedExpectation",
    lane: "expectations",
    title: `${record.expectation_type}: ${record.target}`,
    detail: record.message,
    source: record.result,
    record,
  };
}

function mapTimelineRecord(record: CoreSimulationTimelineEntry, index: number): TimelineDisplayRecord {
  return {
    id: `timeline-${record.t}-${record.time}-${index}`,
    time: record.time || formatTime(record.t),
    sortTime: record.t,
    badge: "TIMELINE",
    kind: "timeline",
    lane: "all",
    title: record.rendered,
    detail: record.message,
    source: "Core timeline",
    record,
  };
}

function createEvidenceLaneSummaries(
  selectedReport: CoreSimulationReport | null,
  selectedRunRecord: CoreScenarioRunRecord | null,
  artifactCount: number,
): Array<{ id: EvidenceLaneId; label: string; count: string }> {
  const expectations = selectedReport || selectedRunRecord
    ? formatExpectationMetric(selectedReport, selectedRunRecord)
    : NOT_REPORTED;

  return [
    { id: "all", label: "All", count: selectedReport ? String(createTimelineDisplayRecords(selectedReport).length) : "0" },
    { id: "commands", label: "Commands", count: formatScenarioCount(selectedReport, selectedRunRecord, "commands", "0") },
    { id: "events", label: "Events", count: formatScenarioCount(selectedReport, selectedRunRecord, "events", "0") },
    { id: "modes", label: "Modes", count: formatScenarioCount(selectedReport, selectedRunRecord, "mode_transitions", "0") },
    { id: "dataFlow", label: "Data Flow", count: formatScenarioCount(selectedReport, selectedRunRecord, "data_flow_evidence", "0") },
    { id: "expectations", label: "Expectations", count: expectations },
    { id: "artifacts", label: "Artifacts", count: String(artifactCount) },
  ];
}

function createScenarioPlanSteps(
  selectedReport: CoreSimulationReport | null,
  selectedRunRecord: CoreScenarioRunRecord | null,
  timelineRecords: TimelineDisplayRecord[],
): ScenarioPlanStep[] {
  if (selectedReport && timelineRecords.length > 0) {
    return timelineRecords.slice(0, 6).map((record, index) => ({
      id: `reported-step-${record.id}`,
      time: record.time,
      title: record.title,
      detail: record.badge.toLowerCase(),
      tone: record.lane,
      record: record.record,
      kind: record.kind,
    }));
  }

  if (selectedRunRecord) {
    return [
      {
        id: "source",
        time: "source",
        title: "Scenario YAML",
        detail: "read-only source",
        tone: "source",
        record: null,
        kind: "timeline",
      },
      {
        id: "indexed-report",
        time: "index",
        title: selectedRunRecord.report_file,
        detail: selectedRunRecord.result,
        tone: selectedRunRecord.result,
        record: selectedRunRecord,
        kind: "timeline",
      },
      {
        id: "indexed-summary",
        time: "summary",
        title: "Run summary",
        detail: `${formatRunSummaryCount(selectedRunRecord, "commands")} commands / ${formatRunSummaryCount(selectedRunRecord, "events")} events`,
        tone: "dataFlow",
        record: selectedRunRecord.summary,
        kind: "timeline",
      },
      {
        id: "report-load",
        time: "detail",
        title: "Open report JSON",
        detail: "timeline requires simulation JSON",
        tone: "events",
        record: selectedRunRecord,
        kind: "timeline",
      },
    ];
  }

  return [
    {
      id: "source",
      time: "source",
      title: "Scenario YAML",
      detail: "read-only source",
      tone: "source",
      record: null,
      kind: "timeline",
    },
    {
      id: "core-run",
      time: "Core",
      title: "Run wrapper",
      detail: "fixed command path",
      tone: "commands",
      record: null,
      kind: "command",
    },
    {
      id: "report",
      time: "report",
      title: "Simulation JSON",
      detail: NOT_REPORTED,
      tone: "events",
      record: null,
      kind: "timeline",
    },
    {
      id: "evidence",
      time: "evidence",
      title: "Timeline evidence",
      detail: NOT_REPORTED,
      tone: "dataFlow",
      record: null,
      kind: "timeline",
    },
  ];
}

function buildScenarioArtifactCards({
  scenario,
  selectedReport,
  selectedRunRecord,
  coreResult,
  artifactCandidates,
}: {
  scenario: ProjectEntry;
  selectedReport: CoreSimulationReport | null;
  selectedRunRecord: CoreScenarioRunRecord | null;
  coreResult: CoreCommandResult | null;
  artifactCandidates: PassiveArtifactCandidate[];
}): ScenarioArtifactCard[] {
  const cards: ScenarioArtifactCard[] = [
    {
      id: `source-${scenario.path}`,
      title: "YAML Source",
      name: scenario.name,
      detail: scenario.path,
      badge: "READ-ONLY",
      entry: scenario,
    },
  ];

  const matchingCandidates = artifactCandidates.filter((artifact) =>
    artifactMatchesScenario(artifact.name, scenario),
  );

  for (const artifact of matchingCandidates) {
    cards.push({
      id: artifact.path,
      title: artifact.artifactClass === "logs" ? "Simulation Log" : "Simulation Report",
      name: artifact.name,
      detail: artifact.relativePath,
      badge: artifact.previewStatus === "previewable" ? "PREVIEW" : "METADATA",
      entry: {
        name: artifact.name,
        path: artifact.path,
        kind: "file",
        category: "derivedReport",
      },
    });
  }

  if (selectedRunRecord) {
    cards.push({
      id: `run-index-report-${selectedRunRecord.report_path}`,
      title: "Indexed Report",
      name: selectedRunRecord.report_file,
      detail: selectedRunRecord.report_path,
      badge: "SCENARIO RUN INDEX",
      entry: {
        name: selectedRunRecord.report_file,
        path: selectedRunRecord.report_path,
        kind: "file",
        category: "derivedReport",
      },
    });
  }

  for (const artifact of artifactCandidates.filter(isGlobalScenarioEvidenceArtifact)) {
    cards.push({
      id: `global-${artifact.path}`,
      title: artifact.name.includes("coverage") ? "Coverage Summary" : "Scenario Run Index",
      name: artifact.name,
      detail: artifact.relativePath,
      badge: "READ-ONLY",
      entry: {
        name: artifact.name,
        path: artifact.path,
        kind: "file",
        category: "derivedReport",
      },
    });
  }

  if (selectedReport && coreResult?.json_report_available && coreResult.json_report_path) {
    cards.push({
      id: `core-report-${coreResult.json_report_path}`,
      title: "Core Report JSON",
      name: basename(coreResult.json_report_path),
      detail: coreResult.json_report_path,
      badge: "READ-ONLY",
      entry: {
        name: basename(coreResult.json_report_path),
        path: coreResult.json_report_path,
        kind: "file",
        category: "derivedReport",
      },
    });
  }

  if (selectedReport && coreResult?.log_available && coreResult.log_path) {
    cards.push({
      id: `core-log-${coreResult.log_path}`,
      title: "Core Simulation Log",
      name: basename(coreResult.log_path),
      detail: coreResult.log_path,
      badge: "READ-ONLY",
      entry: {
        name: basename(coreResult.log_path),
        path: coreResult.log_path,
        kind: "file",
        category: "derivedReport",
      },
    });
  }

  return dedupeArtifactCards(cards).slice(0, 8);
}

function dedupeArtifactCards(cards: ScenarioArtifactCard[]): ScenarioArtifactCard[] {
  const seen = new Set<string>();
  const nextCards: ScenarioArtifactCard[] = [];

  for (const card of cards) {
    if (seen.has(card.id)) {
      continue;
    }

    seen.add(card.id);
    nextCards.push(card);
  }

  return nextCards;
}

function formatExpectationSummary(
  report: CoreSimulationReport | null,
  runRecord: CoreScenarioRunRecord | null = null,
): string {
  if (!report) {
    return runRecord ? formatRunSummaryCount(runRecord, "expectations") : NOT_REPORTED;
  }

  if (report.expectations) {
    return `${report.expectations.passed} passed / ${report.expectations.failed} failed`;
  }

  if (
    typeof report.summary.expectations === "number" ||
    typeof report.summary.passed_expectations === "number"
  ) {
    const total = report.summary.expectations ?? NOT_REPORTED;
    const passed = report.summary.passed_expectations ?? NOT_REPORTED;
    return `${passed} passed / ${total} total`;
  }

  if (report.summary.failed_expectations > 0) {
    return `${report.summary.failed_expectations} failed`;
  }

  return NOT_REPORTED;
}

function formatExpectationMetric(
  report: CoreSimulationReport | null,
  runRecord: CoreScenarioRunRecord | null = null,
): string {
  if (!report) {
    return runRecord ? formatRunSummaryCount(runRecord, "expectations") : "0";
  }

  if (report.expectations) {
    return String(report.expectations.total);
  }

  if (typeof report.summary.expectations === "number") {
    return String(report.summary.expectations);
  }

  return report.summary.failed_expectations > 0
    ? String(report.summary.failed_expectations)
    : NOT_REPORTED;
}

function formatScenarioCount(
  report: CoreSimulationReport | null,
  runRecord: CoreScenarioRunRecord | null,
  key: string,
  fallback = NOT_REPORTED,
): string {
  if (report) {
    switch (key) {
      case "commands":
        return String(report.summary.commands);
      case "events":
        return String(report.summary.events);
      case "mode_transitions":
        return String(report.summary.mode_transitions);
      case "data_flow_evidence":
        return String(report.summary.data_flow_evidence);
      case "failed_expectations":
        return String(report.summary.failed_expectations);
    }
  }

  if (runRecord) {
    return formatRunSummaryCount(runRecord, key, fallback);
  }

  return fallback;
}

function formatRunSummaryCount(
  runRecord: CoreScenarioRunRecord,
  key: string,
  fallback = NOT_REPORTED,
): string {
  const value = runRecord.summary[key];

  return typeof value === "number" ? String(value) : fallback;
}

function mergeSimulationReports(reports: CoreSimulationReport[]): CoreSimulationReport[] {
  const byScenario = new Map<string, CoreSimulationReport>();

  for (const report of reports) {
    const key = normalizeScenarioName(report.scenario);
    const current = byScenario.get(key);

    if (!current || report.summary.data_flow_evidence >= current.summary.data_flow_evidence) {
      byScenario.set(key, report);
    }
  }

  return Array.from(byScenario.values());
}

function findSimulationReportForScenario(
  scenario: ProjectEntry,
  reports: CoreSimulationReport[],
): CoreSimulationReport | null {
  return reports.find((report) => scenarioMatchesReport(scenario, report)) ?? null;
}

function findScenarioRunRecord(
  scenario: ProjectEntry,
  scenarioRunIndex: CoreScenarioRunIndex | null,
): CoreScenarioRunRecord | null {
  return (
    scenarioRunIndex?.runs.find((run) => scenarioMatchesRunRecord(scenario, run)) ?? null
  );
}

function scenarioMatchesRunRecord(
  scenario: ProjectEntry,
  runRecord: CoreScenarioRunRecord,
): boolean {
  const scenarioName = normalizeScenarioName(scenario.name);
  const scenarioPath = normalizeScenarioName(scenario.path);
  const runScenario = normalizeScenarioName(runRecord.scenario);
  const reportFile = normalizeScenarioName(runRecord.report_file);

  return (
    scenarioName === runScenario ||
    scenarioName.includes(runScenario) ||
    runScenario.includes(scenarioName) ||
    scenarioPath.includes(runScenario) ||
    reportFile.includes(scenarioName)
  );
}

function isGlobalScenarioEvidenceArtifact(artifact: PassiveArtifactCandidate): boolean {
  const normalized = artifact.name.toLowerCase();

  return (
    normalized.includes("scenario_run_index") ||
    normalized.includes("coverage_summary")
  );
}

function scenarioMatchesReport(scenario: ProjectEntry, report: CoreSimulationReport): boolean {
  const scenarioName = normalizeScenarioName(scenario.name);
  const scenarioPath = normalizeScenarioName(scenario.path);
  const reportScenario = normalizeScenarioName(report.scenario);

  return (
    scenarioName === reportScenario ||
    scenarioName.includes(reportScenario) ||
    reportScenario.includes(scenarioName) ||
    scenarioPath.includes(reportScenario)
  );
}

function artifactMatchesScenario(artifactName: string, scenario: ProjectEntry): boolean {
  const scenarioName = normalizeScenarioName(scenario.name);
  const artifact = normalizeScenarioName(artifactName);

  return artifact.includes(scenarioName) || scenarioName.includes(artifact);
}

function normalizeScenarioName(value: string): string {
  return value
    .split(/[\\/]/)
    .pop()!
    .replace(/\.ya?ml$/i, "")
    .replace(/\.json$/i, "")
    .replace(/\.log$/i, "")
    .replace(/^sim[_-]/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function stripYamlExtension(value: string): string {
  return value.replace(/\.ya?ml$/i, "");
}

function basename(value: string): string {
  return value.split(/[\\/]/).filter(Boolean).pop() ?? value;
}

function formatTime(value: number): string {
  return `t+${String(value).padStart(2, "0")}`;
}

function stringOrNotReported(value: string | undefined): string {
  return value && value.trim() ? value : NOT_REPORTED;
}

function formatArrayField(value: string[] | undefined): string {
  return value && value.length > 0 ? `[${value.join(", ")}]` : NOT_REPORTED;
}

function formatJsonField(value: { [key: string]: CoreSimulationJsonValue } | undefined): string {
  if (!value) {
    return NOT_REPORTED;
  }

  const keys = Object.keys(value);

  if (keys.length === 0) {
    return NOT_REPORTED;
  }

  return keys.length === 1 ? `${keys[0]}: ${String(value[keys[0]])}` : `${keys.length} fields`;
}
