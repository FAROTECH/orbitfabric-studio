# OrbitFabric Studio

Experimental visual engineering workbench for OrbitFabric Mission Data Contracts.

OrbitFabric Studio exists to make OrbitFabric Mission Data Contracts inspectable, navigable, understandable and eventually safely authorable through controlled, validation-gated workflows.

Studio is not where mission semantics are created.

Studio is where mission semantics become inspectable.

---

## Status

```text
Current implementation baseline: v0.12.0 - Mission Data Flow Workbench Foundation
Current released milestone: v0.12.0 - Mission Data Flow Workbench Foundation
Next planning baseline: v0.13.0 - Evidence-integrated Workbench
```

The current implementation baseline is `v0.12.0`.

`v0.12.0` introduces the first dedicated Mission Data Flow Workbench foundation in the Studio shell.

The Workbench is read-only, Core-derived and aligned with Reference B in the Studio UI North Star document. It provides a dedicated surface, Reference B-oriented layout, reported source summaries, lane records, a canvas-like read-only Graph View foundation, Core-derived relationship edges, scenario data-flow evidence panels, validation/coverage context and explicit boundary language.

The previous immediate `Plugin-aware Studio Surface` direction remains deferred. Plugin-awareness is planned only after the shell, semantic navigation, Inspector, Mission Cockpit, domain surfaces, Mission Data Flow Workbench, evidence integration and artifact traceability foundations are stable.

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
docs/releases/v0.12.0-release-notes.md
V0_12_0_RELEASE_CHECKLIST.md
```

---

## Current Implementation State

v0.12.0 preserves the local-first Tauri 2 and React Mission Cockpit workbench and adds the first dedicated Mission Data Flow Workbench foundation.

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
- dedicated Mission Data Flow Workbench surface;
- Workbench Reference B layout foundation;
- Workbench Graph View tab foundation;
- Workbench canvas-like read-only preview;
- Core-derived relationship edge rendering from `relationship_manifest.json` records;
- Workbench scenario data-flow evidence and validation/coverage panels;
- App-level relationship manifest persistence for the dedicated Workbench surface.

Studio remains downstream from OrbitFabric Core.

OrbitFabric Core remains authoritative for validation, scenario evidence, generated artifacts, contract introspection, entity indexing, relationship semantics and future plugin semantics.

---

## Current UI Direction

The v0.12.0 UI keeps the Mission Cockpit as the entry point and adds a dedicated Mission Data Flow Workbench surface.

The primary sidebar follows the accepted target domain grammar:

```text
Mission
Data Flow Workbench
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

## v0.13.0 Direction

v0.13.0 is the next planning baseline: Evidence-integrated Workbench.

It should build on the dedicated v0.12.0 Workbench surface and deepen scenario, evidence, validation and Inspector integration without introducing authoring, plugin behavior, live telemetry, command uplink, private relationship inference or private data-flow inference.

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
