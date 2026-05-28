# v0.12.0 Mission Data Flow Workbench Validation Checklist

This checklist validates the current v0.12.0 Mission Data Flow Workbench foundation without introducing a new test runner, graph library or UI route.

## Scope

The current Workbench foundation is embedded inside the Mission Cockpit and remains read-only.

It currently validates:

- Core-derived source summary rendering;
- explicit `reported`, `not-reported` and `unavailable` states;
- Workbench boundary language;
- mission-domain lane population from Core model summary or entity index;
- relationship lane population from Core relationship manifest when reported;
- scenario data-flow evidence lane population from Core simulation reports;
- coverage lane population from Core coverage summary;
- generated artifact lane empty state until generated artifact inventory is deliberately wired;
- no graph semantics;
- no authoring semantics;
- no private relationship inference;
- no private data-flow inference.

## Required local gates

Run from the repository root:

```bash
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

Both commands must pass before merging any v0.12.0 Workbench slice.

## Manual smoke path

1. Launch Studio locally.
2. Open a valid OrbitFabric workspace.
3. Confirm the Mission Cockpit loads.
4. Run or load Core model summary.
5. Run or load Core entity index.
6. Run or load Core relationship manifest.
7. Run or load Core dashboard summary.
8. Run or load Core coverage summary.
9. Run or load a Core simulation report with data-flow evidence, if available.
10. Confirm the embedded Mission Data Flow Workbench remains visible in the Mission Cockpit.

## Expected Workbench behavior

The Workbench must show:

- `READ-ONLY` and `CORE-DERIVED` boundary language;
- `NO INFERENCE` and `NO AUTHORING` boundary states;
- reported Core sources only when the corresponding Core report has been parsed;
- not-reported empty states when Core has not emitted a report;
- relationship records only from `relationship_manifest.json` content;
- scenario data-flow evidence only from Core simulation report content;
- coverage scopes only from Core coverage summary content.

## Forbidden outcomes

The Workbench must not show or imply:

- private graph semantics;
- inferred telemetry-to-packet-to-data-product relationships;
- inferred data-flow chains;
- mission readiness;
- mission health;
- completeness scoring;
- authoring capabilities;
- generated artifact mutation;
- plugin behavior;
- command uplink;
- live telemetry;
- operational ground behavior.

## Known limitations intentionally preserved

- The Workbench is embedded in the Mission Cockpit, not a standalone navigation surface.
- The generated artifact inventory is not yet wired into the Workbench snapshot.
- Relationship manifest persistence across report switches requires a later App-level snapshot contract update.
- Inspector binding is not yet implemented for Workbench records.
- React Flow is intentionally not introduced.
