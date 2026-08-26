# OrbitFabric Studio — Roadmap

OrbitFabric Studio is a local-first engineering workbench for seeing and understanding an OrbitFabric mission.

> OrbitFabric exposes the Mission Data Contract. OrbitFabric Studio exposes the mission to the human.

## Current phase — Preview 1 frozen baseline

The first developer/source public preview is published and feature-frozen. Its release identity is **OrbitFabric Studio 0.15.0 Preview 1** (`v0.15.0-preview.1`). Its complete journey is:

```text
Open Mission
  -> Mission Atlas
  -> Explore / Entity X-Ray
  -> Relations / Context Path / Context Map
  -> Validation Findings / exact entity inspection
  -> Operations / Operational State Map / Mode Focus
```

No additional product feature belongs to Preview 1. Correctness, security and documentation fixes may be applied without expanding its product scope.

### Completed foundation

- mission-first reboot of the active React source tree;
- Core C1 Mission Snapshot integration;
- Core C4 explicit relationship integration, including minimum FDIR families;
- domain-qualified entity identity `{domain,id}`;
- progressive hydration and transactional refresh;
- Validation Findings Viewer with complete Core fields, filters and exact `{domain,id}` inspection;
- Operations Logic Lens with a declared Operational State Map and Mode Focus;
- React Flow + ELK Context/Operational maps over renderer-independent presentation models;
- ELK-owned orthogonal routing plus geometric regression tests for cyclic graphs;
- bounded Core process lifetime and temporary-output cleanup;
- Tauri 2 security refresh, CSP and minimal capabilities;
- blocking dependency audit, frontend tests/build, Rust tests/check and Tauri production-path build in CI;
- removal of unreachable E60 runtime source and obsolete E60 QA tooling.

### Publication state

- the repository is public;
- tag `v0.15.0-preview.1` and the corresponding GitHub prerelease are published;
- the mandatory public-preview release gate is closed;
- future product features target a later version rather than changing the Preview 1 baseline.

The canonical closed checklist is `docs/PUBLIC_PREVIEW_RELEASE_GATE.md`.

## Product roadmap after the preview

Operations Logic is now part of the feature-frozen preview. The next work extends how the user understands the same mission without turning Studio into a collection of independent tools.

### Feature 6 — Data Product Journey

Primary question:

> How does mission data become something that can be stored and downlinked?

The first implementation must provide a visual product-centric journey across producer, product, flow and link/contact context. Eligibility must not be presented as observed downlink, and capacity must remain Core-derived.

### Scenarios and evidence

Later work follows the Contract-to-Evidence arc:

```text
MISSION CONTRACT
      -> RELATIONSHIPS
      -> SCENARIO
      -> RUN / REPLAY
      -> EXPECTATIONS
      -> COVERAGE
```

The UX must preserve:

```text
DECLARED != OBSERVED
```

Scenario, replay and evidence surfaces are therefore later mission-understanding lenses, not a simulation engine and not live operations.

## Architectural roadmap rules

Every future feature must preserve:

- Core owns mission semantics, validation and explicit engineering relationships;
- Rust/Tauri owns process, filesystem, temporary storage and native integration;
- React/TypeScript owns presentation, interaction and a non-authoritative read model;
- Studio may organize and visualize Core facts but must not infer missing engineering truth;
- provenance/raw files support understanding but are not the product entry point;
- a visualization must answer a concrete mission question;
- no private health/readiness/completeness/coverage scoring;
- no database or server is introduced without a specific non-authoritative need.

## Deliberately outside the current roadmap

The public preview does not imply Mission Model editing, generic YAML authoring, cloud collaboration, live telemetry, uplink, mission control, ground-segment behavior, physical simulation, or binary distribution. Any future authoring capability would require a separate product and architecture decision; it is not an assumed destination of the current roadmap.

## Release principle

> Release the smallest complete product that already changes how an engineer understands a mission.
