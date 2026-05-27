import { useState } from "react";
import Editor from "@monaco-editor/react";
import { invoke } from "@tauri-apps/api/core";

import { ProvenanceBadge, StatusBadge } from "./Badges";
import type { GeneratedArtifactInspectorItem } from "./GeneratedArtifactExplorer";

import type {
  FileContent,
  GeneratedArtifactEntry,
  GeneratedArtifactInventory,
  GeneratedArtifactKnownStatus,
  GeneratedArtifactProvenanceSource,
} from "./types/workspace";

const documentedGroundArtifactPaths = new Set([
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

type GroundArtifactFamily =
  | "manifest"
  | "dictionary-json"
  | "dictionary-csv"
  | "documentation"
  | "unknown-ground-artifact";

type ClassifiedGroundArtifact = GeneratedArtifactEntry & {
  family: GroundArtifactFamily;
  known_status: GeneratedArtifactKnownStatus;
  classification_reason: string;
  provenance: {
    source: GeneratedArtifactProvenanceSource;
    detail: string | null;
  };
};

interface GroundIntegrationArtifactViewerProps {
  workspacePath: string;
  generatedDir: string | null;
  onArtifactSelectionChange?: (artifact: GeneratedArtifactInspectorItem | null) => void;
}

interface GroundArtifactCounts {
  total: number;
  known: number;
  unknown: number;
  previewable: number;
  notPreviewable: number;
}

const groundArtifactFamilyOrder: GroundArtifactFamily[] = [
  "manifest",
  "dictionary-json",
  "dictionary-csv",
  "documentation",
  "unknown-ground-artifact",
];

export function GroundIntegrationArtifactViewer({
  workspacePath,
  generatedDir,
  onArtifactSelectionChange,
}: GroundIntegrationArtifactViewerProps) {
  const [inventory, setInventory] = useState<GeneratedArtifactInventory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [selectedArtifactFile, setSelectedArtifactFile] = useState<FileContent | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isReadingArtifact, setIsReadingArtifact] = useState(false);

  const groundArtifacts = classifyGroundArtifacts(inventory?.artifacts ?? []);
  const groupedGroundArtifacts = groupGroundArtifactsByFamily(groundArtifacts);
  const counts = countGroundArtifacts(groundArtifacts);

  async function handleInspectGroundArtifacts() {
    setError(null);
    setPreviewError(null);
    setSelectedArtifactFile(null);
    onArtifactSelectionChange?.(null);
    setIsInspecting(true);

    try {
      const result = await invoke<GeneratedArtifactInventory>(
        "inspect_generated_artifacts",
        { workspacePath },
      );
      setInventory(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsInspecting(false);
    }
  }

  async function handleOpenGroundArtifactPreview(artifact: ClassifiedGroundArtifact) {
    onArtifactSelectionChange?.(toGroundArtifactInspectorItem(artifact));

    if (artifact.preview_status !== "previewable") {
      setSelectedArtifactFile(null);
      setPreviewError("This generated ground artifact is listed but is not previewable.");
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
      setSelectedArtifactFile(null);
      setPreviewError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsReadingArtifact(false);
    }
  }

  return (
    <section
      id="studio-ground"
      className="entry-section ground-integration-surface"
      aria-label="Ground Integration Artifact Viewer"
    >
      <div className="file-viewer-header">
        <div>
          <span className="cockpit-eyebrow">v0.8.0 preview binding slice</span>
          <h3>Ground Integration Artifact Viewer</h3>
          <p>
            Read-only inspection of generated ground-facing artifacts. Studio lists
            artifact identity, conservative family grouping, Inspector context and
            preview eligibility without interpreting dictionaries as operational
            ground behavior.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="GENERATED" />
          <ProvenanceBadge label="READ-ONLY" />
          <StatusBadge label="NON-OPERATIONAL" />
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-item">
          <span>Workspace</span>
          <strong>{workspacePath}</strong>
        </div>
        <div className="summary-item">
          <span>Generated directory</span>
          <strong>{generatedDir ?? "Not detected"}</strong>
        </div>
        <div className="summary-item">
          <span>Ground artifacts</span>
          <strong>{String(counts.total)}</strong>
        </div>
        <div className="summary-item">
          <span>Known / Unknown</span>
          <strong>{`${counts.known} / ${counts.unknown}`}</strong>
        </div>
        <div className="summary-item">
          <span>Previewable</span>
          <strong>{String(counts.previewable)}</strong>
        </div>
        <div className="summary-item">
          <span>Not previewable</span>
          <strong>{String(counts.notPreviewable)}</strong>
        </div>
      </div>

      <div className="command-actions">
        <button
          type="button"
          onClick={handleInspectGroundArtifacts}
          disabled={isInspecting}
        >
          {isInspecting ? "Inspecting ground artifacts..." : "Inspect ground artifacts"}
        </button>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {isInspecting ? <p className="empty-text">Inspecting generated artifacts...</p> : null}

      {!inventory && !isInspecting ? (
        <p className="empty-text">
          Run ground artifact inspection to list files already present under the
          workspace `generated/ground/` directory.
        </p>
      ) : null}

      {inventory ? (
        <>
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

          {groundArtifacts.length === 0 ? (
            <p className="empty-text">
              No generated ground-facing artifacts were reported. This does not
              invalidate the workspace; it only means Studio found no files under
              the generated ground artifact class.
            </p>
          ) : (
            groundArtifactFamilyOrder.map((family) => (
              <GroundArtifactFamilySection
                key={family}
                family={family}
                artifacts={groupedGroundArtifacts[family] ?? []}
                onOpenArtifactPreview={handleOpenGroundArtifactPreview}
              />
            ))
          )}
        </>
      ) : null}

      <GroundArtifactPreviewPanel
        selectedArtifactFile={selectedArtifactFile}
        previewError={previewError}
        isReadingArtifact={isReadingArtifact}
      />

      <section className="entry-section">
        <div className="entry-main">
          <div>
            <h3>Boundary</h3>
            <p>
              This surface does not provide command uplink, live telemetry,
              telemetry archive, live decoder, mission control or external ground
              system compatibility behavior.
            </p>
          </div>
          <div className="badge-row">
            <StatusBadge label="NO GROUND OPS" />
          </div>
        </div>
      </section>
    </section>
  );
}

function GroundArtifactFamilySection({
  family,
  artifacts,
  onOpenArtifactPreview,
}: {
  family: GroundArtifactFamily;
  artifacts: ClassifiedGroundArtifact[];
  onOpenArtifactPreview: (artifact: ClassifiedGroundArtifact) => void;
}) {
  return (
    <section className="entry-section" aria-label={`${family} ground artifacts`}>
      <div className="entry-main">
        <h3>{formatGroundArtifactFamily(family)}</h3>
        <div className="badge-row">
          <ProvenanceBadge label="GENERATED" />
          <StatusBadge label={`${artifacts.length} ARTIFACTS`} />
        </div>
      </div>

      {artifacts.length === 0 ? (
        <p className="empty-text">No artifacts in this family.</p>
      ) : (
        <ul className="entry-list">
          {artifacts.map((artifact) => (
            <li key={artifact.path}>
              <div className="entry-main">
                <button
                  className="entry-button"
                  type="button"
                  onClick={() => onOpenArtifactPreview(artifact)}
                >
                  {artifact.name}
                </button>
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
                <span>family: {artifact.family}</span>
                <span>size: {artifact.size_bytes} bytes</span>
                <span>extension: {artifact.extension ?? "none"}</span>
                <span>classification: {artifact.classification_reason}</span>
                <span>provenance: {artifact.provenance.source}</span>
              </div>
              {artifact.provenance.detail ? <p>{artifact.provenance.detail}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function GroundArtifactPreviewPanel({
  selectedArtifactFile,
  previewError,
  isReadingArtifact,
}: {
  selectedArtifactFile: FileContent | null;
  previewError: string | null;
  isReadingArtifact: boolean;
}) {
  return (
    <section className="file-viewer" aria-label="Ground artifact read-only preview">
      <div className="file-viewer-header">
        <div>
          <h3>Ground artifact preview</h3>
          <p>
            Read-only preview for supported generated ground text artifacts. Preview
            does not imply validation, ground system compatibility, decoder
            availability or operational readiness.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="GENERATED" />
          <ProvenanceBadge label="READ-ONLY" />
          <ProvenanceBadge label="PREVIEW ONLY" />
        </div>
      </div>

      {previewError ? <p className="error-text">{previewError}</p> : null}
      {isReadingArtifact ? <p className="empty-text">Reading ground artifact...</p> : null}

      {!selectedArtifactFile && !isReadingArtifact ? (
        <p className="empty-text">
          Select a listed generated ground artifact to bind it to the Inspector and
          preview it when supported.
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

function classifyGroundArtifacts(
  artifacts: GeneratedArtifactEntry[],
): ClassifiedGroundArtifact[] {
  return artifacts
    .filter((artifact) => artifact.artifact_class === "ground")
    .map((artifact) => classifyGroundArtifact(artifact));
}

function classifyGroundArtifact(
  artifact: GeneratedArtifactEntry,
): ClassifiedGroundArtifact {
  const relativePath = normalizeGeneratedArtifactPath(artifact.relative_path);
  const family = groundArtifactFamilyForPath(relativePath, artifact.extension);

  if (documentedGroundArtifactPaths.has(relativePath)) {
    return {
      ...artifact,
      family,
      known_status: "known",
      classification_reason:
        "Known ground-facing artifact matched by an explicitly documented Core output path.",
      provenance: {
        source: "documentedCorePath",
        detail:
          "Classification is limited to generated ground artifact identity. Studio does not infer operational ground behavior from this file.",
      },
    };
  }

  return {
    ...artifact,
    family,
    known_status: "unknown",
    classification_reason:
      "Ground-facing artifact did not match a documented Core ground output path.",
    provenance: {
      source: "unknown",
      detail:
        "The file remains visible, but Studio does not interpret it as a known ground integration artifact.",
    },
  };
}

function toGroundArtifactInspectorItem(
  artifact: ClassifiedGroundArtifact,
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

function groundArtifactFamilyForPath(
  relativePath: string,
  extension: string | null,
): GroundArtifactFamily {
  if (relativePath.endsWith("ground_contract_manifest.json")) {
    return "manifest";
  }

  if (relativePath.includes("/dictionaries/") && extension === "json") {
    return "dictionary-json";
  }

  if (relativePath.includes("/csv/") && extension === "csv") {
    return "dictionary-csv";
  }

  if (extension === "md" || relativePath.endsWith("README.md")) {
    return "documentation";
  }

  return "unknown-ground-artifact";
}

function groupGroundArtifactsByFamily(
  artifacts: ClassifiedGroundArtifact[],
): Record<GroundArtifactFamily, ClassifiedGroundArtifact[]> {
  return artifacts.reduce<Record<GroundArtifactFamily, ClassifiedGroundArtifact[]>>(
    (grouped, artifact) => {
      grouped[artifact.family].push(artifact);
      return grouped;
    },
    {
      manifest: [],
      "dictionary-json": [],
      "dictionary-csv": [],
      documentation: [],
      "unknown-ground-artifact": [],
    },
  );
}

function countGroundArtifacts(artifacts: ClassifiedGroundArtifact[]): GroundArtifactCounts {
  return artifacts.reduce<GroundArtifactCounts>(
    (counts, artifact) => {
      counts.total += 1;

      if (artifact.known_status === "known") {
        counts.known += 1;
      } else {
        counts.unknown += 1;
      }

      if (artifact.preview_status === "previewable") {
        counts.previewable += 1;
      } else {
        counts.notPreviewable += 1;
      }

      return counts;
    },
    {
      total: 0,
      known: 0,
      unknown: 0,
      previewable: 0,
      notPreviewable: 0,
    },
  );
}

function formatGroundArtifactFamily(family: GroundArtifactFamily): string {
  switch (family) {
    case "manifest":
      return "Ground contract manifest";
    case "dictionary-json":
      return "JSON dictionaries";
    case "dictionary-csv":
      return "CSV dictionaries";
    case "documentation":
      return "Ground documentation";
    case "unknown-ground-artifact":
      return "Unknown ground-facing artifacts";
  }
}

function normalizeGeneratedArtifactPath(relativePath: string): string {
  return relativePath.replace(/\\/g, "/");
}
