# OrbitFabric Studio — Roadmap

OrbitFabric Studio is an experimental visual workbench for OrbitFabric Mission Data Contracts.

Studio exists to make the Mission Data Contract easier to inspect, validate, navigate and understand without replacing OrbitFabric Core or redefining mission semantics.

The Mission Model remains the source of truth.

OrbitFabric Core remains authoritative for validation, scenario evidence and generated artifacts.

Studio is downstream.

---

## Roadmap Philosophy

OrbitFabric Studio grows through narrow, inspectable, validation-aligned vertical slices.

The intended growth path is:

```text
charter
  -> read-only inspection
  -> validation visibility
  -> contract navigation
  -> relationship visualization
  -> generated artifact inspection
  -> scenario evidence inspection
  -> ground artifact inspection
  -> controlled authoring and editing
  -> plugin-aware surfaces
  -> stable workbench
```

The first product loop is deliberately simple:

```text
Open -> Inspect -> Validate -> Understand
```

This does not mean that Studio is only a post-processing viewer for already-completed contracts.

Studio is not read-only by identity.

Studio is read-only by initial maturity strategy.

Editing and assisted authoring are intentionally delayed because Studio must first prove that it can load, inspect, validate and explain an OrbitFabric mission workspace without introducing semantic drift.

---

## Core Alignment Rule

Studio follows OrbitFabric Core maturity.

Studio must not expose stable workflows for unstable Core surfaces unless they are clearly marked experimental.

Studio may request better machine-readable outputs from OrbitFabric Core.

Studio must not compensate for missing Core outputs by duplicating validation, model loading or semantic interpretation logic.

Correct pattern:

```text
OrbitFabric Core emits a structured output.
Studio consumes and renders it.
```

Incorrect pattern:

```text
Studio reimplements Core semantics because the required output is missing.
```

---

## Source / Derived / Generated Discipline

Every Studio milestone must preserve a clear distinction among:

```text
source model      = authoritative Mission Model files
derived report    = OrbitFabric Core output derived from the source model
generated output  = disposable artifact generated from the contract
UI state          = local Studio representation
```

A user must always understand which category they are looking at.

---

## Release Status Legend

```text
Planned        = part of the intended roadmap
Experimental   = may change significantly
Stable target  = expected to become part of the v1.0 workbench
Completed      = implemented and documented
Deferred       = intentionally postponed
Out of scope   = not part of Studio identity
```

---

# v0.0.0 — Studio Charter

Status: Completed  
Nature: documentation-only  
Implementation: released

## Goal

Define why Studio exists, what it is not, how it relates to OrbitFabric Core, and which architectural and UX principles govern future development.

## Deliverables

- `README.md`
- `ROADMAP.md`
- `CHANGELOG.md`
- `docs/CHARTER.md`
- `docs/VISION.md`
- `docs/NON_GOALS.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_BOUNDARIES.md`
- `docs/UX_PRINCIPLES.md`
- `docs/RISK_REGISTER.md`
- initial ADRs
- `mockups/README.md`
- `examples/README.md`

## Explicit Non-goals

- no runnable application
- no frontend scaffold
- no package manager setup
- no Tauri/Electron/React project
- no fake screenshots
- no mock operational console
- no product claims
- no compatibility claims

## Exit Criteria

v0.0.0 is complete only when:

1. the repository clearly explains why Studio exists;
2. the repository clearly explains what Studio is not;
3. the relationship with OrbitFabric Core is unambiguous;
4. the Mission Model is declared as the source of truth;
5. Studio is defined as downstream, not authoritative;
6. validation is delegated to OrbitFabric Core;
7. UX principles are documented;
8. architectural boundaries are documented;
9. project risks are documented;
10. v0.1.0 is narrow and executable.

---

# v0.1.0 — Read-only Mission Project Viewer

Status: Completed  
Nature: first application slice  
Primary loop: Open -> Inspect

## Goal

Open an existing OrbitFabric mission workspace and inspect its structure without editing it.

This release proves that Studio can operate on a real OrbitFabric project without becoming a second model engine.

## Implemented Capabilities

- open a local OrbitFabric mission directory
- detect expected Mission Model files
- display source files in read-only mode
- detect scenario source files
- detect generated artifact directories
- show generated and derived locations
- show source, scenario, derived and generated labels
- invoke OrbitFabric Core through controlled local command paths
- run `orbitfabric --version`
- run `orbitfabric inspect mission <mission_dir>`
- show raw command result status

## OrbitFabric Core Surfaces Consumed

- mission workspace layout
- Mission Model files
- generated reports, if already present
- generated documentation, if already present
- fixed Core status and inspection commands

## Explicit Non-goals

- no editing
- no visual model editing
- no graph view
- no scenario runner
- no generator workbench
- no plugin support
- no independent model validation
- no deep semantic parsing inside Studio

## Exit Criteria

v0.1.0 is complete only when Studio can:

1. open a local OrbitFabric mission directory;
2. display the mission file structure;
3. display source files read-only;
4. identify generated artifact locations;
5. invoke a basic OrbitFabric Core command;
6. avoid duplicating Core semantic logic.

---

# v0.2.0 — Validation and Diagnostics Workbench

Status: Completed  
Nature: validation visibility slice  
Primary loop: Open -> Inspect -> Validate -> Understand

## Goal

Make OrbitFabric validation results first-class and inspectable.

This release turns validation from a terminal-only operation into a structured engineering surface.

## Implemented Capabilities

- run Core lint on demand through a fixed command
- display validation pass, warning or failure status from Core JSON
- display Core JSON report path and availability
- display structured diagnostics from the Core JSON lint report
- display errors, warnings and info counts
- display finding severity, code, message, file, domain, object ID and suggestion
- open related source model files read-only when the Core-provided file reference exactly matches a known source model file
- preserve raw stdout, stderr and exit code access for transparency
- distinguish source model files from derived validation reports
- distinguish Studio structural inspection from Core validation result

## OrbitFabric Core Surfaces Consumed

- `orbitfabric lint <mission_dir> --json <path>`
- JSON lint report
- diagnostic messages
- rule identifiers
- file references when available
- validation result
- summary counts
- model and Core version fields

## Explicit Non-goals

- no independent validation rules
- no hidden diagnostic inference
- no stdout diagnostics scraping when JSON exists
- no automatic fixes
- no suppressions
- no model mutation
- no editing
- no graph view
- no scenario runner
- no generator workflow
- no ground artifact generation UI
- no ground artifact explorer
- no line or column navigation unless Core later provides line or column metadata

## Exit Criteria

v0.2.0 is complete only when Studio can:

1. run Core validation;
2. show the validation result clearly;
3. display diagnostics without inventing them;
4. preserve access to raw Core output;
5. distinguish source files from derived validation reports.

---

# v0.3.0 — Contract Navigation Surface

Status: Planned  
Nature: structured navigation slice  
Primary loop: Open -> Inspect -> Navigate

## Goal

Provide domain-aware navigation across Mission Data Contract entities without yet rendering full visual graphs.

This release is deliberately placed before graph visualization to avoid premature diagram complexity.

## Candidate Capabilities

- navigate by domain:
  - spacecraft
  - subsystems
  - modes
  - telemetry
  - commands
  - events
  - faults
  - payloads
  - data products
  - contacts
  - policies/autonomy
- show entity lists
- show entity detail panels
- show direct references where Core output exposes them
- show source location for each entity where available
- show generated artifacts related to an entity where available

## OrbitFabric Core Surfaces Consumed

- source Mission Model files
- structured model summary, if available
- generated reports
- generated documentation
- any future entity index or manifest exported by Core

## Explicit Non-goals

- no graph rendering yet
- no editing
- no private reference resolver
- no semantic enrichment beyond Core outputs
- no search/index engine beyond local presentation needs

## Exit Criteria

v0.3.0 is complete only when Studio can:

1. present contract entities by domain;
2. show useful detail views;
3. link entities to source files or reports where available;
4. avoid becoming an independent Mission Model parser.

---

# v0.4.0 — Mission Model Graph

Status: Planned  
Nature: relationship visualization slice  
Primary loop: Navigate -> Visualize -> Explain

## Goal

Visualize relationships among Mission Data Contract entities.

This is the first release where Studio becomes visibly more than a structured file/report viewer.

## Candidate Capabilities

- subsystem relationship graph
- telemetry relationship graph
- command relationship graph
- payload to data-product graph
- data-product to storage/downlink/contact graph
- commandability/autonomy relationship graph
- node detail panel
- edge explanation panel
- filtering by domain
- highlighting of invalid or missing relationships where reported by Core

## OrbitFabric Core Surfaces Consumed

- structured model summary
- entity references
- validation reports
- generated data-flow reports
- generated documentation
- future relationship manifest, if introduced by Core

## Explicit Non-goals

- no drag-and-drop model editing
- no private graph semantics
- no graph-based validation
- no simulator behavior
- no mission-control layout
- no fake live data

## Exit Criteria

v0.4.0 is complete only when Studio can:

1. render at least one meaningful contract relationship graph;
2. trace graph nodes back to source entities or Core outputs;
3. explain visible relationships without inventing semantics;
4. clearly distinguish invalid relationships from absent optional ones where Core provides that distinction.

---

# v0.5.0 — Generated Artifact Explorer

Status: Planned  
Nature: artifact inspection slice  
Primary loop: Generate -> Inspect -> Trace

## Goal

Inspect OrbitFabric-generated artifacts through a structured UI.

This release reinforces the idea that generated artifacts are derived from the Mission Data Contract and remain disposable.

## Candidate Capabilities

- generated documentation viewer
- generated data-flow documentation viewer
- runtime-facing binding artifact browser
- runtime contract manifest viewer
- generated file classification
- generated-vs-source distinction
- artifact provenance display
- artifact freshness indication where possible

## OrbitFabric Core Surfaces Consumed

- generated Markdown documentation
- generated JSON reports
- generated data-flow evidence reports
- generated runtime-facing bindings
- runtime contract manifest
- generated artifact manifests, if available

## Explicit Non-goals

- no generated code editing inside Studio
- no user-code merge logic
- no runtime execution claim
- no build-system integration claim
- no flight software claim

## Exit Criteria

v0.5.0 is complete only when Studio can:

1. list generated artifacts;
2. classify generated artifacts;
3. display generated artifacts without implying they are authoritative source files;
4. trace artifacts back to the Mission Data Contract where possible.

---

# v0.6.0 — Scenario Evidence Explorer

Status: Planned  
Nature: evidence inspection slice  
Primary loop: Run Scenario -> Inspect Evidence -> Understand Contract Behavior

## Goal

Make deterministic scenario evidence navigable.

This release should turn OrbitFabric scenario outputs into an inspectable evidence trail.

## Candidate Capabilities

- list available scenarios
- run a scenario through OrbitFabric Core
- display scenario execution status
- display scenario timeline
- display data-flow evidence records
- display command expected effects
- display produced or expected data products
- display passed expectations
- display failed expectations
- open generated evidence files
- export evidence inspection snapshots

## OrbitFabric Core Surfaces Consumed

- scenario files
- scenario runner command
- generated scenario logs
- generated evidence JSON
- generated evidence Markdown
- data-flow evidence reports

## Explicit Non-goals

- no dynamic spacecraft simulator
- no orbital simulation
- no RF simulation
- no payload physics simulation
- no live runtime execution
- no real onboard state
- no real ground pass execution

## Exit Criteria

v0.6.0 is complete only when Studio can:

1. discover scenarios;
2. invoke Core scenario execution;
3. display evidence generated by Core;
4. distinguish deterministic evidence from real flight behavior;
5. avoid simulator or operations claims.

---

# v0.7.0 — Ground Integration Artifact Viewer

Status: Planned  
Nature: ground-facing artifact inspection slice  
Primary loop: Generate Ground Artifacts -> Inspect -> Trace

## Goal

Inspect ground-facing contract exports produced by OrbitFabric Core.

This release aligns Studio with the future ground integration direction of the Core project while preserving the boundary that Studio is not a ground segment.

## Candidate Capabilities

- mission database export viewer
- telemetry dictionary viewer
- command dictionary viewer
- event dictionary viewer
- fault dictionary viewer
- data product dictionary viewer
- packet dictionary viewer
- decoder skeleton preview
- ground export manifest viewer
- artifact provenance display
- prototype/experimental/stable status display

## OrbitFabric Core Surfaces Consumed

- ground-facing generated artifacts
- dictionary exports
- decoder skeletons
- packet dictionaries
- ground export manifests
- compatibility metadata, if implemented by Core

## Explicit Non-goals

- no live ground segment
- no mission control system
- no command uplink service
- no telemetry archive
- no live decoder
- no Yamcs/OpenC3 replacement
- no compatibility claim unless implemented, tested and documented

## Exit Criteria

v0.7.0 is complete only when Studio can:

1. inspect ground-facing artifacts generated by Core;
2. clearly label prototype and experimental outputs;
3. avoid implying live ground operations;
4. avoid unsupported compatibility claims.

---

# v0.8.0 — Controlled Contract Authoring Preview

Status: Planned  
Nature: limited editing slice  
Primary loop: Inspect -> Edit Patch -> Validate -> Accept/Reject

## Goal

Introduce limited validation-gated authoring and editing for selected low-risk Mission Model domains.

This is the first milestone where Studio may help users write or modify source Mission Model files.

The purpose is not to create a parallel visual model format. The purpose is to assist users in producing explicit Mission Model changes that OrbitFabric Core can validate.

## Candidate Capabilities

- controlled YAML patch generation
- assisted creation of selected contract entities
- visible diff before write
- save/revert flow
- validation after write
- accepted/rejected state
- limited form-based editing for selected domains
- unsupported domains remain read-only
- generated-artifact impact hints where Core can support them

## Initial Candidate Domains

- data products
- payload expected products
- storage intent
- downlink intent
- contact assumptions

## OrbitFabric Core Surfaces Consumed

- source Mission Model files
- validation command
- JSON diagnostics
- model summary outputs
- domain schema information, if available

## Explicit Non-goals

- no broad drag-and-drop editor
- no full visual model editing
- no hidden rewrites
- no automatic semantic correction
- no unsupported domain editing
- no command/autonomy/fault editing until explicitly justified

## Exit Criteria

v0.8.0 is complete only when Studio can:

1. create or modify a limited model domain safely;
2. show the exact patch or diff;
3. run validation after the change;
4. reject or flag invalid changes clearly;
5. preserve the Mission Model as the source of truth;
6. avoid creating any Studio-only model semantics.

---

# v0.9.0 — Plugin-aware Studio Surface

Status: Planned  
Nature: extension visibility slice  
Primary loop: Discover Plugin -> Inspect Outputs -> Trace Provenance

## Goal

Consume OrbitFabric plugin metadata and plugin-generated outputs after OrbitFabric Core exposes a controlled extension mechanism.

Studio must not create a separate plugin ecosystem before Core supports one.

## Candidate Capabilities

- list detected plugins
- display plugin metadata
- display plugin-generated reports
- display plugin-generated artifacts
- distinguish Core outputs from plugin outputs
- show plugin warnings
- show plugin provenance
- display plugin compatibility metadata where available

## OrbitFabric Core Surfaces Consumed

- plugin metadata
- plugin manifests
- plugin-generated reports
- plugin-generated artifacts
- plugin diagnostics
- compatibility declarations

## Explicit Non-goals

- no independent Studio plugin framework before Core support
- no private extension semantics
- no plugin marketplace
- no remote plugin registry
- no execution of untrusted plugin code without explicit security design

## Exit Criteria

v0.9.0 is complete only when Studio can:

1. display Core-declared plugin metadata;
2. distinguish plugin outputs from Core outputs;
3. avoid inventing extension semantics;
4. avoid unsafe or unclear plugin execution behavior.

---

# v1.0.0 — Stable Studio Workbench

Status: Stable target  
Nature: stable local workbench  
Primary loop: Open -> Inspect -> Validate -> Navigate -> Visualize -> Inspect Evidence and Artifacts

## Goal

Provide a stable local workbench aligned with a stable OrbitFabric Mission Data Contract.

Studio v1.0.0 should only be declared when the underlying OrbitFabric Core surfaces consumed by Studio are sufficiently stable.

## Candidate Capabilities

- stable local project loading
- stable validation UX
- stable diagnostics presentation
- stable source/derived/generated distinction
- stable contract navigation
- stable model graph
- stable generated artifact inspection
- stable scenario evidence explorer
- stable ground artifact inspection
- documented compatibility with supported OrbitFabric Core versions
- clear migration notes between supported versions

## Explicit Non-goals

- no expansion into flight software
- no expansion into ground operations
- no expansion into SaaS
- no live telemetry
- no command uplink
- no compatibility claims without implementation and tests

## Exit Criteria

v1.0.0 is complete only when Studio can:

1. support a documented OrbitFabric Core version range;
2. load and inspect real mission workspaces reliably;
3. delegate validation to Core reliably;
4. display diagnostics and generated artifacts consistently;
5. preserve source/derived/generated distinctions throughout the UI;
6. provide stable user-facing workflows;
7. document known limitations clearly.

---

# Deferred Capabilities

The following capabilities are intentionally deferred and must not enter early milestones casually:

- full visual model editing
- drag-and-drop mission modeling
- collaborative cloud workspaces
- account management
- hosted project storage
- live telemetry display
- live command uplink
- mission operations console
- telemetry archive
- real-time ground station integration
- external tool compatibility claims
- plugin marketplace
- browser-only hosted Studio
- AI-assisted model generation

Deferred does not mean impossible.

It means not part of the foundation.

---

# Out-of-scope Capabilities

The following capabilities are outside the identity of OrbitFabric Studio:

- flight software runtime
- OBC framework
- onboard scheduler
- onboard fault manager
- live ground segment
- mission control system
- spacecraft dynamics simulator
- orbital propagator
- RF/link simulator
- CCSDS/PUS/CFDP implementation
- generic YAML IDE
- generic diagramming tool

---

# Milestone Discipline

Every future milestone must include:

- goal
- candidate capabilities
- Core surfaces consumed
- explicit non-goals
- exit criteria
- source/derived/generated impact
- known risks

A milestone is not ready if it cannot explain which OrbitFabric Core outputs it consumes.

A milestone is not ready if it requires Studio to become authoritative for mission semantics.

A milestone is not ready if it expands the project identity beyond visual inspection, validation support, navigation, evidence exploration and controlled interaction with Mission Data Contracts.
