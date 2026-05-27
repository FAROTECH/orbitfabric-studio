# OrbitFabric Studio - Roadmap

OrbitFabric Studio is an experimental visual workbench for OrbitFabric Mission Data Contracts.

Studio exists to make the Mission Data Contract easier to inspect, validate, navigate and understand without replacing OrbitFabric Core or redefining mission semantics.

The Mission Model remains the source of truth.

OrbitFabric Core remains authoritative for validation, scenario evidence, generated artifacts, contract introspection, entity indexing, relationship semantics and future plugin semantics.

Studio is downstream.

---

## Current Baseline

```text
Current released baseline: v0.8.0 - Ground Integration Artifact Viewer
Active planning baseline: v0.9.0 - Semantic Navigation & Unified Shell
```

v0.8.0 is the current implementation baseline.

v0.9.0 is the next implementation milestone.

The previous immediate Plugin-aware Studio Surface direction is deferred. Plugin-awareness is now planned only after the shell, semantic navigation, Inspector, Mission Cockpit and Mission Data Flow Workbench foundations are stable.

Reference planning document:

```text
docs/roadmap/studio-target-ui-convergence-strategy.md
```

v0.9.0 planning document:

```text
docs/roadmap/studio-v0.9.0-semantic-navigation-and-unified-shell.md
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

---

## Accepted UI Convergence Direction

The post-v0.8.0 direction is a mission-domain cockpit and integrated data-flow workbench.

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

# v0.9.0 - Semantic Navigation & Unified Shell

Status: Active planning

Nature: information architecture and shell convergence slice

Primary loop:

```text
Open workspace -> Navigate mission domains -> Inspect context and provenance
```

## Goal

Transform Studio from surface-oriented navigation to mission-domain-oriented navigation.

The milestone is structural, not cosmetic.

It must make Studio start to behave like a mission contract engineering workbench rather than a collection of implementation surfaces.

## Scope

- semantic mission-domain sidebar;
- explicit mapping from legacy surfaces to new navigation destinations;
- global top command bar consolidation;
- persistent Inspector behavior;
- coherent footer/status bar;
- explicit available, unavailable, reserved and diagnostic states;
- no new Core semantics.

## Target Sidebar Domains

```text
Mission
Spacecraft
Subsystems
Modes
Telemetry
Commands
Events
Faults
Packets
Payloads
Data Products
Contacts & Downlink
Commandability
Autonomy
Scenarios
Generated Artifacts
```

## Legacy Surface Mapping

| Current surface | Target destination | Decision |
|---|---|---|
| Mission Dashboard | Mission | Keep and consolidate. |
| Model Inventory | Domain surfaces | Split into semantic mission-domain navigation. |
| Core Commands | Global command bar / diagnostics | Declass from primary surface. |
| Contracts | Domain surfaces and Inspector detail | Absorb into semantic domains. |
| Relationships | Mission Data Flow Workbench | Keep as future workbench input, no graph in v0.9.0. |
| Generated Artifacts | Generated Artifacts | Keep and integrate. |
| Reports & Logs | Diagnostics / evidence support | Declass from primary surface. |
| Scenario Evidence | Scenarios | Keep as scenario/evidence access. |
| Ground Integration | Generated Artifacts / future traceability | Keep read-only and non-operational. |
| Raw Output | Developer diagnostics | Declass from primary surface. |

## Explicit Non-goals

- no Mission Model editing;
- no generated artifact editing;
- no generated artifact mutation;
- no visual authoring;
- no graph UI;
- no React Flow adoption;
- no plugin execution;
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

1. Documentation rebaseline.
2. Navigation model extraction.
3. Semantic sidebar skeleton.
4. Legacy surface routing map.
5. Persistent Inspector.
6. Top command bar consolidation.
7. Footer/status bar.
8. Copy cleanup and stale state cleanup.
9. v0.9.0 release closure.

## Exit Criteria

v0.9.0 is complete when:

1. README, CHANGELOG and ROADMAP identify `v0.9.0 - Semantic Navigation & Unified Shell` as the active milestone.
2. The primary sidebar is mission-domain-oriented.
3. Legacy surfaces remain accessible but no longer define the primary navigation grammar.
4. Core Commands, Reports & Logs and Raw Output are treated as diagnostic access.
5. The Inspector is persistent as a shell primitive.
6. The top command bar exposes only fixed and controlled actions.
7. A coherent footer/status bar exposes workspace and boundary state.
8. `available`, `unavailable`, `reserved` and `diagnostic` states are visible and consistent.
9. Studio does not invent mission health, readiness, completeness or coverage semantics.
10. No graph, React Flow, authoring, plugin execution, command uplink, live telemetry or generated artifact mutation is introduced.

---

# v0.10.0 - Mission Cockpit Consolidation

Status: Planned

Purpose: Move the Mission dashboard substantially closer to the target cockpit direction using Core-derived or unavailable states only.

Non-goals: no invented mission health, no invented model completeness, no invented coverage semantics, no graph UI.

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
