# OrbitFabric Studio v0.6.0
# Studio Information Architecture & UX Foundation

## 1. Purpose

This milestone establishes the information architecture, UX foundation and visual organization model for OrbitFabric Studio.

The goal is to prevent Studio from growing as a vertical sequence of disconnected technical panels and to define it instead as a coherent local engineering workbench for inspecting Core-derived mission contract surfaces.

This milestone does not introduce new mission semantics.

It does not turn Studio into an editor, generator, simulator, runtime, ground segment, mission control interface or private graph engine.

OrbitFabric Core remains the authoritative source for validation, generation, reports, artifact semantics and engineering meaning.

Studio remains a downstream, local, read-only visual surface for inspecting, navigating, previewing, organizing and explaining Core-owned or conservatively classified outputs.

## 2. Context

OrbitFabric Studio has already completed the first functional read-only loop:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships -> Inspect Generated Artifacts
```

The completed milestones are:

```text
v0.0.0 - Studio Charter
v0.1.0 - Read-only Mission Project Viewer
v0.2.0 - Validation and Diagnostics Workbench
v0.3.0 - Contract Navigation Surface
v0.4.0 - Relationship Surface
v0.5.0 - Generated Artifact Explorer
```

The v0.5.0 milestone introduced a controlled generated artifact inspection surface, including:

```text
generated artifact inventory model
controlled inspection of <workspace>/generated/
conservative artifact classification
artifact groups: reports, logs, docs, runtime, ground, unknown
read-only preview of supported textual artifacts
CSV preview for ground dictionaries
no generation
no file modification
no private semantic inference
```

The next major planned surfaces are more complex:

```text
Scenario Evidence Explorer
Ground Integration Artifact Viewer
Controlled Contract Authoring Preview
Plugin-aware Studio Surface
```

Before adding these surfaces, Studio needs a stable product and UX architecture.

## 3. Why this milestone exists

The current Studio UI is technically useful, but it risks becoming a stack of vertical panels.

This is acceptable for the early read-only milestones, but it becomes fragile when Studio starts exposing:

```text
scenario evidence
timelines
expectations
events
telemetry effects
mode changes
report JSON
logs
evidence chains
ground dictionaries
packet dictionaries
manifest files
runtime-facing artifacts
ground-facing artifacts
model/report/artifact comparisons
```

Without an explicit information architecture, each new feature would likely introduce its own local layout, vocabulary, badges, filtering model, preview behavior and object detail pattern.

That would create product debt.

The main risk is not that Studio becomes technically wrong.

The main risk is that Studio becomes technically correct but difficult to use.

This milestone exists to define the common UX grammar before the next surfaces are implemented.

## 4. Updated roadmap positioning

The roadmap is revised as follows:

```text
v0.0.0 - Studio Charter
v0.1.0 - Read-only Mission Project Viewer
v0.2.0 - Validation and Diagnostics Workbench
v0.3.0 - Contract Navigation Surface
v0.4.0 - Relationship Surface
v0.5.0 - Generated Artifact Explorer

v0.6.0 - Studio Information Architecture & UX Foundation
v0.7.0 - Scenario Evidence Explorer
v0.8.0 - Ground Integration Artifact Viewer
v0.9.0 - Studio UX Consolidation
v0.10.0 - Controlled Contract Authoring Preview
v0.11.0 - Plugin-aware Studio Surface

v1.0.0 - Stable Mission Contract Engineering Workbench
```

The milestone is intentionally placed before Scenario Evidence Explorer and Ground Integration Artifact Viewer.

The reason is architectural: scenario evidence and ground integration are cross-cutting surfaces. They should not be added as isolated panels.

They need to fit into a stable shell, navigation model, provenance vocabulary, inspector pattern and preview model.

## 5. Architectural boundaries

OrbitFabric Studio remains downstream from OrbitFabric Core.

Core remains authoritative for:

```text
Mission Model loading
Mission Model validation
semantic linting
report generation
artifact generation
scenario execution
scenario evidence
engineering meaning
contract semantics
relationship semantics
```

Studio may:

```text
open a local workspace
inspect known workspace surfaces
display Core-derived reports
display generated artifacts
display read-only source previews when safe references exist
display conservative artifact classifications
navigate known domains and entities
show relationships derived from Core-owned data
provide filtering, grouping and visual organization
provide UX explanations of source/generated/derived/unknown status
```

Studio must not:

```text
edit Mission Model YAML
edit generated artifacts
execute arbitrary commands
generate artifacts independently from Core
simulate mission behavior independently from Core
reinterpret YAML semantics privately
infer relationships not exposed by Core-owned outputs
become a ground segment
become a mission control interface
become a runtime interface
become a private graph engine
become a visual Mission Model editor
```

## 6. UX foundation goals

The milestone must make Studio feel like an engineering workbench.

It must help the user answer these questions immediately:

```text
What workspace am I looking at?
Is the Mission Model valid?
Which Core-derived surfaces are available?
Which generated artifacts exist?
Which outputs are reports, logs, docs, runtime artifacts or ground artifacts?
Which objects are source, Core-derived, generated or unknown?
Which views are previews only?
Which views are read-only?
Which entities are related?
Which source file can I inspect safely?
Which future surfaces are not available yet?
```

Studio must expose technical density without becoming chaotic.

The visual direction is:

```text
modern
engineering-oriented
dense but readable
dark-mode friendly
consistent with OrbitFabric identity
not decorative
not startup-SaaS generic
not fake mission control
```

## 7. Information architecture

Studio should be organized around engineering surfaces, not around raw files.

The primary surfaces are:

```text
Workspace
Mission Model
Validation
Contracts
Relationships
Generated Artifacts
Reports & Logs
Source Preview
Raw Core Output
Scenario Evidence
Ground Integration
```

For v0.6.0, the implemented and normalized surfaces should be:

```text
Overview
Mission Model
Validation
Contracts
Relationships
Artifacts
Reports & Logs
Raw
```

The future reserved surfaces should be:

```text
Evidence
Ground
```

The core principle is:

```text
Users navigate mission engineering concepts.
They do not browse implementation files first.
Files remain available as safe read-only previews when appropriate.
```


## Graph visualization boundary

Graph visualization is intentionally outside the implementation scope of v0.6.0.

Studio may eventually expose graph-like views, but only as read-only visualizations of Core-owned or accepted derived data.

A future graph surface may be considered for:

```text
Relationship Surface
Scenario Evidence Chain
Model -> Report -> Artifact derivation map
```

A graph surface must not become:

```text
visual Mission Model editor
drag-and-drop authoring surface
frontend-created node store
frontend-created edge store
private relationship inference engine
layout persistence mechanism for Mission Model semantics
generated artifact mutation tool
runtime behavior simulator
ground segment operator interface
```

React Flow, or any equivalent graph visualization library, is not required for v0.6.0.

Any future graph implementation must be introduced through a separate spike PR and accepted only if it satisfies these constraints:

```text
all graph nodes are Core-derived or accepted derived records
all graph edges are Core-derived or accepted derived records
the graph is read-only
the graph does not persist layout as mission data
the graph does not allow creating, editing or deleting model entities
the graph does not create relationships not present in Core-owned outputs
the graph does not replace list/table/record inspection surfaces
the graph remains secondary to explainable contract evidence
```

For v0.6.0, the correct behavior is to keep relationship and artifact inspection list/record based.

The Studio shell, badges, dashboard, navigation normalization and contextual inspector define the UX foundation first.

Graph visualization remains optional future work, not a committed product dependency.

## 8. Application shell

Studio should adopt a stable application shell.

Recommended shell structure:

```text
┌──────────────────────────────────────────────────────────────┐
│ Workspace Header                                             │
│ Workspace name | Validation state | Read-only state | Status │
├───────────────┬──────────────────────────────┬───────────────┤
│ Primary Nav   │ Main Surface                 │ Inspector     │
│               │                              │               │
│ Overview      │ Dashboard                    │ Selected item │
│ Model         │ Tables                       │ Provenance    │
│ Validation    │ Relationship views           │ Relationships │
│ Contracts     │ Artifact previews            │ Source refs   │
│ Relations     │ Reports/logs                 │ Linked output │
│ Artifacts     │ Raw output                   │ Raw metadata  │
│ Reports/Logs  │ Reserved future surfaces     │               │
│ Evidence      │                              │               │
│ Ground        │                              │               │
│ Raw           │                              │               │
└───────────────┴──────────────────────────────┴───────────────┘
```

The shell should include:

```text
workspace header
primary sidebar
main content area
contextual inspector
consistent empty states
consistent loading/error states
consistent badge language
consistent read-only affordances
```

## 9. Navigation model

The primary sidebar should remain stable and compact.

Recommended navigation:

```text
Overview
Model
Validation
Contracts
Relationships
Artifacts
Reports & Logs
Evidence
Ground
Raw
```

Surface behavior:

```text
Overview:
  Workspace dashboard and health summary.

Model:
  Mission Model domains and loaded surfaces.

Validation:
  Diagnostics, errors, warnings, severity filtering and report references.

Contracts:
  Telemetry, commands, events, faults, modes, packets, payload contracts, data products and related contract entities.

Relationships:
  Entity-to-entity relationships derived from Core-owned data.

Artifacts:
  Generated artifact inventory, artifact groups and supported previews.

Reports & Logs:
  Core-derived reports, generated reports and logs.

Evidence:
  Reserved for Scenario Evidence Explorer.

Ground:
  Reserved for Ground Integration Artifact Viewer.

Raw:
  Raw Core output and raw previews for supported content.
```

Breadcrumbs should be introduced.

Examples:

```text
Workspace / Overview
Workspace / Contracts / Telemetry / eps.battery.voltage
Workspace / Artifacts / Ground / telemetry_dictionary.csv
Workspace / Reports & Logs / lint_report.json
Workspace / Evidence / battery_low_during_payload / Timeline
Workspace / Ground / Command Dictionary
```

## 10. Provenance vocabulary

Studio must introduce a stable provenance vocabulary.

This is not cosmetic.

It is a core UX safety mechanism.

Recommended vocabulary:

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

Meaning:

```text
SOURCE:
  A Mission Model source file or source-backed entity.

CORE-DERIVED:
  Information produced, validated or reported by OrbitFabric Core.

GENERATED:
  Artifact produced by OrbitFabric generation flows.

REPORT:
  A report produced by Core or by controlled generation flows.

LOG:
  Execution, validation or scenario log.

DOC:
  Generated documentation artifact.

RUNTIME-FACING:
  Artifact intended to support runtime integration surfaces.

GROUND-FACING:
  Artifact intended to support ground integration surfaces.

UNKNOWN:
  Artifact present in a known location but not semantically classified by Studio.

PREVIEW ONLY:
  Studio can display the content, but does not assign engineering semantics.

READ-ONLY:
  Studio does not allow mutation of the object.

VALIDATED:
  Entity or surface covered by validation output.

REPORTED:
  Entity or surface referenced by a Core-derived report.

RELATIONSHIP:
  Link exposed by Core-owned or accepted derived data.

SCENARIO EVIDENCE:
  Evidence produced by scenario execution, once available.
```

Badge behavior:

```text
Every major object should expose provenance.
Every generated artifact should expose group and preview status.
Every source preview should expose read-only state.
Every unknown artifact should remain unknown.
Every relationship should indicate that it is derived from Core-owned data.
```

## 11. Surface model

Studio should treat each major area as a surface.

A surface is a UI area that exposes a coherent subset of Core-owned, Core-derived or conservatively classified data.

Recommended surface model:

```text
Workspace Surface
Model Surface
Validation Surface
Contract Surface
Relationship Surface
Artifact Surface
Report/Log Surface
Source Preview Surface
Raw Output Surface
Scenario Evidence Surface
Ground Integration Surface
```

Each surface should define:

```text
purpose
data source
provenance
allowed interactions
forbidden interactions
empty state
selection behavior
inspector behavior
preview behavior
```

Example:

```text
Artifact Surface

Purpose:
  Inspect generated artifacts under the controlled generated output area.

Data source:
  Controlled backend inspection of <workspace>/generated/.

Provenance:
  GENERATED, REPORT, LOG, DOC, RUNTIME-FACING, GROUND-FACING, UNKNOWN.

Allowed interactions:
  group
  filter
  select
  preview supported text/CSV/JSON/Markdown
  inspect metadata

Forbidden interactions:
  edit
  delete
  regenerate
  reclassify semantically
  execute
```

## 12. Workspace dashboard

The Overview surface should become a real workspace dashboard.

It should answer:

```text
What workspace is open?
Is the model valid?
What model surfaces are available?
What Core outputs are present?
What generated artifact groups exist?
Are reports available?
Are logs available?
Are unknown artifacts present?
Is Studio operating in read-only mode?
```

Recommended dashboard sections:

```text
Mission Summary
Validation Summary
Model Surfaces
Generated Artifact Inventory
Reports & Logs
Known vs Unknown Outputs
Read-only Boundary
Next Available Surfaces
```

The dashboard should not look like a fake operations dashboard.

It should be a technical entry point.

Recommended dashboard cards:

```text
Mission
  name
  workspace path
  detected model files
  current status

Validation
  pass/fail/unknown
  errors
  warnings
  report availability

Model Surfaces
  spacecraft
  subsystems
  modes
  telemetry
  commands
  events
  faults
  packets
  payloads
  data products
  policies

Generated Artifacts
  reports count
  logs count
  docs count
  runtime count
  ground count
  unknown count

Read-only Boundary
  Mission Model editing disabled
  generated artifact editing disabled
  arbitrary command execution disabled

Future Surfaces
  Scenario Evidence
  Ground Integration
```

## 13. Inspector pattern

Studio should introduce a reusable contextual inspector.

The inspector answers:

```text
What is selected?
Where does it come from?
What kind of object is it?
Is it source, Core-derived, generated or unknown?
Is it validated?
Is it reported?
Which relationships exist?
Which reports or artifacts reference it?
Can its source be previewed safely?
Is the current view only a preview?
```

Recommended inspector sections:

```text
Identity
Provenance
Status
Source Reference
Relationships
Linked Reports
Linked Artifacts
Preview State
Raw Metadata
```

The inspector should be selection-driven.

Examples:

```text
When selecting a telemetry entity:
  show domain, identifier, source reference, validation status, packet relationships and generated dictionary links.

When selecting a generated CSV artifact:
  show artifact group, known/unknown status, preview type, generated path and related model domains if Core-derived references exist.

When selecting a validation diagnostic:
  show severity, message, affected entity, source reference and related report section.

When selecting a relationship:
  show source entity, target entity, relationship type and provenance.

When selecting an unknown artifact:
  show path, type guess if safe, preview availability and explicit UNKNOWN/PREVIEW ONLY badges.
```

## 14. Read-only preview pattern

Studio may preview files.

Studio must not make previews look editable.

Every preview must include:

```text
path
provenance badge
read-only badge
preview-only badge when applicable
source/generated/unknown distinction
safe reference status
content type
```

Supported previews may include:

```text
YAML source preview
JSON report preview
Markdown generated documentation preview
CSV dictionary preview
plain text log preview
raw text preview
```

Rules:

```text
No inline editing.
No save action.
No generated artifact mutation.
No source mutation.
No semantic reinterpretation of unknown files.
No hidden command execution.
```

## 15. Graph visualization boundary

React Flow or any equivalent graph visualization library must not become a product foundation.

Graph visualization is allowed only as a constrained, read-only visualization technique.

Studio is not a graph engine.

Studio is not a visual editor.

Studio must not create, persist or infer graph semantics privately.

A graph view may be considered later for:

```text
Relationship Surface
Scenario Evidence Chain
Model -> Report -> Artifact derivation map
```

Graph visualization must follow these rules:

```text
read-only by default
nodes are not draggable as persisted state
edges cannot be created by the user
nodes cannot be created by the user
edges cannot be deleted by the user
relationships must come from Core-owned or accepted derived data
no frontend-only semantic inference
no Mission Model mutation
no generated artifact mutation
selection may drive the inspector
pan and zoom are allowed
fit-to-view is allowed
layout may be computed for display only
layout must not become Mission Model data
```

Explicit non-goal:

```text
React Flow is not introduced as a milestone.
React Flow is not required for v0.6.0.
React Flow may be evaluated later through a limited read-only spike.
```

Possible future spike:

```text
v0.6.x or v0.9.x - Read-only Relationship Graph Spike
```

Spike acceptance criteria:

```text
Graph is read-only.
Graph data is Core-derived.
Selection updates the inspector.
No graph mutation exists.
No graph layout is persisted into Mission Model YAML.
The graph improves comprehension compared to the existing relationship surface.
If it does not improve comprehension, it is not adopted.
```

## 16. Reserved future surfaces

v0.6.0 should reserve architectural space for future surfaces without implementing their domain logic.

Reserved surfaces:

```text
Evidence
Ground
Authoring
Plugins
```

For v0.6.0, only Evidence and Ground should appear as near-term reserved surfaces.

Authoring and Plugins should remain roadmap-level future surfaces, not active navigation entries unless explicitly useful.

### Evidence reserved surface

Purpose:

```text
Future Scenario Evidence Explorer.
```

Expected future content:

```text
scenario input
timeline
expectations
events
telemetry effects
mode changes
report JSON
log
evidence chain
```

v0.6.0 behavior:

```text
show reserved navigation slot or disabled/empty state
explain that Studio will inspect Core-produced evidence
make clear that Studio does not simulate independently
```

### Ground reserved surface

Purpose:

```text
Future Ground Integration Artifact Viewer.
```

Expected future content:

```text
command dictionaries
telemetry dictionaries
event/fault dictionaries
packet dictionaries
data product dictionaries
manifest
CSV preview
JSON preview
Markdown preview
model/report/artifact comparison
```

v0.6.0 behavior:

```text
show reserved navigation slot or disabled/empty state
explain that ground artifacts remain generated/read-only surfaces
make clear that Studio is not a ground segment
```

## 17. Non-goals

This milestone explicitly does not include:

```text
Mission Model YAML editing
visual Mission Model authoring
generated artifact editing
independent artifact generation
arbitrary command execution
private YAML interpretation
private graph engine
frontend-inferred mission semantics
scenario execution
scenario simulation
mission control behavior
ground segment behavior
runtime behavior
plugin execution
Controlled Contract Authoring implementation
Plugin-aware Studio implementation
```

This milestone also does not attempt to finalize all v1.0 visual details.

It establishes the UX foundation.

Final polish belongs later, after Scenario Evidence and Ground Integration surfaces exist.

## 18. Acceptance criteria

The milestone is complete when the following criteria are satisfied:

```text
1. Studio exposes a stable application shell with workspace header, primary navigation, main content area and contextual inspector.

2. Existing surfaces remain available:
   Mission Model overview,
   Validation and Diagnostics,
   Contract Navigation,
   Relationship Surface,
   Generated Artifact Explorer.

3. A workspace dashboard summarizes mission identity, validation state, model surfaces, generated artifact groups, reports, logs and read-only status.

4. Studio uses a consistent provenance vocabulary across the UI.

5. Major objects clearly indicate whether they are source, Core-derived, generated, report, log, ground-facing, runtime-facing, unknown, preview-only or read-only.

6. Unknown artifacts are never semantically interpreted.

7. Source previews are read-only and only exposed when safe references exist.

8. Generated artifact previews remain read-only.

9. Validation diagnostics, artifacts and selected entities use a consistent inspector pattern.

10. Existing generated artifact classification remains conservative.

11. Scenario Evidence and Ground Integration have reserved UX locations without premature domain implementation.

12. Graph visualization boundaries are documented.

13. No new feature writes to Mission Model YAML.

14. No new feature writes to generated artifacts.

15. No new feature executes arbitrary commands.

16. No new feature introduces semantic interpretation outside OrbitFabric Core.

17. Empty states explain unavailable surfaces without implying broken behavior.

18. The visual system supports status badges, severity badges and provenance badges.

19. The milestone documentation clearly states that Core remains authoritative.

20. The roadmap is updated to place Scenario Evidence Explorer, Ground Integration Artifact Viewer, UX Consolidation, Controlled Contract Authoring Preview and Plugin-aware Studio Surface in the revised order.
```

## 19. Suggested PR sequence

Recommended implementation sequence:

```text
PR 1 - Add Studio v0.6.0 UX architecture specification
PR 2 - Introduce stable Studio application shell
PR 3 - Add workspace dashboard
PR 4 - Add provenance badge system
PR 5 - Normalize existing navigation surfaces
PR 6 - Add contextual inspector pattern
PR 7 - Define graph visualization boundary
PR 8 - Add reserved Scenario Evidence and Ground Integration slots
PR 9 - UX regression and read-only boundary pass
```

### PR 1 - Add Studio v0.6.0 UX architecture specification

Scope:

```text
Add this milestone specification.
Update roadmap positioning.
Document UX principles.
Document architectural boundaries.
Document graph visualization boundary.
```

No application behavior change.

### PR 2 - Introduce stable Studio application shell

Scope:

```text
workspace header
primary sidebar
main content area
inspector area
shared layout primitives
shared empty states
```

Goal:

```text
Create a stable frame for all current and future surfaces.
```

### PR 3 - Add workspace dashboard

Scope:

```text
mission summary
validation summary
model surfaces summary
generated artifacts summary
reports/logs summary
read-only boundary summary
```

Goal:

```text
Make Overview the entry point of the engineering workbench.
```

### PR 4 - Add provenance badge system

Scope:

```text
source badge
Core-derived badge
generated badge
report badge
log badge
runtime-facing badge
ground-facing badge
unknown badge
preview-only badge
read-only badge
severity badges
status badges
```

Goal:

```text
Make provenance visible everywhere.
```

### PR 5 - Normalize existing navigation surfaces

Scope:

```text
place existing views into the new navigation model
avoid duplicated local layouts
align page headers
align filters
align selected object behavior
```

Goal:

```text
Move from feature panels to consistent Studio surfaces.
```

### PR 6 - Add contextual inspector pattern

Scope:

```text
selected entity inspector
selected artifact inspector
selected diagnostic inspector
selected relationship inspector
selected report/log inspector
```

Goal:

```text
Make selection behavior consistent across Studio.
```

### PR 7 - Define graph visualization boundary

Scope:

```text
document graph view constraints
add no implementation unless trivial placeholder is useful
define future spike requirements
state React Flow is optional and constrained
```

Goal:

```text
Prevent graph visualization from becoming private semantics or visual authoring.
```

### PR 8 - Add reserved Scenario Evidence and Ground Integration slots

Scope:

```text
reserved navigation entries or future-surface empty states
clear explanations
no scenario logic
no ground artifact logic beyond existing generated artifact preview
```

Goal:

```text
Prepare the UX architecture for v0.7.0 and v0.8.0.
```

### PR 9 - UX regression and read-only boundary pass

Scope:

```text
verify no file mutation
verify no generated artifact mutation
verify no arbitrary execution
verify unknown artifacts remain unknown
verify Core remains authoritative
verify all previews are read-only
verify empty states are clear
```

Goal:

```text
Close v0.6.0 without weakening Studio boundaries.
```

## 20. Risks and mitigations

### Risk: v0.6.0 becomes a cosmetic redesign

Mitigation:

```text
Keep the milestone focused on information architecture, provenance, navigation and reusable UX patterns.
Avoid decorative UI work that does not improve engineering comprehension.
```

### Risk: v0.6.0 becomes too large

Mitigation:

```text
Do not implement Scenario Evidence.
Do not implement Ground Integration.
Do not implement Authoring.
Do not implement Plugins.
Do not introduce graph visualization as a required feature.
```

### Risk: Studio starts implying editable behavior

Mitigation:

```text
Use explicit READ-ONLY and PREVIEW ONLY badges.
Avoid edit affordances.
Avoid drag-to-edit behavior.
Avoid file mutation actions.
```

### Risk: Graph visualization becomes a private graph engine

Mitigation:

```text
Document graph boundaries.
Allow only Core-derived relationships.
Disable graph mutation.
Treat React Flow as optional and constrained.
```

### Risk: Unknown artifacts are overinterpreted

Mitigation:

```text
Keep UNKNOWN explicit.
Allow raw preview only where supported.
Never assign engineering meaning to unknown artifacts.
```

### Risk: Ground Integration is designed prematurely

Mitigation:

```text
Reserve the surface in v0.6.0.
Implement the actual viewer in v0.8.0 after Scenario Evidence and after the shell is stable.
```

### Risk: UX consolidation happens too early

Mitigation:

```text
v0.6.0 defines the foundation.
v0.9.0 performs UX consolidation after Scenario Evidence and Ground Integration exist.
```

## 21. Target v1.0 experience

By v1.0.0, Studio should provide this experience:

```text
I open an OrbitFabric workspace.
I immediately understand whether the Mission Model is valid.
I see which Core-derived surfaces are available.
I navigate model domains, entities and relationships.
I inspect validation diagnostics with source references.
I open source previews in read-only mode when references are safe.
I inspect generated artifacts without confusing them with source files.
I understand which artifacts are ground-facing, runtime-facing, reports, logs, docs or unknown.
I follow scenario evidence produced by Core.
I inspect ground integration artifacts and understand their intended use.
I never lose the boundary between Mission Model source, Core-derived reports and generated artifacts.
I never feel that Studio is inventing mission semantics.
I never feel that Studio is a runtime, a ground segment or a mission control UI.
```

## 22. Final milestone statement

v0.6.0 is the point where OrbitFabric Studio stops being a sequence of useful technical panels and becomes a coherent mission contract engineering workbench.

It does not expand Studio's authority.

It clarifies Studio's shape.

It makes the read-only, Core-derived, provenance-first nature of Studio visible in the product itself.

This foundation is required before adding Scenario Evidence, Ground Integration, Controlled Contract Authoring and Plugin-aware surfaces.
