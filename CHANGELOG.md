# Changelog

All notable changes to OrbitFabric Studio will be documented in this file.

The format follows a simple release-oriented structure.

OrbitFabric Studio is currently at `v0.8.0 - Ground Integration Artifact Viewer`.

The current released baseline is `v0.8.0 - Ground Integration Artifact Viewer`.

The next roadmap baseline is `v0.9.0 - Plugin-aware Studio Surface`.

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

Studio does not calculate coverage independently, does not invent dashboard percentages, does not introduce mission health scoring and does not implement the final dashboard UX mockup. The visual dashboard realization is intentionally deferred to v0.7.2.

### Added

- Added TypeScript types and conservative parsers for `orbitfabric.dashboard_summary`.
- Added TypeScript types and conservative parsers for `orbitfabric.scenario_run_index`.
- Added TypeScript types and conservative parsers for `orbitfabric.coverage_summary`.
- Added optional structured expectation accounting fields to Core simulation report types.
- Added fixed Tauri wrapper for Core `export dashboard-summary`.
- Added fixed Tauri wrapper for Core `export scenario-run-index`.
- Added fixed Tauri wrapper for Core `export coverage-summary`.
- Added Core dashboard summary rendering component.
- Added Core scenario run index rendering component.
- Added Core coverage summary rendering component.
- Added structured expectation accounting rendering component for Core simulation JSON reports.
- Added generated artifact recognition for Core dashboard, scenario run index and coverage reports.
- Added generated artifact preview binding for dashboard summary reports.
- Added generated artifact preview binding for scenario run index reports.
- Added generated artifact preview binding for coverage summary reports.
- Added generated artifact preview binding for structured simulation expectation accounting.
- Added UI action for `Run export dashboard-summary`.
- Added UI action for `Run export scenario-run-index`.
- Added UI action for `Run export coverage-summary`.
- Added automatic generated artifact inventory refresh after successful dashboard, scenario run index and coverage exports.
- Added explicit unavailable states for dashboard, scenario run index and coverage exports that do not produce JSON reports.

### Changed

- Updated Studio header copy to `v0.7.1 dashboard and coverage foundation`.
- Updated the hero status badge to `DASHBOARD FOUNDATION`.
- Clarified that Studio renders Core-produced reports and generated artifacts.
- Clarified that OrbitFabric Core remains authoritative for validation, scenario evidence, coverage, generation, artifact semantics and engineering meaning.
- Extended generated artifact recognition to include Studio-controlled dashboard, scenario run index and coverage report paths.

### Validated Manually

Manual verification was performed during the v0.7.1 implementation flow on:

```text
examples/demo-3u
```

Validated local checks included:

```text
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

Recommended smoke flow before tagging:

```text
Open workspace
Run export entity-index
Run export relationship-manifest
Run at least one scenario through Core
Run export scenario-run-index
Run export dashboard-summary
Run export coverage-summary
Verify Core command output renders recognized panels
Verify Generated Artifact Explorer recognizes the new reports
Verify generated artifact previews remain read-only
```

### Not Included

- No private coverage calculation.
- No frontend-defined coverage denominator.
- No alternative coverage percentage.
- No mission health score.
- No model completeness score.
- No scenario run history inferred from logs.
- No scenario-id deduplication.
- No YAML semantic parsing.
- No graph UI.
- No React Flow dependency.
- No dashboard UX realization matching the target mockup.
- No ground artifact viewer.
- No authoring.
- No editing.
- No generated artifact mutation.
- No source file mutation.
- No arbitrary command execution.

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

### Added

- Added read-only Scenario Evidence Explorer implementation.
- Added scenario source listing from the selected workspace.
- Added passive generated report/log candidate discovery for Evidence.
- Added TypeScript types and parser for the real Core `tool: orbitfabric-sim` simulation JSON report.
- Added Core simulation report summary rendering.
- Added timeline, event, command and mode transition rendering from structured Core JSON.
- Added data-flow evidence rendering from structured Core JSON.
- Added failed expectation rendering from structured Core JSON.
- Added controlled Tauri wrapper for Core `orbitfabric sim`.
- Added Studio-controlled JSON report path under `generated/reports`.
- Added Studio-controlled plain-text log path under `generated/logs`.
- Added automatic generated artifact inventory refresh after successful Core simulation.
- Added read-only simulation log preview linkage.
- Added Inspector binding for selected simulation report records.
- Added Inspector overflow/readability containment for selected simulation records.

### Changed

- Updated the visible Studio release label to `v0.7.0 scenario evidence explorer`.
- Updated the primary loop to include scenario evidence inspection.
- Updated Evidence from reserved surface to implemented read-only surface.
- Clarified that scenario execution is available only through a fixed Core command.
- Clarified that scenario status, timeline, records and evidence are rendered only from structured Core JSON.
- Clarified that plain-text logs remain preview-only and are not parsed as evidence.
- Clarified that absence of failed expectations is not interpreted as passed expectation accounting.

### Validated Manually

Manual verification was performed during the v0.7.0 implementation flow on:

```text
examples/demo-3u
```

Validated scenario flow:

```text
Open workspace
Run through Core
Inspect Core simulation summary
Inspect timeline/events/commands/mode transitions
Inspect data-flow evidence
Preview associated simulation log
Inspect selected evidence records in Inspector
```

Validated local checks included:

```text
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
npm run tauri:dev
```

### Not Included

- No private scenario runner.
- No independent scenario simulation.
- No dynamic spacecraft simulator.
- No orbital simulation.
- No RF simulation.
- No payload physics simulation.
- No mission control behavior.
- No command uplink behavior.
- No live telemetry behavior.
- No telemetry archive behavior.
- No ground behavior.
- No graph UI.
- No React Flow dependency.
- No coverage percentage invented by Studio.
- No mission health score invented by Studio.
- No model completeness percentage invented by Studio.
- No data product coverage percentage invented by Studio.
- No commandability coverage percentage invented by Studio.
- No Mission Model YAML editing.
- No generated artifact editing.
- No source file mutation.
- No generated artifact mutation.
- No arbitrary command execution.
- No arbitrary OrbitFabric CLI argument entry.
- No private YAML semantic parser.
- No private relationship inference.
- No log-derived evidence.
- No passed expectation inference.
- No produced data product inference.

---
## v0.6.0 - Studio Information Architecture & UX Foundation

Released milestone.

This milestone extends the product loop to:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships -> Inspect Generated Artifacts -> Review Reserved Surfaces
```

v0.6.0 remains downstream from OrbitFabric Core.

Studio reorganizes the existing v0.1.0 through v0.5.0 capabilities into a coherent read-only Mission Contract Engineering Workbench foundation.

Studio does not introduce new Mission Model semantics, scenario execution, ground operations, authoring, editing, React Flow adoption or private graph behavior.

### Added

- Added Studio application shell with workspace header, primary navigation, main surface and contextual inspector.
- Added Workspace Dashboard.
- Added provenance, status and severity badge system.
- Added state-aware sidebar availability for implemented, unavailable and reserved surfaces.
- Added normalized anchors for existing surfaces.
- Added selection-aware contextual inspector for source files, generated artifacts and Core command output.
- Added reserved Scenario Evidence and Ground Integration surfaces.
- Added graph visualization boundary documentation.
- Added v0.6.0 UX and read-only boundary polish.
- Added readable workflow step badges in the primary loop.

### Changed

- Updated the top-level Studio framing from `Generated Artifact Explorer` to `Mission Contract Engineering Workbench`.
- Updated hero wording to identify v0.6.0 as the information architecture and UX foundation.
- Reinforced Core authority and read-only boundaries in the UI.
- Normalized surface navigation around existing v0.1.0 through v0.5.0 capabilities.
- Clarified that Generated Artifact Explorer is one Studio surface, not the whole Studio identity.
- Clarified Evidence and Ground as reserved future surfaces.

### Validated Manually

Manual verification was performed cumulatively during the v0.6.0 implementation flow on:

```text
examples/demo-3u
```

Validated local checks included:

```text
npm run build
npm run tauri:dev
```

### Not Included

- No Mission Model YAML editing.
- No generated artifact editing.
- No independent artifact generation.
- No arbitrary command execution.
- No scenario execution.
- No scenario simulation.
- No mission control behavior.
- No command uplink.
- No live telemetry archive.
- No ground segment behavior.
- No private graph semantics.
- No React Flow adoption.
- No visual Mission Model editor.
- No Controlled Contract Authoring implementation.
- No Plugin-aware Studio implementation.

---

## v0.5.0 - Generated Artifact Explorer

Released milestone.

This milestone extends the product loop to:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships -> Inspect Generated Artifacts
```

v0.5.0 remains downstream from OrbitFabric Core.

Studio inspects generated artifacts already present in the selected workspace.

Studio does not generate artifacts, modify files, execute arbitrary commands, infer Mission Model semantics from generated files, claim runtime behavior or claim ground behavior.

### Added

- Added `ADR-0010 - v0.5 Core-derived Generated Artifact Explorer`.
- Added `docs/development/v0.5.0-generated-artifact-explorer.md`.
- Added `docs/releases/v0.5.0-release-notes.md`.
- Added `V0_5_RELEASE_CHECKLIST.md`.
- Added generated artifact inventory model.
- Added controlled backend command for generated artifact inspection.
- Added bounded recursive inspection of `generated/`.
- Added conservative artifact classes: reports, logs, docs, runtime, ground and unknown.
- Added known Core-documented artifact classification.
- Added unknown generated artifact visibility without invented semantics.
- Added Generated Artifact Explorer panel.
- Added generated artifact counts and grouped artifact lists.
- Added read-only preview for supported generated text artifacts.
- Added CSV preview support for generated ground dictionaries.
- Added explicit non-goal gates for read-only generated artifact inspection.

### Changed

- Updated README to mark v0.5.0 as the current released baseline.
- Updated README to describe v0.5.0 as implemented rather than planned.
- Updated ROADMAP to mark v0.5.0 as completed.
- Updated package, Cargo and Tauri version metadata to `0.5.0`.
- Refreshed generated lockfiles through local npm and Cargo workflows.
- Updated Studio landing copy to `Generated Artifact Explorer`.
- Updated the visible product loop to include `Inspect Generated Artifacts`.

### Validated Manually

Manual verification was performed cumulatively during the v0.5.0 implementation flow on:

```text
examples/demo-3u
```

Observed Generated Artifact Explorer result:

```text
Total artifacts: 19
Known artifacts: 19
Unknown artifacts: 0
Previewable: 19
Not previewable: 0
```

Observed artifact groups included:

```text
Reports: 4
Ground-facing artifacts: 15
```

Ground CSV dictionaries were verified as known and previewable.

Validated local checks included:

```text
npm install
npm run build
npm run tauri:dev
```

### Not Included

- No editing.
- No generated file modification.
- No Mission Model modification.
- No arbitrary shell command.
- No arbitrary OrbitFabric CLI argument entry.
- No artifact generation workflow.
- No scenario runner.
- No runtime execution.
- No ground runtime claim.
- No mission-control UI.
- No live telemetry.
- No command uplink.
- No private YAML semantic parser.
- No private Mission Model validator.
- No private artifact semantics.
- No dependency graph.
- No relationship graph engine.
- No plugin execution.
- No plugin discovery.

---

## v0.4.0 - Relationship Surface

Released milestone.

This milestone extends the product loop to:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships
```

### Added

- Fixed backend command for Core `export relationship-manifest`.
- Studio-controlled relationship manifest report path.
- TypeScript model and parser for Core `relationship_manifest.json`.
- UI action for `Run export relationship-manifest`.
- Relationship Manifest summary panel.
- Boundary labels for the Relationship Manifest Surface.
- Raw `relationship_manifest.json` preview.
- Missing-report fallback for the relationship manifest command.
- Relationship type summary and filters from Core `relationship_types`.
- Relationship records navigation and filters from Core `relationships`.
- Selected relationship explanation panel.
- Explicit provenance and boundary statements for selected relationship records.
- `docs/releases/v0.4.0-release-notes.md`.

### Changed

- Updated the visible Studio header to `Relationship Surface`.
- Updated the visible release label to `v0.4.0 relationship surface`.
- Updated the visible product loop to `Open -> Inspect -> Validate -> Navigate -> Explain Relationships`.
- Updated README to describe v0.4.0 as the current released baseline.
- Updated ROADMAP to mark v0.4.0 as completed.
- Updated package, Cargo and Tauri version metadata to `0.4.0`.

### Validated Manually

Manual smoke tests were performed with OrbitFabric Core 1.0.0 on:

```text
examples/demo-3u
```

Observed relationship manifest result:

```text
total_relationships = 46
```

Validated local checks:

```text
npm run build
npm run tauri:dev
```

### Not Included

- No editing.
- No visual model editing.
- No semantic YAML parser.
- No private relationship inference.
- No dependency graph.
- No relationship graph engine.
- No source line or column navigation.
- No runtime behavior.
- No ground behavior.
- No arbitrary command execution.
- No relationship records invented by Studio.
- No synthetic nodes.
- No synthetic edges.

---

## v0.3.0 - Contract Navigation Surface

Released milestone.

This milestone extends the product loop toward:

```text
Open -> Inspect -> Validate -> Navigate
```

v0.3.0 remains downstream from OrbitFabric Core.

Studio consumes Core-owned contract navigation reports.

Studio does not become an independent model parser, validator, entity extractor, relationship resolver or graph engine.

### Added

- Added `ADR-0008 - v0.3 Core-derived Contract Navigation`.
- Added `docs/development/v0.3.0-contract-navigation-surface.md`.
- Added `docs/releases/v0.3.0-release-notes.md`.
- Added `V0_3_RELEASE_CHECKLIST.md`.
- Added fixed backend command for Core `export model-summary`.
- Added fixed backend command for Core `export entity-index`.
- Added Studio-controlled report paths for Core model summary and entity index exports.
- Added TypeScript model for Core `model_summary.json`.
- Added TypeScript model for Core `entity_index.json`.
- Added minimal read-only report parsers for Core lint, model summary and entity index reports.
- Added frontend action for fixed Core `export model-summary`.
- Added Core-derived Contract Domains panel from `model_summary.json`.
- Added safe read-only source-file links from Core model summary domain records.
- Added missing or unsupported Core model summary fallback text.
- Added frontend action for fixed Core `export entity-index`.
- Added Core-derived Contract Entities panel from `entity_index.json`.
- Added Core-derived domain index summary with indexed and not-indexed states.
- Added entity records grouped by Core-reported domain.
- Added safe read-only source-file links from Core entity index domain and entity records.
- Added missing or unsupported Core entity index fallback text.
- Added `src-tauri/gen/` to `.gitignore` as a generated Tauri artifact path.

### Changed

- Updated the README status to v0.3.0 released.
- Updated the README to describe implemented Core-derived model summary and entity index consumption.
- Updated the roadmap to mark v0.3.0 as completed.
- Updated the roadmap to defer graph and relationship navigation until Core exposes a relationship surface.
- Refactored Core lint report parsing into a shared report parser module.
- Updated the Core command panel copy to include Core export reports as derived reports.
- Updated the Studio landing copy from the v0.1.0 inspection slice to the v0.3.0 Contract Navigation Surface.
- Updated the visible primary loop to `Open -> Inspect -> Validate -> Navigate`.
- Updated package, Cargo and Tauri version metadata to `0.3.0` before tagging.
- Refreshed generated lockfiles through local npm and Cargo workflows before tagging.

### Validated Manually

Manual smoke tests were performed with OrbitFabric Core 0.8.2 on:

```text
examples/demo-3u
```

Observed outcomes:

```text
model-summary:
  result: passed
  mission: demo-3u
  model_version: 0.1.0

entity-index:
  result: passed
  mission: demo-3u
  model_version: 0.1.0
  total_entities: 46
```

Validated UI behavior:

```text
Run --version
Run inspect mission
Run lint mission
Run export model-summary
Run export entity-index
Display Contract domains
Display Contract entities
Display indexed and not-indexed domain states
Display mode_transitions and policies without synthetic entity records
Open Core-indicated source files read-only
Preserve raw stdout, stderr and exit code
```

Final local release checks completed before tagging:

```text
npm install
cargo check
npm run build
npm run tauri:dev
```

### Not Included

- No editing.
- No visual model editing.
- No semantic YAML parser.
- No private entity extraction.
- No private domain registry when Core `model_summary.json` is available.
- No private relationship resolver.
- No graph view.
- No relationship navigation.
- No dependency graph.
- No line or column navigation.
- No fake source span.
- No quick fixes.
- No suppressions.
- No scenario runner.
- No generator workflow beyond fixed Core-owned report exports.
- No ground artifact explorer.
- No runtime artifact explorer.
- No plugin UI.
- No arbitrary command execution.
- No arbitrary OrbitFabric CLI argument entry.
- No mission-control UI.
- No live telemetry.
- No command uplink.

---

## v0.2.0 - Validation and Diagnostics Workbench

This release extends the v0.1.0 `Open -> Inspect` loop toward:

```text
Open -> Inspect -> Validate -> Understand
```

v0.2.0 remains downstream from OrbitFabric Core.

Studio invokes fixed Core validation commands and renders Core-derived reports.

Studio does not become an independent validator or semantic Mission Model parser.

### Added

- Added `ADR-0007 - v0.2 Core-derived Validation Diagnostics`.
- Added `V0_2_RELEASE_CHECKLIST.md` as the release gate for the Validation and Diagnostics Workbench.
- Added v0.2.0 development notes under `docs/development/`.
- Added fixed backend command for Core lint invocation.
- Added fixed command shape: `orbitfabric lint <mission_dir> --json <report_path>`.
- Added Studio-controlled Core JSON lint report path.
- Added JSON report availability flag to Core command results.
- Added JSON report content loading when Core produces a report.
- Added TypeScript model for Core lint reports.
- Added TypeScript model for Core lint findings.
- Added UI action for `Run lint mission`.
- Added Core JSON report path and availability display.
- Added typed Core lint report preview.
- Added Core validation summary panel.
- Added Core-derived result, mission, model version and Core version display.
- Added errors, warnings, info and findings counts from Core JSON.
- Added read-only Core findings list.
- Added rendering for Core-provided finding severity, code, file, domain, object ID, message and suggestion.
- Added safe source-file linking from Core findings.
- Added read-only opening of linked source files when the Core-provided file name exactly matches a detected source model file.
- Added fallback display when a Core-provided file reference cannot be safely linked.
- Added layout handling for long entry names and badges.
- Added v0.2.0 release notes.

### Changed

- Updated the README status from v0.1.0 to v0.2.0.
- Updated the README implementation state to describe Core-derived validation diagnostics.
- Updated the README scope from `Open -> Inspect` to `Open -> Inspect -> Validate -> Understand`.
- Updated documentation to state OrbitFabric Core v0.8.0 as the v0.2.0 baseline.
- Updated documentation to clarify that Core JSON is the only structured diagnostics source.
- Updated documentation to clarify that raw stdout and stderr remain visible but are not parsed as diagnostics when JSON exists.
- Updated documentation to keep OrbitFabric Core v0.8.0 ground artifacts out of v0.2.0 scope.
- Updated package, Cargo and Tauri version metadata to `0.2.0` before tagging.

### Not Included

- No editing.
- No visual model editing.
- No graph view.
- No scenario runner.
- No generator workflow.
- No ground artifact generation UI.
- No ground artifact explorer.
- No semantic YAML parsing inside Studio.
- No independent validation rules.
- No stdout diagnostics scraping when JSON exists.
- No quick fixes.
- No suppressions.
- No fake line or column navigation.
- No arbitrary command execution.
- No arbitrary Core CLI argument entry.
- No live telemetry.
- No command uplink.
- No mission control behavior.
- No ground segment behavior.

### Validated Manually

Manual smoke tests were performed with OrbitFabric Core 0.8.0 on:

```text
examples/demo-3u
examples/spacelab-inspired-communications-minislice
```

Observed outcomes:

```text
demo-3u:
  result: passed
  findings: 0

spacelab-inspired-communications-minislice:
  result: passed_with_warnings
  finding: OF-DL-005
  file: contacts.yaml
```

The `contacts.yaml` finding reference was validated as a safe clickable source-file link that opens in the read-only viewer without line or column navigation.

---

## v0.1.0 - Read-only Mission Project Viewer

First runnable OrbitFabric Studio application.

This release implements the narrow `Open -> Inspect` loop without editing, without graph rendering and without independent model validation.

### Added

- Accepted `ADR-0006 - v0.1 Implementation Stack and Read-only Shell`.
- Confirmed the v0.1.0 stack: Tauri 2, React, TypeScript, Vite, Monaco Editor and controlled OrbitFabric CLI invocation.
- Deferred React Flow until graph views become part of the roadmap scope.
- Added `V0_1_RELEASE_CHECKLIST.md` as the release gate for the Read-only Mission Project Viewer.
- Archived the v0.0.0 completion checklist under `docs/releases/`.
- Added the first minimal Tauri 2 application scaffold.
- Added a React, TypeScript and Vite frontend scaffold.
- Added a static Studio shell screen that states the v0.1.0 boundaries.
- Added a minimal Tauri backend entrypoint.
- Added a minimal Tauri capability granting only `core:default`.
- Added development notes for the v0.1.0 scaffold under `docs/development/`.
- Added local directory selection for workspace opening.
- Added structural workspace inspection through a dedicated Rust command.
- Added Mission Model file detection based on expected OrbitFabric filenames.
- Added scenario YAML file detection.
- Added generated and derived location detection.
- Added source model, scenario source, derived report and generated output labels.
- Added a read-only workspace inspection UI.
- Added bounded read-only text file loading.
- Added Monaco Editor integration in read-only mode.
- Added workspace containment checks for file viewing.
- Added maximum file-size and supported text-file checks for the file viewer.
- Added controlled OrbitFabric Core command status commands.
- Added raw stdout, stderr and exit-code display for fixed Core commands.
- Added UI controls for `orbitfabric --version` and `orbitfabric inspect mission`.
- Added v0.1.0 release notes.

### Changed

- Updated the README status from the v0.0.0 Charter baseline to the v0.1.0 release candidate state.
- Clarified that v0.1.0 is governed by the narrower `Open -> Inspect` implementation loop.
- Updated the README with implemented capabilities, current structure and development commands.
- Updated the development notes to describe the workspace inspection slice.
- Updated the development notes to describe the read-only file viewer slice.
- Updated the development notes to describe the controlled Core command status slice.
- Updated Tauri capabilities to allow only the directory selection dialog in addition to the baseline core permission.
- Completed the v0.1.0 release checklist.

### Removed

- Removed the archived v0.0.0 completion checklist from the repository root.

### Not Included

- No validation diagnostics UI.
- No graph rendering.
- No scenario execution.
- No generator workflow.
- No editing.
- No arbitrary command execution.
- No arbitrary OrbitFabric CLI argument entry.

---

## v0.0.0 - Studio Charter

Initial architecture-first baseline for OrbitFabric Studio.

This release does not ship an application.

It establishes the project foundation for a future visual engineering workbench around OrbitFabric Mission Data Contracts.

### Added

- Project README.
- Studio roadmap.
- Project charter.
- Vision document.
- Explicit non-goals.
- Architecture principles.
- Data boundary definition.
- UX principles.
- Risk register.
- Initial architecture decision records.
- Mockups directory policy.
- Examples directory policy.
- v0.0.0 completion checklist.
- Repository hygiene files.

### Architecture Decisions

- `ADR-0001` - Separate Repository.
- `ADR-0002` - Downstream Visual Workbench.
- `ADR-0003` - Core-delegated Validation.
- `ADR-0004` - Initial Technology Direction.
- `ADR-0005` - Read-only First, Controlled Authoring Later.

### Core Principles Established

- The Mission Model remains the source of truth.
- OrbitFabric Core remains authoritative for validation, scenario evidence and generated artifacts.
- Studio is a downstream visual engineering workbench.
- Studio may display engineering meaning but must not invent it.
- Studio is not read-only by identity.
- Studio is read-only by initial maturity strategy.
- Future authoring must be explicit, patch-based, reviewable and validation-gated.
- Generated artifacts are disposable and must remain distinguishable from source model files.
- Source model, derived report, generated output and UI state must remain separate categories.

### Non-goals Confirmed

OrbitFabric Studio is not:

- OrbitFabric Core;
- a flight software framework;
- an OBC runtime;
- a ground segment;
- a mission control system;
- a live telemetry dashboard;
- a command uplink console;
- a spacecraft simulator;
- a CCSDS/PUS/CFDP implementation;
- a Yamcs/OpenC3 replacement;
- a generic YAML IDE;
- a generic diagramming tool;
- a cloud collaboration platform.

### Implementation

No application code is included.

No frontend scaffold is included.

No Tauri, React, TypeScript or package manager setup is included.

The initial technology direction is documented but not yet committed as implementation.

### Release Type

Documentation-only.

Architecture-first.

Boundary-first.
