# ADR-0005 — Read-only First, Controlled Authoring Later

## Status

Accepted for v0.0.0.

## Context

Studio must eventually help users work with Mission Data Contracts.

This includes not only inspection, validation and artifact browsing, but also assisted authoring and controlled editing.

However, introducing authoring too early would create major risks:

- source model corruption;
- private Studio semantics;
- premature visual model format;
- validation bypass;
- unsupported domain editing;
- semantic drift from OrbitFabric Core.

At the same time, defining Studio as permanently read-only would understate its strategic value.

## Decision

Studio is not read-only by identity.

Studio is read-only by initial maturity strategy.

The initial workflow is:

```text
Open -> Inspect -> Validate -> Understand
```

The later authoring workflow is:

```text
User intent
    -> proposed Mission Model patch
    -> visible diff
    -> explicit confirmation
    -> write source model
    -> OrbitFabric Core validation
    -> accepted/rejected state
```

Controlled authoring will be introduced only after inspection, validation, navigation and evidence/artifact workflows are sufficiently mature.

## Consequences

Early releases must not modify Mission Model files.

Future authoring must be:

- explicit;
- patch-based;
- diff-visible;
- validation-gated;
- domain-limited;
- source-model oriented;
- unsupported-domain safe.

Studio must not create a private visual model.

Studio must not treat UI state as contract state.

Studio must not edit generated artifacts as source.

## Rationale

The safe path is to first make the contract inspectable.

Only after Studio can faithfully inspect, validate and explain the contract should it help users modify it.

This protects both usability and semantic integrity.

## Initial Candidate Authoring Domains

Future first editable domains may include:

- data products;
- payload expected products;
- storage intent;
- downlink intent;
- contact assumptions.

Higher-risk domains such as commands, autonomy, fault behavior and recovery logic should remain read-only until explicitly justified.

## Risks

- users may perceive early Studio as only a viewer;
- developers may add editing too early;
- visual authoring may become a second modeling system;
- unsupported domains may become editable through UI convenience.

## Mitigations

- document long-term authoring direction clearly;
- keep authoring in the roadmap;
- delay implementation;
- require patches and diffs;
- validate all changes through Core;
- keep unsupported domains read-only.

## Review Trigger

Review before beginning v0.8.0 or any earlier authoring-related experiment.
