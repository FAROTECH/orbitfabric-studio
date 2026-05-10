# OrbitFabric Studio — Architecture Principles

## Architecture Thesis

OrbitFabric Studio is a downstream visual workbench.

OrbitFabric Core remains authoritative for mission semantics, validation, scenario evidence and generated artifacts.

## Conceptual Architecture

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

## Authority Boundary

OrbitFabric Core owns:

- Mission Model loading
- semantic validation
- lint rule execution
- scenario execution
- scenario evidence generation
- generated documentation
- generated runtime-facing bindings
- generated ground-facing artifacts
- future plugin semantics

Studio owns:

- user interface state
- project navigation
- visual representation
- diagnostic presentation
- artifact browsing
- graph rendering
- user interaction flows
- controlled editing workflows when introduced

## No Hidden Semantics

Studio must not implement hidden mission semantics.

Studio may derive visual state from OrbitFabric outputs, but those derivations must remain presentational.

When a view requires semantic information that the core does not expose, the preferred action is to add or improve a machine-readable OrbitFabric Core output.

## Adapter Layer

The Studio Adapter Layer is responsible for converting OrbitFabric outputs into UI-friendly structures.

The adapter layer may normalize:

- project summaries
- validation reports
- generated artifact manifests
- scenario evidence records
- runtime contract manifests
- ground export manifests

The adapter layer must not become a second model loader or second semantic validator.

## Correct Dependency Pattern

```text
OrbitFabric Core -> emits machine-readable contract outputs
Studio Adapter -> normalizes outputs for presentation
Studio UI -> renders and navigates outputs
```

## Incorrect Dependency Pattern

```text
Studio UI -> reads YAML -> invents semantic interpretation -> presents independent validation result
```

This pattern is forbidden because it creates drift.

## Initial Integration Model

The initial implementation direction is:

```text
Studio UI -> local shell/backend command -> orbitfabric CLI -> JSON/report/artifact output -> Studio Adapter -> UI state
```

Future implementations may use a more formal API if OrbitFabric Core exposes one.

## Local-first Direction

Studio should initially operate on local mission workspaces.

This fits the OrbitFabric development model and avoids premature cloud, account or collaboration concerns.

## Generated Artifacts

Generated artifacts must be clearly marked as generated.

Studio must make it clear whether the user is viewing:

- source Mission Model files
- derived reports
- generated documentation
- generated runtime bindings
- generated ground artifacts
- temporary UI state

## Version Compatibility

Studio should explicitly document which OrbitFabric Core versions it supports.

Before OrbitFabric Core v1.0, compatibility may remain experimental and best-effort.
