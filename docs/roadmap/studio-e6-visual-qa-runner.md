# Studio E6 - Visual QA Checklist Generator

Status: implementation slice
Depends on: E5 visual QA capture manifest
Scope: dev-only QA checklist generation

---

## Purpose

E6 turns the E5 capture manifest into a generated checklist that can be used before and after layout hardening work.

The goal is not visual regression automation yet. The goal is to remove ambiguity from the manual QA process.

---

## Implemented Artifact

E6 adds:

```text
tools/dev/generate-visual-qa-checklist.mjs
docs/qa/visual-qa-capture-checklist.md
```

The generator reads:

```text
src/devSurfaceCaptureManifest.ts
```

and writes a checklist containing:

- supported capture profiles;
- public Studio capture targets;
- expected slugs;
- expected shell/target selectors;
- required manual capture combinations;
- acceptance criteria for local PNG evidence.

---

## Command

```bash
npm run qa:visual-checklist
```

---

## Non-Goals

E6 does not:

- change runtime UI;
- change layout CSS;
- migrate any surface;
- introduce Playwright;
- compare screenshots;
- commit PNG evidence;
- touch OrbitFabric Core;
- touch the reference mission.

---

## Acceptance Criteria

E6 is accepted when:

- `npm run qa:visual-checklist` reports 2 profiles and 6 targets;
- `docs/qa/visual-qa-capture-checklist.md` is generated from the manifest;
- `npm run build` passes;
- `git diff --check` is clean;
- no layout/runtime UI files are modified.
