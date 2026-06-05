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
    label: "Validate Mission",
    shortLabel: "Validate",
    icon: "▣",
    targetSurface: "core-commands",
    status: "diagnostic",
    requiredWorkspaceState: "mission",
    description:
      "Open the controlled Core diagnostic surface for fixed validation and report refresh actions. Studio does not modify Mission Model source files.",
  },
  {
    id: "run-scenarios",
    label: "Run Scenarios",
    shortLabel: "Scenarios",
    icon: "▷",
    targetSurface: "scenario-evidence",
    status: "available",
    requiredWorkspaceState: "workspace",
    description:
      "Open the scenario evidence surface. Scenario execution remains limited to the fixed Core wrapper.",
  },
  {
    id: "generate-docs",
    label: "Generate Docs",
    shortLabel: "Docs",
    icon: "▤",
    targetSurface: "generated-artifacts",
    status: "available",
    requiredWorkspaceState: "workspace",
    description:
      "Open generated artifacts for documentation output inspection. Studio remains read-only.",
  },
  {
    id: "generate-runtime-skeleton",
    label: "Generate Runtime Skeleton",
    shortLabel: "Runtime",
    icon: "</>",
    targetSurface: "generated-artifacts",
    status: "available",
    requiredWorkspaceState: "workspace",
    description:
      "Open generated artifacts for runtime skeleton output inspection. Studio remains read-only.",
  },
  {
    id: "generate-ground-artifacts",
    label: "Generate Ground Artifacts",
    shortLabel: "Ground",
    icon: "⌁",
    targetSurface: "ground-integration",
    status: "available",
    requiredWorkspaceState: "workspace",
    description:
      "Open ground-facing generated artifacts. Studio remains read-only.",
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
