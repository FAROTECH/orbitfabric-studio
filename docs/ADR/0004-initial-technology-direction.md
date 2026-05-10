# ADR-0004 — Initial Technology Direction

## Status

Proposed for v0.0.0.

## Context

Studio is expected to become a local-first visual engineering workbench with:

- workspace opening;
- project navigation;
- source/model inspection;
- validation panels;
- diagnostics navigation;
- generated artifact browsing;
- scenario evidence browsing;
- relationship graph views;
- future controlled authoring workflows.

The technology stack must support:

- local filesystem access;
- desktop packaging;
- rich UI;
- graph rendering;
- source/model viewing;
- local invocation of OrbitFabric Core;
- future controlled editing;
- clear separation between UI state and Mission Model authority.

## Decision

The initial candidate technology direction is:

```text
Tauri
React
TypeScript
React Flow
Monaco Editor
OrbitFabric CLI or sidecar invocation
```

This is a directional decision.

It is not yet an implementation commitment.

No implementation scaffold is introduced in v0.0.0.

## Rationale

Tauri is a strong candidate for a lightweight local desktop shell.

React and TypeScript provide a mature UI foundation.

React Flow is suitable for graph and relationship views.

Monaco Editor is suitable for source/model inspection.

CLI or sidecar invocation preserves OrbitFabric Core authority.

## Consequences

Before v0.1.0 implementation starts, this technology direction must be confirmed or revised by a follow-up implementation ADR.

v0.0.0 remains documentation-only.

No `package.json`, Tauri scaffold, React app or frontend source tree is required for v0.0.0.

## Risks

- choosing the stack too early;
- UI dependencies driving architecture;
- packaging concerns distracting from Core integration;
- overbuilding frontend before Core outputs are ready.

## Mitigations

- keep v0.0.0 documentation-only;
- validate Core invocation before UI complexity;
- confirm stack before implementation;
- avoid dependency lock-in in the Charter release.

## Review Trigger

Review before starting v0.1.0 implementation.
