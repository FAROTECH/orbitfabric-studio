import { shellCommandBarActions } from "./shellCommandBarModel";
import type { ActiveSurface } from "./navigationModel";
import type { WorkspaceInspection } from "./types/workspace";

export interface ShellCommandActionsProps {
  workspace: WorkspaceInspection | null;
  activeSurface: ActiveSurface;
  onActiveSurfaceChange: (surface: ActiveSurface) => void;
}

export function ShellCommandActions({
  workspace,
  activeSurface,
  onActiveSurfaceChange,
}: ShellCommandActionsProps) {
  if (!workspace) {
    return null;
  }

  const availability = {
    workspaceAvailable: Boolean(workspace),
    missionAvailable: Boolean(workspace?.mission_dir),
  };

  return (
    <div className="cockpit-command-actions reference-command-actions" aria-label="Controlled shell actions">
      {shellCommandBarActions.map((action) => {
        const isActive = activeSurface === action.targetSurface;
        const isEnabled =
          action.requiredWorkspaceState === "mission"
            ? availability.missionAvailable
            : availability.workspaceAvailable;

        return (
          <button
            type="button"
            className={`cockpit-command-chip cockpit-command-button reference-command-action ${
              isActive ? "cockpit-command-button-active reference-command-action-active" : ""
            }`}
            disabled={!isEnabled}
            key={action.id}
            onClick={() => onActiveSurfaceChange(action.targetSurface)}
            aria-current={isActive ? "page" : undefined}
            title={action.description}
          >
            <span aria-hidden="true">{action.icon}</span>
            {action.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
