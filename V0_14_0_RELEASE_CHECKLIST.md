# OrbitFabric Studio v0.14.0 Release Checklist

Release: `v0.14.0 - Artifact Traceability Integration`

Status: release candidate.

## Scope confirmation

- [x] v0.14.0 planning and boundary documentation is present.
- [x] Generated artifact traceability is represented through read-only Workbench evidence.
- [x] Workbench traceability uses only Core-reported or generated artifact inventory data.
- [x] Selected Workbench records expose Inspector traceability blocks.
- [x] Runtime skeleton links are shown only when generated artifact inventory reports them.
- [x] Ground artifact links are shown only when generated artifact inventory reports them.
- [x] Scenario evidence links are shown only from Core simulation report data.
- [x] Validation evidence links are shown only from Core lint or dashboard validation data.
- [x] Coverage evidence links are shown only from Core coverage summary data.
- [x] Missing traceability is shown as `not reported`, `unavailable`, `reserved` or `diagnostic`.
- [x] Mission Cockpit remains compact and does not invent private scores.
- [x] Mission Data Flow Workbench remains read-only and Core-derived.
- [x] Mission Data Flow Workbench route exposes a compact traceability posture panel without adding graph semantics.
- [x] Generated Artifacts remains a read-only surface.
- [x] Autonomy remains reserved.
- [x] North-star gap assessment is present and states that v0.14.0 is not visual parity.

## Boundary confirmation

- [x] No Mission Model authoring.
- [x] No generated artifact mutation.
- [x] No artifact regeneration.
- [x] No private relationship inference.
- [x] No private data-flow inference.
- [x] No private coverage calculation.
- [x] No private mission health calculation.
- [x] No private readiness calculation.
- [x] No private completeness calculation.
- [x] No Autonomy implementation.
- [x] No plugin behavior.
- [x] No graph library adoption in v0.14.0.

## React Flow confirmation

- [x] React Flow remains deferred for v0.14.0.
- [x] No graph library is introduced before Mission Cockpit realization and a dedicated graph Workbench decision point.
- [x] Any future graph-library adoption is handled in a separate, read-only, rollbackable PR.

## Required validation

Run from repository root:

```bash
npm run build
```

Before milestone closure, also run:

```bash
cargo check --manifest-path src-tauri/Cargo.toml
```

Recommended smoke validation:

```bash
npm run tauri:dev
```

## Documentation alignment

- [x] `README.md`
- [x] `CHANGELOG.md`
- [x] `docs/releases/v0.14.0-release-notes.md`
- [x] `docs/roadmap/studio-v0.14.0-artifact-traceability-integration-plan.md`
- [x] `docs/roadmap/studio-north-star-gap-assessment-after-v0.14.0.md`
- [x] `docs/roadmap/studio-ui-north-star-reference.md`
- [x] `docs/roadmap/studio-target-ui-convergence-strategy.md`
- [x] `V0_14_0_RELEASE_CHECKLIST.md`

`ROADMAP.md` remains a known follow-up candidate if a full roadmap rewrite is preferred. The authoritative recalibration for the next direction is captured in `docs/roadmap/studio-north-star-gap-assessment-after-v0.14.0.md`.

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
- [ ] Confirm generated artifact evidence appears in the Workbench after inspection.
- [ ] Select Workbench records and confirm Inspector traceability blocks remain read-only.
- [ ] Confirm unavailable traceability is explicit.
- [ ] Confirm no private relationship or data-flow inference is shown.

## Release closure

- [ ] Release closure PR merged into `main`.
- [ ] Optional metadata/tag step decided after merge.
- [ ] Technical tag created as `v0.14.0`, if desired.
- [ ] GitHub Release publication decision documented.
