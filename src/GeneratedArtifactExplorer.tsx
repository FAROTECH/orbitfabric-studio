import { type CSSProperties, useEffect, useMemo, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";

import { ProvenanceBadge, StatusBadge } from "./Badges";
import { StudioIcon, type StudioIconKind } from "./StudioIcon";
import {
  clearGeneratedArtifactInventory,
  getGeneratedArtifactInventorySnapshot,
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
  "docs",
  "runtime",
  "ground",
  "logs",
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

type ArtifactQueue = "all" | "review" | "integration" | "unknown";

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

interface InspectGeneratedArtifactsOptions {
  preserveExistingInventory?: boolean;
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
  shortLabel: string;
  count: number;
  known: number;
  unknown: number;
  previewable: number;
  notPreviewable: number;
  reviewReady: number;
  listedOnly: number;
  integrationFacing: number;
  provenance: Record<GeneratedArtifactProvenanceSource, number>;
}

export function GeneratedArtifactExplorerPanel({
  workspacePath,
  refreshToken = 0,
  onDashboardSummaryChange,
  onArtifactSelectionChange,
  onEvidenceArtifactSummaryChange,
}: GeneratedArtifactExplorerPanelProps) {
  const [inventory, setInventory] = useState<GeneratedArtifactInventory | null>(() => {
    const cached = getGeneratedArtifactInventorySnapshot();

    return cached.workspacePath === workspacePath ? cached.inventory : null;
  });
  const [selectedArtifact, setSelectedArtifact] = useState<ClassifiedGeneratedArtifactEntry | null>(null);
  const [selectedArtifactFile, setSelectedArtifactFile] = useState<FileContent | null>(null);
  const [activeQueue, setActiveQueue] = useState<ArtifactQueue>("all");
  const [familyFilter, setFamilyFilter] = useState<GeneratedArtifactClass | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isReadingArtifact, setIsReadingArtifact] = useState(false);

  const artifacts = useMemo(
    () => classifyGeneratedArtifacts(inventory?.artifacts ?? []),
    [inventory],
  );
  const groupedArtifacts = useMemo(() => groupArtifactsByClass(artifacts), [artifacts]);
  const classStats = useMemo(() => createArtifactClassStats(groupedArtifacts), [groupedArtifacts]);

  const totalArtifacts = artifacts.length;
  const knownArtifacts = artifacts.filter((artifact) => artifact.known_status === "known").length;
  const unknownArtifacts = totalArtifacts - knownArtifacts;
  const previewableArtifacts = artifacts.filter((artifact) => artifact.preview_status === "previewable").length;
  const notPreviewableArtifacts = totalArtifacts - previewableArtifacts;
  const integrationFacingArtifacts = artifacts.filter((artifact) =>
    artifact.artifact_class === "runtime" || artifact.artifact_class === "ground",
  ).length;
  const familyCount = classStats.filter((stat) => stat.count > 0).length;
  const warnings = inventory?.warnings ?? [];
  const lineageBoardRef = useRef<HTMLElement | null>(null);
  const hydratedWorkspaceRef = useRef<string | null>(null);

  function scrollArtifactListIntoView() {
    window.requestAnimationFrame(() => {
      const surfaceRoot = lineageBoardRef.current;

      if (!surfaceRoot) {
        return;
      }

      const artifactList = surfaceRoot.querySelector<HTMLElement>("[data-generated-artifact-list]");

      if (!artifactList) {
        return;
      }

      const surfaceRect = surfaceRoot.getBoundingClientRect();
      const listRect = artifactList.getBoundingClientRect();
      const targetTop = surfaceRoot.scrollTop + listRect.top - surfaceRect.top - 16;

      surfaceRoot.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: "smooth",
      });

      artifactList.setAttribute("data-scroll-focus", "true");
      window.setTimeout(() => {
        artifactList.removeAttribute("data-scroll-focus");
      }, 1200);
    });
  }

  const filteredArtifacts = useMemo(
    () =>
      artifacts.filter((artifact) => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const matchesQuery =
          normalizedQuery.length === 0 ||
          artifact.name.toLowerCase().includes(normalizedQuery) ||
          artifact.relative_path.toLowerCase().includes(normalizedQuery) ||
          artifact.artifact_class.toLowerCase().includes(normalizedQuery);

        const matchesFamily = familyFilter === "all" || artifact.artifact_class === familyFilter;
        const matchesQueue = artifactMatchesQueue(artifact, activeQueue);

        return matchesQuery && matchesFamily && matchesQueue;
      }),
    [activeQueue, artifacts, familyFilter, searchQuery],
  );

  useEffect(() => {
    if (hydratedWorkspaceRef.current === workspacePath) {
      return;
    }

    hydratedWorkspaceRef.current = workspacePath;
    setError(null);
    setPreviewError(null);
    setSelectedArtifactFile(null);
    setSelectedArtifact(null);
    onArtifactSelectionChange?.(null);

    const cached = getGeneratedArtifactInventorySnapshot();

    if (cached.workspacePath === workspacePath && cached.inventory) {
      applyGeneratedArtifactInventory(cached.inventory);
      return;
    }

    setInventory(null);
    onDashboardSummaryChange?.(null);
    onEvidenceArtifactSummaryChange?.(null);
    void handleInspectGeneratedArtifacts({ preserveExistingInventory: true });
  }, [workspacePath]);

  useEffect(() => {
    if (refreshToken > 0) {
      void handleInspectGeneratedArtifacts({ preserveExistingInventory: true });
    }
  }, [refreshToken]);

  function applyGeneratedArtifactInventory(nextInventory: GeneratedArtifactInventory) {
    const classified = classifyGeneratedArtifacts(nextInventory.artifacts);
    const nextKnown = classified.filter((artifact) => artifact.known_status === "known").length;
    const linkedInventory: GeneratedArtifactInventory = {
      ...nextInventory,
      artifacts: classified,
      counts: {
        ...nextInventory.counts,
        known_artifacts: nextKnown,
        unknown_artifacts: classified.length - nextKnown,
      },
    };

    setInventory(linkedInventory);
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
  }

  async function handleInspectGeneratedArtifacts(
    options: InspectGeneratedArtifactsOptions = {},
  ) {
    const preserveExistingInventory = options.preserveExistingInventory ?? false;

    setError(null);
    setPreviewError(null);
    setSelectedArtifactFile(null);
    setSelectedArtifact(null);
    onArtifactSelectionChange?.(null);

    if (!preserveExistingInventory) {
      clearGeneratedArtifactInventory(workspacePath);
      setInventory(null);
      onDashboardSummaryChange?.(null);
      onEvidenceArtifactSummaryChange?.(null);
    }

    setIsInspecting(true);

    try {
      const result = await invoke<GeneratedArtifactInventory>(
        "inspect_generated_artifacts",
        { workspacePath },
      );

      applyGeneratedArtifactInventory(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));

      if (!preserveExistingInventory) {
        clearGeneratedArtifactInventory(workspacePath);
        setInventory(null);
        onDashboardSummaryChange?.(null);
        onEvidenceArtifactSummaryChange?.(null);
      }
    } finally {
      setIsInspecting(false);
    }
  }

  function handleSelectArtifact(artifact: ClassifiedGeneratedArtifactEntry) {
    setSelectedArtifact(artifact);
    setSelectedArtifactFile(null);
    setPreviewError(null);
    onArtifactSelectionChange?.(toInspectorItem(artifact));
  }

  async function handleOpenArtifactPreview(artifact = selectedArtifact) {
    if (!artifact) {
      setPreviewError("Select a generated artifact first.");
      return;
    }

    handleSelectArtifact(artifact);

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
      ref={(element) => { lineageBoardRef.current = element; }}
      className="generated-artifacts-lineage-board generated-artifact-deck"
      aria-label="Generated Artifacts Lineage Board"
    >
      <header className="lineage-header">
        <div className="lineage-title-block">
          <div className="lineage-title-row">
            <h2>Generated Artifacts</h2>
            <StatusBadge label="PUBLIC PREVIEW" />
          </div>
          <strong>Artifact Lineage Board</strong>
          <p>
            Track how generated files are present in the workspace, how Studio classifies them
            conservatively, and which outputs should be reviewed first.
          </p>
        </div>

        <div className="lineage-stat-grid" aria-label="Generated artifact summary">
          <LineageStatCard label="Total artifacts" value={String(totalArtifacts)} detail={inventory ? "reported by inventory" : "inventory not loaded"} />
          <LineageStatCard label="Families" value={String(familyCount)} detail="reports, docs, runtime, ground, logs" />
          <LineageStatCard label="Ready for review" value={String(previewableArtifacts)} detail="previewable files" />
          <LineageStatCard label="Evidence ready" value={String(knownArtifacts)} detail="known generated outputs" />
        </div>
      </header>

      <ArtifactLineageInspector
        selectedArtifact={selectedArtifact}
        selectedArtifactFile={selectedArtifactFile}
        previewError={previewError}
        isReadingArtifact={isReadingArtifact}
        onOpenArtifactPreview={() => void handleOpenArtifactPreview()}
      />

      {error ? <p className="error-text lineage-board-error">{error}</p> : null}
      {isInspecting ? <p className="empty-text lineage-board-status">Inspecting generated artifact inventory...</p> : null}

      {!inventory && !isInspecting ? (
        <ArtifactLineageWaitingPanel
          onInspect={() => void handleInspectGeneratedArtifacts()}
        />
      ) : null}

      {inventory ? (
        <>
          <ArtifactLineageBoard
            workspacePath={workspacePath}
            generatedDir={inventory.generated_dir}
            stats={classStats}
            totalArtifacts={totalArtifacts}
            previewableArtifacts={previewableArtifacts}
            knownArtifacts={knownArtifacts}
            unknownArtifacts={unknownArtifacts}
            integrationFacingArtifacts={integrationFacingArtifacts}
            onFamilySelect={(family) => {
              setFamilyFilter(family);
              setActiveQueue("all");
              scrollArtifactListIntoView();
            }}
            onQueueSelect={(queue) => {
              setActiveQueue(queue);
              scrollArtifactListIntoView();
            }}
          />

          <ArtifactReviewPath
            reports={groupedArtifacts.reports.length}
            docs={groupedArtifacts.docs.length}
            runtime={groupedArtifacts.runtime.length}
            ground={groupedArtifacts.ground.length}
            logs={groupedArtifacts.logs.length}
          />

          {warnings.length > 0 ? <ArtifactWarningRail warnings={warnings} /> : null}

          <ArtifactInventoryTable
            artifacts={filteredArtifacts}
            selectedArtifact={selectedArtifact}
            activeQueue={activeQueue}
            familyFilter={familyFilter}
            searchQuery={searchQuery}
            totalArtifacts={totalArtifacts}
            reviewCount={previewableArtifacts}
            integrationCount={integrationFacingArtifacts}
            unknownCount={unknownArtifacts}
            onQueueChange={setActiveQueue}
            onFamilyFilterChange={setFamilyFilter}
            onSearchChange={setSearchQuery}
            onSelectArtifact={handleSelectArtifact}
            onOpenArtifactPreview={handleOpenArtifactPreview}
          />
        </>
      ) : null}
    </section>
  );
}

function LineageStatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="lineage-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function ArtifactLineageWaitingPanel({ onInspect }: { onInspect: () => void }) {
  return (
    <section className="lineage-waiting-panel" aria-label="Generated artifact inventory waiting state">
      <div className="lineage-waiting-orbit" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div>
        <span className="cockpit-eyebrow">Inventory not loaded</span>
        <h3>No generated artifact inventory yet</h3>
        <p>
          Studio automatically inspects generated artifacts when this surface opens.
          Use the action only to retry if inventory is still unavailable.
        </p>
      </div>
      <button className="lineage-primary-action" type="button" onClick={onInspect}>
        Retry generated artifact inspection
      </button>
    </section>
  );
}

function ArtifactLineageBoard({
  workspacePath,
  generatedDir,
  stats,
  totalArtifacts,
  previewableArtifacts,
  knownArtifacts,
  unknownArtifacts,
  integrationFacingArtifacts,
  onFamilySelect,
  onQueueSelect,
}: {
  workspacePath: string;
  generatedDir: string | null;
  stats: ArtifactClassStats[];
  totalArtifacts: number;
  previewableArtifacts: number;
  knownArtifacts: number;
  unknownArtifacts: number;
  integrationFacingArtifacts: number;
  onFamilySelect: (artifactClass: GeneratedArtifactClass) => void;
  onQueueSelect: (queue: ArtifactQueue) => void;
}) {
  return (
    <section className="lineage-board-panel" aria-label="Artifact lineage board">
      <LineageColumn
        index="1"
        title="Mission / Scenario Context"
        caption="Conservative source context"
      >
        <LineageContextCard title="Workspace" value={formatCompactPath(workspacePath)} detail="selected path" />
        <LineageContextCard title="Generated root" value={formatCompactPath(generatedDir)} detail={generatedDir ? "detected" : "not detected"} />
        <LineageContextCard title="Mission model" value="not linked" detail="not inferred by this surface" />
        <LineageContextCard title="Scenario / run" value="not linked" detail="requires parsed Core report context" />
      </LineageColumn>

      <LineageColumn
        index="2"
        title="Generated Families"
        caption={`${stats.filter((stat) => stat.count > 0).length} reported families`}
      >
        {stats.map((stat) => (
          <button
            className="lineage-family-card"
            type="button"
            key={stat.artifactClass}
            onClick={() => onFamilySelect(stat.artifactClass)}
          >
            <StudioIcon
              kind={artifactFamilyIcon(stat.artifactClass)}
              className={`lineage-family-icon lineage-family-${stat.artifactClass}`}
            />
            <span>
              <strong>{stat.label}</strong>
              <small>{stat.count} artifacts</small>
            </span>
            <i style={{ width: `${percent(stat.count, Math.max(totalArtifacts, 1))}%` }} />
          </button>
        ))}
      </LineageColumn>

      <LineageColumn
        index="3"
        title="Evidence Status"
        caption="Inventory-derived status"
      >
        {stats.map((stat) => (
          <article className="lineage-evidence-row" key={stat.artifactClass}>
            <div>
              <strong>{stat.shortLabel}</strong>
              <span>{stat.previewable} previewable · {stat.unknown} unknown</span>
            </div>
            <div className="lineage-evidence-bar" aria-hidden="true">
              <span className="lineage-bar-ready" style={{ width: `${percent(stat.previewable, stat.count)}%` }} />
              <span className="lineage-bar-known" style={{ width: `${percent(stat.known, stat.count)}%` }} />
              <span className="lineage-bar-unknown" style={{ width: `${percent(stat.unknown, stat.count)}%` }} />
            </div>
            <small>{percent(stat.known, Math.max(stat.count, 1))}% known</small>
          </article>
        ))}
      </LineageColumn>

      <LineageColumn
        index="4"
        title="Review / Downstream Use"
        caption="Next steps"
      >
        <LineageActionCard title="Review queue" value={`${previewableArtifacts} previewable`} onClick={() => onQueueSelect("review")} />
        <LineageActionCard title="Known evidence" value={`${knownArtifacts} known outputs`} onClick={() => onQueueSelect("all")} />
        <LineageActionCard title="Integration-facing" value={`${integrationFacingArtifacts} runtime or ground`} onClick={() => onQueueSelect("integration")} />
        <LineageActionCard title="Unknown triage" value={`${unknownArtifacts} unclassified`} onClick={() => onQueueSelect("unknown")} />
      </LineageColumn>
    </section>
  );
}

function LineageColumn({
  index,
  title,
  caption,
  children,
}: {
  index: string;
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div className="lineage-column">
      <div className="lineage-column-heading">
        <span>{index}. {title}</span>
        <small>{caption}</small>
      </div>
      <div className="lineage-column-body">{children}</div>
    </div>
  );
}

function LineageContextCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="lineage-context-card">
      <span>{title}</span>
      <strong title={value}>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function LineageActionCard({
  title,
  value,
  onClick,
}: {
  title: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button className="lineage-action-card" type="button" onClick={onClick}>
      <span>
        <strong>{title}</strong>
        <small>{value}</small>
      </span>
      <StudioIcon kind="open-detail" className="lineage-action-card-icon" />
    </button>
  );
}

function ArtifactReviewPath({
  reports,
  docs,
  runtime,
  ground,
  logs,
}: {
  reports: number;
  docs: number;
  runtime: number;
  ground: number;
  logs: number;
}) {
  const steps = [
    { label: "Review Reports", value: reports },
    { label: "Validate Docs", value: docs },
    { label: "Verify Runtime", value: runtime },
    { label: "Ground Ops Check", value: ground },
    { label: "Log Sampling", value: logs },
  ];

  return (
    <section className="lineage-review-path" aria-label="Recommended review path">
      <div>
        <span className="cockpit-eyebrow">Recommended review path</span>
      </div>
      <ol>
        {steps.map((step, index) => (
          <li key={step.label}>
            <span>{index + 1}</span>
            <strong>{step.label}</strong>
            <small>{step.value} reported</small>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ArtifactInventoryTable({
  artifacts,
  selectedArtifact,
  activeQueue,
  familyFilter,
  searchQuery,
  totalArtifacts,
  reviewCount,
  integrationCount,
  unknownCount,
  onQueueChange,
  onFamilyFilterChange,
  onSearchChange,
  onSelectArtifact,
  onOpenArtifactPreview,
}: {
  artifacts: ClassifiedGeneratedArtifactEntry[];
  selectedArtifact: ClassifiedGeneratedArtifactEntry | null;
  activeQueue: ArtifactQueue;
  familyFilter: GeneratedArtifactClass | "all";
  searchQuery: string;
  totalArtifacts: number;
  reviewCount: number;
  integrationCount: number;
  unknownCount: number;
  onQueueChange: (queue: ArtifactQueue) => void;
  onFamilyFilterChange: (family: GeneratedArtifactClass | "all") => void;
  onSearchChange: (value: string) => void;
  onSelectArtifact: (artifact: ClassifiedGeneratedArtifactEntry) => void;
  onOpenArtifactPreview: (artifact: ClassifiedGeneratedArtifactEntry) => void;
}) {
  return (
    <section
      className="lineage-table-panel"
      aria-label="Generated artifact table"
      data-generated-artifact-list
    >
      <div className="lineage-table-tabs">
        <button type="button" aria-current={activeQueue === "all"} onClick={() => onQueueChange("all")}>
          Artifacts <span>{totalArtifacts}</span>
        </button>
        <button type="button" aria-current={activeQueue === "review"} onClick={() => onQueueChange("review")}>
          Review queue <span>{reviewCount}</span>
        </button>
        <button type="button" aria-current={activeQueue === "integration"} onClick={() => onQueueChange("integration")}>
          Integration ready <span>{integrationCount}</span>
        </button>
        <button type="button" aria-current={activeQueue === "unknown"} onClick={() => onQueueChange("unknown")}>
          Unknown <span>{unknownCount}</span>
        </button>
      </div>

      <div className="lineage-table-toolbar">
        <label>
          <span>Search artifacts</span>
          <input
            type="search"
            value={searchQuery}
            placeholder="Search artifacts..."
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
        <label>
          <span>Family</span>
          <select
            value={familyFilter}
            onChange={(event) => onFamilyFilterChange(event.target.value as GeneratedArtifactClass | "all")}
          >
            <option value="all">All families</option>
            {artifactClassOrder.map((artifactClass) => (
              <option value={artifactClass} key={artifactClass}>
                {formatArtifactClass(artifactClass)}
              </option>
            ))}
          </select>
        </label>
        <div className="lineage-table-count">
          <StatusBadge label={`${artifacts.length} SHOWN`} />
          <ProvenanceBadge label="INVENTORY" />
        </div>
      </div>

      <div className="lineage-table-shell">
        <table className="lineage-artifact-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Family</th>
              <th>Type</th>
              <th>Status</th>
              <th>Evidence status</th>
              <th>Format</th>
              <th>Size</th>
              <th>Relative path</th>
            </tr>
          </thead>
          <tbody>
            {artifacts.map((artifact) => {
              const isSelected = selectedArtifact?.path === artifact.path;

              return (
                <tr
                  key={artifact.path}
                  aria-current={isSelected}
                  tabIndex={0}
                  onClick={() => onSelectArtifact(artifact)}
                  onDoubleClick={() => onOpenArtifactPreview(artifact)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      onSelectArtifact(artifact);
                    }
                  }}
                >
                  <td>
                    <span className={`lineage-row-dot lineage-family-${artifact.artifact_class}`} />
                    <strong title={artifact.name}>{artifact.name}</strong>
                  </td>
                  <td>{formatArtifactClass(artifact.artifact_class)}</td>
                  <td>{artifactTypeLabel(artifact)}</td>
                  <td>
                    <span className={`lineage-status-pill lineage-status-${reviewState(artifact)}`}>
                      {reviewStateLabel(artifact)}
                    </span>
                  </td>
                  <td>{artifact.known_status === "known" ? "Ready" : "Needs review"}</td>
                  <td>{(artifact.extension ?? "none").toUpperCase()}</td>
                  <td>{formatSize(artifact.size_bytes)}</td>
                  <td title={artifact.relative_path}>{artifact.relative_path}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="lineage-table-footer">
        Showing {artifacts.length} of {totalArtifacts} generated artifacts.
      </p>
    </section>
  );
}

function ArtifactLineageInspector({
  selectedArtifact,
  selectedArtifactFile,
  previewError,
  isReadingArtifact,
  onOpenArtifactPreview,
}: {
  selectedArtifact: ClassifiedGeneratedArtifactEntry | null;
  selectedArtifactFile: FileContent | null;
  previewError: string | null;
  isReadingArtifact: boolean;
  onOpenArtifactPreview: () => void;
}) {
  return (
    <aside className="lineage-inspector" aria-label="Artifact inspector">
      <div className="lineage-inspector-heading">
        <div>
          <span className="cockpit-eyebrow">Artifact inspector</span>
          <h3>{selectedArtifact?.name ?? "No artifact selected"}</h3>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="READ-ONLY" />
          <StatusBadge label={selectedArtifact ? reviewStateLabel(selectedArtifact) : "UNAVAILABLE"} />
        </div>
      </div>

      {selectedArtifact ? (
        <>
          <section className="lineage-inspector-object">
            <div className={`lineage-inspector-cube lineage-family-${selectedArtifact.artifact_class}`} aria-hidden="true">
              {artifactFamilyIcon(selectedArtifact.artifact_class)}
            </div>
            <div>
              <strong>{selectedArtifact.name}</strong>
              <span>{artifactTypeLabel(selectedArtifact)} · {(selectedArtifact.extension ?? "none").toUpperCase()}</span>
            </div>
          </section>

          <InspectorSection title="Overview">
            <InspectorField label="Family" value={formatArtifactClass(selectedArtifact.artifact_class)} />
            <InspectorField label="Format" value={(selectedArtifact.extension ?? "none").toUpperCase()} />
            <InspectorField label="Size" value={formatSize(selectedArtifact.size_bytes)} />
            <InspectorField label="Status" value={reviewStateLabel(selectedArtifact)} />
          </InspectorSection>

          <InspectorSection title="Provenance">
            <InspectorField label="Source" value={formatProvenanceLabel(selectedArtifact.provenance.source)} />
            <InspectorField label="Detail" value={selectedArtifact.provenance.detail ?? "not reported"} />
            <InspectorField label="Inference" value="none" />
          </InspectorSection>

          <InspectorSection title="Path">
            <InspectorField label="Relative path" value={selectedArtifact.relative_path} />
            <InspectorField label="Preview" value={selectedArtifact.preview_status} />
          </InspectorSection>

          <InspectorSection title="Preview status">
            {previewError ? <p className="error-text">{previewError}</p> : null}
            {isReadingArtifact ? <p className="empty-text">Reading generated artifact...</p> : null}
            {selectedArtifactFile ? (
              <pre className="lineage-preview-block">{formatPreviewExcerpt(selectedArtifactFile.content)}</pre>
            ) : (
              <p>
                {selectedArtifact.preview_status === "previewable"
                  ? "Preview is available. Use Open Artifact to load a read-only excerpt."
                  : "Preview is not available for this artifact."}
              </p>
            )}
          </InspectorSection>
        </>
      ) : (
        <section className="lineage-inspector-empty">
          <p>Select an artifact row to inspect its generated file metadata and conservative review status.</p>
        </section>
      )}

      <div className="lineage-inspector-actions">
        <button type="button" className="lineage-primary-action" onClick={onOpenArtifactPreview} disabled={!selectedArtifact}>
          Open Artifact
        </button>
        <button type="button" disabled>Open in File Explorer</button>
        <button type="button" disabled>Add to Review Queue</button>
        <button type="button" disabled>Export</button>
      </div>
    </aside>
  );
}

function InspectorSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="lineage-inspector-section">
      <h4>{title}</h4>
      {children}
    </section>
  );
}

function InspectorField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="lineage-inspector-field">
      <span>{label}</span>
      <strong title={value}>{value || "not available"}</strong>
    </div>
  );
}

function ArtifactWarningRail({ warnings }: { warnings: string[] }) {
  return (
    <section className="lineage-warning-rail" aria-label="Generated artifact warnings">
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
      shortLabel: shortArtifactClassLabel(artifactClass),
      count: artifacts.length,
      known: artifacts.filter((artifact) => artifact.known_status === "known").length,
      unknown: artifacts.filter((artifact) => artifact.known_status === "unknown").length,
      previewable: artifacts.filter((artifact) => artifact.preview_status === "previewable").length,
      notPreviewable: artifacts.filter((artifact) => artifact.preview_status !== "previewable").length,
      reviewReady: artifacts.filter((artifact) => reviewState(artifact) === "ready").length,
      listedOnly: artifacts.filter((artifact) => reviewState(artifact) === "listed").length,
      integrationFacing: artifacts.filter((artifact) =>
        artifact.artifact_class === "runtime" || artifact.artifact_class === "ground",
      ).length,
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

function artifactMatchesQueue(
  artifact: ClassifiedGeneratedArtifactEntry,
  queue: ArtifactQueue,
): boolean {
  switch (queue) {
    case "all":
      return true;
    case "review":
      return artifact.preview_status === "previewable";
    case "integration":
      return artifact.artifact_class === "runtime" || artifact.artifact_class === "ground";
    case "unknown":
      return artifact.known_status === "unknown";
  }
}

function reviewState(artifact: ClassifiedGeneratedArtifactEntry): "ready" | "review" | "listed" {
  if (artifact.known_status === "unknown") {
    return "review";
  }

  if (artifact.preview_status === "previewable") {
    return "ready";
  }

  return "listed";
}

function reviewStateLabel(artifact: ClassifiedGeneratedArtifactEntry): string {
  switch (reviewState(artifact)) {
    case "ready":
      return "Ready for review";
    case "review":
      return "Needs review";
    case "listed":
      return "Listed only";
  }
}

function artifactTypeLabel(artifact: ClassifiedGeneratedArtifactEntry): string {
  if (artifact.artifact_class === "reports" && artifact.name.endsWith("_report.json")) {
    return "Simulation report";
  }

  if (artifact.artifact_class === "reports" && artifact.name.includes("coverage")) {
    return "Coverage summary";
  }

  if (artifact.artifact_class === "reports" && artifact.name.includes("entity_index")) {
    return "Entity index";
  }

  if (artifact.artifact_class === "reports" && artifact.name.includes("relationship")) {
    return "Relationship manifest";
  }

  if (artifact.artifact_class === "docs") {
    return "Reference doc";
  }

  if (artifact.artifact_class === "runtime") {
    return "Runtime artifact";
  }

  if (artifact.artifact_class === "ground") {
    return "Ground artifact";
  }

  if (artifact.artifact_class === "logs") {
    return "System log";
  }

  return "Generated artifact";
}

function artifactFamilyIcon(artifactClass: GeneratedArtifactClass): StudioIconKind {
  switch (artifactClass) {
    case "reports":
      return "reports";
    case "docs":
      return "docs";
    case "runtime":
      return "runtime";
    case "ground":
      return "ground";
    case "logs":
      return "reports";
    case "unknown":
      return "unknown";
  }
}

function formatArtifactClass(artifactClass: GeneratedArtifactClass): string {
  switch (artifactClass) {
    case "reports":
      return "Reports";
    case "logs":
      return "Logs";
    case "docs":
      return "Docs";
    case "runtime":
      return "Runtime";
    case "ground":
      return "Ground";
    case "unknown":
      return "Unknown";
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
      return "Documented Core path";
    case "documentedCoreFileName":
      return "Documented Core filename";
    case "manifestField":
      return "Manifest field";
    case "unknown":
      return "Unknown";
  }
}

function formatCompactPath(value: string | null | undefined): string {
  if (!value) {
    return "not available";
  }

  const normalized = value.replace(/\\/g, "/");
  const parts = normalized.split("/").filter(Boolean);

  if (parts.length === 0) {
    return normalized;
  }

  const finalSegment = parts[parts.length - 1];
  const parentSegment = parts.length > 1 ? parts[parts.length - 2] : null;

  if (finalSegment === "generated" && parentSegment) {
    return `${parentSegment}/generated`;
  }

  return finalSegment;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function percent(value: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function formatPreviewExcerpt(content: string): string {
  if (content.length <= 1800) {
    return content;
  }

  return `${content.slice(0, 1800)}\n... preview truncated`;
}
