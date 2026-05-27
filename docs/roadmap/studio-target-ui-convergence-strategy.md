# OrbitFabric Studio - Target UI Convergence Strategy

## Status

```text
Decision document: Target UI convergence strategy
Status: Accepted planning direction
Starting baseline: v0.8.0 - Ground Integration Artifact Viewer
Target direction: mission-domain cockpit and integrated data-flow workbench
```

## Purpose

This document fixes the UI convergence trajectory for OrbitFabric Studio after the v0.8.0 Ground Integration Artifact Viewer baseline.

It exists to keep future implementation work aligned with the intended product direction across this chat, future chats and future pull requests.

The current Studio baseline is technically disciplined and already useful, but it is still primarily a set of implemented surfaces. The target UI direction is more ambitious: Studio should converge toward a mission-domain cockpit and an integrated data-flow workbench.

This is not a cosmetic restyle.

It is an information architecture and product-structure convergence plan.

## UI north star reference

The visual and conceptual north star for the Mission Cockpit and Mission Data Flow Workbench direction is documented in:

`docs/roadmap/studio-ui-north-star-reference.md`

The reference images guide visual hierarchy, density, layout grammar and product direction.

They do not authorize Studio to invent mission health, operational readiness, model completeness, coverage semantics, graph semantics, live telemetry behavior, command uplink behavior, plugin behavior or generated artifact mutation.

## Reference target UI direction

The target UI direction is represented by two product-level mockups:

1. Mission cockpit/dashboard.
2. Mission data-flow workbench.

These mockups imply:

- a semantic mission-domain sidebar;
- a global command bar;
- a compact cockpit dashboard;
- a persistent contextual inspector;
- domain-oriented model navigation;
- integrated graph, scenario, validation and evidence views;
- generated artifact and ground artifact traceability;
- a strict read-only and Core-derived boundary unless explicitly changed by a future controlled authoring milestone.

## Current UI diagnosis after v0.8.0

The current UI is a solid foundation.

It provides:

- local-first Tauri shell;
- workspace opening and inspection;
- read-only source and generated artifact preview;
- Core command execution through fixed wrappers;
- Core-derived reports;
- scenario evidence inspection;
- generated artifact explorer;
- Ground Integration Artifact Viewer;
- contextual Inspector pattern;
- conservative provenance and boundary language.

However, it remains too surface-oriented.

The current UI is closer to a technical workbench made of separate surfaces than to a unified mission-domain cockpit.

The main gap is structural, not visual.

## Core design rule

Studio must continue to obey this rule:

```text
OrbitFabric Core owns mission semantics.
Studio renders, navigates, previews and explains Core-derived or generated information.
Studio must not invent engineering meaning privately.
```

This rule applies to all future UI convergence work.

The UI may become richer, denser and more visually integrated, but it must not create unsupported mission health, model completeness, graph semantics, coverage semantics, operational readiness, live telemetry behavior or ground compatibility claims.

## Target product grammar

Future UI work should converge on this interaction grammar:

```text
Open workspace
  -> inspect mission cockpit
  -> navigate mission domains
  -> select entity or artifact
  -> inspect detail, provenance and warnings
  -> validate, run scenario or generate artifacts through fixed actions
  -> trace evidence and generated outputs
```

The target is not a generic dashboard.

The target is a mission contract engineering cockpit.

## Current surface convergence matrix

| Current surface | Target destination | Decision |
|---|---|---|
| Mission Dashboard | Mission Cockpit | Keep and deeply consolidate. |
| Model Inventory | Domain surfaces | Split into semantic mission-domain navigation. |
| Core Commands | Global command bar / diagnostics | Declass from primary surface. |
| Contracts | Domain surfaces and inspector detail | Absorb into semantic domains. |
| Relationships | Mission Data Flow Workbench | Evolve toward graph/data-flow views. |
| Generated Artifacts | Artifact domain + dashboard tiles + flow endpoints | Keep and integrate. |
| Reports & Logs | Diagnostics / evidence support | Declass from primary surface. |
| Scenario Evidence | Scenario Runner / Data Flow Evidence / timeline | Integrate into workbench. |
| Ground Integration | Ground artifact viewer + data-flow endpoint | Keep, then integrate into traceability. |
| Raw Output | Developer diagnostics drawer | Declass from primary surface. |

## Sidebar convergence

The current sidebar is implementation-surface oriented.

The target sidebar is mission-domain oriented.

Target sidebar domains:

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

Diagnostic and developer-oriented surfaces should remain accessible, but not as the dominant navigation model.

## Inspector convergence

The Inspector must become a persistent product primitive.

It should handle:

- selected entity;
- selected graph node;
- selected generated artifact;
- selected ground artifact;
- selected validation finding;
- selected scenario evidence record;
- provenance;
- warnings;
- generated output links;
- traceability links;
- unsupported or unavailable state.

The Inspector must not invent semantics. It should display reported, generated or explicitly unavailable information.

## Command bar convergence

The top command bar should become the primary controlled action surface.

Target actions:

```text
Validate Mission
Run Scenario
Generate Docs
Generate Runtime Skeleton
Generate Ground Artifacts
```

Actions must remain fixed, controlled and non-arbitrary.

Core Commands as a full primary surface should be de-emphasized over time and retained as a diagnostic or advanced utility surface.

## Dashboard convergence

The Mission Dashboard should converge toward a compact cockpit.

Target dashboard blocks:

- Mission Health;
- Model Completeness;
- Lint Status;
- Scenario Coverage;
- Data Product Coverage;
- Commandability Coverage;
- Mission Data Contract Overview;
- Recent Validation Results;
- Recent Scenario Runs;
- Generated Artifacts.

Critical rule: these blocks may show unavailable, not reported or Core-required states. Studio must not fabricate scores or percentages that Core does not report or that are not documented as explicit UI-only summaries.

## Data-flow workbench convergence

The Mission Data Flow Workbench is the long-term center of the visual product experience.

Target workbench capabilities:

- Graph View;
- YAML View;
- Scenario Runner;
- Data Flow Evidence;
- node selection;
- inspector binding;
- minimap;
- layout controls;
- filters;
- scenario timeline;
- lint and validation results;
- artifact traceability.

The graph must be based only on Core-derived reports, generated artifacts or explicitly documented relationship data. No private graph semantics are allowed.

## Rebaselined roadmap direction

The previous plugin-aware milestone should not be implemented immediately after v0.8.0.

Plugin-awareness should be postponed until the shell, information architecture, inspector, cockpit and workbench foundations are stable.

The accepted UI convergence roadmap is:

```text
v0.9.0  - Semantic Navigation & Unified Shell
v0.10.0 - Mission Cockpit Consolidation
v0.11.0 - Domain Surfaces & Entity Detail System
v0.12.0 - Mission Data Flow Workbench Foundation
v0.13.0 - Evidence-integrated Workbench
v0.14.0 - Artifact Traceability Integration
v0.15.0 - Plugin-aware Studio Surface
```

## v0.9.0 - Semantic Navigation & Unified Shell

Purpose:

Transform Studio from surface-oriented navigation to mission-domain-oriented navigation.

Scope:

- semantic sidebar;
- global top command bar consolidation;
- persistent inspector behavior;
- footer/status bar consistency;
- mapping from legacy surfaces to new navigation destinations;
- explicit available, unavailable, reserved and diagnostic states;
- no new Core semantics;
- no graph UI;
- no React Flow;
- no authoring.

Exit criterion:

Studio must start to look and behave like a mission-domain workbench rather than a collection of implementation surfaces.

## v0.10.0 - Mission Cockpit Consolidation

Purpose:

Move the Mission dashboard substantially closer to the target cockpit mockup.

Scope:

- KPI card grid;
- Mission Data Contract Overview;
- Recent Validation Results;
- Recent Scenario Runs;
- Generated Artifacts tiles;
- explicit unavailable states;
- Core-derived or documented summaries only.

Non-goals:

- no invented mission health;
- no invented model completeness;
- no invented coverage semantics;
- no graph UI.

## v0.11.0 - Domain Surfaces & Entity Detail System

Purpose:

Introduce real semantic domain surfaces.

Target domains:

```text
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
```

Scope:

- consistent domain surface template;
- entity list/detail patterns;
- inspector binding;
- Core-derived or generated data only;
- unavailable states when Core does not report enough information.

## v0.12.0 - Mission Data Flow Workbench Foundation

Purpose:

Introduce the foundational graph/data-flow workspace.

Scope:

- Graph View;
- node cards;
- edge rendering;
- selection model;
- inspector binding;
- minimap;
- layout controls;
- filters;
- Core-derived or report-derived relationships only.

Non-goals:

- no invented graph semantics;
- no arbitrary graph editing;
- no authoring;
- no plugin execution.

## v0.13.0 - Evidence-integrated Workbench

Purpose:

Integrate scenario evidence, validation and timeline into the workbench.

Scope:

- YAML View tab;
- Scenario Runner tab;
- Data Flow Evidence tab;
- scenario timeline panel;
- lint and validation results panel;
- node-to-evidence linking;
- warning-to-node linking.

Non-goals:

- no private scenario runner;
- no log-derived evidence;
- no dynamic spacecraft simulator;
- no live telemetry.

## v0.14.0 - Artifact Traceability Integration

Purpose:

Connect generated artifacts, runtime outputs and ground artifacts into the mission flow.

Scope:

- Payload -> Data Product -> Storage -> Downlink -> Contact -> Ground Artifact traceability;
- Command -> Mode -> Event -> Telemetry -> Scenario traceability;
- runtime skeleton links;
- ground artifact links;
- generated artifact provenance;
- inspector traceability blocks.

Non-goals:

- no generated artifact mutation;
- no runtime execution;
- no ground segment behavior;
- no command uplink;
- no live decoder.

## v0.15.0 - Plugin-aware Studio Surface

Purpose:

Introduce plugin-awareness only after the UI foundation is stable.

Reason for postponement:

Plugin-awareness depends on stable shell, navigation, inspector, cockpit and workbench foundations. Adding plugin-aware behavior before those foundations would create a fragile product structure.

Non-goals until v0.15.0:

- no plugin execution;
- no plugin marketplace;
- no plugin-defined arbitrary UI behavior;
- no arbitrary command execution.

## Deprecated immediate direction

The previous immediate trajectory toward plugin-aware Studio work is superseded by this convergence plan.

Plugin-aware work is not cancelled.

It is postponed until after the mission-domain UI, cockpit and workbench convergence are complete.

## Implementation policy for future PRs

Future PRs should state explicitly which convergence milestone they belong to.

Every implementation PR should preserve:

- Core authority;
- read-only default behavior;
- no invented semantics;
- no arbitrary command execution;
- no generated artifact mutation;
- no mission control behavior;
- no command uplink behavior;
- no live telemetry behavior;
- no ground segment behavior unless a future roadmap explicitly changes that boundary.

## Final decision

The accepted route after v0.8.0 is:

```text
First stabilize the UI as a mission-domain cockpit and integrated workbench.
Then introduce plugin-awareness.
```

This document is the reference planning anchor for the next Studio milestones.
