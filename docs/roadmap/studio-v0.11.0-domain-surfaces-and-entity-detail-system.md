# OrbitFabric Studio v0.11.0 - Domain Surfaces & Entity Detail System

## Purpose

v0.11.0 introduces the first real mission-domain surfaces after the v0.10.0 Mission Cockpit consolidation.

The goal is to move Studio from a cockpit plus reserved semantic sidebar toward a coherent read-only domain navigation system:

```text
Open workspace
  -> inspect Mission Cockpit
  -> select a mission domain
  -> inspect reported entities for that domain
  -> select an entity
  -> inspect detail, provenance and boundaries
```

Studio remains downstream from OrbitFabric Core.

OrbitFabric Core remains authoritative for validation, scenario evidence, generated artifacts, contract introspection, entity indexing, relationship semantics and future plugin semantics.

## Mandatory references

This milestone is governed by:

```text
docs/roadmap/studio-target-ui-convergence-strategy.md
docs/roadmap/studio-ui-north-star-reference.md
docs/roadmap/studio-v0.10.0-mission-cockpit-consolidation.md
```

v0.11.0 must preserve the accepted route:

```text
v0.9.0  - Semantic Navigation & Unified Shell
v0.10.0 - Mission Cockpit Consolidation
v0.11.0 - Domain Surfaces & Entity Detail System
v0.12.0 - Mission Data Flow Workbench Foundation
v0.13.0 - Evidence-integrated Workbench
v0.14.0 - Artifact Traceability Integration
v0.15.0 - Plugin-aware Studio Surface
```

This milestone is not a graph milestone, not a React Flow milestone, not an authoring milestone and not a plugin milestone.

## Current baseline

v0.10.0 provides:

- local-first Tauri 2 and React shell;
- Mission Cockpit entry point;
- semantic mission-domain sidebar;
- typed navigation model;
- available, unavailable, reserved and diagnostic states;
- persistent Inspector for detail-oriented surfaces;
- structural workspace inspection;
- fixed OrbitFabric Core command wrappers;
- Core-derived report parsers;
- generated artifact inventory;
- Scenario Evidence Explorer;
- Ground Integration Artifact Viewer;
- read-only and Core-derived boundary vocabulary.

The current sidebar already exposes the target domain grammar:

```text
Mission
Spacecraft
Subsystems
Modes
Telemetry
Commands
Events
Faults
Packets
Payloads
Data Products
Contacts & Downlink
Commandability
Autonomy
Scenarios
Generated Artifacts
```

However, most domain entries still route conservatively to the existing Model Inventory surface. v0.11.0 must replace that placeholder behavior incrementally with real domain surfaces.

## Allowed data sources

A v0.11.0 domain surface may consume only these sources:

1. Structural workspace inspection returned by the existing Studio backend.
2. Core `model_summary.json` parsed through the existing Studio parser.
3. Core `entity_index.json` parsed through the existing Studio parser.
4. Core `relationship_manifest.json` only where a surface explicitly labels the data as relationship-manifest-derived and does not render a graph.
5. Core `dashboard_summary.json` for aggregate reported counts only.
6. Core `coverage_summary.json` only where coverage is already reported by Core.
7. Core `scenario_run_index.json` and `orbitfabric-sim` JSON reports only for scenario/evidence surfaces.
8. Generated artifact inventory returned by the existing Studio backend.
9. Read-only source or generated file previews already supported by Studio.
10. Local UI state required for navigation, selection and display.
11. Explicit conservative states: `unavailable`, `not reported`, `reserved`, `diagnostic`.

## Disallowed data sources

A v0.11.0 domain surface must not use:

- private YAML semantic parsing;
- raw YAML scanning to infer entities or relationships;
- naming heuristics;
- frontend-inferred relationships;
- frontend-inferred coverage;
- frontend-inferred readiness;
- frontend-inferred health;
- frontend-inferred completeness;
- log-derived scenario evidence;
- generated artifact semantic interpretation beyond conservative metadata and documented classification;
- runtime telemetry;
- command uplink state;
- ground segment state;
- plugin outputs.

## Domain surface grammar

Every implemented domain surface must follow this common grammar:

```text
Domain surface
  Header
    domain label
    status badge
    provenance badges
    boundary copy
  Summary
    source file presence
    Core report status
    entity count if Core reports it
    unavailable/not reported state when absent
  Entity list
    Core-reported entity records only
    optional source-file preview link
    empty state if not reported
  Entity detail
    selected Core-reported entity fields only
    no invented source locations
    no YAML AST
    no inferred relationships
  Inspector binding
    same selected entity context
    provenance and boundary fields
```

The surface must remain useful even when Core reports are missing. In that case it may show structural source-file presence and explicit `not reported` state, but it must not synthesize entity records.

## Entity list grammar

An entity list may show only fields available in `entity_index.json`:

- `id`;
- `domain`;
- `entity_type`;
- `display_name`;
- `source_file`;
- `provenance`;
- `required_domain`;
- `present`.

Sorting and filtering are allowed only as UI operations on already reported records. They must not change semantics.

Allowed filters:

- entity type;
- presence;
- source file;
- text match over reported id/display name.

Forbidden filters:

- readiness;
- health;
- completeness;
- operational state;
- runtime state;
- coverage state unless the active surface explicitly renders Core `coverage_summary.json`.

## Entity detail grammar

Entity detail may show:

- entity id;
- display name;
- domain;
- entity type;
- source file;
- provenance;
- required-domain flag;
- present flag;
- source preview action if the file is structurally detected;
- raw Core-reported entity record preview.

Entity detail must not show:

- inferred relationships;
- inferred upstream/downstream links;
- YAML line numbers;
- YAML AST paths;
- generated artifact traceability unless a later artifact traceability milestone introduces it from Core or generated inventory;
- operational readiness;
- mission health;
- model completeness.

## Inspector binding grammar

The Inspector must treat a selected entity as a read-only context object.

For selected entities, the Inspector should show:

- kind: `Core entity`;
- domain;
- entity type;
- id;
- display name;
- source file;
- provenance;
- present/not present;
- source: `Core entity_index.json`;
- inference: `none`.

The Inspector must not duplicate a full domain surface. It should summarize the selected object and make provenance explicit.

## Domain availability matrix

| Domain | v0.11.0 status | Eligible sources | Rule |
|---|---|---|---|
| Mission | implemented | Mission Cockpit, workspace inspection, Core summaries, generated inventory | Preserve as entry point. |
| Spacecraft | implement first | workspace inspection, `model_summary.json`, `entity_index.json` | First vertical slice. |
| Subsystems | implement | workspace inspection, `model_summary.json`, `entity_index.json` | Reuse common surface grammar. |
| Modes | implement | workspace inspection, `model_summary.json`, `entity_index.json` | Reuse common surface grammar. |
| Telemetry | implement | workspace inspection, `model_summary.json`, `entity_index.json`, generated docs/dictionaries as preview artifacts only | No live telemetry. |
| Commands | implement | workspace inspection, `model_summary.json`, `entity_index.json`, generated docs/dictionaries as preview artifacts only | No uplink. |
| Events | implement | workspace inspection, `model_summary.json`, `entity_index.json`, generated docs/dictionaries as preview artifacts only | No runtime event stream. |
| Faults | implement | workspace inspection, `model_summary.json`, `entity_index.json`, generated docs/dictionaries as preview artifacts only | No fault management behavior. |
| Packets | implement | workspace inspection, `model_summary.json`, `entity_index.json`, generated docs/dictionaries as preview artifacts only | No protocol execution. |
| Payloads | implement | workspace inspection, `model_summary.json`, `entity_index.json` | No payload runtime behavior. |
| Data Products | implement conservatively | workspace inspection, `model_summary.json`, `entity_index.json`, Core coverage only if reported | No storage or downlink completion inference. |
| Contacts & Downlink | implement conservatively | workspace inspection, `model_summary.json`, `entity_index.json`, Core simulation data-flow fields only when reported | No ground operations. |
| Commandability | implement conservatively | workspace inspection, `model_summary.json`, `entity_index.json` | No command authorization or uplink state. |
| Autonomy | reserved unless Core reports it explicitly | none guaranteed by current structural backend | Do not invent `autonomy.yaml`. |
| Scenarios | already implemented | scenario files, fixed Core sim wrapper, simulation JSON, scenario run index | Preserve Scenario Evidence Explorer. |
| Generated Artifacts | already implemented | generated artifact inventory, read-only previews | Preserve generated artifact explorer. |

## First vertical slice

The first implementation slice after this planning document should be `Spacecraft`.

Reason:

- it is a single domain;
- it is already present in the expected structural mission files;
- it can use the same `model_summary.json` and `entity_index.json` shapes needed by later domains;
- it does not require coverage, relationship rendering, generated artifact traceability or scenario evidence;
- it is the safest place to prove the Domain Surface, Entity List and Entity Detail grammar.

The first code PR should not promote every domain at once.

## Recommended PR sequence

1. Add this v0.11.0 planning document.
2. Add shared domain surface model types.
3. Add reusable Domain Surface shell components.
4. Implement the Spacecraft domain surface.
5. Add Core entity detail selection and Inspector binding.
6. Promote Subsystems, Modes, Telemetry and Commands using the shared grammar.
7. Promote Events, Faults, Packets, Payloads and Data Products using the shared grammar.
8. Promote Contacts & Downlink and Commandability conservatively.
9. Keep Autonomy reserved unless Core-reported data is available.
10. Clean up legacy routing for domains implemented by v0.11.0.
11. Close v0.11.0 with release notes, checklist and metadata alignment.

Every PR must be small, reviewable and independently buildable.

## Validation policy

Every code PR must run:

```bash
npm run build
```

Every PR that touches Tauri or Rust code must also run:

```bash
cargo check --manifest-path src-tauri/Cargo.toml
```

The planning-only PR does not require a runtime validation command, but it must not change code.

## Implementation guardrails

- Prefer additive components over broad rewrites.
- Do not rewrite `src/App.tsx` wholesale.
- Preserve the Mission Cockpit as the primary entry point.
- Preserve the existing Scenario Evidence Explorer.
- Preserve the existing Generated Artifact Explorer.
- Preserve the existing Ground Integration Artifact Viewer.
- Preserve fixed Core command wrappers.
- Preserve read-only file previews.
- Preserve existing Core report parsers.
- Preserve explicit unavailable and not reported states.
- Use Core-derived records exactly as reported.
- Use generated artifacts only as generated artifact metadata or previewable files.

## Explicit non-goals

v0.11.0 does not introduce:

- Mission Model editing;
- generated artifact editing;
- generated artifact mutation;
- private YAML semantic parsing;
- private relationship inference;
- private coverage calculation;
- private mission health calculation;
- private readiness calculation;
- private model completeness calculation;
- graph UI;
- React Flow;
- authoring;
- plugin execution;
- plugin marketplace;
- live telemetry;
- telemetry archive behavior;
- command uplink behavior;
- mission control behavior;
- operational ground behavior;
- runtime spacecraft behavior.

## Exit criteria

v0.11.0 is complete only when:

1. At least one real mission-domain surface exists outside the legacy Model Inventory wrapper.
2. The shared Domain Surface grammar is implemented and reused.
3. Core-reported entity lists are visible per implemented domain.
4. Selecting an entity provides a conservative detail view.
5. The Inspector reflects selected entity context without inventing semantics.
6. Domains without enough data show `reserved`, `unavailable` or `not reported` states.
7. Mission Cockpit remains the entry point.
8. Existing generated artifact, scenario evidence and ground artifact surfaces remain read-only.
9. No graph UI, React Flow, authoring, plugin execution, command uplink, live telemetry or generated artifact mutation is introduced.
10. Release closure includes release notes, checklist, metadata alignment and explicit validation results.
