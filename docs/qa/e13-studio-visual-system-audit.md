# E13 — Studio Visual System Audit

## 1. Scope and non-goals

E13 is a documentation and audit slice. It does not implement a visual migration.

The goal is to identify the remaining visual-system fragmentation across OrbitFabric Studio now that the desktop envelope work from E0-E12 has made the main public surfaces comparable at the same desktop targets.

### In scope

- Inventory of the visual grammar currently used by the main Studio surfaces.
- Audit of hero/header, badge/status/provenance, clickable affordance, cards/panels, lists/tables, raw/evidence blocks, density, spacing, typography, color semantics and scroll perception.
- Classification of CSS as shared contract, surface bridge, legitimate surface-specific styling, legacy shim, or candidate common primitive/token.
- Proposal of small PR slices for E14+.

### Explicit non-goals

- No OrbitFabric Core changes.
- No reference mission changes.
- No command behavior changes.
- No artifact generation changes.
- No scenario execution changes.
- No graph/data-flow semantic changes.
- No private inference or editing behavior.
- No mobile/tablet expansion.
- No broad CSS refactor in E13.
- No visual runtime changes in E13.

## 2. Baseline context E0-E12

E0-E12 stabilized the Studio desktop envelope and made the following surfaces first-class QA/capture targets:

- Mission Overview
- Core Report Runner
- Data Products
- Generated Artifacts
- Scenario Evidence
- Data Flow Workbench
- Data Flow drawer
- Data Flow focus mode

E12 is the key prerequisite for this audit: Data Flow Workbench is now inside the desktop contract rather than remaining a fullscreen-only exception. That makes it valid to compare Data Flow against the other Studio surfaces without pretending that it has to be flattened into a simple page.

## 3. Source inventory

### Shared desktop primitive layer

- `src/desktopEnvelopePrimitives.tsx`
- `src/desktopEnvelopePrimitives.css`

Current role: real shared layout primitive layer. It defines `DesktopSurface`, `DesktopHero`, `DesktopCard`, `DesktopPanel`, `DesktopGrid`, `DesktopSplit`, and `DesktopStatStrip` plus shared CSS classes such as `of-desktop-hero`, `of-desktop-card`, `of-desktop-panel`, `of-desktop-kicker`, `of-desktop-title`, `of-desktop-summary`, and `of-desktop-stat`.

Important audit note: the primitive layer currently establishes a contract for layout, hero, card/panel and stat strip, but the surface CSS still contains substantial bespoke hero/card/status grammars. E13 should treat primitives as the preferred destination, not assume they are already the visual system.

### Surface envelope bridge layer

- `src/missionOverviewDesktopEnvelope.css`
- `src/coreReportRunnerDesktopEnvelope.css`
- `src/dataProductsDesktopEnvelope.css`
- `src/generatedArtifactsDesktopEnvelope.css`
- `src/scenarioEvidenceDesktopEnvelope.css`
- `src/dataFlowWorkbenchDesktopEnvelope.css`

Current role: conservative bridge CSS. These files mostly promote roots to desktop-envelope ownership, protect scroll/capture behavior, and prevent unsupported collapse at the desktop reference width. They are not yet a complete visual-system layer.

### Surface-specific visual CSS

- `src/missionCockpitVisualHierarchy.css`
- `src/coreReportRunner.css`
- `src/missionModelAtlas.css`
- `src/generatedArtifactDeck.css`
- `src/generatedArtifactExplorer.css`
- `src/scenarioTimelineRunner.css`
- `src/scenarioRunwayConsole.css`
- `src/scenarioRunwayTargetBay.css`
- `src/scenarioRunwayOverflow.css`
- `src/missionDataFlowWorkbenchVisualHierarchy.css`
- `src/missionDataFlowWorkbenchTimeline.css`
- `src/missionDataFlowWorkbenchDrawer.css`
- `src/missionDataFlowWorkbenchFocusMode.css`
- `src/missionDataFlowWorkbenchStep2.css`
- `src/missionDataFlowWorkbenchStep5.css`

Current role: mixed. Some files are legitimate surface-specific visual grammar. Others are historic hardening/polish layers. E13 must classify before migration.

### Baseline/shell/legacy hardening layer

- `src/publicBaselineShellFix02b.css`
- `src/publicBaselineLayout1440.css`
- `src/publicBaselineSidebarLock02c.css`
- `src/publicBaselineSidebarCollapse02d.css`
- `src/publicBaselineSidebarOptical02e.css`
- `src/publicBaselineSidebarCollapsedRail02f.css`
- `src/publicBaselineSidebarSelected02g.css`
- `src/publicBaselineSidebarContract02h.css`
- `src/publicBaselineDesktopContract03a.css`
- `src/publicBaselineShellGutter03aR2.css`
- `src/publicBaselineMissionCompactGutter03aR3.css`
- `src/publicBaselineScenarioEvidenceShellClamp03b1R3.css`
- `src/publicBaselineDataProductsScroll03b1R4.css`
- `src/publicBaselineGeneratedArtifactsScroll03b1R5.css`
- `src/publicBaselineSidebarCollapsedContract03b2.css`
- `src/publicBaselineMissionReadiness03d1.css`
- `src/publicBaselineCoreRunnerReadiness03d2.css`
- `src/publicBaselineSurfaceWidthRecovery03d3.css`

Current role: shell and baseline hardening. These files are not candidates for broad visual-system expansion. They should be protected and gradually retired only when a smaller, explicit contract replaces a specific behavior.

## 4. Surface inventory matrix

Legend:

- `OK`: coherent enough for now.
- `BRIDGE`: acceptable as a migration bridge, not final visual grammar.
- `DIVERGES`: visually different in a way that changes perceived hierarchy or meaning.
- `NEEDS CONTRACT`: should be governed by a shared rule before implementation.
- `SURFACE-SPECIFIC OK`: intentionally different due to the surface function.
- `RISK`: implementation could accidentally change semantics or capture behavior.

| Audit area | Mission Overview | Core Report Runner | Data Products | Generated Artifacts | Scenario Evidence | Data Flow WB | Drawer | Focus mode |
|---|---|---|---|---|---|---|---|---|
| Hero/header | DIVERGES | DIVERGES | DIVERGES | DIVERGES | DIVERGES | DIVERGES | SURFACE-SPECIFIC OK | DIVERGES |
| Eyebrow/kicker | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT |
| Title hierarchy | NEEDS CONTRACT | DIVERGES | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | DIVERGES | SURFACE-SPECIFIC OK | DIVERGES |
| Subtitle/body copy | NEEDS CONTRACT | DIVERGES | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | OK | NEEDS CONTRACT |
| Action area | NEEDS CONTRACT | DIVERGES | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | SURFACE-SPECIFIC OK | DIVERGES |
| Badge/status/provenance | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT |
| Card/panel structure | BRIDGE | DIVERGES | BRIDGE | DIVERGES | DIVERGES | DIVERGES | SURFACE-SPECIFIC OK | DIVERGES |
| Table/list style | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | DIVERGES | DIVERGES | DIVERGES | NEEDS CONTRACT | DIVERGES |
| Clickable affordance | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT |
| Selected state | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT |
| Hover/focus/disabled | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT |
| Empty/loading/error | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | DIVERGES | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT |
| Raw/pre/code block | NEEDS CONTRACT | NEEDS CONTRACT | n/a | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT |
| Density/spacing | BRIDGE | DIVERGES | BRIDGE | DIVERGES | DIVERGES | DIVERGES | SURFACE-SPECIFIC OK | DIVERGES |
| Color usage | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT |
| Typography hierarchy | NEEDS CONTRACT | DIVERGES | NEEDS CONTRACT | NEEDS CONTRACT | NEEDS CONTRACT | DIVERGES | OK | DIVERGES |
| Scroll perception | BRIDGE | RISK | BRIDGE | RISK | RISK | RISK | SURFACE-SPECIFIC OK | RISK |

## 5. Concrete cross-surface inconsistencies

### 5.1 Hero/header grammar is not yet shared

The shared primitive layer defines a `DesktopHero` with a stable two-column header, `eyebrow`, `title`, `summary`, `aside`, and optional children. However the production surfaces still use bespoke header classes.

Concrete examples:

- Core Report Runner uses `.core-runner-hero`, a large two-column hero with large `h1`, large radius, decorative pseudo-elements and a generated inventory strip.
- Generated Artifacts uses `.lineage-header`, a board header embedded in a lineage grid with title block and stat grid.
- Scenario Evidence / Scenario Timeline Runner uses `.scenario-runner-hero`, a flex header with badge cluster.
- Data Flow Workbench uses `.mission-data-flow-cockpit-header`, a mini-app style header with `h2`, cockpit badges and KPI strip.
- Data Flow focus mode uses `.mission-data-flow-focus-header`, a more saturated graph-workspace header with different gradients, button shape and title semantics.

Impact: the difference is not only aesthetic. A user sees different title scales, different action positions, different badge rows and different status emphasis depending on the surface. The product therefore still reads as a set of stabilized tools rather than one cockpit.

Required contract before E14:

- Surface title level and size.
- Eyebrow/kicker placement and style.
- Summary max-width and tone.
- Badge/status row placement.
- Action cluster placement.
- Optional stat strip relationship to hero.
- Compact density rules at 1440x900 and fullscreen.

### 5.2 Badge/status/provenance colors overlap

Current colors are directionally coherent, but meanings overlap:

- Cyan/teal is used for primary identity, selected state, focus outline, data-flow links, action buttons, header glows and some reported/ready states.
- Green is used for reported, ready, positive and successful evidence.
- Yellow/amber is used for warning, remediation, known/partial evidence and not-reported states.
- Purple is used for preview, source/evidence grouping and data-flow categories.
- Slate/gray is used for neutral, disabled, unavailable and secondary text.
- Red is used for errors/failure states.

Impact: Studio risks using color as decoration rather than semantic grammar. In particular, cyan currently competes between product identity, clickability, focus, selected state and evidence emphasis.

Required contract before E15:

- `primary interaction` must not equal `selected` by accident.
- `reported/valid` must not equal `primary action`.
- `provenance/core-derived` must not look like warning or clickability.
- `warning/not reported` must be different from `partial/known` evidence.
- `unavailable/disabled` must be visually inert, not just lower opacity.

### 5.3 Clickability is not consistently distinguishable from evidence emphasis

Clickable affordances appear as:

- Cards with `cursor: pointer` and hover border changes.
- Buttons styled as pills.
- Tabs styled as pills or rectangular buttons.
- Route nodes and edges styled as graph objects.
- Table/list rows with hover backgrounds.
- Non-clickable evidence chips that can look button-like.

Concrete examples:

- Core action cards hover with lift and border glow.
- Data Flow stage items use `cursor: pointer`, hover cyan border/background and selected glow.
- Generated Artifacts family/action cards are clickable cards, while evidence rows and bars are visually prominent but should remain read-only evidence.
- Scenario timeline nodes, primary actions and target titles are clickable, but some evidence lanes share similar card emphasis.
- Drawer map buttons and accordion summaries are interactive, while property rows and raw blocks are not.

Impact: Studio can make highlighted data look actionable, or make actionable evidence look merely decorative.

Required contract before E16:

- Primary button.
- Secondary button.
- Ghost/action button.
- Clickable row.
- Clickable card.
- Clickable node.
- Tab.
- Disabled action.
- Selected item.
- Read-only highlighted evidence.

### 5.4 Card/panel/table/list structure still has multiple dialects

The primitive layer defines shared `of-desktop-card`, `of-desktop-panel`, and `of-desktop-stat`, but surface CSS still defines many separate structures:

- `cockpit-*` cards/panels for Mission Overview.
- `core-runner-*` cards, action groups and output cards.
- `mission-model-*` fabric/lane/capsule cards for Data Products.
- `lineage-*` cards, board columns, inspector, evidence rows and table toolbar for Generated Artifacts.
- `scenario-*` panels, runway cards, timeline nodes and evidence lanes.
- `mission-data-flow-*` stages, stage items, route nodes, inspector notes and property grids.
- `dfw-timeline-*` rows, tabs, toggles and canvas elements.

Impact: even when colors are close, border radius, density, grid spacing and title treatment vary enough to reveal implementation history.

Required contract before E17:

- Panel shell.
- Section header.
- KPI/stat tile.
- Evidence row.
- Table/list row.
- Property grid.
- Empty state.
- Raw/pre block.
- Callout/note.

### 5.5 Data Flow is integrated structurally, not yet visually normalized

Data Flow must keep a stronger workbench character. It is a route/graph/evidence mini-application, not a normal static page. That difference is legitimate.

The current risk is different: Data Flow uses a denser, more saturated and more interactive visual language than the rest of Studio:

- Dedicated cockpit container.
- Stage grid and source rail.
- Route path chips.
- Inline timeline expansion.
- Context drawer.
- Focus mode with a distinct graph-workspace visual style.

Impact: Data Flow is now in the desktop contract, but still reads more like an app embedded inside Studio than a Studio surface with a special workbench mode.

Required contract before E18:

- Workbench mode can have additional graph affordances.
- Header, badge/status, selected state, tabs, buttons, property grids, notes and raw blocks must still use the Studio visual grammar.
- Focus mode may be more spatial, but should not introduce a different product identity.

## 6. Token/color audit proposal

This is not a request to introduce a large design token system immediately. The immediate goal is a small semantic contract that prevents future ambiguity.

### Proposed semantic colors

| Semantic role | Proposed meaning | Current risk |
|---|---|---|
| `primary interaction` | Clickable action emphasis | Cyan also used for identity, selected, focus and evidence |
| `selected` | Current selected object/row/node/tab | Often cyan glow; sometimes also reported/positive |
| `hover` | Temporary affordance only | Sometimes indistinguishable from selected |
| `focus` | Keyboard/accessibility focus | Not consistently defined outside some controls |
| `reported/valid` | Evidence exists and is valid/reported | Green sometimes overlaps with success/positive |
| `warning/not reported` | Expected evidence missing or partial | Yellow/amber overlaps with remediation and known evidence |
| `error/fail` | Failure or invalid result | Mostly red, acceptable but still surface-specific |
| `unavailable/disabled` | Inert, not actionable | Sometimes opacity-only or dashed-only |
| `provenance/core-derived` | Read-only origin from Core/reference evidence | Needs separate grammar, not only color |
| `read-only` | Inspectable but not editable | Should be shape/label based, not color-only |
| `generated artifact` | Artifact lineage/output entity | Currently surface-specific |
| `raw/evidence block` | Pre/code evidence/output | Currently inconsistent sizing and max-height |
| `neutral label` | Field label/kicker | Slate/cyan mix |
| `neutral value` | Strong value/content | White/near-white with occasional semantic tint |

### Proposed minimal token family for E14-E16

Use a small family only after the audit is accepted:

```css
--of-color-text-strong
--of-color-text-muted
--of-color-border-neutral
--of-color-surface-panel
--of-color-action-primary
--of-color-action-hover
--of-color-focus-ring
--of-color-selected-border
--of-color-status-valid
--of-color-status-warning
--of-color-status-error
--of-color-status-disabled
--of-color-provenance-core
--of-color-evidence-raw-bg
```

Do not introduce this token set in E13. E13 only documents the contract.

## 7. Clickable affordance contract proposal

### Required visual distinctions

| Element | Contract |
|---|---|
| Primary button | Filled or high-emphasis border, action verb, hover/focus/disabled defined |
| Secondary button | Lower emphasis border/background, still clearly clickable |
| Ghost/action button | Minimal surface, only for local/secondary controls |
| Clickable row | Full-row hover, pointer cursor, selected state distinct from hover |
| Clickable card | Card-level hover and focus, not just colored data |
| Clickable node | Node-specific pointer, selected ring, graph state separate from evidence state |
| Tab | `aria-selected` or active class, active state visually stronger than hover |
| Disabled action | Not-allowed or inert cursor, reduced contrast, no hover glow |
| Selected item | Persistent border/ring/background, not just semantic green |
| Read-only evidence | May be highlighted, but no hover/lift/pointer grammar |

### Rule

A highlighted value is not automatically clickable. A clickable object must have a consistent interaction grammar across surfaces.

## 8. Hero/header contract proposal

### Required structure

Every major Studio surface should converge on this conceptual structure:

```text
Surface hero/header
  eyebrow/kicker
  title
  summary/body copy
  badge/status/provenance row
  optional action cluster
  optional summary stats
```

### Required variants

| Variant | Use case |
|---|---|
| Standard surface hero | Mission Overview, Core Report Runner, Data Products, Generated Artifacts, Scenario Evidence |
| Compact cockpit header | Dense internal sections and boards |
| Workbench header | Data Flow Workbench main mode |
| Drawer header | Contextual drawer overlay |
| Focus mode header | Dedicated Data Flow focus workspace |

### Rule

Data Flow can keep a workbench variant, but the variant must derive from the same Studio visual grammar: same title scale range, same eyebrow treatment, same badge semantics, same action cluster behavior.

## 9. Component/style contract proposal

| Component | Contract direction |
|---|---|
| Hero/header | Shared structure with variants, not bespoke per surface |
| Section header | Small kicker/title/summary/action cluster pattern |
| Panel/card | Shared radius, border, background and padding scale |
| Stat/KPI tile | Label/value/detail hierarchy with semantic value color only when meaningful |
| Evidence row | Read-only grammar distinct from clickable row/card |
| Table/list | Header, row, hover, selected and empty states standardized |
| Tabs | Same active/hover/focus/disabled semantics across runner, lineage and Data Flow |
| Badges | Split status/provenance/action/count badges |
| Provenance pills | Dedicated read-only origin grammar |
| Empty state | Dashed/quiet panel with strong title and muted explanatory copy |
| Raw/pre block | Shared border/background/height/scroll behavior |
| Callout/note | Separate info/warning/error/provenance callouts |
| Drawer | Overlay-specific, but uses shared header/buttons/property-grid/raw blocks |
| Focus mode | Workbench-specific spatial layout, shared controls/status grammar |

## 10. CSS architecture audit

### Shared contract

- `desktopEnvelopePrimitives.tsx`
- `desktopEnvelopePrimitives.css`

These should remain the convergence point. E14+ can extend them carefully only when a repeated pattern is confirmed.

### Conservative bridge CSS

- `missionOverviewDesktopEnvelope.css`
- `coreReportRunnerDesktopEnvelope.css`
- `dataProductsDesktopEnvelope.css`
- `generatedArtifactsDesktopEnvelope.css`
- `scenarioEvidenceDesktopEnvelope.css`
- `dataFlowWorkbenchDesktopEnvelope.css`

These files should not grow into the final design system. They should remain bridge/containment layers and shrink over time when safe.

### Surface-specific legitimate CSS

- Data Flow graph/stage/route layout.
- Generated Artifacts lineage board layout.
- Scenario timeline runway/canvas layout.
- Mission/Data Products domain-specific evidence layouts.

These should not be flattened into generic cards if doing so would destroy meaning.

### Legacy/hardening CSS to avoid propagating

- `publicBaseline*` shell and sidebar patches.
- Step-numbered Data Flow hardening patches.
- Late `!important` containment rules.
- Width-recovery rules that exist only to preserve desktop captures.

These may be necessary today, but they should not become the grammar for new components.

### Candidate common primitives

- `StudioHero` / extended `DesktopHero` variant support.
- `StudioSectionHeader`.
- `StudioBadge` with type: `status | provenance | count | warning | disabled`.
- `StudioButton` visual classes only, without changing behavior.
- `StudioClickableCard` visual class.
- `StudioTableRow` / `StudioEvidenceRow` distinction.
- `StudioPropertyGrid`.
- `StudioRawBlock`.
- `StudioEmptyState`.

## 11. Risk register

| Risk | Severity | Mitigation |
|---|---:|---|
| Conflating status and provenance | High | E15 must split badge semantics before color changes |
| Making read-only evidence look clickable | High | E16 must define non-clickable evidence grammar |
| Breaking Data Flow graph semantics | High | E18 visual-only changes; no graph/data-flow logic changes |
| Breaking capture targets or scroll owners | High | Keep envelope/QA selectors stable |
| Turning bridge CSS into design system | Medium | Move only repeated, proven patterns into primitives |
| Over-tokenizing too early | Medium | Start with minimal semantic tokens only after E13 |
| Reintroducing mobile/tablet work | Medium | Desktop-only contract remains 1240+ |
| Large PR blast radius | High | E14-E19 remain small slices with stop rules |

## 12. Roadmap E14-E19

### E14 — Hero/Header Harmonization

Goal: align surface hero/header grammar.

Likely files:

- `src/desktopEnvelopePrimitives.tsx`
- `src/desktopEnvelopePrimitives.css`
- surface CSS files for Mission Overview, Core Report Runner, Data Products, Generated Artifacts, Scenario Evidence, Data Flow Workbench

Acceptance:

- Shared hero/header contract documented and applied to one or more low-risk surfaces.
- No command/data/graph behavior changes.
- Visual QA captures compare header hierarchy at 1440x900 and fullscreen.

Stop when:

- Data Flow focus mode requires separate workbench treatment.
- Any change affects scroll owner/capture target.

### E15 — Badge/Status/Provenance Harmonization

Goal: split badge/status/provenance grammar.

Likely files:

- `src/Badges.tsx`
- `src/styles.css`
- relevant surface CSS using status/pill/badge classes

Acceptance:

- Status, provenance, warning, disabled, count and evidence badges are distinguishable.
- Existing semantic labels remain unchanged.

Stop when:

- A badge change requires changing the source data meaning.

### E16 — Clickable Affordance Harmonization

Goal: make clickable/read-only/selected/disabled states unambiguous.

Likely files:

- Core Runner CSS
- Generated Artifacts CSS
- Scenario Evidence CSS
- Data Flow visual hierarchy/timeline/drawer/focus CSS

Acceptance:

- Every clickable card/row/node/tab has hover/focus/selected/disabled grammar.
- Read-only evidence no longer resembles an action.

Stop when:

- Any interaction logic needs to be changed. E16 is visual-only.

### E17 — Card/Panel/Table/List Harmonization

Goal: align shell, radius, density, header and row grammar.

Likely files:

- `desktopEnvelopePrimitives.css`
- surface-specific card/list/table CSS

Acceptance:

- Panels, stat tiles, property grids, list rows and raw blocks feel like one product.
- Surface-specific layouts remain intact.

Stop when:

- The change becomes a layout redesign instead of visual harmonization.

### E18 — Drawer/Focus Mode Visual Integration

Goal: integrate Data Flow drawer/focus mode into Studio grammar without removing workbench character.

Likely files:

- `missionDataFlowWorkbenchDrawer.css`
- `missionDataFlowWorkbenchFocusMode.css`
- `dataFlowWorkbenchDesktopEnvelope.css`

Acceptance:

- Drawer and focus mode use Studio badges, buttons, property grids and raw blocks.
- Graph/workbench affordances remain legible and specific.

Stop when:

- Graph route semantics, node selection semantics or drawer behavior would need code changes.

### E19 — Final Visual QA Baseline

Goal: freeze the visual-system baseline.

Likely files:

- QA checklist/manifest docs or generated outputs only.

Acceptance:

- All main surfaces captured at reference and fullscreen profiles.
- Visual checklist reflects the final E14-E18 grammar.
- `npm run build`, QA audits and `git diff --check` pass.

## 13. Validation log

Initial branch:

```bash
hardening/e13-studio-visual-system-audit
```

Local validation required before opening/merging PR:

```bash
npm run qa:data-flow-workbench-audit
npm run qa:desktop-envelope-audit
npm run qa:visual-checklist
npm run build
git diff --check
git status --short
```

Current E13 document status:

- Runtime changes: none.
- UI behavior changes: none.
- CSS changes: none.
- Core/reference mission changes: none.
- Validation: pending local run.

## 14. E13 acceptance criteria

E13 can close only when:

- This audit is committed in the repository.
- No runtime visual migration has been applied in E13.
- E14-E19 roadmap is present and small-slice oriented.
- Shared visual contracts are proposed, not blindly implemented.
- Core and reference mission are untouched.
- Scenario execution, artifact generation and data-flow semantics are untouched.
- Mobile/tablet support has not been introduced.
- Local validation commands pass.
- `git status --short` is clean after commit/push.
- A dedicated E13 PR exists.