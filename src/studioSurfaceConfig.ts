import type { ComponentType } from "react";

import { SpacecraftDomainSurface } from "./SpacecraftDomainSurface";
import { SubsystemsDomainSurface } from "./SubsystemsDomainSurface";
import { ModesDomainSurface } from "./ModesDomainSurface";
import { TelemetryDomainSurface } from "./TelemetryDomainSurface";
import { CommandsDomainSurface } from "./CommandsDomainSurface";
import { EventsDomainSurface } from "./EventsDomainSurface";
import { FaultsDomainSurface } from "./FaultsDomainSurface";
import { PacketsDomainSurface } from "./PacketsDomainSurface";
import { PayloadsDomainSurface } from "./PayloadsDomainSurface";
import { DataProductsDomainSurface } from "./DataProductsDomainSurface";
import { ContactsDownlinkDomainSurface } from "./ContactsDownlinkDomainSurface";
import { CommandabilityDomainSurface } from "./CommandabilityDomainSurface";
import { AutonomyReservedSurface } from "./AutonomyReservedSurface";
import type {
  ActiveSurface,
  TargetDomainId,
} from "./navigationModel";
import type { DomainEntitySummary } from "./domainSurfaceModel";
import type {
  CoreEntityIndex,
  CoreModelSummary,
  ProjectEntry,
  WorkspaceInspection,
} from "./types/workspace";

export interface CoreDomainSurfaceComponentProps {
  workspace: WorkspaceInspection;
  modelSummary: CoreModelSummary | null;
  entityIndex: CoreEntityIndex | null;
  selectedEntity: DomainEntitySummary | null;
  onSelectEntity: (entity: DomainEntitySummary) => void;
  onOpenFile: (entry: ProjectEntry) => void;
}

export const modelInventoryDomainSurfaceComponents: Partial<
  Record<TargetDomainId, ComponentType<CoreDomainSurfaceComponentProps>>
> = {
  spacecraft: SpacecraftDomainSurface,
  subsystems: SubsystemsDomainSurface,
  modes: ModesDomainSurface,
  telemetry: TelemetryDomainSurface,
  commands: CommandsDomainSurface,
  events: EventsDomainSurface,
  faults: FaultsDomainSurface,
  packets: PacketsDomainSurface,
  payloads: PayloadsDomainSurface,
  autonomy: AutonomyReservedSurface,
  "data-products": DataProductsDomainSurface,
  "contacts-downlink": ContactsDownlinkDomainSurface,
  commandability: CommandabilityDomainSurface,
};

export const defaultNavigationIdBySurface: Record<ActiveSurface, TargetDomainId> = {
  "mission-dashboard": "mission",
  "mission-data-flow-workbench": "data-flow-workbench",
  "model-inventory": "data-products",
  "core-commands": "core-report-runner",
  contracts: "data-products",
  relationships: "data-products",
  "generated-artifacts": "generated-artifacts",
  "reports-logs": "generated-artifacts",
  "scenario-evidence": "scenarios",
  "ground-integration": "generated-artifacts",
  "raw-output": "core-report-runner",
};

export const publicPreviewModelNavigationIds: ReadonlySet<TargetDomainId> = new Set([
  "data-products",
]);

export const publicPreviewPlaceholderCopy: Partial<Record<ActiveSurface, { title: string; summary: string }>> = {
  contracts: {
    title: "Contracts surface in redesign",
    summary:
      "Contract inspection remains read-only, but this surface is temporarily gated while it is realigned with the Mission Content First cockpit direction.",
  },
  relationships: {
    title: "Relationships surface in redesign",
    summary:
      "Relationship evidence is available through Data Flow Workbench for this public preview. The legacy relationship surface is gated to avoid exposing transitional UI.",
  },
  "reports-logs": {
    title: "Reports and logs surface in redesign",
    summary:
      "Core reports are inspected through Core Report Runner and the dedicated cockpit surfaces. The legacy reports/logs surface is not exposed in this public preview.",
  },
  "ground-integration": {
    title: "Ground integration viewer in redesign",
    summary:
      "Generated ground-facing artifacts remain read-only, but this viewer is gated until it matches the public preview cockpit standard.",
  },
  "raw-output": {
    title: "Raw Core output moved to Core Report Runner",
    summary:
      "Raw process output is now surfaced inside Core Report Runner, next to the fixed Core action that produced it.",
  },
};
