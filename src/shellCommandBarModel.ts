import type { ActiveSurface, NavigationItemStatus } from "./navigationModel";

export type ShellCommandBarActionId =
  | "validate-mission"
  | "run-scenarios"
  | "generate-docs"
  | "generate-runtime-skeleton"
  | "generate-ground-artifacts";

export interface ShellCommandBarAction {
  id: ShellCommandBarActionId;
  label: string;
  shortLabel: string;
  icon: string;
  targetSurface: ActiveSurface;
  status: NavigationItemStatus;
  requiredWorkspaceState: "workspace" | "mission";
  description: string;
}

export const shellCommandBarActions: readonly ShellCommandBarAction[] = [
  {
    id: "validate-mission",
    label: "Inspect Core Reports",
    shortLabel: "Core",
    icon: "▣",
    targetSurface: "core-commands",
    status: "diagnostic",
    requiredWorkspaceState: "mission",
    description:
      "Open the Core Report Runner for fixed Core-owned report actions. Studio does not expose a shell and does not modify Mission Model source files.",
  },
  {
    id: "run-scenarios",
    label: "Inspect Scenario Evidence",
    shortLabel: "Scenarios",
    icon: "▷",
    targetSurface: "scenario-evidence",
    status: "available",
    requiredWorkspaceState: "workspace",
    description:
      "Open the scenario evidence cockpit. Any scenario execution remains limited to fixed Core wrappers.",
  },
  {
    id: "generate-docs",
    label: "Inspect Generated Artifacts",
    shortLabel: "Artifacts",
    icon: "▤",
    targetSurface: "generated-artifacts",
    status: "available",
    requiredWorkspaceState: "workspace",
    description:
      "Open generated artifacts for read-only inspection of Core-generated outputs.",
  },
  {
    id: "generate-runtime-skeleton",
    label: "Inspect Runtime Artifacts",
    shortLabel: "Runtime",
    icon: "</>",
    targetSurface: "generated-artifacts",
    status: "available",
    requiredWorkspaceState: "workspace",
    description:
      "Open generated artifacts and inspect runtime-facing outputs when Core reports them.",
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
