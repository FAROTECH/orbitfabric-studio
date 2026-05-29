import type { TargetDomainId } from "./navigationModel";
import type {
  CoreEntityIndexDomain,
  CoreEntityIndexEntity,
  CoreModelSummaryDomain,
  ProjectEntry,
} from "./types/workspace";

export type DomainSurfaceLifecycleStatus =
  | "implemented"
  | "implementable"
  | "conservative"
  | "reserved";

export type DomainSurfaceReportState =
  | "reported"
  | "not-reported"
  | "structural"
  | "unavailable"
  | "reserved";

export type DomainSurfaceDataSource =
  | "workspace-inspection"
  | "core-model-summary"
  | "core-entity-index"
  | "core-relationship-manifest"
  | "core-dashboard-summary"
  | "core-coverage-summary"
  | "core-scenario-run-index"
  | "core-simulation-report"
  | "generated-artifact-inventory"
  | "local-ui-state"
  | "explicit-unavailable-state";

export interface DomainSurfaceDefinition {
  id: TargetDomainId;
  label: string;
  coreDomainId: string | null;
  coreDomainIds?: readonly string[];
  expectedSourceFile: string | null;
  lifecycleStatus: DomainSurfaceLifecycleStatus;
  dataSources: readonly DomainSurfaceDataSource[];
}

export interface DomainSurfaceSourceFileState {
  state: DomainSurfaceReportState;
  expectedSourceFile: string | null;
  sourceFile: ProjectEntry | null;
}

export interface DomainSurfaceCoreReportState {
  modelSummaryState: DomainSurfaceReportState;
  entityIndexState: DomainSurfaceReportState;
  modelSummaryDomain: CoreModelSummaryDomain | null;
  entityIndexDomain: CoreEntityIndexDomain | null;
}

export interface DomainEntitySummary {
  id: string;
  domain: string;
  entityType: string;
  displayName: string;
  sourceFile: string;
  provenance: string;
  requiredDomain: boolean;
  present: boolean;
  raw: CoreEntityIndexEntity;
}

export interface DomainEntityDetailSelection {
  kind: "core-entity";
  title: string;
  source: "Core entity_index.json";
  inference: "none";
  entity: DomainEntitySummary;
}

export interface DomainSurfaceSnapshot {
  definition: DomainSurfaceDefinition;
  sourceFileState: DomainSurfaceSourceFileState;
  coreReportState: DomainSurfaceCoreReportState;
  entityCount: number;
  entities: readonly DomainEntitySummary[];
}
