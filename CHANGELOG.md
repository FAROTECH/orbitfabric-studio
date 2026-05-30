# Changelog

All notable changes to OrbitFabric Studio will be documented in this file.

The format follows a simple release-oriented structure.

OrbitFabric Studio is currently at `v0.13.0 - Evidence-integrated Workbench`.

The active planning baseline is `v0.14.0 - Artifact Traceability Integration`.

GitHub Release publication for `v0.13.0` is deferred. The `v0.13.0` tag is a technical milestone tag.

---

## Unreleased

### Added

- Added v0.14.0 Artifact Traceability Integration planning and boundary documentation.
- Added initial v0.14.0 release checklist.
- Added explicit v0.14.0 PR sequence covering planning, traceability model foundation, Inspector traceability blocks, Generated Artifacts linkage, Workbench layout polish and release hardening.

### Changed

- Clarified that v0.14.0 should connect generated artifacts, evidence records and Core-reported model entities without introducing authoring, command uplink, live telemetry, plugin behavior, private relationship inference, private data-flow inference or generated artifact mutation.
- Deferred React Flow and graph-library adoption until the traceability model, Inspector blocks and generated artifact linkage are stable.

---

## v0.13.0 - Evidence-integrated Workbench

Tagged technical milestone. GitHub Release publication deferred.

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
- Added dedicated `GeneratedArtifactsSurface`.
- Added compact Generated Artifact Explorer class selection and read-only preview behavior.
- Added conservative multi-domain Contacts & Downlink aggregation.
- Added conservative multi-domain Commandability aggregation.
- Added v0.13.0 release notes and release checklist.

### Changed

- Mission Data Flow Workbench now presents evidence as explicit relationship, scenario, validation, coverage and artifact categories.
- Scenario Timeline now shows Core-reported data-flow evidence fields such as simulation time, producer, producer type, triggering command, eligible downlink flows, contact windows, storage intent and downlink intent when available.
- Lint / Validation Results now separates validation evidence, coverage evidence and relationship evidence.
- Workbench visual hierarchy is closer to the Reference B north-star surface while remaining read-only and Core-derived.
- Mission Cockpit was stabilized during final release hardening.
- Generated Artifacts no longer routes through the legacy workspace surface.
- Core Commands remains a diagnostic surface for controlled Core-derived report refresh and inspection.
- Autonomy copy was aligned as explicitly reserved for this baseline.
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
