# OrbitFabric Studio v0.7.1 PR Plan
# Dashboard and Coverage Foundation

## Purpose

This document defines the proposed pull request sequence for OrbitFabric Studio v0.7.1.

The goal is to consume Core-owned dashboard, scenario run and coverage reports without introducing private dashboard or coverage semantics inside Studio.

Reference milestone specification:

```text
docs/roadmap/studio-v0.7.1-dashboard-and-coverage-foundation.md
```

## Core baseline now available

The following candidate post-v1 Core surfaces are expected on OrbitFabric Core main:

```text
orbitfabric export dashboard-summary <mission_dir> --json <path>
orbitfabric export scenario-run-index --simulation-reports <dir> --json <path>
orbitfabric export coverage-summary <mission_dir> --entity-index <path> --relationship-manifest <path> --scenario-run-index <path> --json <path>
```

The existing simulation JSON report produced by `orbitfabric sim --json` now includes structured expectation accounting.

Studio must consume these outputs as Core-derived reports.

Studio must not calculate coverage privately.

## Proposed PR sequence

```text
PR 1 - Add v0.7.1 dashboard and coverage specification
PR 2 - Add v0.7.1 release checklist and boundary gates
PR 3 - Add TypeScript report contracts and parsers
PR 4 - Add fixed Core export command wrappers
PR 5 - Add dashboard summary rendering
PR 6 - Add scenario run index rendering
PR 7 - Add structured expectation accounting rendering
PR 8 - Add coverage summary rendering
PR 9 - Add dashboard navigation and Inspector bindings
PR 10 - Perform v0.7.1 regression and boundary pass
```

## PR 1 - Add v0.7.1 dashboard and coverage specification

### Goal

Document the milestone scope and Core-derived contract boundaries.

### Scope

```text
Add v0.7.1 milestone specification.
Define Core surfaces consumed.
Define report identity requirements.
Define allowed and forbidden Studio behavior.
Define acceptance criteria.
```

### Files likely affected

```text
docs/roadmap/studio-v0.7.1-dashboard-and-coverage-foundation.md
docs/roadmap/studio-v0.7.1-pr-plan.md
possibly ROADMAP.md
```

### Non-goals

```text
No application code.
No backend commands.
No parser implementation.
No UI implementation.
No release metadata update.
```

## PR 2 - Add v0.7.1 release checklist and boundary gates

### Goal

Add a release checklist that prevents v0.7.1 from crossing Core authority boundaries.

### Scope

```text
Add V0_7_1_RELEASE_CHECKLIST.md.
Add build checks.
Add manual workspace checks.
Add fixed Core command checks.
Add parser checks.
Add coverage boundary checks.
Add no-goal checks.
```

### Files likely affected

```text
V0_7_1_RELEASE_CHECKLIST.md
```

### Non-goals

```text
No runtime implementation.
No coverage calculations.
```

## PR 3 - Add TypeScript report contracts and parsers

### Goal

Add parsing support for the new Core reports and extended simulation JSON report fields.

### Scope

```text
CoreDashboardSummary types and parser.
CoreScenarioRunIndex types and parser.
CoreCoverageSummary types and parser.
Extended CoreSimulationReport expectation accounting fields.
Unsupported or unrecognized reports return null.
```

### Files likely affected

```text
src/types/workspace.ts
src/coreReports.ts
```

### Non-goals

```text
No UI cards.
No backend command wrappers.
No private fallback schemas.
No computed coverage.
```

## PR 4 - Add fixed Core export command wrappers

### Goal

Expose fixed Tauri commands for the new Core exports.

### Scope

```text
run_core_export_dashboard_summary
run_core_export_scenario_run_index
run_core_export_coverage_summary
Studio-controlled report paths under generated/reports
workspace-contained inputs
raw stdout, stderr and exit code preservation
JSON report loading from fixed output paths
```

### Files likely affected

```text
src-tauri/src/lib.rs
src/types/workspace.ts
src/App.tsx
```

### Non-goals

```text
No arbitrary command entry.
No arbitrary CLI argument field.
No shell plugin.
No coverage calculations in Rust.
```

## PR 5 - Add dashboard summary rendering

### Goal

Render Core `orbitfabric.dashboard_summary` as the first v0.7.1 dashboard foundation surface.

### Scope

```text
Mission identity.
Validation summary.
Model domain inventory.
Entity inventory.
Relationship inventory.
Coverage official unavailable state when reported by dashboard summary.
Boundary flags.
Raw report visibility.
```

### Files likely affected

```text
src/App.tsx
src/styles.css
possibly src/DashboardSurface.tsx if extracted
```

### Non-goals

```text
No model completeness score.
No mission health score.
No private coverage.
```

## PR 6 - Add scenario run index rendering

### Goal

Render Core `orbitfabric.scenario_run_index` for recent scenario run summaries.

### Scope

```text
Scenario run index identity.
Total, passed and failed run counts.
Run list.
Report path references.
Summary counts from indexed simulation reports.
Links to previewable reports when workspace-contained.
```

### Non-goals

```text
No deduplication by scenario id unless Core emits it.
No log parsing.
No inferred run history.
```

## PR 7 - Add structured expectation accounting rendering

### Goal

Use the extended `orbitfabric-sim` simulation JSON report fields.

### Scope

```text
Render expectations.total, expectations.passed and expectations.failed.
Render expectations.records[].
Preserve legacy failed_expectations rendering for compatibility.
Update Inspector binding for selected expectation records.
```

### Non-goals

```text
No passed expectation inference.
No timeline parsing.
No log parsing.
```

## PR 8 - Add coverage summary rendering

### Goal

Render Core `orbitfabric.coverage_summary` as the first real coverage surface in Studio.

### Scope

```text
Coverage report identity and boundary flags.
Scenario run coverage summary.
Entity coverage for Core-emitted domains.
Expectation coverage.
Relationship coverage.
Covered and uncovered ids.
Unsupported coverage scopes.
```

### Non-goals

```text
No frontend coverage math beyond displaying Core-emitted values.
No alternative denominators.
No model completeness score.
No mission health score.
No graph UI.
```

## PR 9 - Add dashboard navigation and Inspector bindings

### Goal

Make dashboard and coverage records inspectable through the existing Studio shell.

### Scope

```text
Selected dashboard card inspector context.
Selected scenario run inspector context.
Selected coverage record inspector context.
Safe navigation to Validation, Evidence, Contracts, Relationships and Artifacts surfaces.
```

### Non-goals

```text
No invented links.
No line or column jumps unless Core emits source locations.
No graph visualization.
```

## PR 10 - Perform v0.7.1 regression and boundary pass

### Goal

Close the milestone with a focused regression pass and release metadata update.

### Scope

```text
Run npm build.
Run cargo check.
Verify fixed Core command wrappers.
Verify parser null behavior for unsupported reports.
Verify no private coverage calculations.
Verify no mission health wording.
Verify no graph UI or React Flow dependency.
Update README, CHANGELOG, ROADMAP, package metadata and Tauri metadata at final closure only.
```

### Non-goals

```text
No new feature work.
No v0.8.0 ground implementation.
No v0.8.1 graph implementation.
No authoring.
```

## Recommended merge discipline

The recommended merge order is the PR order.

Do not start UI rendering before parser contracts exist.

Do not start coverage rendering before the fixed Core coverage-summary wrapper exists.

Do not update release metadata until the final regression PR.

## Suggested branch names

```text
studio-v071-plan
studio-v071-checklist
studio-v071-report-parsers
studio-v071-core-export-wrappers
studio-v071-dashboard-summary
studio-v071-scenario-run-index
studio-v071-expectation-accounting
studio-v071-coverage-summary
studio-v071-dashboard-inspector
studio-v071-release-closure
```

## Suggested issue titles

```text
[Studio v0.7.1] Add dashboard and coverage specification
[Studio v0.7.1] Add release checklist and boundary gates
[Studio v0.7.1] Add Core dashboard and coverage report parsers
[Studio v0.7.1] Add fixed Core export wrappers
[Studio v0.7.1] Render dashboard summary
[Studio v0.7.1] Render scenario run index
[Studio v0.7.1] Render structured expectation accounting
[Studio v0.7.1] Render coverage summary
[Studio v0.7.1] Bind dashboard and coverage selections to Inspector
[Studio v0.7.1] Perform regression and boundary pass
```

## Completion definition

v0.7.1 is complete when Studio can consume and render Core-owned dashboard, scenario run and coverage reports without calculating coverage privately and without implying live health, mission control, command uplink, graph behavior or editing.
