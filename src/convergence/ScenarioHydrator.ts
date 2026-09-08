import type { CoreGateway } from "../core/CoreGateway";
import type { MissionSession } from "../mission/MissionSession";
import type { ScenarioDeclaration } from "./consumer-contracts";

export class ScenarioConsistencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScenarioConsistencyError";
  }
}

export interface ScenarioHydrationResult {
  targetPath: string;
  declaration: ScenarioDeclaration;
}

export class ScenarioHydrator {
  constructor(private readonly core: CoreGateway) {}

  async hydrate(
    session: MissionSession,
    targetPath: string,
    requestToken: string,
  ): Promise<ScenarioHydrationResult> {
    const requestId = `${session.sessionId}-scenario-${requestToken}`;
    const result = await this.core.exportScenarioDeclaration(
      session.core.executable,
      targetPath,
      requestId,
    );
    const declaration = result.surface;

    if (declaration.result === "loaded") {
      const primary = session.snapshot.mission;
      if (!primary) {
        throw new ScenarioConsistencyError(
          "Scenario Declaration cannot bind to a MissionSession without primary mission identity.",
        );
      }
      if (
        declaration.mission.id !== primary.id ||
        declaration.mission.modelVersion !== primary.model_version
      ) {
        throw new ScenarioConsistencyError(
          `Scenario Declaration identifies ${declaration.mission.id}@${declaration.mission.modelVersion}, expected ${primary.id}@${primary.model_version}.`,
        );
      }
    }

    return { targetPath, declaration };
  }
}
