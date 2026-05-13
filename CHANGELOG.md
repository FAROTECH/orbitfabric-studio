# Changelog

All notable changes to OrbitFabric Studio will be documented in this file.

The format follows a simple release-oriented structure.

OrbitFabric Studio is currently at `v0.2.0 - Validation and Diagnostics Workbench` release readiness candidate.

The next planned milestone is `v0.3.0 - Contract Navigation Surface`.

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

- Updated the README status from v0.1.0 to v0.2.0 release readiness candidate.
- Updated the README implementation state to describe Core-derived validation diagnostics.
- Updated the README scope from `Open -> Inspect` to `Open -> Inspect -> Validate -> Understand`.
- Updated documentation to state OrbitFabric Core v0.8.0 as the v0.2.0 baseline.
- Updated documentation to clarify that Core JSON is the only structured diagnostics source.
- Updated documentation to clarify that raw stdout and stderr remain visible but are not parsed as diagnostics when JSON exists.
- Updated documentation to keep OrbitFabric Core v0.8.0 ground artifacts out of v0.2.0 scope.

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

Charter release.
