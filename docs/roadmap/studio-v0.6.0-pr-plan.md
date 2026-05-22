# OrbitFabric Studio v0.6.0 PR Plan
# Studio Information Architecture & UX Foundation

## Purpose

This document defines the proposed pull request sequence for OrbitFabric Studio v0.6.0.

The goal of v0.6.0 is to establish the Studio information architecture, UX foundation, provenance vocabulary, application shell and read-only workbench structure before introducing Scenario Evidence, Ground Integration, Controlled Authoring and Plugin-aware surfaces.

This plan is intentionally incremental.

It avoids a single large redesign PR.

Each PR should preserve the existing Studio boundaries:

- Studio remains downstream from OrbitFabric Core.
- Core remains authoritative for validation, reports, artifact generation, relationships, scenario evidence and engineering semantics.
- Studio does not edit Mission Model YAML.
- Studio does not edit generated artifacts.
- Studio does not execute arbitrary commands.
- Studio does not infer private mission semantics.
- Studio does not become a runtime, ground segment, mission control interface or visual Mission Model editor.

Reference milestone specification:

```text
docs/roadmap/studio-v0.6.0-information-architecture-and-ux-foundation.md
```

---

## Proposed PR sequence

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

---

# PR 1 - Add Studio v0.6.0 UX architecture specification

## Goal

Add the official v0.6.0 UX architecture specification and align roadmap documentation.

This PR is documentation-only.

It establishes the product and architectural intent of v0.6.0 before any UI refactor starts.

## Scope

- Add the v0.6.0 milestone specification.
- Ensure the roadmap references the new v0.6.0 milestone.
- Document the revised roadmap order.
- Document Studio's information architecture direction.
- Document the application shell concept.
- Document the provenance vocabulary.
- Document the graph visualization boundary.
- Document explicit non-goals.
- Document acceptance criteria for v0.6.0.

## Non-goals

- No application code changes.
- No UI implementation.
- No React Flow integration.
- No new Tauri commands.
- No new Core command execution.
- No generated artifact behavior changes.
- No source model editing.

## Files likely affected

```text
ROADMAP.md
docs/roadmap/studio-v0.6.0-information-architecture-and-ux-foundation.md
docs/roadmap/studio-v0.6.0-pr-plan.md
```

## Acceptance criteria

- The v0.6.0 specification exists under `docs/roadmap/`.
- The roadmap lists the revised sequence:
  - v0.6.0 - Studio Information Architecture & UX Foundation
  - v0.7.0 - Scenario Evidence Explorer
  - v0.8.0 - Ground Integration Artifact Viewer
  - v0.9.0 - Studio UX Consolidation
  - v0.10.0 - Controlled Contract Authoring Preview
  - v0.11.0 - Plugin-aware Studio Surface
  - v1.0.0 - Stable Mission Contract Engineering Workbench
- The document states that Studio remains downstream from Core.
- The document states that Studio does not introduce private semantics.
- The document states that graph visualization is optional, read-only and constrained.

## Regression checks

- No source files changed.
- No package files changed.
- No generated files changed.
- No application behavior changed.

---

# PR 2 - Introduce stable Studio application shell

## Goal

Introduce the stable layout frame for Studio.

This PR creates the visual and structural foundation for the workbench without changing domain behavior.

## Scope

Introduce a reusable application shell with:

- workspace header;
- primary sidebar;
- main content area;
- contextual inspector region, initially allowed to be empty or placeholder;
- consistent page header pattern;
- consistent empty state pattern;
- consistent loading/error layout;
- stable surface container layout.

Recommended shell structure:

```text
┌──────────────────────────────────────────────────────────────┐
│ Workspace Header                                             │
│ Workspace name | Validation state | Read-only state | Status │
├───────────────┬──────────────────────────────┬───────────────┤
│ Primary Nav   │ Main Surface                 │ Inspector     │
│               │                              │               │
│ Overview      │ Dashboard / Tables / Preview │ Selected item │
│ Model         │                              │ Provenance    │
│ Validation    │                              │ Relationships │
│ Contracts     │                              │ Source refs   │
│ Relationships │                              │ Linked output │
│ Artifacts     │                              │ Raw metadata  │
│ Reports/Logs  │                              │               │
│ Evidence      │                              │               │
│ Ground        │                              │               │
│ Raw           │                              │               │
└───────────────┴──────────────────────────────┴───────────────┘
```

## Non-goals

- No new semantic behavior.
- No new Core commands.
- No Scenario Evidence implementation.
- No Ground Integration implementation.
- No React Flow implementation.
- No file editing.
- No generated artifact mutation.

## Files likely affected

The exact paths depend on the current frontend structure, but likely areas are:

```text
src/
src/App.*
src/components/
src/components/layout/
src/components/navigation/
src/components/surfaces/
src/styles/
```

Potential new components:

```text
StudioShell
WorkspaceHeader
PrimarySidebar
MainSurface
InspectorPanel
SurfaceHeader
EmptyState
LoadingState
ErrorState
```

## Acceptance criteria

- Existing Studio functionality is still reachable.
- Studio has a stable workspace header.
- Studio has a primary navigation area.
- Studio has a main content area.
- Studio has a reserved inspector area.
- Existing views are placed inside the shell or safely bridged into it.
- The shell does not introduce editing affordances.
- The shell does not introduce arbitrary command execution.
- The shell visually reinforces that Studio is a local engineering workbench.

## Regression checks

- Open workspace flow still works.
- Existing validation surface still works.
- Existing contract navigation surface still works.
- Existing relationship surface still works.
- Existing generated artifact explorer still works.
- Read-only source preview remains read-only.
- Generated artifact preview remains read-only.

---

# PR 3 - Add workspace dashboard

## Goal

Make the Overview surface the entry point of the Studio workbench.

The dashboard must summarize the state of the selected workspace without becoming an operational or mission-control dashboard.

## Scope

Add an Overview / Workspace Dashboard surface showing:

- workspace identity;
- detected mission model files;
- validation state if available;
- available model surfaces;
- generated artifact inventory summary;
- reports and logs availability;
- known vs unknown generated artifact counts;
- read-only boundary summary;
- future surface availability or placeholders.

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

## Non-goals

- No live telemetry.
- No mission operations metrics.
- No fake health dashboard.
- No scenario execution.
- No ground segment status.
- No generated artifact generation.
- No file mutation.

## Files likely affected

```text
src/components/surfaces/Overview*
src/components/dashboard/
src/components/cards/
src/state/ or equivalent UI state area
```

Potential new components:

```text
WorkspaceDashboard
MissionSummaryCard
ValidationSummaryCard
ModelSurfacesCard
ArtifactInventoryCard
ReportsLogsCard
ReadOnlyBoundaryCard
FutureSurfacesCard
```

## Acceptance criteria

- The Overview surface is available from primary navigation.
- The dashboard clearly shows which workspace is open.
- The dashboard clearly shows read-only posture.
- The dashboard summarizes validation state without reimplementing validation.
- The dashboard summarizes generated artifact inventory using existing artifact data.
- Unknown artifacts remain explicitly unknown.
- Future surfaces are clearly marked as not implemented or reserved.
- The dashboard does not imply live operations.

## Regression checks

- Workspace loading behavior remains unchanged.
- Validation data remains Core-derived.
- Generated artifact counts remain based on existing conservative classification.
- No new commands are added.
- No source/generated files are modified.

---

# PR 4 - Add provenance badge system

## Goal

Introduce a consistent visual vocabulary for provenance, state and safety boundaries.

This PR makes source / Core-derived / generated / unknown / read-only distinctions visible across Studio.

## Scope

Add reusable badge components for:

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

Add severity/status badges for:

```text
PASS
FAIL
WARNING
INFO
ERROR
EXPERIMENTAL
PLANNED
UNAVAILABLE
```

Use these badges in existing surfaces where safe:

- validation diagnostics;
- contract navigation;
- relationship records;
- generated artifact explorer;
- source preview;
- raw output;
- dashboard cards.

## Non-goals

- No semantic reclassification.
- No new artifact classification rules unless already documented.
- No private entity inference.
- No graph visualization.
- No styling-only redesign unrelated to provenance.

## Files likely affected

```text
src/components/badges/
src/components/common/
src/components/surfaces/*
src/styles/
```

Potential new components:

```text
ProvenanceBadge
StatusBadge
SeverityBadge
ArtifactGroupBadge
ReadOnlyBadge
PreviewOnlyBadge
```

## Acceptance criteria

- Major displayed objects show provenance where applicable.
- Source previews show `SOURCE` and `READ-ONLY`.
- Generated artifact previews show `GENERATED` and `READ-ONLY`.
- Unknown generated files show `UNKNOWN`.
- Preview-only content shows `PREVIEW ONLY`.
- Relationship records show Core-derived provenance.
- Badge labels are consistent across surfaces.
- Badges do not imply capabilities that do not exist.

## Regression checks

- Unknown artifacts remain unknown.
- Existing classification logic is not expanded casually.
- Existing UI remains usable at technical density.
- No editing affordance is introduced.

---

# PR 5 - Normalize existing navigation surfaces

## Goal

Move existing v0.1.0 to v0.5.0 surfaces into the new information architecture.

This PR reduces local layout drift and makes current surfaces feel like parts of one workbench.

## Scope

Normalize existing surfaces under the shell:

```text
Overview
Model
Validation
Contracts
Relationships
Artifacts
Reports & Logs
Raw
```

Existing capabilities should be preserved:

- read-only mission project inspection;
- validation and diagnostics;
- contract navigation;
- relationship inspection;
- generated artifact exploration;
- raw stdout/stderr/exit code access where already supported;
- read-only file previews.

Introduce consistent:

- surface headers;
- breadcrumbs;
- filters where already present;
- empty states;
- selected item behavior;
- raw output access.

## Non-goals

- No new domain logic.
- No Scenario Evidence implementation.
- No Ground Integration implementation.
- No new relationship semantics.
- No dependency graph.
- No React Flow integration.
- No authoring.

## Files likely affected

```text
src/components/surfaces/
src/components/navigation/
src/components/layout/
src/components/validation/
src/components/contracts/
src/components/relationships/
src/components/artifacts/
src/components/raw/
```

## Acceptance criteria

- All existing major surfaces are reachable from the primary navigation.
- Existing v0.5.0 loop remains intact:
  `Open -> Inspect -> Validate -> Navigate -> Explain Relationships -> Inspect Generated Artifacts`
- Surface headers follow a consistent pattern.
- Breadcrumbs are available or planned consistently.
- Empty states are consistent and informative.
- Reports/logs/raw outputs are not mixed ambiguously with source or generated artifacts.
- No existing read-only safety boundary is weakened.

## Regression checks

- Validation still consumes Core JSON report.
- Contract navigation still consumes Core model summary and entity index.
- Relationship surface still consumes Core relationship manifest.
- Artifact explorer still uses conservative generated artifact inspection.
- No generated artifacts are modified.
- No Mission Model YAML files are modified.

---

# PR 6 - Add contextual inspector pattern

## Goal

Introduce a reusable selection-driven inspector pattern.

The inspector should answer what the selected object is, where it comes from, how it is classified and which related surfaces are known.

## Scope

Add a right-side contextual inspector that can display, at minimum:

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

Apply inspector behavior progressively to existing selectable objects:

- validation diagnostic;
- contract entity;
- relationship record;
- generated artifact;
- report/log item;
- source preview item;
- unknown artifact.

## Non-goals

- No new semantic relationship inference.
- No graph engine.
- No authoring.
- No editing.
- No automatic fixes.
- No source line/column navigation unless Core provides safe metadata.
- No generated artifact mutation.

## Files likely affected

```text
src/components/inspector/
src/components/surfaces/*
src/state/selection*
src/types/*
```

Potential new components:

```text
InspectorPanel
InspectorSection
IdentitySection
ProvenanceSection
SourceReferenceSection
RelationshipSection
LinkedArtifactsSection
RawMetadataSection
```

## Acceptance criteria

- Selecting supported objects updates the inspector.
- Inspector content is provenance-aware.
- Unknown artifacts are shown as unknown.
- Source references are shown only when safe.
- The inspector does not invent links.
- The inspector does not imply editability.
- The inspector can remain empty with a useful empty state when nothing is selected.

## Regression checks

- Existing selection behavior remains usable.
- Existing relationship explanation is preserved.
- Existing read-only previews remain read-only.
- No private relationship resolution is introduced.
- No file mutation is introduced.

---

# PR 7 - Define graph visualization boundary

## Goal

Document and optionally scaffold the boundary for future graph visualization.

This PR prevents React Flow or any equivalent graph visualization library from becoming an accidental product foundation, private graph engine or visual authoring system.

## Scope

Documentation scope:

- define graph visualization as optional;
- define read-only graph rules;
- define allowed future graph uses;
- define forbidden graph interactions;
- define future spike acceptance criteria.

Allowed future graph use cases:

```text
Relationship Surface
Scenario Evidence Chain
Model -> Report -> Artifact derivation map
```

Forbidden uses:

```text
visual Mission Model editor
drag-and-drop authoring
frontend-created nodes
frontend-created edges
frontend-inferred relationships
persisted layout as Mission Model data
generated artifact mutation
```

Optional code scope, only if trivial and useful:

- add a placeholder note in the Relationship surface or documentation;
- no React Flow dependency unless there is a separate spike PR.

## Non-goals

- No React Flow integration.
- No graph implementation.
- No graph dependency.
- No node-edge editor.
- No layout persistence.
- No authoring.

## Files likely affected

```text
docs/roadmap/studio-v0.6.0-information-architecture-and-ux-foundation.md
docs/roadmap/studio-v0.6.0-pr-plan.md
possibly ROADMAP.md
```

If adding a placeholder:

```text
src/components/surfaces/Relationships*
```

## Acceptance criteria

- Graph visualization is explicitly constrained.
- React Flow is not required for v0.6.0.
- Any future graph view must be read-only.
- Graph data must be Core-derived or accepted derived data.
- Graph mutation is explicitly forbidden.
- The future spike can be evaluated without committing to adoption.

## Regression checks

- No new frontend dependency is added unless explicitly justified.
- No graph UI is introduced as production behavior.
- Relationship surface remains list/table/record based unless separately changed.
- No private graph semantics are introduced.

---

# PR 8 - Add reserved Scenario Evidence and Ground Integration slots

## Goal

Prepare the Studio information architecture for v0.7.0 and v0.8.0 without implementing their domain logic.

## Scope

Add reserved surfaces or disabled navigation states for:

```text
Evidence
Ground
```

Evidence reserved surface should explain:

- Scenario Evidence Explorer is planned for v0.7.0.
- Studio will inspect Core-produced scenario evidence.
- Studio will not simulate independently.
- Studio will not become a runtime or mission control UI.

Ground reserved surface should explain:

- Ground Integration Artifact Viewer is planned for v0.8.0.
- Studio will inspect generated ground-facing artifacts.
- Studio will not become a ground segment.
- Studio will not provide command uplink, telemetry archive or live decoder behavior.

## Non-goals

- No scenario execution.
- No scenario timeline implementation.
- No evidence chain implementation.
- No ground dictionary viewer implementation beyond existing artifact preview.
- No ground manifest semantics unless already available and consumed elsewhere.
- No generator workflow.
- No runtime behavior.

## Files likely affected

```text
src/components/surfaces/Evidence*
src/components/surfaces/Ground*
src/components/navigation/
src/components/empty-states/
```

Potential new components:

```text
ReservedSurface
EvidenceReservedSurface
GroundReservedSurface
```

## Acceptance criteria

- Evidence and Ground appear in the IA in a controlled way.
- Reserved surfaces have useful explanations.
- Reserved surfaces do not imply implemented functionality.
- Reserved surfaces reinforce Core authority.
- Reserved surfaces reinforce Studio non-goals.
- No new Core command execution is introduced.

## Regression checks

- Existing navigation still works.
- Existing artifact explorer remains the only artifact inspection implementation unless explicitly extended.
- No scenario execution command is added.
- No ground generation command is added.

---

# PR 9 - UX regression and read-only boundary pass

## Goal

Close v0.6.0 with a dedicated regression pass focused on boundaries, safety and product coherence.

This PR should be used to fix inconsistencies introduced across the previous PRs.

## Scope

Review and adjust:

- read-only indicators;
- preview-only indicators;
- source / Core-derived / generated / unknown distinctions;
- empty states;
- dashboard wording;
- inspector wording;
- navigation labels;
- reserved future surface wording;
- graph boundary wording;
- no-goal explanations;
- accessibility basics;
- keyboard/focus behavior where applicable;
- visual density and readability.

## Non-goals

- No new feature implementation.
- No Scenario Evidence implementation.
- No Ground Integration implementation.
- No Controlled Authoring implementation.
- No Plugin-aware surface implementation.
- No React Flow adoption.

## Files likely affected

```text
src/components/*
src/styles/*
docs/roadmap/*
ROADMAP.md
```

## Acceptance criteria

- v0.6.0 acceptance criteria from the milestone spec are satisfied.
- Existing functionality from v0.1.0 through v0.5.0 remains available.
- Studio still clearly communicates read-only behavior.
- Studio still clearly communicates Core authority.
- Unknown artifacts remain unknown.
- No UI view suggests private mission semantics.
- No UI view suggests live operations.
- No UI view suggests source/generated artifact mutation.
- Reserved future surfaces are understandable but clearly not active.
- The UI feels like one coherent workbench rather than a set of disconnected panels.

## Regression checks

Functional checks:

```text
open workspace
inspect mission files
run version command if supported
run mission inspection if supported
run lint if supported
load lint report
load model summary
load entity index
load relationship manifest
inspect generated artifacts
preview supported text artifacts read-only
inspect raw command output where available
```

Boundary checks:

```text
no Mission Model write path
no generated artifact write path
no arbitrary command entry
no arbitrary CLI arguments
no private YAML parser
no private relationship inference
no graph mutation
no plugin execution
no scenario simulation
no ground runtime behavior
```

Documentation checks:

```text
ROADMAP.md updated
v0.6.0 milestone spec present
PR plan present
non-goals still explicit
v0.7.0 and v0.8.0 remain future surfaces
v0.10.0 and v0.11.0 remain planned advanced surfaces
```

---

## Suggested issue titles

If the PRs are tracked as issues first, use:

```text
[Studio v0.6.0] Add UX architecture specification
[Studio v0.6.0] Introduce stable application shell
[Studio v0.6.0] Add workspace dashboard
[Studio v0.6.0] Add provenance badge system
[Studio v0.6.0] Normalize existing navigation surfaces
[Studio v0.6.0] Add contextual inspector pattern
[Studio v0.6.0] Define graph visualization boundary
[Studio v0.6.0] Add reserved Evidence and Ground surfaces
[Studio v0.6.0] Perform UX regression and read-only boundary pass
```

---

## Suggested branch naming

```text
docs/studio-v0.6-ux-spec
feat/studio-v0.6-shell
feat/studio-v0.6-dashboard
feat/studio-v0.6-provenance-badges
feat/studio-v0.6-navigation-normalization
feat/studio-v0.6-inspector-pattern
docs/studio-v0.6-graph-boundary
feat/studio-v0.6-reserved-surfaces
chore/studio-v0.6-ux-regression
```

---

## Recommended merge discipline

The recommended merge order is the PR order.

Avoid parallelizing PR 2 through PR 6 too aggressively because the shell, navigation and inspector patterns will affect the same UI structure.

Safe parallel work:

```text
PR 1 documentation
PR 7 graph boundary documentation
PR 8 reserved-surface wording draft
```

Higher-conflict work:

```text
PR 2 application shell
PR 5 navigation normalization
PR 6 inspector pattern
```

---

## v0.6.0 completion definition

v0.6.0 is complete when Studio has a stable UX foundation for current and near-future surfaces without weakening its architectural boundaries.

Specifically:

```text
Studio has a stable application shell.
Studio has a coherent primary navigation model.
Studio has a workspace dashboard.
Studio has consistent provenance badges.
Studio has normalized current surfaces.
Studio has a contextual inspector pattern.
Studio has documented graph visualization boundaries.
Studio has reserved future surfaces for Evidence and Ground.
Studio remains read-only for source and generated files.
Studio remains downstream from OrbitFabric Core.
Studio does not invent mission semantics.
```
