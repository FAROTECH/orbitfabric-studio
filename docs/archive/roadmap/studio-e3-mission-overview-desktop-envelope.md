# Studio E3 - Mission Overview Desktop Envelope

Status: implementation slice
Depends on: studio-e1-desktop-envelope-contract.md, studio-e2-layout-primitives-plan.md
Scope: Mission Overview only

---

## Purpose

E3 is the first production use of the desktop envelope primitives introduced in E2.

The goal is not to redesign Mission Overview. The goal is to move its root shell
onto the shared DesktopSurface primitive while preserving the current visual
layout, navigation behavior and Core-derived data contract.

---

## Applied Boundary

Included:

- MissionCockpit root wraps Mission Overview with DesktopSurface.
- Existing mission-target class remains in place.
- studio-dashboard remains the stable DOM id for QA capture.
- A small bridge stylesheet preserves the current surface sizing contract.

Excluded:

- no Core Report Runner migration;
- no Data Products migration;
- no Scenario Evidence migration;
- no Generated Artifacts migration;
- no Data Flow Workbench migration;
- no semantic model changes;
- no Core command changes;
- no invented health, readiness or completeness calculations.

---

## QA Contract

After this slice, the E0 QA harness must still identify Mission Overview as of-studio-qa__mission-overview__...

Required captures:

- Mission Overview at 1440x900, sidebar expanded
- Mission Overview at fullscreen desktop, sidebar expanded

---

## Acceptance Criteria

E3 is accepted only if:

- npm run build passes;
- git diff --check is clean;
- Mission Overview remains QA-capturable as mission-overview;
- Mission Overview does not introduce a second scroll owner;
- Mission Overview remains stable at 1440x900;
- fullscreen capture remains compact and readable;
- no other surface is visually or structurally migrated.

---

## Next Step

If E3 is accepted, the next migration candidate is Core Report Runner.
