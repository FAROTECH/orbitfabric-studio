# ADR-0002 — Downstream Visual Workbench

## Status

Accepted for v0.0.0.

## Context

OrbitFabric Studio could easily be misunderstood as:

- a new modeling authority;
- a visual replacement for the Mission Model;
- a second OrbitFabric Core;
- a mission design tool;
- a ground segment;
- a mission control interface.

This would create semantic drift and weaken the Mission Data Contract concept.

Studio must therefore be explicitly defined as downstream of OrbitFabric Core.

## Decision

OrbitFabric Studio is a downstream visual engineering workbench for OrbitFabric Mission Data Contracts.

Studio consumes:

- Mission Model files;
- OrbitFabric Core validation outputs;
- generated reports;
- generated documentation;
- generated runtime-facing artifacts;
- generated ground-facing artifacts;
- scenario evidence;
- future Core/plugin metadata.

Studio visualizes, organizes, navigates and explains these surfaces.

Studio does not create independent mission semantics.

## Consequences

The Mission Model remains the source of truth.

OrbitFabric Core remains authoritative for:

- model loading;
- validation;
- linting;
- scenario evidence;
- generation;
- plugin semantics when introduced.

Studio remains authoritative only for:

- UI state;
- presentation;
- navigation;
- visualization;
- local interaction flows;
- future patch-based authoring workflows.

## Rationale

The value of Studio is to make the Mission Data Contract inspectable.

The value is not to replace the contract.

Core defines and validates.

Studio makes the result human-navigable.

## Risks

- Studio may gradually become a second Core.
- UI graphs may imply semantics not produced by Core.
- Users may treat Studio state as authoritative.

## Mitigations

- require provenance for meaningful UI objects;
- consume Core outputs wherever possible;
- clearly distinguish source, derived, generated and UI-only data;
- prohibit private Studio validation semantics.

## Review Trigger

Revisit this ADR if OrbitFabric Core exposes a formal API that changes integration mechanics.

Do not revisit the downstream authority boundary unless the entire Studio identity changes.
