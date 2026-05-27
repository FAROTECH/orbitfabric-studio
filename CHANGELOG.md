# Changelog

All notable changes to OrbitFabric Studio will be documented in this file.

The format follows a simple release-oriented structure.

OrbitFabric Studio is currently at `v0.9.0 - Semantic Navigation & Unified Shell`.

The active planning baseline is `v0.10.0 - Mission Cockpit Consolidation`.

---

## Unreleased

### Planning

- Rebaselined the immediate post-v0.9.0 direction toward `v0.10.0 - Mission Cockpit Consolidation`.
- Confirmed that plugin-awareness remains deferred until the shell, semantic navigation, Inspector, Mission Cockpit, domain surfaces and Mission Data Flow Workbench foundations are stable.
- Confirmed that v0.10.0 must consolidate the Mission Cockpit using only Core-derived reports, generated artifact inventory, structural workspace inspection or explicit `unavailable`, `not reported`, `reserved` and `diagnostic` states.

### Not Included

- No code changes.
- No new OrbitFabric Core semantics.
- No graph UI.
- No React Flow adoption.
- No authoring.
- No plugin execution.
- No generated artifact mutation.
- No operational ground behavior.
- No command uplink.
- No live telemetry behavior.
- No frontend-inferred mission health, operational readiness, model completeness or private coverage semantics.

---

## v0.9.0 - Semantic Navigation & Unified Shell

Released milestone.

This milestone transforms Studio from a surface-oriented workbench into a mission-domain-oriented shell.

v0.9.0 remains downstream from OrbitFabric Core.

Studio does not add mission semantics. It reorganizes existing read-only Studio capabilities around a typed navigation model, semantic sidebar, global command bar, persistent Inspector and shell status bar.

### Added

- Added typed navigation model for Studio shell surfaces.
- Added explicit navigation item states:
  - `available`;
  - `unavailable`;
  - `reserved`;
  - `diagnostic`.
- Added target mission-domain navigation entries:
  - Mission;
  - Spacecraft;
  - Subsystems;
  - Modes;
  - Telemetry;
  - Commands;
  - Events;
  - Faults;
  - Packets;
  - Payloads;
  - Data Products;
  - Contacts & Downlink;
  - Commandability;
  - Autonomy;
  - Scenarios;
  - Generated Artifacts.
- Added explicit legacy surface mapping.
- Added semantic sidebar skeleton and polish.
- Added persistent Inspector behavior across the Mission surface.
- Added standalone shell status bar component.
- Wired shell status bar into the main Studio shell.
- Added shell command bar action model.
- Added reusable shell command actions component.
- Wired model-backed shell command actions into the workspace header.
- Added v0.9.0 release notes.
- Added v0.9.0 release checklist.

### Changed

- Primary navigation now presents mission-domain destinations rather than implementation surface names.
- Reserved mission domains route conservatively to the existing Model Inventory surface until dedicated domain surfaces exist.
- Core Commands, Reports & Logs and Raw Output are treated as diagnostic access rather than primary mission destinations.
- Mission Dashboard no longer hides the Inspector.
- The shell now exposes a global footer/status bar with workspace and boundary state.
- The top command bar is backed by a typed action model.
- Ambiguous copy implying operational mission readiness has been replaced with reported evidence lane language.
- Stale Scenario Evidence copy has been updated to reflect fixed Core-wrapper execution.
- Updated Studio, package lock, Tauri and Cargo metadata to `0.9.0`.

### Release notes

```text
docs/releases/v0.9.0-release-notes.md
```

### Checklist

```text
V0_9_0_RELEASE_CHECKLIST.md
```

### Not Included

- No new OrbitFabric Core semantics.
- No Mission Model editing.
- No generated artifact editing.
- No generated artifact mutation.
- No visual authoring.
- No graph UI.
- No React Flow adoption.
- No plugin execution.
- No live telemetry.
- No telemetry archive behavior.
- No command uplink behavior.
- No mission control behavior.
- No operational ground behavior.
- No private YAML semantic parsing.
- No private coverage calculation.
- No private mission health calculation.
- No private readiness calculation.
- No private model completeness calculation.

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
