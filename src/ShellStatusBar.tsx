import type { ActiveSurface, TargetDomainId } from "./navigationModel";
import type { CoreCommandResult, WorkspaceInspection } from "./types/workspace";

import "./shellStatusBar.css";

export interface ShellStatusBarProps {
  workspace: WorkspaceInspection | null;
  activeSurface: ActiveSurface;
  activeNavigationId: TargetDomainId;
  coreResult: CoreCommandResult | null;
}

export function ShellStatusBar({
  workspace,
  activeSurface,
  activeNavigationId,
  coreResult,
}: ShellStatusBarProps) {
  const workspacePath = workspace?.selected_path ?? "No workspace";
  const coreCommandState = coreResult
    ? coreResult.success
      ? "OK"
      : "FAIL"
    : "Idle";

  return (
    <footer className="shell-status-bar reference-status-bar" aria-label="Studio shell status bar">
      <div className="reference-status-workspace reference-status-real" title={workspacePath}>
        <span className="reference-status-dot reference-status-dot-real" aria-hidden="true" />
        <strong>Workspace</strong>
        <span>{workspacePath}</span>
      </div>

      <PreviewStatusItem label="Model Version" value="Not wired" />
      <PreviewStatusItem label="Schema" value="Not wired" />

      <div className="reference-status-item reference-status-preview-item">
        <span aria-hidden="true">⌁</span>
        <strong>main</strong>
        <small>Preview</small>
      </div>

      <div className="reference-status-item reference-status-preview-item">
        <span aria-hidden="true">▣</span>
        <strong>Auto-save not wired</strong>
        <small>Preview</small>
      </div>

      <div className="reference-status-item reference-status-surface reference-status-real">
        <span>Surface</span>
        <strong>{formatActiveSurface(activeSurface, activeNavigationId)}</strong>
      </div>

      <div className="reference-status-item reference-status-cache reference-status-preview-item">
        <span aria-hidden="true">▤</span>
        <strong>Local Cache</strong>
        <small>Preview</small>
        <em>{coreCommandState}</em>
      </div>

      <div className="reference-status-bell reference-status-preview-item" aria-label="Notifications preview">
        ♢
        <small>Preview</small>
      </div>
    </footer>
  );
}

function PreviewStatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="reference-status-item reference-status-preview-item">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>Preview</small>
    </div>
  );
}

function formatActiveSurface(activeSurface: ActiveSurface, activeNavigationId: TargetDomainId): string {
  switch (activeSurface) {
    case "mission-dashboard":
      return "Mission";
    case "model-inventory":
      return formatModelInventorySurface(activeNavigationId);
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

function formatModelInventorySurface(activeNavigationId: TargetDomainId): string {
  switch (activeNavigationId) {
    case "spacecraft":
      return "Spacecraft";
    case "subsystems":
      return "Subsystems";
    case "modes":
      return "Modes";
    case "telemetry":
      return "Telemetry";
    case "commands":
      return "Commands";
    case "events":
      return "Events";
    case "faults":
      return "Faults";
    case "packets":
      return "Packets";
    case "payloads":
      return "Payloads";
    case "data-products":
      return "Data Products";
    case "contacts-downlink":
      return "Contacts & Downlink";
    case "commandability":
      return "Commandability";
    case "autonomy":
      return "Autonomy";
    default:
      return "Model";
  }
}
