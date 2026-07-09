import { ShellCommandActions } from "./ShellCommandActions";
import { StudioIcon } from "./StudioIcon";
import type { ActiveSurface } from "./navigationModel";
import type { WorkspaceInspection } from "./types/workspace";

export function WorkspaceHeader({
  workspace,
  activeSurface,
  isOpening,
  onOpenWorkspace,
  onActiveSurfaceChange,
}: {
  workspace: WorkspaceInspection | null;
  activeSurface: ActiveSurface;
  isOpening: boolean;
  onOpenWorkspace: () => void;
  onActiveSurfaceChange: (surface: ActiveSurface) => void;
}) {
  const workspaceName = workspace?.selected_path
    ? workspace.selected_path.split(/[\\/]/).filter(Boolean).slice(-1)[0]
    : "No workspace";

  return (
    <header
      className={[
        "workspace-header",
        "cockpit-command-bar",
        "reference-command-bar",
        !workspace ? "reference-command-bar-empty" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Workspace command bar"
    >
      <div className="reference-command-left">
        <div className="reference-product-title" aria-label="OrbitFabric Studio">
          <strong>OrbitFabric</strong>
          <span>Studio</span>
        </div>
      </div>

      {workspace ? (
        <button
          type="button"
          className="reference-project-switcher"
          onClick={onOpenWorkspace}
          disabled={isOpening}
          title={workspace.selected_path}
          aria-label="Project workspace switcher"
        >
          <span>Project</span>
          <strong>{isOpening ? "Opening" : workspaceName}</strong>
          <StudioIcon kind="chevron-down" className="reference-project-switcher-icon" />
        </button>
      ) : null}

      <ShellCommandActions
        workspace={workspace}
        activeSurface={activeSurface}
        onActiveSurfaceChange={onActiveSurfaceChange}
      />

      <div className="reference-command-icons" aria-label="Studio utilities">
        <button type="button" className="reference-icon-button" title="Help" aria-label="Help">
          <StudioIcon kind="help" />
        </button>
        <button type="button" className="reference-icon-button" title="Settings" aria-label="Settings">
          <StudioIcon kind="settings" />
        </button>
        <button type="button" className="reference-icon-button" title="Profile" aria-label="Profile">
          <StudioIcon kind="profile" />
        </button>
      </div>
    </header>
  );
}
