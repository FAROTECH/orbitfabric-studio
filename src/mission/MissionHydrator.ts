import type { CoreGateway } from "../core/CoreGateway";
import type {
  CoreDiagnosticDto,
  EntityIndexDto,
  LintReportDto,
  MissionSnapshotDto,
  RelationshipManifestDto,
} from "../core/contracts";
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
  executable: string;
  requestId: string;
  generation: number;
}

export class MissionHydrator {
  constructor(private readonly core: CoreGateway) {}

  async openPrimary(options: OpenPrimaryOptions): Promise<MissionSession> {
    const source = await this.core.resolveMissionSource(options.selectedPath);
    const probe = await this.core.probeCore(options.executable);

    let snapshotResult;
    try {
      snapshotResult = await this.core.exportMissionSnapshot(
        options.executable,
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

    assertLoadedSnapshot(snapshot);

    return {
      sessionId: options.requestId,
      generation: options.generation,
      source,
      core: {
        executable: options.executable,
        orbitfabricVersion:
          probe.orbitfabricVersion ?? snapshot.orbitfabric_version,
        versionText: probe.versionText,
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
    const result = await this.core.exportEntityIndex(
      session.core.executable,
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
    const result = await this.core.exportRelationships(
      session.core.executable,
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
      session.core.executable,
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
