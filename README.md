# OrbitFabric Studio

Experimental visual engineering workbench for OrbitFabric Mission Data Contracts.

OrbitFabric Studio exists to make OrbitFabric Mission Data Contracts inspectable, navigable, understandable and eventually safely authorable through controlled, validation-gated workflows.

Studio is not where mission semantics are created.

Studio is where mission semantics become inspectable.

---

## Status

```text
Current implementation baseline: v0.14.0 - Artifact Traceability Integration
Current technical milestone candidate: v0.14.0 - Artifact Traceability Integration
Next planning baseline: v0.15.0 - Mission Cockpit Realization
GitHub Release publication: deferred
```

The current implementation baseline is `v0.14.0`.

`v0.14.0` closes the Artifact Traceability Integration milestone. It connects generated artifacts, evidence records and Core-reported model entities more explicitly inside the Mission Data Flow Workbench without adding authoring, live telemetry, command uplink, plugin behavior, private relationship inference, private data-flow inference or generated artifact mutation.

The v0.14.0 milestone is an architectural traceability milestone, not a north-star visual parity release.

The Workbench now provides a read-only traceability model foundation, Inspector traceability blocks, generated artifact inventory linkage, generated output traceability links and a compact route-level traceability posture panel.

The north-star gap assessment confirms that Studio is moving in the right direction, but that Mission Cockpit realization and read-only graph Workbench maturity remain future milestones.

The previous immediate `Plugin-aware Studio Surface` direction remains deferred. Plugin-awareness is planned only after the cockpit, graph Workbench and evidence console are mature.

Planning references:

```text
docs/roadmap/studio-target-ui-convergence-strategy.md
docs/roadmap/studio-ui-north-star-reference.md
docs/roadmap/studio-v0.13.0-evidence-integrated-workbench-plan.md
docs/roadmap/studio-v0.14.0-artifact-traceability-integration-plan.md
docs/roadmap/studio-north-star-gap-assessment-after-v0.14.0.md
```

Release references:

```text
docs/releases/v0.11.0-release-notes.md
docs/releases/v0.11.1-release-notes.md
docs/releases/v0.12.0-release-notes.md
docs/releases/v0.13.0-release-notes.md
docs/releases/v0.14.0-release-notes.md
V0_12_0_RELEASE_CHECKLIST.md
V0_13_0_RELEASE_CHECKLIST.md
V0_14_0_RELEASE_CHECKLIST.md
```

---

## Current Implementation State

v0.14.0 preserves the local-first Tauri 2 and React Mission Cockpit workbench and extends the dedicated Mission Data Flow Workbench into a read-only traceability inspection surface.

Implemented areas include:

- local workspace opening and structural inspection;
- read-only source and generated artifact preview;
- fixed OrbitFabric Core command wrappers;
- Core-derived validation, model summary, entity index, relationship, dashboard, scenario, coverage and simulation report rendering;
- Scenario Evidence Explorer;
- dedicated Generated Artifacts surface;
- compact Generated Artifact Explorer;
- Ground Integration Artifact Viewer;
- semantic mission-domain sidebar;
- typed navigation model;
- explicit legacy surface mapping for non-primary diagnostic areas;
- `available`, `unavailable`, `reserved` and `diagnostic` shell states;
- persistent contextual Inspector;
- model-backed shell command bar;
- global shell status bar;
- Mission Cockpit visual hierarchy consolidation;
- reported evidence lanes for contract, validation, scenario, coverage and artifacts;
- provenance, status and severity badge system;
- explicit read-only and Core-derived boundaries;
- dedicated Core-derived domain surfaces for Spacecraft, Subsystems, Modes, Telemetry, Commands, Events, Faults, Packets, Payloads, Data Products, Contacts & Downlink and Commandability;
- conservative multi-domain aggregation for Contacts & Downlink;
- conservative multi-domain aggregation for Commandability;
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
- Workbench traceability model foundation;
- Workbench Inspector traceability blocks;
- generated artifact inventory bridge;
- generated artifact records linked into Workbench evidence;
- generated output traceability links;
- compact route-level traceability posture panel;
- north-star gap assessment and roadmap recalibration after v0.14.0.

Studio remains downstream from OrbitFabric Core.

OrbitFabric Core remains authoritative for validation, scenario evidence, generated artifacts, contract introspection, entity indexing, relationship semantics and future plugin semantics.

---

## Current UI Direction

The v0.14.0 UI keeps the Mission Cockpit as the entry point and moves the dedicated Mission Data Flow Workbench closer to the Reference B north-star surface.

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

## v0.15.0 Direction

v0.15.0 is the next planning baseline: Mission Cockpit Realization.

It should bring the Mission Cockpit closer to the accepted cockpit north-star while preserving Core-derived semantics.

The target areas are:

- top KPI card grid;
- reported or unavailable metric states;
- Mission Data Contract Overview;
- recent validation results;
- recent scenario runs;
- generated artifact cards;
- links from Cockpit cards to domain surfaces, Workbench and Generated Artifacts;
- stronger compact dashboard density;
- no invented health, completeness, readiness or coverage calculations.

React Flow remains deferred until after Mission Cockpit realization. A graph library may be reconsidered for a future read-only graph Workbench milestone.

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

Recommended checks before release publication or next development baseline closure:

```bash
npm install --package-lock-only
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```
