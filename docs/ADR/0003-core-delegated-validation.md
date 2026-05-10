# ADR-0003 — Core-delegated Validation

## Status

Accepted for v0.0.0.

## Context

Studio must show validation results and diagnostics.

However, validation is part of the OrbitFabric Core authority model.

Duplicating validation logic inside Studio would create two sources of truth.

The CLI and Studio could disagree.

This is unacceptable for a Mission Data Contract framework.

## Decision

Studio delegates validation to OrbitFabric Core.

Studio may invoke Core through:

- CLI command execution;
- sidecar process;
- local backend bridge;
- future stable API, if provided by Core.

Studio may display, group and navigate validation results.

Studio must not decide Mission Model validity independently.

## Consequences

Core validation output must remain the authority.

Studio diagnostics are presentation-layer objects.

Studio may group diagnostics by:

- severity;
- file;
- domain;
- entity;
- rule identifier;
- source location.

Only Core-provided or safely presentational metadata may be used.

Studio must preserve raw Core output access.

## Rationale

Validation is central to OrbitFabric trust.

A visual workbench can improve validation usability without owning validation semantics.

## Risks

- missing structured Core outputs may tempt local Studio inference;
- diagnostics may be reworded too aggressively;
- validation failure may be treated as application failure;
- users may trust Studio grouping more than Core output.

## Mitigations

- keep raw output visible;
- distinguish invalid model from app error;
- request better Core JSON reports where needed;
- avoid local validation rules;
- treat missing Core fields as Core enhancement candidates.

## Review Trigger

Revisit this ADR if OrbitFabric Core introduces a formal validation API.

The delegated-validation principle should remain unchanged.
