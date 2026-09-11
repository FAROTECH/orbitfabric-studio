import { mockIPC } from "@tauri-apps/api/mocks";
import r1ResultText from "../../../tests/fixtures/sp3-r1/cosmos/integration_result.json?raw";
import r1AccountingText from "../../../tests/fixtures/sp3-r1/cosmos/verification_projection/scenario_projection_accounting.json?raw";
import r1PlanText from "../../../tests/fixtures/sp3-r1/cosmos/verification_projection/verification_projection_plan.json?raw";
import r1ProcedureText from "../../../tests/fixtures/sp3-r1/cosmos/verification_projection/cosmos/verification.py?raw";
import r1SuiteText from "../../../tests/fixtures/sp3-r1/cosmos/verification_projection/cosmos/verification_suite.py?raw";
import r1EvidenceText from "../../../tests/fixtures/sp3-r1/evidence-set.json?raw";

// Browser-only inspection of the real App with retained, freshly exported Core
// reports. This substitutes IPC and file selection, not the product consumer path.
// It is not a native runtime proof. The production entrypoint never imports it.
const acceptanceBaseUrl = import.meta.env.BASE_URL;
const reports = await fetch(`${acceptanceBaseUrl}.sp2-acceptance/reports.json`).then(response => {
  if (!response.ok) throw new Error("Generate .sp2-acceptance/reports.json before browser acceptance");
  return response.json();
});
const sourceCommit = await readSourceCommit();
if (sourceCommit) {
  const identity = document.createElement("aside");
  identity.id = "sp3-acceptance-source";
  identity.setAttribute("role", "note");
  identity.style.cssText = "box-sizing:border-box;width:100%;padding:8px 16px;background:#111827;color:#f9fafb;font:12px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace;overflow-wrap:anywhere";
  identity.textContent = `SP3 acceptance preview · ${sourceCommit.repository} · PR #${sourceCommit.pullRequest} · ${sourceCommit.commitSha}`;
  document.body.prepend(identity);
}
const scenarioCase = new URLSearchParams(location.search).get("scenario");
const evidenceCase = new URLSearchParams(location.search).get("evidence") === "r1";
const resultPath = "/retained/sp3-r1/cosmos/integration_result.json";
const evidencePath = "/retained/sp3-r1/evidence-set.json";
const resultArtifacts = new Map([
  ["verification_projection/scenario_projection_accounting.json", r1AccountingText],
  ["verification_projection/verification_projection_plan.json", r1PlanText],
  ["verification_projection/cosmos/verification.py", r1ProcedureText],
  ["verification_projection/cosmos/verification_suite.py", r1SuiteText],
]);
const evidenceReferences = new Map([
  ["cosmos/integration_result.json", r1ResultText],
  ["cosmos/verification_projection/scenario_projection_accounting.json", r1AccountingText],
]);

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, "0")).join("");
}

async function readSourceCommit(): Promise<{ repository: string; pullRequest: number; commitSha: string } | null> {
  try {
    const response = await fetch(`${acceptanceBaseUrl}source-commit.json`);
    if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) return null;
    const value = await response.json();
    if (typeof value?.repository !== "string" || typeof value?.pull_request !== "number" || !/^[0-9a-f]{40}$/.test(value?.commit_sha)) {
      throw new Error("Invalid SP3 acceptance source identity");
    }
    return { repository: value.repository, pullRequest: value.pull_request, commitSha: value.commit_sha };
  } catch (error) {
    if (acceptanceBaseUrl !== "/") throw error;
    return null;
  }
}

mockIPC((command, args: any) => {
  if (command === "plugin:dialog|open") {
    if (args.options.directory) return reports.missionPath;
    if (evidenceCase && args.options.title === "Load exact Integration Result") return resultPath;
    if (evidenceCase && args.options.title === "Load retained Evidence Set") return evidencePath;
    return reports.scenarioPath;
  }
  if (command === "resolve_mission_source") return { selectedPath: reports.missionPath, missionDir: reports.missionPath };
  if (command === "clear_core_request_temp") return null;
  if (command === "run_core_export_scenario_declaration" && scenarioCase === "failed") {
    if (!reports.failedScenarioInvocation) throw new Error("Regenerate reports with the failed Scenario fixture");
    return reports.failedScenarioInvocation;
  }
  if (Object.hasOwn(reports.invocations, command)) return reports.invocations[command];
  if (evidenceCase && command === "read_integration_result_bundle") {
    if (args.path !== resultPath) throw new Error("Unexpected Result identity");
    const result = JSON.parse(r1ResultText);
    return Promise.all(result.artifacts.map(async (artifact: any) => {
      const text = resultArtifacts.get(artifact.path);
      return {
        artifactId: artifact.id,
        path: `${resultPath.slice(0, resultPath.lastIndexOf("/") + 1)}${artifact.path}`,
        contained: text !== undefined,
        exists: text !== undefined,
        sha256Matches: text !== undefined && await sha256(text) === artifact.sha256,
      };
    })).then(artifactChecks => ({ resultPath, resultText: r1ResultText, artifactChecks }));
  }
  if (evidenceCase && command === "read_integration_text_file" && args.path === evidencePath) {
    return { path: evidencePath, text: r1EvidenceText };
  }
  if (evidenceCase && command === "read_retained_reference") {
    const parentText = args.parentPath === resultPath ? r1ResultText : args.parentPath === evidencePath ? r1EvidenceText : null;
    const text = args.parentPath === resultPath ? resultArtifacts.get(args.relativePath) : evidenceReferences.get(args.relativePath);
    if (parentText === null) throw new Error("Unexpected retained parent identity");
    return Promise.all([sha256(parentText), text === undefined ? null : sha256(text)]).then(([parentSha, actualSha]) => {
      if (parentSha !== args.parentSha256) return { status: "failure", path: null, sha256: null, text: null, reason: "Parent digest mismatch" };
      if (text === undefined) return { status: "missing", path: null, sha256: null, text: null, reason: "Missing browser fixture" };
      if (actualSha !== args.expectedSha256) return { status: "digest_mismatch", path: null, sha256: actualSha, text: null, reason: "Fixture digest mismatch" };
      return { status: "verified", path: `${args.parentPath.slice(0, args.parentPath.lastIndexOf("/") + 1)}${args.relativePath}`, sha256: actualSha, text, reason: null };
    });
  }
  throw new Error(`Outside browser Scenario acceptance scope: ${command}`);
});
await import("../../../src/main");
