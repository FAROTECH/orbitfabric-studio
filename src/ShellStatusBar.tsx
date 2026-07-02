import { useCallback, useEffect, useState } from "react";

import {
  captureActiveSurface,
} from "./devSurfaceCapture";
import type { ActiveSurface, TargetDomainId } from "./navigationModel";
import type { CoreCommandResult, WorkspaceInspection } from "./types/workspace";
import { StudioIcon } from "./StudioIcon";

import "./shellStatusBar.css";
import "./devSurfaceCapture.css";

export interface ShellStatusBarProps {
  workspace: WorkspaceInspection | null;
  activeSurface: ActiveSurface;
  activeNavigationId: TargetDomainId;
  coreResult: CoreCommandResult | null;
}

type DevCaptureState = "idle" | "capturing" | "saved" | "failed";

export function ShellStatusBar({
  workspace,
  activeSurface,
  activeNavigationId,
  coreResult,
}: ShellStatusBarProps) {
  const workspacePath = workspace?.selected_path ?? "No workspace";
  const coreCommandState = coreResult
    ? coreResult.success
      ? "OK"
      : "FAIL"
    : "Idle";
  const [captureState, setCaptureState] = useState<DevCaptureState>("idle");
  const [captureMessage, setCaptureMessage] = useState("Ready");

  const handleCapture = useCallback(
    async () => {
      if (captureState === "capturing") {
        return;
      }

      setCaptureState("capturing");
      setCaptureMessage("Surface");

      try {
        const filename = await captureActiveSurface(
          {
            activeSurface,
            activeNavigationId,
          },
          "current-window",
        );

        setCaptureState("saved");
        setCaptureMessage(filename);
        window.setTimeout(() => {
          setCaptureState("idle");
          setCaptureMessage("Ready");
        }, 2400);
      } catch (caught) {
        setCaptureState("failed");
        setCaptureMessage(caught instanceof Error ? caught.message : String(caught));
        window.setTimeout(() => {
          setCaptureState("idle");
          setCaptureMessage("Ready");
        }, 3600);
      }
    },
    [activeNavigationId, activeSurface, captureState],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "c" || event.metaKey) {
        return;
      }

      if (event.altKey && event.shiftKey && !event.ctrlKey) {
        event.preventDefault();
        void handleCapture();
        return;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleCapture]);

  return (
    <footer
      className="shell-status-bar reference-status-bar reference-status-bar-runtime"
      aria-label="Studio shell status bar"
    >
      <div className="reference-status-workspace reference-status-real" title={workspacePath}>
        <span className="reference-status-dot reference-status-dot-real" aria-hidden="true" />
        <strong>Workspace</strong>
        <span>{workspacePath}</span>
      </div>

      <div className="reference-status-item reference-status-readonly reference-status-real">
        <StudioIcon kind="status-readonly" className="reference-status-glyph" />
        <strong>Read-only</strong>
        <em>Core-owned</em>
      </div>

      <div
        className={`reference-status-item reference-status-core reference-status-real reference-status-core-${coreCommandState.toLowerCase()}`}
        title={coreResult ? "Latest Core action result" : "No Core action in this session"}
      >
        <StudioIcon kind="status-core" className="reference-status-glyph" />
        <strong>Core</strong>
        <em>{coreCommandState}</em>
      </div>

      <div className="reference-status-item reference-status-surface reference-status-real">
        <span>Surface</span>
        <strong>{formatActiveSurface(activeSurface, activeNavigationId)}</strong>
      </div>

      <SurfaceCaptureControls
        captureState={captureState}
        message={captureMessage}
        onCapture={handleCapture}
      />
    </footer>
  );
}

function SurfaceCaptureControls({
  captureState,
  message,
  onCapture,
}: {
  captureState: DevCaptureState;
  message: string;
  onCapture: () => void;
}) {
  const isCapturing = captureState === "capturing";

  return (
    <div
      className={["reference-status-capture", `reference-status-capture-${captureState}`]
        .filter(Boolean)
        .join(" ")}
      aria-label="Surface capture controls"
    >
      <strong className="reference-status-capture-label">Capture</strong>
      <button
        type="button"
        onClick={onCapture}
        disabled={isCapturing}
        title="Capture active Studio surface as PNG. Shortcut: Option+Shift+C"
      >
        <StudioIcon kind="capture" />
        Surface
      </button>
      <em>{message}</em>
    </div>
  );
}


function formatActiveSurface(activeSurface: ActiveSurface, activeNavigationId: TargetDomainId): string {
  switch (activeSurface) {
    case "mission-dashboard":
      return "Mission";
    case "model-inventory":
      return formatModelInventorySurface(activeNavigationId);
    case "core-commands":
      return "Core Report Runner";
    case "contracts":
      return "Contracts";
    case "relationships":
      return "Relationships";
    case "mission-data-flow-workbench":
      return "Data Flow";
    case "generated-artifacts":
      return "Artifacts";
    case "reports-logs":
      return "Reports";
    case "scenario-evidence":
      return "Scenarios";
    case "ground-integration":
      return "Ground";
    case "raw-output":
      return "Raw";
  }
}

function formatModelInventorySurface(activeNavigationId: TargetDomainId): string {
  switch (activeNavigationId) {
    case "spacecraft":
      return "Spacecraft";
    case "subsystems":
      return "Subsystems";
    case "modes":
      return "Modes";
    case "telemetry":
      return "Telemetry";
    case "commands":
      return "Commands";
    case "events":
      return "Events";
    case "faults":
      return "Faults";
    case "packets":
      return "Packets";
    case "payloads":
      return "Payloads";
    case "data-products":
      return "Data Products";
    case "contacts-downlink":
      return "Contacts & Downlink";
    case "commandability":
      return "Commandability";
    case "autonomy":
      return "Autonomy";
    default:
      return "Model";
  }
}
