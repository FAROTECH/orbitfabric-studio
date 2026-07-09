# E12 — Data Flow Workbench Desktop Contract

## Status

Planned/implemented as a narrow hardening slice.

## Purpose

Stabilize Data Flow Workbench as a desktop workbench surface after E11 confirmed it was the only remaining special-case public surface.

E12 promotes Data Flow Workbench to a dedicated desktop contract while preserving its mini-application character.

## Scope

- wrap `MissionDataFlowWorkbenchSurface` with `DesktopSurface`
- add `src/dataFlowWorkbenchDesktopEnvelope.css`
- require both `desktop-reference-1440x900` and `desktop-fullscreen` captures in the visual QA manifest
- update Data Flow audit expectations from special-case to desktop-contract
- update the desktop envelope migration audit so Data Flow appears in migrated coverage
- regenerate QA docs/checklists

## Acceptance criteria

- `npm run qa:data-flow-workbench-audit` passes
- `npm run qa:desktop-envelope-audit` passes
- `npm run qa:visual-checklist` passes
- `npm run build` passes
- `git diff --check` passes
- visual QA capture: Data Flow Workbench fullscreen
- visual QA capture: Data Flow Workbench desktop-reference around 1400/1440
- smoke capture: Mission Overview fullscreen
- smoke capture: Core Report Runner fullscreen
- smoke capture: Data Products fullscreen
- smoke capture: Generated Artifacts fullscreen
- smoke capture: Scenario Evidence fullscreen

## Non-goals

- no OrbitFabric Core changes
- no reference mission changes
- no Data Flow semantics changes
- no graph/workflow behavior changes
- no drawer/focus-mode behavior changes
- no screenshot automation changes
- no mobile/tablet support

## E12.2 Body layout refinement

Follow-up stabilization after visual QA:

- removes the accidental horizontal scrollbar from the Core Route Canvas stage grid;
- treats the Data Flow body as a workbench mini-application rather than a dense side-by-side dashboard;
- stacks canvas and inspector at Studio shell widths where the sidebar/right rail reduce the usable surface width;
- keeps the five-stage route canvas readable in fullscreen and falls back to three/two-column structures at reference widths;
- makes the expanded scenario timeline use a safer stacked table/canvas layout at reference width.

No Core semantics, scenario execution behavior, generated artifacts, or data-flow records are changed.

## E12.3 Canvas connector cleanup

The Core Route Canvas no longer renders the legacy horizontal connector pseudo-element between stage cards.
The connector was visually ambiguous after the responsive workbench layout changes and appeared as an accidental green hairline in both reference and fullscreen profiles.

No data-flow semantics, Core evidence, scenario execution, drawer behavior, or focus-mode behavior are changed.

## E12.4 selected path connector cleanup

Removed residual connector pseudo-elements from the selected flow path. The selected path is now expressed by explicit route chips only; this avoids stray horizontal line artifacts after the responsive Data Flow body contract.

## E12.5 focus-mode capture contract

Focus mode is now treated as part of the Data Flow Workbench desktop contract. Its root also carries the `mission-data-flow-workbench` target class so the dev QA capture harness continues to resolve `Data Flow Workbench` instead of falling back to `active-surface`. The focus layout is stacked at the 1400 reference width and remains a three-column workspace only when the real content width supports it.

## Focus graph alignment

- E12.6 aligns the focus route graph to the top of the focus panel and prevents the route graph from appearing vertically centered across long evidence pages.
