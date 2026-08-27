import { invoke } from "@tauri-apps/api/core";

import type {
  CoreGateway,
  CoreIntegrationInputExport,
  CoreSurfaceResult,
} from "./CoreGateway";
import type {
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

  async probeCore(executable: string): Promise<CoreProbeResult> {
    const invocation = await invoke<CoreInvocationResult>("run_core_version", {
      executable,
    });

    if (!invocation.processCompleted || invocation.timedOut || invocation.exitCode !== 0) {
      throw new CoreTransportError(
        formatInvocationFailure("Unable to start compatible OrbitFabric Core", invocation),
        invocation,
      );
    }

    const versionText = invocation.stdout.trim();
    const match = /^orbitfabric\s+([^\s]+)$/im.exec(versionText);

    return {
      executable,
      versionText,
      orbitfabricVersion: match?.[1] ?? null,
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

    // Lint deliberately may exit non-zero while still producing a valid semantic report.
    const reportText = requireReportText("Lint Report", invocation);
    return {
      invocation,
      surface: parseLintReport(reportText),
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

    // Core may return a non-zero status while still emitting a coherent manifest that
    // explains why the set is unavailable/incomplete. Preserve that structured evidence.
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
