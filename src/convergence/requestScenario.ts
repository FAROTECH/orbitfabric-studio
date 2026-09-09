import type { StudioAction } from "../app/studioState";
import { MalformedCoreSurfaceError, UnsupportedCoreSurfaceError } from "../core/surfaceValidation";
import type { MissionSession } from "../mission/MissionSession";
import { ScenarioConsistencyError, type ScenarioHydrator } from "./ScenarioHydrator";
import type { ScenarioSlotRequest } from "./scenarioSlot";

// Coordinates the existing SP1 transaction; the reducer remains the commit authority.
export async function requestScenario(
  hydrator: ScenarioHydrator,
  dispatch: (action: StudioAction) => void,
  session: MissionSession,
  targetPath: string,
  mode: ScenarioSlotRequest["mode"],
  requestToken: string,
) {
  const request: ScenarioSlotRequest = {
    membership: { sessionId: session.sessionId, generation: session.generation },
    targetPath, mode, requestToken,
  };
  dispatch({ type: "SCENARIO_REQUESTED", request });
  try {
    const result = await hydrator.hydrate(session, targetPath, requestToken);
    dispatch({ type: "SCENARIO_DECLARATION_READY", request, declaration: result.declaration });
  } catch (error) {
    dispatch({ type: "SCENARIO_HYDRATION_FAILED", request, failure: {
      class: error instanceof ScenarioConsistencyError ? "consistency"
        : error instanceof MalformedCoreSurfaceError || error instanceof UnsupportedCoreSurfaceError
          ? "protocol" : "transport",
      message: error instanceof Error ? error.message : String(error),
    } });
  }
}
