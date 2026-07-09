# OrbitFabric Studio v0.7.2 - Core-derived Dashboard UX Realization

## Status

```text
Milestone: v0.7.2 - Core-derived Dashboard UX Realization
Status: Implementation pass completed
Nature: visual and organizational UX realization slice
Primary loop: Open Dashboard -> Review Core-derived Cards -> Navigate Evidence, Model, Core, Artifact, Report and Output Surfaces
```

## Purpose

v0.7.2 turns the v0.7.1 dashboard and coverage foundation into a visibly stronger engineering cockpit.

This milestone is visual and organizational.

It does not introduce new mission semantics.

Studio remains downstream from OrbitFabric Core.

The dashboard and operational surfaces may become more compact, card-oriented and closer to the accepted target UX direction only when each displayed value is clearly one of:

```text
source model
Core-derived report
generated artifact
local UI state
unavailable state
reserved state
```

## Starting baseline

v0.7.1 already provided the functional foundation required for v0.7.2:

- Core dashboard summary report parsing and rendering;
- Core scenario run index report parsing and rendering;
- Core coverage summary report parsing and rendering;
- structured expectation accounting rendering for Core simulation reports;
- fixed backend wrappers for dashboard-summary, scenario-run-index and coverage-summary;
- UI bindings for the three Core exports;
- generated artifact recognition and preview binding for the new report types.

v0.7.2 preserved these existing surfaces.

v0.7.2 did not replace them with a separate dashboard semantics layer.

## Implemented surface pass

The v0.7.2 implementation pass covered the operational read-only Studio surfaces:

```text
Dashboard
Scenario Evidence
Model
Core Commands
Generated Artifacts
Reports and Logs
Contracts
Relationships
Raw Core Output
```

The Ground surface remains reserved for v0.8.0.

## Implemented capabilities

- Cockpit-style density and hierarchy applied to the Dashboard surface.
- Cockpit-style density and hierarchy applied to the Model surface.
- Cockpit-style density and hierarchy applied to the Core command surface.
- Cockpit-style density and hierarchy applied to the Generated Artifacts surface.
- Cockpit-style density and hierarchy applied to the Reports and Logs surface.
- Cockpit-style density and hierarchy applied to the Contracts surface.
- Cockpit-style density and hierarchy applied to the Relationships surface.
- Cockpit-style density and hierarchy applied to the Raw Core Output surface.
- Cockpit-style density and hierarchy applied to the Scenario Evidence surface.
- Dedicated stylesheet entry points added for the focused surface passes.
- Legacy workspace blocks visually suppressed only inside focused surfaces where they are not relevant.
- Raw Core Output selector corrected to target the actual Raw sidebar item.
- Scenario Evidence surface styled through its stable `#studio-evidence` root instead of sidebar position.

## Target UX direction

The target dashboard direction remains:

- a more compact application shell;
- a stronger dashboard header;
- a top row of Core-derived cards;
- clearer validation, model inventory, scenario evidence and coverage cards;
- generated artifact cards;
- explicit unavailable and reserved states;
- clearer visual hierarchy and density;
- navigation back to the existing read-only surfaces.

The target mockup is not a semantic specification.

Labels from the mockup may be reused only when they map to real source, Core-derived, generated or local UI state.

## Allowed dashboard data sources

| Dashboard area | Allowed source | Allowed display |
|---|---|---|
| Workspace status | `WorkspaceInspection` | selected path, mission directory state, scenarios directory state, generated directory state, source file counts, missing expected source files, warnings |
| Validation status | `CoreLintReport` or `CoreDashboardSummary.validation` | result, errors, warnings, info, findings count |
| Mission identity | `CoreDashboardSummary.mission` when available, otherwise workspace state only | mission id, mission name, model version, unavailable state |
| Model inventory | `CoreDashboardSummary.model_domains`, `CoreDashboardSummary.entity_inventory`, `CoreEntityIndex` | required and optional domain counts, entity totals, per-domain counts |
| Relationship inventory | `CoreDashboardSummary.relationship_inventory`, `CoreRelationshipManifest` | relationship totals and relationship type counts |
| Scenario runs | `CoreScenarioRunIndex` | total runs, passed, failed, Core-emitted run records |
| Scenario evidence | `CoreSimulationReport` and `CoreScenarioRunIndex` | simulation report result, timeline count, events, commands, mode transitions, data-flow evidence, expectation accounting when emitted |
| Coverage | `CoreCoverageSummary` | scenario run context, entity coverage, expectation coverage, relationship coverage, unsupported scopes |
| Generated artifacts | `GeneratedArtifactInventory` and `GeneratedArtifactDashboardSummary` | total, known, unknown, previewable, not previewable, warnings, generated classes |
| Report availability | `CoreCommandResult` and generated artifact inventory | JSON report available, log available, unavailable state |
| Reserved future surfaces | roadmap state | reserved graph, ground, authoring or plugin states with explicit non-operational wording |

## Disallowed dashboard behavior

v0.7.2 must not implement:

- private coverage calculation;
- frontend-defined denominators;
- alternative coverage percentages;
- mission health score;
- model completeness score unless Core defines it;
- scenario run history inferred from logs;
- scenario-id deduplication in Studio;
- YAML semantic parsing;
- graph UI;
- React Flow;
- editing;
- authoring;
- generated artifact mutation;
- arbitrary command execution;
- mission control behavior;
- command uplink behavior;
- live telemetry behavior;
- telemetry archive behavior;
- ground segment behavior.

## Safe label mapping

| Mockup-style label | v0.7.2 safe label | Rule |
|---|---|---|
| Mission Health | Validation Status or Contract Validation | Never present as spacecraft health or mission health |
| Model Completeness | Model Inventory | Do not calculate a percentage unless Core emits one |
| Lint Status | Validation Status | Allowed from Core lint or dashboard summary validation |
| Scenario Coverage | Scenario Run Summary or Coverage Summary | Use coverage wording only from `CoreCoverageSummary` |
| Data Product Coverage | Entity Coverage: Data Products | Allowed only if Core coverage includes a data product coverage record |
| Commandability Coverage | Entity Coverage: Commandability | Allowed only if Core coverage includes a commandability coverage record |
| Recent Scenario Runs | Indexed Scenario Runs | Do not infer recency unless Core provides ordered run records or timestamps |
| Generated Artifacts | Generated Artifact Inventory | Allowed from generated artifact inspection |
| Ground Database | Ground-facing Artifacts | Do not imply operational ground database unless Core defines that artifact |
| Runtime Skeleton | Runtime-facing Artifacts | Do not imply executable runtime readiness |
| Auto-saved | Not allowed before authoring | Do not display in v0.7.2 |
| Local Cache OK | Local UI State, only if implemented | Do not invent cache state |

## Implementation constraints

`src/App.tsx` is a sensitive file.

Any changes to it must be local, small and reviewable.

No PR may replace `src/App.tsx` wholesale.

No PR may remove existing implemented surfaces.

Dashboard and surface CSS must remain scoped as much as possible to avoid regressions across validation, evidence, generated artifact preview, Core output and Inspector surfaces.

The repository currently uses `src/styles.css`, not `src/App.css`.

## Manual smoke flow

Recommended smoke flow before tagging:

```text
Open examples/demo-3u
Run lint mission
Run export model-summary
Run export entity-index
Run export relationship-manifest
Run at least one scenario through Core
Run export scenario-run-index
Run export dashboard-summary
Run export coverage-summary
Inspect the dashboard cards
Inspect Scenario Evidence
Inspect Model
Inspect Core Commands
Inspect Generated Artifact Explorer
Inspect Reports and Logs
Inspect Contracts
Inspect Relationships
Inspect Raw Core Output
Preview dashboard, scenario run index and coverage reports
Verify inactive legacy blocks do not leak into focused surfaces
Verify source previews remain read-only
Verify generated previews remain read-only
Verify no editing affordance exists
```

Recommended local checks:

```bash
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

## Exit criteria

v0.7.2 is complete when Studio visually reflects the accepted cockpit direction across the operational surfaces while using only these categories:

```text
source model
Core-derived report
generated output
local UI state
```

The milestone is also complete only if the UX pass does not introduce semantic drift, editing, private parsing, arbitrary commands, graph behavior or ground-segment behavior.

## Release closure notes

The v0.7.2 release closes only after the dashboard and operational surface visual realization is achieved without changing Studio authority.

Studio visualizes Core-derived engineering evidence.

Studio does not become OrbitFabric Core.

Studio does not become mission control.
