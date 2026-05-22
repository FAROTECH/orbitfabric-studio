import { useState } from "react";
import Editor from "@monaco-editor/react";
import { invoke } from "@tauri-apps/api/core";

import { ProvenanceBadge, StatusBadge } from "./Badges";

import type {
  FileContent,
  GeneratedArtifactClass,
  GeneratedArtifactEntry,
  GeneratedArtifactInventory,
  GeneratedArtifactKnownStatus,
  GeneratedArtifactProvenanceSource,
} from "./types/workspace";

const artifactClassOrder: GeneratedArtifactClass[] = [
  "reports",
  "logs",
  "docs",
  "runtime",
  "ground",
  "unknown",
];

const documentedArtifactPaths = new Set([
  "reports/lint_report.json",
  "reports/model_summary.json",
  "reports/entity_index.json",
  "reports/relationship_manifest.json",
  "reports/orbitfabric_studio_lint_report.json",
  "reports/orbitfabric_studio_model_summary.json",
  "reports/orbitfabric_studio_entity_index.json",
  "reports/orbitfabric_studio_relationship_manifest.json",
  "docs/telemetry.md",
  "docs/commands.md",
  "docs/events.md",
  "docs/faults.md",
  "docs/modes.md",
  "docs/packets.md",
  "docs/payloads.md",
  "docs/data_products.md",
  "docs/contacts.md",
  "docs/commandability.md",
  "docs/data_flow.md",
  "runtime/cpp17/runtime_contract_manifest.json",
  "runtime/cpp17/include/orbitfabric/generated/mission_ids.hpp",
  "runtime/cpp17/include/orbitfabric/generated/mission_enums.hpp",
  "runtime/cpp17/include/orbitfabric/generated/mission_registries.hpp",
  "runtime/cpp17/include/orbitfabric/generated/command_args.hpp",
  "runtime/cpp17/include/orbitfabric/generated/adapter_interfaces.hpp",
  "runtime/cpp17/CMakeLists.txt",
  "runtime/cpp17/src/orbitfabric_runtime_contract_smoke.cpp",
  "ground/generic/ground_contract_manifest.json",
  "ground/generic/README.md",
  "ground/generic/dictionaries/telemetry_dictionary.json",
  "ground/generic/dictionaries/command_dictionary.json",
  "ground/generic/dictionaries/event_dictionary.json",
  "ground/generic/dictionaries/fault_dictionary.json",
  "ground/generic/dictionaries/data_product_dictionary.json",
  "ground/generic/dictionaries/packet_dictionary.json",
  "ground/generic/csv/telemetry_dictionary.csv",
  "ground/generic/csv/command_dictionary.csv",
  "ground/generic/csv/event_dictionary.csv",
  "ground/generic/csv/fault_dictionary.csv",
  "ground/generic/csv/data_product_dictionary.csv",
  "ground/generic/csv/packet_dictionary.csv",
  "ground/generic/ground_dictionaries.md",
]);

export interface GeneratedArtifactDashboardSummary {
  generatedDir: string | null;
  totalArtifacts: number;
  knownArtifacts: number;
  unknownArtifacts: number;
  previewableArtifacts: number;
  notPreviewableArtifacts: number;
  warningCount: number;
}

export interface GeneratedArtifactInspectorItem {
  name: string;
  path: string;
  relativePath: string;
  artifactClass: GeneratedArtifactClass;
  knownStatus: GeneratedArtifactKnownStatus;
  previewStatus: string;
  provenanceSource: GeneratedArtifactProvenanceSource;
  provenanceDetail: string | null;
  sizeBytes: number;
  extension: string | null;
}

interface GeneratedArtifactExplorerPanelProps {
  workspacePath: string;
  onDashboardSummaryChange?: (
    summary: GeneratedArtifactDashboardSummary | null,
  ) => void;
  onArtifactSelectionChange?: (
    artifact: GeneratedArtifactInspectorItem | null,
  ) => void;
}

type ClassifiedGeneratedArtifactEntry = GeneratedArtifactEntry & {
  known_status: GeneratedArtifactKnownStatus;
  classification_reason: string;
  provenance: {
    source: GeneratedArtifactProvenanceSource;
    detail: string | null;
  };
};

interface ClassifiedArtifactCounts {
  knownArtifacts: number;
  unknownArtifacts: number;
}

export function GeneratedArtifactExplorerPanel({
  workspacePath,
  onDashboardSummaryChange,
  onArtifactSelectionChange,
}: GeneratedArtifactExplorerPanelProps) {
  const [inventory, setInventory] = useState<GeneratedArtifactInventory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [selectedArtifactFile, setSelectedArtifactFile] = useState<FileContent | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isReadingArtifact, setIsReadingArtifact] = useState(false);
  const classifiedArtifacts = classifyGeneratedArtifacts(inventory?.artifacts ?? []);
  const groupedArtifacts = groupArtifactsByClass(classifiedArtifacts);
  const classifiedCounts = countClassifiedArtifacts(classifiedArtifacts);

  async function handleInspectGeneratedArtifacts() {
    setError(null);
    setPreviewError(null);
    setSelectedArtifactFile(null);
    onDashboardSummaryChange?.(null);
    onArtifactSelectionChange?.(null);
    setIsInspecting(true);

    try {
      const result = await invoke<GeneratedArtifactInventory>(
        "inspect_generated_artifacts",
        { workspacePath },
      );
      setInventory(result);

      const nextClassifiedArtifacts = classifyGeneratedArtifacts(result.artifacts);
      const nextClassifiedCounts = countClassifiedArtifacts(nextClassifiedArtifacts);

      onDashboardSummaryChange?.({
        generatedDir: result.generated_dir,
        totalArtifacts: result.counts.total_artifacts,
        knownArtifacts: nextClassifiedCounts.knownArtifacts,
        unknownArtifacts: nextClassifiedCounts.unknownArtifacts,
        previewableArtifacts: result.counts.previewable_artifacts,
        notPreviewableArtifacts: result.counts.not_previewable_artifacts,
        warningCount: result.warnings.length,
      });
    } catch (caught) {
      onDashboardSummaryChange?.(null);
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsInspecting(false);
    }
  }

  async function handleOpenArtifactPreview(artifact: ClassifiedGeneratedArtifactEntry) {
    onArtifactSelectionChange?.(toGeneratedArtifactInspectorItem(artifact));

    if (artifact.preview_status !== "previewable") {
      setPreviewError("This generated artifact is listed but is not previewable.");
      return;
    }

    setPreviewError(null);
    setIsReadingArtifact(true);

    try {
      const file = await invoke<FileContent>("read_text_file", {
        workspacePath,
        filePath: artifact.path,
      });
      setSelectedArtifactFile(file);
    } catch (caught) {
      setPreviewError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsReadingArtifact(false);
    }
  }

  return (
    <section id="studio-artifacts" className="entry-section" aria-label="Generated Artifact Explorer">
      <div className="file-viewer-header">
        <div>
          <h3>Generated Artifact Explorer</h3>
          <p>
            Read-only inventory of files already present under `generated/`.
            Studio lists artifact metadata and conservative classes. It does not
            generate files, edit files or infer Mission Model semantics from
            generated artifacts.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="GENERATED" />
          <ProvenanceBadge label="READ-ONLY" />
        </div>
      </div>

      <div className="command-actions">
        <button
          type="button"
          onClick={handleInspectGeneratedArtifacts}
          disabled={isInspecting}
        >
          {isInspecting ? "Inspecting generated artifacts..." : "Inspect generated artifacts"}
        </button>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {isInspecting ? <p className="empty-text">Inspecting generated artifacts...</p> : null}

      {!inventory && !isInspecting ? (
        <p className="empty-text">
          Run the generated artifact inspection to list files already present in
          the workspace `generated/` directory.
        </p>
      ) : null}

      {inventory ? (
        <>
          <div className="summary-grid">
            <ArtifactSummaryItem
              label="Generated directory"
              value={inventory.generated_dir ?? "Not detected"}
            />
            <ArtifactSummaryItem
              label="Total artifacts"
              value={String(inventory.counts.total_artifacts)}
            />
            <ArtifactSummaryItem
              label="Known artifacts"
              value={String(classifiedCounts.knownArtifacts)}
            />
            <ArtifactSummaryItem
              label="Unknown artifacts"
              value={String(classifiedCounts.unknownArtifacts)}
            />
            <ArtifactSummaryItem
              label="Previewable"
              value={String(inventory.counts.previewable_artifacts)}
            />
            <ArtifactSummaryItem
              label="Not previewable"
              value={String(inventory.counts.not_previewable_artifacts)}
            />
          </div>

          {inventory.warnings.length > 0 ? (
            <div className="warning-box">
              <h3>Generated artifact warnings</h3>
              <ul>
                {inventory.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {inventory.artifacts.length === 0 ? (
            <p className="empty-text">No generated artifacts were reported.</p>
          ) : (
            artifactClassOrder.map((artifactClass) => (
              <GeneratedArtifactClassSection
                key={artifactClass}
                artifactClass={artifactClass}
                artifacts={groupedArtifacts[artifactClass] ?? []}
                onOpenArtifactPreview={handleOpenArtifactPreview}
              />
            ))
          )}

          <GeneratedArtifactPreviewPanel
            selectedArtifactFile={selectedArtifactFile}
            previewError={previewError}
            isReadingArtifact={isReadingArtifact}
          />
        </>
      ) : null}
    </section>
  );
}

function GeneratedArtifactClassSection({
  artifactClass,
  artifacts,
  onOpenArtifactPreview,
}: {
  artifactClass: GeneratedArtifactClass;
  artifacts: ClassifiedGeneratedArtifactEntry[];
  onOpenArtifactPreview: (artifact: ClassifiedGeneratedArtifactEntry) => void;
}) {
  return (
    <section className="entry-section" aria-label={`${artifactClass} generated artifacts`}>
      <div className="entry-main">
        <h3>{formatArtifactClass(artifactClass)}</h3>
        <div className="badge-row">
          <ProvenanceBadge label="GENERATED" />
          <StatusBadge label={`${artifacts.length} ARTIFACTS`} />
        </div>
      </div>

      {artifacts.length === 0 ? (
        <p className="empty-text">No artifacts in this class.</p>
      ) : (
        <ul className="entry-list">
          {artifacts.map((artifact) => {
            const isPreviewable = artifact.preview_status === "previewable";

            return (
              <li key={artifact.path}>
                <div className="entry-main">
                  {isPreviewable ? (
                    <button
                      className="entry-button"
                      type="button"
                      onClick={() => onOpenArtifactPreview(artifact)}
                    >
                      {artifact.name}
                    </button>
                  ) : (
                    <strong>{artifact.name}</strong>
                  )}
                  <div className="badge-row artifact-entry-badges">
                    <StatusBadge
                      label={artifact.known_status === "known" ? "REPORTED" : "UNKNOWN"}
                    />
                    <StatusBadge
                      label={
                        artifact.preview_status === "previewable"
                          ? "PREVIEW ONLY"
                          : "UNAVAILABLE"
                      }
                    />
                  </div>
                </div>
                <span className="entry-path">{artifact.relative_path}</span>
                <div className="command-meta">
                  <span>size: {artifact.size_bytes} bytes</span>
                  <span>extension: {artifact.extension ?? "none"}</span>
                  <span>class: {artifact.artifact_class}</span>
                  <span>classification: {artifact.classification_reason}</span>
                  <span>provenance: {artifact.provenance.source}</span>
                </div>
                {artifact.provenance.detail ? <p>{artifact.provenance.detail}</p> : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function GeneratedArtifactPreviewPanel({
  selectedArtifactFile,
  previewError,
  isReadingArtifact,
}: {
  selectedArtifactFile: FileContent | null;
  previewError: string | null;
  isReadingArtifact: boolean;
}) {
  return (
    <section className="file-viewer" aria-label="Generated artifact read-only preview">
      <div className="file-viewer-header">
        <div>
          <h3>Generated artifact preview</h3>
          <p>
            Read-only preview for supported text artifacts. Preview does not imply
            validation, source-of-truth status or semantic interpretation.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="GENERATED" />
          <ProvenanceBadge label="READ-ONLY" />
          <ProvenanceBadge label="PREVIEW ONLY" />
        </div>
      </div>

      {previewError ? <p className="error-text">{previewError}</p> : null}
      {isReadingArtifact ? <p className="empty-text">Reading generated artifact...</p> : null}

      {!selectedArtifactFile && !isReadingArtifact ? (
        <p className="empty-text">
          Select a previewable generated artifact to inspect its text content.
        </p>
      ) : null}

      {selectedArtifactFile ? (
        <>
          <div className="command-meta">
            <strong>{selectedArtifactFile.name}</strong>
            <span>{selectedArtifactFile.path}</span>
            <span>{selectedArtifactFile.size_bytes} bytes</span>
          </div>
          <Editor
            height="360px"
            language={selectedArtifactFile.language}
            value={selectedArtifactFile.content}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              wordWrap: "on",
              scrollBeyondLastLine: false,
              renderLineHighlight: "none",
            }}
          />
        </>
      ) : null}
    </section>
  );
}

function toGeneratedArtifactInspectorItem(
  artifact: ClassifiedGeneratedArtifactEntry,
): GeneratedArtifactInspectorItem {
  return {
    name: artifact.name,
    path: artifact.path,
    relativePath: artifact.relative_path,
    artifactClass: artifact.artifact_class,
    knownStatus: artifact.known_status,
    previewStatus: artifact.preview_status,
    provenanceSource: artifact.provenance.source,
    provenanceDetail: artifact.provenance.detail,
    sizeBytes: artifact.size_bytes,
    extension: artifact.extension,
  };
}

function ArtifactSummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function classifyGeneratedArtifacts(
  artifacts: GeneratedArtifactEntry[],
): ClassifiedGeneratedArtifactEntry[] {
  return artifacts.map((artifact) => classifyGeneratedArtifact(artifact));
}

function classifyGeneratedArtifact(
  artifact: GeneratedArtifactEntry,
): ClassifiedGeneratedArtifactEntry {
  const relativePath = normalizeGeneratedArtifactPath(artifact.relative_path);

  if (documentedArtifactPaths.has(relativePath)) {
    return knownArtifact(
      artifact,
      "documentedCorePath",
      "Known generated artifact matched by an explicitly documented Core output path.",
    );
  }

  if (relativePath.startsWith("reports/") && relativePath.endsWith("_report.json")) {
    return knownArtifact(
      artifact,
      "documentedCoreFileName",
      "Known generated report matched by the documented reports/*_report.json naming convention.",
    );
  }

  if (relativePath.startsWith("logs/") && relativePath.endsWith(".log")) {
    return knownArtifact(
      artifact,
      "documentedCoreFileName",
      "Known generated log matched by the documented logs/*.log artifact class.",
    );
  }

  return {
    ...artifact,
    known_status: "unknown",
    classification_reason:
      "Generated artifact did not match a documented Core output path or conservative documented filename pattern.",
    provenance: {
      source: "unknown",
      detail:
        "The file remains visible, but Studio does not interpret it as a known generated artifact.",
    },
  };
}

function knownArtifact(
  artifact: GeneratedArtifactEntry,
  provenanceSource: GeneratedArtifactProvenanceSource,
  classificationReason: string,
): ClassifiedGeneratedArtifactEntry {
  return {
    ...artifact,
    known_status: "known",
    classification_reason: classificationReason,
    provenance: {
      source: provenanceSource,
      detail:
        "Classification is limited to generated artifact identity. Studio does not infer Mission Model semantics, runtime behavior or ground behavior from this file.",
    },
  };
}

function normalizeGeneratedArtifactPath(relativePath: string): string {
  return relativePath.replace(/\\/g, "/");
}

function countClassifiedArtifacts(
  artifacts: ClassifiedGeneratedArtifactEntry[],
): ClassifiedArtifactCounts {
  return artifacts.reduce<ClassifiedArtifactCounts>(
    (counts, artifact) => {
      if (artifact.known_status === "known") {
        counts.knownArtifacts += 1;
      } else {
        counts.unknownArtifacts += 1;
      }

      return counts;
    },
    { knownArtifacts: 0, unknownArtifacts: 0 },
  );
}

function groupArtifactsByClass(
  artifacts: ClassifiedGeneratedArtifactEntry[],
): Record<GeneratedArtifactClass, ClassifiedGeneratedArtifactEntry[]> {
  return artifacts.reduce<Record<GeneratedArtifactClass, ClassifiedGeneratedArtifactEntry[]>>(
    (grouped, artifact) => {
      grouped[artifact.artifact_class].push(artifact);
      return grouped;
    },
    {
      reports: [],
      logs: [],
      docs: [],
      runtime: [],
      ground: [],
      unknown: [],
    },
  );
}

function formatArtifactClass(artifactClass: GeneratedArtifactClass): string {
  switch (artifactClass) {
    case "reports":
      return "Reports";
    case "logs":
      return "Logs";
    case "docs":
      return "Generated documentation";
    case "runtime":
      return "Runtime-facing artifacts";
    case "ground":
      return "Ground-facing artifacts";
    case "unknown":
      return "Unknown generated artifacts";
  }
}

function knownStatusCategory(artifact: ClassifiedGeneratedArtifactEntry) {
  return artifact.known_status === "known" ? "sourceModel" : "derivedReport";
}

function previewStatusCategory(artifact: ClassifiedGeneratedArtifactEntry) {
  return artifact.preview_status === "previewable" ? "generatedOutput" : "derivedReport";
}
