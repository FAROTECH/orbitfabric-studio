# ADR-0006 — v0.1 Implementation Stack and Read-only Shell

## Status

Accepted for v0.1.0.

## Context

ADR-0004 recorded an initial technology direction for OrbitFabric Studio without committing the repository to an implementation stack.

v0.1.0 is the first application slice:

```text
Open -> Inspect
```

The goal is to open an existing OrbitFabric mission workspace and inspect its structure without editing it and without turning Studio into a second model engine.

The implementation stack must support:

- local workspace opening;
- local filesystem inspection;
- read-only source and artifact viewing;
- controlled local invocation of OrbitFabric Core;
- clear separation between source model, derived reports, generated outputs and UI state;
- future growth toward validation, diagnostics, navigation and graph views.

The stack must not encourage premature graph surfaces, decorative dashboards, mission-control metaphors or private Studio semantics.

## Decision

For v0.1.0, OrbitFabric Studio will use:

```text
Tauri 2
React
TypeScript
Vite
Monaco Editor
OrbitFabric CLI invocation through a controlled local command path
```

React Flow is explicitly deferred.

React Flow remains suitable for future relationship and graph views, but it is not introduced in v0.1.0 because graph rendering is an explicit non-goal of the Read-only Mission Project Viewer.

## v0.1.0 Scope

The v0.1.0 implementation may include:

- a minimal Tauri desktop shell;
- a React/TypeScript frontend;
- local directory selection;
- conservative workspace classification;
- project tree display;
- read-only file viewing;
- generated artifact directory discovery;
- OrbitFabric Core executable configuration or discovery;
- execution of narrow Core commands such as `orbitfabric --version` and inspection/status commands;
- display of raw command result status, stdout and stderr.

The v0.1.0 implementation must not include:

- editing;
- visual model editing;
- graph view;
- scenario runner;
- generator workbench;
- plugin support;
- independent model validation;
- deep semantic parsing inside Studio;
- mission-control UI;
- live telemetry;
- command uplink;
- ground segment behavior;
- unsupported compatibility claims.

## Architecture Boundary

The required boundary remains:

```text
OrbitFabric Core
    |
    | CLI / reports / generated artifacts / command status
    v
Studio Adapter Layer
    |
    | presentation-oriented UI read model
    v
Studio UI
```

The Adapter Layer is presentation-only.

It may classify files, normalize command status and organize already-available Core outputs for display.

It must not implement OrbitFabric validation, resolve mission semantics, invent missing relationships or create a private Studio model.

## Source / Derived / Generated / UI-state Discipline

v0.1.0 must visibly preserve these categories:

```text
source model      = authoritative user-authored Mission Model files
derived report    = OrbitFabric Core output derived from the source model
generated output  = disposable artifact generated from the contract
UI state          = local Studio representation
```

Every project-tree entry and file-viewing surface introduced in v0.1.0 should make this distinction clear where applicable.

## Core Integration Rule

Studio may invoke OrbitFabric Core through a controlled local command path.

Studio must prefer machine-readable Core outputs where available.

If a required machine-readable Core output is missing, Studio must not compensate by duplicating Core semantics.

The correct response is to record or implement a Core enhancement.

## Consequences

- v0.1.0 starts from a real application scaffold.
- The scaffold remains narrow and read-only.
- React Flow is not installed yet.
- Monaco Editor may be introduced for read-only source/artifact viewing.
- Tauri capabilities must be scoped to the local filesystem and controlled command execution needed by the viewer.
- Core command failures remain visible as engineering/application status, not hidden behind generic UI errors.

## Risks

- Tauri command execution could become too permissive.
- Workspace inspection could drift into semantic parsing.
- The UI could look like a generic YAML IDE.
- Early dependency choices could pull v0.2/v0.3/v0.4 concepts into v0.1.
- Raw command output could be mistaken for structured validation UX.

## Mitigations

- Keep command invocation allowlisted and visible.
- Classify files and directories conservatively.
- Do not parse mission semantics in Studio.
- Do not install graph-specific dependencies in v0.1.0.
- Label source, derived, generated and UI-state surfaces explicitly.
- Preserve raw Core output access.
- Treat richer diagnostics and validation UX as v0.2.0 scope.

## Review Trigger

Review this ADR before introducing:

- graph rendering;
- validation diagnostics UX;
- generator workflows;
- scenario execution surfaces;
- controlled editing;
- plugin-aware behavior;
- any broader Core integration beyond narrow local command invocation.
