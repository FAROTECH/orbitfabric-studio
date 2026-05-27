# OrbitFabric Studio - Roadmap

OrbitFabric Studio is an experimental visual workbench for OrbitFabric Mission Data Contracts.

Studio exists to make the Mission Data Contract easier to inspect, validate, navigate and understand without replacing OrbitFabric Core or redefining mission semantics.

The Mission Model remains the source of truth.

OrbitFabric Core remains authoritative for validation, scenario evidence, generated artifacts, contract introspection, entity indexing, relationship semantics and future plugin semantics.

Studio is downstream.

---

## Current Baseline

```text
Current released baseline: v0.9.0 - Semantic Navigation & Unified Shell
Active planning baseline: v0.10.0 - Mission Cockpit Consolidation
```

v0.9.0 is the current implementation baseline.

v0.10.0 is the next implementation milestone.

The previous immediate Plugin-aware Studio Surface direction remains deferred. Plugin-awareness is planned only after the shell, semantic navigation, Inspector, Mission Cockpit, domain surfaces and Mission Data Flow Workbench foundations are stable.

Reference planning document:

```text
docs/roadmap/studio-target-ui-convergence-strategy.md
```

v0.9.0 release notes:

```text
docs/releases/v0.9.0-release-notes.md
```

v0.9.0 release checklist:

```text
V0_9_0_RELEASE_CHECKLIST.md
```

---

## Roadmap Philosophy

OrbitFabric Studio grows through narrow, inspectable, validation-aligned vertical slices.

Correct pattern:

```text
OrbitFabric Core emits a structured output.
Studio consumes and renders it.
```

Incorrect pattern:

```text
Studio reimplements Core semantics because the required output is missing.
```

Every milestone must preserve a clear distinction among:

```text
source model      = authoritative Mission Model files
derived report    = OrbitFabric Core output derived from the source model
generated output  = disposable artifact generated from the contract
UI state          = local Studio representation
```

If Core does not report a value, Studio must show `unavailable`, `not reported`, `reserved` or `diagnostic` instead of calculating private meaning.

---

## Released Baselines

### v0.0.0 - Studio Charter

Status: Completed

Defined why Studio exists, what it is not, how it relates to OrbitFabric Core, and which architectural and UX principles govern future development.

### v0.1.0 - Read-only Mission Project Viewer

Status: Completed

Introduced local OrbitFabric workspace opening, structural inspection and read-only source preview.

### v0.2.0 - Validation and Diagnostics Workbench

Status: Completed

Introduced Core lint visibility through fixed command execution and Core JSON report rendering.

### v0.3.0 - Contract Navigation Surface

Status: Completed

Introduced Core-derived contract domain and entity navigation through `model_summary.json` and `entity_index.json`.

### v0.4.0 - Relationship Surface

Status: Completed

Introduced read-only relationship inspection through Core-owned `relationship_manifest.json`.

### v0.5.0 - Generated Artifact Explorer

Status: Completed

Introduced conservative, read-only inspection of generated artifacts already present in the selected workspace.

### v0.6.0 - Studio Information Architecture & UX Foundation

Status: Completed

Reorganized previous capabilities into a coherent application shell with workspace header, primary navigation, main surface, contextual Inspector, provenance vocabulary and read-only boundary language.

### v0.7.0 - Scenario Evidence Explorer

Status: Completed

Introduced read-only inspection of scenario evidence produced by OrbitFabric Core through fixed `orbitfabric sim` execution and Core simulation JSON rendering.

### v0.7.1 - Dashboard and Coverage Foundation

Status: Completed

Introduced Core dashboard summary, scenario run index and coverage summary rendering without private coverage calculation or mission health scoring.

### v0.7.2 - Core-derived Dashboard UX Realization

Status: Completed

Moved the dashboard closer to the accepted cockpit direction while preserving the Core-derived boundary.

### v0.8.0 - Ground Integration Artifact Viewer

Status: Completed

Introduced a dedicated read-only Ground Integration Artifact Viewer for generated ground-facing artifacts.

v0.8.0 does not introduce ground segment behavior, mission control behavior, command uplink, live telemetry, telemetry archive behavior, live decoder behavior, generated artifact mutation, graph UI, React Flow, plugin execution or authoring.

Release notes:

```text
docs/releases/v0.8.0-release-notes.md
```

### v0.9.0 - Semantic Navigation & Unified Shell

Status: Completed

Transformed Studio from a surface-oriented workbench into a mission-domain-oriented shell.

v0.9.0 introduced:

- typed navigation model;
- semantic mission-domain sidebar;
- explicit legacy surface mapping;
- `available`, `unavailable`, `reserved` and `diagnostic` shell states;
- persistent Inspector across the Mission surface;
- model-backed shell command bar;
- global shell status bar;
- copy cleanup to avoid readiness, health or completeness semantics invented in Studio;
- release notes and checklist;
- metadata alignment to `0.9.0`.

v0.9.0 does not introduce new OrbitFabric Core semantics, graph UI, React Flow, authoring, plugin behavior, command uplink, live telemetry, generated artifact mutation, operational ground behavior, private mission health calculation, private readiness calculation or private model completeness calculation.

Release notes:

```text
docs/releases/v0.9.0-release-notes.md
```

Release checklist:

```text
V0_9_0_RELEASE_CHECKLIST.md
```

---

## Accepted UI Convergence Direction

The post-v0.9.0 direction remains a mission-domain cockpit and integrated data-flow workbench.

UI north star reference:

`docs/roadmap/studio-ui-north-star-reference.md`

Accepted roadmap:

```text
v0.9.0  - Semantic Navigation & Unified Shell
v0.10.0 - Mission Cockpit Consolidation
v0.11.0 - Domain Surfaces & Entity Detail System
v0.12.0 - Mission Data Flow Workbench Foundation
v0.13.0 - Evidence-integrated Workbench
v0.14.0 - Artifact Traceability Integration
v0.15.0 - Plugin-aware Studio Surface
```

---

# v0.10.0 - Mission Cockpit Consolidation

Status: Active planning

Nature: cockpit consolidation and provenance clarity slice

Primary loop:

```text
Open workspace -> Inspect Mission cockpit -> Understand reported, unavailable and generated state
```

## Goal

Consolidate the Mission Dashboard into a clearer Mission Cockpit without adding new OrbitFabric Core semantics.

The milestone is not a graph milestone, not an authoring milestone and not a plugin milestone.

It must make the Mission surface more useful while preserving the rule that OrbitFabric Core owns mission semantics.

## Scope

- Mission Dashboard visual hierarchy consolidation;
- cockpit card copy cleanup;
- explicit provenance for cockpit data;
- clearer unavailable and not reported states;
- clearer distinction among source model, Core-derived report, generated output and UI state;
- recent validation result presentation;
- recent scenario run index presentation;
- generated artifact inventory presentation;
- coverage summary presentation only where Core reports it;
- no new Core semantics.

## Data Allowed

v0.10.0 may use only:

- structural workspace inspection already returned by Studio backend;
- Core-derived reports already parsed by Studio;
- generated artifact inventory already returned by Studio backend;
- local UI state required to display the selected workspace or selected surface;
- explicit `unavailable`, `not reported`, `reserved` or `diagnostic` states.

## Explicit Non-goals

- no Mission Model editing;
- no generated artifact editing;
- no generated artifact mutation;
- no visual authoring;
- no graph UI;
- no React Flow adoption;
- no plugin execution;
- no plugin marketplace;
- no live telemetry;
- no telemetry archive behavior;
- no command uplink behavior;
- no mission control behavior;
- no operational ground behavior;
- no private YAML semantic parsing;
- no private coverage calculation;
- no private mission health calculation;
- no private readiness calculation;
- no private model completeness calculation.

## Recommended PR Sequence

1. Documentation rebaseline after v0.9.0 closure.
2. v0.10.0 planning note.
3. Cockpit vocabulary cleanup.
4. Cockpit provenance and unavailable-state clarification.
5. KPI card copy normalization.
6. Mechanical Mission Cockpit extraction if needed.
7. v0.10.0 release closure.

## Exit Criteria

v0.10.0 is complete when:

1. README, CHANGELOG and ROADMAP identify `v0.9.0 - Semantic Navigation & Unified Shell` as the current released baseline and `v0.10.0 - Mission Cockpit Consolidation` as the active or completed milestone.
2. The Mission Cockpit no longer contains readiness, health or completeness vocabulary except as explicit non-goals or unsupported states.
3. Cockpit cards clearly distinguish Core-derived reports, generated artifacts, structural workspace inspection and UI state.
4. Missing Core data is shown as `unavailable`, `not reported`, `reserved` or `diagnostic`.
5. Studio does not compute private mission health, operational readiness, model completeness or coverage semantics.
6. No graph, React Flow, authoring, plugin execution, command uplink, live telemetry or generated artifact mutation is introduced.
7. `npm run build` and `cargo check --manifest-path src-tauri/Cargo.toml` are run locally before release closure.

---

# v0.11.0 - Domain Surfaces & Entity Detail System

Status: Planned

Purpose: Introduce real semantic domain surfaces and consistent entity list/detail patterns using Core-derived or generated data only.

---

# v0.12.0 - Mission Data Flow Workbench Foundation

Status: Planned

Purpose: Introduce the foundational graph/data-flow workspace only from Core-derived or report-derived relationship data.

Non-goals: no invented graph semantics, no arbitrary graph editing, no authoring, no plugin execution.

---

# v0.13.0 - Evidence-integrated Workbench

Status: Planned

Purpose: Integrate scenario evidence, validation and timeline into the workbench.

Non-goals: no private scenario runner, no log-derived evidence, no dynamic spacecraft simulator, no live telemetry.

---

# v0.14.0 - Artifact Traceability Integration

Status: Planned

Purpose: Connect generated artifacts, runtime outputs and ground artifacts into mission flow traceability where Core provides safe references.

Non-goals: no generated artifact mutation, no runtime execution, no ground segment behavior, no command uplink, no live decoder.

---

# v0.15.0 - Plugin-aware Studio Surface

Status: Deferred

Purpose: Introduce plugin-awareness only after the shell, navigation, Inspector, cockpit and workbench foundations are stable.

Non-goals until v0.15.0:

- no plugin execution;
- no plugin marketplace;
- no plugin-authored mission semantics inside Studio.
