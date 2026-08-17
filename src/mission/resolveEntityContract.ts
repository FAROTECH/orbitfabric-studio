import type {
  JsonObject,
  JsonValue,
  MissionContractObject,
  MissionSnapshotDto,
} from "../core/contracts";
import type { EntityRef } from "./entityRef";

export type ResolvedEntityContract = MissionContractObject;

export function resolveEntityContract(
  snapshot: MissionSnapshotDto,
  ref: EntityRef,
): ResolvedEntityContract | null {
  const model = snapshot.model;
  if (snapshot.result !== "loaded" || model === null) {
    return null;
  }

  switch (ref.domain) {
    case "spacecraft":
      return model.spacecraft.id === ref.id ? model.spacecraft : null;

    case "subsystems":
      return findById(model.subsystems, ref.id);

    case "modes": {
      const mode = model.modes[ref.id];
      return mode ? { id: ref.id, ...mode } : null;
    }

    case "telemetry":
      return findById(model.telemetry, ref.id);

    case "commands":
      return findById(model.commands, ref.id);

    case "events":
      return findById(model.events, ref.id);

    case "faults":
      return findById(model.faults, ref.id);

    case "packets":
      return findById(model.packets, ref.id);

    case "payloads":
      return findById(model.payloads, ref.id);

    case "data_products":
      return findById(model.data_products, ref.id);

    case "contact_profiles":
      return findById(nestedArray(model.contacts, "contact_profiles"), ref.id);

    case "link_profiles":
      return findById(nestedArray(model.contacts, "link_profiles"), ref.id);

    case "contact_windows":
      return findById(nestedArray(model.contacts, "contact_windows"), ref.id);

    case "downlink_flows":
      return findById(nestedArray(model.contacts, "downlink_flows"), ref.id);

    case "command_sources":
      return findById(nestedArray(model.commandability, "sources"), ref.id);

    case "commandability_rules":
      return findById(nestedArray(model.commandability, "rules"), ref.id);

    case "autonomous_actions":
      return findById(nestedArray(model.commandability, "autonomous_actions"), ref.id);

    case "recovery_intents":
      return findById(nestedArray(model.commandability, "recovery_intents"), ref.id);

    default:
      return null;
  }
}

function findById(
  values: readonly MissionContractObject[],
  id: string,
): MissionContractObject | null {
  return values.find((value) => value.id === id) ?? null;
}

function nestedArray(object: JsonObject, key: string): MissionContractObject[] {
  const value: JsonValue | undefined = object[key];
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isMissionContractObject);
}

function isMissionContractObject(value: JsonValue): value is MissionContractObject {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof value.id === "string"
  );
}
