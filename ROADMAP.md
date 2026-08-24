# OrbitFabric Studio — Roadmap

OrbitFabric Studio is a local-first engineering workbench for seeing and understanding an OrbitFabric mission.

> OrbitFabric exposes the Mission Data Contract. OrbitFabric Studio exposes the mission to the human.

## Current phase — Public Preview RC hardening

The first developer/source public preview is feature-frozen. Its complete journey is:

```text
Open Mission
  -> Mission Atlas
  -> Entity Explorer
  -> Entity X-Ray
  -> explicit relationship traversal
  -> Relationship Explorer
  -> Context Path
  -> Context Map
```

No additional product feature is required before the preview.

### Completed foundation

- mission-first reboot of the active React source tree;
- Core C1 Mission Snapshot integration;
- Core C4 explicit relationship integration, including minimum FDIR families;
- domain-qualified entity identity `{domain,id}`;
- progressive hydration and transactional refresh;
- React Flow + ELK Context Map over a renderer-independent graph model;
- bounded Core process lifetime and temporary-output cleanup;
- Tauri 2 security refresh, CSP and minimal capabilities;
- blocking dependency audit, frontend tests/build, Rust tests/check and Tauri production-path build in CI;
- removal of unreachable E60 runtime source and obsolete E60 QA tooling.

### Remaining preview gates

1. reproduce one clean clone using README only;
2. manually accept SpaceLab with no payloads;
3. final demo-3u smoke;
4. final OreSat-inspired heterogeneous/power-backlog smoke;
5. run the real Tauri visual pass at 1280, 960 and 640 px;
6. choose preview version/release naming;
7. require green CI on the release candidate;
8. merge draft PR #318 only after those gates close.

The canonical checklist is `docs/PUBLIC_PREVIEW_RELEASE_GATE.md`.

## Product roadmap after the preview

The next work extends how the user understands the same mission. It does not turn Studio into a collection of independent tools.

### Feature 5 — Operations Logic Lens

Primary question:

> What can happen from here?

The first implementation must include an Operational State Map when modes/transitions exist and must remain Core-owned in meaning. It should expose mode/state context, transitions, commandability, declared effects and explicit recovery/autonomy relationships without simulating mission behavior.

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
