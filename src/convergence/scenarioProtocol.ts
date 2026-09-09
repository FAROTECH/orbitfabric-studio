import { parseScenarioDeclaration } from "./consumer-contracts";
import { MalformedCoreSurfaceError } from "../core/surfaceValidation";

export function consumeScenarioReport(text: string) {
  try {
    return parseScenarioDeclaration(text);
  } catch (error) {
    throw new MalformedCoreSurfaceError(
      "Scenario Declaration",
      error instanceof Error ? error.message : String(error),
    );
  }
}
