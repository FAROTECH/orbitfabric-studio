# E11 — Data Flow Workbench Audit

## Purpose

E11 starts the dedicated Data Flow Workbench phase after the normal desktop surface envelope migration has been closed.

This phase is deliberately an audit, not a migration. Data Flow Workbench was left as a declared special-case by E10 because it behaves more like a dense mini-application than a normal evidence surface.

## Scope

E11 adds a repository-owned audit for the Data Flow Workbench contract.

The audit verifies that:

- Data Flow Workbench remains present in the dev surface capture manifest.
- The QA harness still recognizes it with a stable slug.
- The active surface remains explicit.
- The capture target remains explicit.
- The surface remains fullscreen-only for visual QA.
- It remains intentionally outside the normal `DesktopSurface` migration set.
- Source and CSS/layout footprint can be located from the repository.

## Non-goals

E11 does not change:

- OrbitFabric Core
- the reference mission
- Data Flow semantics
- graph/workflow behavior
- generated artifacts
- screenshot automation
- mobile/tablet support
- Data Flow Workbench layout

## Validation

Run:

```bash
npm run qa:data-flow-workbench-audit
npm run qa:desktop-envelope-audit
npm run qa:visual-checklist
npm run build
git diff --check
```

## Expected outcome

E11 should produce documentation that gives us a clean starting point for the next decision:

1. migrate Data Flow Workbench to `DesktopSurface`,
2. build a dedicated Data Flow desktop shell, or
3. redesign the Workbench around a graph/workflow library when the product contract is clearer.
