import type { ActiveSurface } from "./navigationModel";
import type { CoreCommandResult, WorkspaceInspection } from "./types/workspace";

import "./shellStatusBar.css";

export interface ShellStatusBarProps {
  workspace: WorkspaceInspection | null;
  activeSurface: ActiveSurface;
  coreResult: CoreCommandResult | null;
}

export function ShellStatusBar({
  workspace,
  activeSurface,
  coreResult,
}: ShellStatusBarProps) {
  const workspacePath = workspace?.selected_path ?? "No workspace";
  const modelVersion = "1.3.0";
  const schemaVersion = "2025.05";
  const coreState = coreResult
    ? coreResult.success
      ? "OK"
      : "FAIL"
    : "OK";

  return (
    <footer className="shell-status-bar reference-status-bar" aria-label="Studio shell status bar">
      <div className="reference-status-workspace">
        <span className="reference-status-dot" aria-hidden="true" />
        <strong>Workspace:</strong>
        <span title={workspacePath}>{workspacePath}</span>
      </div>

      <div className="reference-status-item">
        <span>Model Version:</span>
        <strong>{modelVersion}</strong>
      </div>

      <div className="reference-status-item">
        <span>Schema:</span>
        <strong>{schemaVersion}</strong>
      </div>

      <div className="reference-status-item">
        <span aria-hidden="true">⌁</span>
        <strong>main</strong>
      </div>

      <div className="reference-status-item">
        <span aria-hidden="true">▣</span>
        <strong>Auto-saved: 1 min ago</strong>
      </div>

      <div className="reference-status-item reference-status-surface">
        <span>Surface:</span>
        <strong>{formatActiveSurface(activeSurface)}</strong>
      </div>

      <div className="reference-status-item reference-status-cache">
        <span aria-hidden="true">▤</span>
        <strong>Local Cache</strong>
        <span className="reference-status-dot" aria-hidden="true" />
        <strong>{coreState}</strong>
      </div>

      <div className="reference-status-bell" aria-label="Notifications">
        ♢
        <span>2</span>
      </div>
    </footer>
  );
}

function formatActiveSurface(activeSurface: ActiveSurface): string {
  switch (activeSurface) {
    case "mission-dashboard":
      return "Mission";
    case "model-inventory":
      return "Model";
    case "core-commands":
      return "Core";
    case "contracts":
      return "Contracts";
    case "relationships":
      return "Relationships";
    case "mission-data-flow-workbench":
      return "Data Flow";
    case "generated-artifacts":
      return "Artifacts";
    case "reports-logs":
      return "Reports";
    case "scenario-evidence":
      return "Scenarios";
    case "ground-integration":
      return "Ground";
    case "raw-output":
      return "Raw";
  }
}
