# OrbitFabric Studio - Roadmap

OrbitFabric Studio is an experimental visual workbench for OrbitFabric Mission Data Contracts.

Studio exists to make Mission Data Contracts inspectable, navigable and understandable without replacing OrbitFabric Core or redefining mission semantics.

The Mission Model remains the source of truth. OrbitFabric Core remains authoritative for validation, scenario evidence, generated artifacts, contract introspection, entity indexing, relationship semantics and future plugin semantics. Studio is downstream.

---

## Current Baseline

```text
Current implementation baseline: v0.14.0 - Artifact Traceability Integration
Current technical milestone candidate: v0.14.0 - Artifact Traceability Integration
Active planning baseline: v0.15.0 - Mission Cockpit Realization
GitHub Release publication: deferred
```

v0.14.0 is the current implementation baseline.

It closed the Artifact Traceability Integration milestone by connecting generated artifacts, evidence records and Core-reported model entities more explicitly inside the Mission Data Flow Workbench.

v0.14.0 is an architectural traceability milestone, not a north-star visual parity release.

v0.15.0 is the active planning baseline. It must bring the Mission Cockpit closer to the accepted Cockpit north-star while preserving Core-derived semantics and explicit unavailable or not reported metric states.

Plugin-awareness remains deferred until the cockpit, graph Workbench and evidence console are mature.

Reference planning documents:

```text
docs/roadmap/studio-target-ui-convergence-strategy.md
docs/roadmap/studio-ui-north-star-reference.md
docs/roadmap/studio-v0.13.0-evidence-integrated-workbench-plan.md
docs/roadmap/studio-v0.14.0-artifact-traceability-integration-plan.md
docs/roadmap/studio-north-star-gap-assessment-after-v0.14.0.md
docs/roadmap/studio-v0.15.0-mission-cockpit-realization-plan.md
```

Release references:

```text
docs/releases/v0.13.0-release-notes.md
docs/releases/v0.14.0-release-notes.md
V0_13_0_RELEASE_CHECKLIST.md
V0_14_0_RELEASE_CHECKLIST.md
V0_15_0_RELEASE_CHECKLIST.md
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

This rule applies especially to mission health, readiness, model completeness, coverage, traceability completeness, operational status and autonomy status.

---

## Completed Baselines

```text
v0.0.0  - Studio Charter
v0.1.0  - Read-only Mission Project Viewer
v0.2.0  - Validation and Diagnostics Workbench
v0.3.0  - Contract Navigation Surface
v0.4.0  - Relationship Surface
v0.5.0  - Generated Artifact Explorer
v0.6.0  - Studio Information Architecture & UX Foundation
v0.7.0  - Scenario Evidence Explorer
v0.7.1  - Dashboard and Coverage Foundation
v0.7.2  - Core-derived Dashboard UX Realization
v0.8.0  - Ground Integration Artifact Viewer
v0.9.0  - Semantic Navigation & Unified Shell
v0.10.0 - Mission Cockpit Consolidation
v0.11.0 - Domain Surfaces & Entity Detail System
v0.11.1 - Runtime UI triage hotfix
v0.12.0 - Mission Data Flow Workbench Foundation
v0.13.0 - Evidence-integrated Workbench
v0.14.0 - Artifact Traceability Integration
```

Completed baselines preserve the same boundary: Studio remains read-only by default, Core-derived and non-authoritative for mission semantics.

## v0.14.0 Closure Summary

v0.14.0 turned the Mission Data Flow Workbench into a stronger read-only traceability surface.

It introduced:

- traceability model foundation;
- traceability groups, links, endpoints and summary counts;
- traceability link generation for Core-reported relationship, scenario, validation, coverage and generated artifact evidence;
- compact Workbench Inspector traceability blocks;
- generated artifact inventory bridge;
- generated output traceability links;
- route-level Workbench traceability posture panel;
- north-star gap assessment and roadmap recalibration;
- metadata alignment to `0.14.0`.

v0.14.0 did not introduce graph-library adoption, graph editing, authoring, artifact mutation, runtime operations, private inference, private scoring, Autonomy implementation or plugin behavior.

---

## Active Planning Baseline

### v0.15.0 - Mission Cockpit Realization

Status: Planned

Primary objective:

```text
Bring the Mission Cockpit much closer to the Mission Cockpit north-star while preserving Core-derived semantics.
```

Scope:

- top KPI card grid;
- reported, unavailable and not reported metric states;
- Mission Data Contract Overview;
- Recent Validation Results;
- Recent Scenario Runs;
- Generated Artifacts cards;
- links from Cockpit cards to domain surfaces, Workbench, Scenarios and Generated Artifacts;
- stronger compact dashboard density.

Metric policy:

- Mission Health must be Core-derived or shown as `not reported` / `unavailable`.
- Model Completeness must be Core-derived or shown as `not reported` / `unavailable`.
- Lint Status may use Core lint or dashboard validation outputs.
- Scenario Coverage must be Core-derived and must not be inferred from scenario run counts.
- Data Product Coverage must be Core-derived and must not be inferred from data product entity counts.
- Commandability Coverage must be Core-derived and must not be inferred from command counts or domain presence.

Non-goals:

- no React Flow or graph-library adoption;
- no graph editing;
- no Mission Model authoring;
- no generated artifact mutation;
- no operational behavior;
- no private health, completeness, readiness or coverage calculation;
- no private relationship or data-flow inference;
- no Autonomy implementation;
- no plugin behavior.

Planned PR sequence:

1. Planning and boundary document.
2. Cockpit data model refinement.
3. Top KPI card grid.
4. Mission Data Contract Overview panel.
5. Recent Validation Results panel.
6. Recent Scenario Runs panel.
7. Generated Artifacts cockpit cards.
8. Cockpit navigation and linkage polish.
9. Cockpit visual density polish.
10. v0.15.0 release hardening.

---

## Accepted UI Convergence Direction

The accepted direction remains a mission-domain cockpit and integrated data-flow workbench.

```text
v0.15.0 - Mission Cockpit Realization
v0.16.0 - Read-only Graph Workbench Engine
v0.17.0 - Workbench Evidence Console
v0.18.0 - Authoring Readiness Assessment
v0.19.0 or later - Plugin-aware Studio Surface
```

## Future Decision Points

### v0.16.0 - Read-only Graph Workbench Engine

v0.16.0 may evaluate React Flow or an equivalent graph library only under strict read-only, Core-derived constraints.

### v0.17.0 - Workbench Evidence Console

v0.17.0 should strengthen scenario timeline, lint and validation tables, contextual warning blocks, artifact/runtime/ground affordances, traceability path inspection, evidence filters, status grouping and Inspector refinement.

### v0.18.0 - Authoring Readiness Assessment

v0.18.0 is an assessment milestone only. It should decide what can become safely authorable without violating the model-first contract.

### v0.19.0 or later - Plugin-aware Studio Surface

Plugin-awareness remains deferred until the cockpit, graph workbench and evidence console are mature.
