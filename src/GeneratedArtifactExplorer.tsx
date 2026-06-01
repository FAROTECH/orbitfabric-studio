import { type CSSProperties, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { invoke } from "@tauri-apps/api/core";

import { ProvenanceBadge, StatusBadge } from "./Badges";
import {
  clearGeneratedArtifactInventory,
  publishGeneratedArtifactInventory,
} from "./generatedArtifactInventoryStore";
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

interface ArtifactClassStats {
  artifactClass: GeneratedArtifactClass;
  label: string;
  count: number;
  known: number;
  unknown: number;
  previewable: number;
  notPreviewable: number;
  provenance: Record<GeneratedArtifactProvenanceSource, number>;
}

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
  const [selectedArtifact, setSelectedArtifact] = useState<ClassifiedGeneratedArtifactEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isReadingArtifact, setIsReadingArtifact] = useState(false);

  const artifacts = classifyGeneratedArtifacts(inventory?.artifacts ?? []);
  const groupedArtifacts = groupArtifactsByClass(artifacts);
  const selectedArtifacts = groupedArtifacts[activeClass] ?? [];
  const classStats = createArtifactClassStats(groupedArtifacts);
  const knownArtifacts = artifacts.filter((artifact) => artifact.known_status === "known").length;
  const unknownArtifacts = artifacts.length - knownArtifacts;
  const previewableArtifacts = artifacts.filter((artifact) => artifact.preview_status === "previewable").length;
  const notPreviewableArtifacts = artifacts.length - previewableArtifacts;

  useEffect(() => {
    if (refreshToken > 0) {
      void handleInspectGeneratedArtifacts();
    }
  }, [refreshToken]);

  async function handleInspectGeneratedArtifacts() {
    setError(null);
    setPreviewError(null);
    setSelectedArtifactFile(null);
    setSelectedArtifact(null);
    clearGeneratedArtifactInventory(workspacePath);
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
      const linkedInventory: GeneratedArtifactInventory = {
        ...result,
        artifacts: classified,
        counts: {
          ...result.counts,
          known_artifacts: classified.filter((artifact) => artifact.known_status === "known").length,
          unknown_artifacts: classified.filter((artifact) => artifact.known_status === "unknown").length,
        },
      };
      const grouped = groupArtifactsByClass(classified);
      const nextKnown = classified.filter((artifact) => artifact.known_status === "known").length;
      const nextActiveClass =
        artifactClassOrder.find((artifactClass) => grouped[artifactClass].length > 0) ?? "reports";

      setInventory(linkedInventory);
      setActiveClass(nextActiveClass);
      publishGeneratedArtifactInventory(workspacePath, linkedInventory);

      onDashboardSummaryChange?.({
        generatedDir: linkedInventory.generated_dir,
        totalArtifacts: linkedInventory.counts.total_artifacts,
        knownArtifacts: nextKnown,
        unknownArtifacts: classified.length - nextKnown,
        previewableArtifacts: linkedInventory.counts.previewable_artifacts,
        notPreviewableArtifacts: linkedInventory.counts.not_previewable_artifacts,
        warningCount: linkedInventory.warnings.length,
      });
      onEvidenceArtifactSummaryChange?.(buildEvidenceSummary(classified));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      clearGeneratedArtifactInventory(workspacePath);
      onDashboardSummaryChange?.(null);
      onEvidenceArtifactSummaryChange?.(null);
    } finally {
      setIsInspecting(false);
    }
  }

  async function handleOpenArtifactPreview(artifact: ClassifiedGeneratedArtifactEntry) {
    setSelectedArtifact(artifact);
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

  function handleSelectClass(artifactClass: GeneratedArtifactClass) {
    setActiveClass(artifactClass);
    setSelectedArtifact(null);
    setSelectedArtifactFile(null);
    setPreviewError(null);
    onArtifactSelectionChange?.(null);
  }

  return (
    <section
      id="studio-artifacts"
      className="generated-artifact-deck"
      aria-label="Generated Artifact Constellation Deck"
    >
      <header className="artifact-deck-hero">
        <div>
          <span className="cockpit-eyebrow">Generated Artifact Constellation Deck</span>
          <h3>Inventory-derived output observatory</h3>
          <p>
            Studio observes generated files already present under the workspace generated directory.
            The constellation shows artifact class, known status, previewability and provenance only.
            No output is edited, regenerated or semantically interpreted as Mission Model source.
          </p>
        </div>
        <div className="artifact-deck-hero-actions">
          <div className="badge-row">
            <ProvenanceBadge label="GENERATED" />
            <ProvenanceBadge label="READ-ONLY" />
            <StatusBadge label="NO INFERENCE" />
          </div>
          <button
            className="artifact-deck-primary-action"
            type="button"
            onClick={handleInspectGeneratedArtifacts}
            disabled={isInspecting}
          >
            {isInspecting ? "Inspecting" : inventory ? "Refresh inventory" : "Inspect generated artifacts"}
          </button>
        </div>
      </header>

      {error ? <p className="error-text">{error}</p> : null}
      {isInspecting ? <p className="empty-text">Inspecting generated artifact inventory...</p> : null}

      {!inventory && !isInspecting ? (
        <ArtifactDeckWaitingState onInspect={handleInspectGeneratedArtifacts} />
      ) : null}

      {inventory ? (
        <>
          <section className="artifact-deck-command-grid" aria-label="Generated artifact command deck">
            <ArtifactConstellationMap
              stats={classStats}
              artifacts={artifacts}
              activeClass={activeClass}
              totalArtifacts={inventory.counts.total_artifacts}
              knownArtifacts={knownArtifacts}
              unknownArtifacts={unknownArtifacts}
              previewableArtifacts={previewableArtifacts}
              notPreviewableArtifacts={notPreviewableArtifacts}
              warningCount={inventory.warnings.length}
              generatedDir={inventory.generated_dir}
              onSelectClass={handleSelectClass}
              onSelectArtifact={handleOpenArtifactPreview}
            />

            <ArtifactClassDeck
              stats={classStats}
              activeClass={activeClass}
              selectedCount={selectedArtifacts.length}
              onSelectClass={handleSelectClass}
            />
          </section>

          <ArtifactInventoryStatusStrip
            inventory={inventory}
            knownArtifacts={knownArtifacts}
            unknownArtifacts={unknownArtifacts}
            previewableArtifacts={previewableArtifacts}
            notPreviewableArtifacts={notPreviewableArtifacts}
          />

          {inventory.warnings.length > 0 ? (
            <ArtifactWarningRail warnings={inventory.warnings} />
          ) : null}

          {inventory.artifacts.length === 0 ? (
            <p className="empty-text">No generated artifacts were reported.</p>
          ) : (
            <ArtifactSignalCardGrid
              artifactClass={activeClass}
              artifacts={selectedArtifacts}
              selectedArtifact={selectedArtifact}
              onOpenArtifactPreview={handleOpenArtifactPreview}
            />
          )}

          <ArtifactPreviewDock
            selectedArtifact={selectedArtifact}
            selectedArtifactFile={selectedArtifactFile}
            previewError={previewError}
            isReadingArtifact={isReadingArtifact}
          />

          <ArtifactDeckGuardrailStrip />
        </>
      ) : null}
    </section>
  );
}

function ArtifactDeckWaitingState({ onInspect }: { onInspect: () => void }) {
  return (
    <section className="artifact-deck-waiting-state" aria-label="Generated artifact deck waiting state">
      <div className="artifact-deck-waiting-orbit" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div>
        <span className="cockpit-eyebrow">Inventory not loaded</span>
        <h3>No constellation yet</h3>
        <p>
          Run generated artifact inspection to populate the deck. Until inventory is reported,
          Studio does not infer artifact evidence or preview status.
        </p>
        <button className="artifact-deck-primary-action" type="button" onClick={onInspect}>
          Inspect generated artifacts
        </button>
      </div>
    </section>
  );
}

function ArtifactConstellationMap({
  stats,
  artifacts,
  activeClass,
  totalArtifacts,
  knownArtifacts,
  unknownArtifacts,
  previewableArtifacts,
  notPreviewableArtifacts,
  warningCount,
  generatedDir,
  onSelectClass,
  onSelectArtifact,
}: {
  stats: ArtifactClassStats[];
  artifacts: ClassifiedGeneratedArtifactEntry[];
  activeClass: GeneratedArtifactClass;
  totalArtifacts: number;
  knownArtifacts: number;
  unknownArtifacts: number;
  previewableArtifacts: number;
  notPreviewableArtifacts: number;
  warningCount: number;
  generatedDir: string | null;
  onSelectClass: (artifactClass: GeneratedArtifactClass) => void;
  onSelectArtifact: (artifact: ClassifiedGeneratedArtifactEntry) => void;
}) {
  const viewBoxSize = 420;
  const center = viewBoxSize / 2;
  const classSegments = createClassSegments(stats, -110, 320);
  const signalMarkers = createArtifactSignalMarkers(artifacts, classSegments, center);
  const activeStats = stats.find((item) => item.artifactClass === activeClass);

  return (
    <section className="artifact-constellation-panel" aria-label="Artifact constellation map">
      <div className="artifact-deck-panel-heading">
        <div>
          <span className="cockpit-eyebrow">Constellation map</span>
          <h3>Generated output posture</h3>
          <p>
            Rings encode class, known status and previewability. Outer sparks are individual generated artifacts.
          </p>
        </div>
        <StatusBadge label={`${totalArtifacts} SIGNALS`} />
      </div>

      <div className="artifact-constellation-stage">
        <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} role="img" aria-label="Generated artifact constellation">
          <circle className="artifact-orbit-grid artifact-orbit-grid-outer" cx={center} cy={center} r="176" />
          <circle className="artifact-orbit-grid artifact-orbit-grid-middle" cx={center} cy={center} r="132" />
          <circle className="artifact-orbit-grid artifact-orbit-grid-inner" cx={center} cy={center} r="88" />

          {classSegments.map((segment) => {
            const stat = stats.find((item) => item.artifactClass === segment.artifactClass);
            const isActive = segment.artifactClass === activeClass;
            const knownRatio = stat && stat.count > 0 ? stat.known / stat.count : 0;
            const previewRatio = stat && stat.count > 0 ? stat.previewable / stat.count : 0;

            return (
              <g
                key={segment.artifactClass}
                className={`artifact-orbit-segment ${isActive ? "artifact-orbit-segment-active" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => onSelectClass(segment.artifactClass)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectClass(segment.artifactClass);
                  }
                }}
              >
                <path
                  className="artifact-orbit-class-band"
                  d={describeArcBand(center, center, 126, 164, segment.startAngle, segment.endAngle)}
                />
                <path
                  className="artifact-orbit-known-band"
                  d={describeArcBand(
                    center,
                    center,
                    94,
                    116,
                    segment.startAngle,
                    segment.startAngle + segment.sweep * knownRatio,
                  )}
                />
                <path
                  className="artifact-orbit-preview-band"
                  d={describeArcBand(
                    center,
                    center,
                    66,
                    82,
                    segment.startAngle,
                    segment.startAngle + segment.sweep * previewRatio,
                  )}
                />
                <text
                  className="artifact-orbit-label"
                  x={polarToCartesian(center, center, 182, segment.midAngle).x}
                  y={polarToCartesian(center, center, 182, segment.midAngle).y}
                  textAnchor="middle"
                >
                  {segment.shortLabel}
                </text>
              </g>
            );
          })}

          {signalMarkers.map((marker) => (
            <g
              key={marker.artifact.path}
              className={`artifact-signal-spark artifact-signal-${marker.artifact.known_status} artifact-signal-${marker.artifact.preview_status}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelectArtifact(marker.artifact)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectArtifact(marker.artifact);
                }
              }}
            >
              <circle cx={marker.x} cy={marker.y} r={marker.radius}>
                <title>{`${marker.artifact.relative_path} · ${marker.artifact.provenance.source}`}</title>
              </circle>
            </g>
          ))}

          {warningCount > 0 ? (
            <circle className="artifact-warning-ring" cx={center} cy={center} r="190" />
          ) : null}

          <g className="artifact-constellation-core">
            <circle cx={center} cy={center} r="52" />
            <text x={center} y={center - 8} textAnchor="middle">{totalArtifacts}</text>
            <text x={center} y={center + 16} textAnchor="middle">ARTIFACTS</text>
          </g>
        </svg>

        <div className="artifact-constellation-readout">
          <span className="cockpit-eyebrow">Selected orbit</span>
          <h3>{activeStats?.label ?? "No class"}</h3>
          <div className="artifact-readout-grid">
            <ArtifactReadout label="Count" value={String(activeStats?.count ?? 0)} />
            <ArtifactReadout label="Known" value={String(activeStats?.known ?? 0)} />
            <ArtifactReadout label="Unknown" value={String(activeStats?.unknown ?? 0)} />
            <ArtifactReadout label="Preview" value={String(activeStats?.previewable ?? 0)} />
          </div>
          <div className="artifact-readout-grid artifact-readout-grid-wide">
            <ArtifactReadout label="Generated dir" value={formatCompactPath(generatedDir)} title={generatedDir ?? undefined} />
            <ArtifactReadout label="Warnings" value={String(warningCount)} />
          </div>
          <div className="artifact-constellation-legend" aria-label="Artifact constellation legend">
            <span>Class orbit</span>
            <span>Known band {knownArtifacts}</span>
            <span>Unknown {unknownArtifacts}</span>
            <span>Previewable {previewableArtifacts}</span>
            <span>Not previewable {notPreviewableArtifacts}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArtifactClassDeck({
  stats,
  activeClass,
  selectedCount,
  onSelectClass,
}: {
  stats: ArtifactClassStats[];
  activeClass: GeneratedArtifactClass;
  selectedCount: number;
  onSelectClass: (artifactClass: GeneratedArtifactClass) => void;
}) {
  return (
    <section className="artifact-class-deck" aria-label="Artifact class deck">
      <div className="artifact-deck-panel-heading">
        <div>
          <span className="cockpit-eyebrow">Class deck</span>
          <h3>Artifact orbits</h3>
          <p>Each class is a static inventory bucket, not a generation pipeline stage.</p>
        </div>
        <StatusBadge label={`${selectedCount} SHOWN`} />
      </div>

      <div className="artifact-class-card-stack">
        {stats.map((stat) => {
          const isActive = stat.artifactClass === activeClass;
          const knownRatio = stat.count > 0 ? stat.known / stat.count : 0;
          const previewRatio = stat.count > 0 ? stat.previewable / stat.count : 0;

          return (
            <button
              className="artifact-class-card"
              type="button"
              key={stat.artifactClass}
              aria-current={isActive}
              onClick={() => onSelectClass(stat.artifactClass)}
            >
              <div>
                <span>{stat.label}</span>
                <strong>{stat.count}</strong>
              </div>
              <div className="artifact-class-card-bars">
                <span style={{ "--artifact-ratio": knownRatio } as CSSProperties}>
                  <i />
                </span>
                <span style={{ "--artifact-ratio": previewRatio } as CSSProperties}>
                  <i />
                </span>
              </div>
              <small>
                {stat.known} known · {stat.previewable} previewable · {stat.provenance.unknown} unknown provenance
              </small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ArtifactInventoryStatusStrip({
  inventory,
  knownArtifacts,
  unknownArtifacts,
  previewableArtifacts,
  notPreviewableArtifacts,
}: {
  inventory: GeneratedArtifactInventory;
  knownArtifacts: number;
  unknownArtifacts: number;
  previewableArtifacts: number;
  notPreviewableArtifacts: number;
}) {
  return (
    <section className="artifact-inventory-status-strip" aria-label="Generated artifact inventory status">
      <ArtifactReadout label="Generated directory" value={formatCompactPath(inventory.generated_dir)} title={inventory.generated_dir ?? undefined} />
      <ArtifactReadout label="Total artifacts" value={String(inventory.counts.total_artifacts)} />
      <ArtifactReadout label="Known" value={String(knownArtifacts)} />
      <ArtifactReadout label="Unknown" value={String(unknownArtifacts)} />
      <ArtifactReadout label="Previewable" value={String(previewableArtifacts)} />
      <ArtifactReadout label="Not previewable" value={String(notPreviewableArtifacts)} />
    </section>
  );
}

function ArtifactWarningRail({ warnings }: { warnings: string[] }) {
  return (
    <section className="artifact-warning-rail" aria-label="Generated artifact warnings">
      <div>
        <span className="cockpit-eyebrow">Warning rail</span>
        <h3>Inventory warnings</h3>
      </div>
      <ul>
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </section>
  );
}

function ArtifactSignalCardGrid({
  artifactClass,
  artifacts,
  selectedArtifact,
  onOpenArtifactPreview,
}: {
  artifactClass: GeneratedArtifactClass;
  artifacts: ClassifiedGeneratedArtifactEntry[];
  selectedArtifact: ClassifiedGeneratedArtifactEntry | null;
  onOpenArtifactPreview: (artifact: ClassifiedGeneratedArtifactEntry) => void;
}) {
  return (
    <section className="artifact-signal-card-grid-panel" aria-label={`${artifactClass} generated artifact signals`}>
      <div className="artifact-deck-panel-heading">
        <div>
          <span className="cockpit-eyebrow">Selected orbit</span>
          <h3>{formatArtifactClass(artifactClass)}</h3>
          <p>Artifact cards are inventory records. Preview is available only for supported read-only text files.</p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="INVENTORY" />
          <StatusBadge label={`${artifacts.length} ARTIFACTS`} />
        </div>
      </div>

      {artifacts.length === 0 ? (
        <p className="empty-text">No artifacts in this class.</p>
      ) : (
        <div className="artifact-signal-card-grid">
          {artifacts.map((artifact) => {
            const isPreviewable = artifact.preview_status === "previewable";
            const isSelected = selectedArtifact?.path === artifact.path;

            return (
              <button
                className="artifact-signal-card"
                type="button"
                key={artifact.path}
                aria-current={isSelected}
                onClick={() => onOpenArtifactPreview(artifact)}
              >
                <div className="artifact-signal-card-header">
                  <span>{artifact.artifact_class}</span>
                  <strong title={artifact.name}>{artifact.name}</strong>
                </div>
                <span className="artifact-signal-path" title={artifact.relative_path}>
                  {artifact.relative_path}
                </span>
                <div className="artifact-signal-card-badges">
                  <StatusBadge label={artifact.known_status === "known" ? "KNOWN" : "UNKNOWN"} />
                  <StatusBadge label={isPreviewable ? "PREVIEW" : "NO PREVIEW"} />
                  <ProvenanceBadge label={formatProvenanceLabel(artifact.provenance.source)} />
                </div>
                <div className="artifact-signal-meta">
                  <span>{artifact.size_bytes} bytes</span>
                  <span>{artifact.extension ?? "no ext"}</span>
                </div>
                <small>{artifact.classification_reason}</small>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ArtifactPreviewDock({
  selectedArtifact,
  selectedArtifactFile,
  previewError,
  isReadingArtifact,
}: {
  selectedArtifact: ClassifiedGeneratedArtifactEntry | null;
  selectedArtifactFile: FileContent | null;
  previewError: string | null;
  isReadingArtifact: boolean;
}) {
  return (
    <section className="artifact-preview-dock" aria-label="Generated artifact read-only preview dock">
      <div className="artifact-deck-panel-heading">
        <div>
          <span className="cockpit-eyebrow">Preview dock</span>
          <h3>{selectedArtifact?.name ?? "No artifact selected"}</h3>
          <p>Read-only text preview. No validation, semantic parsing or generated file mutation is performed.</p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="READ-ONLY" />
          <ProvenanceBadge label="PREVIEW ONLY" />
        </div>
      </div>

      {selectedArtifact ? (
        <div className="artifact-preview-selected-strip">
          <ArtifactReadout label="Class" value={selectedArtifact.artifact_class} />
          <ArtifactReadout label="Status" value={selectedArtifact.known_status} />
          <ArtifactReadout label="Preview" value={selectedArtifact.preview_status} />
          <ArtifactReadout label="Provenance" value={selectedArtifact.provenance.source} />
          <ArtifactReadout label="Path" value={formatCompactPath(selectedArtifact.relative_path)} title={selectedArtifact.relative_path} />
        </div>
      ) : null}

      {previewError ? <p className="error-text">{previewError}</p> : null}
      {isReadingArtifact ? <p className="empty-text">Reading generated artifact...</p> : null}
      {!selectedArtifactFile && !isReadingArtifact && !previewError ? (
        <p className="empty-text">Select a previewable generated artifact signal.</p>
      ) : null}

      {selectedArtifactFile ? (
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
      ) : null}
    </section>
  );
}

function ArtifactDeckGuardrailStrip() {
  return (
    <section className="artifact-deck-guardrail-strip" aria-label="Generated artifact guardrails">
      <span>No generation</span>
      <span>No editing</span>
      <span>No semantic inference</span>
      <span>No causal graph</span>
      <span>No manifest interpretation unless exposed</span>
      <span>Inventory-derived only</span>
    </section>
  );
}

function ArtifactReadout({
  label,
  value,
  title,
}: {
  label: string;
  value: string;
  title?: string;
}) {
  return (
    <div className="artifact-readout" title={title}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function createArtifactClassStats(
  groupedArtifacts: Record<GeneratedArtifactClass, ClassifiedGeneratedArtifactEntry[]>,
): ArtifactClassStats[] {
  return artifactClassOrder.map((artifactClass) => {
    const artifacts = groupedArtifacts[artifactClass] ?? [];
    const provenance = createEmptyProvenanceCounts();

    for (const artifact of artifacts) {
      provenance[artifact.provenance.source] += 1;
    }

    return {
      artifactClass,
      label: formatArtifactClass(artifactClass),
      count: artifacts.length,
      known: artifacts.filter((artifact) => artifact.known_status === "known").length,
      unknown: artifacts.filter((artifact) => artifact.known_status === "unknown").length,
      previewable: artifacts.filter((artifact) => artifact.preview_status === "previewable").length,
      notPreviewable: artifacts.filter((artifact) => artifact.preview_status !== "previewable").length,
      provenance,
    };
  });
}

function createEmptyProvenanceCounts(): Record<GeneratedArtifactProvenanceSource, number> {
  return {
    documentedCorePath: 0,
    documentedCoreFileName: 0,
    manifestField: 0,
    unknown: 0,
  };
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

function createClassSegments(
  stats: ArtifactClassStats[],
  startAngle: number,
  totalSweep: number,
) {
  const total = stats.reduce((sum, stat) => sum + Math.max(stat.count, 0), 0);
  const fallbackSweep = totalSweep / stats.length;
  let currentAngle = startAngle;

  return stats.map((stat) => {
    const sweep = total > 0 ? Math.max(22, (stat.count / total) * totalSweep) : fallbackSweep;
    const segment = {
      artifactClass: stat.artifactClass,
      shortLabel: shortArtifactClassLabel(stat.artifactClass),
      startAngle: currentAngle,
      endAngle: currentAngle + sweep - 5,
      sweep: Math.max(1, sweep - 5),
      midAngle: currentAngle + sweep / 2,
    };
    currentAngle += sweep;
    return segment;
  });
}

function createArtifactSignalMarkers(
  artifacts: ClassifiedGeneratedArtifactEntry[],
  segments: ReturnType<typeof createClassSegments>,
  center: number,
) {
  const grouped = groupArtifactsByClass(artifacts);

  return segments.flatMap((segment) => {
    const classArtifacts = grouped[segment.artifactClass] ?? [];
    const divisor = Math.max(classArtifacts.length, 1);

    return classArtifacts.map((artifact, index) => {
      const offset = (index + 0.5) / divisor;
      const angle = segment.startAngle + segment.sweep * offset;
      const radius = artifact.preview_status === "previewable" ? 188 : 174;
      const position = polarToCartesian(center, center, radius, angle);

      return {
        artifact,
        x: position.x,
        y: position.y,
        radius: artifact.known_status === "known" ? 4.6 : 3.5,
      };
    });
  });
}

function describeArcBand(
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  if (endAngle <= startAngle) {
    return "";
  }

  const outerStart = polarToCartesian(centerX, centerY, outerRadius, endAngle);
  const outerEnd = polarToCartesian(centerX, centerY, outerRadius, startAngle);
  const innerStart = polarToCartesian(centerX, centerY, innerRadius, startAngle);
  const innerEnd = polarToCartesian(centerX, centerY, innerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", outerStart.x, outerStart.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
    "L", innerStart.x, innerStart.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerEnd.x, innerEnd.y,
    "Z",
  ].join(" ");
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
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

function shortArtifactClassLabel(artifactClass: GeneratedArtifactClass): string {
  switch (artifactClass) {
    case "reports":
      return "RPT";
    case "logs":
      return "LOG";
    case "docs":
      return "DOC";
    case "runtime":
      return "RUN";
    case "ground":
      return "GND";
    case "unknown":
      return "UNK";
  }
}

function formatProvenanceLabel(source: GeneratedArtifactProvenanceSource): string {
  switch (source) {
    case "documentedCorePath":
      return "CORE PATH";
    case "documentedCoreFileName":
      return "CORE NAME";
    case "manifestField":
      return "MANIFEST";
    case "unknown":
      return "UNKNOWN SRC";
  }
}

function formatCompactPath(value: string | null | undefined): string {
  if (!value) {
    return "not detected";
  }

  const normalized = value.replace(/\\/g, "/");
  const parts = normalized.split("/").filter(Boolean);

  if (parts.length <= 3) {
    return normalized;
  }

  return `…/${parts.slice(-3).join("/")}`;
}
