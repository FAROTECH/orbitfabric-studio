# OrbitFabric Studio

Experimental visual engineering workbench for OrbitFabric Mission Data Contracts.

OrbitFabric Studio exists to make OrbitFabric Mission Data Contracts inspectable, navigable, understandable and eventually safely authorable through controlled, validation-gated workflows.

Studio is not where mission semantics are created.

Studio is where mission semantics become inspectable.

---

## Status

```text
v0.3.0 - Contract Navigation Surface, release candidate
```

The `v0.0.0 - Studio Charter`, `v0.1.0 - Read-only Mission Project Viewer` and `v0.2.0 - Validation and Diagnostics Workbench` baselines have been created, tagged and released.

The current implementation baseline is v0.3.0 release candidate.

The implemented product loop is:

```text
Open -> Inspect -> Validate -> Navigate
```

Studio v0.3.0 is a Core-derived Contract Navigation Surface.

It consumes OrbitFabric Core `model_summary.json` and `entity_index.json` reports when produced by Core.

It does not parse Mission Model YAML semantically.

It does not infer entities, relationships, source locations or graph structure privately.

---

## Current Implementation State

v0.3.0 currently implements:

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
Core JSON lint report availability display
Typed Core lint report preview
Core validation summary panel
Read-only Core findings list
Safe source-file links from Core findings
Typed Core model summary parsing
Typed Core entity index parsing
Core-derived Contract Domains panel
Core-derived Contract Entities panel
Core-derived domain index summary
Indexed / not-indexed domain states
Entity records grouped by Core-reported domain
Safe source-file links from Core domain and entity records
Raw stdout / stderr / exit-code display
```

The implemented v0.3.0 loop remains conservative:

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
    -> open referenced source files read-only when safely resolvable
```

Studio does not validate the Mission Model independently.

Studio does not infer mission semantics from YAML.

Studio does not parse stdout as diagnostics when a Core JSON report exists.

Studio does not generate arbitrary artifacts.

Studio does not execute scenarios.

Studio does not edit files.

OrbitFabric Core remains authoritative.

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

OrbitFabric Studio is a downstream visual engineering workbench that consumes OrbitFabric mission models, validation outputs, generated reports, generated artifacts and scenario evidence.

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
- future relationship surfaces;
- future plugin semantics.

Studio may display engineering meaning.

Studio must not invent engineering meaning.

For v0.3.0, this means:

```text
Core model_summary.json -> Studio domain navigation
Core entity_index.json  -> Studio entity navigation
Core relationship surface, future only -> Studio relationship or graph navigation
```

---

## What Studio Is

OrbitFabric Studio is intended to become a local-first workbench for:

- opening OrbitFabric mission workspaces;
- inspecting Mission Data Contract entities;
- running and displaying validation;
- navigating diagnostics;
- navigating Core-derived contract domains and entities;
- visualizing contract relationships only after Core exposes relationship surfaces;
- inspecting generated documentation and reports;
- inspecting runtime-facing generated artifacts;
- inspecting ground-facing generated artifacts;
- inspecting deterministic scenario evidence;
- eventually supporting controlled contract authoring through explicit patches and Core validation.

The current product loop is:

```text
Open -> Inspect -> Validate -> Navigate
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
- a graph engine;
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

## v0.3.0 Scope

The v0.3.0 milestone is the Contract Navigation Surface.

Implemented capabilities:

- run `orbitfabric export model-summary <mission_dir> --json <report_path>` as a fixed command;
- run `orbitfabric export entity-index <mission_dir> --json <report_path>` as a fixed command;
- load `model_summary.json` read-only when produced by Core;
- load `entity_index.json` read-only when produced by Core;
- display contract domains from Core `model_summary.domains`;
- display contract entities from Core `entity_index.entities`;
- display Core-derived domain summary records;
- display Core-derived entity records grouped by domain;
- display Core provenance for domain and entity surfaces;
- display indexed and not-indexed domain states;
- avoid synthetic entity records for summarized-only domains such as `mode_transitions` and `policies`;
- link domains and entities to Core-indicated source files when safely resolvable inside the workspace;
- display graceful fallback when Core does not support `model-summary`;
- display graceful fallback when Core does not support `entity-index`;
- display graceful fallback when reports are missing or invalid.

Version compatibility targets:

```text
Core v0.8.0:
  lint JSON available
  no model-summary
  no entity-index
  Contract Navigation disabled with clear explanation

Core v0.8.1:
  model-summary available
  entity-index unavailable
  domain navigation enabled
  entity navigation disabled with clear explanation

Core v0.8.2:
  model-summary available
  entity-index available
  domain navigation enabled
  entity navigation enabled
```

Compatibility is based on command behavior and report availability, not only version-string parsing.

Explicit v0.3.0 non-goals:

- no editing;
- no visual model editing;
- no semantic YAML parser;
- no private entity extraction;
- no private domain registry when Core `model_summary.json` is available;
- no private relationship resolver;
- no graph view;
- no relationship navigation;
- no dependency graph;
- no line or column navigation;
- no fake source span;
- no quick fixes;
- no suppressions;
- no scenario runner;
- no generator workflow beyond fixed Core-owned report exports;
- no ground artifact explorer;
- no runtime artifact explorer;
- no plugin UI;
- no arbitrary command execution;
- no arbitrary OrbitFabric CLI argument entry;
- no mission-control UI;
- no live telemetry;
- no command uplink.

---

## Current Known Limitations

The current OrbitFabric Core lint and navigation reports do not provide:

```text
line metadata
column metadata
schema version for lint reports
report timestamp
Git SHA
JSON Schema URL
absolute source path
relationship manifest
relationship graph
dependency graph
YAML AST
```

Studio therefore does not show line or column jumps.

Studio does not infer file references from domains, object IDs or messages.

Studio links a finding, domain or entity to a file only when the Core-provided file field exactly matches a detected source model file.

Studio does not infer entity relationships because Core v0.8.2 does not expose a relationship manifest, relationship graph or dependency graph.

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
v0.4  Relationship Surface, gated by Core relationship outputs
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

React Flow remains deferred because graph rendering is not part of v0.3.0.

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
- [`docs/development/v0.1.0-scaffold.md`](docs/development/v0.1.0-scaffold.md)
- [`docs/development/v0.2.0-validation-diagnostics.md`](docs/development/v0.2.0-validation-diagnostics.md)
- [`docs/development/v0.3.0-contract-navigation-surface.md`](docs/development/v0.3.0-contract-navigation-surface.md)
- [`docs/releases/v0.1.0-release-notes.md`](docs/releases/v0.1.0-release-notes.md)
- [`docs/releases/v0.2.0-release-notes.md`](docs/releases/v0.2.0-release-notes.md)
- [`docs/releases/v0.3.0-release-notes.md`](docs/releases/v0.3.0-release-notes.md)
- [`V0_1_RELEASE_CHECKLIST.md`](V0_1_RELEASE_CHECKLIST.md)
- [`V0_2_RELEASE_CHECKLIST.md`](V0_2_RELEASE_CHECKLIST.md)
- [`V0_3_RELEASE_CHECKLIST.md`](V0_3_RELEASE_CHECKLIST.md)

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
