# Studio E4 - Core Report Runner Desktop Envelope

Status: implementation slice
Depends on: `studio-e1-desktop-envelope-contract.md`, `studio-e2-layout-primitives-plan.md`, `studio-e3-mission-overview-desktop-envelope.md`
Scope: Core Report Runner only

---

## Purpose

E4 is the second production use of the desktop envelope primitives introduced in E2.

The goal is not to redesign Core Report Runner. The goal is to move its root shell
onto the shared `DesktopSurface` primitive while preserving the current visual
layout, fixed Core wrappers, generated report preview behavior and read-only
execution boundary.

---

## Applied Boundary

Included:

- `CoreReportRunnerSurface` root wraps the surface with `DesktopSurface`.
- Existing `core-report-runner-surface` class remains in place.
- `studio-core-report-runner` remains the stable DOM id.
- A small bridge stylesheet preserves the current sizing and spacing contract.

Excluded:

- no Mission Overview change;
- no Data Products migration;
- no Scenario Evidence migration;
- no Generated Artifacts migration;
- no Data Flow Workbench migration;
- no Core command behavior changes;
- no report semantics changes;
- no free shell or command uplink behavior.

---

## QA Contract

After this slice, the E0 QA harness must still identify Core Report Runner as:

```text
of-studio-qa__core-report-runner__...
```

Required captures:

```text
Core Report Runner at 1440x900, sidebar expanded
Core Report Runner at fullscreen desktop, sidebar expanded
```

---

## Acceptance Criteria

E4 is accepted only if:

- `npm run build` passes;
- `git diff --check` is clean;
- Core Report Runner remains QA-capturable as `core-report-runner`;
- Core Report Runner does not introduce a second scroll owner;
- fixed Core wrapper buttons remain unchanged;
- process output and report preview remain unchanged;
- no other surface is visually or structurally migrated.

---

## Next Step

If E4 is accepted, the next migration candidate should be selected based on QA
risk. Data Products is a reasonable next candidate. Data Flow Workbench should
remain deferred until the envelope and density model are mature.
