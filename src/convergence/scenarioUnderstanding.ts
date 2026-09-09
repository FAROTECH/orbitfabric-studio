import type { ScenarioDeclaration, ScenarioDeclarationAtom } from "./consumer-contracts";
import { scenarioExactIdentity, scenarioSlotReadiness, type ScenarioSlotState } from "./scenarioSlot";
import { entityKey, type EntityRef } from "../mission/entityRef";

export interface ScenarioAtomUnderstanding extends ScenarioDeclarationAtom {
  exactIdentity: { scenarioSha256: string; atomId: string };
  declarationPosition: number;
}

export interface ScenarioParticipant {
  entity: EntityRef;
  occurrences: { atomId: string; role: string }[];
}

// A pure view of the accepted SP1 slot. It owns neither hydration nor semantics.
export function buildScenarioUnderstanding(slot: ScenarioSlotState) {
  const declaration = slot.accepted?.declaration ?? null;
  const loaded = declaration?.result === "loaded" ? declaration : null;
  const atoms: ScenarioAtomUnderstanding[] = loaded
    ? loaded.atoms.map((atom, index) => ({
        ...atom,
        exactIdentity: { scenarioSha256: loaded.source.scenarioSha256, atomId: atom.id },
        declarationPosition: index + 1,
      }))
    : [];
  const participants = new Map<string, ScenarioParticipant>();
  for (const atom of atoms) {
    for (const reference of atom.references) {
      const key = entityKey(reference.entity);
      const participant = participants.get(key) ?? { entity: reference.entity, occurrences: [] };
      participant.occurrences.push({ atomId: atom.id, role: reference.role });
      participants.set(key, participant);
    }
  }
  return {
    readiness: scenarioSlotReadiness(slot),
    pending: slot.pending,
    hydrationFailure: slot.hydrationFailure,
    retainedObservation: Boolean(slot.accepted && (slot.pending || slot.hydrationFailure)),
    sourcePath: slot.accepted?.targetPath ?? slot.pending?.targetPath ?? null,
    result: declaration?.result ?? null,
    exactIdentity: loaded ? scenarioExactIdentity(loaded) : null,
    sourceSha256: declaration?.source.scenarioSha256 ?? null,
    scenario: loaded?.scenario ?? null,
    mission: loaded?.mission ?? null,
    atomCount: loaded?.atomCount ?? null,
    atoms,
    participants: [...participants.values()],
    diagnostics: declaration?.diagnostics ?? [],
    boundaries: declaration?.boundaries ?? null,
    producerVersion: declaration?.orbitfabricVersion ?? null,
    declarationVersion: declaration?.declarationVersion ?? null,
    availability: {
      description: loaded?.scenario.description == null ? "unavailable" : "available",
      declaration: loaded ? "available" : "unavailable",
      targetProjection: boundaryAvailability(declaration, "contains_target_projection"),
      runtimeBehavior: boundaryAvailability(declaration, "contains_runtime_behavior"),
      simulationEvidence: boundaryAvailability(declaration, "contains_simulation_evidence"),
    },
  };
}

export type ScenarioUnderstandingModel = ReturnType<typeof buildScenarioUnderstanding>;

function boundaryAvailability(declaration: ScenarioDeclaration | null, key: string) {
  const value = declaration?.boundaries[key];
  return value === false ? "not_in_declaration" : value === true ? "declared_present" : "unavailable";
}
