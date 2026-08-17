import type {
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

export interface CoreGateway {
  resolveMissionSource(selectedPath: string): Promise<MissionSource>;

  probeCore(executable: string): Promise<CoreProbeResult>;

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

  clearRequestTemp(requestId: string): Promise<void>;
}
