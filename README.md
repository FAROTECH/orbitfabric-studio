# OrbitFabric Studio

Experimental visual engineering workbench for OrbitFabric Mission Data Contracts.

OrbitFabric Studio exists to make OrbitFabric Mission Data Contracts inspectable, navigable, understandable and eventually safely authorable through controlled, validation-gated workflows.

Studio is not where mission semantics are created.

Studio is where mission semantics become inspectable.

---

## Status

```text
v0.1.0 - Read-only Mission Project Viewer, release candidate
```

The `v0.0.0 - Studio Charter` baseline has been created, tagged and released.

The first implementation milestone is now focused on the narrow product loop:

```text
Open -> Inspect
```

Studio v0.1.0 proves that it can open a real OrbitFabric mission workspace and inspect its structure without editing it and without becoming a second model engine.

---

## Current Implementation State

v0.1.0 currently implements:

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
```

The implemented loop is intentionally conservative:

```text
Open workspace
    -> inspect structure
    -> view source/scenario files read-only
    -> check Core availability/version
    -> run Core inspect mission as raw status output
```

Studio does not validate the Mission Model.

Studio does not infer mission semantics from YAML.

Studio does not generate artifacts.

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

- model loading;
- semantic validation;
- linting;
- scenario execution;
- scenario evidence;
- generated documentation;
- runtime-facing contract bindings;
- ground-facing contract artifacts;
- future plugin semantics.

Studio may display engineering meaning.

Studio must not invent engineering meaning.

---

## What Studio Is

OrbitFabric Studio is intended to become a local-first workbench for:

- opening OrbitFabric mission workspaces;
- inspecting Mission Data Contract entities;
- running and displaying validation;
- navigating diagnostics;
- visualizing contract relationships;
- inspecting generated documentation and reports;
- inspecting runtime-facing generated artifacts;
- inspecting ground-facing generated artifacts;
- inspecting deterministic scenario evidence;
- eventually supporting controlled contract authoring through explicit patches and Core validation.

The first product loop is:

```text
Open -> Inspect -> Validate -> Understand
```

The v0.1.0 implementation loop is narrower:

```text
Open -> Inspect
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

## v0.1.0 Scope

The v0.1.0 milestone is the Read-only Mission Project Viewer.

Implemented capabilities:

- open a local OrbitFabric workspace or mission directory;
- detect expected Mission Model files;
- detect scenario YAML files;
- detect generated documentation, report, log and runtime artifact directories when present;
- label source model files, scenario sources, derived reports and generated outputs;
- display supported text files in Monaco Editor read-only mode;
- enforce workspace containment for read-only file loading;
- enforce a bounded text file size for the viewer;
- configure an OrbitFabric Core executable path;
- run `orbitfabric --version` as a fixed command;
- run `orbitfabric inspect mission <mission_dir>` as a fixed command;
- display raw Core stdout, stderr, success status and exit code.

Explicit v0.1.0 non-goals:

- no editing;
- no visual model editing;
- no graph view;
- no scenario runner;
- no generator workbench;
- no plugin support;
- no independent model validation;
- no deep semantic parsing inside Studio;
- no lint diagnostics UI;
- no mission-control UI;
- no live telemetry;
- no command uplink;
- no ground segment behavior;
- no arbitrary command execution;
- no arbitrary OrbitFabric CLI argument entry;
- no external compatibility claims.

---

## Repository Structure

Current implementation structure:

```text
orbitfabric-studio/
├── README.md
├── ROADMAP.md
├── CHANGELOG.md
├── V0_1_RELEASE_CHECKLIST.md
├── package.json
├── package-lock.json
├── index.html
├── vite.config.ts
├── tsconfig.json
├── assets/
│   └── app-icon.png
├── src/
│   ├── App.tsx
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
│   │   └── v0.1.0-scaffold.md
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
v0.4  Mission Model Graph
v0.5  Generated Artifact Explorer
v0.6  Scenario Evidence Explorer
v0.7  Ground Integration Artifact Viewer
v0.8  Controlled Contract Authoring Preview
v0.9  Plugin-aware Studio Surface
v1.0  Stable Studio Workbench
```

See [`ROADMAP.md`](ROADMAP.md) for details.

---

## Implementation Stack for v0.1.0

The v0.1.0 implementation stack is:

```text
Tauri 2
React
TypeScript
Vite
Monaco Editor
OrbitFabric CLI invocation through fixed local command paths
```

React Flow is explicitly deferred because graph rendering is not part of v0.1.0.

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
- [`docs/development/v0.1.0-scaffold.md`](docs/development/v0.1.0-scaffold.md)
- [`docs/releases/v0.1.0-release-notes.md`](docs/releases/v0.1.0-release-notes.md)
- [`V0_1_RELEASE_CHECKLIST.md`](V0_1_RELEASE_CHECKLIST.md)

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
