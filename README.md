# OrbitFabric Studio

Experimental visual engineering workbench for OrbitFabric Mission Data Contracts.

OrbitFabric Studio exists to make OrbitFabric Mission Data Contracts inspectable, navigable, understandable and eventually safely authorable through controlled, validation-gated workflows.

Studio is not where mission semantics are created.

Studio is where mission semantics become inspectable.

---

## Status

```text
v0.1.0 — Read-only Mission Project Viewer, in development
```

The `v0.0.0 — Studio Charter` baseline has been created, tagged and released.

The repository is now entering the first implementation slice.

The v0.1.0 goal is deliberately narrow:

```text
Open -> Inspect
```

Studio v0.1.0 must prove that it can open a real OrbitFabric mission workspace and inspect its structure without editing it and without becoming a second model engine.

---

## Current Implementation State

This branch contains the first minimal application scaffold:

```text
Tauri 2 desktop shell
React frontend
TypeScript configuration
Vite build setup
Minimal static Studio shell screen
Minimal Tauri backend entrypoint
Minimal default Tauri capability
```

The scaffold is intentionally not a workspace viewer yet.

It does not yet implement local directory opening, filesystem traversal, file viewing, generated artifact discovery or OrbitFabric Core command invocation.

Those capabilities are introduced only in later v0.1.0 slices.

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

The initial Tauri capability grants only `core:default`.

No filesystem, dialog or shell execution permissions are granted by the scaffold.

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

The first implementation slice is the Read-only Mission Project Viewer.

Candidate capabilities:

- open a local OrbitFabric mission directory;
- detect expected Mission Model files;
- display a project tree;
- display YAML files in read-only mode;
- detect generated artifact directories;
- display basic project metadata where available;
- show available reports and generated outputs;
- invoke OrbitFabric Core through a controlled local command path;
- show raw command result status.

Explicit v0.1.0 non-goals:

- no editing;
- no visual model editing;
- no graph view;
- no scenario runner;
- no generator workbench;
- no plugin support;
- no independent model validation;
- no deep semantic parsing inside Studio;
- no mission-control UI;
- no live telemetry;
- no command uplink;
- no ground segment behavior;
- no external compatibility claims.

---

## Repository Structure

Current scaffold structure:

```text
orbitfabric-studio/
├── README.md
├── ROADMAP.md
├── CHANGELOG.md
├── V0_1_RELEASE_CHECKLIST.md
├── package.json
├── index.html
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── src-tauri/
│   ├── Cargo.toml
│   ├── build.rs
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json
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
OrbitFabric CLI invocation through a controlled local command path
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
