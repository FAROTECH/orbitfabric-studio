# Changelog

All notable changes to OrbitFabric Studio will be documented in this file.

The format follows a simple release-oriented structure.

OrbitFabric Studio is currently at `v0.13.0 - Evidence-integrated Workbench`.

The active planning baseline is `v0.14.0 - Artifact Traceability Integration`.

---

## Unreleased

No changes yet.

---

## v0.13.0 - Evidence-integrated Workbench

Released milestone.

This milestone deepens the dedicated Mission Data Flow Workbench by integrating Core-reported relationship, scenario, validation and coverage evidence more directly into the Workbench surface.

v0.13.0 remains downstream from OrbitFabric Core.

Studio does not add mission semantics, infer private data-flow links, introduce graph editing, parse scenario YAML as evidence, read logs as evidence or mutate generated artifacts.

### Added

- Added v0.13.0 Evidence-integrated Workbench planning and boundary documentation.
- Added explicit Workbench evidence kinds for relationship, scenario, validation, coverage and artifact evidence.
- Added a dedicated validation evidence lane in the Workbench model.
- Added validation records from `CoreLintReport`.
- Added fallback validation summary records from `CoreDashboardSummary.validation`.
- Added richer coverage evidence records for scenario runs, entity coverage, expectation coverage, relationship coverage and unsupported scopes.
- Added record-level evidence kind provenance metadata.
- Added read-only local Workbench selection for Core-reported canvas nodes, canvas edges, scenario evidence records, validation records, coverage records and relationship records.
- Added Workbench Inspector updates from selected Core-derived items.
- Added raw Core-reported payload preview in the Workbench Inspector.
- Added Scenario Timeline rendering of Core-reported `data_flow_evidence` fields.
- Added grouped Validation, Coverage and Relationship evidence sections in the Lint / Validation Results panel.
- Added compact Workbench evidence posture rail aligned with Reference B.
- Added Workbench lint report wiring through both Mission Cockpit and the dedicated Workbench route.
- Added v0.13.0 release notes and release checklist.

### Changed

- Mission Data Flow Workbench now presents evidence as explicit relationship, scenario, validation, coverage and artifact categories.
- Scenario Timeline now shows Core-reported data-flow evidence fields such as simulation time, producer, producer type, triggering command, eligible downlink flows, contact windows, storage intent and downlink intent when available.
- Lint / Validation Results now separates validation evidence, coverage evidence and relationship evidence.
- Workbench visual hierarchy is closer to the Reference B north-star surface while remaining read-only and Core-derived.
- Workbench metadata, Tauri metadata and Cargo metadata are aligned to `0.13.0`.

### Release notes

```text
docs/releases/v0.13.0-release-notes.md
```

### Checklist

```text
V0_13_0_RELEASE_CHECKLIST.md
```

### Not Included

- No React Flow adoption.
- No graph library adoption.
- No graph editing.
- No drag/drop graph behavior.
- No layout engine semantics.
- No Mission Model authoring.
- No YAML editor behavior.
- No generated artifact mutation.
- No plugin execution.
- No plugin marketplace.
- No live telemetry.
- No telemetry archive behavior.
- No command uplink behavior.
- No mission control behavior.
- No operational ground behavior.
- No private YAML semantic parsing.
- No private scenario YAML interpretation.
- No private log-derived evidence.
- No private relationship inference.
- No private data-flow inference.
- No private coverage calculation.
- No private mission health calculation.
- No private readiness calculation.
- No private model completeness calculation.
- No command authorization.
- No command scheduling.
- No command execution.
- No Autonomy promotion.

---

## v0.12.0 - Mission Data Flow Workbench Foundation

Released milestone.

This milestone introduces the first dedicated read-only, Core-derived Mission Data Flow Workbench foundation and moves Studio closer to the Reference B UI north star.

v0.12.0 remains downstream from OrbitFabric Core.

Studio does not add mission semantics, infer private data-flow links, introduce graph editing or mutate generated artifacts.

### Added

- Added Mission Data Flow Workbench data model foundation.
- Added Workbench source summaries, lanes, records, counts and explicit boundary metadata.
- Added isolated read-only Mission Data Flow Workbench surface shell.
- Added Reference B-oriented Workbench layout.
- Added Workbench tab strip for Graph View, YAML View, Scenario Runner and Data Flow Evidence.
- Added central read-only canvas-like Graph View foundation.
- Added right-side Workbench Inspector placeholder.
- Added lower Workbench panels for Scenario Timeline and Lint / Validation Results.
- Added Core-derived canvas node and edge rendering from `relationship_manifest.json` records.
- Added dedicated Mission Data Flow Workbench route frame.
- Wired the dedicated Workbench surface into the Studio shell.
- Added Data Flow Workbench sidebar entry.
- Added Inspect Data Flow shell command bar action.
- Added Workbench source expansion for Core model summary, Core entity index, Core dashboard summary, Core coverage summary and Core simulation report data-flow evidence.
- Added relationship manifest consumption for Workbench relationship lanes.
- Added App-level relationship manifest persistence for the dedicated Workbench surface.
- Added shell status bar handling for the dedicated Workbench surface.
- Added v0.12.0 planning, source expansion, validation, persistence, dedicated surface, release notes and release checklist documentation.

### Changed

- Mission Cockpit now exposes the Workbench foundation and the shell also exposes a dedicated Workbench surface.
- Workbench rendering now follows Reference B visual grammar more closely while remaining read-only and Core-derived.
- Relationship records and edges shown in the Workbench are limited to Core-reported relationship manifest records.
- Scenario data-flow evidence shown in the Workbench is limited to Core simulation report `data_flow_evidence` records.
- Coverage records shown in the Workbench are limited to Core coverage summary records.
- Updated Studio, Tauri and Cargo metadata to `0.12.0`.

### Release notes

```text
docs/releases/v0.12.0-release-notes.md
```

### Checklist

```text
V0_12_0_RELEASE_CHECKLIST.md
```

### Not Included

- No React Flow adoption.
- No graph library adoption.
- No graph editing.
- No drag/drop graph behavior.
- No layout engine semantics.
- No Mission Model authoring.
- No generated artifact mutation.
- No plugin execution.
- No plugin marketplace.
- No live telemetry.
- No telemetry archive behavior.
- No command uplink behavior.
- No mission control behavior.
- No operational ground behavior.
- No private YAML semantic parsing.
- No private relationship inference.
- No private data-flow inference.
- No private coverage calculation.
- No private mission health calculation.
- No private readiness calculation.
- No private model completeness calculation.
- No command authorization.
- No command scheduling.
- No command execution.
- No Autonomy promotion.

---

## v0.11.1

Runtime UI triage hotfix for v0.11.0.

### Fixed

- Reset main content scroll position when navigating between Studio surfaces.
- Clarified source file inspection behavior across domain surfaces.
- Added explicit reserved Autonomy state instead of generic legacy fallback.
- Fixed Scenario / Recent runs empty-state copy when the scenario index is reported but empty.

### Notes

- No v0.12.0 functionality is introduced in this release.

---

## v0.11.0 - Domain Surfaces & Entity Detail System

Released milestone.

This milestone introduces dedicated read-only Core-derived mission-domain surfaces and consistent entity list/detail inspection.

v0.11.0 remains downstream from OrbitFabric Core.

Studio does not add mission semantics. It renders Core-reported model summary and entity index data through dedicated domain surfaces, while preserving conservative boundaries and the contextual Inspector.

### Added

- Added reusable CoreDomainSurface pattern.
- Added Core domain surface factory.
- Added typed runtime registry for model-inventory domain surfaces.
- Added dedicated read-only domain surfaces for Spacecraft, Subsystems, Modes, Telemetry, Commands, Events, Faults, Packets, Payloads, Data Products, Contacts & Downlink and Commandability.
- Added consistent Core entity list/detail inspection.
- Added contextual Inspector binding for selected Core entities.
- Added v0.11.0 release notes.
- Added v0.11.0 release checklist.

### Changed

- Promoted implemented mission-domain navigation entries from reserved to available.
- Kept Data Products, Contacts & Downlink and Commandability conservative.
- Kept Autonomy reserved.
- Replaced repeated model-inventory domain rendering branches with a typed registry.
- Converted domain surface wrappers into declarative exports backed by a shared factory.
- Updated Studio, package lock, Tauri and Cargo metadata to `0.11.0`.

### Release notes

```text
docs/releases/v0.11.0-release-notes.md
```

### Checklist

```text
V0_11_0_RELEASE_CHECKLIST.md
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
- No plugin marketplace.
- No live telemetry.
- No telemetry archive behavior.
- No command uplink behavior.
- No mission control behavior.
- No operational ground behavior.
- No private YAML semantic parsing.
- No private relationship inference.
- No private coverage calculation.
- No private mission health calculation.
- No private readiness calculation.
- No private model completeness calculation.
- No command authorization.
- No command scheduling.
- No command execution.
- No Autonomy promotion.

---

## v0.10.0 - Mission Cockpit Consolidation

Released milestone.

This milestone consolidates the Mission Dashboard into a clearer Mission Cockpit.

v0.10.0 remains downstream from OrbitFabric Core.

Studio does not add mission semantics. It improves the read-only Mission Cockpit, reported evidence presentation, cockpit provenance vocabulary and shell layout stability.

### Added

- Added dedicated Mission Cockpit implementation path around the mission dashboard.
- Added extracted Mission Cockpit model, KPI card, evidence lane and panel header components.
- Added denser Mission Cockpit visual hierarchy aligned with the accepted UI north star direction.
- Added reported evidence lanes for contract, validation, scenario, coverage and artifact state.
- Added active navigation tracking by mission-domain item instead of only by destination surface.
- Added v0.10.0 release notes.
- Added v0.10.0 release checklist.

### Changed

- Reworked the Mission Dashboard into a Mission Cockpit entry point.
- Updated stale no-workspace hero version copy away from old v0.7.2 wording.
- Kept the Mission Cockpit dashboard free from the Inspector so the cockpit has enough horizontal space.
- Preserved Inspector behavior for detail-oriented surfaces.
- Prevented sidebar hash navigation from scrolling the shell when switching surfaces.
- Stabilized sidebar, main surface, Inspector and shell status bar grid placement.
- Consolidated duplicated Mission Cockpit shell CSS after visual polish.
- Updated Studio, package lock, Tauri and Cargo metadata to `0.10.0`.

### Release notes

```text
docs/releases/v0.10.0-release-notes.md
```

### Checklist

```text
V0_10_0_RELEASE_CHECKLIST.md
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
- No plugin marketplace.
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

## v0.9.0 - Semantic Navigation & Unified Shell

Released milestone.

This milestone transforms Studio from a surface-oriented workbench into a mission-domain-oriented shell.

v0.9.0 remains downstream from OrbitFabric Core.

Studio does not add mission semantics. It reorganizes existing read-only Studio capabilities around a typed navigation model, semantic sidebar, global command bar, persistent Inspector and shell status bar.

### Added

- Added typed navigation model for Studio shell surfaces.
- Added explicit navigation item states: `available`, `unavailable`, `reserved` and `diagnostic`.
- Added target mission-domain navigation entries for Mission, Spacecraft, Subsystems, Modes, Telemetry, Commands, Events, Faults, Packets, Payloads, Data Products, Contacts & Downlink, Commandability, Autonomy, Scenarios and Generated Artifacts.
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
- Added conservative ground artifact family grouping for manifest, dictionary-json, dictionary-csv, documentation and unknown-ground-artifact.
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
