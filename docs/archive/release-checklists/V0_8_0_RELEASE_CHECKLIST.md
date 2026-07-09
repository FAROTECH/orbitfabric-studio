# OrbitFabric Studio v0.8.0 Release Checklist

## Release identity

```text
Milestone: v0.8.0 - Ground Integration Artifact Viewer
Status: released baseline
Previous baseline: v0.7.2 - Core-derived Dashboard UX Realization
Next baseline: v0.9.0 - Semantic Navigation & Unified Shell
```

## Scope confirmation

- [x] Dedicated Ground surface implemented.
- [x] Ground is no longer a reserved placeholder.
- [x] Ground remains read-only.
- [x] Ground remains non-operational.
- [x] Ground uses generated artifact inventory as source.
- [x] Ground filters generated artifacts to `artifact_class === "ground"`.
- [x] Ground groups artifacts by conservative family.
- [x] Ground shows known/unknown status.
- [x] Ground shows preview eligibility.
- [x] Ground keeps unknown ground-facing files visible.
- [x] Ground previews supported text artifacts read-only.
- [x] Ground binds selected artifacts to the Inspector.

## Implemented PR sequence

- [x] PR 1 - Roadmap and boundary note.
- [x] PR 2 - Ground surface shell.
- [x] PR 3 - Ground artifact filtering and grouping.
- [x] PR 4 - Ground preview and Inspector binding.
- [x] PR 5 - Release closure documentation and metadata alignment.

## Required local checks

- [ ] `npm run build`
- [ ] `cargo check --manifest-path src-tauri/Cargo.toml`

These checks remain explicitly unmarked in this checklist because they must be run locally in the development environment before final tagging or release publication.

## Recommended smoke flow

```text
Open examples/demo-3u
Inspect Dashboard
Inspect Generated Artifact Explorer
Inspect Ground surface
Run ground artifact inspection
Verify ground artifact grouping
Preview a ground JSON dictionary if present
Preview a ground CSV dictionary if present
Preview ground Markdown documentation if present
Select a ground artifact and verify Inspector binding
Verify unknown ground artifacts remain visible
Verify no editing affordance exists
Verify no generated artifact mutation exists
Verify no command uplink behavior exists
Verify no live telemetry behavior exists
Verify no telemetry archive behavior exists
Verify no live decoder behavior exists
Verify no ground segment behavior exists
```

## Boundary checks

- [x] No ground segment behavior.
- [x] No mission control behavior.
- [x] No command uplink behavior.
- [x] No live telemetry behavior.
- [x] No telemetry archive behavior.
- [x] No live decoder behavior.
- [x] No Yamcs replacement.
- [x] No OpenC3 replacement.
- [x] No external ground system compatibility claim.
- [x] No generated artifact editing.
- [x] No generated artifact mutation.
- [x] No Mission Model editing.
- [x] No source file mutation.
- [x] No private ground semantics.
- [x] No YAML semantic parsing.
- [x] No dictionary semantic interpretation.
- [x] No runtime execution.
- [x] No arbitrary command execution.
- [x] No arbitrary OrbitFabric CLI argument entry.
- [x] No graph UI.
- [x] No React Flow adoption.
- [x] No plugin execution.
- [x] No authoring.

## Metadata alignment

- [x] `package.json` version aligned to `0.8.0`.
- [x] `src-tauri/Cargo.toml` version aligned to `0.8.0`.
- [x] `src-tauri/tauri.conf.json` version aligned to `0.8.0`.
- [ ] `package-lock.json` regenerated locally after `npm install` or equivalent lockfile refresh.
- [ ] `src-tauri/Cargo.lock` regenerated locally after Cargo metadata refresh if required.

## Documentation alignment

- [x] `docs/releases/v0.8.0-release-notes.md` added.
- [x] `V0_8_0_RELEASE_CHECKLIST.md` added.
- [x] `README.md` updated to mark v0.8.0 as current released baseline.
- [x] `CHANGELOG.md` updated with v0.8.0 release entry.
- [x] `ROADMAP.md` updated to mark v0.8.0 as completed and v0.9.0 Semantic Navigation & Unified Shell as the next milestone.

## Final closure rule

v0.8.0 is complete only if the Ground surface remains a read-only generated artifact inspection viewer and does not become a ground segment, command uplink surface, live telemetry dashboard, telemetry archive or live decoder.
