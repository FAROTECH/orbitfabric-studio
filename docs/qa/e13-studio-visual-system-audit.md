# E13 — Studio Visual System Audit

E13 is an audit/documentation slice. It defines the next visual-system contract for OrbitFabric Studio without applying runtime visual changes.

## 1. Scope and non-goals

Scope:

- Inventory the visual grammar currently used by the stabilized Studio desktop surfaces.
- Identify concrete inconsistencies across hero/header, labels, values, badges, provenance, clickability, cards, panels, tables, lists, raw blocks, density, typography, color and scroll perception.
- Classify CSS as shared contract, bridge, legitimate surface-specific styling, legacy shim, or candidate primitive/token.
- Propose a small-PR roadmap for E14+.

Non-goals:

- No OrbitFabric Core changes.
- No `orbitfabric-reference-mission` changes.
- No generated data, command behavior, scenario execution, artifact generation, graph/data-flow semantics or private inference changes.
- No mobile/tablet expansion.
- No broad visual migration in E13.

## 2. Baseline context E0-E12

E0-E12 stabilized the desktop envelope, QA capture harness, checklist/audit tooling and the main public surfaces:

- Mission Overview
- Core Report Runner
- Data Products
- Generated Artifacts
- Scenario Evidence
- Data Flow Workbench
- Data Flow drawer
- Data Flow focus mode

E12 is the critical prerequisite: Data Flow Workbench is now inside the desktop contract instead of being a fullscreen-only exception. That makes visual comparison across surfaces valid.

## 3. Source inventory

### Shared contract / primitive layer

- `src/desktopEnvelopePrimitives.tsx`
- `src/desktopEnvelopePrimitives.css`

These define the current shared layout primitives: `DesktopSurface`, `DesktopHero`, `DesktopCard`, `DesktopPanel`, `DesktopGrid`, `DesktopSplit`, `DesktopStatStrip`, plus `of-desktop-*` classes. They are the correct convergence point, but they are not yet the full visual system.

### Envelope bridge layer

- `src/missionOverviewDesktopEnvelope.css`
- `src/coreReportRunnerDesktopEnvelope.css`
- `src/dataProductsDesktopEnvelope.css`
- `src/generatedArtifactsDesktopEnvelope.css`
- `src/scenarioEvidenceDesktopEnvelope.css`
- `src/dataFlowWorkbenchDesktopEnvelope.css`

These files are conservative bridge CSS. They promote roots to the desktop envelope, protect scroll/capture behavior and prevent unsupported collapse at desktop widths. They must not become the final design system.

### Surface visual CSS

- `src/missionCockpitVisualHierarchy.css`
- `src/coreReportRunner.css`
- `src/missionModelAtlas.css`
- `src/generatedArtifactDeck.css`
- `src/generatedArtifactExplorer.css`
- `src/scenarioTimelineRunner.css`
- `src/missionDataFlowWorkbenchVisualHierarchy.css`
- `src/missionDataFlowWorkbenchTimeline.css`
- `src/missionDataFlowWorkbenchDrawer.css`
- `src/missionDataFlowWorkbenchFocusMode.css`

These contain the actual visual dialects that E14+ must harmonize carefully.

### Legacy / baseline hardening CSS

The `publicBaseline*` files and step-numbered hardening patches are protective shell/capture/layout layers. They are not a style vocabulary for new work. Retire only through explicit, smaller replacement contracts.

## 4. Surface comparison matrix

Legend: `OK`, `BRIDGE`, `DIVERGES`, `NEEDS CONTRACT`, `SURFACE-SPECIFIC OK`, `RISK`.

| Area | Mission Overview | Core Runner | Data Products | Generated Artifacts | Scenario Evidence | Data Flow WB | Drawer | Focus mode |
|---|---|---|---|---|---|---|---|---|
| Hero/header | DIVERGES | DIVERGES | DIVERGES | DIVERGES | DIVERGES | DIVERGES | SURFACE-SPECIFIC OK | DIVERGES |
| Eyebrow/title/subtitle | NEEDS CONTRACT | DIVERGES | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | DIVERGES | OK | DIVERGES |
| Action area | NEEDS CONTRACT | DIVERGES | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | SURFACE-SPECIFIC OK | DIVERGES |
| Badge/status/provenance | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT |
| Card/panel structure | BRIDGE | DIVERGES | BRIDGE | DIVERGES | DIVERGES | DIVERGES | SURFACE-SPECIFIC OK | DIVERGES |
| Table/list style | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | DIVERGES | DIVERGES | DIVERGES | NEEDS CONTRACT | DIVERGES |
| Clickable affordance | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT |
| Hover/focus/selected/disabled | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT |
| Empty/loading/error | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | DIVERGES | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT |
| Raw/pre/code block | NEEDS CONTRACT | NEEDS CONTRACT | n/a | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT |
| Density/spacing | BRIDGE | DIVERGES | BRIDGE | DIVERGES | DIVERGES | DIVERGES | OK | DIVERGES |
| Color usage | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT |
| Scroll perception | BRIDGE | RISK | BRIDGE | RISK | RISK | RISK | OK | RISK |

## 5. Concrete inconsistencies

### 5.1 Hero/header grammar

The primitive layer defines a reusable `DesktopHero`, but production surfaces still use bespoke hero/header classes:

- Core Report Runner: `.core-runner-hero`, very large `h1`, large radius, decorative pseudo-elements, generated inventory strip.
- Generated Artifacts: `.lineage-header`, embedded in a lineage board with stat grid and inspector relationship.
- Scenario Evidence: `.scenario-runner-hero`, flex header with badge cluster.
- Data Flow Workbench: `.mission-data-flow-cockpit-header`, mini-app/workbench header with KPI strip.
- Data Flow focus mode: `.mission-data-flow-focus-header`, graph-workspace header with different saturation, buttons and title treatment.

Impact: the same product has different title scale, header density, action positioning and badge hierarchy across surfaces. This changes perception, not just aesthetics.

### 5.2 Badge/status/provenance overlap

Current color semantics are close but not contract-safe:

- Cyan/teal: product identity, primary action, selected state, focus outline, link/route emphasis and header glow.
- Green: reported, ready, positive, valid evidence.
- Yellow/amber: warning, remediation, known/partial evidence and sometimes not-reported.
- Purple: preview, source/evidence family and data-flow category.
- Slate/gray: neutral, disabled, unavailable and secondary copy.
- Red: error/failure.

Risk: color is carrying too many meanings. E15 must split status, provenance, count, warning, disabled, evidence and action badges.

### 5.3 Clickability vs evidence emphasis

Clickable elements currently include action cards, table rows, stage items, route nodes, tabs, drawer map buttons and accordion summaries. Read-only evidence can share similar card/pill emphasis.

Risk: a highlighted value may look clickable, and a clickable object may look like merely highlighted evidence. E16 must separate `clickable`, `selected`, `hover`, `disabled` and `read-only evidence`.

### 5.4 Card/panel/table/list dialects

The repo contains multiple visual dialects:

- `cockpit-*` for Mission Overview.
- `core-runner-*` for Core Report Runner.
- `mission-model-*` for Data Products.
- `lineage-*` for Generated Artifacts.
- `scenario-*` for Scenario Evidence.
- `mission-data-flow-*` and `dfw-timeline-*` for Data Flow.

Risk: radius, padding, section headers, row density, borders, empty states and raw blocks reveal implementation history. E17 must harmonize structure without destroying surface-specific meaning.

### 5.5 Data Flow integration

Data Flow legitimately needs a stronger workbench character: route graph, stages, source strip, timeline, drawer and focus mode. The issue is not that Data Flow is different. The issue is that it currently reads as a mini-app inside Studio.

E18 must preserve the workbench model while aligning header, badges, buttons, tabs, property grids, notes and raw blocks with Studio grammar.

## 6. Token/color audit proposal

Do not introduce a large token system immediately. First define a small semantic contract:

| Semantic role | Meaning |
|---|---|
| `primary interaction` | Main clickable action emphasis |
| `selected` | Persistent selected object/row/node/tab |
| `hover` | Temporary pointer affordance |
| `focus` | Keyboard/accessibility focus ring |
| `reported/valid` | Evidence exists and is valid/reported |
| `warning/not-reported` | Expected evidence missing or partial |
| `error/fail` | Failure/invalid result |
| `unavailable/disabled` | Inert/non-actionable state |
| `provenance/core-derived` | Read-only origin from Core/reference evidence |
| `read-only` | Inspectable but not editable/actionable |
| `generated-artifact` | Artifact lineage/output entity |
| `raw/evidence block` | Pre/code/output evidence |
| `neutral label` | Field label/kicker |
| `neutral value` | Strong value/content |

Candidate minimal tokens for E14-E16 only after E13 acceptance:

```css
--of-color-text-strong;
--of-color-text-muted;
--of-color-border-neutral;
--of-color-surface-panel;
--of-color-action-primary;
--of-color-action-hover;
--of-color-focus-ring;
--of-color-selected-border;
--of-color-status-valid;
--of-color-status-warning;
--of-color-status-error;
--of-color-status-disabled;
--of-color-provenance-core;
--of-color-evidence-raw-bg;
```

## 7. Clickable affordance contract

| Element | Required contract |
|---|---|
| Primary button | Strong action shape, hover/focus/disabled states |
| Secondary button | Lower emphasis, still clearly clickable |
| Ghost/action button | Local utility action, not used for primary actions |
| Clickable row | Full-row hover, pointer cursor, selected distinct from hover |
| Clickable card | Card-level affordance, focus-visible, persistent selected state when applicable |
| Clickable node | Graph-specific affordance, selected ring, state color separate from evidence color |
| Tab | Active state stronger than hover, driven by `aria-selected` or active class |
| Disabled action | Inert cursor/contrast; no hover glow |
| Selected item | Persistent border/ring/background; not only color tint |
| Read-only evidence | Can be emphasized, but no pointer/hover/lift grammar |

Rule: highlighted data is not automatically clickable.

## 8. Hero/header contract

Every major surface should converge on this conceptual structure:

```text
Surface hero/header
  eyebrow/kicker
  title
  summary/body copy
  badge/status/provenance row
  optional action cluster
  optional summary stats
```

Variants:

- Standard surface hero: Mission Overview, Core Runner, Data Products, Generated Artifacts, Scenario Evidence.
- Compact cockpit header: dense internal boards.
- Workbench header: Data Flow Workbench.
- Drawer header: contextual overlay.
- Focus header: Data Flow focus workspace.

Rule: Data Flow may keep a workbench variant, but the variant must derive from Studio grammar rather than invent a parallel product identity.

## 9. Component/style contracts to define

- Hero/header.
- Section header.
- Panel/card.
- Stat/KPI tile.
- Evidence row.
- Table/list row.
- Tabs.
- Badges.
- Provenance pills.
- Empty state.
- Raw/pre/code block.
- Callout/note.
- Drawer.
- Focus mode.

## 10. CSS architecture classification

| Category | Files |
|---|---|
| Shared contract | `desktopEnvelopePrimitives.*` |
| Envelope bridge | `*DesktopEnvelope.css` files |
| Surface-specific legitimate | Data Flow graph/stage/route, Generated Artifacts lineage board, Scenario timeline/runway, Data Products model fabric |
| Legacy/hardening | `publicBaseline*`, step-numbered hardening patches, late `!important` containment rules |
| Candidate primitives | Studio hero, section header, badge, button visual classes, clickable card, table/evidence row, property grid, raw block, empty state |

## 11. Roadmap

### E14 — Hero/Header Harmonization

Goal: align surface hero/header grammar. Start with contract and one low-risk surface before broad migration.

Acceptance: same product hierarchy at 1440x900 and fullscreen; no scroll/capture target changes.

### E15 — Badge/Status/Provenance Harmonization

Goal: split status, provenance, warning, disabled, count and evidence badges.

Acceptance: labels/semantics unchanged; color/shape grammar no longer overloaded.

### E16 — Clickable Affordance Harmonization

Goal: make clickable, selected, hover, focus, disabled and read-only evidence states unambiguous.

Acceptance: no interaction logic change; visual-only affordance cleanup.

### E17 — Card/Panel/Table/List Harmonization

Goal: align shells, radii, density, headers, property grids, rows and raw blocks.

Acceptance: one product grammar without flattening domain-specific layouts.

### E18 — Drawer/Focus Mode Visual Integration

Goal: integrate Data Flow drawer and focus mode into Studio grammar while preserving workbench semantics.

Acceptance: graph/workbench affordances preserved; controls/status/property grids/raw blocks aligned.

### E19 — Final Visual QA Baseline

Goal: freeze visual QA baseline after E14-E18.

Acceptance: all main surfaces captured at reference and fullscreen profiles; checklist/audits/build pass.

## 12. Risk register

| Risk | Severity | Mitigation |
|---|---:|---|
| Status/provenance conflation | High | Split badge grammar before color cleanup |
| Read-only evidence looks clickable | High | Define evidence vs action affordance |
| Data Flow semantics accidentally changed | High | E18 visual-only, no graph/data-flow logic |
| Capture/scroll regressions | High | Keep E0-E12 selectors and scroll owners stable |
| Bridge CSS grows into design system | Medium | Promote only repeated patterns into primitives |
| Token system too large too early | Medium | Start with minimal semantic tokens only |
| Mobile/tablet creep | Medium | Preserve desktop-only 1240+ contract |
| PR blast radius | High | Keep E14-E19 small and stoppable |

## 13. Validation log

Branch:

```bash
hardening/e13-studio-visual-system-audit
```

Required local validation before PR merge:

```bash
npm run qa:data-flow-workbench-audit
npm run qa:desktop-envelope-audit
npm run qa:visual-checklist
npm run build
git diff --check
git status --short
```

Current E13 status:

- Runtime changes: none.
- CSS changes: none.
- Core/reference mission changes: none.
- Validation: pending local run.

## 14. Acceptance criteria

E13 closes only when:

- This audit is committed.
- No runtime visual migration is included.
- Visual contracts and E14-E19 roadmap are present.
- Core/reference mission/data/commands/scenario/artifact/data-flow semantics are untouched.
- No mobile/tablet support is introduced.
- Local validation commands pass.
- `git status --short` is clean after commit/push.
- A dedicated E13 PR exists.