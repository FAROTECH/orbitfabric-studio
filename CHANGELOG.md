# Changelog

All notable changes to OrbitFabric Studio will be documented in this file.

The format follows a simple release-oriented structure.

OrbitFabric Studio is currently at `v0.1.0 - Read-only Mission Project Viewer`.

The next planned milestone is `v0.2.0 - Validation and Diagnostics Workbench`.

---

## Unreleased - v0.2.0 - Validation and Diagnostics Workbench

Planning baseline for the Core-derived validation and diagnostics milestone.

This milestone will extend the narrow v0.1.0 `Open -> Inspect` loop toward:

```text
Open -> Inspect -> Validate -> Understand
```

The v0.2.0 implementation must remain downstream from OrbitFabric Core.

Studio may invoke fixed Core validation commands and render Core-derived reports.

Studio must not become an independent validator or semantic Mission Model parser.

### Planned

- Add a fixed Core lint invocation path for `orbitfabric lint <mission_dir> --json <path>`.
- Use the OrbitFabric Core JSON lint report as the only structured diagnostics source.
- Display lint result, summary counts and findings as Core-derived diagnostics.
- Preserve raw stdout, stderr and exit-code visibility.
- Distinguish Studio structural inspection from Core validation/lint result.
- Distinguish Core JSON reports from source Mission Model files.
- Link diagnostics to files only when Core provides file references and they are safely resolvable inside the selected workspace.

### Scope Boundaries

- No editing.
- No graph view.
- No scenario runner.
- No generator workflow.
- No ground artifact generation UI.
- No ground artifact explorer.
- No arbitrary command execution.
- No arbitrary Core CLI argument entry.
- No semantic YAML parsing inside Studio.
- No duplicate validation engine.
- No stdout diagnostics scraping when JSON exists.
- No quick fixes or suppressions.

### Core Baseline

- OrbitFabric Core v0.8.0 is the planning baseline.
- `orbitfabric --version` remains a fixed status command.
- `orbitfabric inspect mission <mission_dir>` remains a fixed inspection command.
- `orbitfabric lint <mission_dir> --json <path>` is the validation/lint surface for v0.2.0.
- `orbitfabric gen ground <mission_dir>` exists in Core v0.8.0, but remains out of scope for Studio v0.2.0.

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
