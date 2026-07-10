# E55 Core command handler seam audit

## 1. Purpose and baseline

E55 is a documentation-only audit checkpoint after E50-E54. It records the current Core command handler seam that remains owned by `src/App.tsx` and identifies the safest sequence for any later refactor.

E55 introduces no runtime changes and no source-code changes. The baseline for this audit is the current repository state after E54, with the prior documentation checkpoints in `docs/source-refactor-checkpoint-e37-e43.md`, `docs/app-cleanup-checkpoint-e45-e48.md`, and `docs/app-refactor-checkpoint-e50-e53.md`.

## 2. Current Core command handler inventory

All current Core command handlers are local functions in `App()`. They call the shared `runCoreCommand()` helper except when a precondition fails.

### `handleCoreVersion`

- Tauri command name: `run_core_version`.
- Required workspace input: none. This handler does not read `workspace`.
- Payload fields: `executable: coreExecutable`.
- Precondition checks: none.
- Error message behavior: no command-specific precondition error; failures from `invoke()` are converted by `runCoreCommand()` into `coreError`.
- Generated-artifact refresh behavior: none.
- Other local state side effects: only shared `runCoreCommand()` effects.

### `handleCoreInspectMission`

- Tauri command name: `run_core_inspect_mission`.
- Required workspace input: `workspace?.mission_dir`.
- Payload fields: `executable: coreExecutable`, `missionDir: workspace.mission_dir`.
- Precondition checks: returns early when `workspace?.mission_dir` is missing.
- Error message behavior: sets `coreError` to `No mission directory is available for Core inspection.` when the precondition fails; `invoke()` failures are handled by `runCoreCommand()`.
- Generated-artifact refresh behavior: none.
- Other local state side effects: only shared `runCoreCommand()` effects when the precondition passes.

### `handleCoreLintMission`

- Tauri command name: `run_core_lint_mission`.
- Required workspace input: `workspace?.mission_dir`.
- Payload fields: `executable: coreExecutable`, `missionDir: workspace.mission_dir`.
- Precondition checks: returns early when `workspace?.mission_dir` is missing.
- Error message behavior: sets `coreError` to `No mission directory is available for Core lint.` when the precondition fails; `invoke()` failures are handled by `runCoreCommand()`.
- Generated-artifact refresh behavior: none.
- Other local state side effects: only shared `runCoreCommand()` effects when the precondition passes.

### `handleCoreExportModelSummary`

- Tauri command name: `run_core_export_model_summary`.
- Required workspace input: `workspace?.mission_dir`.
- Payload fields: `executable: coreExecutable`, `missionDir: workspace.mission_dir`.
- Precondition checks: returns early when `workspace?.mission_dir` is missing.
- Error message behavior: sets `coreError` to `No mission directory is available for Core model summary export.` when the precondition fails; `invoke()` failures are handled by `runCoreCommand()`.
- Generated-artifact refresh behavior: none.
- Other local state side effects: only shared `runCoreCommand()` effects when the precondition passes.

### `handleCoreExportEntityIndex`

- Tauri command name: `run_core_export_entity_index`.
- Required workspace input: `workspace?.mission_dir`.
- Payload fields: `executable: coreExecutable`, `missionDir: workspace.mission_dir`.
- Precondition checks: returns early when `workspace?.mission_dir` is missing.
- Error message behavior: sets `coreError` to `No mission directory is available for Core entity index export.` when the precondition fails; `invoke()` failures are handled by `runCoreCommand()`.
- Generated-artifact refresh behavior: none.
- Other local state side effects: only shared `runCoreCommand()` effects when the precondition passes.

### `handleCoreExportRelationshipManifest`

- Tauri command name: `run_core_export_relationship_manifest`.
- Required workspace input: `workspace?.mission_dir`.
- Payload fields: `executable: coreExecutable`, `missionDir: workspace.mission_dir`.
- Precondition checks: returns early when `workspace?.mission_dir` is missing.
- Error message behavior: sets `coreError` to `No mission directory is available for Core relationship manifest export.` when the precondition fails; `invoke()` failures are handled by `runCoreCommand()`.
- Generated-artifact refresh behavior: none.
- Other local state side effects: only shared `runCoreCommand()` effects when the precondition passes.

### `handleCoreExportDashboardSummary`

- Tauri command name: `run_core_export_dashboard_summary`.
- Required workspace input: `workspace?.mission_dir`.
- Payload fields: `executable: coreExecutable`, `missionDir: workspace.mission_dir`.
- Precondition checks: returns early when `workspace?.mission_dir` is missing.
- Error message behavior: sets `coreError` to `No mission directory is available for Core dashboard summary export.` when the precondition fails; `invoke()` failures are handled by `runCoreCommand()`.
- Generated-artifact refresh behavior: increments `generatedArtifactRefreshToken` only when the returned `result?.json_report_available` is truthy.
- Other local state side effects: shared `runCoreCommand()` effects when the precondition passes.

### `handleCoreExportScenarioRunIndex`

- Tauri command name: `run_core_export_scenario_run_index`.
- Required workspace input: `workspace` and `workspace.selected_path`.
- Payload fields: `executable: coreExecutable`, `workspacePath: workspace.selected_path`.
- Precondition checks: returns early when `workspace` is missing.
- Error message behavior: sets `coreError` to `No workspace is available for Core scenario run index export.` when the precondition fails; `invoke()` failures are handled by `runCoreCommand()`.
- Generated-artifact refresh behavior: increments `generatedArtifactRefreshToken` only when the returned `result?.json_report_available` is truthy.
- Other local state side effects: shared `runCoreCommand()` effects when the precondition passes.

### `handleCoreExportCoverageSummary`

- Tauri command name: `run_core_export_coverage_summary`.
- Required workspace input: `workspace?.mission_dir`.
- Payload fields: `executable: coreExecutable`, `missionDir: workspace.mission_dir`.
- Precondition checks: returns early when `workspace?.mission_dir` is missing.
- Error message behavior: sets `coreError` to `No mission directory is available for Core coverage summary export.` when the precondition fails; `invoke()` failures are handled by `runCoreCommand()`.
- Generated-artifact refresh behavior: increments `generatedArtifactRefreshToken` only when the returned `result?.json_report_available` is truthy.
- Other local state side effects: shared `runCoreCommand()` effects when the precondition passes.

### `handleCoreSimScenario`

- Tauri command name: `run_core_sim_scenario`.
- Required workspace input: `workspace`, `workspace.selected_path`, and the supplied `ProjectEntry` scenario.
- Payload fields: `executable: coreExecutable`, `workspacePath: workspace.selected_path`, `scenarioFile: scenario.path`.
- Precondition checks: returns early when `workspace` is missing; returns early when `scenario.kind !== "file"`.
- Error message behavior: sets `coreError` to `No workspace is available for Core scenario execution.` when `workspace` is missing; sets `coreError` to `Only scenario source files can be executed through Core.` when the supplied scenario is not a file; `invoke()` failures are handled by `runCoreCommand()`.
- Generated-artifact refresh behavior: increments `generatedArtifactRefreshToken` only when the returned `result?.json_report_available` is truthy.
- Other local state side effects: clears `selectedSimulationRecord` before invoking `runCoreCommand()`.

## 3. State dependency map

### State read by command handlers

- `workspace`: read by every handler except `handleCoreVersion`; handlers use either `workspace?.mission_dir` or `workspace.selected_path` depending on command payload requirements.
- `coreExecutable`: read by every Core handler and passed as the `executable` payload field.

### State written by command handlers

- `coreError`: written directly by command-specific precondition failures and by `runCoreCommand()`.
- `generatedArtifactRefreshToken`: incremented by `handleCoreExportDashboardSummary`, `handleCoreExportScenarioRunIndex`, `handleCoreExportCoverageSummary`, and `handleCoreSimScenario` when `result?.json_report_available` is truthy.
- `selectedSimulationRecord`: cleared by `handleCoreSimScenario` before command execution.

### State read or written by shared execution logic

- `coreResult`: cleared before each command and set to the returned `CoreCommandResult` by `runCoreCommand()`.
- `coreReportSnapshots`: read and written through the functional `setCoreReportSnapshots()` update in `updateCoreReportSnapshots()`.
- `coreError`: cleared before each command, then set from caught failures when `invoke()` throws.
- `isRunningCoreCommand`: set to `true` before `invoke()` and reset to `false` in `finally`.
- `selectedDetail`: set by `runCoreCommand()` to a `core-output` detail based on the returned result.

## 4. Shared command execution responsibilities

`runCoreCommand()` currently owns these responsibilities exactly:

- clearing the previous Core error with `setCoreError(null)`;
- clearing the previous Core result with `setCoreResult(null)`;
- setting command-running state with `setIsRunningCoreCommand(true)`;
- invoking the Tauri command through `invoke<CoreCommandResult>(commandName, payload)`;
- storing the returned result with `setCoreResult(result)`;
- creating the Core output inspector detail with `kind: "core-output"`, `title: result.command`, and `source: result.args.join(" ") || "fixed Core command"`;
- updating report snapshots by calling `updateCoreReportSnapshots(result)`;
- converting caught failures to a string with `caught instanceof Error ? caught.message : String(caught)` and storing that value in `coreError`;
- clearing command-running state in `finally` with `setIsRunningCoreCommand(false)`;
- returning either the `CoreCommandResult` or `null`.

No behavior changes are proposed by this audit.

## 5. Report snapshot update responsibilities

`updateCoreReportSnapshots()` currently owns these responsibilities exactly:

- obtains report content from `result.json_report_content ?? null`;
- returns without updating state when there is no report content;
- parses every supported Core report type from the same content string using `parseCoreLintReport()`, `parseCoreModelSummary()`, `parseCoreEntityIndex()`, `parseCoreRelationshipManifest()`, `parseCoreDashboardSummary()`, `parseCoreScenarioRunIndex()`, `parseCoreCoverageSummary()`, and `parseCoreSimulationReport()`;
- returns without updating state when no recognized report exists;
- preserves previous snapshot values when a parser returns `null`, using the existing `current` values inside the functional `setCoreReportSnapshots()` update;
- upserts simulation reports by scenario through `upsertSimulationReport(current.simulationReports, simulationReport)` when a simulation report is recognized;
- commits the resulting state through `setCoreReportSnapshots()`.

`CoreReportSnapshots`, `createEmptyCoreReportSnapshots()`, and `upsertSimulationReport()` already live in `src/coreReportSnapshots.ts`.

## 6. Coupling and risk assessment

The current seam includes several distinct concerns:

- command-specific preconditions: local checks for `workspace`, `workspace?.mission_dir`, and `scenario.kind`;
- payload construction: command-specific payload objects using `coreExecutable`, `missionDir`, `workspacePath`, and `scenarioFile`;
- Tauri command execution: the `invoke<CoreCommandResult>()` call inside `runCoreCommand()`;
- result/loading/error state: `coreResult`, `isRunningCoreCommand`, and `coreError` updates;
- inspector selection side effects: `selectedDetail` updates for Core output inspection;
- report parsing and snapshot merging: parser calls and `setCoreReportSnapshots()` updates;
- generated-artifact refresh side effects: `generatedArtifactRefreshToken` increments for commands that produce available JSON reports;
- scenario-specific selection side effects: `selectedSimulationRecord` clearing before scenario execution.

Extracting all of these concerns together into a hook or controller would combine command payload rules, React state transitions, Tauri integration, inspector routing state, report parsing, generated-artifact refresh behavior, and scenario UI selection behavior in one PR. That would make the diff unnecessarily broad and risky because behavior-preserving review would need to validate many independent responsibilities at once.

## 7. Evaluated refactor options

### 1. Leave the complete seam in `App.tsx`

- Benefits: lowest immediate risk; no behavior changes; preserves current command, state, and UI coupling exactly.
- Drawbacks: `App.tsx` continues to own command preconditions, payloads, Tauri execution, snapshot updates, and side effects.
- Recommended now: yes for E55, because this task is documentation-only and does not approve implementation changes.

### 2. Extract only pure helpers

- Benefits: can reduce local complexity without moving React state or Tauri execution.
- Drawbacks: helper boundaries must be chosen carefully to avoid hiding current state dependencies or changing parser precedence.
- Recommended now: not as part of E55; potentially suitable only after a separate narrow implementation task is approved.

### 3. Extract payload builders

- Benefits: could isolate command payload construction from UI handlers.
- Drawbacks: payload construction is still tightly coupled to command-specific preconditions and exact workspace fields; extracting builders first may create abstractions around unstable seams.
- Recommended now: no.

### 4. Extract a React hook

- Benefits: could group Core command state and handlers behind a React API.
- Drawbacks: would likely move many concerns at once, including loading, errors, inspector selection, report snapshots, generated-artifact refresh, and scenario-specific side effects.
- Recommended now: no.

### 5. Extract a service/controller

- Benefits: could separate command orchestration from `App.tsx` over time.
- Drawbacks: current orchestration is not purely service-like because it includes React state setters and UI selection side effects; a controller extraction would be broad and hard to validate as behavior-preserving.
- Recommended now: no.

### 6. Split report snapshot transformation before touching command handlers

- Benefits: targets the most self-contained part of the seam; can be expressed as a pure transformation over current snapshots and Core report content or command result; avoids Tauri and UI side effects.
- Drawbacks: still requires careful validation of parser order, null preservation, and simulation report upsert behavior.
- Recommended now: yes as the safest candidate for a future narrow implementation gate, not as an E55 change.

## 8. Recommended staged direction

The recommendation is conservative. The safest first possible code seam is a pure report-snapshot transformation that:

- receives the current `CoreReportSnapshots`;
- receives Core JSON report content, or the command result;
- parses recognized report types;
- returns either the unchanged snapshots or the next snapshots;
- performs no React state updates;
- performs no Tauri calls;
- performs no UI or routing effects.

This audit does not prescribe a final function name or final target file. The existing dependency structure only makes it clear that the candidate seam should remain pure and should operate around `CoreReportSnapshots` and the existing parser functions.

`runCoreCommand()`, command-specific handlers, and React side effects should remain in `App.tsx` until separately audited.

## 9. Candidate follow-up gates

Candidate follow-up gates, not approved implementation commitments:

1. Extract a pure snapshot transformation while preserving current parser behavior, null preservation, and simulation report upsert behavior.
2. Add a validation checkpoint after that extraction to confirm runtime behavior, UI behavior, Core command behavior, generated-artifact behavior, and snapshot precedence remain unchanged.
3. Only after that checkpoint, reassess whether command payload construction or handler extraction has a narrow enough seam for a separate audit and implementation task.

## 10. Hard invariants

- E28 visual baseline remains governing.
- Runtime behavior unchanged.
- UI and layout unchanged.
- No CSS changes.
- No routing changes.
- No Core command behavior changes.
- No Core/model-data semantic changes.
- No generated-artifact behavior changes.
- No package or package-lock changes.
- No Tauri/Rust changes.
- No packaging, branding, logo or icon changes.
- Studio remains read-only and downstream from OrbitFabric Core.
- No React Flow or similar dependency.
- No broad formatting or unrelated cleanup.

## 11. Explicit non-goals

E55 does not:

- extract any source code;
- add a hook;
- add a service or controller;
- change payloads;
- rename commands;
- change Tauri invocation behavior;
- modify report parsing;
- modify snapshot precedence;
- modify error strings;
- modify inspector behavior;
- modify generated-artifact refresh behavior;
- modify scenario execution;
- modify UI, CSS or routing.
