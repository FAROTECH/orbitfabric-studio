import { useEffect, useState } from "react";
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

const knownGeneratedPaths = new Set([
  "reports/lint_report.json",
  "reports/model_summary.json",
  "reports/entity_index.json",
  "reports/relationship_manifest.json",
  "reports/dashboard_summary.json",
  "reports/scenario_run_index.json",
  "reports/coverage_summary.json",
  "reports/orbitfabric_studio_lint_report.json",
  "reports/orbitfabric_studio_model_summary.json",
  "reports/orbitfabric_studio_entity_index.json",
  "reports/orbitfabric_studio_relationship_manifest.json",
  "reports/orbitfabric_studio_dashboard_summary.json",
  "reports/orbitfabric_studio_scenario_run_index.json",
  "reports/orbitfabric_studio_coverage_summary.json",
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
  "ground/generic/ground_contract_manifest.json",
  "ground/generic/README.md",
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

export interface GeneratedEvidenceArtifactCandidate {
  name: string;
  path: string;
  relativePath: string;
  artifactClass: GeneratedArtifactClass;
  knownStatus: GeneratedArtifactKnownStatus;
  previewStatus: string;
  reason: string;
}

export interface GeneratedEvidenceArtifactSummary {
  reportCandidates: GeneratedEvidenceArtifactCandidate[];
  logCandidates: GeneratedEvidenceArtifactCandidate[];
}

interface GeneratedArtifactExplorerPanelProps {
  workspacePath: string;
  refreshToken?: number;
  onDashboardSummaryChange?: (summary: GeneratedArtifactDashboardSummary | null) => void;
  onArtifactSelectionChange?: (artifact: GeneratedArtifactInspectorItem | null) => void;
  onEvidenceArtifactSummaryChange?: (summary: GeneratedEvidenceArtifactSummary | null) => void;
}

type ClassifiedGeneratedArtifactEntry = GeneratedArtifactEntry & {
  known_status: GeneratedArtifactKnownStatus;
  classification_reason: string;
  provenance: {
    source: GeneratedArtifactProvenanceSource;
    detail: string | null;
  };
};

export function GeneratedArtifactExplorerPanel({
  workspacePath,
  refreshToken = 0,
  onDashboardSummaryChange,
  onArtifactSelectionChange,
  onEvidenceArtifactSummaryChange,
}: GeneratedArtifactExplorerPanelProps) {
  const [inventory, setInventory] = useState<GeneratedArtifactInventory | null>(null);
  const [activeClass, setActiveClass] = useState<GeneratedArtifactClass>("reports");
  const [selectedArtifactFile, setSelectedArtifactFile] = useState<FileContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isReadingArtifact, setIsReadingArtifact] = useState(false);

  const artifacts = classifyGeneratedArtifacts(inventory?.artifacts ?? []);
  const groupedArtifacts = groupArtifactsByClass(artifacts);
  const selectedArtifacts = groupedArtifacts[activeClass] ?? [];
  const knownArtifacts = artifacts.filter((artifact) => artifact.known_status === "known").length;
  const unknownArtifacts = artifacts.length - knownArtifacts;

  useEffect(() => {
    if (refreshToken > 0) {
      void handleInspectGeneratedArtifacts();
    }
  }, [refreshToken]);

  async function handleInspectGeneratedArtifacts() {
    setError(null);
    setPreviewError(null);
    setSelectedArtifactFile(null);
    onDashboardSummaryChange?.(null);
    onArtifactSelectionChange?.(null);
    onEvidenceArtifactSummaryChange?.(null);
    setIsInspecting(true);

    try {
      const result = await invoke<GeneratedArtifactInventory>(
        "inspect_generated_artifacts",
        { workspacePath },
      );
      const classified = classifyGeneratedArtifacts(result.artifacts);
      const grouped = groupArtifactsByClass(classified);
      const nextKnown = classified.filter((artifact) => artifact.known_status === "known").length;
      const nextActiveClass =
        artifactClassOrder.find((artifactClass) => grouped[artifactClass].length > 0) ?? "reports";

      setInventory(result);
      setActiveClass(nextActiveClass);

      onDashboardSummaryChange?.({
        generatedDir: result.generated_dir,
        totalArtifacts: result.counts.total_artifacts,
        knownArtifacts: nextKnown,
        unknownArtifacts: classified.length - nextKnown,
        previewableArtifacts: result.counts.previewable_artifacts,
        notPreviewableArtifacts: result.counts.not_previewable_artifacts,
        warningCount: result.warnings.length,
      });
      onEvidenceArtifactSummaryChange?.(buildEvidenceSummary(classified));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      onDashboardSummaryChange?.(null);
      onEvidenceArtifactSummaryChange?.(null);
    } finally {
      setIsInspecting(false);
    }
  }

  async function handleOpenArtifactPreview(artifact: ClassifiedGeneratedArtifactEntry) {
    onArtifactSelectionChange?.(toInspectorItem(artifact));
    setSelectedArtifactFile(null);

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
    <section
      id="studio-artifacts"
      className="entry-section generated-artifact-explorer"
      aria-label="Generated Artifact Explorer"
    >
      <div className="file-viewer-header">
        <div>
          <h3>Generated Artifact Explorer</h3>
          <p>
            Compact read-only inventory for files already present under generated output.
            Select one artifact class at a time. Studio does not generate, edit or
            infer Mission Model semantics from these files.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="GENERATED" />
          <ProvenanceBadge label="READ-ONLY" />
        </div>
      </div>

      <div className="command-actions">
        <button type="button" onClick={handleInspectGeneratedArtifacts} disabled={isInspecting}>
          {isInspecting ? "Inspecting generated artifacts..." : "Inspect generated artifacts"}
        </button>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {isInspecting ? <p className="empty-text">Inspecting generated artifacts...</p> : null}
      {!inventory && !isInspecting ? (
        <p className="empty-text">
          Run the generated artifact inspection to populate this compact surface.
        </p>
      ) : null}

      {inventory ? (
        <>
          <div className="summary-grid">
            <ArtifactSummaryItem label="Generated directory" value={inventory.generated_dir ?? "Not detected"} />
            <ArtifactSummaryItem label="Total artifacts" value={String(inventory.counts.total_artifacts)} />
            <ArtifactSummaryItem label="Known artifacts" value={String(knownArtifacts)} />
            <ArtifactSummaryItem label="Unknown artifacts" value={String(unknownArtifacts)} />
            <ArtifactSummaryItem label="Previewable" value={String(inventory.counts.previewable_artifacts)} />
            <ArtifactSummaryItem label="Not previewable" value={String(inventory.counts.not_previewable_artifacts)} />
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
            <>
              <section
                className="entry-section muted-section generated-artifact-class-overview"
                aria-label="Generated artifact class overview"
              >
                <div className="entry-main">
                  <div>
                    <h3>Artifact classes</h3>
                    <p>Only the selected class is expanded below.</p>
                  </div>
                  <StatusBadge label={`${selectedArtifacts.length} SHOWN`} />
                </div>
                <div className="summary-grid">
                  {artifactClassOrder.map((artifactClass) => (
                    <button
                      className="summary-item generated-artifact-class-card"
                      type="button"
                      key={artifactClass}
                      aria-current={activeClass === artifactClass}
                      onClick={() => setActiveClass(artifactClass)}
                    >
                      <span>{formatArtifactClass(artifactClass)}</span>
                      <strong>{String(groupedArtifacts[artifactClass]?.length ?? 0)}</strong>
                    </button>
                  ))}
                </div>
              </section>

              <GeneratedArtifactClassSection
                artifactClass={activeClass}
                artifacts={selectedArtifacts}
                onOpenArtifactPreview={handleOpenArtifactPreview}
              />
            </>
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
    <section
      className="entry-section generated-artifact-compact-list"
      aria-label={`${artifactClass} generated artifacts`}
    >
      <div className="entry-main">
        <div>
          <h3>{formatArtifactClass(artifactClass)}</h3>
          <p>Scoped read-only list for the selected artifact class.</p>
        </div>
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
                    <StatusBadge label={artifact.known_status === "known" ? "REPORTED" : "UNKNOWN"} />
                    <StatusBadge label={isPreviewable ? "PREVIEW ONLY" : "UNAVAILABLE"} />
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
          <p>Read-only text preview. No validation or semantic interpretation is implied.</p>
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
        <p className="empty-text">Select a previewable generated artifact.</p>
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
  return artifacts.map((artifact) => {
    const relativePath = artifact.relative_path.replace(/\\/g, "/");
    const isReportJson = artifact.artifact_class === "reports" && relativePath.endsWith(".json");
    const isKnown =
      knownGeneratedPaths.has(relativePath) ||
      isReportJson ||
      (relativePath.startsWith("logs/") && relativePath.endsWith(".log"));

    return {
      ...artifact,
      known_status: isKnown ? "known" : "unknown",
      classification_reason: isKnown
        ? "Known generated artifact matched by documented output path or conservative generated report/log pattern."
        : "Generated artifact did not match a documented Core output pattern.",
      provenance: {
        source: isKnown ? "documentedCoreFileName" : "unknown",
        detail: isKnown
          ? "Classification is limited to generated artifact identity."
          : "The file remains visible, but Studio does not interpret it as a known generated artifact.",
      },
    };
  });
}

function groupArtifactsByClass(
  artifacts: ClassifiedGeneratedArtifactEntry[],
): Record<GeneratedArtifactClass, ClassifiedGeneratedArtifactEntry[]> {
  return artifacts.reduce<Record<GeneratedArtifactClass, ClassifiedGeneratedArtifactEntry[]>>(
    (grouped, artifact) => {
      grouped[artifact.artifact_class].push(artifact);
      return grouped;
    },
    { reports: [], logs: [], docs: [], runtime: [], ground: [], unknown: [] },
  );
}

function buildEvidenceSummary(
  artifacts: ClassifiedGeneratedArtifactEntry[],
): GeneratedEvidenceArtifactSummary {
  return {
    reportCandidates: artifacts
      .filter((artifact) => artifact.artifact_class === "reports")
      .map(toEvidenceCandidate),
    logCandidates: artifacts
      .filter((artifact) => artifact.artifact_class === "logs")
      .map(toEvidenceCandidate),
  };
}

function toEvidenceCandidate(
  artifact: ClassifiedGeneratedArtifactEntry,
): GeneratedEvidenceArtifactCandidate {
  return {
    name: artifact.name,
    path: artifact.path,
    relativePath: artifact.relative_path,
    artifactClass: artifact.artifact_class,
    knownStatus: artifact.known_status,
    previewStatus: artifact.preview_status,
    reason: "Passive report/log candidate only. Studio keeps this artifact read-only.",
  };
}

function toInspectorItem(
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
