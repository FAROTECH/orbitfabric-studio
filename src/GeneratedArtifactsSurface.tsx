import { GeneratedArtifactExplorerPanel } from "./GeneratedArtifactExplorer";
import { ProvenanceBadge, StatusBadge } from "./Badges";
import type {
  GeneratedArtifactDashboardSummary,
  GeneratedArtifactInspectorItem,
  GeneratedEvidenceArtifactSummary,
} from "./GeneratedArtifactExplorer";
import type { WorkspaceInspection } from "./types/workspace";

export function GeneratedArtifactsSurface({
  workspace,
  refreshToken,
  onDashboardSummaryChange,
  onArtifactSelectionChange,
  onEvidenceArtifactSummaryChange,
}: {
  workspace: WorkspaceInspection;
  refreshToken: number;
  onDashboardSummaryChange: (
    summary: GeneratedArtifactDashboardSummary | null,
  ) => void;
  onArtifactSelectionChange: (
    artifact: GeneratedArtifactInspectorItem | null,
  ) => void;
  onEvidenceArtifactSummaryChange: (
    summary: GeneratedEvidenceArtifactSummary | null,
  ) => void;
}) {
  return (
    <section
      className="active-surface-frame generated-artifacts-surface"
      aria-label="Generated Artifacts"
    >
      <div className="file-viewer-header">
        <div>
          <span className="cockpit-eyebrow">Dedicated surface</span>
          <h2>Generated Artifacts</h2>
          <p>
            Compact read-only surface for Core-derived files already present under
            the workspace generated directory. Studio inspects artifact identity,
            class and preview status without editing files or inferring Mission
            Model semantics from generated output.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="GENERATED" />
          <ProvenanceBadge label="READ-ONLY" />
          <StatusBadge label="DEDICATED SURFACE" />
        </div>
      </div>

      <GeneratedArtifactExplorerPanel
        workspacePath={workspace.selected_path}
        refreshToken={refreshToken}
        onDashboardSummaryChange={onDashboardSummaryChange}
        onArtifactSelectionChange={onArtifactSelectionChange}
        onEvidenceArtifactSummaryChange={onEvidenceArtifactSummaryChange}
      />
    </section>
  );
}
