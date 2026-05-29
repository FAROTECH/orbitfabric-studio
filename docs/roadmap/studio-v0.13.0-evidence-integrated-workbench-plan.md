# OrbitFabric Studio v0.13.0 - Evidence-integrated Workbench Plan

## Status

```text
Document: v0.13.0 Evidence-integrated Workbench plan
Status: completed release baseline
Starting baseline: v0.12.0 - Mission Data Flow Workbench Foundation
Released milestone: v0.13.0 - Evidence-integrated Workbench
Primary UI reference: Reference B - Mission Data Flow Workbench
Next planning baseline: v0.14.0 - Artifact Traceability Integration
```

This document defined the implementation boundary for `v0.13.0 - Evidence-integrated Workbench`.

The milestone started from the real `main` repository baseline after the completed `v0.12.0 - Mission Data Flow Workbench Foundation` release closure.

v0.13.0 built on the dedicated Mission Data Flow Workbench surface introduced in v0.12.0. It did not replace that surface, restart the UI direction, or introduce a graph library, graph editing, Mission Model authoring, plugin behavior, command uplink, live telemetry or operational ground behavior.

## Purpose

v0.13.0 deepened the Mission Data Flow Workbench by integrating evidence, scenario, validation, coverage and Inspector behavior more directly into the Workbench.

The milestone preserved the core rule:

```text
OrbitFabric Core emits a structured output.
Studio consumes and renders it.
```

Studio remains downstream from OrbitFabric Core.

Studio does not invent mission semantics, graph semantics, data-flow links, health, readiness, completeness, coverage meaning or operational behavior.

## North Star binding

The visual and conceptual direction is documented in:

```text
docs/roadmap/studio-ui-north-star-reference.md
```

For v0.13.0, the relevant reference was:

```text
Reference B - Mission Data Flow Workbench
```

Reference B guided:

- workbench layout grammar;
- information density;
- hierarchy between canvas, evidence panels, validation panels and Inspector;
- read-only selection behavior;
- scenario evidence presentation;
- validation and coverage visibility;
- progressive movement toward a more coherent data-flow-oriented engineering surface.

Reference B did not authorize:

- graph semantics not reported by Core;
- private relationship inference;
- private data-flow inference;
- private scenario interpretation;
- Mission Model authoring;
- generated artifact mutation;
- React Flow adoption;
- graph library adoption;
- live telemetry behavior;
- command uplink behavior;
- plugin behavior;
- operational ground behavior.

## Implemented release outcome

v0.13.0 provides:

- explicit Workbench evidence kinds for relationship, scenario, validation, coverage and artifact evidence;
- a validation evidence lane in the Workbench model;
- validation evidence records from `CoreLintReport`;
- fallback validation summary records from `CoreDashboardSummary.validation`;
- coverage evidence records for scenario runs, entity coverage, expectation coverage, relationship coverage and unsupported scopes;
- record-level evidence kind provenance metadata;
- read-only local Workbench selection for Core-reported nodes, edges and evidence records;
- Workbench Inspector updates from selected Core-derived items;
- raw Core-reported payload preview in the Workbench Inspector;
- Scenario Timeline rendering of Core-reported `data_flow_evidence` fields;
- grouped Validation, Coverage and Relationship evidence sections in the Lint / Validation Results panel;
- compact Workbench evidence posture rail;
- Reference B-oriented Workbench visual polish;
- Workbench lint report wiring through both Mission Cockpit and the dedicated Workbench route.

## Repository audit findings

The repository audit found one documentation inconsistency inherited from v0.12.0:

```text
docs/roadmap/studio-v0.12.0-workbench-validation-checklist.md
```

This path was referenced by v0.12.0 documentation, but the file was not present in the repository baseline inspected for v0.13.0 planning.

This finding did not block v0.13.0 implementation. It remains a documentation audit issue for a later cleanup PR. v0.13.0 did not invent the missing checklist contents.

## Allowed data sources for v0.13.0

v0.13.0 consumed only data already represented through existing Studio state, Core reports, generated artifact inventory or explicitly unavailable states.

Allowed sources:

- `WorkspaceInspection`;
- `CoreModelSummary` from `model_summary.json`;
- `CoreEntityIndex` from `entity_index.json`;
- `CoreRelationshipManifest` from `relationship_manifest.json`;
- `CoreDashboardSummary` from `dashboard_summary.json`;
- `CoreLintReport` from lint JSON output;
- `CoreScenarioRunIndex` from `scenario_run_index.json`;
- `CoreCoverageSummary` from `coverage_summary.json`;
- `CoreSimulationReport` from `orbitfabric-sim` JSON reports;
- `CoreSimulationReport.data_flow_evidence`, if reported by Core;
- generated artifact inventory produced by existing Studio inspection of `generated/`;
- known generated artifact identities already documented by Studio.

If a value or relation was not reported by one of these sources, Studio rendered it as `unavailable`, `not-reported`, `reserved`, `diagnostic` or omitted it.

## Data sources not allowed

v0.13.0 did not introduce private parsing, semantic reconstruction or implied links from:

- Mission Model YAML content;
- scenario YAML content;
- textual logs;
- naming conventions not already documented as generated artifact identity rules;
- file paths used as semantic relation evidence;
- UI mockup layout;
- inferred domain adjacency;
- hardcoded telemetry-to-packet-to-data-product chains;
- hardcoded command-to-mode-to-event chains;
- visual graph assumptions;
- future plugin assumptions.

## Evidence taxonomy

v0.13.0 made Workbench evidence explicit and inspectable.

### Relationship evidence

Relationship evidence comes only from `CoreRelationshipManifest`.

It may include relationship types, relationship records, from and to endpoints, derivation metadata reported by Core and relationship manifest boundaries.

It must not include inferred graph adjacency or private relationship reconstruction.

### Scenario evidence

Scenario evidence comes only from `CoreSimulationReport` structured fields.

It may include scenario identity, result, timeline records, events, commands, mode transitions, failed expectations, `data_flow_evidence` records and fields such as `t`, `data_product_id`, `producer`, `producer_type`, `triggered_by_command`, `storage_intent`, `downlink_intent`, `eligible_downlink_flows` and `contact_windows` when Core reports them.

It must not include evidence derived from scenario YAML or logs.

### Validation evidence

Validation evidence comes only from `CoreLintReport` and `CoreDashboardSummary.validation`.

It may include validation result, error count, warning count, info count and findings reported by Core lint output.

It must not include private validation, automatic fixes or Studio-computed readiness.

### Coverage evidence

Coverage evidence comes only from `CoreCoverageSummary` and Core-reported coverage state.

It may include scenario run counts, entity coverage records, expectation coverage records, relationship coverage records, unsupported coverage scopes and Core-reported ratios when available.

It must not include private coverage calculation or inferred coverage meaning.

## Completed PR sequence

### PR 1 - Planning and boundary document

Completed.

### PR 2 - Workbench evidence model extension

Completed.

### PR 3 - Workbench selection and Inspector binding foundation

Completed.

### PR 4 - Scenario evidence integration

Completed.

### PR 5 - Validation and coverage integration

Completed.

### PR 6 - Reference B Workbench visual polish

Completed.

### PR 7 - Workbench lint report wiring

Completed.

### Final PR - v0.13.0 release closure

Scope:

- update `README.md`;
- update `ROADMAP.md`;
- update `CHANGELOG.md`;
- add `docs/releases/v0.13.0-release-notes.md`;
- add `V0_13_0_RELEASE_CHECKLIST.md`;
- mark this plan as completed;
- bump `package.json`;
- update `package-lock.json`;
- bump `src-tauri/Cargo.toml`;
- update `src-tauri/Cargo.lock` if generated locally;
- bump `src-tauri/tauri.conf.json`.

## Explicit non-goals for v0.13.0

v0.13.0 does not introduce React Flow, graph library adoption, graph editing, drag/drop graph behavior, layout engine semantics, Mission Model authoring, YAML editor behavior, generated artifact mutation, plugin behavior, plugin execution, live telemetry, telemetry archive behavior, command uplink, mission control behavior, operational ground behavior, private YAML semantic parsing, private scenario YAML interpretation, private log-derived evidence, private relationship inference, private data-flow inference, private coverage calculation, private mission health calculation, private readiness calculation, private model completeness calculation, command authorization, command scheduling, command execution or Autonomy implementation.

## Required validation gate

Release closure must be validated from repository root:

```bash
npm install --package-lock-only
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

If either command changes a lockfile, the generated lockfile change must be committed before merging.

## Exit criteria

v0.13.0 is considered complete because Studio provides an evidence-integrated Mission Data Flow Workbench that:

- remains read-only;
- remains Core-derived;
- shows relationship, scenario, validation and coverage evidence only from Core-reported structured data;
- supports read-only selection of reported Workbench records;
- binds selection to Inspector detail without editing behavior;
- improves Scenario Timeline usefulness without YAML parsing or log-derived evidence;
- improves Lint / Validation Results usefulness without private validation or coverage calculation;
- stays visually aligned with Reference B;
- keeps Mission Cockpit as the entry point;
- does not introduce authoring, plugin behavior, command uplink, live telemetry or operational ground behavior.
