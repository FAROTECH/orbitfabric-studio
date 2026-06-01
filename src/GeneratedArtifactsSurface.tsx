import { GeneratedArtifactExplorerPanel } from "./GeneratedArtifactExplorer";
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
      className="active-surface-frame generated-artifacts-surface generated-artifact-deck-surface"
      aria-label="Generated Artifact Constellation Deck"
    >
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
