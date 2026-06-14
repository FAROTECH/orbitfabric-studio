import { invoke } from "@tauri-apps/api/core";

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
  clearGeneratedArtifactInventory,
  publishGeneratedArtifactInventory,
} from "./generatedArtifactInventoryStore";
import type {
  CoreCoverageSummary,
  CoreDashboardSummary,
  CoreEntityIndex,
  CoreLintReport,
  CoreModelSummary,
  CoreRelationshipManifest,
  CoreScenarioRunIndex,
  CoreSimulationReport,
  FileContent,
  GeneratedArtifactEntry,
  GeneratedArtifactInventory,
} from "./types/workspace";

export interface PassiveCoreReportSnapshots {
  lintReport: CoreLintReport | null;
  modelSummary: CoreModelSummary | null;
  entityIndex: CoreEntityIndex | null;
  relationshipManifest: CoreRelationshipManifest | null;
  dashboardSummary: CoreDashboardSummary | null;
  scenarioRunIndex: CoreScenarioRunIndex | null;
  coverageSummary: CoreCoverageSummary | null;
  simulationReport: CoreSimulationReport | null;
  simulationReports: CoreSimulationReport[];
}

export interface GeneratedReportHydrationResult {
  coreReportSnapshots: PassiveCoreReportSnapshots;
  artifactCount: number;
  parsedReportCount: number;
  warnings: string[];
}

const EMPTY_CORE_REPORT_SNAPSHOTS: PassiveCoreReportSnapshots = {
  lintReport: null,
  modelSummary: null,
  entityIndex: null,
  relationshipManifest: null,
  dashboardSummary: null,
  scenarioRunIndex: null,
  coverageSummary: null,
  simulationReport: null,
  simulationReports: [],
};

export async function hydrateGeneratedReportsFromWorkspace(
  workspacePath: string,
): Promise<GeneratedReportHydrationResult> {
  const warnings: string[] = [];
  let coreReportSnapshots: PassiveCoreReportSnapshots = {
    ...EMPTY_CORE_REPORT_SNAPSHOTS,
  };

  try {
    const inventory = await invoke<GeneratedArtifactInventory>(
      "inspect_generated_artifacts",
      { workspacePath },
    );

    publishGeneratedArtifactInventory(workspacePath, inventory);
    warnings.push(...inventory.warnings);

    let parsedReportCount = 0;

    for (const artifact of inventory.artifacts.filter(isReadableJsonReportArtifact)) {
      try {
        const file = await invoke<FileContent>("read_text_file", {
          workspacePath,
          filePath: artifact.path,
        });
        const parsedReport = parseGeneratedReportContent(file.content);

        if (hasAnyParsedReport(parsedReport)) {
          parsedReportCount += 1;
          coreReportSnapshots = mergeCoreReportSnapshots(
            coreReportSnapshots,
            parsedReport,
          );
        }
      } catch (caught) {
        warnings.push(
          `Unable to hydrate generated report ${artifact.relative_path}: ${formatCaughtError(caught)}`,
        );
      }
    }

    return {
      coreReportSnapshots,
      artifactCount: inventory.counts.total_artifacts,
      parsedReportCount,
      warnings,
    };
  } catch (caught) {
    clearGeneratedArtifactInventory(workspacePath);

    return {
      coreReportSnapshots,
      artifactCount: 0,
      parsedReportCount: 0,
      warnings: [
        `Unable to inspect generated reports passively: ${formatCaughtError(caught)}`,
      ],
    };
  }
}

function isReadableJsonReportArtifact(artifact: GeneratedArtifactEntry): boolean {
  return (
    artifact.artifact_class === "reports" &&
    artifact.preview_status === "previewable" &&
    artifact.relative_path.toLowerCase().endsWith(".json")
  );
}

function parseGeneratedReportContent(content: string): Partial<PassiveCoreReportSnapshots> {
  return {
    lintReport: parseCoreLintReport(content),
    modelSummary: parseCoreModelSummary(content),
    entityIndex: parseCoreEntityIndex(content),
    relationshipManifest: parseCoreRelationshipManifest(content),
    dashboardSummary: parseCoreDashboardSummary(content),
    scenarioRunIndex: parseCoreScenarioRunIndex(content),
    coverageSummary: parseCoreCoverageSummary(content),
    simulationReport: parseCoreSimulationReport(content),
  };
}

function hasAnyParsedReport(candidate: Partial<PassiveCoreReportSnapshots>): boolean {
  return Boolean(
    candidate.lintReport ||
      candidate.modelSummary ||
      candidate.entityIndex ||
      candidate.relationshipManifest ||
      candidate.dashboardSummary ||
      candidate.scenarioRunIndex ||
      candidate.coverageSummary ||
      candidate.simulationReport,
  );
}

function mergeCoreReportSnapshots(
  current: PassiveCoreReportSnapshots,
  next: Partial<PassiveCoreReportSnapshots>,
): PassiveCoreReportSnapshots {
  return {
    lintReport: next.lintReport ?? current.lintReport,
    modelSummary: next.modelSummary ?? current.modelSummary,
    entityIndex: next.entityIndex ?? current.entityIndex,
    relationshipManifest: next.relationshipManifest ?? current.relationshipManifest,
    dashboardSummary: next.dashboardSummary ?? current.dashboardSummary,
    scenarioRunIndex: next.scenarioRunIndex ?? current.scenarioRunIndex,
    coverageSummary: next.coverageSummary ?? current.coverageSummary,
    simulationReport: selectSimulationReport(
      current.simulationReport,
      next.simulationReport ?? null,
    ),
    simulationReports: next.simulationReport
      ? upsertSimulationReport(current.simulationReports, next.simulationReport)
      : current.simulationReports,
  };
}

function selectSimulationReport(
  current: CoreSimulationReport | null,
  next: CoreSimulationReport | null,
): CoreSimulationReport | null {
  if (!next) {
    return current;
  }

  if (!current) {
    return next;
  }

  const currentEvidenceCount = current.summary.data_flow_evidence;
  const nextEvidenceCount = next.summary.data_flow_evidence;

  if (currentEvidenceCount === 0 && nextEvidenceCount > 0) {
    return next;
  }

  if (nextEvidenceCount > currentEvidenceCount) {
    return next;
  }

  return current;
}

function upsertSimulationReport(
  reports: CoreSimulationReport[],
  report: CoreSimulationReport,
): CoreSimulationReport[] {
  const nextReports = reports.filter((candidate) => candidate.scenario !== report.scenario);

  return [...nextReports, report];
}

function formatCaughtError(caught: unknown): string {
  return caught instanceof Error ? caught.message : String(caught);
}
