import { invoke } from "@tauri-apps/api/core";

import { consumeScenarioReport } from "../convergence/scenarioProtocol";
import type {
  CoreGateway,
  CoreIntegrationInputExport,
  CoreSurfaceResult,
} from "./CoreGateway";
import type {
  CoreExecutableResolution,
  CoreInvocationResult,
  CoreProbeResult,
  EntityIndexDto,
  LintReportDto,
  MissionSnapshotDto,
  MissionSource,
  RelationshipManifestDto,
} from "./contracts";
import {
  parseEntityIndex,
  parseLintReport,
  parseMissionSnapshot,
  parseRelationshipManifest,
} from "./surfaceValidation";
import {
  CoreCompatibilityError,
  evaluateCoreCompatibility,
  parseCoreInterfaceManifest,
} from "./coreCompatibility";

interface MissionSourceResolutionDto {
  selectedPath: string;
  missionDir: string;
}

export class CoreTransportError extends Error {
  constructor(
    message: string,
    readonly invocation?: CoreInvocationResult,
  ) {
    super(message);
    this.name = "CoreTransportError";
  }
}

export class TauriCoreGateway implements CoreGateway {
  async resolveMissionSource(selectedPath: string): Promise<MissionSource> {
    const resolved = await invoke<MissionSourceResolutionDto>("resolve_mission_source", {
      path: selectedPath,
    });

    return {
      selectedPath: resolved.selectedPath,
      missionDir: resolved.missionDir,
    };
  }

  async resolveCoreExecutable(
    configuredExecutable: string,
  ): Promise<CoreExecutableResolution> {
    try {
      return await invoke<CoreExecutableResolution>("resolve_core_executable", {
        configuredExecutable,
      });
    } catch (error) {
      throw new CoreCompatibilityError(
        "executable_unavailable",
        `OrbitFabric Core executable is unavailable: ${errorMessage(error)}`,
      );
    }
  }

  async probeCore(
    executable: CoreExecutableResolution,
    requestId: string,
  ): Promise<CoreProbeResult> {
    let invocation: CoreInvocationResult;
    try {
      invocation = await invoke<CoreInvocationResult>("run_core_interface_manifest", {
        executable: executable.resolvedExecutable,
        requestId,
      });
    } catch (error) {
      throw new CoreCompatibilityError(
        "invocation_failed",
        `Core Interface Manifest invocation failed: ${errorMessage(error)}`,
      );
    }

    if (!invocation.processCompleted || invocation.timedOut) {
      throw new CoreCompatibilityError(
        "invocation_failed",
        formatInvocationFailure(
          "Core Interface Manifest invocation did not complete",
          invocation,
        ),
      );
    }
    if (invocation.exitCode !== 0) {
      throw new CoreCompatibilityError(
        "interface_identity_unavailable",
        formatInvocationFailure(
          "Core executable does not expose a usable Core Interface Manifest",
          invocation,
        ),
      );
    }
    if (invocation.reportText === null || invocation.reportText.trim().length === 0) {
      throw new CoreCompatibilityError(
        "interface_identity_unavailable",
        "Core executable did not produce a Core Interface Manifest.",
      );
    }

    const manifest = parseCoreInterfaceManifest(invocation.reportText);
    return {
      ...executable,
      orbitfabricVersion: manifest.orbitfabric_version,
      interfaceVersion: manifest.interface_version,
      interfaceSha256: manifest.interface_sha256,
      capabilities: manifest.capabilities,
      manifest,
      compatibility: evaluateCoreCompatibility(manifest),
    };
  }

  async exportMissionSnapshot(
    executable: string,
    source: MissionSource,
    requestId: string,
  ): Promise<CoreSurfaceResult<MissionSnapshotDto>> {
    const invocation = await invoke<CoreInvocationResult>("run_core_export_mission_snapshot", {
      executable,
      missionDir: source.missionDir,
      requestId,
    });

    const reportText = requireReportText("Mission Snapshot", invocation);
    return {
      invocation,
      surface: parseMissionSnapshot(reportText),
    };
  }

  async exportEntityIndex(
    executable: string,
    source: MissionSource,
    requestId: string,
  ): Promise<CoreSurfaceResult<EntityIndexDto>> {
    const invocation = await invoke<CoreInvocationResult>("run_core_export_entity_index", {
      executable,
      missionDir: source.missionDir,
      requestId,
    });

    const reportText = requireSuccessfulReportText("Entity Index", invocation);
    return {
      invocation,
      surface: parseEntityIndex(reportText),
    };
  }

  async exportRelationships(
    executable: string,
    source: MissionSource,
    requestId: string,
  ): Promise<CoreSurfaceResult<RelationshipManifestDto>> {
    const invocation = await invoke<CoreInvocationResult>(
      "run_core_export_relationship_manifest",
      {
        executable,
        missionDir: source.missionDir,
        requestId,
      },
    );

    const reportText = requireSuccessfulReportText("Relationship Manifest", invocation);
    return {
      invocation,
      surface: parseRelationshipManifest(reportText),
    };
  }

  async lintMission(
    executable: string,
    source: MissionSource,
    requestId: string,
  ): Promise<CoreSurfaceResult<LintReportDto>> {
    const invocation = await invoke<CoreInvocationResult>("run_core_lint_mission", {
      executable,
      missionDir: source.missionDir,
      requestId,
    });

    const reportText = requireReportText("Lint Report", invocation);
    return {
      invocation,
      surface: parseLintReport(reportText),
    };
  }

  async exportScenarioDeclaration(
    executable: string,
    scenarioPath: string,
    requestId: string,
  ) {
    const invocation = await invoke<CoreInvocationResult>("run_core_export_scenario_declaration", {
      executable,
      scenarioPath,
      requestId,
    });

    const reportText = requireReportText("Scenario Declaration", invocation);
    return {
      invocation,
      surface: consumeScenarioReport(reportText),
    };
  }

  async exportIntegrationInputSet(
    executable: string,
    source: MissionSource,
    requestId: string,
  ): Promise<CoreIntegrationInputExport> {
    const invocation = await invoke<CoreInvocationResult>("run_core_export_integration_input_set", {
      executable,
      missionDir: source.missionDir,
      requestId,
    });

    const manifestText = requireReportText("Integration Input Set", invocation);
    if (!invocation.reportPath) {
      throw new CoreTransportError(
        "Integration Input Set did not expose its manifest path.",
        invocation,
      );
    }
    return {
      invocation,
      manifestPath: invocation.reportPath,
      manifestText,
    };
  }

  async clearRequestTemp(requestId: string): Promise<void> {
    await invoke("clear_core_request_temp", { requestId });
  }
}

function requireSuccessfulReportText(
  surfaceName: string,
  invocation: CoreInvocationResult,
): string {
  if (!invocation.processCompleted || invocation.timedOut || invocation.exitCode !== 0) {
    throw new CoreTransportError(
      formatInvocationFailure(`${surfaceName} export failed`, invocation),
      invocation,
    );
  }

  return requireReportText(surfaceName, invocation);
}

function requireReportText(
  surfaceName: string,
  invocation: CoreInvocationResult,
): string {
  if (!invocation.processCompleted || invocation.timedOut) {
    throw new CoreTransportError(
      formatInvocationFailure(`${surfaceName} process did not complete`, invocation),
      invocation,
    );
  }

  if (invocation.reportText === null || invocation.reportText.trim().length === 0) {
    throw new CoreTransportError(
      formatInvocationFailure(`${surfaceName} did not produce a structured report`, invocation),
      invocation,
    );
  }

  return invocation.reportText;
}

function formatInvocationFailure(
  prefix: string,
  invocation: CoreInvocationResult,
): string {
  const stderr = invocation.stderr.trim();
  const suffix = stderr.length > 0 ? `: ${stderr}` : "";
  return `${prefix} (exit ${invocation.exitCode ?? "unknown"})${suffix}`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
