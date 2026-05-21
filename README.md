# OrbitFabric Studio

Experimental visual engineering workbench for OrbitFabric Mission Data Contracts.

OrbitFabric Studio exists to make OrbitFabric Mission Data Contracts inspectable, navigable, understandable and eventually safely authorable through controlled, validation-gated workflows.

Studio is not where mission semantics are created.

Studio is where mission semantics become inspectable.

---

## Status

```text
Current released baseline: v0.4.0 - Relationship Surface
Next planned baseline: v0.5.0 - Generated Artifact Explorer
```

The `v0.0.0 - Studio Charter`, `v0.1.0 - Read-only Mission Project Viewer`, `v0.2.0 - Validation and Diagnostics Workbench`, `v0.3.0 - Contract Navigation Surface` and `v0.4.0 - Relationship Surface` baselines have been created, tagged and released.

The current implementation baseline is v0.4.0.

The next implementation milestone is v0.5.0.

The implemented v0.4.0 product loop is:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships
```

Studio v0.4.0 is a Core-derived Relationship Surface.

It consumes OrbitFabric Core `model_summary.json`, `entity_index.json` and Core v1.0.0 `relationship_manifest.json` reports when produced by Core.

Studio does not parse Mission Model YAML semantically.

Studio does not infer entities, relationships, source locations or graph structure privately.

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

For the current and next milestones, this means:

```text
Core model_summary.json          -> Studio domain navigation
Core entity_index.json           -> Studio entity navigation
Core relationship_manifest.json  -> Studio relationship inspection, planned for v0.4.0
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
Open -> Inspect -> Validate -> Navigate
```

The next planned product loop is:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships
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

## v0.4.0 Scope

The v0.4.0 milestone is the Relationship Surface.

Planned capabilities:

- run `orbitfabric export relationship-manifest <mission_dir> --json <report_path>` as a fixed command;
- load `relationship_manifest.json` read-only when produced by Core;
- display manifest identity, version, status, mission and Core version;
- display manifest boundary labels;
- display relationship type summary records;
- display relationship records;
- filter records by relationship type and endpoint domains;
- link relationship endpoints to Core `entity_index.json` entities when available;
- explain selected relationship records as Core-owned derived records;
- display graceful fallback when the report is missing, invalid or unsupported.

Explicit v0.4.0 non-goals:

- no editing;
- no visual model editing;
- no semantic YAML parser;
- no private relationship inference;
- no private graph semantics;
- no dependency graph;
- no relationship graph engine;
- no source line or column navigation;
- no YAML AST navigation;
- no fake source spans;
- no plugin UI;
- no plugin execution;
- no runtime behavior;
- no ground behavior;
- no live telemetry;
- no command uplink;
- no mission-control UI;
- no scenario runner;
- no arbitrary OrbitFabric CLI argument entry;
- no arbitrary shell command;
- no relationship records invented by Studio;
- no synthetic nodes;
- no synthetic edges.

---

## Current Known Limitations

The current Studio implementation does not yet consume `relationship_manifest.json`.

That is the purpose of v0.4.0.

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

Studio therefore does not show line or column jumps.

Studio does not infer file references from domains, object IDs or messages.

Studio links a finding, domain, entity or future relationship endpoint to a file only when Core-provided metadata can be safely resolved inside the workspace.

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

React Flow remains deferred because graph rendering is not part of v0.4.0 baseline scope.

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
- [`docs/development/v0.1.0-scaffold.md`](docs/development/v0.1.0-scaffold.md)
- [`docs/development/v0.2.0-validation-diagnostics.md`](docs/development/v0.2.0-validation-diagnostics.md)
- [`docs/development/v0.3.0-contract-navigation-surface.md`](docs/development/v0.3.0-contract-navigation-surface.md)
- [`docs/development/v0.4.0-relationship-surface.md`](docs/development/v0.4.0-relationship-surface.md)
- [`docs/releases/v0.1.0-release-notes.md`](docs/releases/v0.1.0-release-notes.md)
- [`docs/releases/v0.2.0-release-notes.md`](docs/releases/v0.2.0-release-notes.md)
- [`docs/releases/v0.3.0-release-notes.md`](docs/releases/v0.3.0-release-notes.md)
- [`V0_1_RELEASE_CHECKLIST.md`](V0_1_RELEASE_CHECKLIST.md)
- [`V0_2_RELEASE_CHECKLIST.md`](V0_2_RELEASE_CHECKLIST.md)
- [`V0_3_RELEASE_CHECKLIST.md`](V0_3_RELEASE_CHECKLIST.md)
- [`V0_4_RELEASE_CHECKLIST.md`](V0_4_RELEASE_CHECKLIST.md)

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
