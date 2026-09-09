import { mockIPC } from "@tauri-apps/api/mocks";

// Browser-only inspection of the real App with retained, freshly exported Core
// reports. This substitutes IPC and file selection, not the product consumer path.
// It is not a native runtime proof. The production entrypoint never imports it.
const reports = await fetch("/.sp2-acceptance/reports.json").then(response => {
  if (!response.ok) throw new Error("Generate .sp2-acceptance/reports.json before browser acceptance");
  return response.json();
});
mockIPC((command, args: any) => {
  if (command === "plugin:dialog|open") return args.options.directory ? reports.missionPath : reports.scenarioPath;
  if (command === "resolve_mission_source") return { selectedPath: reports.missionPath, missionDir: reports.missionPath };
  if (command === "clear_core_request_temp") return null;
  if (Object.hasOwn(reports.invocations, command)) return reports.invocations[command];
  throw new Error(`Outside browser Scenario acceptance scope: ${command}`);
});
await import("../../../src/main");
