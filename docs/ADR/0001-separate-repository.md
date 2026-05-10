# ADR-0001 — Separate Repository

## Status

Accepted for v0.0.0.

## Context

OrbitFabric Core is a Mission Data Contract framework focused on model definition, validation, scenario evidence, documentation and generated contract-facing artifacts.

OrbitFabric Studio has different concerns:

- local workspace interaction;
- user interface architecture;
- visual inspection;
- relationship navigation;
- graph rendering;
- diagnostic presentation;
- generated artifact inspection;
- scenario evidence inspection;
- future controlled authoring workflows.

Mixing these concerns into the OrbitFabric Core repository would weaken the boundary of the Core project and introduce UI-specific dependencies, release constraints and architectural pressures.

OrbitFabric Core must remain usable without Studio.

Studio must remain one possible downstream consumer of OrbitFabric outputs.

## Decision

OrbitFabric Studio will live in a separate repository.

Proposed repository:

```text
FAROTECH/orbitfabric-studio
```

## Consequences

OrbitFabric Studio may depend on OrbitFabric Core.

OrbitFabric Core must not depend on OrbitFabric Studio.

Studio may have a different dependency stack, release cadence and implementation lifecycle.

Core issues required by Studio must preserve the correct dependency direction.

Correct pattern:

```text
OrbitFabric Core exposes structured outputs.
Studio consumes and renders them.
```

Incorrect pattern:

```text
OrbitFabric Core becomes shaped around Studio UI convenience.
```

## Rationale

A separate repository preserves:

- Core architectural independence;
- UI dependency isolation;
- independent release cadence;
- clearer project identity;
- cleaner public communication;
- safer experimentation for Studio.

## Risks

- duplicated documentation between repositories;
- cross-repository coordination overhead;
- pressure to add Core workarounds inside Studio.

## Mitigations

- keep Charter, Roadmap and ADRs explicit;
- use Core-generated machine-readable outputs;
- open Core issues when Studio needs better structured data;
- avoid private Studio semantics.

## Review Trigger

Revisit this decision only if Studio becomes a small embedded viewer with no independent lifecycle, which is not the current direction.
