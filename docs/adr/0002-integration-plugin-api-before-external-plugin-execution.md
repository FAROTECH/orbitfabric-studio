# ADR 0002: Prove the Integration Plugin API before external plugin execution

**Status:** accepted  
**Related:** #325, #326, #332

## Context

OrbitFabric Studio Phase 0B established and reference-accepted the generic integration boundary:

```text
OrbitFabric Core
  -> coherent Integration Input Set

External Integration Package
  -> static package manifest
  -> package-owned Projection Profile schema
  -> external adapter executable
  -> orbitfabric.adapter_cli.v0
  -> Integration Result

OrbitFabric Studio
  -> explicit package registration
  -> compatibility evaluation
  -> Profile association / validation
  -> execution authorization and Rust runner
  -> Result integrity / provenance / freshness
  -> generic Integrations workspace
```

The OpenOBSW/OpenSVF reference package is exercised through the actual Studio Rust runner in CI. Studio therefore already has an explicit external-code execution boundary for integration adapters.

The next product need is different: target-aware Studio presentation. A Studio Integration Plugin can provide that UX, but introducing a general external plugin loader at the same time would combine two independent design problems:

1. defining the **public Studio extension API**;
2. safely loading and executing **third-party UI/plugin code**.

The second problem introduces trust, isolation, packaging, lifecycle, compatibility and failure-containment concerns that are not required to prove the first.

## Decision

Integration Plugin API v0 is designed and proven **before** Studio enables arbitrary external plugin-code loading.

The first implementation uses a **bundled/in-tree reference contribution** that consumes only the constrained public plugin context.

Conceptually:

```text
Studio private internals
        X
        |
        | not exposed
        |
Studio public Integration Plugin API v0
        |
        +-- minimal read-only integration context
        +-- declarative contribution registration
        +-- Studio-gated actions
        |
        v
Bundled reference contribution
(OpenOBSW/OpenSVF target-aware UX)
```

The reference contribution receives no privileged access merely because it is bundled. It exercises the same public boundary rather than importing private application state or bypassing generic integration services.

External plugin discovery/loading/execution remains a **separate follow-on decision**. Acceptance of this ADR does not authorize arbitrary third-party plugin execution.

## Why this sequence

This order lets Studio answer the highest-value architectural question first:

> What extension surface is actually necessary for useful target-aware integration UX?

without prematurely committing to:

- arbitrary JavaScript/React module loading;
- dynamic native code;
- filesystem plugin scanning;
- plugin package installation conventions;
- signing;
- sandboxing;
- permissions;
- marketplace/distribution policy.

The implementation also allowed the candidate API to be reduced after evidence from the real reference use case, instead of preserving speculative surface.

## Integration Package boundary remains unchanged

This ADR does not turn Studio plugins into Integration Adapters.

The distinction remains:

```text
Integration Package != Studio Integration Plugin
```

Integration Packages continue to own:

- target projection semantics;
- Projection Profile schema;
- artifact generation;
- target-specific validation;
- adapter execution logic;
- explicit mappings, diagnostics, coverage and evidence records.

Studio Integration Plugins may consume those public records for presentation and may request Studio-owned actions, but they must not:

- parse Mission YAML as an integration shortcut;
- create a second mapping model;
- reconstruct mappings from artifact contents;
- invoke adapter executables directly;
- bypass execution authorization;
- write authoritative integration state outside the Profile/Package/Result contracts;
- interpret target IDs through assumptions hidden from the integration contract.

## Reference-proven public context

P1.D removed candidate fields that the bundled reference contribution did not need.

The accepted v0 boundary is intentionally small:

```text
integration
  integration.id
  current Integration Result

actions
  request Core entity navigation
  request Result artifact reveal
```

The implementation shape is conceptually:

```ts
IntegrationPluginContext {
  integration: {
    id
    result
  }
  actions: {
    openCoreEntity(ref)
    revealResultArtifact(artifactId)
  }
}
```

The plugin does not receive:

```text
selected mission entity
Mission Model
raw Mission YAML
IntegrationPackageDescriptor
Projection Profile
compatibility assessment
freshness assessment
private adapter IR
artifact file contents
React reducer internals
Tauri internals
process spawning
arbitrary filesystem APIs
localStorage / private persistence
```

A future contribution may justify extending this context, but such additions must be explicit and intentionally versioned.

## Contribution principle

v0 contribution points are admitted only when justified by a concrete reference-plugin requirement.

The first and currently only contribution family is a **target-aware Contract Continuity Inspector**:

```text
explicit Result mapping
  mapping.sources[]
  mapping.targets[]
        ↓
opaque target ref
        ↓
target-aware plugin presentation/actions
```

There is deliberately no singular implicit source. `mapping.sources[]` preserves the Integration Result cardinality, including many-to-one cases.

Studio Core continues to treat `namespace + kind + id` as opaque target identity. The bundled reference contribution may understand target namespaces/kinds it explicitly owns.

No second contribution family is added merely because artifact inspection or Profile editing may become useful later. Those features require their own explicit capability boundaries when a concrete need exists.

## Studio-gated actions

The accepted v0 proof exercises two declarative actions.

### Core entity navigation

A plugin may request navigation to a Core ref, but Studio accepts it only when that ref is one of the inspected mapping's explicit `sources[]` entries.

### Result artifact reveal

A plugin may request reveal of an artifact ID, but Studio accepts it only when:

1. the artifact exists in the current Integration Result; and
2. `derived_from_mappings` explicitly contains the inspected mapping ID.

The current implementation reveals/focuses the already-rendered artifact row. It does not expose an arbitrary local path or raw filesystem access to the plugin.

## Failure-isolation consequence

The generic Phase 0B Integrations workspace remains the baseline product path and works with zero plugins/contributions enabled.

The reference proof demonstrates that:

- empty registry is a normal state;
- incompatible integration IDs are filtered before contribution dispatch;
- multiple matches are deterministic;
- exceptions in plugin `matches()` or `inspect()` are isolated as contribution failures;
- plugin failure does not invalidate the Integration Result;
- generic opaque target presentation remains available independently of plugin success.

A Studio plugin failure is therefore not a Core, Integration Package, adapter or Integration Result diagnostic.

## Reference proof

The bundled OpenOBSW/OpenSVF contribution is registered through the public API and recognizes only target tuples actually emitted by the real reference Integration Package:

```text
openobsw / contract_symbol / <C symbol>
opensvf  / srdb_parameter / <SRDB name>
```

It presents explicit mapping identity and every `mapping.sources[]` entry, and requests artifact reveal only for Result-linked artifacts such as:

```text
flight.mission_contract
ground.opensvf_srdb
```

The reference acceptance path uses the real pinned Integration Package and Core producer, exports a real coherent Core Input Set, executes the adapter through the Studio Rust runner and consumes the real Integration Result through Studio contracts before dispatching the plugin.

CI run #276 on head `9a329e46782d230711e891373d6680588cd22b58` passed:

- Frontend build and Studio logic tests;
- Pinned Core acceptance matrix;
- Real reference Integration Package acceptance;
- Rust tests and check;
- Tauri production-path debug build.

## Compatibility consequence

The public plugin API is versioned independently from:

- OrbitFabric Core Integration contracts;
- Integration Package manifest versions;
- adapter versions;
- target ecosystem versions.

A future external plugin manifest may declare compatibility with the Studio plugin API and one or more `integration.id` values, but it must not redefine Integration Package compatibility with Core inputs.

## Trust consequence

The trust decisions remain separate:

```text
Integration Package manifest validation
!= Integration Package executable authorization
!= Studio plugin manifest validation
!= Studio plugin code execution authorization
```

This ADR makes no claim that a validated future plugin manifest is sufficient authorization to execute third-party plugin code.

## Consequence for future external plugins

The bundled proof has now demonstrated that:

- useful target-aware UX is possible without private Studio access;
- the generic Phase 0B path remains independent;
- target-specific fields have not leaked into Studio public contracts;
- privileged actions cross Studio-owned gates;
- plugin failure is isolated;
- the contribution model can be versioned intentionally.

Studio may therefore make a **separate, evidence-based architectural decision** about external plugin packaging, discovery, trust, isolation and execution.

That future decision is not made by this ADR.
