# OrbitFabric Studio — Roadmap

OrbitFabric Studio is an experimental visual workbench for OrbitFabric Mission Data Contracts.

Studio exists to make the Mission Data Contract easier to inspect, validate, navigate and understand.

Studio follows OrbitFabric Core maturity. It must not introduce independent mission semantics, duplicate core validation logic or create product claims ahead of the core framework.

## Roadmap Principle

Studio grows through narrow, inspectable, validation-aligned vertical slices.

The correct growth path is:

```text
charter -> read-only project viewer -> validation workbench -> model graph -> generated artifact explorer -> scenario evidence explorer -> ground artifact viewer -> controlled editing -> plugin-aware surface -> stable workbench
```

Every milestone must reinforce the core identity:

> OrbitFabric Studio is a downstream visual workbench for Mission Data Contracts.

## v0.0.0 — Studio Charter

Status: current

Goal:

Define why Studio exists, what it is not, how it relates to OrbitFabric Core, and which architectural and UX principles govern future development.

Deliverables:

- README
- roadmap
- charter
- vision
- non-goals
- architecture principles
- data boundaries
- UX principles
- risk register
- initial ADRs

Non-goals:

- no runnable application
- no UI scaffold
- no package manager setup
- no Tauri/Electron/React project
- no fake screenshots
- no product claims

Exit criteria:

- the repository clearly explains why Studio exists
- the relationship with OrbitFabric Core is unambiguous
- the Mission Model is declared as the source of truth
- Studio is defined as downstream, not authoritative
- validation is delegated to OrbitFabric Core
- non-goals are explicit
- risks are documented
- v0.1 is narrow and executable

## v0.1.0 — Read-only Mission Project Viewer

Goal:

Open an existing OrbitFabric mission workspace and inspect its structure without editing it.

Candidate capabilities:

- open a local OrbitFabric mission directory
- detect mission model files
- display a project tree
- display YAML files read-only
- display available generated artifacts
- invoke `orbitfabric lint`
- show validation summary
- show core model summary where machine-readable output exists

Non-goals:

- no editing
- no visual model editing
- no scenario runner
- no generator workbench
- no plugin support

## v0.2.0 — Validation and Diagnostics Workbench

Goal:

Make validation results first-class and inspectable.

Candidate capabilities:

- run validation on demand
- display lint status clearly
- display diagnostic list
- group diagnostics by file/domain/rule family
- open source model location where supported
- show generated JSON reports
- distinguish source model, derived report and generated output

Non-goals:

- no independent validation rules
- no hidden auto-fixes
- no model mutation

## v0.3.0 — Mission Model Graph

Goal:

Visualize relationships among Mission Data Contract entities.

Candidate capabilities:

- subsystem graph
- telemetry relationship graph
- command relationship graph
- payload to data-product graph
- data-product to storage/downlink/contact graph
- commandability/autonomy relationship graph
- node detail panel
- edge explanation panel
- broken-reference highlighting where reported by the core

Non-goals:

- no drag-and-drop model editing
- no private graph semantics
- no simulator behavior

## v0.4.0 — Generated Artifact Explorer

Goal:

Inspect OrbitFabric-generated artifacts through a structured UI.

Candidate capabilities:

- generated documentation viewer
- generated data-flow documentation viewer
- runtime-facing binding artifact browser
- runtime contract manifest viewer
- generated file classification
- generated-vs-source distinction

Non-goals:

- no generated code editing inside Studio
- no user-code merge logic
- no runtime execution claim

## v0.5.0 — Scenario Evidence Explorer

Goal:

Make deterministic scenario evidence navigable.

Candidate capabilities:

- list available scenarios
- run scenario through OrbitFabric Core
- display scenario timeline
- display data-flow evidence records
- display expected effects
- display passed/failed expectations
- open generated JSON and Markdown evidence

Non-goals:

- no dynamic spacecraft simulator
- no orbital simulation
- no RF simulation
- no live runtime

## v0.6.0 — Ground Integration Artifact Viewer

Goal:

Inspect ground-facing contract exports produced by OrbitFabric Core.

Candidate capabilities:

- mission database export viewer
- telemetry dictionary viewer
- command dictionary viewer
- event dictionary viewer
- fault dictionary viewer
- data product dictionary viewer
- packet dictionary viewer
- decoder skeleton preview
- ground export manifest viewer

Non-goals:

- no live ground segment
- no mission control system
- no command uplink service
- no telemetry archive
- no compatibility claim unless implemented and tested

## v0.7.0 — Controlled Editing Preview

Goal:

Introduce limited validation-gated editing for selected low-risk Mission Model domains.

Candidate capabilities:

- controlled YAML patch generation
- save/revert flow
- validation-gated write flow
- limited form-based editing for selected domains
- clear source/diff preview before write

Initial candidate domains:

- data products
- payload expected products
- storage intent
- downlink intent
- contact assumptions

Non-goals:

- no broad drag-and-drop editor
- no hidden rewrites
- no semantic invention
- no unsupported domain editing

## v0.8.0 — Plugin-aware Studio Surface

Goal:

Consume OrbitFabric plugin metadata and plugin-generated outputs after OrbitFabric Core exposes a controlled extension mechanism.

Candidate capabilities:

- list detected plugins
- display plugin metadata
- display plugin-generated reports/artifacts
- distinguish core outputs from plugin outputs
- show plugin status and warnings

Non-goals:

- no independent Studio plugin framework before Core support
- no private extension semantics
- no plugin marketplace

## v1.0.0 — Stable Studio Workbench

Goal:

Provide a stable local workbench aligned with a stable OrbitFabric Mission Data Contract.

Candidate capabilities:

- stable project loading
- stable validation UX
- stable generated artifact inspection
- stable evidence explorer
- stable model graph
- stable read-only and controlled-editing workflows
- documented compatibility with supported OrbitFabric Core versions

Non-goals:

- no expansion into flight software
- no expansion into ground operations
- no expansion into SaaS unless separately justified
