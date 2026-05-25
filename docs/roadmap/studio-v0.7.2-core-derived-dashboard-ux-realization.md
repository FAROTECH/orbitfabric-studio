# OrbitFabric Studio v0.7.2 - Core-derived Dashboard UX Realization

## Status

```text
Milestone: v0.7.2 - Core-derived Dashboard UX Realization
Status: Planning
Nature: dashboard UX realization slice
Primary loop: Open Dashboard -> Review Core-derived Cards -> Navigate Evidence and Coverage Surfaces
```

## Purpose

v0.7.2 turns the v0.7.1 dashboard and coverage foundation into a visibly stronger engineering dashboard.

This milestone is visual and organizational.

It does not introduce new mission semantics.

Studio remains downstream from OrbitFabric Core.

The dashboard may become more compact, card-oriented and closer to the accepted target UX direction only when each displayed value is clearly one of:

```text
source model
Core-derived report
generated artifact
local UI state
unavailable state
reserved state
```

## Starting baseline

v0.7.1 already provides the functional foundation required for v0.7.2:

- Core dashboard summary report parsing and rendering;
- Core scenario run index report parsing and rendering;
- Core coverage summary report parsing and rendering;
- structured expectation accounting rendering for Core simulation reports;
- fixed backend wrappers for dashboard-summary, scenario-run-index and coverage-summary;
- UI bindings for the three Core exports;
- generated artifact recognition and preview binding for the new report types.

v0.7.2 must preserve these existing surfaces.

v0.7.2 must not replace them with a separate dashboard semantics layer.

## Target UX direction

The target dashboard direction is:

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

## PR plan

### PR 1: v0.7.2 planning and acceptance criteria

Documentation-only planning slice.

Deliverables:

- this planning document;
- `V0_7_2_RELEASE_CHECKLIST.md`;
- explicit acceptance criteria;
- explicit data-source mapping;
- explicit mockup label safety mapping.

### PR 2: dashboard data snapshot foundation

Prepare the dashboard to consume multiple Core-derived reports at the same time.

Allowed work:

- preserve the latest valid lint report snapshot;
- preserve the latest valid dashboard summary snapshot;
- preserve the latest valid scenario run index snapshot;
- preserve the latest valid coverage summary snapshot;
- preserve generated artifact summary state;
- keep raw `coreResult` behavior unchanged.

Forbidden work:

- no new dashboard metrics;
- no visual redesign yet;
- no rewrite of `App.tsx`.

### PR 3: dashboard layout shell

Introduce the new dashboard layout structure without changing semantics.

Allowed work:

- compact dashboard container;
- top card grid;
- main dashboard columns;
- reserved or unavailable card styling;
- CSS classes scoped to the dashboard area.

Forbidden work:

- no global CSS rewrite;
- no removal of existing surfaces;
- no data invention.

### PR 4: validation and model inventory cards

Render Core-derived validation and model inventory cards.

Allowed sources:

- `CoreLintReport`;
- `CoreDashboardSummary.validation`;
- `CoreDashboardSummary.model_domains`;
- `CoreDashboardSummary.entity_inventory`;
- `CoreDashboardSummary.relationship_inventory`.

### PR 5: scenario run and evidence cards

Render Core-derived scenario run cards.

Allowed sources:

- `CoreScenarioRunIndex`;
- selected or latest `CoreSimulationReport`, only when already parsed from Core JSON.

### PR 6: coverage cards

Render Core-derived coverage cards.

Allowed sources:

- `CoreCoverageSummary.scenario_runs`;
- `CoreCoverageSummary.entity_coverage`;
- `CoreCoverageSummary.expectation_coverage`;
- `CoreCoverageSummary.relationship_coverage`;
- `CoreCoverageSummary.unsupported`.

### PR 7: generated artifact cards

Render generated artifact inventory cards.

Allowed sources:

- `GeneratedArtifactDashboardSummary`;
- generated artifact classes reported by the existing generated artifact inventory.

### PR 8: dashboard command/header polish

Improve dashboard-oriented actions without changing backend command authority.

Allowed work:

- preserve fixed Core command wrappers;
- expose clearer navigation to existing commands;
- use disabled or reserved states for future actions.

### PR 9: responsive and regression closure

Final polish and release preparation.

Allowed work:

- responsive tuning;
- overflow containment;
- visual consistency;
- checklist closure;
- changelog and release metadata updates.

## Acceptance criteria

v0.7.2 is complete when Studio can:

1. show a visually stronger dashboard without removing existing read-only surfaces;
2. display validation status only from Core lint or Core dashboard summary data;
3. display model and relationship inventory only from Core-derived reports or unavailable states;
4. display scenario run information only from Core scenario run index or unavailable states;
5. display coverage only from Core coverage summary or unavailable states;
6. display generated artifact summary only from generated artifact inventory;
7. keep unsupported coverage scopes visible;
8. keep reserved graph, ground, authoring and plugin states explicitly non-operational;
9. avoid mission health, model completeness and private frontend percentages;
10. pass `npm run build`;
11. pass `cargo check --manifest-path src-tauri/Cargo.toml`;
12. preserve the read-only boundary.

## Implementation constraints

`src/App.tsx` is a sensitive file.

Any changes to it must be local, small and reviewable.

No PR may replace `src/App.tsx` wholesale.

No PR may remove existing implemented surfaces.

Dashboard CSS must be scoped as much as possible to avoid regressions across validation, evidence, generated artifact preview, Core output and Inspector surfaces.

The repository currently uses `src/styles.css`, not `src/App.css`.

## Manual smoke flow

Recommended smoke flow for implementation PRs:

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
Inspect Generated Artifact Explorer
Preview dashboard, scenario run index and coverage reports
Verify Raw Core output remains visible
Verify no editing affordance exists
```

## Release closure notes

The v0.7.2 release must close only after the dashboard visual realization is achieved without changing Studio authority.

Studio visualizes Core-derived engineering evidence.

Studio does not become OrbitFabric Core.

Studio does not become mission control.
