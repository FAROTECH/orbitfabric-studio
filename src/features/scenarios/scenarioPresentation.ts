import type { ScenarioAtomUnderstanding } from "../../convergence/scenarioUnderstanding";

const KIND_LABELS: Record<string, string> = {
  scenario_metadata: "Scenario metadata", initial_mode: "Initial mode",
  initial_telemetry: "Initial telemetry", command: "Command",
  telemetry_injection: "Telemetry injection", expect_event: "Event expectation",
  expect_mode: "Mode expectation", expect_command: "Command expectation",
  expect_telemetry: "Telemetry expectation", expect_command_status: "Command status expectation",
  expect_payload_lifecycle: "Payload lifecycle expectation", expect_data_flow: "Data flow expectation",
  expect_scenario_status: "Scenario status expectation",
};
const ROLE_LABELS: Record<string, string> = {
  metadata: "Metadata", initial_state: "Initial state", action: "Action", expectation: "Expectation",
};

export function presentScenarioAtom(atom: ScenarioAtomUnderstanding) {
  return {
    title: KIND_LABELS[atom.kind] ?? atom.kind,
    role: ROLE_LABELS[atom.role] ?? atom.role,
    position: atom.stepIndex === null ? "Outside source steps"
      : `Source step ${atom.stepIndex + 1} (index ${atom.stepIndex})`,
    ordinal: atom.withinStepOrdinal === null ? null : `Core ordinal ${atom.withinStepOrdinal}`,
    declaredTime: atom.scenarioTimeS === null ? null : `${atom.scenarioTimeS} s`,
    fields: declarationFields(atom.declaration),
  };
}

// Formats structured Core declaration fields, without reconstructing identities or meaning.
export function declarationFields(value: unknown): { name: string; value: string }[] {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).map(([name, entry]) => ({ name, value: formatDeclaredValue(entry) }));
  }
  return [{ name: "declaration", value: formatDeclaredValue(value) }];
}

function formatDeclaredValue(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2) ?? "Unavailable";
}
