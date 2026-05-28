# OrbitFabric Studio v0.10.0 Release Checklist

## Release identity

```text
Milestone: v0.10.0 - Mission Cockpit Consolidation
Status: release closure
Previous baseline: v0.9.0 - Semantic Navigation & Unified Shell
Next baseline: v0.11.0 - Domain Surfaces & Entity Detail System
```

## Scope confirmation

- [x] Mission Dashboard consolidated into Mission Cockpit.
- [x] Mission Cockpit visual hierarchy improved.
- [x] Cockpit top/status area clarified.
- [x] KPI/card layout refined.
- [x] Reported evidence lanes introduced or clarified.
- [x] Contract, validation, scenario, coverage and artifact cockpit areas visually normalized.
- [x] Missing Core data remains represented as `unavailable`, `not reported`, `reserved` or `diagnostic`.
- [x] Mission Cockpit dashboard does not render the Inspector.
- [x] Detail surfaces preserve Inspector behavior.
- [x] Sidebar, main surface, Inspector and shell status bar placement stabilized.
- [x] Active sidebar state is tracked by mission-domain item instead of only by destination surface.
- [x] Duplicated Mission Cockpit shell CSS consolidated.

## Implemented PR sequence

- [x] v0.10.0 planning and UI convergence baseline.
- [x] Mission Cockpit vocabulary and copy cleanup.
- [x] Mission Cockpit component/model extraction.
- [x] KPI card extraction.
- [x] Evidence lanes extraction.
- [x] Panel header extraction.
- [x] Mission Cockpit visual hierarchy consolidation.
- [x] Mission Cockpit visual follow-up.
- [x] Mission Cockpit CSS consolidation.
- [x] v0.10.0 release notes.

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
- [x] No private coverage calculation.
- [x] No private mission health calculation.
- [x] No private readiness calculation.
- [x] No private model completeness calculation.

## Required local checks

- [x] `npm run build`
- [x] `cargo check --manifest-path src-tauri/Cargo.toml`

These checks must be run locally before final tagging or publication.

## Metadata alignment

- [x] `package.json` version aligned to `0.10.0`.
- [x] `package-lock.json` version aligned to `0.10.0`.
- [x] `src-tauri/Cargo.toml` version aligned to `0.10.0`.
- [x] `src-tauri/Cargo.lock` package version aligned to `0.10.0`.
- [x] `src-tauri/tauri.conf.json` version aligned to `0.10.0`.

## Recommended smoke flow

```text
Open examples/demo-3u
Verify no-workspace hero no longer references stale v0.7.2 wording
Verify Mission cockpit opens as the primary cockpit entry point
Verify Mission cockpit has no Inspector panel
Verify sidebar remains visible and stable while switching surfaces
Verify only the selected mission-domain sidebar item is active
Verify detail surfaces still show the Inspector
Verify shell status bar remains below the shell grid
Verify reported evidence lanes remain readable
Verify contract nodes do not overlap status text and node markers
Verify generated artifacts remain read-only
Verify ground artifacts remain read-only and non-operational
Verify no graph UI is present
Verify no authoring affordance is present
Verify no generated artifact mutation affordance is present
Verify no command uplink affordance is present
Verify no live telemetry affordance is present
```

## Final closure rule

v0.10.0 is complete only if Studio presents a clearer Mission Cockpit without inventing Core semantics, operational readiness, live telemetry behavior, command uplink behavior, plugin execution, graph UI or authoring behavior.
