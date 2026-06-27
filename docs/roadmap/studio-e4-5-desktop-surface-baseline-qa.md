# Studio E4.5 - Desktop Surface Baseline QA

Status: accepted baseline audit
Depends on: E0 QA capture harness, E1 desktop envelope contract, E2 layout primitives, E3 Mission Overview migration, E4 Core Report Runner migration
Scope: evidence-only desktop surface QA audit

---

## Purpose

This baseline records the first post-E3/E4 visual QA evidence across the primary public Studio surfaces.

The goal is to decide whether the project should proceed to E5 visual QA automation or pause for another layout normalization slice.

No product semantics, Core commands, generated artifacts, mission data, routing or surface behavior are changed by this note.

---

## Captured Evidence

All captures were produced by the dev-only E0 QA harness with `VITE_OF_DEV_CAPTURE=1`.

| Surface | Viewport | Captured content | Target | Result |
| --- | ---: | ---: | --- | --- |
| Mission Overview | 1920x1080 | 1510x1002 | `.main-surface .mission-target` | Pass |
| Mission Overview | 1400x792 | 1059x1977 | `.main-surface .mission-target` | Pass, vertically long but ordered |
| Core Report Runner | 1920x1080 | 1540x1419 | `.main-surface-core-report-runner .core-report-runner-surface` | Pass |
| Core Report Runner | 1400x792 | 1081x2453 | `.main-surface-core-report-runner .core-report-runner-surface` | Pass, compact desktop stacks vertically |
| Data Products | 1920x1080 | 1528x1434 | `.main-surface-data-products .data-products-cockpit-surface` | Pass |
| Scenarios | 1920x1080 | 1528x2783 | `.main-surface-scenario-evidence .scenario-evidence-cockpit` | Pass, intentionally long evidence surface |
| Generated Artifacts, populated | 1920x1080 | 1518x3982 | `.main-surface-generated-artifacts .generated-artifacts-surface` | Pass, long inventory table |
| Generated Artifacts, empty | 1920x1080 | 1518x866 | `.main-surface-generated-artifacts .generated-artifacts-surface` | Pass |
| Data Flow Workbench | 1920x1080 | 1160x1827 | `.main-surface .mission-data-flow-workbench` | Pass as recognized target, remains special-case width |

---

## Findings

Mission Overview and Core Report Runner are now the golden desktop-envelope candidates.

Both surfaces remain correctly identified by the capture harness after migration to the shared desktop primitives. Neither surface falls back to `active-surface`, and both preserve explicit capture targets.

Data Products is visually coherent and does not require an immediate emergency slice.

Scenarios is long, but the length is intrinsic to chronological evidence and inspector content. It is not a shell or target bug.

Generated Artifacts has two valid states: compact empty state and very long populated inventory. The populated table is dense, but this is expected for the current artifact-lineage board.

Data Flow Workbench is correctly recognized after E0 correction, but remains a special surface: its content width is significantly narrower than the other main cockpit surfaces. That should not block E5, but it should not be migrated before the graph/workbench direction is clarified.

---

## Decision

No E4.6 normalization slice is required before E5.

The project should proceed to E5 with a narrow goal:

```text
E5 - Visual QA Automation / Capture Manifest
```

E5 should not redesign surfaces. E5 should make the QA process repeatable by codifying which surfaces and viewport profiles define the desktop baseline.

---

## E5 Entry Criteria

E5 may start because:

- E0 capture works across all primary public surfaces;
- Mission Overview and Core Report Runner survived E3/E4 migration;
- all inspected surfaces produce explicit, non-fallback filenames;
- known long surfaces are now classified rather than treated as layout mystery bugs;
- Data Flow Workbench remains intentionally deferred.

---

## Surfaces for E5 Manifest

Required E5 manifest surfaces:

```text
mission-overview
core-report-runner
data-products
scenarios
generated-artifacts
data-flow-workbench
```

Required viewport profiles:

```text
fullscreen desktop
1440-ish compact desktop for Mission Overview and Core Report Runner
```

---

## Non-Goals

E5 must not introduce:

- visual redesign;
- React Flow;
- Data Flow Workbench migration;
- generated artifact table redesign;
- Core semantic inference;
- automatic Core execution;
- mission file mutation;
- screenshot artifacts committed to the repository.

PNG captures remain local QA artifacts and are not source-controlled.
