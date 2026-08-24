import type {
  EntityIndexDto,
  EntityIndexRecordDto,
  LintReportDto,
  MissionSnapshotDto,
  MissionSource,
  RelationshipManifestDto,
  RelationshipRecordDto,
} from "../core/contracts";
import { entityKey, type EntityKey, type EntityRef } from "./entityRef";

export type SecondaryReadiness = "pending" | "ready" | "failed";

export interface MissionReadiness {
  entities: SecondaryReadiness;
  relationships: SecondaryReadiness;
  lint: SecondaryReadiness;
}

export type SecondarySurfaceName = "entities" | "relationships" | "lint";

export interface SecondaryHydrationFailure {
  surface: SecondarySurfaceName;
  message: string;
}

export interface CoreSessionInfo {
  executable: string;
  orbitfabricVersion: string | null;
  versionText: string;
}

export interface MissionReadModel {
  entityRecordsByKey: ReadonlyMap<EntityKey, EntityIndexRecordDto>;
  entityRefsByDomain: ReadonlyMap<string, readonly EntityRef[]>;
  relationshipsById: ReadonlyMap<string, RelationshipRecordDto>;
  outgoingByEntity: ReadonlyMap<EntityKey, readonly RelationshipRecordDto[]>;
  incomingByEntity: ReadonlyMap<EntityKey, readonly RelationshipRecordDto[]>;
}

export interface MissionSession {
  sessionId: string;
  generation: number;
  source: MissionSource;
  core: CoreSessionInfo;
  snapshot: MissionSnapshotDto;
  entityIndex: EntityIndexDto | null;
  relationships: RelationshipManifestDto | null;
  lint: LintReportDto | null;
  readiness: MissionReadiness;
  failures: SecondaryHydrationFailure[];
  readModel: MissionReadModel;
  openedAt: number;
  lastSuccessfulRefreshAt: number | null;
}

export function emptyMissionReadModel(): MissionReadModel {
  return {
    entityRecordsByKey: new Map(),
    entityRefsByDomain: new Map(),
    relationshipsById: new Map(),
    outgoingByEntity: new Map(),
    incomingByEntity: new Map(),
  };
}

export function buildMissionReadModel(
  entityIndex: EntityIndexDto | null,
  relationships: RelationshipManifestDto | null,
): MissionReadModel {
  const entityRecordsByKey = new Map<EntityKey, EntityIndexRecordDto>();
  const mutableRefsByDomain = new Map<string, EntityRef[]>();

  for (const record of entityIndex?.entities ?? []) {
    const ref = { domain: record.domain, id: record.id };
    entityRecordsByKey.set(entityKey(ref), record);
    const domainRefs = mutableRefsByDomain.get(record.domain) ?? [];
    domainRefs.push(ref);
    mutableRefsByDomain.set(record.domain, domainRefs);
  }

  const entityRefsByDomain = new Map<string, readonly EntityRef[]>();
  for (const [domain, refs] of mutableRefsByDomain) {
    entityRefsByDomain.set(
      domain,
      refs.sort((left, right) => left.id.localeCompare(right.id)),
    );
  }

  const relationshipsById = new Map<string, RelationshipRecordDto>();
  const mutableOutgoing = new Map<EntityKey, RelationshipRecordDto[]>();
  const mutableIncoming = new Map<EntityKey, RelationshipRecordDto[]>();

  for (const relationship of relationships?.relationships ?? []) {
    relationshipsById.set(relationship.relationship_id, relationship);

    const fromKey = entityKey(relationship.from);
    const toKey = entityKey(relationship.to);

    const outgoing = mutableOutgoing.get(fromKey) ?? [];
    outgoing.push(relationship);
    mutableOutgoing.set(fromKey, outgoing);

    const incoming = mutableIncoming.get(toKey) ?? [];
    incoming.push(relationship);
    mutableIncoming.set(toKey, incoming);
  }

  const outgoingByEntity = freezeRelationshipIndex(mutableOutgoing);
  const incomingByEntity = freezeRelationshipIndex(mutableIncoming);

  return {
    entityRecordsByKey,
    entityRefsByDomain,
    relationshipsById,
    outgoingByEntity,
    incomingByEntity,
  };
}

export function withEntityIndex(
  session: MissionSession,
  entityIndex: EntityIndexDto,
): MissionSession {
  return {
    ...session,
    entityIndex,
    readiness: { ...session.readiness, entities: "ready" },
    failures: withoutFailure(session.failures, "entities"),
    readModel: buildMissionReadModel(entityIndex, session.relationships),
  };
}

export function withRelationships(
  session: MissionSession,
  relationships: RelationshipManifestDto,
): MissionSession {
  return {
    ...session,
    relationships,
    readiness: { ...session.readiness, relationships: "ready" },
    failures: withoutFailure(session.failures, "relationships"),
    readModel: buildMissionReadModel(session.entityIndex, relationships),
  };
}

export function withLint(session: MissionSession, lint: LintReportDto): MissionSession {
  return {
    ...session,
    lint,
    readiness: { ...session.readiness, lint: "ready" },
    failures: withoutFailure(session.failures, "lint"),
  };
}

export function withSecondaryFailure(
  session: MissionSession,
  surface: SecondarySurfaceName,
  message: string,
): MissionSession {
  return {
    ...session,
    readiness: { ...session.readiness, [surface]: "failed" },
    failures: [
      ...withoutFailure(session.failures, surface),
      { surface, message },
    ],
  };
}

function freezeRelationshipIndex(
  mutable: Map<EntityKey, RelationshipRecordDto[]>,
): ReadonlyMap<EntityKey, readonly RelationshipRecordDto[]> {
  const result = new Map<EntityKey, readonly RelationshipRecordDto[]>();
  for (const [key, relationships] of mutable) {
    result.set(
      key,
      relationships.sort((left, right) =>
        left.relationship_id.localeCompare(right.relationship_id),
      ),
    );
  }
  return result;
}

function withoutFailure(
  failures: SecondaryHydrationFailure[],
  surface: SecondarySurfaceName,
): SecondaryHydrationFailure[] {
  return failures.filter((failure) => failure.surface !== surface);
}
