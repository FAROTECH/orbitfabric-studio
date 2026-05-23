# OrbitFabric Studio v0.7.1 Release Checklist

## Scope

Release milestone:

```text
v0.7.1 - Dashboard and Coverage Foundation
```

Primary target loop:

```text
Open -> Export Dashboard Summary -> Export Scenario Run Index -> Export Coverage Summary -> Inspect Coverage -> Navigate Evidence
```

## Required checks

- [ ] `npm install`
- [ ] `npm run build`
- [ ] `cargo check --manifest-path src-tauri/Cargo.toml`
- [ ] `npm run tauri:dev`
- [ ] Open `examples/demo-3u`
- [ ] Verify workspace header remains visible
- [ ] Verify primary navigation remains usable
- [ ] Verify Workspace Dashboard remains reachable
- [ ] Verify Evidence surface remains reachable
- [ ] Verify Generated Artifact Explorer remains reachable
- [ ] Verify Reports & Logs remain preview-only unless a recognized Core report schema is parsed
- [ ] Verify Raw Core output remains visible

## Core command wrapper checks

Complete these only after the fixed backend commands are implemented.

- [ ] Verify `run_core_export_dashboard_summary` uses a fixed command shape
- [ ] Verify `run_core_export_scenario_run_index` uses a fixed command shape
- [ ] Verify `run_core_export_coverage_summary` uses a fixed command shape
- [ ] Verify no arbitrary CLI argument field exists
- [ ] Verify no shell plugin permission is added
- [ ] Verify report output paths are Studio-controlled under `generated/reports`
- [ ] Verify scenario run index reads simulation JSON reports only through Core
- [ ] Verify coverage summary receives explicit Core report inputs
- [ ] Verify stdout, stderr and exit code remain visible
- [ ] Verify missing reports produce clear unavailable states

## Dashboard summary report checks

Complete these after dashboard summary parsing is implemented.

- [ ] Verify recognized report kind `orbitfabric.dashboard_summary`
- [ ] Verify dashboard version is displayed
- [ ] Verify OrbitFabric Core version is displayed when present
- [ ] Verify mission identity is displayed
- [ ] Verify validation summary is displayed only from Core report
- [ ] Verify model domain inventory is displayed only from Core report
- [ ] Verify entity inventory is displayed only from Core report
- [ ] Verify relationship inventory is displayed only from Core report
- [ ] Verify coverage unavailable state is displayed when Core reports it
- [ ] Verify dashboard summary does not become a mission health score

## Scenario run index checks

Complete these after scenario run index parsing is implemented.

- [ ] Verify recognized report kind `orbitfabric.scenario_run_index`
- [ ] Verify index version is displayed
- [ ] Verify source simulation reports directory is displayed
- [ ] Verify total, passed and failed run counts are displayed only from Core report
- [ ] Verify run records are displayed only from Core report
- [ ] Verify Studio does not deduplicate scenario ids
- [ ] Verify Studio does not read or parse logs to build run history

## Structured expectation accounting checks

Complete these after extended simulation report parsing is implemented.

- [ ] Verify `summary.expectations` is displayed only from Core simulation JSON
- [ ] Verify `summary.passed_expectations` is displayed only from Core simulation JSON
- [ ] Verify `summary.failed_expectations` is displayed only from Core simulation JSON
- [ ] Verify `expectations.total` is displayed only from Core simulation JSON
- [ ] Verify `expectations.passed` is displayed only from Core simulation JSON
- [ ] Verify `expectations.failed` is displayed only from Core simulation JSON
- [ ] Verify `expectations.records[]` are displayed only from Core simulation JSON
- [ ] Verify legacy top-level `failed_expectations` remains supported for compatibility
- [ ] Verify Studio does not infer passed expectations from empty failed expectation lists

## Coverage summary report checks

Complete these after coverage summary parsing is implemented.

- [ ] Verify recognized report kind `orbitfabric.coverage_summary`
- [ ] Verify coverage version is displayed
- [ ] Verify coverage boundary flags are displayed
- [ ] Verify scenario run summary is displayed only from Core coverage report
- [ ] Verify entity coverage is displayed only from Core coverage report
- [ ] Verify expectation coverage is displayed only from Core coverage report
- [ ] Verify relationship coverage is displayed only from Core coverage report
- [ ] Verify covered and uncovered ids are displayed only from Core coverage report
- [ ] Verify unsupported coverage scopes are displayed and not hidden
- [ ] Verify Studio does not calculate alternative percentages
- [ ] Verify Studio does not invent alternative denominators

## Boundary checks

- [ ] No private coverage calculation
- [ ] No frontend-defined coverage denominators
- [ ] No model completeness score invented by Studio
- [ ] No mission health score
- [ ] No live spacecraft health
- [ ] No mission control behavior
- [ ] No command uplink
- [ ] No live telemetry
- [ ] No telemetry archive
- [ ] No log-derived evidence
- [ ] No YAML semantic parsing
- [ ] No graph UI
- [ ] No React Flow dependency
- [ ] No graph coverage
- [ ] No visual Mission Model editing
- [ ] No authoring
- [ ] No generated artifact mutation
- [ ] No plugin-aware surface
- [ ] No ground operations

## Source / report / generated / local state checks

- [ ] Dashboard summary is clearly marked as Core-derived report
- [ ] Scenario run index is clearly marked as Core-derived report
- [ ] Coverage summary is clearly marked as Core-derived report
- [ ] Simulation JSON remains Core-derived evidence
- [ ] Plain-text simulation logs remain preview-only
- [ ] Generated outputs remain generated outputs
- [ ] UI selection state remains local UI state

## Release metadata

To be completed only at final v0.7.1 release closure.

- [ ] `README.md` marks v0.7.1 as current released baseline
- [ ] `CHANGELOG.md` contains v0.7.1 release notes
- [ ] `ROADMAP.md` marks v0.7.1 as completed
- [ ] `package.json` version is `0.7.1`
- [ ] `package-lock.json` version is `0.7.1`
- [ ] `src-tauri/Cargo.toml` version is `0.7.1`
- [ ] `src-tauri/Cargo.lock` package version is `0.7.1`
- [ ] `src-tauri/tauri.conf.json` version is `0.7.1`

## Tagging

After merge to `main` and final validation:

```bash
git tag v0.7.1
git push origin v0.7.1
```

## Final closure notes

The v0.7.1 release closes only when Studio renders dashboard and coverage data from Core-owned structured reports and avoids all private coverage, health, graph, mission control, telemetry, command uplink and editing behavior.
