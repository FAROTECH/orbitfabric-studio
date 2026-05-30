import type { ActiveSurface, NavigationItemStatus } from "./navigationModel";

export type ShellCommandBarActionId =
  | "validate-mission"
  | "inspect-data-flow"
  | "inspect-scenarios"
  | "inspect-artifacts"
  | "inspect-model";

export interface ShellCommandBarAction {
  id: ShellCommandBarActionId;
  label: string;
  shortLabel: string;
  targetSurface: ActiveSurface;
  status: NavigationItemStatus;
  requiredWorkspaceState: "workspace" | "mission";
  description: string;
}

export const shellCommandBarActions: readonly ShellCommandBarAction[] = [
  {
    id: "validate-mission",
    label: "Refresh Core-derived Reports",
    shortLabel: "Refresh Core",
    targetSurface: "core-commands",
    status: "diagnostic",
    requiredWorkspaceState: "mission",
    description:
      "Open the controlled Core diagnostic surface for fixed validation and report refresh actions. Studio does not modify Mission Model source files.",
  },
  {
    id: "inspect-data-flow",
    label: "Inspect Data Flow",
    shortLabel: "Data Flow",
    targetSurface: "mission-data-flow-workbench",
    status: "available",
    requiredWorkspaceState: "workspace",
    description:
      "Open the read-only Mission Data Flow Workbench. Studio renders Core-reported relationships and evidence without private inference.",
  },
  {
    id: "inspect-scenarios",
    label: "Inspect Scenarios",
    shortLabel: "Scenarios",
    targetSurface: "scenario-evidence",
    status: "available",
    requiredWorkspaceState: "workspace",
    description:
      "Open the scenario evidence surface. Scenario execution remains limited to the fixed Core wrapper.",
  },
  {
    id: "inspect-artifacts",
    label: "Inspect Artifacts",
    shortLabel: "Artifacts",
    targetSurface: "generated-artifacts",
    status: "available",
    requiredWorkspaceState: "workspace",
    description:
      "Open the generated artifact explorer for read-only generated output inspection.",
  },
  {
    id: "inspect-model",
    label: "Inspect Model",
    shortLabel: "Model",
    targetSurface: "model-inventory",
    status: "available",
    requiredWorkspaceState: "workspace",
    description:
      "Open the structural model inventory. Studio does not parse Mission Model YAML semantically.",
  },
] as const;

export function isShellCommandBarActionEnabled(
  action: ShellCommandBarAction,
  availability: { workspaceAvailable: boolean; missionAvailable: boolean },
): boolean {
  if (action.requiredWorkspaceState === "mission") {
    return availability.missionAvailable;
  }

  return availability.workspaceAvailable;
}
