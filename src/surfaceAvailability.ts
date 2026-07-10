import type { ActiveSurface } from "./navigationModel";
import type { WorkspaceInspection } from "./types/workspace";

export function createSurfaceAvailability(
  workspace: WorkspaceInspection | null,
): Record<ActiveSurface, boolean> {
  return {
    "mission-dashboard": true,
    "mission-data-flow-workbench": Boolean(workspace),
    "model-inventory": Boolean(workspace && workspace.source_model_files.length > 0),
    "core-commands": Boolean(workspace),
    contracts: false,
    relationships: false,
    "generated-artifacts": Boolean(workspace),
    "reports-logs": false,
    "scenario-evidence": Boolean(workspace),
    "ground-integration": false,
    "raw-output": false,
  };
}
