# Studio E9 - Scenario Evidence Desktop Envelope

Status: implementation slice
Depends on: E5 visual QA capture manifest, E6 visual QA checklist generator, E7/E8 migrated surfaces
Scope: Scenario Evidence root envelope only

---

## Purpose

E9 promotes the Scenario Evidence cockpit root to the shared `DesktopSurface` primitive.

This is the fourth production surface to consume the desktop envelope after Mission Overview, Core Report Runner, Data Products and Generated Artifacts.

Scenario Evidence is intentionally treated as a tall evidence cockpit. E9 does not attempt to redesign or shorten the surface. The goal is to make the public root consistent with the desktop layout foundation while preserving the current read-only scenario evidence model.

---

## Included

- `ScenarioTimelineRunnerSurface` root now uses `DesktopSurface`.
- Existing `scenario-evidence-cockpit` class remains the QA capture target.
- Existing `studio-evidence` DOM id remains unchanged.
- A small bridge stylesheet preserves current cockpit behavior while keeping the 1440/1400 desktop-reference profile desktop-oriented.
- The E5 capture manifest now treats Scenarios as requiring both desktop-reference and fullscreen captures.
- The E6 generated checklist is regenerated from the updated manifest.

---

## Excluded

E9 does not:

- redesign the Scenario Evidence cockpit;
- change scenario source parsing;
- change Core simulation behavior;
- change generated artifact semantics;
- remove the existing Scenario Evidence scroll/readability hardening;
- migrate Data Flow Workbench;
- introduce screenshot comparison;
- introduce mobile/tablet support.

---

## QA Requirements

After this slice, run:

```text
npm run qa:visual-checklist
npm run build
git diff --check
```

Manual capture requirements:

```text
Scenario Evidence desktop-reference profile
Scenario Evidence fullscreen profile
Mission Overview fullscreen smoke check
Core Report Runner fullscreen smoke check
Data Products fullscreen smoke check
Generated Artifacts fullscreen smoke check
```

The required Scenarios filename must remain:

```text
of-studio-qa__scenarios__...
```

The required Scenarios target must remain:

```text
.main-surface-scenario-evidence .scenario-evidence-cockpit
```

---

## Acceptance Criteria

E9 is accepted only if:

- `npm run qa:visual-checklist` passes and updates the checklist deterministically;
- `npm run build` passes;
- `git diff --check` is clean;
- Scenarios still resolves through the QA harness as `scenarios`;
- Scenarios does not fall back to `active-surface`;
- the desktop-reference profile remains desktop-oriented rather than mobile/tablet-like;
- Mission Overview, Core Report Runner, Data Products and Generated Artifacts smoke captures remain stable;
- no Core or reference mission file is changed.

## Expected Visual Behavior

Scenario Evidence can remain long vertically. Long content is acceptable when the capture target, filename and desktop structure are correct.

The migration is not accepted if it creates horizontal clipping, target fallback, broken scroll ownership, or regression in already migrated golden surfaces.

## E9.1 desktop-reference grid hardening

The first 1400/1440 QA capture after E9 showed that Scenario Evidence still resolved correctly but collapsed into a mostly single-column evidence stack.

That was safe for readability, but too close to a mobile/tablet structure for the supported desktop-reference profile.

E9.1 keeps Scenario Evidence vertically long, but forces the reference desktop profile to retain desktop-oriented regions:

```text
header: title + posture, boundaries below
main: scenario catalog + selected scenario overview
construction: source identity + execution flow
evidence: timeline + local inspector
artifact dock: 3-column compact desktop grid
```

This remains a bridge fix only. No scenario semantics, Core reports, generated artifact handling or Data Flow behavior are changed.

