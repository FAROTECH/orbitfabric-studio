# OrbitFabric Studio v0.7.1 Release Checklist

## Scope

Release milestone:

```text
v0.7.1 - Dashboard and Coverage Foundation
```

Primary released loop:

```text
Open -> Run Core Dashboard/Coverage Exports -> Inspect Dashboard Summary -> Inspect Scenario Run Index -> Inspect Coverage Summary
```

## Required checks

- [ ] `npm run build`
- [ ] `cargo check --manifest-path src-tauri/Cargo.toml`
- [ ] Open `examples/demo-3u`
- [ ] Verify workspace header remains visible
- [ ] Verify primary navigation remains usable
- [ ] Verify Workspace Dashboard remains reachable
- [ ] Verify Core command panel remains reachable
- [ ] Verify existing Core lint command remains reachable
- [ ] Verify existing Core model-summary command remains reachable
- [ ] Verify existing Core entity-index command remains reachable
- [ ] Verify existing Core relationship-manifest command remains reachable
- [ ] Verify existing Core scenario execution remains reachable
- [ ] Verify Generated Artifact Explorer remains reachable
- [ ] Verify generated artifact preview remains read-only
- [ ] Verify Raw Core output remains visible

## Dashboard and coverage command checks

- [ ] Verify `Run export dashboard-summary` is visible
- [ ] Verify `Run export scenario-run-index` is visible
- [ ] Verify `Run export coverage-summary` is visible
- [ ] Verify the dashboard-summary command uses a fixed backend wrapper
- [ ] Verify the scenario-run-index command uses a fixed backend wrapper
- [ ] Verify the coverage-summary command uses a fixed backend wrapper
- [ ] Verify no arbitrary CLI argument field exists
- [ ] Verify no shell plugin permission is added
- [ ] Verify report paths are Studio-controlled
- [ ] Verify stdout, stderr and exit code remain visible
- [ ] Verify failed Core commands do not produce fake dashboard or coverage status
- [ ] Verify missing Core reports produce clear unavailable states

## Report rendering checks

- [ ] Verify `orbitfabric.dashboard_summary` renders when returned by Core
- [ ] Verify `orbitfabric.scenario_run_index` renders when returned by Core
- [ ] Verify `orbitfabric.coverage_summary` renders when returned by Core
- [ ] Verify structured expectation accounting renders only when Core emits it
- [ ] Verify unsupported report shapes remain raw/unrecognized
- [ ] Verify coverage values are displayed only from Core report fields
- [ ] Verify unsupported coverage scopes remain visible
- [ ] Verify scenario run records are not deduplicated by Studio
- [ ] Verify logs are not parsed as scenario run history
- [ ] Verify YAML files are not parsed semantically by Studio

## Generated artifact checks

- [ ] Verify dashboard summary reports are recognized as generated artifacts
- [ ] Verify scenario run index reports are recognized as generated artifacts
- [ ] Verify coverage summary reports are recognized as generated artifacts
- [ ] Verify generated artifact previews remain read-only
- [ ] Verify dashboard summary previews render the structured panel
- [ ] Verify scenario run index previews render the structured panel
- [ ] Verify coverage summary previews render the structured panel
- [ ] Verify simulation report previews render structured expectation accounting when present

## Boundary checks

- [ ] No private coverage calculation
- [ ] No frontend-defined coverage denominator
- [ ] No alternative coverage percentage
- [ ] No mission health score
- [ ] No model completeness score
- [ ] No live spacecraft health
- [ ] No mission control behavior
- [ ] No command uplink behavior
- [ ] No telemetry archive behavior
- [ ] No scenario run history inferred from logs
- [ ] No scenario-id deduplication
- [ ] No YAML semantic parsing
- [ ] No graph UI
- [ ] No React Flow dependency
- [ ] No dashboard UX realization matching the target mockup
- [ ] No ground artifact viewer
- [ ] No authoring
- [ ] No editing
- [ ] No generated artifact mutation
- [ ] No source file mutation
- [ ] No arbitrary command execution

## Release metadata

- [ ] `README.md` marks v0.7.1 as current released baseline
- [ ] `CHANGELOG.md` contains v0.7.1 release notes
- [ ] `ROADMAP.md` marks v0.7.1 as completed
- [ ] `ROADMAP.md` introduces v0.7.2 as the next dashboard UX realization milestone
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

## Final v0.7.1 closure notes

The v0.7.1 release closes as a Dashboard and Coverage Foundation.

Implemented and verified scope:

- Core dashboard summary report parsing and rendering;
- Core scenario run index parsing and rendering;
- Core coverage summary parsing and rendering;
- structured expectation accounting rendering;
- fixed backend wrappers for the new Core exports;
- UI bindings for the new Core exports;
- generated artifact recognition and preview binding for the new report types;
- explicit no-private-coverage boundary;
- explicit no-health-score boundary;
- explicit no-dashboard-UX-realization boundary.

Known intentionally deferred items:

- target dashboard visual realization;
- model completeness scoring, unless Core defines it;
- mission or contract health scoring, unless Core defines it;
- graph visualization;
- ground artifact viewer;
- authoring/editing;
- plugin-aware surfaces.
