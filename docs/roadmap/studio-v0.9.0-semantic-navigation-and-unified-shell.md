# OrbitFabric Studio v0.9.0 - Semantic Navigation & Unified Shell

## Status

```text
Milestone: v0.9.0 - Semantic Navigation & Unified Shell
Status: planned
Starting baseline: v0.8.0 - Ground Integration Artifact Viewer
Nature: information architecture and shell convergence slice
Primary loop: Open workspace -> Navigate mission domains -> Inspect context and provenance
```

## Purpose

v0.9.0 transforms OrbitFabric Studio from a surface-oriented workbench into a mission-domain-oriented shell.

This milestone does not add new mission semantics.

It reorganizes the existing read-only Studio capabilities so that the product starts to behave like a mission contract engineering workbench rather than a set of implementation panels.

## Source of Truth

OrbitFabric Core remains authoritative for mission semantics, validation, scenario evidence, generated artifacts, contract introspection, entity indexing, relationship semantics and future plugin semantics.

Studio remains downstream.

Correct pattern:

```text
OrbitFabric Core emits a structured output.
Studio consumes and renders it.
```

Incorrect pattern:

```text
Studio reimplements Core semantics because the required output is missing.
```

If Core does not report enough information, Studio must show `unavailable`, `not reported`, `reserved` or `diagnostic`.

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

| Current surface | v0.9.0 target destination | Decision |
|---|---|---|
| Mission Dashboard | Mission | Keep as the cockpit entry point. |
| Model Inventory | Domain destinations | Split into semantic domain navigation over time. |
| Core Commands | Global command bar and diagnostics | Declass from primary navigation. |
| Contracts | Domain destinations and Inspector detail | Absorb into semantic domains over time. |
| Relationships | Future Mission Data Flow Workbench | Keep diagnostic or legacy access in v0.9.0. |
| Generated Artifacts | Generated Artifacts | Keep as a target domain. |
| Reports & Logs | Diagnostics and evidence support | Declass from primary navigation. |
| Scenario Evidence | Scenarios | Keep as scenario/evidence access. |
| Ground Integration | Generated Artifacts and future traceability | Keep read-only and non-operational. |
| Raw Output | Developer diagnostics | Declass from primary navigation. |

## Required Shell States

v0.9.0 must represent navigation and command state explicitly:

```text
available
unavailable
reserved
diagnostic
```

These states are not cosmetic. They are part of the Studio safety model.

## Scope

v0.9.0 includes:

- semantic mission-domain sidebar;
- explicit legacy-surface-to-domain mapping;
- top command bar consolidation;
- persistent Inspector behavior;
- coherent footer/status bar;
- explicit availability, reservation and diagnostic states;
- documentation alignment after v0.8.0;
- no new Core semantics.

## Explicit Non-goals

v0.9.0 does not include:

- Mission Model editing;
- generated artifact editing;
- generated artifact mutation;
- visual authoring;
- graph UI;
- React Flow adoption;
- plugin execution;
- plugin marketplace;
- live telemetry;
- telemetry archive behavior;
- command uplink behavior;
- mission control behavior;
- operational ground behavior;
- private YAML semantic parsing;
- private coverage calculation;
- private mission health calculation;
- private readiness calculation;
- private model completeness calculation.

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
