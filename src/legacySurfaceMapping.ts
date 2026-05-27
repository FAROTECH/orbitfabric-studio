import type { ActiveSurface, NavigationItemStatus, TargetDomainId } from "./navigationModel";

export type LegacySurfaceMigrationKind =
  | "kept"
  | "absorbed"
  | "diagnostic"
  | "future-workbench"
  | "future-traceability";

export interface LegacySurfaceMapping {
  legacySurface: ActiveSurface;
  legacyLabel: string;
  targetDomain: TargetDomainId | null;
  targetLabel: string;
  migrationKind: LegacySurfaceMigrationKind;
  status: NavigationItemStatus;
  notes: string;
}

export const legacySurfaceMappings: readonly LegacySurfaceMapping[] = [
  {
    legacySurface: "mission-dashboard",
    legacyLabel: "Mission Dashboard",
    targetDomain: "mission",
    targetLabel: "Mission",
    migrationKind: "kept",
    status: "available",
    notes: "Mission remains the cockpit entry point.",
  },
  {
    legacySurface: "model-inventory",
    legacyLabel: "Model Inventory",
    targetDomain: null,
    targetLabel: "Reserved mission domains",
    migrationKind: "absorbed",
    status: "reserved",
    notes:
      "Model Inventory temporarily backs reserved domain entries until dedicated domain surfaces exist.",
  },
  {
    legacySurface: "core-commands",
    legacyLabel: "Core Commands",
    targetDomain: null,
    targetLabel: "Diagnostics / command bar",
    migrationKind: "diagnostic",
    status: "diagnostic",
    notes:
      "Core command execution should move out of primary domain navigation and remain controlled diagnostic or command-bar access.",
  },
  {
    legacySurface: "contracts",
    legacyLabel: "Contracts",
    targetDomain: null,
    targetLabel: "Domain surfaces and Inspector",
    migrationKind: "absorbed",
    status: "reserved",
    notes:
      "Contract report rendering should be absorbed by domain surfaces and entity detail views over time.",
  },
  {
    legacySurface: "relationships",
    legacyLabel: "Relationships",
    targetDomain: null,
    targetLabel: "Mission Data Flow Workbench",
    migrationKind: "future-workbench",
    status: "reserved",
    notes:
      "Relationship inspection remains a future workbench input. v0.9.0 must not introduce graph behavior.",
  },
  {
    legacySurface: "generated-artifacts",
    legacyLabel: "Generated Artifacts",
    targetDomain: "generated-artifacts",
    targetLabel: "Generated Artifacts",
    migrationKind: "kept",
    status: "available",
    notes: "Generated artifacts remain a primary target destination.",
  },
  {
    legacySurface: "reports-logs",
    legacyLabel: "Reports & Logs",
    targetDomain: null,
    targetLabel: "Diagnostics / evidence support",
    migrationKind: "diagnostic",
    status: "diagnostic",
    notes:
      "Reports and logs should support diagnostics and evidence review rather than primary domain navigation.",
  },
  {
    legacySurface: "scenario-evidence",
    legacyLabel: "Scenario Evidence",
    targetDomain: "scenarios",
    targetLabel: "Scenarios",
    migrationKind: "kept",
    status: "available",
    notes: "Scenario Evidence is the current implementation backing the Scenarios destination.",
  },
  {
    legacySurface: "ground-integration",
    legacyLabel: "Ground Integration",
    targetDomain: "generated-artifacts",
    targetLabel: "Generated Artifacts / future traceability",
    migrationKind: "future-traceability",
    status: "reserved",
    notes:
      "Ground Integration remains read-only generated artifact inspection and future traceability input, not operational ground behavior.",
  },
  {
    legacySurface: "raw-output",
    legacyLabel: "Raw Output",
    targetDomain: null,
    targetLabel: "Developer diagnostics",
    migrationKind: "diagnostic",
    status: "diagnostic",
    notes: "Raw output should remain diagnostic access and not a primary domain destination.",
  },
] as const;
