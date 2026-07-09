# Studio E8 - Generated Artifacts Desktop Envelope

Status: implementation slice
Depends on: E5 visual QA capture manifest, E6 visual QA checklist generator, E7 Data Products migration
Scope: Generated Artifacts root envelope only

---

## Purpose

E8 promotes the Generated Artifacts surface root to the shared `DesktopSurface` primitive.

This is the fourth production surface to consume the desktop envelope after Mission Overview, Core Report Runner and Data Products.

The goal is not to redesign the artifact lineage board. The goal is to make the public surface root consistent with the desktop layout foundation while preserving the existing generated artifact inventory, lineage, table and inspector behavior.

---

## Included

- `GeneratedArtifactsSurface` root now uses `DesktopSurface`.
- Existing `generated-artifacts-surface` class remains the QA capture target.
- Existing lineage board and explorer components remain unchanged.
- A small bridge stylesheet preserves the current surface sizing and board behavior.
- The visual QA manifest now treats Generated Artifacts as requiring both desktop-reference and fullscreen captures.
- The generated visual QA checklist is regenerated from the updated manifest.

---

## Excluded

E8 does not:

- redesign the Generated Artifacts lineage board;
- change artifact classification, evidence readiness or review semantics;
- change generated artifact inventory loading;
- change file opening or export behavior;
- migrate Scenario Evidence;
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
Generated Artifacts desktop-reference profile
Generated Artifacts fullscreen profile
Mission Overview fullscreen smoke check
Core Report Runner fullscreen smoke check
Data Products fullscreen smoke check
```

Generated Artifacts should be checked in the best available state:

```text
empty inventory state, if no generated inventory is loaded
populated inventory state, when the reference mission generated outputs are available
```

The required Generated Artifacts filename must remain:

```text
of-studio-qa__generated-artifacts__...
```

The required Generated Artifacts target must remain:

```text
.main-surface-generated-artifacts .generated-artifacts-surface
```

---

## Acceptance Criteria

E8 is accepted only if:

- `npm run qa:visual-checklist` passes and updates the checklist deterministically;
- `npm run build` passes;
- `git diff --check` is clean;
- Generated Artifacts still resolves through the QA harness as `generated-artifacts`;
- Generated Artifacts does not fall back to `active-surface`;
- fullscreen and desktop-reference captures remain usable;
- Mission Overview, Core Report Runner and Data Products smoke captures remain stable;
- no Core or reference mission file is changed.
