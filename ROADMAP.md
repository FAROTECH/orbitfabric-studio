# OrbitFabric Studio - Roadmap

OrbitFabric Studio is an experimental visual workbench for OrbitFabric Mission Data Contracts.

Studio exists to make the Mission Data Contract easier to inspect, validate, navigate and understand without replacing OrbitFabric Core or redefining mission semantics.

The Mission Model remains the source of truth.

OrbitFabric Core remains authoritative for validation, scenario evidence, generated artifacts, contract introspection, entity indexing, relationship semantics and future plugin semantics.

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
  -> relationship explanation from Core-owned relationship records
  -> generated artifact inspection
  -> scenario evidence inspection
  -> ground artifact inspection
  -> controlled authoring and editing
  -> plugin-aware surfaces
  -> stable workbench
```

The released v0.4.0 loop is:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships
```

The active v0.5.0 planning loop is:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships -> Inspect Generated Artifacts
```

This does not mean that Studio is only a post-processing viewer for already-completed contracts.

Studio is not read-only by identity.

Studio is read-only by initial maturity strategy.

Editing and assisted authoring are intentionally delayed because Studio must first prove that it can load, inspect, validate, navigate, explain and inspect generated outputs from an OrbitFabric mission workspace without introducing semantic drift.

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

For v0.3.0, the required Core outputs are:

```text
Core v0.8.1 model_summary.json for domain navigation
Core v0.8.2 entity_index.json for entity navigation
```

For v0.4.0, the required Core output is available in OrbitFabric Core v1.0.0:

```text
Core v1.0.0 relationship_manifest.json for relationship inspection
kind: orbitfabric.relationship_manifest
manifest_version: 0.1-candidate
status: candidate
```

For v0.5.0, the required Core baseline is the set of generated and exported artifact families documented by OrbitFabric Core v1.0.0.

Studio v0.5.0 may inspect generated files already present in the selected workspace.

Studio v0.5.0 must not generate artifacts, execute arbitrary commands, reinterpret generated files as Mission Model semantics or treat generated runtime and ground outputs as operational behavior.

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
Active         = current planning or implementation target
Experimental   = may change significantly
Stable target  = expected to become part of the v1.0 workbench
Completed      = implemented and documented
Deferred       = intentionally postponed
Out of scope   = not part of Studio identity
```

---

# v0.0.0 - Studio Charter

Status: Completed  
Nature: documentation-only  
Implementation: released

## Goal

Define why Studio exists, what it is not, how it relates to OrbitFabric Core, and which architectural and UX principles govern future development.

## Deliverables

- project README
- roadmap
- charter
- vision
- explicit non-goals
- architecture principles
- data boundary definition
- UX principles
- risk register
- initial ADRs
- mockups and examples directory policy

## Explicit Non-goals

- no runnable application
- no frontend scaffold
- no package manager setup
- no fake screenshots
- no mock operational console
- no product claims
- no compatibility claims

---

# v0.1.0 - Read-only Mission Project Viewer

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

## Explicit Non-goals

- no editing
- no visual model editing
- no graph view
- no scenario runner
- no generator workbench
- no plugin support
- no independent model validation
- no deep semantic parsing inside Studio

---

# v0.2.0 - Validation and Diagnostics Workbench

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

---

# v0.3.0 - Contract Navigation Surface

Status: Completed  
Nature: structured navigation slice  
Primary loop: Open -> Inspect -> Validate -> Navigate

## Goal

Provide read-only navigation across Mission Data Contract domains and entities using Core-owned derived reports.

This release answers two questions:

```text
What contract domains are present in this mission, and where can I inspect them?
What contract entities are defined in this mission, and where can I inspect their source file?
```

This release does not answer:

```text
How are these entities related?
```

## Implemented Capabilities

- run `orbitfabric export model-summary <mission_dir> --json <path>` through a fixed backend command
- run `orbitfabric export entity-index <mission_dir> --json <path>` through a fixed backend command
- detect and load `model_summary.json` read-only when produced by Core
- detect and load `entity_index.json` read-only when produced by Core
- display domains from Core `model_summary.domains`
- display count, required, present, source_file and count_provenance for domains
- display entities from Core `entity_index.entities`
- group entities by domain
- display entity id, display_name, domain, entity_type, source_file, provenance, required_domain and present
- display domain summaries from Core `entity_index.domains`
- distinguish indexed domains from summarized-only domains
- show `mode_transitions` and `policies` as summarized but not entity-indexed when Core reports them that way
- open a source file read-only only when the Core-provided `source_file` safely resolves to a known source model file
- show clear provenance labels for Core model summary and Core entity index data
- handle missing, invalid and unsupported reports gracefully
- preserve raw stdout, stderr and exit code for Core export commands

## OrbitFabric Core Surfaces Consumed

- Core v0.8.1 `model_summary.json`
- `kind: orbitfabric.model_summary`
- `summary_version: 0.1`
- Core v0.8.2 `entity_index.json`
- `kind: orbitfabric.entity_index`
- `index_version: 0.1`

## Version Compatibility

```text
Core v0.8.0:
  lint JSON available
  no model-summary
  no entity-index
  Contract Navigation disabled with clear explanation

Core v0.8.1:
  model-summary available
  entity-index unavailable
  domain navigation enabled
  entity navigation disabled with clear explanation

Core v0.8.2:
  model-summary available
  entity-index available
  domain navigation enabled
  entity navigation enabled
```

Compatibility is based on command behavior and report availability.

Version strings may be displayed, but they must not be the only compatibility signal.

## Explicit Non-goals

- no editing
- no visual model editing
- no semantic YAML parser
- no private entity extraction
- no private domain registry when Core `model_summary.json` is available
- no private relationship resolver
- no graph view
- no relationship navigation
- no dependency graph
- no line or column navigation
- no fake source span
- no quick fixes
- no suppressions
- no scenario runner
- no generator workflow beyond fixed Core-owned report exports
- no ground artifact explorer
- no runtime artifact explorer
- no plugin UI
- no arbitrary command execution
- no arbitrary OrbitFabric CLI argument entry
- no mission-control UI
- no live telemetry
- no command uplink

## Exit Criteria

v0.3.0 is complete because Studio can:

1. consume Core `model_summary.json` without inventing domains;
2. consume Core `entity_index.json` without inventing entities;
3. present contract domains by Core-derived summary;
4. present contract entities by Core-derived index;
5. link domains and entities to source files only through Core-provided source_file values;
6. handle Core v0.8.0, v0.8.1 and v0.8.2 behavior states through command behavior and report availability;
7. avoid relationship, graph and dependency claims.

---

# v0.4.0 - Relationship Surface

Status: Completed  
Nature: Core-derived relationship inspection slice  
Primary loop: Open -> Inspect -> Validate -> Navigate -> Explain Relationships

## Goal

Provide read-only relationship inspection across indexed Mission Data Contract entities by consuming Core v1.0.0 `relationship_manifest.json`.

## Implemented Capabilities

- run `orbitfabric export relationship-manifest <mission_dir> --json <path>` through a fixed backend command
- detect and load `relationship_manifest.json` read-only when produced by Core
- display manifest identity, version, status, mission and Core version
- display Core boundary labels
- display relationship type summaries from Core `relationship_types`
- filter relationship types by type, source domain and destination domain
- display relationship records from Core `relationships`
- filter relationship records by type, source domain and destination domain
- select one relationship record
- explain selected relationship provenance and boundary statements
- handle missing, invalid and unsupported reports gracefully
- preserve raw stdout, stderr and exit code for Core export commands

## OrbitFabric Core Surfaces Consumed

- Core v1.0.0 `relationship_manifest.json`
- `kind: orbitfabric.relationship_manifest`
- `manifest_version: 0.1-candidate`
- `status: candidate`
- Core v0.8.2 or later `entity_index.json` for the existing entity navigation surface

## Explicit Non-goals

- no editing
- no visual model editing
- no semantic YAML parser
- no private relationship inference
- no private graph semantics
- no dependency graph
- no relationship graph engine
- no source line or column navigation
- no runtime behavior
- no ground behavior
- no arbitrary command execution
- no relationship records invented by Studio
- no synthetic nodes
- no synthetic edges

## Exit Criteria

v0.4.0 is complete because Studio can run the fixed Core relationship-manifest export command, load Core `relationship_manifest.json` read-only, show relationship type summaries, show relationship records, select and explain one relationship record without inventing semantics, and verify `total_relationships = 46` on `examples/demo-3u` with Core v1.0.0.

---

# v0.5.0 - Generated Artifact Explorer

Status: Active  
Nature: artifact inspection slice  
Primary loop: Open -> Inspect -> Validate -> Navigate -> Explain Relationships -> Inspect Generated Artifacts

## Goal

Inspect OrbitFabric-generated artifacts already present in a selected workspace through a structured, read-only UI.

Generated artifacts are derived from the Mission Data Contract and remain disposable.

Studio must make them easier to inspect without treating them as source files, without generating new artifacts and without inventing artifact semantics.

## Planned Capabilities

- define a generated artifact inventory model
- inspect `generated/` recursively through a controlled backend command
- classify files by conservative path, extension and known Core-documented names
- group artifacts by reports, logs, docs, runtime, ground and unknown
- show file name, path, extension, size, known or unknown status and preview eligibility
- distinguish source model, derived report, generated output and UI state
- open supported text artifacts in the existing read-only viewer
- list unsupported, oversized or binary files without previewing them
- show graceful fallback when `generated/` does not exist
- keep unknown generated files visible without assigning invented meaning

## Artifact Classes

```text
reports
logs
docs
runtime
ground
unknown
```

## Explicit Non-goals

- no editing
- no generated file modification
- no Mission Model modification
- no arbitrary shell command
- no arbitrary OrbitFabric CLI argument entry
- no new generator workflow
- no scenario runner
- no runtime execution
- no build-system integration
- no flight software claim
- no ground runtime claim
- no mission-control UI
- no live telemetry
- no command uplink
- no private YAML semantic parser
- no private Mission Model validator
- no private artifact semantics
- no dependency graph
- no relationship graph engine
- no plugin execution
- no plugin discovery

## Exit Criteria

v0.5.0 is complete only when Studio can inspect generated artifacts already present in the selected workspace, group them into conservative classes, distinguish known Core-documented artifacts from unknown generated files, show metadata without modifying files, open supported text artifacts read-only, and avoid generation, arbitrary commands and Mission Model semantic inference.

---

# v0.6.0 - Scenario Evidence Explorer

Status: Planned  
Nature: evidence inspection slice  
Primary loop: Run Scenario -> Inspect Evidence -> Understand Contract Behavior

## Goal

Make deterministic scenario evidence navigable.

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

## Explicit Non-goals

- no dynamic spacecraft simulator
- no orbital simulation
- no RF simulation
- no payload physics simulation
- no live runtime execution
- no real onboard state
- no real ground pass execution

---

# v0.7.0 - Ground Integration Artifact Viewer

Status: Planned  
Nature: ground-facing artifact inspection slice  
Primary loop: Generate Ground Artifacts -> Inspect -> Trace

## Goal

Inspect ground-facing contract exports produced by OrbitFabric Core.

Studio remains a viewer and not a ground segment.

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
- prototype / experimental / stable status display

## Explicit Non-goals

- no live ground segment
- no mission control system
- no command uplink service
- no telemetry archive
- no live decoder
- no Yamcs/OpenC3 replacement
- no compatibility claim unless implemented, tested and documented

---

# v0.8.0 - Controlled Contract Authoring Preview

Status: Planned  
Nature: limited editing slice  
Primary loop: Inspect -> Edit Patch -> Validate -> Accept/Reject

## Goal

Introduce limited validation-gated authoring and editing for selected low-risk Mission Model domains.

The purpose is not to create a parallel visual model format.

The purpose is to assist users in producing explicit Mission Model changes that OrbitFabric Core can validate.

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

## Explicit Non-goals

- no broad drag-and-drop editor
- no full visual model editing
- no hidden rewrites
- no automatic semantic correction
- no unsupported domain editing
- no command/autonomy/fault editing until explicitly justified

---

# v0.9.0 - Plugin-aware Studio Surface

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

## Explicit Non-goals

- no independent Studio plugin framework before Core support
- no private extension semantics
- no plugin marketplace
- no remote plugin registry
- no execution of untrusted plugin code without explicit security design

---

# v1.0.0 - Stable Studio Workbench

Status: Stable target  
Nature: stable local workbench  
Primary loop: Open -> Inspect -> Validate -> Navigate -> Visualize -> Inspect Evidence and Artifacts

## Goal

Provide a stable local workbench aligned with stable OrbitFabric Mission Data Contract surfaces.

Studio v1.0.0 should only be declared when the underlying OrbitFabric Core surfaces consumed by Studio are sufficiently stable.

## Candidate Capabilities

- stable local project loading
- stable validation UX
- stable diagnostics presentation
- stable source/derived/generated distinction
- stable contract navigation
- stable relationship inspection from Core-owned relationship data
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
- graph-like relationship visualization if it cannot remain a one-to-one rendering of Core records

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
