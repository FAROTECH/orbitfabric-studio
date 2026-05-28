# OrbitFabric Studio v0.12.0 - Mission Data Flow Workbench Foundation Plan

## Status

```text
Document: v0.12.0 Mission Data Flow Workbench Foundation plan
Status: active planning baseline
Starting baseline: v0.11.1 - Runtime UI triage hotfix for v0.11.0
Target milestone: v0.12.0 - Mission Data Flow Workbench Foundation
Primary UI reference: Reference B - Mission Data Flow Workbench
```

This document defines the first implementation boundary for `v0.12.0 - Mission Data Flow Workbench Foundation`.

The milestone starts from the real `v0.11.1` repository baseline, not from the pure `v0.11.0` release state.

`v0.11.1` does not introduce Mission Data Flow Workbench functionality. It is a runtime UI triage hotfix that preserves the v0.11.0 Domain Surfaces & Entity Detail System boundary.

## Purpose

v0.12.0 must introduce the first controlled foundation for the Mission Data Flow Workbench.

It must not become a generic UI increment.

It must move Studio toward the Reference B workbench grammar while preserving the core rule:

```text
OrbitFabric Core emits a structured output.
Studio consumes and renders it.
```

Studio must remain downstream from OrbitFabric Core.

Studio must not invent mission semantics, graph semantics, data-flow links, readiness, health, completeness or operational behavior.

## North Star binding

The visual and conceptual direction is documented in:

```text
docs/roadmap/studio-ui-north-star-reference.md
```

For v0.12.0, the relevant reference is:

```text
Reference B - Mission Data Flow Workbench
```

Reference B may guide:

- workbench layout grammar;
- information density;
- lane and panel hierarchy;
- Inspector binding;
- scenario, evidence and validation integration;
- progressive movement toward a data-flow-oriented surface.

Reference B does not authorize:

- graph semantics not reported by Core;
- private relationship inference;
- private data-flow inference;
- Mission Model authoring;
- generated artifact mutation;
- React Flow adoption;
- live telemetry behavior;
- command uplink behavior;
- plugin behavior;
- operational ground behavior.

## Repository-derived starting point

The real v0.11.x baseline already provides:

- semantic mission-domain navigation;
- dedicated read-only Core-derived domain surfaces;
- `CoreDomainSurface` and `createCoreDomainSurface`;
- `DomainSurfaceShell` primitives;
- `domainSurfaceModel` state vocabulary;
- contextual Inspector binding for selected Core entities;
- Mission Cockpit evidence lanes;
- generated artifact inventory and preview;
- Ground Integration Artifact Viewer;
- parsers for Core reports in `coreReports.ts`;
- TypeScript structures in `types/workspace.ts` for Core reports, relationship manifest, scenario run index, coverage summary and simulation reports.

The workbench foundation must reuse these patterns where possible.

## Real data sources allowed for v0.12.0

The first workbench foundation may consume only data already represented in the current repository through existing types, parsers or generated artifact inventory paths.

Allowed sources:

- `WorkspaceInspection`;
- `CoreModelSummary` from `model_summary.json`;
- `CoreEntityIndex` from `entity_index.json`;
- `CoreRelationshipManifest` from `relationship_manifest.json`;
- `CoreDashboardSummary` from `dashboard_summary.json`;
- `CoreScenarioRunIndex` from `scenario_run_index.json`;
- `CoreCoverageSummary` from `coverage_summary.json`;
- `CoreSimulationReport` from `orbitfabric-sim` JSON reports;
- `CoreSimulationReport.data_flow_evidence`, if reported by Core;
- generated artifact inventory produced by existing Studio inspection of `generated/`;
- known generated artifact identities already documented by Studio.

If a value or relation is not reported by one of these sources, Studio must show it as `unavailable`, `not reported`, `reserved`, `diagnostic` or omit it.

## Data sources not allowed

v0.12.0 must not introduce private parsing or semantic reconstruction from:

- Mission Model YAML content;
- naming conventions not already documented as generated artifact identity rules;
- file paths used as semantic relation evidence;
- UI mockup layout;
- inferred domain adjacency;
- hardcoded telemetry-to-packet-to-data-product chains;
- visual graph assumptions.

## First implementation direction

The first implementation slice should be a small read-only Mission Data Flow Workbench foundation.

It should be a workbench surface, not a graph editor.

A safe first vertical slice may include:

- a dedicated surface or shell entry only after build hygiene is verified;
- workbench-style lanes based on available Core-derived report snapshots;
- explicit source/provenance/status badges;
- relationship manifest summary when reported;
- scenario data-flow evidence summary when reported;
- generated artifact endpoints when inventory has been loaded;
- empty states for missing reports;
- Inspector binding for selected reported records, if it can reuse the existing Inspector pattern without broad refactor.

It must not draw node-link relationships unless the required relationship records are reported by Core and the representation clearly remains a read-only report view.

## Preferred lane grammar

The foundation may use a lane or panel grammar such as:

```text
Mission domains
  -> reported entity inventory
Relationship manifest
  -> reported relationship types and records
Scenario evidence
  -> reported simulation data_flow_evidence records
Coverage
  -> reported supported and unsupported scopes
Generated artifacts
  -> known report, documentation, runtime and ground artifact endpoints
Inspector
  -> selected reported record, provenance, raw record, boundary
```

This is a UI organization proposal only.

It is not a semantic model.

The actual implementation must be driven by the concrete data already loaded in the application state.

## Required build hygiene checkpoint

Before code implementation starts, the repository must be build-checked locally:

```bash
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

If the build fails on the current baseline, the next PR must be a narrow build hygiene hotfix before any v0.12.0 workbench implementation.

Known audit checkpoint:

```text
App.tsx references ScenarioEvidenceSurface.
A dedicated src/ScenarioEvidenceSurface.tsx file was not confirmed during the initial repository audit.
This must be verified locally before the first implementation PR.
```

This note does not assert a failure by itself. It blocks premature implementation until the local build confirms the baseline state.

## PR sequence

### PR 1 - Planning and baseline alignment

Scope:

- add this plan;
- align README, ROADMAP and CHANGELOG to the real v0.11.1 baseline;
- document that v0.12.0 starts after v0.11.1;
- preserve all non-goals.

No code changes.

### PR 2 - Build hygiene, only if needed

Scope:

- fix only build-breaking baseline issues discovered by `npm run build`;
- no workbench functionality;
- no UI expansion.

### PR 3 - Workbench data model foundation

Scope:

- introduce minimal UI model types only if existing types are not sufficient;
- normalize existing Core report snapshots conservatively;
- preserve explicit unavailable/not-reported states.

No graph library.

### PR 4 - Read-only workbench shell foundation

Scope:

- add the first Mission Data Flow Workbench surface or equivalent shell route;
- render lanes or cards from real Core-derived data;
- expose provenance and boundaries;
- bind selection to Inspector only if the existing pattern can be reused cleanly.

No inferred links.

### PR 5 - North Star layout polish

Scope:

- increase density and hierarchy toward Reference B;
- improve empty states;
- keep the workbench read-only and Core-derived.

No semantic expansion.

## Explicit non-goals for v0.12.0

v0.12.0 does not introduce:

- React Flow;
- full graph UI;
- graph editing;
- visual authoring;
- Mission Model editing;
- generated artifact mutation;
- plugin execution;
- plugin marketplace;
- command uplink;
- live telemetry;
- telemetry archive runtime;
- mission control behavior;
- operational ground behavior;
- private YAML semantic parsing;
- private relationship inference;
- private health calculation;
- private readiness calculation;
- private completeness calculation;
- private coverage semantics;
- Autonomy implementation.

## Exit criteria

v0.12.0 can be considered complete only if Studio provides a first read-only Mission Data Flow Workbench foundation that:

- is based only on Core-derived reports, generated artifacts or explicit unavailable states;
- reuses existing Studio shell, Inspector, badge and provenance patterns where possible;
- preserves the v0.11.x domain surfaces;
- does not introduce React Flow or graph UI;
- does not infer unsupported relationships;
- does not introduce authoring, plugin behavior, command uplink or live telemetry;
- passes local validation:

```bash
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```
