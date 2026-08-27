# Integration Plugin API v0 — candidate design

Status: **candidate design for #332**  
Mother architecture: #325  
Depends on completed Phase 0B: #326

## 1. Purpose

OrbitFabric Studio already provides the generic integration path:

```text
Integration Package
  -> Projection Profile
  -> adapter_cli.v0 operation
  -> Integration Result
  -> generic Studio Integrations workspace
```

The Integration Plugin API exists only for **target-aware user experience that cannot be expressed well by the generic workspace alone**.

It does not define another integration model and does not replace the Integration Package.

The first v0 forcing function is deliberately narrow:

> Given an explicit Core -> target mapping from an Integration Result, allow a compatible plugin contribution to present the target in an ecosystem-aware way and offer Studio-gated navigation/actions.

This document calls that contribution a **Target Continuity Inspector**.

---

## 2. Design principles

### 2.1 Generic truth remains outside the plugin

The plugin receives already-resolved generic contract objects:

```text
Core source ref
Integration Result mapping
opaque target ref
artifact / provenance references where available
```

It does not discover or reconstruct them.

### 2.2 Studio owns rendering

v0 contributions return a **presentation model**, not an arbitrary React component.

This keeps:

- layout and accessibility under Studio control;
- visual consistency under Studio control;
- the extension contract independent from React component internals;
- future isolation options open;
- plugin failure easier to contain.

### 2.3 Plugins request actions; Studio performs them

A plugin contribution may describe allowed actions, but does not receive filesystem/process/navigation internals.

```text
plugin contribution
  -> action request
  -> Studio validates capability + current context
  -> Studio performs or rejects action
```

### 2.4 No external plugin execution is required to prove v0

Per proposed ADR 0002, the first implementation should register a bundled/in-tree reference contribution through the same public API.

External plugin loading is a later runtime/trust decision.

---

## 3. Version identity

Candidate public API identity:

```ts
export type IntegrationPluginApiVersion = "0.1-candidate";
```

This version is independent from:

- Integration Package manifest version;
- Projection Profile version;
- Integration Result version;
- OrbitFabric Core package version;
- target ecosystem version.

A change to one does not imply a change to the others.

---

## 4. Plugin definition

For the bundled proof, the runtime representation may be TypeScript while preserving the shape a future static manifest can describe.

```ts
export interface IntegrationPluginDefinition {
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
}
```

Rules:

- `plugin.id` is Studio-plugin identity, not Integration Package identity;
- `integrationIds` identifies Integration Package ecosystems the plugin knows how to present;
- matching `integration.id` does **not** imply that the package itself is compatible with the current Core Input Set;
- package compatibility remains the Phase 0B compatibility decision;
- plugin compatibility never upgrades an incompatible package to compatible.

Future static plugin-manifest design may add Studio version compatibility and runtime metadata, but those are not required for the bundled API proof.

---

## 5. Public PluginContext

The public context is intentionally capability-scoped and read-only.

```ts
export interface IntegrationPluginContext {
  readonly mission: IntegrationPluginMissionContext;
  readonly integration: IntegrationPluginIntegrationContext;
  readonly actions: IntegrationPluginActions;
}
```

### 5.1 Mission context

```ts
export interface IntegrationPluginMissionContext {
  readonly selectedEntity: IntegrationCoreRef | null;
}
```

v0 does not expose the Mission Model, raw YAML or private Studio state.

Additional Core-owned read-only surfaces should be added only when a concrete contribution needs them.

### 5.2 Integration context

```ts
export interface IntegrationPluginIntegrationContext {
  readonly package: IntegrationPackageDescriptor;
  readonly profile: IntegrationProfileDocument | null;
  readonly result: IntegrationResult | null;
  readonly compatibility: IntegrationCompatibilityAssessment;
  readonly freshness: IntegrationFreshnessAssessment;
}
```

These are the existing generic Phase 0B models.

The plugin does not receive private adapter IR or generated-artifact contents automatically.

### 5.3 Studio-gated actions

```ts
export interface IntegrationPluginActions {
  openCoreEntity(ref: IntegrationCoreRef): Promise<void>;
  revealResultArtifact(artifactId: string): Promise<void>;
}
```

The implementation is Studio-owned. A plugin receives callable capability wrappers, not reducer/Tauri/filesystem access.

Candidate later actions, only if justified:

```text
requestIntegrationOperation(...)
openProfileLocation(...)
openEvidence(...)
```

No generic `executeCommand`, `spawn`, `readFile`, `writeFile` or arbitrary navigation API belongs in v0.

---

## 6. Target Continuity Inspector

### 6.1 Contribution identity and matching

```ts
export interface IntegrationTargetInspectorContribution {
  id: string;

  matches(input: IntegrationTargetInspectionInput): boolean;

  inspect(
    input: IntegrationTargetInspectionInput,
    context: IntegrationPluginContext,
  ): IntegrationTargetInspectionModel;
}
```

Input:

```ts
export interface IntegrationTargetInspectionInput {
  readonly source: IntegrationCoreRef;
  readonly mapping: IntegrationMapping;
  readonly target: IntegrationTargetRef;
}
```

Important:

- Studio supplies the source/mapping/target from the explicit Integration Result;
- the contribution does not search artifacts or Profile text to infer the mapping;
- `matches()` is presentation dispatch, not semantic discovery.

A plugin may recognize target namespaces/kinds it owns, for example conceptually:

```ts
return input.target.namespace === "opensvf"
    && input.target.kind === "parameter";
```

Studio Core itself remains unaware of what those strings mean.

### 6.2 Presentation model

```ts
export interface IntegrationTargetInspectionModel {
  title: string;
  subtitle?: string;
  badges?: IntegrationInspectorBadge[];
  sections: IntegrationInspectorSection[];
  actions?: IntegrationInspectorAction[];
}

export interface IntegrationInspectorSection {
  id: string;
  title?: string;
  rows: IntegrationInspectorRow[];
}

export interface IntegrationInspectorRow {
  label: string;
  value: string;
  emphasis?: "normal" | "strong" | "muted";
  monospace?: boolean;
}

export interface IntegrationInspectorBadge {
  label: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
}
```

The presentation model contains no HTML and no executable UI callbacks.

Studio decides how it renders these values.

### 6.3 Actions

Inspector actions are declarative requests:

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

Studio validates the request against the current Result/context before executing it.

A plugin cannot manufacture an arbitrary local path and ask Studio to reveal it through this API.

---

## 7. Registry and dispatch

The first implementation may use an in-process bundled registry:

```ts
registerIntegrationPlugin(definition: IntegrationPluginDefinition): void;
```

But the registry is an API proof, not a claim that arbitrary runtime registration is already safe.

Dispatch algorithm:

```text
current registered Integration Package
        ↓
find enabled plugin definitions compatible with integration.id
        ↓
for selected explicit target ref
        ↓
collect matching Target Inspector contributions
        ↓
execute contribution in guarded boundary
        ↓
Studio renders returned presentation model
```

Rules:

- zero matches is normal; generic target presentation remains available;
- multiple matches must be deterministic and visible rather than silently choosing one;
- a contribution exception becomes a plugin/contribution error state and falls back to generic presentation;
- plugin failure never invalidates the Integration Result itself.

---

## 8. Failure isolation

Bundled contribution execution must be guarded even before external plugins exist.

Conceptually:

```ts
try {
  model = contribution.inspect(input, publicContext);
  validateInspectionModel(model);
} catch (error) {
  recordContributionFailure(pluginId, contributionId, error);
  renderGenericTargetFallback();
}
```

The failure is a Studio extension/presentation failure, not:

- Core diagnostic;
- Integration Package diagnostic;
- adapter execution diagnostic;
- Integration Result diagnostic.

These ownership domains must not be conflated.

---

## 9. Reference OpenOBSW/OpenSVF contribution

The first bundled reference contribution should be intentionally small.

Candidate behavior:

```text
Input:
  Core telemetry source
  explicit Result mapping
  target {namespace: opensvf, kind: parameter, id: ...}

Output:
  title: OpenSVF parameter
  rows:
    Target ID       <opaque/displayed target id>
    Mapping         <mapping id>
    Source          telemetry:eps.obc.bus_voltage_mv

  action:
    Open Core entity
```

If the current reference Result provides an OpenOBSW contract-symbol target and an OpenSVF parameter target for the same mapping, Studio can show separate target inspector cards supplied by the same plugin.

The contribution must consume the real reference Integration Result used by Phase 0B acceptance.

The first proof does **not** need to parse SRDB files, run OpenSVF or add YAMCS runtime behavior.

---

## 10. Why the first API does not expose artifact contents

Artifact inspection is a strong second contribution candidate, but reading artifact contents immediately would require a new capability boundary:

```text
Result-declared artifact
  -> contained path verification
  -> explicit user/plugin request
  -> controlled text/binary read policy
  -> size/media-type limits
```

Phase 0B already validates artifact containment and digest. The plugin API should reuse that trust decision, not add a raw filesystem API.

Therefore artifact-content access is deferred until its controlled service is designed explicitly.

---

## 11. Why the first API does not expose Profile mutation

The Projection Profile is an authoritative version-controlled text file owned by the Integration Package schema.

A visual editor requires a write contract that preserves:

- YAML/JSON document integrity;
- schema validation;
- source-control friendliness;
- no hidden Studio-only mapping state;
- deterministic relation between UI edit and file edit.

That should be designed as a separate contribution/service after the read-only target-inspector boundary is proven.

---

## 12. Explicit v0 exclusions

Integration Plugin API v0 candidate does not expose:

```text
raw Mission YAML
Mission Model mutation
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

Absence from v0 is deliberate, not a statement that every capability is permanently forbidden.

---

## 13. Implementation slices

### P1.A — public types and registry

- introduce the public plugin API types;
- add bundled registry;
- add compatibility filter by `integration.id`;
- add guarded contribution dispatch;
- add unit tests proving zero-plugin fallback and failure isolation.

No target-specific code in this slice.

### P1.B — generic Target Inspector host

- add generic target-inspection area to Integrations continuity UI;
- render `IntegrationTargetInspectionModel`;
- dispatch matching contributions;
- keep existing generic tuple presentation as fallback.

Still no target-specific code in Studio Core.

### P1.C — bundled OpenOBSW/OpenSVF reference contribution

- register one bundled plugin definition through the public API;
- match target namespaces/kinds owned by the reference ecosystem;
- produce target-aware presentation models;
- validate against the real pinned reference Result fixture;
- prove no direct import of private Studio state.

### P1.D — API review gate

Before accepting ADR 0002 and before designing external plugin loading:

- review which API members the reference contribution actually used;
- remove speculative members;
- document failure/trust behavior;
- verify generic Phase 0B works with registry empty;
- decide whether a second contribution type is justified.

---

## 14. Acceptance criteria for this candidate

The design is ready for implementation when:

- `Integration Package != Studio Integration Plugin` remains enforceable in code;
- the first plugin context contains only existing generic Phase 0B contracts plus Studio-gated actions;
- no target-specific field appears in public Studio API types;
- the generic UI can render targets without any plugin;
- a plugin can improve target presentation from explicit Result mappings only;
- a plugin exception degrades only its contribution;
- no arbitrary external plugin execution is required to prove the API;
- the reference contribution can be tested against the real Phase 0B fixture without changing Core or Integration Result contracts.
