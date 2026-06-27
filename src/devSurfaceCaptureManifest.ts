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

export const DEV_SURFACE_CAPTURE_MANIFEST_VERSION = "E5-visual-qa-capture-manifest";

export const DEV_SURFACE_CAPTURE_PROFILES: readonly DevSurfaceCaptureProfile[] = [
  {
    id: "desktop-reference-1440x900",
    label: "Desktop reference window",
    viewport: "1440x900 nominal host window; Tauri content viewport may be smaller after chrome/status bars",
    mode: "current-window",
    required: true,
    notes:
      "Primary compact desktop sanity profile. Required for Mission Overview and Core Report Runner after E3/E4.",
  },
  {
    id: "desktop-fullscreen",
    label: "Desktop fullscreen",
    viewport: "Current monitor fullscreen; validated at 1920x1080 during E4.5 baseline",
    mode: "current-window",
    required: true,
    notes:
      "Primary full-surface capture profile for all public Studio surfaces. Enter fullscreen manually, then press SURFACE.",
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
    notes: "Golden candidate after E3 desktop-envelope migration.",
  },
  {
    label: "Core Report Runner",
    slug: "core-report-runner",
    activeSurface: "core-commands",
    shellSelector: ".main-surface-core-report-runner",
    targetSelector: ".core-report-runner-surface",
    requiredProfiles: ["desktop-reference-1440x900", "desktop-fullscreen"],
    notes: "Golden candidate after E4 desktop-envelope migration.",
  },
  {
    label: "Data Products",
    slug: "data-products",
    activeSurface: "model-inventory",
    activeNavigationId: "data-products",
    shellSelector: ".main-surface-data-products",
    targetSelector: ".data-products-cockpit-surface",
    requiredProfiles: ["desktop-reference-1440x900", "desktop-fullscreen"],
    notes: "Desktop-envelope migrated in E7; validate reference and fullscreen cockpit profiles.",
  },
  {
    label: "Scenarios",
    slug: "scenarios",
    activeSurface: "scenario-evidence",
    shellSelector: ".main-surface-scenario-evidence",
    targetSelector: ".scenario-evidence-cockpit",
    requiredProfiles: ["desktop-fullscreen"],
    notes: "Long vertical evidence surface; current length is structural, not a shell fallback failure.",
  },
  {
    label: "Generated Artifacts",
    slug: "generated-artifacts",
    activeSurface: "generated-artifacts",
    shellSelector: ".main-surface-generated-artifacts",
    targetSelector: ".generated-artifacts-surface",
    requiredProfiles: ["desktop-reference-1440x900", "desktop-fullscreen"],
    notes: "Desktop-envelope migrated in E8; validate empty and populated inventory states when available.",
  },
  {
    label: "Data Flow Workbench",
    slug: "data-flow-workbench",
    activeSurface: "mission-data-flow-workbench",
    shellSelector: ".main-surface",
    targetSelector: ".mission-data-flow-workbench",
    requiredProfiles: ["desktop-fullscreen"],
    notes: "Recognized target, but remains a special-case width surface until a later migration.",
  },
];
