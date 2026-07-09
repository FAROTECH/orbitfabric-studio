# Studio E7 - Data Products Desktop Envelope

Status: implementation slice
Depends on: E5 visual QA capture manifest, E6 visual QA checklist generator
Scope: Data Products root envelope only

---

## Purpose

E7 promotes the Data Products cockpit root to the shared `DesktopSurface` primitive.

This is the third production surface to consume the desktop envelope after Mission Overview and Core Report Runner.

The goal is not to redesign Data Products. The goal is to make its public surface root consistent with the desktop layout foundation while preserving its existing cockpit composition and evidence model.

---

## Included

- `DataProductsDomainSurface` root now uses `DesktopSurface`.
- Existing `data-products-cockpit-surface` class remains the QA capture target.
- Existing `studio-model` DOM id remains unchanged.
- A small bridge stylesheet preserves the current surface sizing and cockpit behavior.
- The E5 capture manifest now treats Data Products as requiring both desktop-reference and fullscreen captures.
- The E6 generated checklist is regenerated from the updated manifest.

---

## Excluded

E7 does not:

- redesign the Data Products cockpit;
- change product catalog, relationship, coverage or artifact semantics;
- change Core parsing;
- change generated artifact behavior;
- migrate Scenarios;
- migrate Generated Artifacts;
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
Data Products desktop-reference profile
Data Products fullscreen profile
Mission Overview fullscreen smoke check
Core Report Runner fullscreen smoke check
```

The required Data Products filename must remain:

```text
of-studio-qa__data-products__...
```

The required Data Products target must remain:

```text
.main-surface-data-products .data-products-cockpit-surface
```

---

## Acceptance Criteria

E7 is accepted only if:

- `npm run qa:visual-checklist` passes and updates the checklist deterministically;
- `npm run build` passes;
- `git diff --check` is clean;
- Data Products still resolves through the QA harness as `data-products`;
- Data Products does not fall back to `active-surface`;
- Mission Overview and Core Report Runner smoke captures remain stable;
- no Core or reference mission file is changed.

## 1440/1400 desktop-reference follow-up

The initial E7 QA capture showed Data Products resolving correctly but using the legacy one-column collapse at the 1440/1400 desktop-reference profile.

This slice keeps the 1920px fullscreen tri-column layout intact and adds a desktop-reference bridge so supported desktop widths use a two-column `model + core / bridge` layout instead of a mobile-style single-column stack.

Acceptance remains visual: Data Products must still resolve as `data-products`, keep the target `.main-surface-data-products .data-products-cockpit-surface`, and avoid horizontal clipping.

