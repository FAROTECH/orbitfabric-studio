# OrbitFabric Studio v0.7.2 Release Checklist

## Scope

Release milestone:

```text
v0.7.2 - Core-derived Dashboard UX Realization
```

Primary target loop:

```text
Open Dashboard -> Review Core-derived Cards -> Navigate Evidence and Coverage Surfaces
```

## Required local checks

- [ ] `npm run build`
- [ ] `cargo check --manifest-path src-tauri/Cargo.toml`
- [ ] Open `examples/demo-3u`
- [ ] Verify workspace header remains visible
- [ ] Verify primary navigation remains usable
- [ ] Verify dashboard remains reachable
- [ ] Verify Core command panel remains reachable
- [ ] Verify Scenario Evidence surface remains reachable
- [ ] Verify Generated Artifact Explorer remains reachable
- [ ] Verify generated artifact previews remain read-only
- [ ] Verify Raw Core output remains visible
- [ ] Verify Inspector remains usable

## Data-source checks

- [ ] Dashboard validation card uses only Core lint or Core dashboard summary validation data
- [ ] Dashboard mission identity uses only Core dashboard summary mission identity or unavailable state
- [ ] Dashboard model inventory uses only Core dashboard summary, entity index or unavailable state
- [ ] Dashboard relationship inventory uses only Core dashboard summary, relationship manifest or unavailable state
- [ ] Dashboard scenario run summary uses only Core scenario run index or unavailable state
- [ ] Dashboard coverage cards use only Core coverage summary or unavailable state
- [ ] Dashboard generated artifact cards use only generated artifact inventory or unavailable state
- [ ] Dashboard reserved cards use explicit reserved state and do not imply implemented behavior

## Dashboard UX checks

- [ ] Dashboard has a visibly stronger card-oriented layout than v0.7.1
- [ ] Dashboard top card row is compact and readable
- [ ] Dashboard separates validation, model inventory, scenario evidence, coverage and generated artifacts
- [ ] Dashboard unavailable states are explicit and not confused with zero values
- [ ] Dashboard reserved states are explicit and not confused with implemented features
- [ ] Dashboard cards navigate or point to existing read-only surfaces where appropriate
- [ ] Dashboard remains readable on narrower desktop widths
- [ ] Dashboard does not hide unsupported coverage scopes
- [ ] Dashboard does not hide unknown generated artifacts

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

- [ ] `orbitfabric.dashboard_summary` still renders in Core output and generated artifact preview
- [ ] `orbitfabric.scenario_run_index` still renders in Core output and generated artifact preview
- [ ] `orbitfabric.coverage_summary` still renders in Core output and generated artifact preview
- [ ] Structured expectation accounting still renders only when Core emits it
- [ ] Unsupported report shapes remain raw or unrecognized
- [ ] Raw stdout, stderr and exit code remain visible

## Boundary checks

- [ ] No private coverage calculation
- [ ] No frontend-defined coverage denominator
- [ ] No alternative coverage percentage
- [ ] No mission health score
- [ ] No model completeness score unless Core defines one
- [ ] No live spacecraft health
- [ ] No mission control behavior
- [ ] No command uplink behavior
- [ ] No telemetry archive behavior
- [ ] No scenario run history inferred from logs
- [ ] No scenario-id deduplication in Studio
- [ ] No YAML semantic parsing
- [ ] No graph UI
- [ ] No React Flow dependency
- [ ] No ground segment behavior
- [ ] No authoring
- [ ] No editing
- [ ] No generated artifact mutation
- [ ] No source file mutation
- [ ] No arbitrary command execution

## Sensitive file checks

- [ ] No wholesale replacement of `src/App.tsx`
- [ ] `src/App.tsx` changes are local, small and reviewable
- [ ] Existing implemented surfaces are preserved
- [ ] Existing Core command handlers are preserved
- [ ] Existing generated artifact explorer behavior is preserved
- [ ] Existing scenario evidence behavior is preserved
- [ ] CSS changes are scoped to dashboard-specific classes where possible
- [ ] No references to non-existing `src/App.css`; repository uses `src/styles.css`

## Release metadata

To be completed only at final v0.7.2 release closure:

- [ ] `README.md` marks v0.7.2 as current released baseline
- [ ] `CHANGELOG.md` contains v0.7.2 release notes
- [ ] `ROADMAP.md` marks v0.7.2 as completed
- [ ] `package.json` version is `0.7.2`
- [ ] `package-lock.json` version is `0.7.2`
- [ ] `src-tauri/Cargo.toml` version is `0.7.2`
- [ ] `src-tauri/Cargo.lock` package version is `0.7.2`
- [ ] `src-tauri/tauri.conf.json` version is `0.7.2`

## Tagging

After merge to `main` and final validation:

```bash
git tag v0.7.2
git push origin v0.7.2
```

## Final closure rule

The v0.7.2 release closes only when the dashboard visual realization is materially improved while remaining fully source/Core-derived/generated/local-state disciplined.

A visually better dashboard is acceptable.

A semantically invented dashboard is not acceptable.
