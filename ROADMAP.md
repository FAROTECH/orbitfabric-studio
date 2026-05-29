# OrbitFabric Studio - Roadmap

OrbitFabric Studio is an experimental visual workbench for OrbitFabric Mission Data Contracts.

Studio exists to make the Mission Data Contract easier to inspect, validate, navigate and understand without replacing OrbitFabric Core or redefining mission semantics.

The Mission Model remains the source of truth.

OrbitFabric Core remains authoritative for validation, scenario evidence, generated artifacts, contract introspection, entity indexing, relationship semantics and future plugin semantics.

Studio is downstream.

---

## Current Baseline

```text
Current implementation baseline: v0.13.0 - Evidence-integrated Workbench
Current released milestone: v0.13.0 - Evidence-integrated Workbench
Next planning baseline: v0.14.0 - Artifact Traceability Integration
```

v0.13.0 is the current implementation baseline.

v0.13.0 deepens the dedicated read-only, Core-derived Mission Data Flow Workbench and moves it closer to Reference B in the Studio UI North Star document.

The previous immediate Plugin-aware Studio Surface direction remains deferred. Plugin-awareness is planned only after the shell, semantic navigation, Inspector, Mission Cockpit, domain surfaces, Mission Data Flow Workbench, evidence integration and artifact traceability foundations are stable.

Reference planning documents:

```text
docs/roadmap/studio-target-ui-convergence-strategy.md
docs/roadmap/studio-ui-north-star-reference.md
docs/roadmap/studio-v0.13.0-evidence-integrated-workbench-plan.md
```

Release notes:

```text
docs/releases/v0.13.0-release-notes.md
```

Release checklist:

```text
V0_13_0_RELEASE_CHECKLIST.md
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

### v0.9.0 - Semantic Navigation & Unified Shell

Status: Completed

Transformed Studio from a surface-oriented workbench into a mission-domain-oriented shell.

v0.9.0 introduced typed navigation, semantic mission-domain sidebar, explicit legacy surface mapping, shell states, persistent Inspector behavior, model-backed shell command bar, global shell status bar and metadata alignment to `0.9.0`.

v0.9.0 does not introduce new OrbitFabric Core semantics, graph UI, React Flow, authoring, plugin behavior, command uplink, live telemetry, generated artifact mutation, operational ground behavior, private mission health calculation, private readiness calculation or private model completeness calculation.

Release notes:

```text
docs/releases/v0.9.0-release-notes.md
```

Release checklist:

```text
V0_9_0_RELEASE_CHECKLIST.md
```

### v0.10.0 - Mission Cockpit Consolidation

Status: Completed

Consolidated the Mission Dashboard into a clearer Mission Cockpit without adding new OrbitFabric Core semantics.

v0.10.0 introduced Mission Cockpit visual hierarchy consolidation, reported evidence lanes, cockpit provenance vocabulary, shell layout stabilization, active navigation tracking by mission-domain item and metadata alignment to `0.10.0`.

v0.10.0 does not introduce new OrbitFabric Core semantics, graph UI, React Flow, authoring, plugin behavior, command uplink, live telemetry, generated artifact mutation, operational ground behavior, private mission health calculation, private readiness calculation or private model completeness calculation.

Release notes:

```text
docs/releases/v0.10.0-release-notes.md
```

Release checklist:

```text
V0_10_0_RELEASE_CHECKLIST.md
```

### v0.11.0 - Domain Surfaces & Entity Detail System

Status: Completed

Introduced dedicated read-only Core-derived mission-domain surfaces and consistent entity list/detail inspection.

v0.11.0 introduced reusable CoreDomainSurface, Core domain surface factory, model-inventory domain registry, dedicated mission-domain surfaces, contextual Inspector binding for selected Core entities and metadata alignment to `0.11.0`.

v0.11.0 does not introduce new OrbitFabric Core semantics, graph UI, React Flow, authoring, plugin behavior, command uplink, live telemetry, generated artifact mutation, operational ground behavior, private YAML semantic parsing, private relationship inference, private mission health calculation, private readiness calculation or private model completeness calculation.

Release notes:

```text
docs/releases/v0.11.0-release-notes.md
```

Release checklist:

```text
V0_11_0_RELEASE_CHECKLIST.md
```

### v0.11.1 - Runtime UI triage hotfix

Status: Completed

Prepared the implementation baseline for v0.12.0 by fixing runtime UI issues after v0.11.0 without introducing Mission Data Flow Workbench functionality.

v0.11.1 fixed main content scroll reset, source file inspection copy, explicit reserved Autonomy routing and Scenario / Recent runs empty-state copy.

v0.11.1 does not introduce Mission Data Flow Workbench, React Flow, graph UI, authoring, plugin behavior, command uplink, live telemetry, Autonomy implementation or generated artifact semantic mutation.

Release notes:

```text
docs/releases/v0.11.1-release-notes.md
```

### v0.12.0 - Mission Data Flow Workbench Foundation

Status: Completed

Introduced the first dedicated read-only, Core-derived Mission Data Flow Workbench foundation aligned with Reference B.

v0.12.0 introduced:

- Mission Data Flow Workbench data model foundation;
- Workbench source summaries, lanes, records, counts and boundary metadata;
- Reference B-oriented Workbench layout;
- Graph View, YAML View, Scenario Runner and Data Flow Evidence tab strip;
- central read-only canvas-like Graph View foundation;
- right-side Workbench Inspector placeholder;
- lower Scenario Timeline and Lint / Validation Results panels;
- Core-derived relationship edge rendering from `relationship_manifest.json` records;
- dedicated Mission Data Flow Workbench route frame;
- shell wiring for the dedicated Workbench surface;
- Data Flow Workbench sidebar entry;
- Inspect Data Flow command bar action;
- App-level relationship manifest persistence for the Workbench surface;
- shell status bar support for the Workbench surface;
- release notes and checklist;
- metadata alignment to `0.12.0`.

v0.12.0 does not introduce React Flow, graph library adoption, graph editing, drag/drop behavior, layout engine semantics, Mission Model authoring, generated artifact mutation, plugin behavior, command uplink, live telemetry, operational ground behavior, private YAML semantic parsing, private relationship inference, private data-flow inference, mission health calculation, readiness calculation, completeness calculation or Autonomy implementation.

Release notes:

```text
docs/releases/v0.12.0-release-notes.md
```

Release checklist:

```text
V0_12_0_RELEASE_CHECKLIST.md
```

### v0.13.0 - Evidence-integrated Workbench

Status: Completed

Deepened the dedicated read-only, Core-derived Mission Data Flow Workbench by integrating relationship, scenario, validation and coverage evidence more directly into the Workbench surface.

v0.13.0 introduced:

- v0.13.0 Evidence-integrated Workbench planning and boundary documentation;
- explicit Workbench evidence kinds for relationship, scenario, validation, coverage and artifact evidence;
- a dedicated validation evidence lane in the Workbench model;
- validation evidence records from `CoreLintReport`;
- fallback validation summary records from `CoreDashboardSummary.validation`;
- richer coverage evidence records for scenario runs, entity coverage, expectation coverage, relationship coverage and unsupported scopes;
- record-level evidence kind provenance metadata;
- read-only local Workbench selection for Core-reported nodes, edges and evidence records;
- Workbench Inspector updates from selected Core-derived items;
- raw Core-reported payload preview in the Workbench Inspector;
- Scenario Timeline rendering of Core-reported `data_flow_evidence` fields;
- Validation, Coverage and Relationship evidence grouping in the Lint / Validation Results panel;
- compact Workbench evidence posture rail;
- Reference B-oriented Workbench visual polish;
- Workbench lint report wiring through both Mission Cockpit and the dedicated Workbench route;
- metadata alignment to `0.13.0`.

v0.13.0 does not introduce React Flow, graph library adoption, graph editing, drag/drop behavior, layout engine semantics, Mission Model authoring, YAML editor behavior, generated artifact mutation, plugin behavior, command uplink, live telemetry, operational ground behavior, private YAML semantic parsing, private scenario YAML interpretation, private log-derived evidence, private relationship inference, private data-flow inference, private coverage calculation, private mission health calculation, private readiness calculation, private model completeness calculation, command authorization, command scheduling, command execution or Autonomy implementation.

Release notes:

```text
docs/releases/v0.13.0-release-notes.md
```

Release checklist:

```text
V0_13_0_RELEASE_CHECKLIST.md
```

---

## Active Planning Baseline

### v0.14.0 - Artifact Traceability Integration

Status: Planned

v0.14.0 should build on the evidence-integrated Mission Data Flow Workbench by making generated artifact traceability more explicit across Core-reported entities, evidence records and generated outputs.

v0.14.0 must preserve the Core-derived boundary established through previous milestones.

It must not introduce Mission Model authoring, generated artifact mutation, command uplink, live telemetry, plugin behavior, private relationship inference, private data-flow inference or operational ground behavior.

---

## Accepted UI Convergence Direction

The post-v0.9.0 direction remains a mission-domain cockpit and integrated data-flow workbench.

UI north star reference:

`docs/roadmap/studio-ui-north-star-reference.md`

Accepted roadmap direction:

```text
v0.9.0  - Semantic Navigation & Unified Shell
v0.10.0 - Mission Cockpit Consolidation
v0.11.0 - Domain Surfaces & Entity Detail System
v0.12.0 - Mission Data Flow Workbench Foundation
v0.13.0 - Evidence-integrated Workbench
v0.14.0 - Artifact Traceability Integration
v0.15.0 - Plugin-aware Studio Surface
```
