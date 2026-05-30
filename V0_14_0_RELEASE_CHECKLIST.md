# OrbitFabric Studio v0.14.0 Release Checklist

Release: `v0.14.0 - Artifact Traceability Integration`

Status: planned.

## Scope confirmation

- [ ] v0.14.0 planning and boundary documentation is present.
- [ ] Generated artifact traceability is represented through read-only Workbench evidence.
- [ ] Workbench traceability uses only Core-reported or generated artifact inventory data.
- [ ] Selected Workbench records expose Inspector traceability blocks.
- [ ] Runtime skeleton links are shown only when generated artifact inventory reports them.
- [ ] Ground artifact links are shown only when generated artifact inventory reports them.
- [ ] Scenario evidence links are shown only from Core simulation report data.
- [ ] Validation evidence links are shown only from Core lint or dashboard validation data.
- [ ] Coverage evidence links are shown only from Core coverage summary data.
- [ ] Missing traceability is shown as `not reported`, `unavailable`, `reserved` or `diagnostic`.
- [ ] Mission Cockpit remains compact and does not invent scores.
- [ ] Mission Data Flow Workbench remains read-only and Core-derived.
- [ ] Generated Artifacts remains a read-only surface.
- [ ] Autonomy remains reserved.

## Non-goal confirmation

- [ ] No Mission Model authoring.
- [ ] No YAML editor behavior.
- [ ] No generated artifact mutation.
- [ ] No command uplink.
- [ ] No live telemetry.
- [ ] No operational ground behavior.
- [ ] No private YAML semantic parsing.
- [ ] No private scenario YAML interpretation.
- [ ] No private log-derived evidence.
- [ ] No private relationship inference.
- [ ] No private data-flow inference.
- [ ] No private coverage calculation.
- [ ] No mission health calculation.
- [ ] No readiness calculation.
- [ ] No completeness calculation.
- [ ] No Autonomy implementation.
- [ ] No plugin execution.
- [ ] No plugin marketplace.
- [ ] No arbitrary command execution.

## React Flow confirmation

- [ ] React Flow remains deferred for the planning PR.
- [ ] No graph library is introduced before the traceability model and Inspector blocks are stable.
- [ ] Any future graph-library adoption is handled in a separate, read-only, rollbackable PR.

## Required validation

Run from repository root:

```bash
npm run build
```

Before milestone closure, also run:

```bash
cargo check --manifest-path src-tauri/Cargo.toml
npm run tauri:dev
```

## Documentation alignment

Verify all of the following are present and aligned:

- [ ] `README.md`
- [ ] `ROADMAP.md`
- [ ] `CHANGELOG.md`
- [ ] `docs/roadmap/studio-v0.14.0-artifact-traceability-integration-plan.md`
- [ ] `docs/roadmap/studio-ui-north-star-reference.md`
- [ ] `docs/roadmap/studio-target-ui-convergence-strategy.md`
- [ ] `V0_14_0_RELEASE_CHECKLIST.md`

## Manual smoke path

- [ ] Open a valid OrbitFabric workspace.
- [ ] Confirm Mission Cockpit renders.
- [ ] Confirm Mission Data Flow Workbench renders.
- [ ] Confirm Generated Artifacts renders.
- [ ] Run or load Core model summary.
- [ ] Run or load Core entity index.
- [ ] Run or load Core relationship manifest.
- [ ] Run or load Core lint report.
- [ ] Run or load Core coverage summary.
- [ ] Run or load Core simulation report with data-flow evidence, if available.
- [ ] Inspect generated artifacts.
- [ ] Select Workbench records and confirm Inspector traceability blocks remain read-only.
- [ ] Confirm unavailable traceability is explicit.
- [ ] Confirm no private relationship or data-flow inference is shown.
- [ ] Confirm no YAML parsing or log-derived evidence is presented as evidence.

## Release closure

- [ ] Release closure PR merged into `main`.
- [ ] Version metadata aligned to `0.14.0`, if the milestone is tagged.
- [ ] Technical tag created as `v0.14.0`, if desired.
- [ ] GitHub Release publication decision documented.
