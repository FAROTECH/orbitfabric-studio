# OrbitFabric Studio

Experimental visual engineering workbench for OrbitFabric Mission Data Contracts.

OrbitFabric Studio exists to make OrbitFabric Mission Data Contracts inspectable, navigable, understandable and eventually safely authorable through controlled, validation-gated workflows.

Studio is not where mission semantics are created.

Studio is where mission semantics become inspectable.

---

## Status

```text
Current released baseline: v0.8.0 - Ground Integration Artifact Viewer
Next roadmap baseline: v0.9.0 - Plugin-aware Studio Surface
```

The `v0.0.0 - Studio Charter`, `v0.1.0 - Read-only Mission Project Viewer`, `v0.2.0 - Validation and Diagnostics Workbench`, `v0.3.0 - Contract Navigation Surface`, `v0.4.0 - Relationship Surface`, `v0.5.0 - Generated Artifact Explorer`, `v0.6.0 - Studio Information Architecture & UX Foundation`, `v0.7.0 - Scenario Evidence Explorer` and `v0.7.1 - Dashboard and Coverage Foundation` baselines have been created, tagged and released.

The current implementation baseline is v0.8.0.

The next roadmap milestone is v0.9.0.

The implemented v0.7.0 product loop is:

```text
Open -> Select Scenario -> Run Scenario through Core -> Inspect Evidence -> Review Reports and Logs
```

The next roadmap loop is:

```text
Inspect Coverage -> Understand Gaps -> Navigate Evidence
```

Studio v0.7.0 is a read-only Scenario Evidence Explorer built on the Mission Contract Engineering Workbench foundation.

It reorganizes the existing v0.1.0 through v0.5.0 surfaces into a stable application shell with workspace header, primary navigation, main surface, workspace dashboard, provenance badges, normalized navigation surfaces, contextual inspector and reserved future surfaces.

It consumes OrbitFabric Core-derived reports and inspects generated artifacts already present in the selected OrbitFabric workspace.

It can inspect `generated/`, classify generated artifacts conservatively, group them by broad artifact class and preview supported text artifacts read-only.

It does not generate artifacts, execute arbitrary commands, edit files, infer Mission Model semantics from generated files, execute scenarios or reinterpret generated runtime and ground outputs as operational behavior.

Studio does not parse Mission Model YAML semantically.

Studio does not infer entities, relationships, source locations, artifact semantics or graph structure privately.

---

## Current Implementation State

v0.8.0 currently implements:

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
Generated Artifact Explorer panel
Generated artifact inventory model
Controlled generated artifact backend inspection
Conservative generated artifact classification
Generated artifact groups for reports, logs, docs, runtime, ground and unknown
Read-only generated artifact preview
CSV generated artifact preview support
Raw stdout / stderr / exit-code display
Studio application shell
Workspace header
Primary surface navigation
State-aware enabled / unavailable / reserved navigation states
Workspace dashboard
Provenance, status and severity badge system
Normalized read-only surface anchors
Contextual inspector pattern
Generated artifact selection in Inspector
Reserved Scenario Evidence surface
Reserved Ground Integration surface
Documented graph visualization boundary
v0.6.0 UX and read-only boundary polish
Scenario Evidence Explorer surface
Core simulation JSON report parser for `tool: orbitfabric-sim`
Core simulation summary rendering
Core simulation timeline, event, command and mode transition rendering
Core simulation data-flow evidence and failed expectation rendering
Controlled Core `orbitfabric sim` command wrapper
Studio-controlled simulation report/log paths
Automatic generated artifact refresh after Core simulation
Read-only simulation log preview linkage
Simulation evidence record binding in Inspector
Core dashboard summary report parser and renderer
Core scenario run index report parser and renderer
Core coverage summary report parser and renderer
Structured expectation accounting renderer for Core simulation reports
Fixed Core export dashboard-summary UI binding
Fixed Core export scenario-run-index UI binding
Fixed Core export coverage-summary UI binding
Dedicated Ground Integration Artifact Viewer surface
Generated ground artifact filtering
Ground artifact family grouping
Ground manifest / dictionary / CSV / documentation grouping
Known / unknown ground artifact status
Read-only ground artifact preview
Ground artifact Inspector binding
Explicit non-operational Ground boundary
```

The implemented v0.6.0 loop remains conservative:

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
    -> inspect generated artifact inventory
    -> inspect generated artifact groups
    -> preview supported generated text artifacts read-only
```

Studio does not validate the Mission Model independently.

Studio does not infer mission semantics from YAML.

Studio does not parse stdout as diagnostics when a Core JSON report exists.

Studio does not generate arbitrary artifacts.

Studio executes scenarios only through the fixed Core `orbitfabric sim` wrapper.

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

## v0.7.0 Released Scope

The v0.7.0 milestone is the Scenario Evidence Explorer.

The released scope is read-only inspection of scenario evidence produced by OrbitFabric Core.

The fixed Core command consumed by Studio is:

```text
orbitfabric sim <scenario.yaml> --json <studio_report_path> --log <studio_log_path>
```

The implemented v0.7.0 capabilities are:

- list scenario source files from the selected workspace;
- preview scenario source files read-only;
- parse valid Core `tool: orbitfabric-sim` JSON reports;
- render simulation report identity, result and summary counts;
- render timeline, events, commands and mode transitions from structured Core JSON;
- render `data_flow_evidence` and `failed_expectations` from structured Core JSON;
- execute scenarios only through a fixed Tauri wrapper around `orbitfabric sim`;
- write Studio-controlled report paths under `generated/reports`;
- write Studio-controlled log paths under `generated/logs`;
- refresh the generated artifact inventory after successful Core simulation;
- preview associated simulation logs read-only;
- bind selected simulation evidence records to the contextual Inspector.

Explicit v0.7.0 non-goals:

- no private scenario runner;
- no independent scenario simulation;
- no dynamic spacecraft simulator;
- no mission control behavior;
- no command uplink;
- no live telemetry;
- no log-derived evidence;
- no YAML semantic parsing;
- no passed expectation inference;
- no produced data product inference;
- no coverage percentage or mission health score invented by Studio;
- no React Flow or graph UI.

## v0.6.0 Released Scope

The v0.6.0 milestone is the Studio Information Architecture & UX Foundation.

The released scope is a read-only application shell and UX foundation for the surfaces already implemented from v0.1.0 through v0.5.0.

The implemented v0.6.0 capabilities are:

- stable application shell;
- workspace header;
- primary surface navigation;
- state-aware sidebar availability;
- workspace dashboard;
- provenance, status and severity badge system;
- normalized surface anchors;
- contextual inspector pattern;
- generated artifact selection in the Inspector;
- reserved Scenario Evidence surface;
- reserved Ground Integration surface;
- documented graph visualization boundary;
- UX regression and read-only boundary polish.

Explicit v0.6.0 non-goals:

- no Mission Model YAML editing;
- no generated artifact editing;
- no independent artifact generation;
- no arbitrary command execution;
- no scenario execution;
- no scenario simulation;
- no mission control behavior;
- no command uplink;
- no live telemetry archive;
- no ground segment behavior;
- no private graph semantics;
- no React Flow adoption;
- no visual Mission Model editor;
- no Controlled Contract Authoring implementation;
- no Plugin-aware Studio implementation.

## v0.5.0 Released Scope

The v0.5.0 milestone is the Generated Artifact Explorer.

The released scope is read-only inspection of generated artifacts already present in the workspace.

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

The implemented v0.5.0 capabilities are:

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
Core generated artifacts         -> Studio generated artifact inspection
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
Open -> Inspect -> Validate -> Navigate -> Explain Relationships -> Inspect Generated Artifacts -> Review Reserved Surfaces
```

The next roadmap product loop is:

```text
Run Scenario -> Inspect Evidence -> Understand Contract Behavior
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

Studio v0.6.0 does not change these boundaries.

The Generated Artifact Explorer remains implemented as a read-only artifact inventory and preview surface, not as a generator, semantic artifact parser, runtime viewer, ground viewer or file manager.

The v0.6.0 application shell, dashboard, badge vocabulary, normalized navigation, contextual inspector and reserved future surfaces improve inspectability without changing Core authority or introducing private mission semantics.

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
v0.6  Studio Information Architecture & UX Foundation
v0.7  Scenario Evidence Explorer
v0.8  Ground Integration Artifact Viewer
v0.9  Studio UX Consolidation
v0.10 Controlled Contract Authoring Preview
v0.11 Plugin-aware Studio Surface
v1.0  Stable Mission Contract Engineering Workbench
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
- [`docs/releases/v0.5.0-release-notes.md`](docs/releases/v0.5.0-release-notes.md)
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
