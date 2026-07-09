# OrbitFabric Studio v0.15.0 - Mission Cockpit Realization Plan

## Status

```text
Milestone: v0.15.0 - Mission Cockpit Realization
Status: Planned
Baseline: v0.14.0 - Artifact Traceability Integration
Primary surface: Mission Cockpit
Secondary surfaces: Mission Data Flow Workbench, Generated Artifacts, Scenarios, domain surfaces, Inspector
React Flow decision: deferred
Plugin-awareness decision: deferred
```

## Purpose

v0.15.0 brings the Mission Cockpit much closer to the accepted Mission Cockpit north-star while preserving the OrbitFabric model-first boundary.

The milestone is not a new semantic layer. It is a product and information-architecture realization pass for the existing Studio entry point.

The intended movement is:

```text
Open workspace
  -> inspect compact Mission Cockpit
  -> read Core-derived or explicitly unavailable posture
  -> navigate to validation, scenario, domain, Workbench and generated artifact surfaces
  -> preserve read-only, Core-derived inspection
```

## Core authority rule

Studio remains downstream from OrbitFabric Core.

Correct pattern:

```text
OrbitFabric Core emits a structured output.
Studio consumes and renders it.
```

Incorrect pattern:

```text
Studio reimplements Core semantics because the required output is missing.
```

If Core does not report a value, Studio must display one of these states:

```text
unavailable
not reported
reserved
diagnostic
```

Studio must not privately calculate mission health, readiness, model completeness, scenario coverage, data product coverage, commandability coverage or traceability completeness.

## North-star Cockpit analysis

The Mission Cockpit north-star is the product entry point.

It shows a compact engineering console with:

- a persistent mission-domain sidebar;
- a global command bar with fixed Core-facing actions;
- a top KPI grid;
- Mission Health;
- Model Completeness;
- Lint Status;
- Scenario Coverage;
- Data Product Coverage;
- Commandability Coverage;
- Mission Data Contract Overview;
- Recent Validation Results;
- Recent Scenario Runs;
- Generated Artifacts cards;
- status colors;
- progress affordances;
- footer/status bar continuity.

The reference must guide layout, density, hierarchy and product grammar only.

It must not be copied semantically when Core does not expose the relevant value.

## Workbench north-star relationship

The Mission Data Flow Workbench north-star remains active as the secondary convergence reference.

v0.15.0 must not turn into a graph engine milestone.

The Workbench should remain read-only and Core-derived. The cockpit may link into it, summarize its availability and expose navigation affordances, but it must not introduce React Flow, graph editing, private relationship inference or layout-as-mission-semantics.

The read-only graph Workbench decision point remains after v0.15.0.

## Accepted inputs

v0.15.0 may consume only existing Core-derived or Studio-owned read-only inspection inputs:

- workspace structural inspection;
- Core model summary;
- Core entity index;
- Core relationship manifest;
- Core lint report;
- Core dashboard summary;
- Core scenario run index;
- Core simulation report;
- Core coverage summary;
- generated artifact inventory already exposed by Studio;
- generated artifact file metadata already exposed by Studio.

## Metric policy

### Mission Health

Allowed state for v0.15.0:

```text
not reported
```

Mission Health may be rendered as a north-star-compatible card only if clearly marked as not reported or unavailable.

It must not be derived from validation pass/fail, error count, warning count, scenario status, coverage records or artifact availability.

A later Core output may make this metric reportable.

### Model Completeness

Allowed state for v0.15.0:

```text
not reported
```

Model Completeness may be rendered as a north-star-compatible card only if clearly marked as not reported or unavailable.

It must not be calculated from entity counts, relationship counts, source file counts or domain presence.

### Lint Status

Allowed state for v0.15.0:

```text
Core-derived when Core lint report or dashboard validation is available
unavailable otherwise
```

Lint Status may show errors, warnings and info counts from Core lint or dashboard validation outputs.

### Scenario Coverage

Allowed state for v0.15.0:

```text
Core-derived if Core coverage summary reports scenario coverage
not reported otherwise
```

Scenario run counts may be shown as reported activity. They must not be labeled as coverage unless Core reports coverage semantics.

### Data Product Coverage

Allowed state for v0.15.0:

```text
Core-derived if Core coverage summary reports data product coverage
not reported otherwise
```

Data product entity counts may be shown in the Mission Data Contract Overview. They must not be converted into coverage percentages privately.

### Commandability Coverage

Allowed state for v0.15.0:

```text
Core-derived if Core coverage summary reports commandability coverage
not reported otherwise
```

Command entity counts or commandability domain presence must not be converted into commandability coverage privately.

## Scope

v0.15.0 includes:

- a top KPI grid aligned with the Cockpit north-star;
- explicit reported, unavailable and not reported metric states;
- Mission Data Contract Overview refinement;
- Recent Validation Results refinement;
- Recent Scenario Runs refinement;
- Generated Artifacts cards;
- Cockpit cross-links to Mission Data Flow Workbench, Generated Artifacts, Scenarios and domain surfaces;
- compact dashboard density polish;
- visual and interaction hierarchy closer to the reference image;
- documentation, release checklist and release hardening for the milestone.

## Non-goals

v0.15.0 must not introduce:

- React Flow;
- graph library adoption;
- graph editing;
- Mission Model authoring;
- YAML editor behavior;
- generated artifact mutation;
- artifact regeneration from the Generated Artifacts surface;
- command uplink;
- command authorization;
- command scheduling;
- command execution;
- live telemetry;
- operational ground behavior;
- private relationship inference;
- private data-flow inference;
- private coverage calculation;
- private mission health calculation;
- private readiness calculation;
- private model completeness calculation;
- Autonomy implementation;
- plugin execution;
- plugin marketplace;
- arbitrary command execution.

## Planned PR sequence

### PR 1 - Planning and boundary document

Scope:

- Add this v0.15.0 planning document.
- Add initial v0.15.0 checklist.
- Align roadmap state from v0.14.0 closure to v0.15.0 planning.
- Update changelog unreleased entries.
- No application code.

Validation:

```bash
npm run build
```

### PR 2 - Cockpit data model refinement

Scope:

- Add or refine a Mission Cockpit posture model using only accepted inputs.
- Separate reported metrics from unavailable or not reported metrics.
- Encode explicit metric provenance.

Non-goals:

- No private score calculation.
- No new Core semantics.
- No visual rewrite.

### PR 3 - Top KPI card grid

Scope:

- Render the six north-star KPI slots:
  - Mission Health;
  - Model Completeness;
  - Lint Status;
  - Scenario Coverage;
  - Data Product Coverage;
  - Commandability Coverage.
- Show unsupported metrics as not reported or unavailable.
- Link reported cards to relevant surfaces.

Non-goals:

- No invented health.
- No invented completeness.
- No invented coverage percentage.

### PR 4 - Mission Data Contract Overview panel

Scope:

- Refine the contract overview into a compact Cockpit panel.
- Use Core dashboard summary, model summary and entity index only.
- Link rows to domain surfaces where available.

Non-goals:

- No YAML parsing.
- No authoring.
- No private completeness scoring.

### PR 5 - Recent Validation Results panel

Scope:

- Present recent validation posture from Core lint or dashboard validation outputs.
- Show severity, target, message and status when reported.
- Keep empty and unavailable states explicit.

Non-goals:

- No private validation rules.
- No log-derived evidence.

### PR 6 - Recent Scenario Runs panel

Scope:

- Present scenario run index and latest simulation report posture when available.
- Link to Scenario Evidence.
- Keep run activity separate from coverage semantics.

Non-goals:

- No private scenario execution model.
- No scenario YAML interpretation.

### PR 7 - Generated Artifacts cockpit cards

Scope:

- Add compact cards for generated documentation, evidence reports, runtime skeleton and ground artifacts when inventory is available.
- Link to the Generated Artifacts surface.
- Preserve read-only preview behavior.

Non-goals:

- No artifact mutation.
- No regeneration.
- No generated artifact semantic reinterpretation.

### PR 8 - Cockpit navigation and linkage polish

Scope:

- Make Cockpit links to Workbench, Generated Artifacts, Scenarios and domain surfaces clearer.
- Preserve target domain navigation grammar.
- Keep diagnostic surfaces secondary.

### PR 9 - Cockpit visual density polish

Scope:

- Improve spacing, card rhythm, table density, status color consistency and footer continuity toward the Cockpit north-star.
- Keep changes visual and interaction-level only.

Non-goals:

- No semantic changes.
- No new dependencies.

### PR 10 - v0.15.0 release hardening

Scope:

- Release notes.
- Checklist closure.
- README, ROADMAP and CHANGELOG alignment.
- Metadata alignment only at milestone closure.
- Technical tag decision.
- GitHub Release decision.

Validation:

```bash
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
npm run tauri:dev
```

## Exit criteria

v0.15.0 is complete when:

- the Mission Cockpit visibly matches the north-star structure more closely;
- all six top KPI slots exist with explicit reported, unavailable or not reported states;
- unsupported health, completeness and coverage metrics are not invented;
- contract overview, validation, scenario and generated artifact panels are compact and actionable;
- Cockpit links into Workbench, Generated Artifacts, Scenarios and domain surfaces are clear;
- React Flow remains out;
- plugin-awareness remains deferred;
- no authoring, mutation, command uplink, live telemetry, Autonomy implementation or private inference has been introduced.

## Next milestone decision

After v0.15.0, the next legitimate decision point is:

```text
v0.16.0 - Read-only Graph Workbench Engine
```

That milestone may evaluate React Flow or an equivalent graph library only under strict read-only, Core-derived constraints.

Plugin-awareness remains later than the cockpit, graph Workbench and evidence console maturity phases.
