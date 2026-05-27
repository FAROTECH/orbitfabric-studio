# Changelog

All notable changes to OrbitFabric Studio will be documented in this file.

The format follows a simple release-oriented structure.

OrbitFabric Studio is currently at `v0.8.0 - Ground Integration Artifact Viewer`.

The active planning baseline is `v0.9.0 - Semantic Navigation & Unified Shell`.

---

## Unreleased

### Planning

- Rebaselined the immediate post-v0.8.0 direction toward `v0.9.0 - Semantic Navigation & Unified Shell`.
- Deferred the previous immediate `Plugin-aware Studio Surface` direction until the shell, semantic navigation, Inspector, Mission Cockpit and Mission Data Flow Workbench foundations are stable.
- Added v0.9.0 planning scope for mission-domain navigation, unified shell behavior, persistent Inspector, command bar consolidation and consistent availability states.

### Not Included

- No code changes.
- No new OrbitFabric Core semantics.
- No graph UI.
- No React Flow adoption.
- No authoring.
- No plugin execution.
- No generated artifact mutation.
- No operational ground behavior.

---

## v0.8.0 - Ground Integration Artifact Viewer

Released milestone.

This milestone extends the Studio loop to:

```text
Open -> Inspect Ground Artifacts -> Trace Provenance -> Understand Intended Integration Use
```

v0.8.0 remains downstream from OrbitFabric Core.

Studio consumes generated ground-facing artifacts already produced by Core and presents them through a dedicated read-only Ground surface.

Studio does not become a ground segment, mission control interface, command uplink surface, live decoder or telemetry archive.

### Added

- Added dedicated Ground Integration Artifact Viewer surface.
- Converted Ground from reserved placeholder to implemented read-only surface.
- Added generated ground artifact filtering based on `artifact_class === "ground"`.
- Added conservative ground artifact family grouping:
  - manifest;
  - dictionary-json;
  - dictionary-csv;
  - documentation;
  - unknown-ground-artifact.
- Added known/unknown status display for generated ground artifacts.
- Added preview eligibility display for generated ground artifacts.
- Added read-only preview for previewable generated ground artifacts.
- Added Inspector binding for selected generated ground artifacts.
- Added v0.8.0 release notes.
- Added v0.8.0 release checklist.

### Changed

- Updated Studio version metadata to `0.8.0`.
- Updated Tauri version metadata to `0.8.0`.
- Preserved the generated artifact inventory backend as the source for Ground artifact discovery.
- Preserved explicit non-operational Ground boundary wording.

### Validated Manually

Recommended local checks:

```text
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

### Not Included

- No ground segment behavior.
- No mission control behavior.
- No command uplink behavior.
- No live telemetry behavior.
- No telemetry archive behavior.
- No live decoder behavior.
- No Yamcs replacement.
- No OpenC3 replacement.
- No external ground system compatibility claim.
- No generated artifact editing.
- No generated artifact mutation.
- No Mission Model editing.
- No source file mutation.
- No private ground semantics.
- No YAML semantic parsing.
- No dictionary semantic interpretation.
- No runtime execution.
- No arbitrary command execution.
- No graph UI.
- No React Flow adoption.
- No plugin execution.
- No authoring.

---

## v0.7.1 - Dashboard and Coverage Foundation

Released milestone.

This milestone extends the Studio loop to:

```text
Open -> Run Core Dashboard/Coverage Exports -> Inspect Dashboard Summary -> Inspect Scenario Run Index -> Inspect Coverage Summary
```

v0.7.1 remains downstream from OrbitFabric Core.

Studio consumes Core-owned dashboard, scenario run index and coverage report surfaces.

Studio does not calculate coverage independently, does not invent dashboard percentages, does not introduce mission health scoring and does not implement the final dashboard UX mockup.

---

## v0.7.0 - Scenario Evidence Explorer

Released milestone.

This milestone extends the Studio loop to:

```text
Open -> Select Scenario -> Run Scenario through Core -> Inspect Evidence -> Review Reports and Logs
```

v0.7.0 remains downstream from OrbitFabric Core.

Studio consumes the real Core simulation JSON report produced by:

```text
orbitfabric sim <scenario.yaml> --json <path> --log <path>
```

Studio does not introduce a private scenario runner, does not parse scenario YAML semantically and does not derive evidence from logs.

---

## v0.6.0 - Studio Information Architecture & UX Foundation

Released milestone.

This milestone extends the product loop to:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships -> Inspect Generated Artifacts -> Review Reserved Surfaces
```

v0.6.0 remains downstream from OrbitFabric Core.

Studio reorganized the existing v0.1.0 through v0.5.0 capabilities into a coherent read-only Mission Contract Engineering Workbench foundation.
