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
  const workspaceName = workspace?.selected_path
    ? workspace.selected_path.split(/[\\/]/).filter(Boolean).slice(-1)[0]
    : "No workspace";

  const missionState = workspace?.mission_dir ? "mission detected" : "mission unavailable";
  const generatedLocations = workspace?.generated_locations.length ?? 0;
  const sourceFiles = workspace?.source_model_files.length ?? 0;
  const scenarioSources = workspace?.scenario_files.length ?? 0;
  const lastCoreResult = coreResult
    ? coreResult.success
      ? "last Core command succeeded"
      : "last Core command failed"
    : "no Core command run";

  return (
    <footer className="shell-status-bar" aria-label="Studio shell status bar">
      <div className="shell-status-primary">
        <span className="shell-status-kicker">Mission shell</span>
        <strong>{workspaceName}</strong>
      </div>

      <div className="shell-status-strip" aria-label="Workspace status">
        <ShellStatusItem label="Surface" value={formatActiveSurface(activeSurface)} />
        <ShellStatusItem label="Mission" value={missionState} />
        <ShellStatusItem label="Sources" value={`${sourceFiles} source files`} />
        <ShellStatusItem label="Scenarios" value={`${scenarioSources} scenario files`} />
        <ShellStatusItem label="Generated" value={`${generatedLocations} locations`} />
        <ShellStatusItem label="Core" value={lastCoreResult} />
      </div>

      <div className="shell-status-boundary" aria-label="Studio safety boundary">
        <span>read-only</span>
        <span>Core-derived</span>
        <span>no uplink</span>
        <span>no live telemetry</span>
      </div>
    </footer>
  );
}

function ShellStatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="shell-status-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatActiveSurface(activeSurface: ActiveSurface): string {
  switch (activeSurface) {
    case "mission-dashboard":
      return "Mission";
    case "model-inventory":
      return "Model inventory";
    case "core-commands":
      return "Core commands";
    case "contracts":
      return "Contracts";
    case "relationships":
      return "Relationships";
    case "generated-artifacts":
      return "Generated artifacts";
    case "reports-logs":
      return "Reports and logs";
    case "scenario-evidence":
      return "Scenarios";
    case "ground-integration":
      return "Ground artifacts";
    case "raw-output":
      return "Raw output";
  }
}
