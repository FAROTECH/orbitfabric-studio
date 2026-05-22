# OrbitFabric Studio

Experimental visual engineering workbench for OrbitFabric Mission Data Contracts.

OrbitFabric Studio exists to make OrbitFabric Mission Data Contracts inspectable, navigable, understandable and eventually safely authorable through controlled, validation-gated workflows.

Studio is not where mission semantics are created.

Studio is where mission semantics become inspectable.

---

## Status

```text
Current released baseline: v0.4.0 - Relationship Surface
Active planning baseline: v0.5.0 - Generated Artifact Explorer
```

The `v0.0.0 - Studio Charter`, `v0.1.0 - Read-only Mission Project Viewer`, `v0.2.0 - Validation and Diagnostics Workbench`, `v0.3.0 - Contract Navigation Surface` and `v0.4.0 - Relationship Surface` baselines have been created, tagged and released.

The current implementation baseline is v0.4.0.

The active planning milestone is v0.5.0.

The implemented v0.4.0 product loop is:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships
```

The planned v0.5.0 product loop is:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships -> Inspect Generated Artifacts
```

Studio v0.4.0 is a Core-derived Relationship Surface.

It consumes OrbitFabric Core `model_summary.json`, `entity_index.json` and Core v1.0.0 `relationship_manifest.json` reports when produced by Core.

Studio v0.5.0 is planned as a read-only Generated Artifact Explorer.

It will inspect generated artifacts already present in the selected OrbitFabric workspace.

It will not generate artifacts, execute arbitrary commands, edit files, infer Mission Model semantics from generated files or reinterpret generated runtime and ground outputs as operational behavior.

Studio does not parse Mission Model YAML semantically.

Studio does not infer entities, relationships, source locations, artifact semantics or graph structure privately.

---

## Current Implementation State

v0.4.0 currently implements:

```text
Tauri 2 desktop shell
React frontend
TypeScript application code
Vite build setup
Monaco Editor read-only file viewer
Local directory selection
Structural OrbitFabric workspace inspection
Mission Model file detection
Scenario source detection
Generated / derived location detection
Source / scenario / derived / generated labels
Controlled OrbitFabric Core command status panel
Fixed Core --version command
Fixed Core inspect mission command
Fixed Core lint mission command
Fixed Core export model-summary command
Fixed Core export entity-index command
Fixed Core export relationship-manifest command
Core JSON lint report availability display
Typed Core lint report preview
Core validation summary panel
Read-only Core findings list
Safe source-file links from Core findings
Typed Core model summary parsing
Typed Core entity index parsing
Typed Core relationship manifest parsing
Core-derived Contract Domains panel
Core-derived Contract Entities panel
Core-derived Relationship Manifest panel
Core-derived relationship type summary
Core-derived relationship record navigation
Selected relationship explanation panel
Raw stdout / stderr / exit-code display
```

The implemented v0.4.0 loop remains conservative:

```text
Open workspace
    -> inspect structure
    -> view source/scenario files read-only
    -> check Core availability/version
    -> run Core inspect mission as raw status output
    -> run Core lint mission
    -> inspect Core-derived validation summary
    -> inspect Core-provided findings
    -> run Core export model-summary
    -> inspect Core-derived contract domains
    -> run Core export entity-index
    -> inspect Core-derived contract entities
    -> run Core export relationship-manifest
    -> inspect Core-derived relationship manifest identity and boundaries
    -> inspect Core-derived relationship type summary
    -> inspect Core-derived relationship records
    -> inspect selected relationship provenance and boundary statements
```

Studio does not validate the Mission Model independently.

Studio does not infer mission semantics from YAML.

Studio does not parse stdout as diagnostics when a Core JSON report exists.

Studio does not generate arbitrary artifacts.

Studio does not execute scenarios.

Studio does not edit files.

OrbitFabric Core remains authoritative.

---

## v0.4.0 Released Scope

v0.4.0 starts from OrbitFabric Core v1.0.0 and its Relationship Manifest Surface.

The fixed Core command consumed by Studio is:

```text
orbitfabric export relationship-manifest <mission_dir> --json <studio_report_path>
```

The Core-owned report is:

```text
relationship_manifest.json
kind: orbitfabric.relationship_manifest
manifest_version: 0.1-candidate
status: candidate
```

v0.4.0 answers:

```text
How are indexed mission contract entities related, according to Core?
```

v0.4.0 does not answer runtime behavior, ground behavior, dependency graph semantics, live operational state or editing intent.

The v0.4.0 implementation remains read-only and Core-derived.

It consumes relationship records.

It does not build relationship semantics privately.

It does not introduce a dependency graph or relationship graph engine.

---

## v0.5.0 Planning Scope

The v0.5.0 milestone is the Generated Artifact Explorer.

The planned scope is read-only inspection of generated artifacts already present in the workspace.

The initial artifact classes are:

```text
reports
logs
docs
runtime
ground
unknown
```

The explorer should distinguish known Core-documented artifacts from unknown generated files without hiding unknown files and without inventing meaning for them.

The planned v0.5.0 capabilities are:

- inspect `generated/` recursively through a controlled backend command;
- classify files by conservative path, extension and known Core-documented names;
- group artifacts by broad class;
- show file name, path, extension, size, known or unknown status and preview eligibility;
- open supported text artifacts through the existing read-only viewer;
- list unsupported, oversized or binary files without previewing them;
- preserve source, derived report, generated output and UI state boundaries.

Explicit v0.5.0 non-goals:

- no editing;
- no generated file modification;
- no Mission Model modification;
- no arbitrary shell command;
- no arbitrary OrbitFabric CLI argument entry;
- no new generator workflow;
- no scenario runner;
- no runtime execution;
- no build-system integration;
- no flight software claim;
- no ground runtime claim;
- no mission-control UI;
- no live telemetry;
- no command uplink;
- no private YAML semantic parser;
- no private Mission Model validator;
- no private artifact semantics;
- no dependency graph;
- no relationship graph engine;
- no plugin execution;
- no plugin discovery.

---

## Development Commands

After installing Node dependencies:

```bash
npm install
npm run build
npm run tauri:dev
```

The frontend-only development command is:

```bash
npm run dev
```

The Tauri capability grants:

```text
core:default
dialog:allow-open
```

The dialog permission is used for local directory selection.

No broad frontend filesystem permission is granted.

No Tauri shell plugin permission is granted.

Workspace inspection, read-only text loading and fixed OrbitFabric Core command status are exposed through dedicated Rust commands.

---

## Relationship with OrbitFabric Core

OrbitFabric Core is the Mission Data Contract framework.

OrbitFabric Studio is a downstream visual engineering workbench that consumes OrbitFabric mission models, validation outputs, generated reports, generated artifacts, scenario evidence and Core-owned structured surfaces.

The Mission Model remains the source of truth.

OrbitFabric Core remains authoritative for:

- Mission Model loading;
- structural validation;
- semantic linting;
- scenario execution;
- scenario evidence;
- generated documentation;
- runtime-facing contract bindings;
- ground-facing contract artifacts;
- Core-owned contract introspection surfaces;
- Core-owned entity index surfaces;
- Core-owned relationship manifest surfaces;
- relationship semantics;
- future plugin semantics.

Studio may display engineering meaning.

Studio must not invent engineering meaning.

For the current and active planning milestones, this means:

```text
Core model_summary.json          -> Studio domain navigation
Core entity_index.json           -> Studio entity navigation
Core relationship_manifest.json  -> Studio relationship inspection
Core generated artifacts         -> Studio generated artifact inspection, planned for v0.5.0
```

---

## What Studio Is

OrbitFabric Studio is intended to become a local-first workbench for:

- opening OrbitFabric mission workspaces;
- inspecting Mission Data Contract entities;
- running and displaying validation;
- navigating diagnostics;
- navigating Core-derived contract domains and entities;
- explaining Core-owned relationship records from `relationship_manifest.json`;
- inspecting generated documentation and reports;
- inspecting runtime-facing generated artifacts;
- inspecting ground-facing generated artifacts;
- inspecting deterministic scenario evidence;
- eventually supporting controlled contract authoring through explicit patches and Core validation.

The current product loop is:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships
```

The active planning product loop is:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships -> Inspect Generated Artifacts
```

The long-term authoring loop is:

```text
User intent
    -> proposed Mission Model patch
    -> visible diff
    -> explicit confirmation
    -> source model write
    -> OrbitFabric Core validation
    -> accepted/rejected state
```

Studio is not read-only by identity.

Studio is read-only by initial maturity strategy.

---

## What Studio Is Not

OrbitFabric Studio is not:

- OrbitFabric Core;
- an alternative Mission Model format;
- a second validator;
- a private Mission Model parser;
- a private entity extractor;
- a private relationship resolver;
- a private generated artifact semantics engine;
- a dependency graph engine;
- a relationship graph engine;
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
- a generic file manager;
- a cloud collaboration platform.

These boundaries are part of the project identity.

---

## Core Principles

```text
Text remains authoritative.
Visuals explain.
Validation decides.
Provenance is mandatory.
Generated artifacts are disposable.
Editing is explicit.
```

Studio must preserve the distinction between:

```text
source model      = authoritative user-authored Mission Model files
derived report    = OrbitFabric Core output derived from the source model
generated output  = disposable artifact generated from the contract
UI state          = local representation used by Studio
```

---

## Current Known Limitations

Studio v0.4.0 consumes `relationship_manifest.json` when produced by OrbitFabric Core v1.0.0.

Core v1.0.0 provides a Relationship Manifest Surface, but it explicitly does not provide:

```text
relationship graph engine
dependency graph
YAML AST
source locations
line metadata
column metadata
plugin API
Studio API
runtime behavior
ground behavior
```

Studio therefore does not show relationship line or column jumps.

Studio does not infer file references from domains, object IDs or messages.

Studio links a finding, domain or entity to a file only when Core-provided metadata can be safely resolved inside the workspace.

Studio v0.5.0 planning does not change these boundaries.

The Generated Artifact Explorer is planned as a read-only artifact inventory and preview surface, not as a generator, semantic artifact parser, runtime viewer, ground viewer or file manager.

---

## Repository Structure

Current implementation structure:

```text
orbitfabric-studio/
├── README.md
├── ROADMAP.md
├── CHANGELOG.md
├── V0_1_RELEASE_CHECKLIST.md
├── V0_2_RELEASE_CHECKLIST.md
├── V0_3_RELEASE_CHECKLIST.md
├── V0_4_RELEASE_CHECKLIST.md
├── V0_5_RELEASE_CHECKLIST.md
├── package.json
├── package-lock.json
├── index.html
├── vite.config.ts
├── tsconfig.json
├── assets/
│   └── app-icon.png
├── src/
│   ├── App.tsx
│   ├── coreReports.ts
│   ├── main.tsx
│   ├── styles.css
│   └── types/
│       └── workspace.ts
├── src-tauri/
│   ├── Cargo.toml
│   ├── Cargo.lock
│   ├── build.rs
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json
│   ├── icons/
│   └── src/
│       ├── lib.rs
│       └── main.rs
├── docs/
│   ├── CHARTER.md
│   ├── VISION.md
│   ├── NON_GOALS.md
│   ├── ARCHITECTURE.md
│   ├── DATA_BOUNDARIES.md
│   ├── UX_PRINCIPLES.md
│   ├── RISK_REGISTER.md
│   ├── development/
│   ├── ADR/
│   └── releases/
├── mockups/
└── examples/
```

---

## Roadmap Summary

Planned evolution:

```text
v0.0  Studio Charter
v0.1  Read-only Mission Project Viewer
v0.2  Validation and Diagnostics Workbench
v0.3  Contract Navigation Surface
v0.4  Relationship Surface based on Core v1.0.0 relationship_manifest.json
v0.5  Generated Artifact Explorer
v0.6  Scenario Evidence Explorer
v0.7  Ground Integration Artifact Viewer
v0.8  Controlled Contract Authoring Preview
v0.9  Plugin-aware Studio Surface
v1.0  Stable Studio Workbench
```

See [`ROADMAP.md`](ROADMAP.md) for details.

---

## Implementation Stack

The current implementation stack is:

```text
Tauri 2
React
TypeScript
Vite
Monaco Editor
OrbitFabric CLI invocation through fixed local command paths
```

React Flow remains deferred because graph rendering is not part of the current baseline scope.

See [`docs/ADR/0006-v0-1-implementation-stack.md`](docs/ADR/0006-v0-1-implementation-stack.md).

---

## Documentation

Key documents:

- [`docs/CHARTER.md`](docs/CHARTER.md)
- [`docs/VISION.md`](docs/VISION.md)
- [`docs/NON_GOALS.md`](docs/NON_GOALS.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/DATA_BOUNDARIES.md`](docs/DATA_BOUNDARIES.md)
- [`docs/UX_PRINCIPLES.md`](docs/UX_PRINCIPLES.md)
- [`docs/RISK_REGISTER.md`](docs/RISK_REGISTER.md)
- [`docs/ADR/0007-v0-2-core-derived-validation-diagnostics.md`](docs/ADR/0007-v0-2-core-derived-validation-diagnostics.md)
- [`docs/ADR/0008-v0-3-core-derived-contract-navigation.md`](docs/ADR/0008-v0-3-core-derived-contract-navigation.md)
- [`docs/ADR/0009-v0-4-core-derived-relationship-surface.md`](docs/ADR/0009-v0-4-core-derived-relationship-surface.md)
- [`docs/ADR/0010-v0-5-core-derived-generated-artifact-explorer.md`](docs/ADR/0010-v0-5-core-derived-generated-artifact-explorer.md)
- [`docs/development/v0.1.0-scaffold.md`](docs/development/v0.1.0-scaffold.md)
- [`docs/development/v0.2.0-validation-diagnostics.md`](docs/development/v0.2.0-validation-diagnostics.md)
- [`docs/development/v0.3.0-contract-navigation-surface.md`](docs/development/v0.3.0-contract-navigation-surface.md)
- [`docs/development/v0.4.0-relationship-surface.md`](docs/development/v0.4.0-relationship-surface.md)
- [`docs/development/v0.5.0-generated-artifact-explorer.md`](docs/development/v0.5.0-generated-artifact-explorer.md)
- [`docs/releases/v0.1.0-release-notes.md`](docs/releases/v0.1.0-release-notes.md)
- [`docs/releases/v0.2.0-release-notes.md`](docs/releases/v0.2.0-release-notes.md)
- [`docs/releases/v0.3.0-release-notes.md`](docs/releases/v0.3.0-release-notes.md)
- [`docs/releases/v0.4.0-release-notes.md`](docs/releases/v0.4.0-release-notes.md)
- [`V0_1_RELEASE_CHECKLIST.md`](V0_1_RELEASE_CHECKLIST.md)
- [`V0_2_RELEASE_CHECKLIST.md`](V0_2_RELEASE_CHECKLIST.md)
- [`V0_3_RELEASE_CHECKLIST.md`](V0_3_RELEASE_CHECKLIST.md)
- [`V0_4_RELEASE_CHECKLIST.md`](V0_4_RELEASE_CHECKLIST.md)
- [`V0_5_RELEASE_CHECKLIST.md`](V0_5_RELEASE_CHECKLIST.md)

Architecture decisions are stored in [`docs/ADR/`](docs/ADR/).

Archived release records are stored in [`docs/releases/`](docs/releases/).

---

## Release Philosophy

Studio grows through narrow, inspectable, validation-aligned vertical slices.

A milestone is not ready if it requires Studio to become authoritative for mission semantics.

A milestone is not ready if it cannot explain which OrbitFabric Core outputs it consumes.

A milestone is not ready if it implies live telemetry, command uplink, ground operations or unsupported external compatibility.

---

## License

OrbitFabric Studio is licensed under the Apache License 2.0.

See [`LICENSE`](LICENSE).
