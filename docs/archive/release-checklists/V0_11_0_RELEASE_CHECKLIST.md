# OrbitFabric Studio v0.11.0 Release Checklist

## Release identity

```text
Milestone: v0.11.0 - Domain Surfaces & Entity Detail System
Status: release closure
Previous baseline: v0.10.0 - Mission Cockpit Consolidation
Next baseline: v0.12.0 - Mission Data Flow Workbench Foundation
```

## Scope confirmation

- [x] Dedicated Core-derived domain surface pattern introduced.
- [x] Spacecraft domain surface implemented.
- [x] Subsystems domain surface implemented.
- [x] Modes domain surface implemented.
- [x] Telemetry domain surface implemented.
- [x] Commands domain surface implemented.
- [x] Events domain surface implemented.
- [x] Faults domain surface implemented.
- [x] Packets domain surface implemented.
- [x] Payloads domain surface implemented.
- [x] Data Products domain surface implemented conservatively.
- [x] Contacts & Downlink domain surface implemented conservatively.
- [x] Commandability domain surface implemented conservatively.
- [x] Autonomy remains reserved.
- [x] Core entity selection is bound to the contextual Inspector.
- [x] Domain surface rendering is centralized through a typed runtime registry.
- [x] Domain wrappers are declarative and backed by a shared factory.
- [x] Legacy Model Inventory fallback is preserved.
- [x] Missing Core data remains represented as `unavailable`, `not reported`, `reserved` or `diagnostic`.

## Explicit non-goals preserved

- [x] No new OrbitFabric Core semantics.
- [x] No Mission Model editing.
- [x] No generated artifact editing.
- [x] No generated artifact mutation.
- [x] No visual authoring.
- [x] No graph UI.
- [x] No React Flow adoption.
- [x] No plugin execution.
- [x] No plugin marketplace.
- [x] No live telemetry.
- [x] No telemetry archive behavior.
- [x] No command uplink behavior.
- [x] No mission control behavior.
- [x] No operational ground behavior.
- [x] No private YAML semantic parsing.
- [x] No private relationship inference.
- [x] No private coverage calculation.
- [x] No private mission health calculation.
- [x] No private readiness calculation.
- [x] No private model completeness calculation.
- [x] No command authorization.
- [x] No command scheduling.
- [x] No command execution.
- [x] Autonomy remains reserved.

## Required local checks

- [x] `npm run build`
- [x] `cargo check --manifest-path src-tauri/Cargo.toml`

These checks must be run locally before final tagging or publication.

## Metadata alignment

- [x] `package.json` version aligned to `0.11.0`.
- [x] `package-lock.json` version aligned to `0.11.0`.
- [x] `src-tauri/Cargo.toml` version aligned to `0.11.0`.
- [x] `src-tauri/Cargo.lock` package version aligned to `0.11.0`.
- [x] `src-tauri/tauri.conf.json` version aligned to `0.11.0`.

## Recommended smoke flow

```text
Open examples/demo-3u
Verify Mission cockpit remains the primary cockpit entry point
Verify Mission cockpit still has no Inspector panel
Verify sidebar remains visible and stable while switching surfaces
Verify Spacecraft opens a dedicated domain surface
Verify Subsystems opens a dedicated domain surface
Verify Modes opens a dedicated domain surface
Verify Telemetry opens a dedicated domain surface
Verify Commands opens a dedicated domain surface
Verify Events opens a dedicated domain surface
Verify Faults opens a dedicated domain surface
Verify Packets opens a dedicated domain surface
Verify Payloads opens a dedicated domain surface
Verify Data Products opens a conservative dedicated domain surface
Verify Contacts & Downlink opens a conservative dedicated domain surface
Verify Commandability opens a conservative dedicated domain surface
Verify Autonomy remains reserved
Verify selecting a Core entity updates the Inspector
Verify source preview buttons remain read-only
Verify no graph UI is present
Verify no authoring affordance is present
Verify no generated artifact mutation affordance is present
Verify no command uplink affordance is present
Verify no live telemetry affordance is present
```

## Final closure rule

v0.11.0 is complete only if Studio provides dedicated read-only Core-derived domain surfaces and entity inspection without inventing Core semantics, operational readiness, live telemetry behavior, command uplink behavior, plugin execution, graph UI or authoring behavior.
