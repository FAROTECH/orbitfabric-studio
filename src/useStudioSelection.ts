import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import type {
  GeneratedArtifactInspectorItem,
} from "./GeneratedArtifactExplorer";
import type {
  SimulationInspectorRecord,
  StudioDetailSelection,
} from "./InspectorPanel";
import type { DomainEntitySummary } from "./domainSurfaceModel";
import type {
  CoreCommandResult,
  FileContent,
  ProjectEntry,
  WorkspaceInspection,
} from "./types/workspace";

export interface UseStudioSelectionOptions {
  workspace: WorkspaceInspection | null;
}

export function useStudioSelection(options: UseStudioSelectionOptions) {
  const { workspace } = options;
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [selectedGeneratedArtifact, setSelectedGeneratedArtifact] =
    useState<GeneratedArtifactInspectorItem | null>(null);
  const [selectedSimulationRecord, setSelectedSimulationRecord] =
    useState<SimulationInspectorRecord | null>(null);
  const [selectedCoreDomainEntity, setSelectedCoreDomainEntity] =
    useState<DomainEntitySummary | null>(null);
  const [selectedDetail, setSelectedDetail] =
    useState<StudioDetailSelection | null>(null);

  function clearSelectedContext() {
    setSelectedFile(null);
    setSelectedGeneratedArtifact(null);
    setSelectedSimulationRecord(null);
    setSelectedCoreDomainEntity(null);
    setSelectedDetail(null);
  }

  function clearSelectedSimulationRecord(): void {
    setSelectedSimulationRecord(null);
  }

  function selectWorkspace(inspection: WorkspaceInspection): void {
    setSelectedDetail({
      kind: "workspace",
      title: "Workspace inspection",
      source: inspection.selected_path,
    });
  }

  function selectCoreOutput(result: CoreCommandResult): void {
    setSelectedDetail({
      kind: "core-output",
      title: result.command,
      source: result.args.join(" ") || "fixed Core command",
    });
  }

  async function handleOpenFile(entry: ProjectEntry) {
    if (!workspace || entry.kind !== "file") {
      return;
    }

    setSelectedGeneratedArtifact(null);
    setSelectedSimulationRecord(null);
    setSelectedCoreDomainEntity(null);
    try {
      const file = await invoke<FileContent>("read_text_file", {
        workspacePath: workspace.selected_path,
        filePath: entry.path,
      });

      setSelectedFile(file);
      setSelectedDetail({
        kind: "source-file",
        title: file.name,
        source: file.path,
      });
    } catch {
      // Keep failed source-file reads non-disruptive; no active surface renders file read errors.
    }
  }

  function handleGeneratedArtifactSelectionChange(
    artifact: GeneratedArtifactInspectorItem | null,
  ) {
    setSelectedGeneratedArtifact(artifact);
    setSelectedSimulationRecord(null);
    setSelectedCoreDomainEntity(null);
    setSelectedDetail(
      artifact
        ? {
            kind: "generated-artifact",
            title: artifact.name,
            source: artifact.relativePath,
          }
        : null,
    );
  }

  function handleSelectSimulationRecord(record: SimulationInspectorRecord) {
    setSelectedSimulationRecord(record);
    setSelectedGeneratedArtifact(null);
    setSelectedCoreDomainEntity(null);
    setSelectedDetail({
      kind: "simulation-record",
      title: record.title,
      source: record.kind,
    });
  }

  function handleSelectCoreDomainEntity(entity: DomainEntitySummary) {
    setSelectedCoreDomainEntity(entity);
    setSelectedGeneratedArtifact(null);
    setSelectedSimulationRecord(null);
    setSelectedDetail({
      kind: "core-entity",
      title: entity.displayName || entity.id,
      source: "Core entity_index.json",
    });
  }

  return {
    selectedFile,
    selectedGeneratedArtifact,
    selectedSimulationRecord,
    selectedCoreDomainEntity,
    selectedDetail,
    clearSelectedContext,
    clearSelectedSimulationRecord,
    selectWorkspace,
    selectCoreOutput,
    handleOpenFile,
    handleGeneratedArtifactSelectionChange,
    handleSelectSimulationRecord,
    handleSelectCoreDomainEntity,
  };
}
