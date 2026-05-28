# OrbitFabric Studio

Experimental visual engineering workbench for OrbitFabric Mission Data Contracts.

OrbitFabric Studio exists to make OrbitFabric Mission Data Contracts inspectable, navigable, understandable and eventually safely authorable through controlled, validation-gated workflows.

Studio is not where mission semantics are created.

Studio is where mission semantics become inspectable.

---

## Status

```text
Current released baseline: v0.10.0 - Mission Cockpit Consolidation
Active planning baseline: v0.11.0 - Domain Surfaces & Entity Detail System
```

The current implementation baseline is `v0.10.0`.

The next implementation milestone is `v0.11.0 - Domain Surfaces & Entity Detail System`.

The previous immediate `Plugin-aware Studio Surface` direction remains deferred. Plugin-awareness is planned only after the shell, semantic navigation, Inspector, Mission Cockpit, domain surfaces and Mission Data Flow Workbench foundations are stable.

The accepted UI convergence direction is documented in:

```text
docs/roadmap/studio-target-ui-convergence-strategy.md
```

The v0.10.0 release notes are documented in:

```text
docs/releases/v0.10.0-release-notes.md
```

---

## Current Implementation State

v0.10.0 implements a local-first Tauri 2 and React Mission Cockpit workbench for read-only inspection of OrbitFabric workspaces.

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
- no-Inspector Mission dashboard layout;
- stabilized sidebar, main surface, Inspector and shell status bar grid;
- provenance, status and severity badge system;
- explicit read-only and Core-derived boundaries.

Studio remains downstream from OrbitFabric Core.

OrbitFabric Core remains authoritative for validation, scenario evidence, generated artifacts, contract introspection, entity indexing, relationship semantics and future plugin semantics.

---

## Current UI Direction

The v0.10.0 UI consolidates the mission-domain shell into a clearer Mission Cockpit entry point while preserving the accepted target domain grammar.

The primary sidebar now follows the accepted target domain grammar:

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

Reserved domains remain conservative until dedicated domain surfaces exist.

Diagnostic and developer-oriented surfaces remain accessible, but they do not define the primary navigation model.

---

## v0.11.0 Direction

v0.11.0 is a Domain Surfaces & Entity Detail System milestone.

It should introduce dedicated domain surfaces and consistent entity list/detail patterns for mission-domain navigation items, using Core-derived or generated data only.

v0.11.0 must not introduce:

- new OrbitFabric Core semantics;
- Mission Model editing;
- generated artifact mutation;
- graph UI;
- React Flow;
- authoring;
- plugin behavior;
- operational ground behavior;
- live telemetry behavior;
- command uplink behavior.

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
