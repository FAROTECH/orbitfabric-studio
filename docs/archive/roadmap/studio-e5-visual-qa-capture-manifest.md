# Studio E5 - Visual QA Capture Manifest

Status: implementation slice
Depends on: E0 capture harness, E1 desktop envelope contract, E2 layout primitives, E3 Mission Overview migration, E4 Core Report Runner migration, E4.5 baseline QA
Scope: dev-only visual QA manifest

---

## Purpose

E5 turns the manual QA capture practice established during E0-E4.5 into an explicit manifest.

The goal is not to add visual regression testing yet. The goal is to make the list of Studio surfaces, DOM targets and required desktop profiles first-class and reviewable in code.

---

## Implemented Artifact

The manifest lives in:

```text
src/devSurfaceCaptureManifest.ts
```

It defines:

- capture profiles;
- required public surface targets;
- canonical labels and slugs;
- active surface routing identifiers;
- shell and target selectors;
- profile requirements for each surface;
- notes from the E4.5 baseline.

`devSurfaceCapture.ts` now consumes this manifest instead of keeping its capture target list inline.

---

## Capture Profiles

Required profiles are:

```text
Desktop reference window: nominal 1440x900 host window
Desktop fullscreen: current monitor fullscreen, validated at 1920x1080 during E4.5
```

The fullscreen profile is performed by making Studio fullscreen manually and pressing the dev-only `SURFACE` button.

---

## Required Surfaces

The manifest currently covers:

```text
Mission Overview
Core Report Runner
Data Products
Scenarios
Generated Artifacts
Data Flow Workbench
```

Mission Overview and Core Report Runner are golden candidates after E3/E4 and require both desktop-reference and fullscreen captures.

The remaining surfaces require fullscreen capture for the current baseline.

---

## Acceptance Criteria

E5 is accepted only if:

- `npm run build` passes;
- `git diff --check` is clean;
- every existing capture target still resolves;
- filenames remain stable, especially `mission-overview` and `core-report-runner`;
- no runtime UI surface is visually migrated;
- no Core or reference mission file is changed.

---

## Non-Goals

E5 does not:

- introduce Playwright or screenshot comparison;
- run automated browser capture;
- change layout CSS;
- migrate Data Products, Scenarios, Generated Artifacts or Data Flow Workbench;
- add mobile/tablet support.

---

## Next Step

After E5, Studio can move in one of two directions:

1. add a small dev-only QA runner/checklist that uses the manifest;
2. continue with the next surface migration, likely Data Products, only if a strong product reason exists.
