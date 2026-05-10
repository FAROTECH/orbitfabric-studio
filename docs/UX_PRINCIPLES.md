# OrbitFabric Studio — UX Principles

## 1. UX Thesis

OrbitFabric Studio is an engineering workbench, not a dashboard.

Its purpose is to reduce cognitive load while preserving engineering explicitness.

Studio should help users inspect, validate, navigate and understand OrbitFabric Mission Data Contracts without hiding the source model, the validation logic or the generated nature of derived artifacts.

The correct UX direction is:

```text
Contract first.
Evidence visible.
Validation explicit.
Provenance always clear.
```

---

## 2. Primary User Questions

Every Studio surface should answer at least one precise engineering question.

Examples:

- What is defined in this mission?
- Is the Mission Data Contract valid?
- Which file defines this entity?
- Which entities are connected?
- Which references are broken?
- Which assumptions are explicit?
- Which data product is produced by which payload?
- Which downlink intent is associated with which data product?
- Which contact windows support which downlink assumptions?
- Which generated artifact came from which source model area?
- Which scenario evidence supports this expected behavior?
- Which outputs can implementation or ground teams consume?
- What should be added to this contract?
- Is this proposed change valid?
- What will this edit modify in the Mission Model?
- Which generated artifacts may be affected by this change?
- Which scenarios or evidence should be regenerated after this edit?

A screen that does not answer a clear engineering question should not exist.

---

## 3. Contract First

The Mission Data Contract is the primary object of the interface.

Studio must not begin from generic files, generic diagrams or generic dashboards.

It must begin from contract entities and their relationships.

Preferred concepts:

- mission
- subsystem
- mode
- telemetry
- command
- event
- fault
- payload
- data product
- storage intent
- downlink intent
- contact window
- commandability rule
- autonomy rule
- scenario evidence
- generated artifact
- runtime binding
- ground export

Avoid generic UI concepts as primary framing:

- random file browser
- arbitrary graph editor
- generic YAML dashboard
- generic document viewer
- generic project explorer

The project may contain files, but Studio should expose the contract.

---

## 4. Source Awareness

The user must always know what kind of object they are looking at.

Studio must distinguish:

```text
source model      = authoritative user-authored Mission Model files
derived report    = OrbitFabric Core output derived from source model
generated output  = disposable artifact produced from the contract
UI state          = local representation used by Studio
```

This distinction should appear consistently in:

- project tree
- file viewer
- validation panel
- generated artifact explorer
- scenario evidence explorer
- graph view
- future editing workflows

The UI must not visually blur source files and generated outputs.

---

## 5. Provenance by Default

Every meaningful visual element should have provenance.

For any node, diagnostic, artifact, edge or evidence record, the user should eventually be able to answer:

```text
Where did this come from?
Which source file, Core report or generated artifact supports it?
Is it source, derived, generated or UI-only?
```

Preferred UI behavior:

- show source file when available;
- show line or entity reference when available;
- show report/artifact origin when available;
- show generated artifact provenance when available;
- show Core command that produced a report when useful.

A visual element without provenance should be treated as suspicious.

---

## 6. Validation Decides

Studio may present validation results.

OrbitFabric Core decides validity.

The UX must make validation explicit and visible.

Validation states should be clear:

```text
not validated
validating
valid
invalid
validation failed to run
Core unavailable
Core version unsupported
```

Invalid Mission Data Contracts should not be treated as application failures.

A validation failure is an engineering result.

A Studio crash is an application failure.

The UI must distinguish them.

---

## 7. Diagnostics Must Be Actionable

Diagnostics should help users move from problem to source context.

Where Core output supports it, diagnostics should include:

- severity
- rule identifier
- domain
- entity
- source file
- line/column
- short message
- longer explanation
- related entities
- suggested next inspection target

Studio must not invent fixes.

Studio may eventually present Core-provided suggestions, but they must be clearly marked as suggestions.

No hidden auto-fixes.

---

## 8. Evidence Over Decoration

Studio should prioritize engineering evidence over visual decoration.

Good visuals:

- clarify relationships;
- expose invalid references;
- show provenance;
- connect source model to generated artifacts;
- make scenario evidence navigable;
- reduce cognitive load;
- preserve technical explicitness.

Bad visuals:

- look impressive but explain little;
- imitate mission control;
- imply live telemetry;
- imply command authority;
- hide source model details;
- turn generated outputs into apparently authoritative data;
- obscure validation state.

If a visualization does not clarify a contract relationship, it should not be added.

---

## 9. No Fake Operations

Studio must not look like a live operations console.

The UI must not imply:

- live spacecraft telemetry;
- real command uplink;
- real pass execution;
- active ground station connectivity;
- onboard state synchronization;
- real-time fault response;
- mission control authority.

Scenario evidence views must clearly represent deterministic contract-level evidence, not live flight behavior.

Ground artifact views must clearly represent generated contract exports, not a ground segment.

---

## 10. Narrow Workflows Beat Broad Dashboards

Studio should favor narrow workflows over large generic dashboards.

Preferred workflows:

```text
Open mission -> inspect structure
Run validation -> inspect diagnostics
Select entity -> inspect source/provenance
Select artifact -> inspect generated output
Select scenario -> inspect evidence
Select relationship -> inspect source and derived meaning
```

Avoid early workflows such as:

```text
all-in-one dashboard
mission control overview
generic node editor
generic project management screen
cloud workspace home
live system status wall
```

The early product must feel precise, not broad.

---

## 11. Progressive Disclosure

Studio should not show every detail at once.

Recommended structure:

```text
overview -> domain list -> entity detail -> source/provenance -> related artifacts/evidence
```

The user should be able to start from a high-level contract view and drill down into exact source or generated output.

Progressive disclosure must not hide invalid states.

Errors and broken references should remain visible.

---

## 12. Read-only First, Not Read-only Forever

The initial UX is read-only by design.

Studio is not read-only by identity.

Studio is read-only by initial maturity strategy.

The first stable experience must be:

```text
Open -> Inspect -> Validate -> Understand
```

Editing and assisted authoring come later.

This protects the Mission Model and prevents Studio from becoming an unsafe visual model editor too early.

Read-only does not mean passive.

A read-only workbench can still be powerful if it exposes:

- contract structure;
- validation status;
- relationships;
- generated artifacts;
- evidence;
- provenance.

---

## 13. Controlled Authoring and Editing Later

Studio should eventually help users write and refine Mission Data Contracts.

When assisted authoring or editing is introduced, the UX must be patch-based and validation-gated.

Required authoring/editing flow:

```text
user action
    -> proposed patch
    -> visible diff
    -> explicit confirmation
    -> write to source model
    -> Core validation
    -> accepted/rejected state
```

The UI must never silently rewrite model semantics.

Unsupported domains must remain read-only.

Generated artifacts must not be edited directly.

Studio must not create a private visual model that bypasses the Mission Model.

The first editable domains should be limited and low-risk.

---

## 14. Graphs Must Explain, Not Decorate

Graph views are useful only if they explain contract relationships.

Each graph must define:

- what node types exist;
- what edge types exist;
- what Core output supports each relationship;
- what invalid state means;
- what optional absence means;
- how to trace a node or edge back to source.

Graph nodes may represent:

- source model entities;
- generated artifacts;
- derived report items;
- scenario evidence records;
- plugin-declared outputs, when supported.

Graph edges may represent:

- explicit model references;
- Core-reported relationships;
- artifact provenance;
- scenario evidence relationships.

Graph edges must not represent private Studio-only assumptions.

---

## 15. Generated Artifacts Must Look Generated

Generated artifacts must be visually distinct from source Mission Model files.

Studio should mark generated artifacts with clear labels such as:

```text
Generated
Derived
Runtime-facing output
Ground-facing output
Evidence output
```

Studio should discourage manual edits to generated files.

Where useful, Studio should guide the user back to the source model or generator command that produced the artifact.

---

## 16. Raw Output Remains Accessible

Studio should improve readability without hiding raw truth.

Where Studio renders Core outputs, it should preserve access to:

- raw command output;
- raw JSON report;
- raw generated file;
- raw scenario evidence;
- raw manifest.

This supports trust, debugging and engineering review.

Studio should not become a black box.

---

## 17. Error States Are First-class

Studio must handle error states explicitly.

Important states include:

- OrbitFabric executable not configured;
- OrbitFabric executable not found;
- unsupported Core version;
- invalid mission workspace;
- missing expected model file;
- failed validation;
- malformed Core output;
- generated artifact missing;
- stale generated artifact;
- scenario execution failed;
- plugin metadata invalid;
- internal Studio failure.

Each error state should be distinguishable.

Generic error messages should be avoided.

---

## 18. Local-first UX

Studio is initially local-first.

The UX should assume:

- local mission workspace;
- local files;
- local OrbitFabric Core invocation;
- local generated outputs;
- no user account;
- no cloud workspace;
- no remote collaboration;
- no hidden network dependency.

The application should remain useful offline.

---

## 19. Engineering Tone

Studio should use precise engineering language.

Preferred language:

- Mission Model
- Mission Data Contract
- source model
- validation
- diagnostic
- generated artifact
- derived report
- scenario evidence
- runtime-facing binding
- ground-facing export
- provenance
- contract relationship

Avoid premature or misleading language:

- live mission
- operator console
- command center
- real-time spacecraft
- ground control
- cloud mission platform
- AI mission designer
- automatic mission builder
- universal ground system
- Yamcs replacement
- OpenC3 replacement

The wording must protect project identity.

---

## 20. Visual Tone

Studio should look technical, calm and inspectable.

Preferred visual qualities:

- structured
- readable
- restrained
- dense but not cluttered
- graphically clear
- source-aware
- status-aware
- provenance-aware

Avoid:

- excessive animation;
- decorative space visuals;
- fake telemetry lights;
- fake cockpit panels;
- exaggerated neon dashboards;
- investor-demo aesthetic;
- visual metaphors that imply unsupported behavior.

The UI can be modern.

It must remain serious.

---

## 21. Navigation Model

A strong initial navigation model is:

```text
Workspace
  -> Contract Explorer
  -> Validation
  -> Generated Artifacts
  -> Scenario Evidence
  -> Graph Views
  -> Settings
```

Future navigation may evolve into three major workbench modes:

```text
Contract Explorer
Evidence Explorer
Integration Workbench
```

These modes should remain aligned with OrbitFabric Core capabilities.

---

## 22. Contract Explorer UX

The Contract Explorer should help users inspect what is defined.

Candidate surfaces:

- mission summary
- domain navigation
- entity lists
- entity detail panels
- source references
- related entities
- related diagnostics
- related generated artifacts
- related evidence

The Contract Explorer should not be a generic YAML file browser.

It should expose the contract structure.

---

## 23. Validation Workbench UX

The Validation Workbench should help users understand model health.

Candidate surfaces:

- validation status
- diagnostic list
- severity grouping
- domain grouping
- file grouping
- rule grouping
- source location links
- raw JSON report
- raw command output

Validation should be visible, repeatable and traceable.

---

## 24. Generated Artifact Explorer UX

The Generated Artifact Explorer should help users inspect outputs derived from the contract.

Candidate surfaces:

- generated documentation
- JSON reports
- runtime-facing bindings
- runtime manifests
- ground-facing exports
- ground manifests
- decoder skeletons, when available
- artifact provenance
- artifact freshness

Generated artifacts must not be confused with source model files.

---

## 25. Scenario Evidence Explorer UX

The Scenario Evidence Explorer should help users understand deterministic evidence.

Candidate surfaces:

- scenario list
- scenario metadata
- execution status
- timeline
- expected effects
- data-flow evidence
- passed expectations
- failed expectations
- generated evidence files
- raw evidence JSON
- raw scenario logs

The UX must clearly state that scenario evidence is not live spacecraft behavior.

---

## 26. Integration Workbench UX

The Integration Workbench should help implementation and ground-side users understand what OrbitFabric can export.

Candidate surfaces:

- runtime-facing bindings
- adapter interfaces
- command argument structs
- registries
- smoke validation outputs
- telemetry dictionaries
- command dictionaries
- event dictionaries
- fault dictionaries
- packet dictionaries
- decoder skeleton previews
- export manifests

The Integration Workbench must not imply that Studio is itself flight software or a ground segment.

---

## 27. Accessibility and Reviewability

Studio should be comfortable for engineering review.

This implies:

- readable typography;
- copyable text;
- exportable diagnostics;
- stable visual layout;
- keyboard-friendly navigation where practical;
- clear status labels;
- raw output access;
- minimal surprise behavior.

The UI should support careful inspection, not only quick demos.

---

## 28. UX Anti-patterns

The following are anti-patterns:

- hiding source files behind diagrams;
- treating generated artifacts as editable source;
- showing a green dashboard without validation provenance;
- displaying graph edges with unclear meaning;
- presenting scenario evidence as real telemetry;
- using mission-control language;
- adding AI-generated model changes without explicit patches;
- auto-fixing invalid models silently;
- building broad dashboards before narrow workflows;
- adding cloud/account UX before local workflows are mature.

---

## 29. v0.0 UX Exit Criteria

The UX baseline is acceptable for v0.0 only if it clearly establishes:

- Studio is an engineering workbench;
- the Mission Data Contract is the main object;
- source, derived, generated and UI state are distinct;
- validation is explicit;
- provenance is required;
- evidence matters more than decoration;
- early workflows are read-only by maturity strategy, not by final identity;
- assisted authoring and editing are delayed and validation-gated;
- no live operations are implied;
- the visual tone is serious and technical.
