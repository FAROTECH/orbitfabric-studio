import type {
  GeneratedArtifactClass,
  GeneratedArtifactEntry,
  GeneratedArtifactInventory,
} from "./types/workspace";

const artifactClassOrder: GeneratedArtifactClass[] = [
  "reports",
  "logs",
  "docs",
  "runtime",
  "ground",
  "unknown",
];

interface GeneratedArtifactExplorerPanelProps {
  inventory: GeneratedArtifactInventory | null;
  error: string | null;
  isInspecting: boolean;
  onInspect: () => void;
  onOpenArtifact: (artifact: GeneratedArtifactEntry) => void;
}

export function GeneratedArtifactExplorerPanel({
  inventory,
  error,
  isInspecting,
  onInspect,
  onOpenArtifact,
}: GeneratedArtifactExplorerPanelProps) {
  const groupedArtifacts = groupArtifactsByClass(inventory?.artifacts ?? []);

  return (
    <section className="entry-section" aria-label="Generated Artifact Explorer">
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
        <span className="status-pill">Read-only</span>
      </div>

      <div className="command-actions">
        <button type="button" onClick={onInspect} disabled={isInspecting}>
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
              value={String(inventory.counts.known_artifacts)}
            />
            <ArtifactSummaryItem
              label="Unknown artifacts"
              value={String(inventory.counts.unknown_artifacts)}
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
            artifactClassOrder.map((artifactClass) => {
              const artifacts = groupedArtifacts[artifactClass] ?? [];

              if (artifacts.length === 0) {
                return null;
              }

              return (
                <GeneratedArtifactClassSection
                  key={artifactClass}
                  artifactClass={artifactClass}
                  artifacts={artifacts}
                  onOpenArtifact={onOpenArtifact}
                />
              );
            })
          )}
        </>
      ) : null}
    </section>
  );
}

function GeneratedArtifactClassSection({
  artifactClass,
  artifacts,
  onOpenArtifact,
}: {
  artifactClass: GeneratedArtifactClass;
  artifacts: GeneratedArtifactEntry[];
  onOpenArtifact: (artifact: GeneratedArtifactEntry) => void;
}) {
  return (
    <section className="entry-section" aria-label={`${artifactClass} generated artifacts`}>
      <div className="entry-main">
        <h3>{formatArtifactClass(artifactClass)}</h3>
        <span className="category-badge category-generatedOutput">
          {artifacts.length} artifacts
        </span>
      </div>
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
                    onClick={() => onOpenArtifact(artifact)}
                  >
                    {artifact.name}
                  </button>
                ) : (
                  <strong>{artifact.name}</strong>
                )}
                <span className={`category-badge category-${knownStatusCategory(artifact)}`}>
                  {artifact.known_status}
                </span>
                <span className={`category-badge category-${previewStatusCategory(artifact)}`}>
                  {artifact.preview_status}
                </span>
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

function groupArtifactsByClass(
  artifacts: GeneratedArtifactEntry[],
): Record<GeneratedArtifactClass, GeneratedArtifactEntry[]> {
  return artifacts.reduce<Record<GeneratedArtifactClass, GeneratedArtifactEntry[]>>(
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

function knownStatusCategory(artifact: GeneratedArtifactEntry) {
  return artifact.known_status === "known" ? "sourceModel" : "derivedReport";
}

function previewStatusCategory(artifact: GeneratedArtifactEntry) {
  return artifact.preview_status === "previewable" ? "generatedOutput" : "derivedReport";
}
