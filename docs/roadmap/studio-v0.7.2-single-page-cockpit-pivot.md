# OrbitFabric Studio v0.7.2 - Single-page Cockpit Pivot

## Status

```text
Milestone: v0.7.2 - Core-derived Dashboard UX Realization
Status: Pivot accepted
Nature: UI architecture correction
Primary loop: Open workspace -> Read compact mission cockpit -> Drill into details only on demand
```

## Decision

The v0.7.2 implementation is pivoting from a vertically stacked report page to a single-page engineering cockpit.

The previous v0.7.2 work remains valid as data foundation:

- Core report snapshots;
- dashboard shell state;
- validation and model inventory cards;
- scenario run card;
- coverage card;
- generated artifact card;
- dashboard command/header polish.

However, the current UI model still renders too many read-only surfaces sequentially in one long vertical flow.

That is not the target user experience.

The target user experience is a compact cockpit inspired by the reference dashboard and data-flow workbench mockups:

- fixed application shell;
- left iconographic navigation rail;
- top command bar;
- central single active surface;
- compact KPI and status cards;
- contextual right inspector or drawer;
- detail panels opened only on demand;
- no long always-visible report stack.

## Problem observed during local validation

The current dashboard can display a technically correct but operationally unusable vertical page.

After opening a workspace and running Core exports, the main surface can include, in one continuous scroll:

- overview hero;
- primary loop explanation;
- non-goals;
- workspace dashboard;
- scenario evidence explorer;
- reserved future surfaces;
- workspace inspection;
- Core command panel;
- parsed Core dashboard summary;
- generated artifact explorer;
- source model file lists;
- scenario source lists;
- generated report lists;
- read-only viewer.

This is correct from a data-boundary perspective, but wrong from a workbench UX perspective.

v0.7.2 must not close with that layout model.

## New target model

Studio must behave as an application workbench, not as a document page.

The main application frame is:

```text
Top command bar
Left surface navigation
Central active surface
Right inspector / detail drawer
Bottom status strip
```

Only one primary surface is visible at a time.

Secondary information is opened through explicit user action.

The dashboard shows the state of the mission contract and the entry points to detail, not the full detail itself.

## UI rules

### Rule 1: One active surface

Only one primary surface may be rendered in the main work area at a time.

Allowed active surfaces include:

- Mission Dashboard;
- Model Inventory;
- Scenario Evidence;
- Generated Artifacts;
- Core Commands;
- Reports and Logs;
- Reserved Future Surface.

Surfaces must not be stacked vertically by default.

### Rule 2: Dashboard is a cockpit, not a report

The dashboard must show compact operational summaries:

- validation status;
- model inventory status;
- scenario run status;
- coverage availability;
- generated artifact availability;
- recent validation or scenario indicators when Core data exists;
- boundary and reserved indicators in compact form.

The dashboard must not render full parsed reports inline.

### Rule 3: Detail is on demand

Long information must be opened in one of:

- right inspector;
- detail drawer;
- modal detail panel;
- active secondary surface;
- compact table with scroll inside the panel.

Examples:

- validation findings;
- complete model domain inventory;
- complete relationship type list;
- complete coverage details;
- generated artifact lists;
- raw Core output;
- report previews;
- source file lists;
- scenario source lists.

### Rule 4: Text must be compressed

Explanatory prose must move out of the main dashboard path.

Allowed locations for explanation:

- tooltip;
- help popover;
- inspector note;
- documentation;
- reserved detail panel.

The primary cockpit must prioritize labels, values, badges, icons and concise action text.

### Rule 5: Iconography is first-class UI

The cockpit must use a consistent internal icon system.

Initial icon set:

- Mission;
- Spacecraft;
- Subsystems;
- Modes;
- Telemetry;
- Commands;
- Events;
- Faults;
- Packets;
- Payloads;
- Data Products;
- Contacts and Downlink;
- Commandability;
- Autonomy;
- Scenarios;
- Generated Artifacts;
- Validation;
- Coverage;
- Evidence;
- Runtime;
- Ground;
- Inspector;
- Reports;
- Core.

Preferred implementation:

- inline React SVG components;
- no external icon dependency for the first cockpit pass;
- stroke-based technical line icons;
- rounded caps and joins;
- cyan, blue, green and violet accents through CSS classes;
- reusable `StudioIcon` or specific icon components.

### Rule 6: Source authority remains unchanged

The cockpit must not introduce semantic shortcuts.

Still forbidden:

- mission health score unless Core defines it;
- model completeness score unless Core defines it;
- private coverage calculation;
- alternative coverage percentages;
- scenario history inferred from logs;
- YAML semantic parsing;
- generated artifact semantic inference;
- runtime readiness claims;
- ground segment behavior;
- command uplink behavior;
- live telemetry behavior;
- editing;
- authoring.

## Surface architecture

### Application state

The UI needs explicit surface state:

```text
activeSurface
selectedDetail
inspectorMode
drawerOpen
```

Suggested active surfaces:

```text
mission-dashboard
model-inventory
scenario-evidence
generated-artifacts
core-commands
reports-logs
reserved-ground
```

### Main surface behavior

The main surface renders only the selected surface.

Example:

```text
activeSurface = mission-dashboard
-> render MissionCockpitDashboard only

activeSurface = scenario-evidence
-> render ScenarioEvidenceWorkbench only

activeSurface = generated-artifacts
-> render GeneratedArtifactSurface only
```

### Inspector behavior

The inspector displays contextual details for the selected card, entity, report, artifact or scenario run.

The inspector must be visually persistent in desktop layouts and collapsible in narrow layouts.

It must remain read-only.

### Detail drawer behavior

The detail drawer is used for information too large for a KPI card but not important enough to become the active surface.

Examples:

- validation findings preview;
- model domain list;
- relationship type list;
- coverage unsupported scopes;
- generated artifact status list;
- raw Core command metadata.

## Target dashboard composition

The compact Mission Dashboard should contain:

### Top KPI row

- Contract Validation;
- Model Inventory;
- Scenario Runs;
- Coverage Summary;
- Generated Artifacts.

Each card includes:

- icon;
- title;
- primary value;
- status badge;
- one short subtitle;
- detail action.

### Middle work area

Suggested two-column layout:

Left:

- Mission Data Contract Overview;
- compact domain rows with progress indicators;
- entity and relationship inventory summary.

Right:

- Recent Validation Results;
- Recent Scenario Runs;
- warnings and unavailable states.

### Bottom strip

- generated artifacts quick cards;
- workspace/model/schema/core status;
- local read-only state.

This bottom strip must remain compact and must not expand into a long explorer.

## What is removed from the default vertical flow

The following must not render below the dashboard by default:

- Scenario Evidence Explorer;
- Reserved Future Surfaces;
- Workspace Inspection;
- Core command panel;
- parsed dashboard summary report;
- Generated Artifact Explorer;
- source model files;
- scenario source files;
- generated locations;
- raw file viewer.

They remain available through active surfaces, detail panels or inspector views.

## Implementation sequence

### PR A: document cockpit pivot

This document and checklist updates.

No runtime code.

### PR B: surface state foundation

Add UI state for active surface and selected detail.

No visual overhaul yet.

### PR C: single active surface rendering

Stop rendering all major surfaces sequentially.

Render only the active surface in the main work area.

Existing components are preserved and moved behind surface selection.

### PR D: compact Mission Cockpit Dashboard

Replace the long dashboard content with compact cockpit cards.

No new data semantics.

### PR E: right inspector / detail drawer

Introduce the read-only detail panel for card drilldown.

Move long card details out of the main cockpit.

### PR F: internal icon system

Add inline SVG icon components and apply them to sidebar, cards and actions.

### PR G: cockpit responsive closure

Tune desktop and narrow layouts.

Validate no horizontal overflow and no long always-visible report stack.

### PR H: release metadata

Only after the cockpit model is validated:

- README;
- CHANGELOG;
- ROADMAP;
- package and Tauri versions;
- final checklist closure.

## Acceptance criteria

v0.7.2 can close only when:

- the primary dashboard fits mostly in one desktop viewport;
- major surfaces are not stacked vertically;
- dashboard cards provide detail actions instead of inline long detail;
- generated artifact lists are not always visible on the dashboard;
- source model file lists are not always visible on the dashboard;
- parsed Core reports are not always visible on the dashboard;
- Scenario Evidence is an active surface, not a default vertical block;
- Generated Artifacts is an active surface, not a default vertical block;
- Core Commands is an active surface or compact panel, not a default vertical block;
- the right inspector or drawer shows selected detail;
- visual density and iconography are close to the reference mockups;
- all values remain source, Core-derived, generated or local UI state;
- no forbidden semantic inference is introduced;
- `npm run build` passes;
- `cargo check --manifest-path src-tauri/Cargo.toml` passes.

## Release decision

The current v0.7.2 implementation must not be tagged as final until the cockpit pivot is implemented.

The parked responsive-polish branch should not be merged as the v0.7.2 closure, because it improves the old vertical model instead of replacing it.

The correct v0.7.2 closure is the single-page cockpit realization.
