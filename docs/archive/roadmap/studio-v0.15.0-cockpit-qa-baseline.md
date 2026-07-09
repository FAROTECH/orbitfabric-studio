# OrbitFabric Studio v0.15.0 - Mission Cockpit QA Baseline

Status: QA baseline recorded
Release status: not released
GitHub Release publication: deferred
Release hardening: blocked
Scope: documentation-only baseline record

---

## Purpose

This document records the engineering status reached after the v0.15.0 Mission Cockpit Realization implementation pass.

The v0.15.0 implementation pass moved the Mission Cockpit significantly closer to the intended north-star direction at the data-model and UI-surface level, but the resulting visual composition did not pass manual visual QA.

This document fixes the baseline before any further architectural UI reset work begins.

This is not a release note, not a version bump and not a tag candidate.

---

## Baseline Decision

The current `main` branch is treated as a technical implementation baseline, not as a presentable v0.15.0 release baseline.

The release hardening phase is explicitly blocked.

The blocker is not OrbitFabric Core integration, workspace inspection, model loading, report parsing or read-only boundary enforcement.

The blocker is the Mission Cockpit presentation layer.

---

## Implementation Pass Completed

The v0.15.0 implementation pass introduced or refined the following areas:

- Mission Cockpit posture model foundation;
- six-slot cockpit KPI model;
- six-card KPI grid;
- Mission Data Contract Overview panel;
- Recent Validation Results panel;
- Recent Scenario Runs panel;
- Generated Artifacts cockpit cards;
- Cockpit cross-navigation rail;
- visual density polish pass.

The implementation preserved the intended architectural boundary:

```text
OrbitFabric Core remains authoritative.
Studio renders Core-derived, workspace-derived or explicitly unavailable states.
Studio must not infer private mission health, completeness, readiness, coverage or operational state.
```

---

## Manual QA Result

Manual visual QA did not pass.

The observed issues are structural, not only cosmetic.

The Mission Cockpit currently behaves as a long vertically stacked page rather than a compact engineering cockpit.

The following issues were identified during manual inspection:

- stale application shell and hero copy is still visible;
- the Cockpit layout is unstable at initial workspace opening;
- lower Cockpit areas visually collide or overlap;
- the page is too long for a cockpit-style surface;
- too many deep-inspection sections are embedded in the Cockpit;
- KPI cards are too verbose;
- boundary and provenance text is always visible instead of being represented through compact affordances;
- Mission Data Flow Workbench content is too heavy to remain embedded inside the Cockpit;
- resizing the window can make sections cut off, overlap or become difficult to read.

---

## Known Stale UI Copy

The following shell-level copy is stale and must not survive the reset:

```text
Mission Contract Engineering Workbench
v0.10.0 Mission Cockpit consolidation preview
COCKPIT FOUNDATION
```

This copy belongs to earlier Cockpit consolidation work and is no longer aligned with the current v0.15.0 direction.

---

## Retained Assets

The current work should not be discarded entirely.

The following assets are considered valuable and should be retained:

- Core-derived workspace inspection flow;
- OrbitFabric Core report parsing;
- Mission Cockpit posture model;
- Mission Data Flow Workbench model;
- generated artifact inventory model;
- validation, scenario and coverage report handling;
- domain navigation surfaces;
- read-only boundary vocabulary;
- generated artifact inspection surface;
- route-level surface switching;
- Tauri and Core command wiring.

These assets form the logical and integration foundation for the next UI phase.

---

## Rejected Direction

The next phase must not continue by adding more panels to the current Cockpit composition.

The following pattern is rejected:

```text
Add another section to MissionCockpit.tsx.
Append another CSS block to missionCockpitVisualHierarchy.css.
Compress the page again.
Call it a cockpit.
```

This pattern has reached its practical limit.

---

## Reset Direction

The next phase should evaluate a Mission Cockpit Presentation Reset.

The working assumption is:

```text
Keep the logical/data layer.
Reset the Cockpit presentation layer.
```

The target division of responsibility should be:

```text
Mission Cockpit:
  answers where the project stands, what is reported, what needs attention and where to go next.

Mission Data Flow Workbench:
  answers how data, relationships, evidence and generated artifacts are connected.

Evidence Console:
  answers what Core reported in validation, scenario and coverage outputs.

Generated Artifact Explorer:
  answers what was generated and what can be inspected.
```

The Cockpit should become a compact visual command surface, not a container for every detailed inspection module.

---

## Reset Guardrails

Any Cockpit reset must preserve the following constraints:

- no Mission Model authoring;
- no generated artifact mutation;
- no command uplink;
- no live telemetry;
- no operational ground behavior;
- no private mission health calculation;
- no private model completeness calculation;
- no private readiness calculation;
- no private coverage calculation;
- no private relationship inference;
- no private data-flow inference;
- no React Flow inside the Cockpit unless separately justified;
- no graph editing.

Graph-library evaluation, including React Flow or equivalent tools, belongs to the Mission Data Flow Workbench direction, not to the Cockpit itself.

---

## Candidate Next Phase

The next phase should start from a deliberate design prompt before writing code.

Candidate phase name:

```text
Mission Cockpit Presentation Reset
```

Candidate first implementation PR:

```text
refactor: reset mission cockpit composition
```

Candidate goals:

- remove the heavy embedded Workbench from the Cockpit;
- remove stale shell copy;
- replace the long vertical Cockpit with a compact visual composition;
- move verbose provenance and guardrail text into compact affordances;
- preserve route links to deeper surfaces;
- keep the data/model layer intact;
- validate with screenshots before any release hardening.

---

## Release Decision

v0.15.0 must not be released from the current visual state.

Release hardening can resume only after one of the following decisions is made:

1. the current Cockpit is structurally reset and passes visual QA;
2. the current work is explicitly reclassified as an internal technical baseline only;
3. the project roadmap is adjusted to move the visual north-star realization into a later milestone.
