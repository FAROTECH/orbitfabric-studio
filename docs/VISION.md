# OrbitFabric Studio — Vision

## 1. Mission

Make Mission Data Contracts inspectable, understandable and progressively authorable through a disciplined visual engineering workbench.

OrbitFabric Studio exists to help users see, validate, navigate, reason about and eventually refine OrbitFabric Mission Data Contracts without replacing OrbitFabric Core or weakening the authority of the Mission Model.

The Mission Model remains the source of truth.

OrbitFabric Core remains authoritative for validation, scenario evidence and generated artifacts.

Studio makes the contract visible.

Studio does not become the contract authority.

---

## 2. Vision Statement

OrbitFabric Studio turns the OrbitFabric Mission Data Contract into an inspectable engineering surface.

It helps users move from scattered model files, validation reports, generated artifacts and scenario evidence to a coherent view of what the mission contract defines, how its entities relate, which assumptions are explicit and which outputs can be consumed by implementation or ground-side teams.

The long-term vision is not a decorative GUI.

The long-term vision is a local-first workbench for model-first spacecraft mission data engineering.

---

## 3. Core Idea

OrbitFabric Core defines, validates and generates.

OrbitFabric Studio helps humans understand and interact with what Core defines, validates and generates.

The essential relationship is:

```text
OrbitFabric Core = contract engine
OrbitFabric Studio = contract workbench
```

The Core can exist without Studio.

Studio cannot be meaningful without Core.

---

## 4. What Studio Should Help Users Do

Studio should progressively help users:

```text
Open a mission.
Understand what is defined.
Validate the contract.
Inspect diagnostics.
Navigate contract entities.
Visualize relationships.
Inspect generated artifacts.
Inspect scenario evidence.
Understand integration-facing outputs.
Propose controlled changes.
Validate those changes.
Refine the contract safely.
```

The first product loop is:

```text
Open -> Inspect -> Validate -> Understand
```

The long-term product loop becomes:

```text
Understand -> Propose Change -> Review Patch -> Validate -> Regenerate -> Inspect Impact
```

This evolution is deliberate.

Studio is not read-only by identity.

Studio is read-only by initial maturity strategy.

---

## 5. Why Studio Exists

As OrbitFabric evolves, the Mission Data Contract spans multiple domains:

- spacecraft
- subsystems
- modes
- telemetry
- commands
- events
- faults
- payloads
- data products
- storage intent
- downlink intent
- contact windows
- commandability
- autonomy
- scenario evidence
- runtime-facing bindings
- ground-facing artifacts
- future plugins and extensions

These domains form a contract graph.

A user can inspect the raw YAML files.

A user can run lint.

A user can generate documentation.

A user can inspect generated artifacts.

But as the model grows, the hard part becomes understanding relationships, provenance, diagnostics, evidence and impact.

Studio exists to make those relationships visible and reviewable.

---

## 6. What Studio Is Not

Studio is not:

- the OrbitFabric Core;
- an alternative Mission Model format;
- a second validator;
- a flight software framework;
- an OBC runtime;
- a ground segment;
- a mission control system;
- a live telemetry dashboard;
- a command uplink console;
- a spacecraft simulator;
- a CCSDS/PUS/CFDP implementation;
- a Yamcs/OpenC3 replacement;
- a generic YAML IDE;
- a generic diagramming tool;
- a cloud collaboration platform.

These are not temporary limitations.

They protect the identity of the project.

---

## 7. Design Philosophy

The design philosophy is:

```text
Text remains authoritative.
Visuals explain.
Validation decides.
Provenance is mandatory.
Generated artifacts are disposable.
Editing is explicit.
```

This means:

- the Mission Model remains the source of truth;
- visual surfaces must trace back to model entities or Core outputs;
- validation status must be explicit;
- generated artifacts must be clearly marked as generated;
- future edits must be visible as patches or diffs;
- Studio must never hide or override Core diagnostics.

---

## 8. Human Problem

The human problem is not that YAML is bad.

The human problem is that mission data contracts become difficult to reason about when relationships span many files, reports and generated outputs.

Users need to answer questions such as:

- What is defined in this mission?
- Which subsystem owns this telemetry?
- Which command affects which expected data product?
- Which payload produces which data product?
- Which storage intent applies to this product?
- Which downlink intent depends on which contact assumptions?
- Which generated artifact exposes this information to runtime or ground-side consumers?
- Which scenario evidence supports this behavior?
- Which validation rule failed?
- Which source file should be inspected?
- What will change if this contract element is modified?

Studio exists to make these questions answerable.

---

## 9. Intended Workbench Modes

Long term, Studio should evolve around three major workbench modes.

---

## 9.1 Contract Explorer

The Contract Explorer helps users understand what the Mission Data Contract defines.

Candidate capabilities:

- mission summary
- domain navigation
- entity lists
- entity details
- source file references
- direct relationships
- related diagnostics
- related generated artifacts
- related scenario evidence

Primary questions:

```text
What is defined?
Where is it defined?
Is it valid?
What is it connected to?
What generated outputs depend on it?
```

The Contract Explorer is not a generic file browser.

It is a contract navigation surface.

---

## 9.2 Evidence Explorer

The Evidence Explorer helps users understand deterministic scenario evidence.

Candidate capabilities:

- scenario list
- scenario metadata
- execution status
- scenario timeline
- expected effects
- data-flow evidence
- passed expectations
- failed expectations
- generated evidence files
- raw evidence JSON
- raw scenario logs

Primary questions:

```text
What scenario was executed?
What contract behavior was exercised?
Which expectations passed?
Which expectations failed?
Which data-flow assumptions were demonstrated?
```

The Evidence Explorer is not a spacecraft simulator.

It is not live telemetry.

It is not mission operations.

It is a deterministic evidence inspection surface.

---

## 9.3 Integration Workbench

The Integration Workbench helps implementation and ground-side users inspect what OrbitFabric can export.

Candidate capabilities:

- runtime-facing bindings
- adapter interfaces
- command argument structs
- registries
- generated documentation
- generated reports
- telemetry dictionaries
- command dictionaries
- event dictionaries
- fault dictionaries
- packet dictionaries
- decoder skeleton previews
- ground export manifests

Primary questions:

```text
What can implementation teams consume?
What can ground-side teams consume?
Which generated artifact came from which contract entity?
Which outputs are experimental?
Which outputs are stable?
```

The Integration Workbench is not a flight software runtime.

It is not a ground segment.

It is an artifact inspection and provenance surface.

---

## 10. Assisted Authoring Direction

Studio should eventually help users write and refine Mission Data Contracts.

This is part of the long-term vision.

However, assisted authoring must be introduced only after inspection, validation, navigation and artifact/evidence views are reliable.

The correct authoring model is:

```text
User intent
    -> proposed Mission Model patch
    -> visible diff
    -> explicit confirmation
    -> write to source model
    -> OrbitFabric Core validation
    -> accepted/rejected result
```

Studio must not create a private visual model.

Studio must not hide YAML changes.

Studio must not invent semantics.

Studio must not silently repair invalid contracts.

Authoring assistance is acceptable only if the Mission Model remains authoritative and OrbitFabric Core remains the validation authority.

---

## 11. Relationship Visualization Direction

Studio should eventually visualize contract relationships.

Examples:

```text
Payload -> Data Product -> Storage Intent -> Downlink Intent -> Contact Window -> Ground Export

Command -> Expected Effects -> Data Flow Evidence

Mode -> Allowed Commands -> Autonomy Rules -> Recovery Intent

Telemetry -> Packets -> Ground Dictionary -> Decoder Skeleton

Fault -> Event -> Recovery Intent -> Scenario Evidence
```

These graphs must explain engineering relationships.

They must not be decorative.

Every node and edge must be traceable to:

- source Mission Model entities;
- Core-derived reports;
- generated artifacts;
- scenario evidence;
- future plugin-declared outputs.

A graph relationship that cannot be explained should not be displayed as engineering truth.

---

## 12. Generated Artifact Direction

Generated artifacts are important but not authoritative.

Studio should make generated artifacts easier to inspect, but should always mark them as generated.

Users should be able to understand:

- what was generated;
- when it was generated, where possible;
- which Core command produced it;
- which source model entities influenced it;
- whether it is runtime-facing, ground-facing, documentation, report or evidence;
- whether it is experimental or stable.

Studio must discourage manual edits to generated outputs.

The source model should be changed instead.

---

## 13. Validation and Diagnostics Direction

Validation must be a first-class UX concept.

Studio should make it easy to see:

- whether the mission has been validated;
- whether validation passed;
- whether validation failed;
- whether Core could not run;
- whether the Core version is unsupported;
- which diagnostics exist;
- which source files or entities are involved;
- which generated outputs may be affected.

Studio should preserve raw Core output for review.

Studio must not turn Core validation into a black box.

---

## 14. Local-first Direction

Studio should begin as a local-first workbench.

The expected initial operating model is:

```text
local OrbitFabric mission workspace
local OrbitFabric Core invocation
local reports
local generated artifacts
local inspection state
```

This is deliberate.

It avoids premature cloud, account, collaboration and hosting concerns.

Studio should remain useful offline.

---

## 15. Technology Direction

The initial technology direction is a local desktop workbench.

Candidate stack:

```text
Tauri
React
TypeScript
React Flow
Monaco Editor
OrbitFabric CLI or sidecar invocation
```

This direction supports:

- local filesystem access;
- rich visual UI;
- source/model inspection;
- relationship graph rendering;
- local invocation of OrbitFabric Core;
- future desktop packaging.

This is a direction, not yet a binding implementation commitment.

v0.0 does not include an application scaffold.

---

## 16. Long-term User Profiles

Studio may serve several user types.

---

## 16.1 Mission/Data Contract Author

Needs to:

- inspect the model;
- understand entities;
- validate changes;
- eventually use assisted authoring;
- see the impact of contract changes.

---

## 16.2 Flight Software / Runtime Developer

Needs to:

- inspect runtime-facing bindings;
- understand command and telemetry contracts;
- inspect adapter interfaces;
- trace generated runtime artifacts back to source contract entities.

---

## 16.3 Ground Integration Engineer

Needs to:

- inspect telemetry dictionaries;
- inspect command dictionaries;
- inspect packet definitions;
- inspect decoder skeletons;
- understand ground-facing exports;
- distinguish experimental from stable artifacts.

---

## 16.4 Systems Engineer / Reviewer

Needs to:

- understand mission assumptions;
- review explicit contract definitions;
- inspect validation status;
- inspect scenario evidence;
- assess consistency across domains.

---

## 17. Product Tone

Studio should feel:

- serious;
- technical;
- explicit;
- traceable;
- calm;
- engineering-oriented;
- local-first;
- evidence-driven.

Studio should not feel:

- promotional;
- SaaS-like;
- fake operational;
- dashboard-first;
- investor-demo oriented;
- graphically impressive but semantically vague.

The product should earn trust through clarity, not spectacle.

---

## 18. Evolution Strategy

The evolution strategy is:

```text
v0.0  define the foundation
v0.1  inspect real mission workspaces
v0.2  expose validation and diagnostics
v0.3  navigate contract entities
v0.4  visualize relationships
v0.5  inspect generated artifacts
v0.6  inspect scenario evidence
v0.7  inspect ground-facing artifacts
v0.8  introduce controlled authoring/editing
v0.9  become plugin-aware
v1.0  stabilize the workbench
```

This order is intentional.

It prevents Studio from becoming a visual editor before it has proven that it can faithfully inspect and validate the contract.

---

## 19. Success Criteria

Studio succeeds if it makes OrbitFabric more understandable without making it less rigorous.

Success means:

- users understand the Mission Data Contract faster;
- validation failures are easier to inspect;
- relationships become easier to reason about;
- generated artifacts are easier to trace;
- scenario evidence becomes easier to review;
- implementation and ground-facing outputs are easier to consume;
- controlled authoring eventually becomes safer than manual edits for selected domains;
- Core authority remains intact.

Studio fails if it becomes:

- a second Core;
- a visual model format;
- a fake mission control system;
- a ground segment;
- a decorative dashboard;
- a source of semantic drift.

---

## 20. Vision Summary

OrbitFabric Studio is the visual workbench for OrbitFabric Mission Data Contracts.

It starts by helping users inspect and validate what exists.

It grows into helping users understand relationships, evidence and generated artifacts.

It may eventually help users author and refine contracts through explicit, reviewable and validation-gated changes.

It must never replace the Mission Model.

It must never replace OrbitFabric Core.

It must make mission semantics inspectable without becoming the authority that creates them.
