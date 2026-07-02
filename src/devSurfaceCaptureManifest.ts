import type { ActiveSurface, TargetDomainId } from "./navigationModel";

export type DevSurfaceCaptureMode = "current-window" | "fullscreen";

export type DevSurfaceCaptureProfileId =
  | "desktop-reference-1440x900"
  | "desktop-fullscreen";

export interface DevSurfaceCaptureTargetSpec {
  label: string;
  slug: string;
  activeSurface: ActiveSurface;
  activeNavigationId?: TargetDomainId;
  shellSelector: string;
  targetSelector: string;
  requiredProfiles: readonly DevSurfaceCaptureProfileId[];
  notes: string;
}

export interface DevSurfaceCaptureProfile {
  id: DevSurfaceCaptureProfileId;
  label: string;
  viewport: string;
  mode: DevSurfaceCaptureMode;
  required: boolean;
  notes: string;
}

export const DEV_SURFACE_CAPTURE_MANIFEST_VERSION = "E28-final-studio-visual-closure";

export const DEV_SURFACE_CAPTURE_PROFILES: readonly DevSurfaceCaptureProfile[] = [
  {
    id: "desktop-reference-1440x900",
    label: "Desktop reference window",
    viewport: "1440x900 nominal host window; Tauri content viewport may be smaller after chrome/status bars",
    mode: "current-window",
    required: true,
    notes:
      "Final compact desktop closure profile after E15R-E27 visual hardening. Use only for sanity when fullscreen closure already passes.",
  },
  {
    id: "desktop-fullscreen",
    label: "Desktop fullscreen",
    viewport: "Current monitor fullscreen; validated at 1920x1080 during E4.5 baseline",
    mode: "current-window",
    required: true,
    notes:
      "Final closure capture profile for all public Studio surfaces. Enter fullscreen manually, then press SURFACE/Capture.",
  },
];

export const DEV_SURFACE_CAPTURE_TARGETS: readonly DevSurfaceCaptureTargetSpec[] = [
  {
    label: "Mission Overview",
    slug: "mission-overview",
    activeSurface: "mission-dashboard",
    shellSelector: ".main-surface",
    targetSelector: ".mission-target",
    requiredProfiles: ["desktop-reference-1440x900", "desktop-fullscreen"],
    notes: "E28 closure target. Validate final hero/header, shell/sidebar, status bar and surface grammar.",
  },
  {
    label: "Core Report Runner",
    slug: "core-report-runner",
    activeSurface: "core-commands",
    shellSelector: ".main-surface-core-report-runner",
    targetSelector: ".core-report-runner-surface",
    requiredProfiles: ["desktop-reference-1440x900", "desktop-fullscreen"],
    notes: "E28 closure target. Validate Core runner grammar, icon system and status bar contract.",
  },
  {
    label: "Data Products",
    slug: "data-products",
    activeSurface: "model-inventory",
    activeNavigationId: "data-products",
    shellSelector: ".main-surface-data-products",
    targetSelector: ".data-products-cockpit-surface",
    requiredProfiles: ["desktop-reference-1440x900", "desktop-fullscreen"],
    notes: "E28 closure target. Validate data product cockpit, selected/read-only semantics and icon registry.",
  },
  {
    label: "Scenarios",
    slug: "scenarios",
    activeSurface: "scenario-evidence",
    shellSelector: ".main-surface-scenario-evidence",
    targetSelector: ".scenario-evidence-cockpit",
    requiredProfiles: ["desktop-reference-1440x900", "desktop-fullscreen"],
    notes: "E28 closure target. Validate scenario evidence cockpit, sidebar parity, scroll model and icon registry.",
  },
  {
    label: "Generated Artifacts",
    slug: "generated-artifacts",
    activeSurface: "generated-artifacts",
    shellSelector: ".main-surface-generated-artifacts",
    targetSelector: ".generated-artifacts-surface",
    requiredProfiles: ["desktop-reference-1440x900", "desktop-fullscreen"],
    notes: "E28 closure target. Validate automatic artifact hydration, populated inventory and icon registry.",
  },
  {
    label: "Data Flow Workbench",
    slug: "data-flow-workbench",
    activeSurface: "mission-data-flow-workbench",
    shellSelector: ".main-surface-data-flow-workbench",
    targetSelector: ".mission-data-flow-workbench",
    requiredProfiles: ["desktop-reference-1440x900", "desktop-fullscreen"],
    notes: "E28 closure target. Validate full-width Data Flow Workbench, direct focus affordance and no disabled-readiness cursor.",
  },
];
