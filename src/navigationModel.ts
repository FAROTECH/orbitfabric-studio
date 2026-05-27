export type ActiveSurface =
  | "mission-dashboard"
  | "model-inventory"
  | "core-commands"
  | "contracts"
  | "relationships"
  | "generated-artifacts"
  | "reports-logs"
  | "scenario-evidence"
  | "ground-integration"
  | "raw-output";

export type NavigationItemStatus =
  | "available"
  | "unavailable"
  | "reserved"
  | "diagnostic";

export type NavigationIconKind =
  | "mission"
  | "validation"
  | "model"
  | "scenario"
  | "coverage"
  | "artifacts"
  | "evidence"
  | "shield"
  | "core"
  | "contracts"
  | "relationships"
  | "reports"
  | "ground"
  | "raw";

export interface ShellSurfaceItem {
  label: string;
  status: NavigationItemStatus;
  targetId: string;
  surface: ActiveSurface;
  icon: NavigationIconKind;
  caption: string;
}

export const shellSurfaceItems: readonly ShellSurfaceItem[] = [
  {
    label: "Mission",
    status: "available",
    targetId: "studio-dashboard",
    surface: "mission-dashboard",
    icon: "mission",
    caption: "Mission cockpit",
  },
  {
    label: "Model",
    status: "available",
    targetId: "studio-model",
    surface: "model-inventory",
    icon: "model",
    caption: "Model inventory",
  },
  {
    label: "Core",
    status: "diagnostic",
    targetId: "studio-validation",
    surface: "core-commands",
    icon: "core",
    caption: "Core commands",
  },
  {
    label: "Contracts",
    status: "available",
    targetId: "studio-contracts",
    surface: "contracts",
    icon: "contracts",
    caption: "Contract reports",
  },
  {
    label: "Relations",
    status: "available",
    targetId: "studio-relationships",
    surface: "relationships",
    icon: "relationships",
    caption: "Relationship data",
  },
  {
    label: "Artifacts",
    status: "available",
    targetId: "studio-artifacts",
    surface: "generated-artifacts",
    icon: "artifacts",
    caption: "Generated files",
  },
  {
    label: "Reports",
    status: "diagnostic",
    targetId: "studio-reports-logs",
    surface: "reports-logs",
    icon: "reports",
    caption: "Reports and logs",
  },
  {
    label: "Evidence",
    status: "available",
    targetId: "studio-evidence",
    surface: "scenario-evidence",
    icon: "evidence",
    caption: "Scenario evidence",
  },
  {
    label: "Ground",
    status: "available",
    targetId: "studio-ground",
    surface: "ground-integration",
    icon: "ground",
    caption: "Ground artifacts",
  },
  {
    label: "Raw",
    status: "diagnostic",
    targetId: "studio-raw-output",
    surface: "raw-output",
    icon: "raw",
    caption: "Raw output",
  },
] as const;

export interface ReservedSurfaceItem {
  id: string;
  title: string;
  milestone: string;
  summary: string;
  allowed: readonly string[];
  forbidden: readonly string[];
}

export const reservedSurfaceItems: readonly ReservedSurfaceItem[] = [
  {
    id: "studio-reserved-ground",
    title: "Ground Integration Artifact Viewer",
    milestone: "v0.8.0",
    summary:
      "Reserved for inspecting generated ground-facing artifacts without becoming a ground segment.",
    allowed: [
      "Inspect generated ground-facing artifacts",
      "Preview supported generated text artifacts",
      "Explain generated artifact provenance",
      "Keep ground artifacts read-only",
    ],
    forbidden: [
      "No command uplink",
      "No telemetry archive",
      "No live decoder behavior",
      "No ground segment operations",
    ],
  },
] as const;

export type TargetDomainId =
  | "mission"
  | "spacecraft"
  | "subsystems"
  | "modes"
  | "telemetry"
  | "commands"
  | "events"
  | "faults"
  | "packets"
  | "payloads"
  | "data-products"
  | "contacts-downlink"
  | "commandability"
  | "autonomy"
  | "scenarios"
  | "generated-artifacts";

export interface TargetDomainNavigationItem {
  id: TargetDomainId;
  label: string;
  status: NavigationItemStatus;
  destinationSurface: ActiveSurface;
  caption: string;
}

export const targetDomainNavigationItems: readonly TargetDomainNavigationItem[] = [
  {
    id: "mission",
    label: "Mission",
    status: "available",
    destinationSurface: "mission-dashboard",
    caption: "Mission cockpit",
  },
  {
    id: "spacecraft",
    label: "Spacecraft",
    status: "reserved",
    destinationSurface: "model-inventory",
    caption: "Domain surface planned",
  },
  {
    id: "subsystems",
    label: "Subsystems",
    status: "reserved",
    destinationSurface: "model-inventory",
    caption: "Domain surface planned",
  },
  {
    id: "modes",
    label: "Modes",
    status: "reserved",
    destinationSurface: "model-inventory",
    caption: "Domain surface planned",
  },
  {
    id: "telemetry",
    label: "Telemetry",
    status: "reserved",
    destinationSurface: "model-inventory",
    caption: "Domain surface planned",
  },
  {
    id: "commands",
    label: "Commands",
    status: "reserved",
    destinationSurface: "model-inventory",
    caption: "Domain surface planned",
  },
  {
    id: "events",
    label: "Events",
    status: "reserved",
    destinationSurface: "model-inventory",
    caption: "Domain surface planned",
  },
  {
    id: "faults",
    label: "Faults",
    status: "reserved",
    destinationSurface: "model-inventory",
    caption: "Domain surface planned",
  },
  {
    id: "packets",
    label: "Packets",
    status: "reserved",
    destinationSurface: "model-inventory",
    caption: "Domain surface planned",
  },
  {
    id: "payloads",
    label: "Payloads",
    status: "reserved",
    destinationSurface: "model-inventory",
    caption: "Domain surface planned",
  },
  {
    id: "data-products",
    label: "Data Products",
    status: "reserved",
    destinationSurface: "model-inventory",
    caption: "Domain surface planned",
  },
  {
    id: "contacts-downlink",
    label: "Contacts & Downlink",
    status: "reserved",
    destinationSurface: "model-inventory",
    caption: "Domain surface planned",
  },
  {
    id: "commandability",
    label: "Commandability",
    status: "reserved",
    destinationSurface: "model-inventory",
    caption: "Domain surface planned",
  },
  {
    id: "autonomy",
    label: "Autonomy",
    status: "reserved",
    destinationSurface: "model-inventory",
    caption: "Domain surface planned",
  },
  {
    id: "scenarios",
    label: "Scenarios",
    status: "available",
    destinationSurface: "scenario-evidence",
    caption: "Scenario evidence",
  },
  {
    id: "generated-artifacts",
    label: "Generated Artifacts",
    status: "available",
    destinationSurface: "generated-artifacts",
    caption: "Generated outputs",
  },
] as const;
