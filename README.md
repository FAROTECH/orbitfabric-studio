# OrbitFabric Studio

Experimental visual engineering workbench for OrbitFabric Mission Data Contracts.

OrbitFabric Studio exists to make OrbitFabric Mission Data Contracts inspectable, navigable, understandable and eventually safely authorable through controlled, validation-gated workflows.

Studio is not where mission semantics are created.

Studio is where mission semantics become inspectable.

---

## Status

```text
v0.0.0 — Studio Charter
```

This repository currently contains the architecture-first foundation for OrbitFabric Studio.

No production application is available yet.

No frontend scaffold is included.

No Tauri, React, TypeScript or package manager setup is included in this release.

The purpose of `v0.0.0` is to define the project charter, boundaries, architecture principles, UX principles, risk model, roadmap and initial architecture decisions before implementation starts.

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

## v0.0.0 Deliverables

This Charter release includes:

- project roadmap;
- project charter;
- vision document;
- explicit non-goals;
- architecture principles;
- data boundary definition;
- UX principles;
- risk register;
- architecture decision records;
- mockup policy;
- example policy;
- completion checklist;
- changelog;
- repository hygiene files.

---

## Repository Structure

```text
orbitfabric-studio/
├── README.md
├── ROADMAP.md
├── CHANGELOG.md
├── V0_0_COMPLETION_CHECKLIST.md
├── LICENSE
├── .gitignore
├── docs/
│   ├── CHARTER.md
│   ├── VISION.md
│   ├── NON_GOALS.md
│   ├── ARCHITECTURE.md
│   ├── DATA_BOUNDARIES.md
│   ├── UX_PRINCIPLES.md
│   ├── RISK_REGISTER.md
│   └── ADR/
│       ├── 0001-separate-repository.md
│       ├── 0002-downstream-visual-workbench.md
│       ├── 0003-core-delegated-validation.md
│       ├── 0004-initial-technology-direction.md
│       └── 0005-read-only-first-controlled-authoring-later.md
├── mockups/
│   └── README.md
└── examples/
    └── README.md
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

## Initial Technology Direction

The initial candidate technology direction is:

```text
Tauri
React
TypeScript
React Flow
Monaco Editor
OrbitFabric CLI or sidecar invocation
```

This is a direction, not yet an implementation commitment.

The final implementation stack will be confirmed before `v0.1.0`.

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
- [`V0_0_COMPLETION_CHECKLIST.md`](V0_0_COMPLETION_CHECKLIST.md)

Architecture decisions are stored in [`docs/ADR/`](docs/ADR/).

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
