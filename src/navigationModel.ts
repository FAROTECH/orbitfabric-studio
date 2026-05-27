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
  targetId: string;
  icon: NavigationIconKind;
  caption: string;
}

export const targetDomainNavigationItems: readonly TargetDomainNavigationItem[] = [
  {
    id: "mission",
    label: "Mission",
    status: "available",
    destinationSurface: "mission-dashboard",
    targetId: "studio-dashboard",
    icon: "mission",
    caption: "Mission cockpit",
  },
  {
    id: "spacecraft",
    label: "Spacecraft",
    status: "reserved",
    destinationSurface: "model-inventory",
    targetId: "studio-model",
    icon: "model",
    caption: "Domain reserved",
  },
  {
    id: "subsystems",
    label: "Subsystems",
    status: "reserved",
    destinationSurface: "model-inventory",
    targetId: "studio-model",
    icon: "model",
    caption: "Domain reserved",
  },
  {
    id: "modes",
    label: "Modes",
    status: "reserved",
    destinationSurface: "model-inventory",
    targetId: "studio-model",
    icon: "model",
    caption: "Domain reserved",
  },
  {
    id: "telemetry",
    label: "Telemetry",
    status: "reserved",
    destinationSurface: "model-inventory",
    targetId: "studio-model",
    icon: "model",
    caption: "Domain reserved",
  },
  {
    id: "commands",
    label: "Commands",
    status: "reserved",
    destinationSurface: "model-inventory",
    targetId: "studio-model",
    icon: "model",
    caption: "Domain reserved",
  },
  {
    id: "events",
    label: "Events",
    status: "reserved",
    destinationSurface: "model-inventory",
    targetId: "studio-model",
    icon: "model",
    caption: "Domain reserved",
  },
  {
    id: "faults",
    label: "Faults",
    status: "reserved",
    destinationSurface: "model-inventory",
    targetId: "studio-model",
    icon: "model",
    caption: "Domain reserved",
  },
  {
    id: "packets",
    label: "Packets",
    status: "reserved",
    destinationSurface: "model-inventory",
    targetId: "studio-model",
    icon: "model",
    caption: "Domain reserved",
  },
  {
    id: "payloads",
    label: "Payloads",
    status: "reserved",
    destinationSurface: "model-inventory",
    targetId: "studio-model",
    icon: "model",
    caption: "Domain reserved",
  },
  {
    id: "data-products",
    label: "Data Products",
    status: "reserved",
    destinationSurface: "model-inventory",
    targetId: "studio-model",
    icon: "model",
    caption: "Domain reserved",
  },
  {
    id: "contacts-downlink",
    label: "Contacts & Downlink",
    status: "reserved",
    destinationSurface: "model-inventory",
    targetId: "studio-model",
    icon: "model",
    caption: "Domain reserved",
  },
  {
    id: "commandability",
    label: "Commandability",
    status: "reserved",
    destinationSurface: "model-inventory",
    targetId: "studio-model",
    icon: "model",
    caption: "Domain reserved",
  },
  {
    id: "autonomy",
    label: "Autonomy",
    status: "reserved",
    destinationSurface: "model-inventory",
    targetId: "studio-model",
    icon: "model",
    caption: "Domain reserved",
  },
  {
    id: "scenarios",
    label: "Scenarios",
    status: "available",
    destinationSurface: "scenario-evidence",
    targetId: "studio-evidence",
    icon: "evidence",
    caption: "Scenario evidence",
  },
  {
    id: "generated-artifacts",
    label: "Generated Artifacts",
    status: "available",
    destinationSurface: "generated-artifacts",
    targetId: "studio-artifacts",
    icon: "artifacts",
    caption: "Generated outputs",
  },
] as const;

export const shellSurfaceItems: readonly ShellSurfaceItem[] =
  targetDomainNavigationItems.map((item) => ({
    label: item.label,
    status: item.status,
    targetId: item.targetId,
    surface: item.destinationSurface,
    icon: item.icon,
    caption: item.caption,
  }));

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
