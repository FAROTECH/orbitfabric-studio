# OrbitFabric Studio v0.15.0 Release Checklist

Release: `v0.15.0 - Mission Cockpit Realization`

Status: planning

## Scope guard

v0.15.0 is a Mission Cockpit realization milestone.

It must bring the Mission Cockpit closer to the accepted Cockpit north-star without making Studio a semantic authority.

## Required boundaries

The milestone must preserve:

- Studio downstream from OrbitFabric Core.
- Mission Model as source of truth.
- Read-only default behavior.
- Core-derived or explicitly unavailable metric states.
- No private score calculation.
- No private relationship or data-flow inference.
- No generated artifact mutation.

## Explicit non-goals

v0.15.0 must not introduce:

- React Flow.
- Graph library adoption.
- Graph editing.
- Mission Model authoring.
- YAML editor behavior.
- Generated artifact mutation.
- Artifact regeneration from the Generated Artifacts surface.
- Command uplink.
- Command authorization.
- Command scheduling.
- Command execution.
- Live telemetry.
- Operational ground behavior.
- Private mission health calculation.
- Private readiness calculation.
- Private model completeness calculation.
- Private coverage calculation.
- Private relationship inference.
- Private data-flow inference.
- Autonomy implementation.
- Plugin execution.
- Plugin marketplace.
- Arbitrary command execution.

## Planned PR sequence

- [ ] PR 1: Planning and boundary document.
- [ ] PR 2: Cockpit data model refinement.
- [ ] PR 3: Top KPI card grid.
- [ ] PR 4: Mission Data Contract Overview panel.
- [ ] PR 5: Recent Validation Results panel.
- [ ] PR 6: Recent Scenario Runs panel.
- [ ] PR 7: Generated Artifacts cockpit cards.
- [ ] PR 8: Cockpit navigation and linkage polish.
- [ ] PR 9: Cockpit visual density polish.
- [ ] PR 10: v0.15.0 release hardening.

## Metric policy checks

- [ ] Mission Health is Core-derived or shown as `not reported` / `unavailable`.
- [ ] Model Completeness is Core-derived or shown as `not reported` / `unavailable`.
- [ ] Lint Status uses Core lint or dashboard validation outputs only.
- [ ] Scenario Coverage is Core-derived only, not inferred from run counts.
- [ ] Data Product Coverage is Core-derived only, not inferred from entity counts.
- [ ] Commandability Coverage is Core-derived only, not inferred from command counts.

## Local validation

Required before implementation PR merge:

```bash
npm run build
```

Required before milestone closure:

```bash
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

Recommended smoke validation before milestone closure:

```bash
npm run tauri:dev
```

Manual smoke path:

- [ ] Open a valid OrbitFabric workspace.
- [ ] Confirm Mission Cockpit renders.
- [ ] Confirm Mission Data Flow Workbench renders.
- [ ] Confirm Generated Artifacts renders.
- [ ] Confirm unsupported KPI metrics are explicit and not invented.
- [ ] Confirm validation, scenario and generated artifact panels remain read-only.
- [ ] Confirm navigation from Cockpit to Workbench, Scenarios, Generated Artifacts and domain surfaces works.
- [ ] Confirm no React Flow dependency was added.
- [ ] Confirm no lockfile was manually edited.

## Release closure

- [ ] README aligned to v0.15.0 completion state.
- [ ] ROADMAP aligned to v0.15.0 completion state and next milestone.
- [ ] CHANGELOG updated.
- [ ] Release notes added.
- [ ] Version metadata updated only at the end.
- [ ] Technical tag decision made.
- [ ] GitHub Release decision made explicitly.
