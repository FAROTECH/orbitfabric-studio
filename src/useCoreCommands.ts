import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import { createCoreReportSnapshotsUpdater } from "./coreReportSnapshotUpdate";
import {
  createEmptyCoreReportSnapshots,
  type CoreReportSnapshots,
} from "./coreReportSnapshots";
import type {
  CoreCommandResult,
  ProjectEntry,
  WorkspaceInspection,
} from "./types/workspace";

export interface UseCoreCommandsOptions {
  workspace: WorkspaceInspection | null;
  onCoreOutput: (result: CoreCommandResult) => void;
  onScenarioExecutionStart: () => void;
  onGeneratedArtifactRefresh: () => void;
}

export function useCoreCommands(options: UseCoreCommandsOptions) {
  const {
    workspace,
    onCoreOutput,
    onScenarioExecutionStart,
    onGeneratedArtifactRefresh,
  } = options;
  const [coreExecutable, setCoreExecutable] = useState("orbitfabric");
  const [coreResult, setCoreResult] = useState<CoreCommandResult | null>(null);
  const [coreReportSnapshots, setCoreReportSnapshots] =
    useState<CoreReportSnapshots>(() => createEmptyCoreReportSnapshots());
  const [coreError, setCoreError] = useState<string | null>(null);
  const [isRunningCoreCommand, setIsRunningCoreCommand] = useState(false);

  function resetCoreCommandState(): void {
    setCoreError(null);
    setCoreResult(null);
    setCoreReportSnapshots(createEmptyCoreReportSnapshots());
  }

  function hydrateCoreReportSnapshots(snapshots: CoreReportSnapshots): void {
    setCoreReportSnapshots(snapshots);
  }

  async function handleCoreVersion() {
    await runCoreCommand("run_core_version", { executable: coreExecutable });
  }

  async function handleCoreInspectMission() {
    if (!workspace?.mission_dir) {
      setCoreError("No mission directory is available for Core inspection.");
      return;
    }

    await runCoreCommand("run_core_inspect_mission", {
      executable: coreExecutable,
      missionDir: workspace.mission_dir,
    });
  }

  async function handleCoreLintMission() {
    if (!workspace?.mission_dir) {
      setCoreError("No mission directory is available for Core lint.");
      return;
    }

    await runCoreCommand("run_core_lint_mission", {
      executable: coreExecutable,
      missionDir: workspace.mission_dir,
    });
  }

  async function handleCoreExportModelSummary() {
    if (!workspace?.mission_dir) {
      setCoreError("No mission directory is available for Core model summary export.");
      return;
    }

    await runCoreCommand("run_core_export_model_summary", {
      executable: coreExecutable,
      missionDir: workspace.mission_dir,
    });
  }

  async function handleCoreExportEntityIndex() {
    if (!workspace?.mission_dir) {
      setCoreError("No mission directory is available for Core entity index export.");
      return;
    }

    await runCoreCommand("run_core_export_entity_index", {
      executable: coreExecutable,
      missionDir: workspace.mission_dir,
    });
  }

  async function handleCoreExportRelationshipManifest() {
    if (!workspace?.mission_dir) {
      setCoreError("No mission directory is available for Core relationship manifest export.");
      return;
    }

    await runCoreCommand("run_core_export_relationship_manifest", {
      executable: coreExecutable,
      missionDir: workspace.mission_dir,
    });
  }

  async function handleCoreExportDashboardSummary() {
    if (!workspace?.mission_dir) {
      setCoreError("No mission directory is available for Core dashboard summary export.");
      return;
    }

    const result = await runCoreCommand("run_core_export_dashboard_summary", {
      executable: coreExecutable,
      missionDir: workspace.mission_dir,
    });

    if (result?.json_report_available) {
      onGeneratedArtifactRefresh();
    }
  }

  async function handleCoreExportScenarioRunIndex() {
    if (!workspace) {
      setCoreError("No workspace is available for Core scenario run index export.");
      return;
    }

    const result = await runCoreCommand("run_core_export_scenario_run_index", {
      executable: coreExecutable,
      workspacePath: workspace.selected_path,
    });

    if (result?.json_report_available) {
      onGeneratedArtifactRefresh();
    }
  }

  async function handleCoreExportCoverageSummary() {
    if (!workspace?.mission_dir) {
      setCoreError("No mission directory is available for Core coverage summary export.");
      return;
    }

    const result = await runCoreCommand("run_core_export_coverage_summary", {
      executable: coreExecutable,
      missionDir: workspace.mission_dir,
    });

    if (result?.json_report_available) {
      onGeneratedArtifactRefresh();
    }
  }

  async function handleCoreSimScenario(scenario: ProjectEntry) {
    if (!workspace) {
      setCoreError("No workspace is available for Core scenario execution.");
      return;
    }

    if (scenario.kind !== "file") {
      setCoreError("Only scenario source files can be executed through Core.");
      return;
    }

    onScenarioExecutionStart();

    const result = await runCoreCommand("run_core_sim_scenario", {
      executable: coreExecutable,
      workspacePath: workspace.selected_path,
      scenarioFile: scenario.path,
    });

    if (result?.json_report_available) {
      onGeneratedArtifactRefresh();
    }
  }

  async function runCoreCommand(
    commandName: string,
    payload: Record<string, string>,
  ): Promise<CoreCommandResult | null> {
    setCoreError(null);
    setCoreResult(null);
    setIsRunningCoreCommand(true);

    try {
      const result = await invoke<CoreCommandResult>(commandName, payload);
      setCoreResult(result);
      onCoreOutput(result);
      updateCoreReportSnapshots(result);
      return result;
    } catch (caught) {
      setCoreError(caught instanceof Error ? caught.message : String(caught));
      return null;
    } finally {
      setIsRunningCoreCommand(false);
    }
  }

  function updateCoreReportSnapshots(result: CoreCommandResult) {
    const updater = createCoreReportSnapshotsUpdater(
      result.json_report_content ?? null,
    );

    if (!updater) {
      return;
    }

    setCoreReportSnapshots(updater);
  }

  return {
    coreExecutable,
    setCoreExecutable,
    coreResult,
    coreReportSnapshots,
    coreError,
    isRunningCoreCommand,
    resetCoreCommandState,
    hydrateCoreReportSnapshots,
    handleCoreVersion,
    handleCoreInspectMission,
    handleCoreLintMission,
    handleCoreExportModelSummary,
    handleCoreExportEntityIndex,
    handleCoreExportRelationshipManifest,
    handleCoreExportDashboardSummary,
    handleCoreExportScenarioRunIndex,
    handleCoreExportCoverageSummary,
    handleCoreSimScenario,
  };
}
