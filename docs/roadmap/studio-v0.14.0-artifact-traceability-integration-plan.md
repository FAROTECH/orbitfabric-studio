# OrbitFabric Studio v0.14.0 - Artifact Traceability Integration Plan

## Status

```text
Milestone: v0.14.0 - Artifact Traceability Integration
Status: Planned
Baseline: v0.13.0 - Evidence-integrated Workbench
Primary surface: Mission Data Flow Workbench
Secondary surfaces: Mission Cockpit, Generated Artifacts, Scenario Evidence, Inspector
React Flow decision: deferred
```

## Purpose

v0.14.0 connects generated artifacts, evidence records and Core-reported model entities more explicitly inside Studio.

The milestone does not create mission semantics. It improves traceability across information that OrbitFabric Core already reports, or artifacts that Core has already generated.

The intended product movement is:

```text
Open workspace
  -> inspect mission cockpit
  -> inspect data-flow workbench
  -> select a Core-reported entity, relationship, evidence record or artifact
  -> see provenance, related reported evidence and generated output links
```

## Core authority rule

Studio remains downstream from OrbitFabric Core.

Correct pattern:

```text
OrbitFabric Core emits a structured output.
Studio consumes and renders it.
```

Incorrect pattern:

```text
Studio reimplements Core semantics because the required output is missing.
```

If Core does not report a value, Studio must display `unavailable`, `not reported`, `reserved` or `diagnostic`, or omit the relationship.

## Accepted sources

v0.14.0 may consume only the following categories of information:

- Core model summary.
- Core entity index.
- Core relationship manifest.
- Core lint report.
- Core dashboard summary.
- Core coverage summary.
- Core simulation report.
- Core simulation `data_flow_evidence` records.
- Generated artifact inventory.
- Generated artifact file metadata already exposed by Studio.

## Traceability target

The milestone should make these paths more visible when reported by Core or represented by generated artifacts:

```text
Payload -> Data Product -> Storage -> Downlink -> Contact -> Ground Artifact
```

```text
Command -> Mode -> Event -> Telemetry -> Scenario
```

The milestone may also expose:

- runtime skeleton links;
- ground artifact links;
- generated artifact provenance;
- scenario evidence references;
- validation evidence references;
- coverage evidence references;
- Inspector traceability blocks;
- artifact evidence linked into the Workbench.

## Required boundaries

v0.14.0 must not introduce:

- Mission Model authoring.
- YAML editor behavior.
- Generated artifact mutation.
- Command uplink.
- Live telemetry.
- Operational ground behavior.
- Private YAML semantic parsing.
- Private scenario YAML interpretation.
- Private log-derived evidence.
- Private relationship inference.
- Private data-flow inference.
- Private coverage calculation.
- Private mission health calculation.
- Private readiness calculation.
- Private model completeness calculation.
- Autonomy implementation.
- Plugin execution.
- Plugin marketplace.
- Arbitrary command execution.

## UI direction

The two UI north-star references remain visual and product-direction references only.

Reference A, Mission Cockpit, should guide:

- compact dashboard density;
- professional engineering workbench layout;
- clear command bar hierarchy;
- generated artifact and evidence summary placement;
- explicit unavailable states when Core does not report values.

Reference B, Mission Data Flow Workbench, should guide:

- graph/canvas-like central surface;
- persistent Inspector;
- clearer tab hierarchy;
- readable evidence panels;
- artifact and data-flow traceability;
- engineering-console maturity.

The references do not authorize Studio to invent mission health, operational readiness, model completeness, graph semantics, live telemetry, command uplink, plugin behavior or generated artifact mutation.

## React Flow decision

React Flow is deferred for v0.14.0 planning.

Reason:

- The v0.13.0 Workbench already has a read-only canvas-like foundation.
- v0.14.0 is primarily a traceability and Inspector integration milestone.
- Introducing a graph library before the traceability model is stable would increase surface area without solving the main architectural problem.

React Flow may be reconsidered only after the traceability model, Inspector blocks and generated artifact linkage are implemented.

If introduced later, it must be:

- read-only;
- Core-derived;
- without graph editing;
- without drag/drop persistence;
- without layout semantics treated as mission data;
- limited to visualization and selection;
- implemented in a dedicated, rollbackable PR.

## Planned PR sequence

### PR 1 - Planning and boundary document

Scope:

- Add this v0.14.0 planning document.
- Add initial v0.14.0 checklist.
- Update README, ROADMAP and CHANGELOG.
- No application code.

Validation:

```bash
npm run build
```

### PR 2 - Traceability model foundation

Scope:

- Extend the Workbench snapshot with read-only traceability records or blocks.
- Link generated artifact records to existing Workbench evidence only when supported by reported metadata.
- Preserve explicit `not reported` and `unavailable` states.

Non-goals:

- No private relationship inference.
- No graph library adoption.
- No UI authoring.

### PR 3 - Inspector traceability blocks

Scope:

- Add Inspector blocks for selected Core-reported entities, relationships, evidence records and artifacts.
- Show provenance, source report, related reported records and generated output links.
- Show unavailable states when links are not reported.

Non-goals:

- No generated artifact mutation.
- No private evidence derivation.

### PR 4 - Generated Artifacts and Workbench linkage

Scope:

- Link the dedicated Generated Artifacts surface with Workbench artifact evidence.
- Preserve compact read-only preview behavior.
- Expose runtime and ground artifact references as generated output links.

Non-goals:

- No file editing.
- No generated artifact regeneration inside this surface.
- No ground segment behavior.

### PR 5 - Workbench traceability layout polish

Scope:

- Improve Workbench visual hierarchy around traceability.
- Add or refine evidence rails and artifact panels.
- Move closer to Reference B without adding graph semantics.

Non-goals:

- No React Flow.
- No graph editing.
- No layout engine semantics.

### PR 6 - v0.14.0 release hardening

Scope:

- Release notes.
- Checklist closure.
- README, ROADMAP and CHANGELOG alignment.
- Metadata alignment if the milestone is tagged.

Validation:

```bash
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
npm run tauri:dev
```

## Exit criteria

v0.14.0 is complete when:

- generated artifacts are visible as traceability evidence inside the Workbench;
- selected Workbench records expose traceability blocks in the Inspector;
- runtime and ground artifact links are visible when generated output is reported;
- unavailable traceability is explicit rather than inferred;
- Mission Cockpit and Workbench remain aligned with the north-star direction;
- no authoring, mutation, command uplink, live telemetry, plugin behavior or private inference has been introduced.
