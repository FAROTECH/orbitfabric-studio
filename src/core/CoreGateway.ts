import type { ScenarioDeclaration } from "../convergence/consumer-contracts";
import type {
  CoreExecutableResolution,
  CoreInvocationResult,
  CoreProbeResult,
  EntityIndexDto,
  LintReportDto,
  MissionSnapshotDto,
  MissionSource,
  RelationshipManifestDto,
} from "./contracts";

export interface CoreSurfaceResult<T> {
  invocation: CoreInvocationResult;
  surface: T;
}

export interface CoreIntegrationInputExport {
  invocation: CoreInvocationResult;
  manifestPath: string;
  manifestText: string;
}

export interface CoreGateway {
  resolveMissionSource(selectedPath: string): Promise<MissionSource>;

  resolveCoreExecutable(configuredExecutable: string): Promise<CoreExecutableResolution>;

  probeCore(
    executable: CoreExecutableResolution,
    requestId: string,
  ): Promise<CoreProbeResult>;

  exportMissionSnapshot(
    executable: string,
    source: MissionSource,
    requestId: string,
  ): Promise<CoreSurfaceResult<MissionSnapshotDto>>;

  exportEntityIndex(
    executable: string,
    source: MissionSource,
    requestId: string,
  ): Promise<CoreSurfaceResult<EntityIndexDto>>;

  exportRelationships(
    executable: string,
    source: MissionSource,
    requestId: string,
  ): Promise<CoreSurfaceResult<RelationshipManifestDto>>;

  lintMission(
    executable: string,
    source: MissionSource,
    requestId: string,
  ): Promise<CoreSurfaceResult<LintReportDto>>;

  exportScenarioDeclaration(
    executable: string,
    scenarioPath: string,
    requestId: string,
  ): Promise<CoreSurfaceResult<ScenarioDeclaration>>;

  exportIntegrationInputSet(
    executable: string,
    source: MissionSource,
    requestId: string,
  ): Promise<CoreIntegrationInputExport>;

  clearRequestTemp(requestId: string): Promise<void>;
}
