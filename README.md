# OrbitFabric Studio

Experimental visual engineering workbench for OrbitFabric Mission Data Contracts.

OrbitFabric Studio exists to make OrbitFabric Mission Data Contracts inspectable, navigable, understandable and eventually safely authorable through controlled, validation-gated workflows.

Studio is not where mission semantics are created.

Studio is where mission semantics become inspectable.

---

## Status

```text
Current implementation baseline: v0.11.1 - Runtime UI triage hotfix
Current released milestone: v0.11.0 - Domain Surfaces & Entity Detail System
Active planning baseline: v0.12.0 - Mission Data Flow Workbench Foundation
```

The current implementation baseline is `v0.11.1`.

`v0.11.1` is a runtime UI triage hotfix over the released `v0.11.0 - Domain Surfaces & Entity Detail System` milestone. It does not introduce v0.12.0 functionality.

The next implementation milestone is `v0.12.0 - Mission Data Flow Workbench Foundation`.

The previous immediate `Plugin-aware Studio Surface` direction remains deferred. Plugin-awareness is planned only after the shell, semantic navigation, Inspector, Mission Cockpit, domain surfaces and Mission Data Flow Workbench foundations are stable.

Planning references:

```text
docs/roadmap/studio-target-ui-convergence-strategy.md
docs/roadmap/studio-ui-north-star-reference.md
docs/roadmap/studio-v0.12.0-mission-data-flow-workbench-foundation-plan.md
```

Release references:

```text
docs/releases/v0.11.0-release-notes.md
docs/releases/v0.11.1-release-notes.md
```

---

## Current Implementation State

v0.11.1 preserves the v0.11.0 local-first Tauri 2 and React Mission Cockpit workbench with dedicated read-only Core-derived mission-domain surfaces.

Implemented areas include:

- local workspace opening and structural inspection;
- read-only source and generated artifact preview;
- fixed OrbitFabric Core command wrappers;
- Core-derived validation, model summary, entity index, relationship, dashboard, scenario, coverage and simulation report rendering;
- Scenario Evidence Explorer;
- Generated Artifact Explorer;
- Ground Integration Artifact Viewer;
- semantic mission-domain sidebar;
- typed navigation model;
- explicit legacy surface mapping;
- `available`, `unavailable`, `reserved` and `diagnostic` shell states;
- persistent contextual Inspector;
- model-backed shell command bar;
- global shell status bar;
- Mission Cockpit visual hierarchy consolidation;
- reported evidence lanes for contract, validation, scenario, coverage and artifacts;
- provenance, status and severity badge system;
- explicit read-only and Core-derived boundaries;
- dedicated Core-derived domain surfaces for Spacecraft, Subsystems, Modes, Telemetry, Commands, Events, Faults, Packets, Payloads, Data Products, Contacts & Downlink and Commandability;
- consistent Core entity list/detail inspection through the contextual Inspector;
- Autonomy preserved as a reserved domain;
- v0.11.1 runtime UI triage fixes for navigation scroll reset, source file action copy, reserved Autonomy routing and Scenario recent-runs empty-state copy.

Studio remains downstream from OrbitFabric Core.

OrbitFabric Core remains authoritative for validation, scenario evidence, generated artifacts, contract introspection, entity indexing, relationship semantics and future plugin semantics.

---

## Current UI Direction

The v0.11.1 UI keeps the Mission Cockpit as the entry point and preserves dedicated Core-derived domain surfaces for implemented mission-domain navigation items.

The primary sidebar follows the accepted target domain grammar:

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

Autonomy remains reserved until an explicit Core-derived implementation path exists.

Diagnostic and developer-oriented surfaces remain accessible, but they do not define the primary navigation model.

---

## v0.12.0 Direction

v0.12.0 is a Mission Data Flow Workbench Foundation milestone.

It must introduce the first data-flow workbench foundation using Core-derived or generated data only.

The milestone is guided by Reference B in:

```text
docs/roadmap/studio-ui-north-star-reference.md
```

The v0.12.0 planning boundary is defined in:

```text
docs/roadmap/studio-v0.12.0-mission-data-flow-workbench-foundation-plan.md
```

v0.12.0 must not introduce:

- new OrbitFabric Core semantics;
- Mission Model editing;
- generated artifact mutation;
- graph UI;
- React Flow;
- authoring;
- plugin behavior;
- operational ground behavior;
- live telemetry behavior;
- command uplink behavior;
- private YAML semantic parsing;
- private relationship inference;
- private data-flow inference.

---

## Core Alignment Rule

Correct pattern:

```text
OrbitFabric Core emits a structured output.
Studio consumes and renders it.
```

Incorrect pattern:

```text
Studio reimplements Core semantics because the required output is missing.
```

If Core does not report a value, Studio must display `unavailable`, `not reported`, `reserved` or `diagnostic` as appropriate.

---

## Local Checks

Recommended checks before release closure:

```bash
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```
