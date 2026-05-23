# OrbitFabric Studio v0.7.0 PR Plan
# Scenario Evidence Explorer

## Purpose

This document defines the proposed pull request sequence for OrbitFabric Studio v0.7.0.

The goal of v0.7.0 is to introduce a Scenario Evidence Explorer that consumes OrbitFabric Core-produced scenario outputs without introducing private scenario semantics inside Studio.

This plan is intentionally incremental.

Each PR must preserve the existing Studio boundaries:

```text
Studio remains downstream from OrbitFabric Core.
Core remains authoritative for scenario execution and scenario evidence.
Studio does not parse scenario YAML semantically.
Studio does not simulate independently.
Studio does not become mission control.
Studio does not expose command uplink behavior.
Studio does not expose live telemetry behavior.
Studio does not invent coverage percentages.
Studio does not edit Mission Model YAML.
Studio does not edit generated artifacts.
```

Reference milestone specification:

```text
docs/roadmap/studio-v0.7.0-scenario-evidence-explorer.md
```

## Proposed PR sequence

```text
PR 1 - Add Studio v0.7.0 Scenario Evidence specification
PR 2 - Add v0.7.0 release checklist and boundary gates
PR 3 - Add Scenario Sources list to Evidence surface
PR 4 - Add passive scenario report/log discovery and preview hooks
PR 5 - Add typed scenario report contract parser, only after Core schema is verified
PR 6 - Add Scenario Evidence surface rendering
PR 7 - Add controlled Core scenario run command, only after Core command is verified
PR 8 - Bind Scenario Evidence selections to the Inspector
PR 9 - Perform v0.7.0 regression and boundary pass
```

## PR 1 - Add Studio v0.7.0 Scenario Evidence specification

### Goal

Add the official v0.7.0 milestone specification.

This PR is documentation-only.

### Scope

```text
Add v0.7.0 milestone specification.
Define scenario evidence boundaries.
Define required Core outputs.
Define scenario source, evidence, report and log distinctions.
Define allowed and forbidden Studio behavior.
Define acceptance criteria.
```

### Files likely affected

```text
docs/roadmap/studio-v0.7.0-scenario-evidence-explorer.md
docs/roadmap/studio-v0.7.0-pr-plan.md
V0_7_RELEASE_CHECKLIST.md
possibly ROADMAP.md
```

### Non-goals

```text
No application code changes.
No backend command changes.
No scenario execution.
No scenario report parser.
No UI implementation.
No React Flow.
No graph UI.
```

### Acceptance criteria

```text
v0.7.0 has a documented scope.
Required Core outputs are explicit.
Scenario execution remains Core-owned.
Private scenario simulation is explicitly forbidden.
Coverage is deferred unless Core-derived.
```

## PR 2 - Add v0.7.0 release checklist and boundary gates

### Goal

Add a release checklist that prevents v0.7.0 from crossing Studio boundaries.

### Scope

```text
Add V0_7_RELEASE_CHECKLIST.md.
Define build checks.
Define manual workspace checks.
Define Core command checks.
Define no-goal checks.
Define evidence/report/log boundary checks.
```

### Files likely affected

```text
V0_7_RELEASE_CHECKLIST.md
```

### Non-goals

```text
No code changes.
No scenario execution.
No Core command implementation.
```

### Acceptance criteria

```text
Checklist includes build checks.
Checklist includes scenario source checks.
Checklist includes report/log checks.
Checklist includes explicit no graph, no mission control, no live telemetry and no command uplink checks.
```

## PR 3 - Add Scenario Sources list to Evidence surface

### Goal

Turn the reserved Evidence surface into a passive scenario source inspection surface.

This is the safest first implementation step because Studio already detects scenario files structurally.

### Scope

```text
Render workspace.scenario_files in the Evidence surface.
Show scenario name and path.
Allow read-only preview through the existing text viewer.
Show SOURCE, SCENARIO SOURCE and READ-ONLY badges.
Show empty state when no scenario files exist.
Update Inspector for selected scenario source, if low-risk.
```

### Files likely affected

```text
src/App.tsx
src/Badges.tsx, only if a badge helper needs no semantic expansion
src/styles.css
```

### Non-goals

```text
No scenario execution.
No scenario YAML semantic parsing.
No expectation extraction.
No timeline extraction.
No status inference.
No evidence inference.
```

### Acceptance criteria

```text
Evidence surface is no longer only a generic reserved placeholder.
Scenario files are listed from WorkspaceInspection.scenario_files.
Scenario files open read-only.
No scenario behavior is inferred.
```

## PR 4 - Add passive scenario report/log discovery and preview hooks

### Goal

Prepare scenario evidence artifact visibility without parsing unsupported semantics.

### Scope

```text
Show existing generated reports and logs that may be scenario-related only if documented by path or recognized by explicit Core naming.
Keep unrecognized reports/logs preview-only.
Reuse the existing read-only preview mechanism.
Preserve Generated Artifact Explorer behavior.
```

### Files likely affected

```text
src/GeneratedArtifactExplorer.tsx
src/App.tsx
src/styles.css
```

### Non-goals

```text
No log parsing.
No scenario report parser unless schema exists.
No status inference from filename.
No evidence inference from text.
```

### Acceptance criteria

```text
Scenario-related report/log candidates are visible only through conservative classification.
Unsupported reports/logs remain preview-only.
No private semantics are assigned.
```

## PR 5 - Add typed scenario report contract parser, only after Core schema is verified

### Goal

Add TypeScript types and parser for the Core scenario report schema.

This PR must not be started until the real Core output schema is verified.

### Scope

```text
Add CoreScenarioReport types.
Add parseCoreScenarioReport.
Validate kind, version, mission identity, scenario identity, status/result and expected sections.
Reject unsupported report shapes.
Add tests manually through build and UI inspection if no test framework exists.
```

### Files likely affected

```text
src/coreReports.ts
src/types/workspace.ts
```

### Required Core dependency

A real scenario report schema, for example:

```text
kind: orbitfabric.scenario_report
report_version: <version>
```

Exact fields must come from OrbitFabric Core.

### Non-goals

```text
No scenario execution.
No evidence rendering beyond parser validation.
No private fallback parser.
No log-derived evidence.
```

### Acceptance criteria

```text
Recognized scenario reports parse successfully.
Unrecognized reports return null.
No UI invents missing fields.
```

## PR 6 - Add Scenario Evidence surface rendering

### Goal

Render parsed Core scenario report content in the Evidence surface.

### Scope

```text
Scenario identity panel.
Scenario status/result panel.
Expectations list.
Passed expectations.
Failed expectations.
Timeline.
Evidence records.
Events.
Telemetry effects.
Mode changes.
Produced or expected data products.
Raw JSON preview.
Associated report/log references.
```

Only sections present in Core output may be rendered as semantic sections.

### Files likely affected

```text
src/App.tsx
src/coreReports.ts
src/types/workspace.ts
src/styles.css
possibly src/ScenarioEvidenceExplorer.tsx if extracted
```

### Non-goals

```text
No private scenario execution.
No private scenario interpretation.
No graph UI.
No coverage.
No mission health.
```

### Acceptance criteria

```text
Scenario result is displayed from Core output.
Expectation status is displayed from Core output.
Timeline records are displayed from Core output.
Evidence records are displayed from Core output.
Unknown record types remain visible and marked as unknown.
```

## PR 7 - Add controlled Core scenario run command, only after Core command is verified

### Goal

Allow Studio to run a scenario through a fixed OrbitFabric Core command if the command is real and documented.

### Scope

```text
Add a dedicated Tauri command for Core scenario execution.
Validate workspace-contained mission directory.
Validate workspace-contained scenario file.
Write report to a Studio-controlled generated/reports path.
Return raw stdout, stderr, exit code and report content.
Add frontend action that is disabled unless prerequisites are met.
```

### Files likely affected

```text
src-tauri/src/lib.rs
src/App.tsx
src/types/workspace.ts
src/coreReports.ts
src/styles.css
```

### Required Core dependency

A verified Core command.

Candidate command shape must not be assumed.

### Non-goals

```text
No arbitrary Core command entry.
No arbitrary CLI arguments.
No shell plugin.
No command uplink.
No live runtime execution.
No private scenario runner.
```

### Acceptance criteria

```text
Scenario execution uses only a fixed backend command.
Button is disabled when prerequisites are missing.
Raw command output remains visible.
JSON report is loaded only from the Studio-controlled report path.
```

## PR 8 - Bind Scenario Evidence selections to the Inspector

### Goal

Make scenario evidence selection consistent with the v0.6.0 inspector pattern.

### Scope

Support Inspector detail for:

```text
scenario source
scenario report
timeline record
expectation
evidence record
event
telemetry effect
mode change
data product evidence
scenario log
```

### Files likely affected

```text
src/App.tsx
possibly src/ScenarioEvidenceExplorer.tsx
src/styles.css
```

### Non-goals

```text
No invented links.
No source line/column navigation unless Core provides metadata.
No relationship inference.
No graph view.
No editing.
```

### Acceptance criteria

```text
Selecting scenario/evidence objects updates the Inspector.
Inspector shows identity, provenance, status and raw metadata.
Inspector shows source/report/log references only when safe references exist.
```

## PR 9 - Perform v0.7.0 regression and boundary pass

### Goal

Close v0.7.0 with a dedicated regression pass.

### Scope

```text
Verify no scenario semantics are invented by Studio.
Verify no private runner exists.
Verify no graph UI exists.
Verify no React Flow dependency exists.
Verify no mission control wording exists.
Verify no command uplink wording exists.
Verify no live telemetry wording exists.
Verify no coverage percentages are invented.
Verify all previews are read-only.
Verify raw output remains visible.
Verify unknown records remain visible.
```

### Files likely affected

```text
src/*
src-tauri/src/lib.rs
docs/roadmap/*
V0_7_RELEASE_CHECKLIST.md
README.md
CHANGELOG.md
package.json
src-tauri/Cargo.toml
src-tauri/tauri.conf.json
```

Metadata files are updated only at release closure, not at the start of implementation.

### Non-goals

```text
No new feature implementation.
No v0.7.1 coverage implementation.
No v0.8.0 ground implementation.
No graph implementation.
No authoring implementation.
```

### Acceptance criteria

```text
v0.7.0 acceptance criteria are satisfied.
Build passes.
Manual workspace scenario inspection passes.
No boundary is weakened.
```

## Recommended merge discipline

The recommended merge order is the PR order.

Do not start PR 5, PR 6 or PR 7 until the required Core outputs are verified.

Safe early work:

```text
PR 1
PR 2
PR 3
```

Conditional work:

```text
PR 4, if report/log naming is documented
PR 5, only after scenario report schema exists
PR 6, only after parser exists
PR 7, only after Core command is verified
PR 8, after at least one scenario evidence object exists
```

## Suggested branch names

```text
docs/studio-v07-scenario-evidence-spec
docs/studio-v07-release-checklist
feat/studio-v07-scenario-source-list
feat/studio-v07-passive-evidence-artifacts
feat/studio-v07-scenario-report-parser
feat/studio-v07-evidence-surface
feat/studio-v07-core-scenario-command
feat/studio-v07-evidence-inspector
chore/studio-v07-regression-pass
```

## Suggested issue titles

```text
[Studio v0.7.0] Add Scenario Evidence specification
[Studio v0.7.0] Add release checklist and boundary gates
[Studio v0.7.0] Add Scenario Sources list
[Studio v0.7.0] Add passive scenario report/log discovery
[Studio v0.7.0] Add scenario report parser
[Studio v0.7.0] Add Scenario Evidence rendering
[Studio v0.7.0] Add controlled Core scenario command
[Studio v0.7.0] Bind evidence selections to Inspector
[Studio v0.7.0] Perform regression and boundary pass
```

## Completion definition

v0.7.0 is complete when Studio can inspect Core-produced scenario evidence through the v0.6.0 shell while preserving the boundary between scenario source, Core-derived evidence, reports, logs, generated outputs and UI state.

Studio must not simulate independently, must not become mission control and must not invent scenario semantics.
