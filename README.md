# OrbitFabric Studio

Experimental visual engineering workbench for OrbitFabric Mission Data Contracts.

OrbitFabric Studio exists to make OrbitFabric Mission Data Contracts inspectable, navigable, understandable and eventually safely authorable through controlled, validation-gated workflows.

Studio is not where mission semantics are created.

Studio is where mission semantics become inspectable.

---

## Status

```text
Current implementation baseline: v0.13.0 - Evidence-integrated Workbench
Current released milestone: v0.13.0 - Evidence-integrated Workbench
Next planning baseline: v0.14.0 - Artifact Traceability Integration
```

The current implementation baseline is `v0.13.0`.

`v0.13.0` deepens the dedicated Mission Data Flow Workbench introduced in v0.12.0 by integrating Core-reported relationship, scenario, validation and coverage evidence more directly into the Workbench surface.

The Workbench remains read-only, Core-derived and aligned with Reference B in the Studio UI North Star document. It now provides a more evidence-integrated surface with explicit evidence kinds, validation evidence from Core lint reports, scenario data-flow evidence presentation, coverage evidence grouping, selectable Core-reported nodes and records, a local Workbench Inspector with raw payload preview and a compact evidence posture rail.

The previous immediate `Plugin-aware Studio Surface` direction remains deferred. Plugin-awareness is planned only after the shell, semantic navigation, Inspector, Mission Cockpit, domain surfaces, Mission Data Flow Workbench, evidence integration and artifact traceability foundations are stable.

Planning references:

```text
docs/roadmap/studio-target-ui-convergence-strategy.md
docs/roadmap/studio-ui-north-star-reference.md
docs/roadmap/studio-v0.13.0-evidence-integrated-workbench-plan.md
```

Release references:

```text
docs/releases/v0.11.0-release-notes.md
docs/releases/v0.11.1-release-notes.md
docs/releases/v0.12.0-release-notes.md
docs/releases/v0.13.0-release-notes.md
V0_12_0_RELEASE_CHECKLIST.md
V0_13_0_RELEASE_CHECKLIST.md
```

---

## Current Implementation State

v0.13.0 preserves the local-first Tauri 2 and React Mission Cockpit workbench and extends the dedicated Mission Data Flow Workbench into an evidence-integrated engineering surface.

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
- Workbench evidence taxonomy for relationship, scenario, validation, coverage and artifact evidence;
- Workbench validation evidence from `CoreLintReport` and fallback `CoreDashboardSummary.validation`;
- Workbench scenario data-flow evidence rendering from Core simulation report `data_flow_evidence` records;
- Workbench coverage evidence rendering from Core coverage summary records;
- local read-only selection for Core-reported Workbench nodes, edges and records;
- Workbench Inspector detail with raw Core-reported payload preview;
- compact Workbench evidence posture rail aligned with Reference B;
- App-level relationship manifest and lint report propagation for the dedicated Workbench surface.

Studio remains downstream from OrbitFabric Core.

OrbitFabric Core remains authoritative for validation, scenario evidence, generated artifacts, contract introspection, entity indexing, relationship semantics and future plugin semantics.

---

## Current UI Direction

The v0.13.0 UI keeps the Mission Cockpit as the entry point and moves the dedicated Mission Data Flow Workbench closer to the Reference B north-star surface.

The Workbench is still a read-only engineering inspection surface. It does not author Mission Model content, mutate generated artifacts, execute commands, ingest live telemetry, infer private relationships or calculate private coverage, readiness, health or completeness.

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

## v0.14.0 Direction

v0.14.0 is the next planning baseline: Artifact Traceability Integration.

It should build on the evidence-integrated Workbench and connect generated artifacts, evidence records and Core-reported model entities more explicitly, without introducing authoring, plugin behavior, live telemetry, command uplink, private relationship inference, private data-flow inference or generated artifact mutation.

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
npm install --package-lock-only
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```
