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
- Added a read-only Mission Data Flow Workbench traceability model foundation with traceability groups, links, endpoints and summary counts.
- Added traceability link generation for Core-reported relationships, scenario data-flow evidence, generated artifact inventory entries, validation evidence and coverage evidence.
- Added compact Workbench Inspector traceability blocks for selected Core-reported nodes, edges and evidence records.
- Added a read-only generated artifact inventory bridge so the Generated Artifacts surface can expose artifact evidence to the Mission Data Flow Workbench.
- Added Workbench snapshot linkage for generated artifact records and generated output traceability links.

### Changed

- Clarified that v0.14.0 should connect generated artifacts, evidence records and Core-reported model entities without introducing authoring, command uplink, live telemetry, plugin behavior, private relationship inference, private data-flow inference or generated artifact mutation.
- Deferred React Flow and graph-library adoption until the traceability model, Inspector blocks and generated artifact linkage are stable.
- Updated the Workbench header, toolbar and evidence summary to expose reported traceability counts without adding graph semantics.
- Updated the Generated Artifact Explorer to publish read-only inventory evidence to the Workbench without editing, regenerating or semantically interpreting generated artifacts.

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
