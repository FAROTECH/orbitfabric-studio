# OrbitFabric Studio v0.7.2 Release Checklist

## Scope

Release milestone:

```text
v0.7.2 - Core-derived Dashboard UX Realization
```

Primary target loop:

```text
Open Workspace -> Inspect Single-page Cockpit -> Drill into Detail on Demand
```

## Pivot status

- [x] v0.7.2 cockpit pivot document is present.
- [x] v0.7.2 does not close as a vertically stacked report page.
- [x] The final dashboard behaves as a compact workbench cockpit.
- [x] Ground remains reserved for v0.8.0.

## Required local checks

- [ ] `npm run build`
- [ ] `cargo check --manifest-path src-tauri/Cargo.toml`
- [ ] Open `examples/demo-3u`
- [ ] Verify workspace header remains visible
- [ ] Verify primary navigation remains usable
- [ ] Verify cockpit dashboard remains reachable
- [ ] Verify only one primary surface is visible by default
- [ ] Verify Core command panel is reachable without being always visible below the dashboard
- [ ] Verify Scenario Evidence surface is reachable without being always visible below the dashboard
- [ ] Verify Generated Artifact Explorer is reachable without being always visible below the dashboard
- [ ] Verify generated artifact previews remain read-only
- [ ] Verify Raw Core output remains visible only when the relevant surface/detail is selected
- [ ] Verify Inspector or detail drawer remains usable

## Data-source checks

- [x] Dashboard validation card uses only Core lint or Core dashboard summary validation data.
- [x] Dashboard mission identity uses only Core dashboard summary mission identity or unavailable state.
- [x] Dashboard model inventory uses only Core dashboard summary, entity index or unavailable state.
- [x] Dashboard relationship inventory uses only Core dashboard summary, relationship manifest or unavailable state.
- [x] Dashboard scenario run summary uses only Core scenario run index or unavailable state.
- [x] Dashboard coverage cards use only Core coverage summary or unavailable state.
- [x] Dashboard generated artifact cards use only generated artifact inventory or unavailable state.
- [x] Dashboard reserved cards use explicit reserved state and do not imply implemented behavior.

## Cockpit UX checks

- [x] Dashboard fits mostly within one desktop viewport.
- [x] Dashboard does not render major surfaces sequentially by default.
- [x] Dashboard top card row is compact and readable.
- [x] Dashboard separates validation, model inventory, scenario evidence, coverage and generated artifacts.
- [x] Dashboard unavailable states are explicit and not confused with zero values.
- [x] Dashboard reserved states are explicit and not confused with implemented features.
- [x] Dashboard cards expose detail actions instead of inline long detail.
- [x] Long lists open through active surfaces or contextual inspection.
- [x] Dashboard does not hide unsupported coverage scopes.
- [x] Dashboard does not hide unknown generated artifacts.
- [x] Sidebar uses compact surface navigation.
- [x] Iconography is present for primary dashboard cards or navigation items.

## Core command flow checks

- [ ] Run Core lint mission
- [ ] Run Core export model-summary
- [ ] Run Core export entity-index
- [ ] Run Core export relationship-manifest
- [ ] Run at least one scenario through Core
- [ ] Run Core export scenario-run-index
- [ ] Run Core export dashboard-summary
- [ ] Run Core export coverage-summary
- [ ] Verify generated artifact inventory refresh remains controlled
- [ ] Verify failed Core commands do not produce fake dashboard values
- [ ] Verify missing Core reports produce unavailable states

## Report rendering checks

- [x] `orbitfabric.dashboard_summary` still renders in Core output and generated artifact preview.
- [x] `orbitfabric.scenario_run_index` still renders in Core output and generated artifact preview.
- [x] `orbitfabric.coverage_summary` still renders in Core output and generated artifact preview.
- [x] Structured expectation accounting still renders only when Core emits it.
- [x] Unsupported report shapes remain raw or unrecognized.
- [x] Raw stdout, stderr and exit code remain available through the appropriate surface/detail.

## Boundary checks

- [x] No private coverage calculation.
- [x] No frontend-defined coverage denominator.
- [x] No alternative coverage percentage.
- [x] No mission health score unless Core defines one.
- [x] No model completeness score unless Core defines one.
- [x] No live spacecraft health.
- [x] No mission control behavior.
- [x] No command uplink behavior.
- [x] No telemetry archive behavior.
- [x] No scenario run history inferred from logs.
- [x] No scenario-id deduplication in Studio.
- [x] No YAML semantic parsing.
- [x] No generated artifact semantic inference.
- [x] No runtime readiness claim.
- [x] No graph UI.
- [x] No React Flow dependency.
- [x] No ground segment behavior.
- [x] No authoring.
- [x] No editing.
- [x] No generated artifact mutation.
- [x] No source file mutation.
- [x] No arbitrary command execution.

## Sensitive file checks

- [x] No wholesale replacement of `src/App.tsx`.
- [x] Existing implemented surfaces are preserved behind surface selection or detail panels.
- [x] Existing Core command handlers are preserved.
- [x] Existing generated artifact explorer behavior is preserved.
- [x] Existing scenario evidence behavior is preserved.
- [x] CSS changes are scoped to dashboard/workbench-specific classes where possible.
- [x] No references to non-existing `src/App.css`; repository uses `src/styles.css`.

## Release metadata

Baseline alignment status:

- [ ] `README.md` marks v0.7.2 as current released baseline.
- [ ] `CHANGELOG.md` contains v0.7.2 release notes.
- [ ] `ROADMAP.md` marks v0.7.2 as completed.
- [x] `package.json` version is `0.7.2`.
- [ ] `package-lock.json` version is `0.7.2`.
- [x] `src-tauri/Cargo.toml` version is `0.7.2`.
- [ ] `src-tauri/Cargo.lock` package version is `0.7.2`.
- [ ] `src-tauri/tauri.conf.json` version is `0.7.2`.

## Tagging

After merge to `main` and final validation:

```bash
git tag v0.7.2
git push origin v0.7.2
```

## Final closure rule

The v0.7.2 release closes only when the dashboard visual realization is materially improved while remaining fully source/Core-derived/generated/local-state disciplined.

A vertically longer but prettier report page is not acceptable.

A compact single-page cockpit with controlled drilldown is acceptable.

A semantically invented dashboard is not acceptable.

v0.8.0 may start only after this baseline is explicitly understood as a closed cockpit foundation and Ground remains non-operational until implemented as a dedicated read-only generated artifact viewer.
