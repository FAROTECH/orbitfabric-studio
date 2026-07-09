# OrbitFabric Studio — Roadmap

OrbitFabric Studio is a local-first visual engineering workbench for OrbitFabric Mission Data Contracts.

Studio exists to make Mission Data Contracts inspectable, navigable and reviewable without replacing OrbitFabric Core or creating private mission semantics.

---

## Current phase

```text
Phase: publication hardening
Baseline: post-E28 visual closure and post-E34 documentation archive cleanup
Package version: 0.14.0
Packaging: inactive
Brand assets: provisional
```

The project has completed the current visual stabilization sequence:

- E28 — final Studio visual closure gate;
- E29 — generated artifacts action contract;
- E30 — label overflow / ellipsis audit decision;
- E31 — application identity / packaging asset audit;
- E32 — master cleanup / publication hardening plan;
- E33 — archive historical release checklists;
- E34 — archive historical planning documentation.

The next work focuses on making the repository clean, understandable and maintainable before adding new product surface area.

---

## Roadmap principles

Every milestone must preserve the distinction among:

```text
source model      = authoritative Mission Model files
derived report    = OrbitFabric Core output derived from the source model
generated output  = disposable artifact generated from the contract
UI state          = local Studio presentation and interaction state
```

Correct pattern:

```text
OrbitFabric Core emits a structured output.
Studio consumes and renders it.
```

Incorrect pattern:

```text
Studio reimplements Core semantics because the required output is missing.
```

Studio may render, organize and explain engineering evidence.

Studio must not invent engineering evidence.

---

## Active cleanup roadmap

### E35 — Documentation Rewrite / Current Project Narrative

Rewrite current-facing documentation around the actual stabilized baseline.

Scope:

- `README.md`;
- `ROADMAP.md`;
- `docs/ARCHITECTURE.md`;
- possible later review of `docs/DATA_BOUNDARIES.md`.

Non-goals:

- no runtime changes;
- no source refactor;
- no CSS changes;
- no packaging activation;
- no brand asset redesign.

### E36 — Source Architecture Refactor Plan

Document how to improve source architecture without destabilizing the E28 visual baseline.

Expected focus:

- `src/App.tsx`;
- `src-tauri/src/lib.rs`;
- CSS import layering;
- shell/surface routing boundaries;
- legacy surface mapping;
- QA gates for future refactor slices.

### E37+ — Source Architecture Refactor Slices

Perform small, reversible refactors.

Rules:

- one architectural seam per PR;
- no visual redesign;
- no Core/model-data changes;
- build and QA gates required;
- visual baseline must remain protected.

### Brand Assets / Logo / App Icon

Final graphical assets are deferred to a dedicated brand-assets chat and PR.

Scope when started:

- logo;
- app icon master;
- favicon;
- Tauri icon set;
- visual brand usage rules.

This must happen before packaging activation.

### Packaging Activation

Packaging remains inactive until after brand assets are finalized.

A packaging PR must explicitly decide:

- bundle targets;
- final icon set;
- signing expectations;
- macOS notarization expectations;
- release artifact naming;
- versioning policy;
- release channel.

---

## Product roadmap after hardening

Future product milestones remain conditional on source maturity and Core support.

### Mission Cockpit Realization

Goal:

```text
Bring the Mission Cockpit closer to the accepted cockpit north-star while preserving Core-derived semantics.
```

Allowed:

- stronger cockpit density;
- clearer Core-derived evidence cards;
- reported / unavailable metric states;
- links to Workbench, Scenarios and Generated Artifacts.

Not allowed:

- private health calculation;
- private readiness calculation;
- private model completeness calculation;
- private coverage calculation;
- operational state simulation;
- live telemetry behavior.

### Read-only Graph Workbench

A graph library such as React Flow may be reconsidered only when the graph model is Core-derived and explainable.

Allowed graph edges:

- Core-reported relationships;
- generated-artifact provenance links;
- scenario evidence links;
- explicitly documented Core outputs.

Not allowed:

- private graph semantics;
- graph editing;
- layout-as-mission-meaning;
- inferred relationship recovery.

### Workbench Evidence Console

Future evidence-console work may improve:

- scenario timeline readability;
- lint/validation tables;
- traceability inspection;
- artifact/runtime/ground evidence grouping;
- status filtering;
- Inspector refinement.

It must not introduce private scenario interpretation or private validation.

### Authoring Readiness Assessment

Authoring is not part of the current baseline.

A future authoring-readiness milestone may assess controlled editing only if edits are:

- explicit;
- reviewable;
- represented as source Mission Model patches;
- validated by OrbitFabric Core;
- never applied silently.

### Plugin-aware Studio Surface

Plugin-awareness remains deferred until the cockpit, graph workbench and evidence console are mature.

Plugin behavior must be Core-declared or explicitly documented. Studio must not invent plugin semantics.

---

## Archived roadmap history

Historical release notes, milestone plans and implementation notes are preserved under:

```text
docs/archive/
```

These files explain how Studio evolved, but they no longer define the active roadmap.
