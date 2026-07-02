# E28 — Final Studio Visual Closure Gate

## Purpose

E28 closes the E15R–E27 Studio visual hardening sequence and establishes the final visual baseline candidate.

This is a QA/documentation/manifest gate. It does not redesign runtime surfaces.

## Pre-closure sequence

The closed sequence is:

| Step | Scope |
| --- | --- |
| E15R | Studio visual grammar contract |
| E16 | Operational hero/header contract |
| E17 | Geometry / radius contract |
| E18 | Badge / value / color semantics |
| E19 | Clickability / selected / focus |
| E20 | Cards / panels / tables / raw blocks |
| E21 | Data Flow Workbench visual integration |
| E22 | Shell / sidebar polish |
| E24 | Surface readiness and generated artifact hydration |
| E25 | Status bar contract and always-available Capture |
| E26 | Icon system audit |
| E27 | Studio icon system implementation and Scenarios shell parity validation |

E23 was intentionally superseded because the closure gate exposed blocking issues that were then fixed in E24–E27.

## Final closure expectations

The following must be true before tagging the baseline:

- Mission Overview uses the final operational hero/header, geometry and semantic grammar.
- Core Report Runner uses final card/panel/action grammar and the status bar contract.
- Data Flow Workbench is full-width, scrollable, has no misleading disabled cursor on read-only readiness blocks, and exposes direct `Open focus mode`.
- Data Products uses final data-card semantics and icon registry.
- Scenarios remains scrollable and keeps sidebar/status/collapse parity with the other public-preview routes.
- Generated Artifacts hydrates automatically and keeps populated inventory visible across navigation.
- Status bar contains only real state plus always-available Capture; no Preview placeholders.
- Sidebar expanded/collapsed behavior is stable.
- Primary UI iconography is routed through the Studio icon system.

## Required final captures

Capture fullscreen/current-window final surfaces:

1. Mission Overview
2. Core Report Runner
3. Data Flow Workbench
4. Data Products
5. Scenarios
6. Generated Artifacts

For Scenarios, also compare against Generated Artifacts or Core Report Runner for shell/sidebar parity.

## Commands

```bash
npm run build
npm run qa:visual-checklist
npm run qa:icon-audit
git diff --check
```

## Acceptance criteria

E28 can be merged when:

- build passes;
- icon audit regenerates cleanly;
- visual QA checklist regenerates cleanly;
- final captures pass the six-surface checklist;
- no runtime behavior or Core/model-data semantics are changed by this PR.

After merge, create the baseline tag from `main`:

```bash
git checkout main
git pull --ff-only origin main
git tag -a studio-visual-baseline-e28 -m "Studio visual baseline after E28 closure"
git push origin studio-visual-baseline-e28
```
