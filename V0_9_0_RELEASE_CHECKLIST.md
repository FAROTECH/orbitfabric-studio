# OrbitFabric Studio v0.9.0 Release Checklist

## Release identity

```text
Milestone: v0.9.0 - Semantic Navigation & Unified Shell
Status: release closure
Previous baseline: v0.8.0 - Ground Integration Artifact Viewer
Next baseline: v0.10.0 - Mission Cockpit Consolidation
```

## Scope confirmation

- [x] Semantic mission-domain sidebar introduced.
- [x] Legacy surface mapping documented.
- [x] Top command bar model introduced.
- [x] Top command bar actions component introduced.
- [x] Top command bar wired to model-backed actions.
- [x] Persistent Inspector enabled across Mission surface.
- [x] Footer/status bar component introduced.
- [x] Footer/status bar wired into shell.
- [x] Availability vocabulary introduced:
  - `available`;
  - `unavailable`;
  - `reserved`;
  - `diagnostic`.
- [x] Reserved domain destinations kept conservative.
- [x] Diagnostic surfaces de-emphasized from primary mission navigation.
- [x] Stale v0.7.0 Scenario Evidence copy cleaned up.
- [x] Ambiguous Mission readiness copy removed.

## Implemented PR sequence

- [x] Documentation rebaseline.
- [x] Navigation model extraction.
- [x] Navigation model wiring.
- [x] Semantic sidebar skeleton.
- [x] Legacy surface mapping.
- [x] Semantic sidebar polish.
- [x] Persistent Inspector.
- [x] Shell status bar component.
- [x] Shell status bar wiring.
- [x] Shell copy cleanup.
- [x] Shell command bar model.
- [x] Shell command actions component.
- [x] Shell command actions wiring.
- [x] v0.9.0 release notes.

## Explicit non-goals preserved

- [x] No new OrbitFabric Core semantics.
- [x] No Mission Model editing.
- [x] No generated artifact editing.
- [x] No generated artifact mutation.
- [x] No visual authoring.
- [x] No graph UI.
- [x] No React Flow adoption.
- [x] No plugin execution.
- [x] No live telemetry.
- [x] No telemetry archive behavior.
- [x] No command uplink behavior.
- [x] No mission control behavior.
- [x] No operational ground behavior.
- [x] No private YAML semantic parsing.
- [x] No private coverage calculation.
- [x] No private mission health calculation.
- [x] No private readiness calculation.
- [x] No private model completeness calculation.

## Required local checks

- [ ] `npm run build`
- [ ] `cargo check --manifest-path src-tauri/Cargo.toml`

These checks must be run locally before final tagging or publication.

## Metadata alignment

- [ ] `package.json` version aligned to `0.9.0`.
- [ ] `package-lock.json` version aligned to `0.9.0` after local npm metadata refresh.
- [ ] `src-tauri/Cargo.toml` version aligned to `0.9.0`.
- [ ] `src-tauri/tauri.conf.json` version aligned to `0.9.0`.

## Recommended smoke flow

```text
Open examples/demo-3u
Verify semantic sidebar domains are visible
Verify reserved domains remain conservative
Verify Mission surface shows persistent Inspector
Verify Scenario surface remains Core-report based
Verify Generated Artifacts remains read-only
Verify Ground artifacts remain read-only and non-operational
Verify command bar uses controlled actions
Verify status bar shows workspace and boundary state
Verify no graph UI is present
Verify no authoring affordance is present
Verify no generated artifact mutation affordance is present
Verify no command uplink affordance is present
Verify no live telemetry affordance is present
```

## Final closure rule

v0.9.0 is complete only if Studio presents a mission-domain-oriented shell without inventing Core semantics, operational readiness, live telemetry behavior, command uplink behavior, plugin execution, graph UI or authoring behavior.
