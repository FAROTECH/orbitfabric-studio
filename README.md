# OrbitFabric Studio

Experimental visual engineering workbench for OrbitFabric Mission Data Contracts.

OrbitFabric Studio exists to make OrbitFabric Mission Data Contracts inspectable, navigable, understandable and eventually safely authorable through controlled, validation-gated workflows.

Studio is not where mission semantics are created.

Studio is where mission semantics become inspectable.

---

## Status

```text
Current released baseline: v0.8.0 - Ground Integration Artifact Viewer
Active planning baseline: v0.9.0 - Semantic Navigation & Unified Shell
```

The current implementation baseline is `v0.8.0`.

The next implementation milestone is `v0.9.0 - Semantic Navigation & Unified Shell`.

The previous immediate `Plugin-aware Studio Surface` direction has been deferred. Plugin-awareness is now planned only after the shell, semantic navigation, Inspector, Mission Cockpit and Mission Data Flow Workbench foundations are stable.

The accepted UI convergence direction is documented in:

```text
docs/roadmap/studio-target-ui-convergence-strategy.md
```

The v0.9.0 planning note is documented in:

```text
docs/roadmap/studio-v0.9.0-semantic-navigation-and-unified-shell.md
```

---

## Current Implementation State

v0.8.0 currently implements a local-first Tauri 2 and React workbench for read-only inspection of OrbitFabric workspaces.

Implemented areas include:

- local workspace opening and structural inspection;
- read-only source and generated artifact preview;
- fixed OrbitFabric Core command wrappers;
- Core-derived validation, model summary, entity index, relationship, dashboard, scenario, coverage and simulation report rendering;
- Scenario Evidence Explorer;
- Generated Artifact Explorer;
- Ground Integration Artifact Viewer;
- contextual Inspector pattern;
- provenance, status and severity badge system;
- explicit read-only and Core-derived boundaries.

Studio remains downstream from OrbitFabric Core.

OrbitFabric Core remains authoritative for validation, scenario evidence, generated artifacts, contract introspection, entity indexing, relationship semantics and future plugin semantics.

---

## Current UI Limitation

The v0.8.0 UI is technically disciplined, but still primarily surface-oriented.

Current primary surfaces are:

```text
Mission Dashboard
Model Inventory
Core Commands
Contracts
Relationships
Generated Artifacts
Reports & Logs
Scenario Evidence
Ground Integration
Raw Output
```

The accepted v0.9.0 direction is to move Studio toward mission-domain-oriented navigation.

Target sidebar domains are:

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

Diagnostic and developer-oriented surfaces remain accessible, but they must not dominate the primary navigation model.

---

## v0.9.0 Scope

v0.9.0 is a shell and information architecture milestone.

It must introduce:

- semantic mission-domain sidebar;
- explicit mapping from legacy surfaces to target destinations;
- consolidated top command bar;
- persistent Inspector as a global shell primitive;
- coherent footer/status bar;
- explicit `available`, `unavailable`, `reserved` and `diagnostic` states.

v0.9.0 must not introduce:

- new OrbitFabric Core semantics;
- graph UI;
- React Flow;
- authoring;
- plugin behavior;
- operational ground behavior;
- live telemetry behavior;
- generated artifact mutation;
- frontend-inferred mission health, readiness, completeness or coverage semantics.

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
