# OrbitFabric Studio — Architecture

## 1. Architecture Thesis

OrbitFabric Studio is a downstream visual engineering workbench for OrbitFabric Mission Data Contracts.

OrbitFabric Core remains authoritative for:

- Mission Model loading
- schema interpretation
- semantic validation
- lint rules
- scenario execution
- scenario evidence
- generated documentation
- generated JSON reports
- runtime-facing contract bindings
- ground-facing contract artifacts
- future plugin semantics

Studio is responsible for:

- local workspace interaction
- user interface state
- project navigation
- diagnostic presentation
- visual organization
- relationship visualization
- artifact inspection
- evidence inspection
- future controlled editing workflows

Studio must not become a second implementation of OrbitFabric Core.

---

## 2. Core Architecture Boundary

The fundamental architecture boundary is:

```text
OrbitFabric Core
    |
    | CLI / JSON reports / manifests / generated artifacts
    v
Studio Adapter Layer
    |
    | normalized UI read model
    v
Studio UI
```

The boundary is intentionally strict.

Studio consumes Core outputs.

Studio does not recreate Core semantics.

---

## 3. Authority Model

## 3.1 OrbitFabric Core Authority

OrbitFabric Core is the authority for engineering meaning.

Core decides:

- whether a mission model is valid;
- whether references are correct;
- whether semantic lint rules pass;
- how scenario evidence is produced;
- how generated artifacts are created;
- how runtime-facing bindings are derived;
- how ground-facing artifacts are exported;
- how future plugin outputs are declared.

## 3.2 Studio Authority

Studio is authoritative only for presentation and interaction.

Studio decides:

- how a workspace is displayed;
- how files are organized in the UI;
- how diagnostics are grouped;
- how generated artifacts are browsed;
- how graphs are rendered;
- how evidence is navigated;
- how user interactions are sequenced;
- how local UI preferences are stored.

Studio may display engineering meaning.

Studio must not invent engineering meaning.

---

## 4. Dependency Direction

The dependency direction is one-way:

```text
orbitfabric-studio -> orbitfabric
```

OrbitFabric Studio may require a compatible OrbitFabric Core version.

OrbitFabric Core must not depend on OrbitFabric Studio.

Core must remain usable as a CLI/model/generation framework without Studio.

Studio must remain replaceable as one possible consumer of OrbitFabric outputs.

---

## 5. Correct Integration Pattern

The correct integration pattern is:

```text
User opens workspace
        |
Studio identifies mission directory
        |
Studio invokes OrbitFabric Core
        |
Core loads / validates / generates
        |
Core emits structured outputs
        |
Studio Adapter normalizes outputs
        |
Studio UI renders inspection surfaces
```

This preserves the authority of Core and the usability of Studio.

---

## 6. Incorrect Integration Pattern

The following pattern is forbidden:

```text
Studio reads Mission Model files
        |
Studio reconstructs model semantics internally
        |
Studio performs its own validation
        |
Studio presents independent engineering conclusions
```

This would create a second source of truth.

It would also create semantic drift between the CLI and the UI.

---

## 7. Studio Adapter Layer

The Adapter Layer is the most important internal boundary of Studio.

Its purpose is to convert OrbitFabric Core outputs into UI-friendly structures.

The Adapter Layer may normalize:

- project summaries
- validation reports
- diagnostics
- model entity indexes
- generated artifact manifests
- generated documentation metadata
- runtime contract manifests
- scenario evidence records
- ground export manifests
- plugin metadata, when available

The Adapter Layer must not:

- implement semantic validation;
- invent missing model references;
- silently repair invalid models;
- create private mission concepts;
- transform generated artifacts into authoritative source;
- hide Core diagnostics.

The Adapter Layer is a presentation adapter, not a model engine.

---

## 8. Source / Derived / Generated / UI State Separation

Studio must preserve this distinction everywhere:

```text
source model      = authoritative user-authored Mission Model files
derived report    = OrbitFabric Core output derived from the source model
generated output  = disposable artifact generated from the contract
UI state          = local representation used by Studio
```

The user must always know which category they are looking at.

This distinction must be visible in:

- project tree
- file viewer
- validation panel
- artifact explorer
- graph view
- evidence explorer
- future editing workflow

Generated files must be marked as generated.

Derived reports must be marked as derived.

Source files must be clearly separated from generated outputs.

---

## 9. Local-first Workspace Model

Studio is designed first as a local-first application.

The initial workspace model is:

```text
local filesystem
    |
    +-- OrbitFabric mission directory
    +-- source Mission Model files
    +-- scenario files
    +-- generated reports
    +-- generated documentation
    +-- generated runtime artifacts
    +-- generated ground artifacts
```

Studio should not require:

- user accounts;
- cloud storage;
- remote workspace hosting;
- collaboration servers;
- telemetry connections;
- ground station credentials.

Cloud or collaboration features are not part of the architecture foundation.

---

## 10. Initial Core Invocation Model

The initial implementation direction is:

```text
Studio UI
    |
    v
local backend / shell bridge
    |
    v
orbitfabric CLI
    |
    v
JSON reports / generated artifacts / command status
```

This may be implemented through a desktop shell such as Tauri, but v0.0 does not commit to a runnable scaffold.

The first implementation must prefer invoking stable OrbitFabric CLI commands and consuming structured outputs.

Direct in-process integration with OrbitFabric Core should be considered only if it improves reliability without weakening the Core/Studio boundary.

---

## 11. Machine-readable Core Outputs

Studio should prefer machine-readable Core outputs.

Strongly preferred surfaces:

- JSON lint report
- project summary JSON
- model entity index
- generated artifact manifest
- runtime contract manifest
- scenario evidence JSON
- ground export manifest
- plugin metadata manifest

If a required output is missing, the preferred response is:

```text
Open or implement an OrbitFabric Core enhancement.
```

The wrong response is:

```text
Duplicate Core parsing and semantic interpretation inside Studio.
```

---

## 12. Project Loading Strategy

The first project loading strategy should be conservative.

Studio may initially detect:

- known OrbitFabric mission directories;
- expected Mission Model files;
- known generated output directories;
- known report locations;
- configured OrbitFabric executable;
- Core version, when available.

Studio should not assume that every folder is a valid mission.

Studio should not silently create missing mission structure in early releases.

Early Studio versions are inspection-first, not project-creation-first.

---

## 13. Validation Flow

The validation flow is:

```text
User requests validation
        |
Studio invokes OrbitFabric Core
        |
Core validates Mission Model
        |
Core emits status and reports
        |
Studio displays result and diagnostics
```

Studio may group diagnostics by:

- file
- domain
- severity
- rule identifier
- entity
- source location

Only when this information is emitted by Core or is safely presentational.

Studio must preserve access to the raw Core output.

---

## 14. Generated Artifact Flow

The generated artifact flow is:

```text
User requests generation or opens existing artifacts
        |
OrbitFabric Core generates artifacts
        |
Studio reads artifact manifest or known output paths
        |
Studio displays generated outputs as generated
```

Studio must not encourage editing generated outputs.

If an artifact needs modification, the user should modify the source Mission Model or generator configuration, not the generated file.

---

## 15. Scenario Evidence Flow

The scenario evidence flow is:

```text
User selects scenario
        |
Studio invokes OrbitFabric Core scenario execution
        |
Core produces deterministic evidence
        |
Studio renders evidence timeline and records
```

Studio must distinguish deterministic contract evidence from real spacecraft behavior.

Scenario evidence is not live operations.

Scenario evidence is not a dynamic spacecraft simulation.

Scenario evidence is not telemetry replay unless explicitly supported by Core.

---

## 16. Future Controlled Editing Flow

Editing is intentionally delayed.

When introduced, controlled editing must follow this flow:

```text
User proposes change
        |
Studio creates explicit patch
        |
Studio shows diff
        |
User confirms write
        |
Studio writes source Mission Model file
        |
Studio invokes OrbitFabric validation
        |
Core accepts or rejects the resulting model
        |
Studio displays accepted/rejected state
```

Rules:

- no hidden auto-fixes;
- no silent rewrites;
- no unsupported domain mutation;
- no direct editing of generated outputs;
- no semantic correction inside Studio;
- invalid model states must remain visible.

The initial editable domains should be low-risk and contract-adjacent, such as:

- data products
- payload expected products
- storage intent
- downlink intent
- contact assumptions

Commands, autonomy and fault behavior should remain read-only until specifically justified.

---

## 17. Graph Architecture

Studio graph views must be derived from Core-visible relationships.

A graph node may represent:

- a source model entity;
- a generated artifact;
- a derived report item;
- a scenario evidence item;
- a plugin-declared item, when supported.

A graph edge may represent:

- an explicit model reference;
- a Core-reported relationship;
- a generated-artifact provenance link;
- a scenario evidence relationship.

A graph edge must not represent a private Studio-only semantic assumption.

Graph views must be explainable.

Clicking a node or edge should eventually answer:

```text
Where did this come from?
Which source entity or Core output supports it?
Is it source, derived, generated or UI-only?
```

---

## 18. Technology Direction

The v0.0 technology direction is not yet an implementation commitment.

The initial candidate stack is:

```text
Tauri
React
TypeScript
React Flow
Monaco Editor
OrbitFabric CLI / sidecar invocation
```

Rationale:

- Tauri is a strong candidate for a lightweight local desktop shell.
- React and TypeScript provide a mature UI foundation.
- React Flow is well suited to relationship graph views.
- Monaco Editor is well suited to source/model inspection.
- CLI or sidecar invocation preserves OrbitFabric Core authority.

This stack should be confirmed by an implementation-focused ADR before v0.1 development starts.

No `package.json`, Tauri scaffold or frontend project is introduced in v0.0.

---

## 19. Version Compatibility

Studio must document compatible OrbitFabric Core versions.

Before OrbitFabric Core v1.0, compatibility may be experimental and narrow.

A future compatibility policy should define:

- minimum supported Core version;
- maximum tested Core version;
- required Core commands;
- required JSON report formats;
- required artifact manifests;
- behavior when Core is missing;
- behavior when Core version is unsupported.

Studio must fail clearly when required Core capabilities are missing.

---

## 20. Error Handling Principles

Studio error handling should be explicit and engineering-oriented.

It should distinguish:

- missing OrbitFabric executable;
- unsupported OrbitFabric version;
- invalid mission workspace;
- failed validation;
- failed generation;
- missing generated artifact;
- malformed Core output;
- unsupported model surface;
- plugin-related failure;
- internal Studio failure.

Studio must not hide Core errors.

Studio must not convert failed validation into a generic UI error.

Validation failure is an engineering result, not an application crash.

---

## 21. Security and Trust Boundaries

Studio is local-first, but it still has trust boundaries.

Potentially sensitive surfaces include:

- mission model contents;
- generated artifacts;
- local filesystem paths;
- project metadata;
- future plugin outputs;
- future integration exports.

Early Studio versions should avoid:

- remote uploads;
- telemetry connections;
- command credentials;
- ground station credentials;
- automatic execution of untrusted plugins;
- hidden network calls;
- account systems.

If future plugin execution is introduced, it must have an explicit security model.

---

## 22. Repository Architecture for v0.0

v0.0 is documentation-only.

The repository should contain:

```text
orbitfabric-studio/
├── README.md
├── ROADMAP.md
├── CHANGELOG.md
├── docs/
│   ├── CHARTER.md
│   ├── VISION.md
│   ├── NON_GOALS.md
│   ├── ARCHITECTURE.md
│   ├── DATA_BOUNDARIES.md
│   ├── UX_PRINCIPLES.md
│   ├── RISK_REGISTER.md
│   └── ADR/
├── mockups/
│   └── README.md
└── examples/
    └── README.md
```

No implementation directories are required in v0.0.

No source code is required in v0.0.

No UI scaffold is required in v0.0.

---

## 23. Architecture Rules

The following rules are mandatory:

1. The Mission Model remains the source of truth.
2. OrbitFabric Core remains authoritative for validation and generation.
3. Studio remains downstream.
4. Studio may display engineering meaning but must not invent it.
5. Studio consumes structured Core outputs where possible.
6. Missing Core outputs should drive Core enhancements, not Studio duplication.
7. Generated artifacts must be marked as generated.
8. Validation failures must remain visible.
9. Editing must be delayed until inspection and validation workflows are stable.
10. Any future editing must be patch-based, visible and validation-gated.
11. Studio must not imply live telemetry, command uplink or mission operations.
12. Studio must not claim external compatibility without implemented and tested support.

---

## 24. Architecture Exit Criteria for v0.0

The architecture baseline is acceptable for v0.0 only if it makes the following unambiguous:

- what Core owns;
- what Studio owns;
- how Studio consumes Core outputs;
- why Studio must not duplicate Core semantics;
- how source, derived, generated and UI state are separated;
- why the first implementation should be local-first;
- why editing is delayed;
- how graph views remain traceable;
- how validation remains delegated;
- what technology direction is being considered without prematurely scaffolding the app.
