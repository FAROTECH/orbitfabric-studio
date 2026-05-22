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
  -> information architecture and UX foundation
  -> scenario evidence inspection
  -> ground artifact inspection
  -> UX consolidation
  -> controlled authoring and editing
  -> plugin-aware surfaces
  -> stable mission contract engineering workbench
```

The released v0.5.0 loop is:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships -> Inspect Generated Artifacts
```

The next roadmap loop is:

```text
Stabilize Studio IA -> Normalize Surfaces -> Prepare Evidence and Ground Inspection
```

The following roadmap loop is:

```text
Run Scenario -> Inspect Evidence -> Understand Contract Behavior
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

For v0.6.0, the required baseline is the set of existing Studio surfaces completed up to v0.5.0.

Studio v0.6.0 does not require new OrbitFabric Core mission semantics.

Studio v0.6.0 reorganizes the existing surfaces into a stable information architecture, introduces a consistent provenance vocabulary, defines a reusable application shell and documents the boundary for future graph-based visualizations.

For v0.7.0, Scenario Evidence Explorer must consume Core-produced scenario outputs and evidence records.

Studio v0.7.0 must not simulate independently from Core.

For v0.8.0, Ground Integration Artifact Viewer must consume Core-generated ground-facing artifacts and manifests.

Studio v0.8.0 must not become a ground segment, a live decoder, a telemetry archive or a mission control interface.

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

Status: Completed  
Nature: artifact inspection slice  
Primary loop: Open -> Inspect -> Validate -> Navigate -> Explain Relationships -> Inspect Generated Artifacts

## Goal

Inspect OrbitFabric-generated artifacts already present in a selected workspace through a structured, read-only UI.

Generated artifacts are derived from the Mission Data Contract and remain disposable.

Studio must make them easier to inspect without treating them as source files, without generating new artifacts and without inventing artifact semantics.

## Implemented Capabilities

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

v0.5.0 is complete because Studio can inspect generated artifacts already present in the selected workspace, group them into conservative classes, distinguish known Core-documented artifacts from unknown generated files, show metadata without modifying files, open supported text artifacts read-only, and avoid generation, arbitrary commands and Mission Model semantic inference.

---

# v0.6.0 - Studio Information Architecture & UX Foundation

Status: Active  
Nature: UX architecture and product foundation slice  
Primary loop: Stabilize Studio IA -> Normalize Surfaces -> Prepare Evidence and Ground Inspection

## Goal

Establish the information architecture, UX foundation and visual organization model for OrbitFabric Studio.

The goal is to prevent Studio from growing as a sequence of disconnected technical panels and to define it instead as a coherent local engineering workbench for inspecting Core-derived mission contract surfaces.

This milestone does not introduce new mission semantics.

It does not turn Studio into an editor, generator, simulator, runtime, ground segment, mission control interface or private graph engine.

OrbitFabric Core remains authoritative.

Studio remains downstream.

## Motivation

After v0.5.0, Studio can already open, inspect, validate, navigate, explain relationships and inspect generated artifacts.

The next planned surfaces, Scenario Evidence and Ground Integration Artifacts, are cross-cutting surfaces.

They should not be added as isolated panels.

They require a stable shell, navigation model, provenance vocabulary, inspector pattern, read-only preview model and clear visual distinction among source, Core-derived, generated, unknown and preview-only information.

## Implemented or Target Capabilities

- stable application shell
- workspace header
- primary navigation
- main surface area
- contextual inspector area
- workspace dashboard
- normalized surface model
- consistent provenance vocabulary
- consistent read-only preview pattern
- consistent empty states
- consistent status, severity and provenance badges
- reserved UX locations for Scenario Evidence and Ground Integration
- documented boundary for future graph-based visualizations

## Primary Surfaces

```text
Overview
Model
Validation
Contracts
Relationships
Artifacts
Reports & Logs
Raw
Evidence
Ground
```

For v0.6.0, Evidence and Ground are reserved or placeholder surfaces only.

Their domain logic is implemented in later milestones.

## Provenance Vocabulary

Studio v0.6.0 introduces a stable UI vocabulary for:

```text
SOURCE
CORE-DERIVED
GENERATED
REPORT
LOG
DOC
RUNTIME-FACING
GROUND-FACING
UNKNOWN
PREVIEW ONLY
READ-ONLY
VALIDATED
REPORTED
RELATIONSHIP
SCENARIO EVIDENCE
```

These labels are not cosmetic.

They are part of Studio's safety model.

A user must always understand whether they are looking at a Mission Model source file, a Core-derived report, a generated artifact, an unknown generated file, or a preview-only surface.

## Graph Visualization Boundary

Graph visualization may be evaluated later, for example with React Flow or an equivalent read-only graph visualization library.

Graph visualization is not part of v0.6.0 implementation.

Graph visualization must remain optional, constrained and read-only.

Allowed future uses:

```text
Relationship Surface
Scenario Evidence Chain
Model -> Report -> Artifact derivation map
```

Rules:

```text
no visual Mission Model editing
no node creation by the user
no edge creation by the user
no user-authored relationships
no generated artifact mutation
no Mission Model mutation
no frontend-only semantic inference
no graph layout persisted into Mission Model YAML
relationships must come from Core-owned or accepted derived data
selection may drive the inspector
pan, zoom and fit-to-view may be allowed
```

Studio is not a graph engine.

Studio is not a diagramming tool.

Studio is not a visual authoring surface.

## Explicit Non-goals

- no Mission Model YAML editing
- no visual Mission Model authoring
- no generated artifact editing
- no independent artifact generation
- no arbitrary command execution
- no private YAML interpretation
- no private graph engine
- no frontend-inferred mission semantics
- no scenario execution
- no scenario simulation
- no mission control behavior
- no ground segment behavior
- no runtime behavior
- no plugin execution
- no Controlled Contract Authoring implementation
- no Plugin-aware Studio implementation

## Core Surfaces Consumed

v0.6.0 consumes the existing Studio and Core-derived surfaces already introduced up to v0.5.0.

It may consume:

- workspace inspection results
- Core version output
- Core mission inspection output
- Core lint JSON reports
- Core model summary reports
- Core entity index reports
- Core relationship manifest reports
- generated artifact inventory data produced by Studio's controlled backend inspection
- supported read-only previews of source, report, log, documentation, CSV and text artifacts

v0.6.0 must not require new Core semantics.

## Exit Criteria

v0.6.0 is complete when Studio can:

1. expose a stable application shell with workspace header, primary navigation, main content area and contextual inspector;
2. preserve all existing surfaces from v0.1.0 through v0.5.0;
3. provide a workspace dashboard summarizing mission identity, validation state, available model surfaces, generated artifact groups, reports, logs and read-only state;
4. consistently distinguish source, Core-derived, generated, report, log, doc, runtime-facing, ground-facing, unknown, preview-only and read-only content;
5. keep unknown artifacts visible without assigning invented meaning;
6. provide read-only previews only through safe and controlled paths;
7. reserve UX locations for Scenario Evidence and Ground Integration without implementing their domain logic;
8. document the boundary for future graph visualization;
9. avoid all Mission Model mutation, generated artifact mutation, arbitrary command execution and private semantic inference.

Detailed specification:

```text
docs/roadmap/studio-v0.6.0-information-architecture-and-ux-foundation.md
```

---

# v0.7.0 - Scenario Evidence Explorer

Status: Planned  
Nature: evidence inspection slice  
Primary loop: Run Scenario -> Inspect Evidence -> Understand Contract Behavior

## Goal

Make deterministic scenario evidence navigable.

Studio must inspect evidence produced by OrbitFabric Core.

Studio must not simulate independently from Core.

## Candidate Capabilities

- list available scenarios
- run a scenario through a fixed OrbitFabric Core command, if this remains part of the approved Studio boundary
- detect and load Core-produced scenario evidence outputs
- display scenario execution status
- display scenario input metadata
- display scenario timeline
- display expectations
- display passed expectations
- display failed expectations
- display events
- display telemetry effects
- display mode changes
- display produced or expected data products
- display report JSON
- display associated logs
- display an evidence chain view
- open generated evidence files read-only
- link scenario evidence to related Mission Model entities when Core provides safe references

## OrbitFabric Core Surfaces Expected

- scenario source files
- scenario execution command or equivalent controlled Core surface
- scenario report JSON
- scenario log files
- structured evidence records, if provided by Core
- safe references to affected entities, if provided by Core

## Explicit Non-goals

- no dynamic spacecraft simulator
- no orbital simulation
- no RF simulation
- no payload physics simulation
- no independent scenario semantics
- no private scenario runner
- no live runtime execution
- no real onboard state
- no real ground pass execution
- no mission control UI
- no command uplink
- no live telemetry

## Exit Criteria

v0.7.0 is complete when Studio can inspect Core-produced scenario evidence through the v0.6.0 application shell, display scenario execution outputs read-only, expose timeline and evidence information without inventing mission behavior, and keep the boundary between scenario source, Core-derived evidence, reports and logs explicit.

---

# v0.8.0 - Ground Integration Artifact Viewer

Status: Planned  
Nature: ground-facing artifact inspection slice  
Primary loop: Inspect Ground Artifacts -> Trace Provenance -> Understand Intended Integration Use

## Goal

Inspect ground-facing contract exports produced by OrbitFabric Core.

Studio remains a viewer and not a ground segment.

## Candidate Capabilities

- ground export manifest viewer
- telemetry dictionary viewer
- command dictionary viewer
- event dictionary viewer
- fault dictionary viewer
- packet dictionary viewer
- data product dictionary viewer
- mission database export viewer, if Core produces one
- decoder skeleton preview, if Core produces one
- CSV preview
- JSON preview
- Markdown preview
- artifact provenance display
- prototype, experimental or stable status display
- model/report/artifact trace view where Core provides safe references
- distinction between ground-facing contract artifacts and operational ground software

## OrbitFabric Core Surfaces Expected

- generated ground artifact files
- ground export manifest
- generated dictionaries
- generated documentation
- generated reports
- safe references to source model entities, if provided by Core

## Explicit Non-goals

- no live ground segment
- no mission control system
- no command uplink service
- no telemetry archive
- no live decoder
- no Yamcs/OpenC3 replacement
- no compatibility claim unless implemented, tested and documented
- no generated artifact editing
- no private ground semantics
- no operational behavior

## Exit Criteria

v0.8.0 is complete when Studio can inspect generated ground-facing artifacts through the v0.6.0 application shell, preview supported dictionaries and manifests read-only, expose provenance and intended integration use, and avoid any ground segment or operational claim.

---

# v0.9.0 - Studio UX Consolidation

Status: Planned  
Nature: UX consolidation slice  
Primary loop: Inspect -> Compare -> Refine Workbench Experience

## Goal

Consolidate Studio's real user experience after Scenario Evidence Explorer and Ground Integration Artifact Viewer have been implemented.

v0.6.0 establishes the UX foundation.

v0.9.0 validates and refines that foundation against the full read-only inspection scope.

## Candidate Capabilities

- refine workspace dashboard based on v0.7.0 and v0.8.0 surfaces
- improve cross-surface navigation
- improve breadcrumbs
- improve inspector consistency
- improve filters across validation, contracts, relationships, artifacts, evidence and ground surfaces
- improve empty states
- improve source, Core-derived, generated and unknown distinction
- improve artifact and evidence traceability
- evaluate global search or command palette for safe read-only navigation
- evaluate read-only relationship graph spike if it demonstrably improves comprehension
- improve visual hierarchy, density and keyboard navigation
- document v1.0 target workbench behavior

## Explicit Non-goals

- no Mission Model editing
- no generated artifact editing
- no independent generation
- no arbitrary command execution
- no private semantic inference
- no uncontrolled graph visualization
- no authoring implementation
- no plugin execution
- no mission control behavior
- no ground segment behavior

## Exit Criteria

v0.9.0 is complete when the full read-only Studio experience is coherent across workspace overview, model inspection, validation, contract navigation, relationships, generated artifacts, scenario evidence and ground artifacts, with consistent provenance, navigation, previews, empty states and read-only boundaries.

---

# v0.10.0 - Controlled Contract Authoring Preview

Status: Planned  
Nature: limited authoring preview slice  
Primary loop: Inspect -> Propose Patch -> Validate -> Accept/Reject

## Goal

Introduce limited validation-gated authoring and editing for selected low-risk Mission Model domains.

The purpose is not to create a parallel visual model format.

The purpose is to assist users in producing explicit Mission Model changes that OrbitFabric Core can validate.

This milestone is intentionally delayed until after the read-only workbench experience has matured.

## Candidate Capabilities

- controlled YAML patch generation
- assisted creation of selected contract entities
- visible diff before write
- explicit user confirmation before write
- save/revert flow
- validation after write
- accepted/rejected state
- limited form-based editing for selected domains
- unsupported domains remain read-only
- generated-artifact impact hints where Core can support them
- clear distinction between proposed changes and accepted source changes

## Initial Candidate Domains

- data products
- payload expected products
- storage intent
- downlink intent
- contact assumptions

## Architectural Constraints

- Core remains authoritative for validation
- no hidden rewrites
- no unsupported domain editing
- no private semantic correction
- every change must be visible as a diff before write
- every accepted change must remain a Mission Model source change
- every write path must be explicit and user-confirmed

## Explicit Non-goals

- no broad drag-and-drop editor
- no full visual model editing
- no hidden rewrites
- no automatic semantic correction
- no unsupported domain editing
- no command/autonomy/fault editing until explicitly justified
- no graph-based authoring
- no visual relationship editing
- no arbitrary YAML editor

## Exit Criteria

v0.10.0 is complete when Studio can assist with a narrowly scoped, validation-gated, explicitly confirmed contract change flow for selected low-risk domains without becoming a general Mission Model editor or introducing a parallel semantic model.

---

# v0.11.0 - Plugin-aware Studio Surface

Status: Planned  
Nature: extension visibility slice  
Primary loop: Discover Plugin -> Inspect Outputs -> Trace Provenance

## Goal

Consume OrbitFabric plugin metadata and plugin-generated outputs after OrbitFabric Core exposes a controlled extension mechanism.

Studio must not create a separate plugin ecosystem before Core supports one.

Plugin-aware surfaces must preserve the same provenance discipline used for Core and generated outputs.

## Candidate Capabilities

- list detected plugins
- display plugin metadata
- display plugin-provided capabilities
- display plugin-generated reports
- display plugin-generated artifacts
- distinguish Core outputs from plugin outputs
- distinguish generated outputs from plugin-generated outputs
- show plugin warnings
- show plugin provenance
- display plugin compatibility metadata where available
- display plugin output status as experimental, candidate or stable where Core provides that metadata

## OrbitFabric Core Surfaces Expected

- controlled Core plugin registry or metadata output
- plugin metadata
- plugin-generated report manifests
- plugin-generated artifact manifests
- compatibility metadata, if provided by Core
- provenance metadata, if provided by Core

## Explicit Non-goals

- no independent Studio plugin framework before Core support
- no private extension semantics
- no plugin marketplace
- no remote plugin registry
- no execution of untrusted plugin code without explicit security design
- no Studio-only plugin output semantics
- no plugin-based Mission Model mutation unless a future milestone explicitly defines it

## Exit Criteria

v0.11.0 is complete when Studio can display Core-exposed plugin metadata and plugin-generated outputs without executing plugins independently, without creating a separate extension system and without weakening the source, Core-derived, generated and plugin-derived provenance boundary.

---

# v1.0.0 - Stable Mission Contract Engineering Workbench

Status: Stable target  
Nature: stable local mission contract engineering workbench  
Primary loop: Open -> Inspect -> Validate -> Navigate -> Explain -> Inspect Evidence and Artifacts

## Goal

Provide a stable local workbench aligned with stable OrbitFabric Mission Data Contract surfaces.

Studio v1.0.0 should only be declared when the underlying OrbitFabric Core surfaces consumed by Studio are sufficiently stable and when Studio has proven a coherent product experience across the main read-only engineering surfaces.

## Candidate Capabilities

- stable local project loading
- stable validation UX
- stable diagnostics presentation
- stable source, Core-derived, generated and unknown distinction
- stable contract navigation
- stable relationship inspection from Core-owned relationship data
- stable generated artifact inspection
- stable scenario evidence explorer
- stable ground artifact inspection
- stable workspace dashboard
- stable provenance vocabulary
- stable contextual inspector
- documented compatibility with supported OrbitFabric Core versions
- clear migration notes between supported versions
- clearly bounded controlled authoring preview, if retained before v1.0
- clearly bounded plugin-aware surface, if retained before v1.0

## Explicit Non-goals

- no expansion into flight software
- no expansion into ground operations
- no expansion into SaaS
- no live telemetry
- no command uplink
- no mission control behavior
- no compatibility claims without implementation and tests
- no arbitrary execution
- no private mission semantics

## Exit Criteria

v1.0.0 is complete when Studio provides a stable, coherent and bounded mission contract engineering workbench that preserves OrbitFabric Core authority, keeps source, derived, generated and plugin-derived surfaces distinct, and avoids expanding into runtime, ground segment or mission control behavior.

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
- graph-like relationship visualization unless it remains read-only, Core-derived and clearly non-authoring

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

A milestone is not ready if it expands the project identity beyond visual inspection, validation support, navigation, evidence exploration, provenance-aware artifact inspection, UX foundation work and controlled interaction with Mission Data Contracts.
