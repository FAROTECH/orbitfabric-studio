# OrbitFabric Studio v0.13.0 - Evidence-integrated Workbench Plan

## Status

```text
Document: v0.13.0 Evidence-integrated Workbench plan
Status: active planning baseline
Starting baseline: v0.12.0 - Mission Data Flow Workbench Foundation
Target milestone: v0.13.0 - Evidence-integrated Workbench
Primary UI reference: Reference B - Mission Data Flow Workbench
```

This document defines the implementation boundary for `v0.13.0 - Evidence-integrated Workbench`.

The milestone starts from the real `main` repository baseline after the completed `v0.12.0 - Mission Data Flow Workbench Foundation` release closure.

v0.13.0 must build on the dedicated Mission Data Flow Workbench surface introduced in v0.12.0. It must not replace that surface, restart the UI direction, or introduce a graph library, graph editing, Mission Model authoring, plugin behavior, command uplink, live telemetry or operational ground behavior.

## Purpose

v0.13.0 deepens the Mission Data Flow Workbench by integrating evidence, scenario, validation, coverage and Inspector behavior more directly into the Workbench.

The milestone must preserve the core rule:

```text
OrbitFabric Core emits a structured output.
Studio consumes and renders it.
```

Studio must remain downstream from OrbitFabric Core.

Studio must not invent mission semantics, graph semantics, data-flow links, health, readiness, completeness, coverage meaning or operational behavior.

## North Star binding

The visual and conceptual direction is documented in:

```text
docs/roadmap/studio-ui-north-star-reference.md
```

For v0.13.0, the relevant reference is:

```text
Reference B - Mission Data Flow Workbench
```

Reference B may guide:

- workbench layout grammar;
- information density;
- hierarchy between canvas, evidence panels, validation panels and Inspector;
- read-only selection behavior;
- scenario evidence presentation;
- validation and coverage visibility;
- progressive movement toward a more coherent data-flow-oriented engineering surface.

Reference B does not authorize:

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

## Repository-derived starting point

The real v0.12.0 baseline already provides:

- a dedicated `MissionDataFlowWorkbenchRoute`;
- a `MissionDataFlowWorkbenchSurface` with Reference B-oriented layout;
- a Graph View tab foundation;
- reserved YAML View and Scenario Runner tabs;
- a Data Flow Evidence tab entry;
- a canvas-like read-only Graph View foundation;
- Core-derived relationship node and edge rendering from `relationship_manifest.json` records;
- lower Scenario Timeline and Lint / Validation Results panels;
- Workbench source summaries;
- Workbench lane records;
- explicit read-only and Core-derived boundary language;
- App-level persistence of the latest Core-reported relationship manifest;
- shell navigation and command bar access to the dedicated Workbench surface.

The v0.12.0 foundation is intentionally incomplete for v0.13.0 purposes. The current Workbench has a placeholder-style Inspector, no real user selection binding, limited scenario evidence presentation and limited validation integration.

## Repository audit findings

The repository audit found one documentation inconsistency inherited from v0.12.0:

```text
docs/roadmap/studio-v0.12.0-workbench-validation-checklist.md
```

This path is referenced by v0.12.0 documentation, but the file is not present in the repository baseline inspected for v0.13.0 planning.

This finding does not block v0.13.0 implementation. It must be treated conservatively as a documentation audit issue. v0.13.0 work must not invent the missing checklist contents unless a later documentation cleanup PR explicitly decides to restore or remove the reference.

## Allowed data sources for v0.13.0

v0.13.0 may consume only data already represented through existing Studio state, Core reports, generated artifact inventory or explicitly unavailable states.

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

If a value or relation is not reported by one of these sources, Studio must render it as `unavailable`, `not-reported`, `reserved`, `diagnostic` or omit it.

## Data sources not allowed

v0.13.0 must not introduce private parsing, semantic reconstruction or implied links from:

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

v0.13.0 should make Workbench evidence explicit and inspectable.

### Relationship evidence

Relationship evidence comes only from `CoreRelationshipManifest`.

It may include:

- relationship types;
- relationship records;
- from and to endpoints;
- derivation metadata reported by Core;
- relationship manifest boundaries.

It must not include inferred graph adjacency or private relationship reconstruction.

### Scenario evidence

Scenario evidence comes only from `CoreSimulationReport` structured fields.

It may include:

- scenario identity;
- result;
- timeline records;
- events;
- commands;
- mode transitions;
- failed expectations;
- `data_flow_evidence` records;
- fields such as `t`, `data_product_id`, `producer`, `producer_type`, `triggered_by_command`, `storage_intent`, `downlink_intent`, `eligible_downlink_flows` and `contact_windows` when Core reports them.

It must not include evidence derived from scenario YAML or logs.

### Validation evidence

Validation evidence comes only from `CoreLintReport` and `CoreDashboardSummary.validation`.

It may include:

- validation result;
- error count;
- warning count;
- info count;
- findings reported by Core lint output;
- finding severity, code, file, domain, object id, message and suggestion when available.

It must not include private validation, automatic fixes or Studio-computed readiness.

### Coverage evidence

Coverage evidence comes only from `CoreCoverageSummary` and Core-reported coverage state.

It may include:

- scenario run counts;
- entity coverage records;
- expectation coverage records;
- relationship coverage records;
- unsupported coverage scopes;
- Core-reported ratios when available.

It must not include private coverage calculation or inferred coverage meaning.

## Workbench model direction

The existing `missionDataFlowWorkbenchModel.ts` should be extended conservatively.

The model should add explicit evidence integration concepts without replacing the existing lane foundation.

The model should preserve:

- `reported`;
- `not-reported`;
- `unavailable`;
- explicit provenance;
- raw Core record availability for Inspector display;
- read-only boundary metadata.

The model should avoid broad UI concerns. It should normalize only Core-reported records and generated artifact records already available to Studio.

## Workbench selection and Inspector direction

v0.13.0 should introduce read-only selection for Workbench records.

Selection may cover:

- lane records;
- canvas nodes derived from Core-reported relationship endpoints;
- canvas edges derived from Core-reported relationship records;
- scenario evidence records;
- validation findings;
- coverage records.

The Inspector must show only reported or explicitly unavailable information.

The Inspector must not edit, author, repair, mutate or generate anything.

The preferred direction is to bind Workbench selection into the existing contextual Inspector pattern rather than creating a separate incompatible Inspector system.

`App.tsx` is a large shell file. Any PR touching it must use a verified current full-file baseline and must keep the change narrow.

## Scenario evidence integration direction

The Scenario Timeline area in the Workbench should become more concrete by rendering Core-reported simulation records and data-flow evidence records.

It may show:

- timestamp or simulation time when reported;
- scenario identity;
- result;
- producer;
- data product id;
- command trigger;
- storage intent;
- downlink intent;
- eligible downlink flows;
- contact windows;
- raw record preview.

It must not parse scenario YAML semantically and must not derive evidence from logs.

## Validation and coverage integration direction

The Lint / Validation Results area should become more useful by rendering Core-reported validation and coverage evidence.

It may show:

- lint result;
- lint errors, warnings and info;
- Core lint findings;
- dashboard validation summary;
- coverage entity records;
- coverage relationship records;
- coverage expectation records;
- unsupported coverage scopes.

Links between validation, coverage, evidence and canvas records are allowed only when the required IDs or records are already reported by Core.

If a link cannot be proven from Core-reported structured data, Studio must show `not reported` or omit the link.

## UI and UX direction

v0.13.0 may improve the Workbench visual result toward Reference B through:

- clearer hierarchy between canvas, timeline, validation and Inspector;
- denser but readable panels;
- better empty states;
- better source and provenance badges;
- clearer selected-state presentation;
- clearer unavailable and not-reported states.

It must avoid decorative complexity and must not introduce visual behavior that implies unsupported semantics.

## Proposed PR sequence

### PR 1 - Planning and boundary document

Scope:

- add this plan;
- document v0.13.0 scope;
- document non-goals;
- document allowed evidence sources;
- document the evidence taxonomy;
- document the v0.12.0 validation checklist audit finding.

No code changes.

### PR 2 - Workbench evidence model extension

Scope:

- extend `missionDataFlowWorkbenchModel.ts` with conservative evidence integration concepts;
- add validation evidence from `CoreLintReport` and `CoreDashboardSummary.validation`;
- preserve existing lanes and provenance;
- keep raw Core records available for future Inspector binding.

No UI complexity yet.

### PR 3 - Workbench selection and Inspector binding foundation

Scope:

- add read-only Workbench selection for reported records, nodes and edges;
- bind the selected record to the existing Inspector pattern;
- avoid editing and authoring;
- avoid broad `App.tsx` rewrites.

### PR 4 - Scenario evidence integration

Scope:

- improve Scenario Timeline and Data Flow Evidence rendering inside the Workbench;
- show Core-reported fields only;
- preserve raw record inspection;
- no YAML parsing;
- no log-derived evidence.

### PR 5 - Validation and coverage integration

Scope:

- improve Lint / Validation Results rendering;
- show Core lint findings when reported;
- show coverage records when reported;
- show unsupported scopes explicitly;
- link records only when Core-reported IDs support the link.

### PR 6 - Reference B Workbench visual polish

Scope:

- improve layout density, hierarchy and readability;
- keep the dedicated Workbench clearly autonomous;
- improve empty states;
- no semantic expansion.

### Final PR - v0.13.0 release closure

Scope only after implementation is complete:

- update `README.md`;
- update `ROADMAP.md`;
- update `CHANGELOG.md`;
- add `docs/releases/v0.13.0-release-notes.md`;
- add `V0_13_0_RELEASE_CHECKLIST.md`;
- bump `package.json`;
- update `package-lock.json` if needed;
- bump `src-tauri/Cargo.toml`;
- update `src-tauri/Cargo.lock` if needed;
- bump `src-tauri/tauri.conf.json`.

## Explicit non-goals for v0.13.0

v0.13.0 does not introduce:

- React Flow;
- graph library adoption;
- graph editing;
- drag/drop graph behavior;
- layout engine semantics;
- Mission Model authoring;
- YAML editor behavior;
- generated artifact mutation;
- plugin behavior;
- plugin execution;
- live telemetry;
- telemetry archive behavior;
- command uplink;
- mission control behavior;
- operational ground behavior;
- private YAML semantic parsing;
- private scenario YAML interpretation;
- private log-derived evidence;
- private relationship inference;
- private data-flow inference;
- private coverage calculation;
- private mission health calculation;
- private readiness calculation;
- private model completeness calculation;
- command authorization;
- command scheduling;
- command execution;
- Autonomy implementation.

## Required validation gate

Every implementation PR must request local validation from repository root:

```bash
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

For release closure, also run:

```bash
npm install --package-lock-only
cargo check --manifest-path src-tauri/Cargo.toml
```

If either command changes a lockfile, the lockfile must be committed before merging.

## Exit criteria

v0.13.0 can be considered complete only if Studio provides an evidence-integrated Mission Data Flow Workbench that:

- remains read-only;
- remains Core-derived;
- shows relationship, scenario, validation and coverage evidence only from Core-reported structured data;
- supports read-only selection of reported Workbench records;
- binds selection to Inspector detail without editing behavior;
- improves Scenario Timeline usefulness without YAML parsing or log-derived evidence;
- improves Lint / Validation Results usefulness without private validation or coverage calculation;
- stays visually aligned with Reference B;
- keeps Mission Cockpit as the entry point;
- does not introduce authoring, plugin behavior, command uplink, live telemetry or operational ground behavior;
- passes local validation:

```bash
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```
