# OrbitFabric Studio - North-Star Gap Assessment after v0.14.0

## Status

```text
Document status: planning recalibration
Baseline assessed: v0.14.0 Artifact Traceability Integration, after Workbench layout polish
Primary references: Mission Cockpit north-star, Mission Data Flow Workbench north-star
Purpose: define the remaining distance to the target Studio experience before closing v0.14.0
```

This document recalibrates the OrbitFabric Studio roadmap after the v0.14.0 traceability work.

It is intentionally written before the v0.14.0 release-closure PR.

The goal is to avoid closing v0.14.0 as a purely procedural milestone while the product direction still needs explicit comparison against the two accepted north-star references.

## Executive conclusion

v0.14.0 moved Studio in the correct direction.

It introduced the right architectural foundation for read-only traceability:

- Workbench traceability model foundation.
- Inspector traceability blocks.
- Generated Artifacts to Workbench linkage.
- Route-level Workbench traceability posture.
- Explicit no-inference boundary.
- Continued deferral of React Flow and graph-library adoption.

However, v0.14.0 does not achieve north-star visual parity.

The milestone should be closed as:

```text
Artifact Traceability Integration
```

It must not be described as:

```text
Mission Cockpit realization
Mission Data Flow Workbench visual parity
Graph Workbench maturity
Product-grade Studio completion
```

The current state is conceptually strong and architecturally disciplined, but it still lacks part of the visual maturity, interaction density and cockpit/workbench polish shown in the north-star images.

## Boundary rule preserved

The core rule remains unchanged:

```text
OrbitFabric Core emits structured outputs.
Studio consumes and renders them.
```

Studio must not create mission semantics by interpreting missing data.

If Core does not report a value, Studio must show one of the following states:

```text
unavailable
not reported
reserved
diagnostic
```

This rule applies especially to:

- Mission Health.
- Model Completeness.
- Scenario Coverage.
- Data Product Coverage.
- Commandability Coverage.
- Readiness.
- Autonomy state.
- Runtime/ground integration maturity.
- Traceability completeness.

## North-star A - Mission Data Flow Workbench

### What the reference actually shows

The Mission Data Flow Workbench reference is not just a prettier graph.

It shows a full engineering inspection surface with:

- a dominant graph/canvas area;
- clear domain-specific nodes;
- visible flow direction;
- differentiated node families;
- explicit node status;
- direct and secondary relationships;
- zoom controls;
- minimap;
- layout selector;
- filter control;
- graph legend;
- lower scenario timeline;
- lower lint/validation table;
- persistent right Inspector;
- contextual warnings;
- artifact/runtime/ground linkage;
- metadata and tags;
- a professional density comparable to a technical operations console.

The two main traceability paths are:

```text
Payload -> Data Product -> Storage -> Downlink -> Contact -> Ground Artifact
```

```text
Command -> Mode -> Event -> Telemetry -> Scenario
```

These paths remain correct as product-direction references.

They are not a license for Studio to infer missing relationships.

### Current alignment after v0.14.0

v0.14.0 aligns with this reference in the following ways:

- The Workbench is now a dedicated read-only surface.
- It has a traceability model.
- It has selected-record Inspector behavior.
- It has traceability blocks.
- It can link generated artifacts into Workbench evidence.
- It exposes reported traceability counts.
- It preserves the Core-derived boundary.
- It keeps graph-library adoption deferred.

### Remaining gap

The largest remaining gap is visual and interaction maturity.

The current Workbench still needs:

- stronger graph/canvas fidelity;
- clearer domain color system;
- better node grouping;
- richer edge rendering;
- minimap behavior;
- zoom/fit controls that feel native;
- real filter behavior;
- stronger legend integration;
- more compact evidence density;
- an Inspector structured closer to the reference;
- clearer runtime and ground artifact affordances;
- better warning placement;
- better relationship between canvas selection and lower evidence panels.

### Gap estimate

```text
Conceptual alignment: high
Architecture alignment: high
Visual parity: medium-low
Interaction parity: medium-low
Overall distance remaining: about 55%
```

This means Studio is now on the right track, but it is not yet close enough to claim visual convergence.

## North-star B - Mission Cockpit

### What the reference actually shows

The Mission Cockpit reference is the product entry point.

It shows:

- top KPI cards;
- mission health;
- model completeness;
- lint status;
- scenario coverage;
- data product coverage;
- commandability coverage;
- mission data contract overview;
- recent validation results;
- recent scenario runs;
- generated artifact cards;
- status colors and progress bars;
- compact left navigation;
- persistent command bar;
- global footer status.

This is not the same problem as the Workbench.

The Cockpit is about rapid mission-contract posture.

The Workbench is about deep traceability inspection.

### Current alignment after v0.14.0

Studio already has several pieces that support this direction:

- primary shell;
- domain sidebar;
- command bar;
- Mission Cockpit surface;
- Generated Artifacts surface;
- Scenario Evidence surfaces;
- Workbench route;
- Core-derived report handling;
- explicit unavailable/reserved/diagnostic states.

### Remaining gap

The Cockpit still needs a dedicated realization milestone.

The reference cannot be copied naively because several visible metrics are dangerous if not Core-reported.

The Cockpit still needs:

- Core-derived KPI cards;
- explicit unavailable states for unsupported scores;
- compact contract overview rows;
- recent validation results panel;
- recent scenario runs panel;
- generated artifact cards;
- clearer mapping between cockpit cards and deeper surfaces;
- no invented mission health;
- no invented model completeness;
- no invented readiness;
- no invented coverage percentages.

### Gap estimate

```text
Conceptual alignment: medium-high
Architecture alignment: medium-high
Visual parity: medium
Semantic safety risk: high if copied too literally
Overall distance remaining: about 50%
```

The Cockpit should be the next major product-facing milestone.

It is more important than plugins.

## React Flow decision

React Flow was correctly deferred during v0.14.0.

It should remain deferred for v0.14.0 release closure.

However, after v0.15.0 Mission Cockpit Realization, graph-library adoption becomes legitimate to evaluate.

The likely decision point is v0.16.0.

If React Flow or an equivalent graph library is introduced, the constraints are strict:

- read-only only;
- Core-derived nodes and edges only;
- no graph editing;
- no drag/drop persistence;
- no layout-as-mission-semantics;
- no private relationship inference;
- no private data-flow inference;
- no command behavior;
- no runtime behavior;
- no generated artifact mutation;
- dedicated rollbackable PR;
- selection must drive the Inspector;
- graph state must remain UI state, not Mission Model state.

## Plugin-aware Studio Surface decision

The previous plugin-aware Studio direction remains valid, but it is no longer the immediate next major milestone.

Plugin-awareness should move later.

Current recommended position:

```text
v0.19.0 or later
```

Reason:

Studio must first mature as:

1. Mission Cockpit.
2. Graph Workbench.
3. Inspector and evidence console.
4. Generated artifact navigation surface.
5. Runtime/ground artifact traceability surface.

Only after that does plugin-awareness become a product-level priority.

## Recalibrated roadmap

### v0.14.0 - Artifact Traceability Integration

Status: close after release-hardening PR.

Purpose:

- close traceability model foundation;
- close Inspector traceability blocks;
- close Generated Artifacts linkage;
- close Workbench traceability posture;
- document the north-star gap;
- preserve all non-goals.

Not included:

- visual graph parity;
- Mission Cockpit realization;
- React Flow;
- plugin behavior;
- authoring;
- live telemetry;
- command uplink;
- private scoring;
- private inference.

### v0.15.0 - Mission Cockpit Realization

Primary objective:

```text
Bring the Mission Cockpit much closer to the Mission Cockpit north-star while preserving Core-derived semantics.
```

Scope:

- top KPI card grid;
- reported/unavailable metric states;
- Mission Data Contract Overview;
- recent validation results;
- recent scenario runs;
- generated artifact cards;
- links from Cockpit cards to domain surfaces, Workbench and Generated Artifacts;
- stronger compact dashboard density;
- no invented health/completeness/readiness.

Non-goals:

- no private mission health;
- no private model completeness;
- no private readiness;
- no private coverage calculation;
- no live telemetry;
- no command behavior;
- no authoring.

### v0.16.0 - Read-only Graph Workbench Engine

Primary objective:

```text
Replace the current canvas-like Workbench foundation with a proper read-only graph workbench if the model is stable enough.
```

Scope:

- evaluate React Flow or equivalent;
- read-only nodes and edges;
- minimap;
- zoom;
- fit view;
- filter controls;
- legend;
- selection to Inspector;
- domain coloring;
- Core-derived graph model only.

Non-goals:

- no graph editing;
- no drag/drop persistence;
- no semantic layout persistence;
- no YAML authoring;
- no private relationships.

### v0.17.0 - Workbench Evidence Console

Primary objective:

```text
Turn the Workbench into a stronger evidence inspection console.
```

Scope:

- richer scenario timeline;
- lint/validation table maturity;
- contextual warning blocks;
- better artifact/runtime/ground affordances;
- stronger traceability path inspection;
- evidence filters;
- status grouping;
- Inspector refinement.

### v0.18.0 - Authoring Readiness Assessment

Primary objective:

```text
Assess what can become safely authorable without violating the model-first contract.
```

This is not an authoring milestone.

It is an engineering assessment milestone.

Scope:

- define safe authoring boundaries;
- decide whether YAML editing belongs in Studio;
- identify Core validation gates required before any authoring;
- define rollback strategy;
- define generated artifact mutation prohibition;
- define source-of-truth ownership rules.

### v0.19.0 or later - Plugin-aware Studio Surface

Primary objective:

```text
Expose plugin-aware inspection only after the cockpit, graph workbench and evidence console are mature.
```

Scope must be re-evaluated when reached.

## Immediate next PR sequence

### PR #229 - North-star gap assessment and roadmap recalibration

Scope:

- add this document;
- update CHANGELOG;
- keep v0.14.0 open;
- no application code.

### PR #230 - v0.14.0 release closure

Scope:

- release notes v0.14.0;
- README alignment;
- CHANGELOG alignment;
- checklist closure;
- optional metadata version bump to `0.14.0`;
- final validation commands;
- GitHub Release decision.

## Final statement

v0.14.0 is a valid milestone.

It should be closed only after acknowledging that it is an architectural traceability milestone, not north-star parity.

The north-star direction remains correct.

The roadmap must now prioritize Mission Cockpit realization and Workbench graph maturity before plugin-awareness.
