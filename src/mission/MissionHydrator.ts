import type { CoreGateway } from "../core/CoreGateway";
import type {
  CoreDiagnosticDto,
  EntityIndexDto,
  LintReportDto,
  MissionSnapshotDto,
  RelationshipManifestDto,
} from "../core/contracts";
import { requireCoreDomain } from "../core/coreCompatibility";
import { entityKey } from "./entityRef";
import {
  buildMissionReadModel,
  type MissionSession,
} from "./MissionSession";

export class MissionStructuralInvalidError extends Error {
  constructor(readonly diagnostics: CoreDiagnosticDto[]) {
    super(
      diagnostics[0]?.message ??
        "OrbitFabric Core could not construct the Mission Model.",
    );
    this.name = "MissionStructuralInvalidError";
  }
}

export class SecondarySurfaceConsistencyError extends Error {
  constructor(readonly surfaceName: string, message: string) {
    super(`${surfaceName}: ${message}`);
    this.name = "SecondarySurfaceConsistencyError";
  }
}

export interface OpenPrimaryOptions {
  selectedPath: string;
  configuredExecutable: string;
  requestId: string;
  generation: number;
}

export class MissionHydrator {
  constructor(private readonly core: CoreGateway) {}

  async openPrimary(options: OpenPrimaryOptions): Promise<MissionSession> {
    const executable = await this.core.resolveCoreExecutable(options.configuredExecutable);
    let probe;
    try {
      probe = await this.core.probeCore(executable, options.requestId);
      requireCoreDomain(probe.compatibility, "primary");
    } catch (error) {
      await this.clearRequestTempBestEffort(options.requestId);
      throw error;
    }

    const source = await this.core.resolveMissionSource(options.selectedPath);
    let snapshotResult;
    try {
      snapshotResult = await this.core.exportMissionSnapshot(
        probe.resolvedExecutable,
        source,
        options.requestId,
      );
    } catch (error) {
      await this.clearRequestTempBestEffort(options.requestId);
      throw error;
    }

    const snapshot = snapshotResult.surface;
    if (snapshot.result === "failed") {
      await this.clearRequestTempBestEffort(options.requestId);
      throw new MissionStructuralInvalidError(snapshot.diagnostics);
    }

    try {
      assertLoadedSnapshot(snapshot);
    } catch (error) {
      await this.clearRequestTempBestEffort(options.requestId);
      throw error;
    }

    return {
      sessionId: options.requestId,
      generation: options.generation,
      source,
      core: {
        configuredExecutable: probe.configuredExecutable,
        resolvedExecutable: probe.resolvedExecutable,
        orbitfabricVersion: probe.orbitfabricVersion,
        interfaceVersion: probe.interfaceVersion,
        interfaceSha256: probe.interfaceSha256,
        capabilities: probe.capabilities,
        compatibility: probe.compatibility,
      },
      snapshot,
      entityIndex: null,
      relationships: null,
      lint: null,
      readiness: {
        entities: "pending",
        relationships: "pending",
        lint: "pending",
      },
      failures: [],
      readModel: buildMissionReadModel(null, null),
      openedAt: Date.now(),
      lastSuccessfulRefreshAt: null,
    };
  }

  async hydrateEntityIndex(session: MissionSession): Promise<EntityIndexDto> {
    requireCoreDomain(session.core.compatibility, "entities");
    const result = await this.core.exportEntityIndex(
      session.core.resolvedExecutable,
      session.source,
      session.sessionId,
    );
    assertSameMission(session, result.surface.mission.id, result.surface.mission.model_version, "Entity Index");
    return result.surface;
  }

  async hydrateRelationships(
    session: MissionSession,
    entityIndex: EntityIndexDto,
  ): Promise<RelationshipManifestDto> {
    requireCoreDomain(session.core.compatibility, "relationships");
    const result = await this.core.exportRelationships(
      session.core.resolvedExecutable,
      session.source,
      session.sessionId,
    );
    const manifest = result.surface;

    assertSameMission(
      session,
      manifest.mission.id,
      manifest.mission.model_version,
      "Relationship Manifest",
    );
    assertRelationshipEndpointsResolve(entityIndex, manifest);

    return manifest;
  }

  async hydrateLint(session: MissionSession): Promise<LintReportDto> {
    const result = await this.core.lintMission(
      session.core.resolvedExecutable,
      session.source,
      session.sessionId,
    );
    const lint = result.surface;
    assertSameMission(session, lint.mission, lint.model_version, "Lint Report");
    return lint;
  }

  async clearRequestTemp(sessionId: string): Promise<void> {
    await this.core.clearRequestTemp(sessionId);
  }

  async clearRequestTempBestEffort(sessionId: string): Promise<void> {
    try {
      await this.core.clearRequestTemp(sessionId);
    } catch {
      // Temp cleanup must never replace the actual mission-open result.
    }
  }
}

function assertLoadedSnapshot(snapshot: MissionSnapshotDto): asserts snapshot is MissionSnapshotDto & {
  result: "loaded";
  mission: NonNullable<MissionSnapshotDto["mission"]>;
  model: NonNullable<MissionSnapshotDto["model"]>;
} {
  if (snapshot.result !== "loaded" || snapshot.mission === null || snapshot.model === null) {
    throw new Error("Mission Snapshot is not a loaded Mission Model.");
  }
}

function assertSameMission(
  session: MissionSession,
  missionId: string,
  modelVersion: string,
  surfaceName: string,
): void {
  const primary = session.snapshot.mission;
  if (primary === null) {
    throw new SecondarySurfaceConsistencyError(
      surfaceName,
      "primary Mission Snapshot has no mission identity",
    );
  }

  if (missionId !== primary.id || modelVersion !== primary.model_version) {
    throw new SecondarySurfaceConsistencyError(
      surfaceName,
      `surface identifies ${missionId}@${modelVersion}, expected ${primary.id}@${primary.model_version}`,
    );
  }
}

function assertRelationshipEndpointsResolve(
  entityIndex: EntityIndexDto,
  manifest: RelationshipManifestDto,
): void {
  const entityKeys = new Set(
    entityIndex.entities.map((entity) =>
      entityKey({ domain: entity.domain, id: entity.id }),
    ),
  );

  for (const relationship of manifest.relationships) {
    const fromKey = entityKey(relationship.from);
    const toKey = entityKey(relationship.to);

    if (!entityKeys.has(fromKey) || !entityKeys.has(toKey)) {
      const unresolved = !entityKeys.has(fromKey)
        ? `${relationship.from.domain}:${relationship.from.id}`
        : `${relationship.to.domain}:${relationship.to.id}`;
      throw new SecondarySurfaceConsistencyError(
        "Relationship Manifest",
        `relationship ${relationship.relationship_id} references unresolved endpoint ${unresolved}`,
      );
    }
  }
}
