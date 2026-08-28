# Integration Plugin API v0 — reference-proven candidate

Status: **implemented candidate for #332; P1.A–P1.D reference proof complete; ADR 0002 accepted**  
Mother architecture: #325  
Builds on completed Phase 0B: #326

## 1. Purpose

OrbitFabric Studio already provides the generic integration path:

```text
Integration Package
  -> Projection Profile
  -> adapter_cli.v0 operation
  -> Integration Result
  -> generic Studio Integrations workspace
```

The Integration Plugin API exists only for **target-aware Studio UX that cannot be expressed well by the generic workspace alone**.

It does not define another integration model and does not replace the Integration Package.

The v0 forcing function is deliberately narrow:

> Given an explicit mapping and opaque target ref from an Integration Result, allow a compatible plugin contribution to present that target in an ecosystem-aware way and request a small set of Studio-gated actions.

The first and currently only contribution type is the **Target Continuity Inspector**.

---

## 2. Proven architecture

```text
OrbitFabric Core / Integration Package
        |
        | generic Phase 0B contracts
        v
Integration Result
  mapping.sources[]
  mapping.targets[]
  artifacts[].derived_from_mappings
        |
        v
Studio generic continuity UI
        |
        +-- always renders opaque target identity
        |
        +-- optional Integration Plugin dispatch
                |
                +-- target-aware presentation model
                +-- declarative action requests
                        |
                        v
                  Studio-owned gates
```

Normative distinction:

```text
Integration Package != Studio Integration Plugin
```

The Integration Package owns projection semantics, validation, artifact generation and target identities. The Studio plugin consumes those public records for presentation only.

---

## 3. Version identity

```ts
export type IntegrationPluginApiVersion = "0.1-candidate";
```

This version is independent from:

- Integration Package manifest version;
- Projection Profile version;
- Integration Result version;
- OrbitFabric Core package version;
- target ecosystem version.

---

## 4. Plugin definition

The bundled proof uses a TypeScript runtime representation:

```ts
export type IntegrationPluginDefinition = {
  apiVersion: IntegrationPluginApiVersion;
  plugin: {
    id: string;
    version: string;
    displayName: string;
  };
  compatibility: {
    integrationIds: string[];
  };
  contributions: {
    targetInspectors: IntegrationTargetInspectorContribution[];
  };
};
```

Rules:

- `plugin.id` is Studio-plugin identity, not Integration Package identity;
- `integrationIds` declares which ecosystem integration IDs the plugin knows how to present;
- plugin compatibility never changes the Phase 0B package/Core compatibility decision;
- duplicate plugin IDs and duplicate contribution IDs are rejected;
- multiple matching contributions are returned deterministically rather than silently collapsed.

No external plugin manifest, filesystem discovery or dynamic loader is defined by v0.

---

## 5. Public PluginContext after P1.D pruning

The initial design considered exposing selected mission entity, package descriptor, Profile, compatibility and freshness. The bundled OpenOBSW/OpenSVF forcing function did not need any of them.

They were therefore removed from the public API rather than retained speculatively.

The reference-proven context is:

```ts
export type IntegrationPluginContext = {
  readonly integration: {
    readonly id: string;
    readonly result: IntegrationResult | null;
  };
  readonly actions: IntegrationPluginActions;
};

export type IntegrationPluginActions = {
  openCoreEntity(ref: IntegrationCoreRef): Promise<void>;
  revealResultArtifact(artifactId: string): Promise<void>;
};
```

This is intentionally smaller than Studio's internal Phase 0B state.

The plugin does **not** receive:

```text
selectedEntity
Mission Model
raw mission YAML
IntegrationPackageDescriptor
Projection Profile
compatibility assessment
freshness assessment
private adapter IR
artifact file contents
filesystem/process/Tauri/reducer/localStorage access
```

If a future contribution demonstrates a real need for another public datum, it must be added deliberately and versioned intentionally.

---

## 6. Target Continuity Inspector

### 6.1 Input

```ts
export type IntegrationTargetInspectionInput = {
  readonly mapping: IntegrationMapping;
  readonly target: IntegrationTargetRef;
};
```

There is deliberately no singular `source` field.

`IntegrationMapping.sources[]` is the authoritative cardinality and supports one-to-one, one-to-many and many-to-one mappings. Studio and plugins must not promote the first source to an implicit primary source.

Studio supplies `mapping + target` directly from the explicit Integration Result. The contribution does not search Profile text or generated artifacts to infer mappings.

### 6.2 Contribution

```ts
export type IntegrationTargetInspectorContribution = {
  id: string;
  matches(input: IntegrationTargetInspectionInput): boolean;
  inspect(
    input: IntegrationTargetInspectionInput,
    context: IntegrationPluginContext,
  ): IntegrationTargetInspectionModel;
};
```

`matches()` is presentation dispatch only. A target-aware plugin may recognize namespace/kind tuples it owns; Studio Core continues to treat those tuples as opaque.

### 6.3 Presentation model

```ts
export type IntegrationTargetInspectionModel = {
  title: string;
  subtitle?: string;
  badges?: IntegrationInspectorBadge[];
  sections: IntegrationInspectorSection[];
  actions?: IntegrationInspectorAction[];
};
```

The model contains no HTML, React components or executable UI callbacks. Studio owns rendering, accessibility and layout.

---

## 7. Studio-gated actions

The reference proof exercises two declarative action kinds:

```ts
export type IntegrationInspectorAction =
  | {
      id: string;
      label: string;
      request: {
        kind: "open_core_entity";
        ref: IntegrationCoreRef;
      };
    }
  | {
      id: string;
      label: string;
      request: {
        kind: "reveal_result_artifact";
        artifactId: string;
      };
    };
```

Studio validates both before execution.

### `open_core_entity`

The requested Core ref must be one of the inspected `mapping.sources[]` entries.

A plugin cannot use this action as arbitrary Studio navigation.

### `reveal_result_artifact`

The requested artifact must:

1. exist in the current Integration Result; and
2. declare the inspected mapping ID in `derived_from_mappings`.

The v0 Studio implementation then reveals/focuses the already-rendered artifact row. It does not give the plugin an arbitrary local path and does not expose raw filesystem access.

---

## 8. Registry, zero-plugin fallback and failure isolation

The first implementation uses an in-process bundled registry.

Dispatch is:

```text
context.integration.id
        ↓
compatible plugin definitions
        ↓
matching Target Inspector contributions
        ↓
guarded matches()/inspect()
        ↓
Studio-rendered presentation model
```

Properties proved by logic tests:

- registry empty -> normal empty dispatch;
- incompatible integration IDs are filtered before contribution matching;
- multiple matches are deterministic and visible;
- exceptions in `matches()` or `inspect()` become contribution failures;
- a contribution failure does not invalidate the Integration Result;
- generic opaque target presentation remains available independently of plugins.

A plugin failure is a Studio extension/presentation failure, not a Core, adapter or Integration Result diagnostic.

---

## 9. Bundled OpenOBSW/OpenSVF reference contribution

The first bundled plugin is registered through the same public API under:

```text
plugin.id = orbitfabric-studio.openobsw-opensvf
integration.id = orbitfabric-openobsw-opensvf
```

It recognizes target tuples actually emitted by the reference Integration Package:

```text
openobsw / contract_symbol / <C symbol>
opensvf  / srdb_parameter / <SRDB name>
```

It does not teach Studio Core what those strings mean.

The contribution presents:

- target-aware title;
- opaque target identifier;
- explicit mapping ID;
- every Core source in `mapping.sources[]`;
- navigation actions for every mapping source;
- artifact reveal actions only when the Result explicitly links the mapping to the corresponding artifact.

Reference artifacts exercised today are:

```text
flight.mission_contract   kind=openobsw_contract_header
ground.opensvf_srdb       kind=opensvf_srdb_yaml
```

The reference plugin does not parse the generated C header or SRDB YAML, does not run OpenSVF and does not add YAMCS runtime behavior.

---

## 10. Real reference acceptance

The plugin proof is integrated into the existing real-reference CI path.

That CI:

1. checks out the pinned OpenOBSW/OpenSVF Integration Package;
2. checks out the pinned Core producer;
3. exports a real coherent Core Integration Input Set;
4. executes the real adapter through the Studio Rust runner;
5. parses and validates the real Integration Result through Studio contracts;
6. dispatches the bundled Studio plugin against the real Result target refs;
7. verifies target presentation, all mapping sources and Result-linked artifact actions.

This avoids a Studio-only synthetic semantic fixture as the acceptance authority.

---

## 11. Explicit v0 exclusions

The reference-proven v0 API does not expose:

```text
raw Mission YAML
Mission Model mutation
Projection Profile mutation
artifact-content read APIs
arbitrary filesystem read/write
process execution
shell execution
Tauri invoke passthrough
React reducer access
localStorage
private adapter IR
arbitrary HTML injection
arbitrary React component injection
runtime OpenOBSW/OpenSVF/YAMCS control
live telemetry
commanding
verification campaign execution
```

Absence from v0 is deliberate, not a claim that every capability is permanently forbidden.

---

## 12. Why no second contribution type is added yet

P1.D reviewed the surface actually exercised by the reference plugin.

The Target Inspector already proved:

- ecosystem-aware presentation;
- explicit Core-to-target continuity;
- multi-source handling;
- Studio-gated Core navigation;
- Studio-gated artifact reveal;
- deterministic dispatch;
- failure isolation.

Therefore there is no evidence-based need to add an artifact-inspector contribution, Profile-editor contribution or generic operation contribution to v0 yet.

Artifact-content inspection would require a controlled read service with containment, media-type and size policy. Profile editing would require an explicit authoritative write contract. Those boundaries should be designed only when a concrete feature needs them.

---

## 13. Implementation status

### P1.A — public types and registry

Implemented and tested:

- public API types;
- bundled registry;
- exact `integration.id` filtering;
- deterministic dispatch;
- zero-plugin fallback;
- guarded contribution failure isolation.

### P1.B — generic Target Inspector host

Implemented:

- generic host in Contract Continuity;
- opaque tuple fallback always retained;
- Studio-owned presentation rendering;
- Studio-gated action execution;
- dedicated minimal styling.

### P1.C — bundled OpenOBSW/OpenSVF reference contribution

Implemented and reference-tested against the real Integration Result.

### P1.D — API review gate

Completed in code/design:

- removed singular `input.source` assumption;
- preserved `mapping.sources[]` cardinality;
- removed selected mission entity from public context;
- removed package descriptor, Profile, compatibility and freshness from public context;
- retained only `integration.id`, current Result and two proven gated actions;
- decided not to add a second contribution family without new evidence.

ADR 0002 is accepted. Merge remains subject to the repository policy that all required CI checks pass on the exact final PR head.

---

## 14. Acceptance criteria

The v0 reference proof is acceptable when all of the following hold on the final head:

- `Integration Package != Studio Integration Plugin` remains enforceable in code;
- no target-specific field appears in Studio public plugin API types;
- the plugin receives only the minimal reference-proven context;
- generic target presentation works with zero plugins;
- the reference plugin improves presentation from explicit Result mappings only;
- many-to-one mappings do not acquire an implicit primary source;
- all privileged actions cross Studio-owned gates;
- plugin exceptions degrade only the contribution;
- no arbitrary external plugin execution is required;
- real reference CI passes without changing Core or Integration Result contracts.
