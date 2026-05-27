# OrbitFabric Studio v0.10.0 - Mission Cockpit Consolidation

## Purpose

v0.10.0 consolidates the Mission Dashboard into a clearer Mission Cockpit.

The goal is to move Studio closer to the accepted visual direction without changing the fundamental boundary of the product.

Studio remains downstream from OrbitFabric Core.

OrbitFabric Core remains authoritative for validation, scenario evidence, generated artifacts, contract introspection, entity indexing, relationship semantics and future plugin semantics.

## Mandatory reference

The visual and conceptual north star for this milestone is:

```text
docs/roadmap/studio-ui-north-star-reference.md
```

For v0.10.0, the primary visual reference is:

```text
Reference A - Mission Cockpit
```

The reference guides:

- layout grammar;
- information density;
- cockpit hierarchy;
- KPI/card organization;
- mission overview composition;
- recent validation and scenario presentation;
- generated artifact summary presentation;
- sidebar, cockpit and Inspector balance.

The reference does not authorize Studio to invent unsupported mission semantics.

## Current baseline

v0.9.0 introduced the semantic navigation and unified shell baseline:

- mission-domain-oriented sidebar;
- typed navigation model;
- explicit legacy surface mapping;
- `available`, `unavailable`, `reserved` and `diagnostic` states;
- model-backed shell command actions;
- persistent Inspector;
- shell status bar;
- explicit read-only and Core-derived boundaries.

v0.10.0 must build on that shell without introducing authoring, graph behavior or plugin behavior.

## Primary loop

```text
Open workspace -> Inspect Mission cockpit -> Understand reported, unavailable and generated state
```

The Mission Cockpit must help the user understand what Studio can safely report now.

It must not imply real mission operations, onboard runtime state, live telemetry, command uplink or ground segment behavior.

## Scope

v0.10.0 may consolidate:

- Mission Dashboard visual hierarchy;
- cockpit top status strip;
- KPI/card row;
- contract overview panel;
- recent validation panel;
- recent scenario run panel;
- generated artifact summary panel;
- coverage summary panel only where Core has reported coverage data;
- unavailable and not reported states;
- provenance visibility for every cockpit section;
- explicit distinction among source model, Core-derived report, generated output and UI state.

## Allowed data sources

The cockpit may use only:

- structural workspace inspection returned by the existing Studio backend;
- Core-derived reports already parsed by Studio;
- generated artifact inventory returned by the existing Studio backend;
- local UI state required to display current workspace, active surface or selected context;
- explicit `unavailable`, `not reported`, `reserved` or `diagnostic` states.

## Disallowed data sources

The cockpit must not use:

- private YAML semantic parsing;
- frontend-inferred relationship semantics;
- frontend-inferred coverage;
- frontend-inferred completeness;
- frontend-inferred health;
- frontend-inferred readiness;
- log-derived scenario evidence;
- generated artifact semantic interpretation beyond conservative metadata and existing classification;
- runtime telemetry;
- external ground system state;
- plugin outputs.

## Cockpit data provenance classes

Every visible cockpit item must be explainable by one of these classes:

```text
source model structural detection
Core-derived report
generated artifact inventory
local UI state
unavailable
not reported
reserved
diagnostic
```

If a value cannot be mapped to one of these classes, it must not be shown.

## Vocabulary rules

Allowed vocabulary:

- reported;
- unavailable;
- not reported;
- reserved;
- diagnostic;
- Core-derived;
- generated;
- source model;
- structural detection;
- preview only;
- read-only.

Forbidden as computed Studio concepts:

- mission health;
- operational readiness;
- model completeness;
- private coverage score;
- runtime state;
- live telemetry state;
- commandability state not emitted by Core;
- downlink completion state not emitted by Core.

These terms may appear only as non-goals, unsupported states or explicit boundary language.

## Target cockpit composition

v0.10.0 should move the Mission surface toward this composition:

```text
Semantic shell
  Left sidebar: mission-domain navigation
  Top command area: controlled workspace and Core actions
  Center: Mission Cockpit
    Top strip: workspace and reported state summary
    KPI/card row: validation, model inventory, scenarios, coverage, artifacts
    Main panels: contract overview, validation, scenario runs, coverage, generated artifacts
    Bottom rail: explicit safety and provenance boundary
  Right panel: persistent Inspector
  Footer/status bar: shell state and boundary
```

The implementation may remain incremental. The milestone does not require a full visual redesign in a single PR.

## Relationship to the north star images

### Mission Cockpit reference

Used directly in v0.10.0 for:

- layout density;
- card hierarchy;
- cockpit rhythm;
- mission overview placement;
- recent results placement;
- generated artifact summary placement.

Not copied semantically where Core does not provide data.

### Mission Data Flow Workbench reference

Reserved for later milestones:

- v0.12.0 - Mission Data Flow Workbench Foundation;
- v0.13.0 - Evidence-integrated Workbench.

v0.10.0 may consider it only for long-term direction.

It must not introduce graph UI, React Flow, data-flow canvas, graph semantics or workbench tabs.

## Recommended PR sequence

1. Cockpit vocabulary cleanup.
2. Cockpit data provenance clarification.
3. KPI card copy normalization.
4. Unavailable and not reported state cleanup.
5. Mission Cockpit visual hierarchy consolidation.
6. Optional mechanical extraction of the Mission Cockpit component.
7. v0.10.0 release closure.

Each PR must be small and reviewable.

No PR should rewrite `src/App.tsx` wholesale.

## Implementation guardrails

- Prefer local, mechanical refactors over broad rewrites.
- Preserve existing command wrappers.
- Preserve fixed Core command execution boundaries.
- Preserve existing report parsers.
- Preserve generated artifact read-only behavior.
- Preserve Inspector behavior.
- Preserve shell navigation state semantics.
- Do not introduce graph libraries.
- Do not introduce React Flow.
- Do not introduce new dependencies unless explicitly justified in a later milestone.

## Explicit non-goals

v0.10.0 does not introduce:

- Mission Model editing;
- generated artifact editing;
- generated artifact mutation;
- visual authoring;
- graph UI;
- React Flow adoption;
- plugin execution;
- plugin marketplace;
- live telemetry;
- telemetry archive behavior;
- command uplink behavior;
- mission control behavior;
- operational ground behavior;
- private YAML semantic parsing;
- private coverage calculation;
- private mission health calculation;
- private readiness calculation;
- private model completeness calculation.

## Exit criteria

v0.10.0 is complete when:

1. The Mission Cockpit follows the north star visual direction at the level of layout grammar, density and hierarchy.
2. Cockpit cards clearly distinguish Core-derived reports, generated artifacts, structural workspace inspection and UI state.
3. Missing Core data is shown as `unavailable`, `not reported`, `reserved` or `diagnostic`.
4. The cockpit does not compute private health, readiness, completeness or coverage semantics.
5. The Inspector remains persistent and coherent with the cockpit.
6. The shell status bar remains visible and boundary-oriented.
7. No graph, React Flow, authoring, plugin execution, command uplink, live telemetry or generated artifact mutation is introduced.
8. `npm run build` and `cargo check --manifest-path src-tauri/Cargo.toml` are run locally before release closure.

## Release closure requirements

The v0.10.0 release closure must include:

- release notes;
- release checklist;
- metadata alignment if the milestone is shipped as `0.10.0`;
- explicit validation results;
- explicit non-goals preserved during the milestone.
