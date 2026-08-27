# ADR 0002: Prove the Integration Plugin API before external plugin execution

**Status:** proposed  
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

The next product need is different: target-aware Studio presentation such as richer continuity inspection, artifact inspection and Profile editing assistance.

A Studio Integration Plugin can provide those capabilities, but introducing a general external plugin loader at the same time would combine two independent design problems:

1. defining the **public Studio extension API**;
2. safely loading and executing **third-party UI/plugin code**.

The second problem introduces trust, isolation, packaging, lifecycle, compatibility and failure-containment concerns that are not required to prove the first.

## Decision

Integration Plugin API v0 will be designed and proven **before** Studio enables arbitrary external plugin-code loading.

The first implementation will use one or more **bundled/in-tree reference contributions** that consume only the same constrained public plugin context intended for future external plugins.

Conceptually:

```text
Studio private internals
        X
        |
        | not exposed
        |
Studio public Integration Plugin API v0
        |
        +-- read-only typed context
        +-- declarative contribution registration
        +-- Studio-gated actions
        |
        v
Bundled reference contribution
(OpenOBSW/OpenSVF target-aware UX)
```

The reference contribution must not receive privileged access merely because it is bundled. It must exercise the public boundary rather than importing private application state or bypassing generic integration services.

External plugin discovery/loading/execution remains a **separate follow-on decision**. Enabling it requires an explicit review of the trust and runtime model and may require a subsequent ADR.

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

It also prevents the plugin runtime mechanism from shaping the API before the reference use case proves which contribution points are needed.

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

## Public-context principle

The bundled reference contribution must use a constrained context shaped around capabilities, not a mutable application singleton.

Candidate context families are:

```text
mission
  selected Core entity identity
  public entity / relationship navigation data

integration
  IntegrationPackageDescriptor
  current compatibility assessment
  Profile identity / validation state
  current Integration Result
  current freshness assessment

navigation
  request Core entity navigation
  request artifact reveal/open

operations
  request Studio-owned generic integration operations
```

Direct access to React reducer internals, Tauri internals, process spawning, arbitrary filesystem APIs, localStorage and private persistence is outside the v0 boundary.

## Contribution principle

v0 contribution points will be added only when justified by a concrete reference-plugin requirement.

The preferred first forcing function is a **target-aware Contract Continuity Inspector**:

```text
Core entity
  -> explicit generic Result mapping
  -> opaque target refs
  -> target-aware plugin presentation/actions
```

Studio Core continues to treat `namespace + kind + id` as opaque target identity. The bundled reference contribution may understand target namespaces/kinds it explicitly owns.

Other possible contribution families — artifact inspectors and schema-backed Profile editing assistance — should be admitted only after their data/action boundary is similarly explicit.

## Failure-isolation consequence

The generic Phase 0B Integrations workspace remains the baseline product path and must work with zero plugins/contributions enabled.

Failure or disablement of a reference contribution must not prevent:

- mission loading;
- normal mission exploration;
- package registration;
- generic Profile validation;
- generic adapter execution;
- generic Result inspection.

## Compatibility consequence

The public plugin API must be versioned independently from:

- OrbitFabric Core Integration contracts;
- Integration Package manifest versions;
- adapter versions;
- target ecosystem versions.

A future external plugin manifest may declare compatibility with the Studio plugin API and with one or more `integration.id` values, but it must not redefine package compatibility with Core inputs.

## Trust consequence

The following trust decisions remain separate:

```text
Integration Package manifest validation
!= Integration Package executable authorization
!= Studio plugin manifest validation
!= Studio plugin code execution authorization
```

This ADR makes no claim that a validated future plugin manifest is sufficient authorization to execute third-party plugin code.

## Acceptance for moving beyond bundled contributions

External plugin loading should not be implemented until the bundled reference contribution demonstrates that:

- the API provides useful target-aware UX without private Studio access;
- the generic Phase 0B path remains independent;
- target-specific fields have not leaked into Studio Core contracts;
- all privileged actions cross Studio-owned gates;
- plugin failure can be isolated;
- the contribution model is stable enough to version intentionally.

At that point Studio can make a separate, evidence-based decision about external plugin packaging and execution.
