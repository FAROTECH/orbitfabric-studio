# E15R — Studio Visual Grammar Contract

Scope: OrbitFabric Studio visual harmonization contract  
Baseline: main after E14 / tag studio-visual-baseline-pre-e15r  
Status: contract slice, no runtime visual changes

## 1. Intent

E15R defines the Studio visual grammar contract that future visual harmonization PRs must implement.

This is not a redesign proposal and not a CSS patch. It is a contract layer between:

- the E13 visual-system audit
- the E14 semantic token contract
- the future implementation PRs for hero/header, badges, colors, clickability, cards, rows, panels and raw blocks

The objective is to make the existing Studio UI look coherent, professional and deliverable while preserving the current product structure, desktop envelope and read-only behavior.

## 2. Baseline

The baseline is main after E14.

The safety tag is:

studio-visual-baseline-pre-e15r

E15R must not use the closed/unmerged E15 attempt as a technical or visual reference.

## 3. Source of truth

The source of truth order is:

1. repository main
2. QA Capture SURFACE screenshots
3. TSX/CSS implementation
4. E13 audit document
5. E14 token contract
6. explicit project decisions from review

No visual classification may be inferred only from appearance.

If an element looks clickable but the code does not make it a button, link, tab or explicit click target, it is not classified as an action.

If an element looks like a status but the code uses a provenance badge, it is classified as provenance until changed by contract.

If the screenshots and code disagree, the code defines the element identity and the screenshot defines the visual impact.

## 4. Non-goals

E15R must not:

- change OrbitFabric Core
- change orbitfabric-reference-mission
- change generated data
- change command behavior
- change scenario execution
- change artifact generation
- change graph/data-flow semantics
- introduce private inference
- change mobile/tablet scope
- patch runtime CSS
- migrate React components
- modify sidebar behavior
- modify status bar behavior

E15R is documentation only.

## 5. Product frame

The product frame includes:

- main Studio shell
- primary sidebar
- main surface
- bottom status bar

The QA Capture top bar is not part of the product UI. It exists only as a debug and analysis aid for screenshot review.

Sidebar and status bar are considered part of the desktop envelope, but they are not targets of E15R–E19 unless explicitly stated.

## 6. Surfaces in scope

| Surface | Role | Scope in E15R |
|---|---|---|
| Mission Overview | Home/dashboard | Contracted as rich home surface |
| Core Report Runner | Operational Core execution/report surface | In scope |
| Data Products | Operational data product inspector | In scope |
| Generated Artifacts — initial | Nominal inventory-not-loaded state | In scope |
| Generated Artifacts — populated | Artifact lineage/review board | In scope |
| Scenario Evidence | Operational scenario evidence cockpit | In scope |
| Data Flow Workbench | Mini-app/workbench | Control only; implementation deferred |

Generated Artifacts has two valid states:

1. initial state after opening a workspace, before pressing Inspect generated artifacts
2. populated state after generated artifact inspection

Both states must remain visually coherent.

## 7. Surface role contract

### Mission Overview

Mission Overview is the home surface. It may be visually richer than operational surfaces.

It may include:

- mission name
- mission description
- mission id
- phase
- owner
- last updated
- contract health
- contract completeness
- lint/load posture
- quick stats
- navigation cards

It must not have a duplicate hero/header.

Decision:

Remove the separate top heading band that only says Mission Overview and contains View Generated Reports.
Keep one primary mission hero.

Rationale:

- the Generated Artifacts route is already accessible from navigation
- the separate top heading duplicates the real mission hero
- the home should have one clear identity area

### Operational surfaces

Operational surfaces are:

- Core Report Runner
- Data Products
- Generated Artifacts
- Scenario Evidence

They must use compact, information-dense headers.

They must not read like landing pages.

At 1440x900, useful operational content must be visible immediately below the header.

### Data Flow Workbench

Data Flow Workbench is treated as a mini-app/workbench. It is not allowed to define the grammar for the main operational surfaces.

It will be addressed after the main surface grammar is stable.

## 8. Hero/header contract

Every major surface header must be classifiable into this conceptual structure:

surface header
  eyebrow / kicker
  title
  summary
  provenance / status row
  optional action cluster
  optional compact stats

### Required rules

- eyebrow is small, uppercase and secondary/accented
- title is the strongest text element
- summary is concise and functional, not narrative
- provenance/status badges are secondary to title and summary
- stats are not badges
- badges are not buttons
- actions must look actionable
- operational headers must remain compact

### Mission Overview exception

Mission Overview may use a richer hero with mission identity and posture.

It must still avoid duplicate headings.

### Acceptance criteria

At 1440x900:

- each operational header is visually compact
- first useful section/card/table is visible without scrolling
- Core Report Runner and Data Products do not look like separate products
- Generated Artifacts initial and populated states share the same product language
- Scenario Evidence remains dense but not visually isolated
- Mission Overview has only one primary hero identity region

## 9. Typography contract

The visual grammar must distinguish these text roles:

surface title
surface summary
section title
panel title
field label
field value
microcopy
badge text
raw/code text

### Rules

- operational surface titles use a common scale
- Mission Overview may use a larger title scale
- field labels are smaller than field values
- uppercase letter-spacing is reserved for technical labels, eyebrows and section kickers
- values must not look like badges unless they are actual pills
- code/raw text uses a dedicated monospace treatment
- long mission/workspace strings must be clipped or wrapped safely

## 10. Color and value contract

Color expresses semantic state, not decoration.

| Meaning | Target semantic role |
|---|---|
| Static value | neutral / primary text |
| Positive state | success |
| Warning / attention | warning |
| Error / blocking | danger |
| Informational state | info |
| Provenance / source | provenance |
| Evidence / proof | evidence |
| Action | action |
| Selected | selected |
| Disabled / unavailable | neutral + disabled opacity |

### Rules

- yellow/amber is not a generic value color
- yellow/amber is reserved for warning/attention
- green is used only for positive/success/reported-good state
- red/pink is used only for danger/failure/blocking state
- cyan/accent is used for brand, action, selected or focus, not for every important value
- provenance must not be confused with status
- selected state must not be confused with warning
- static counts must not be styled as warning just because they are important

### Examples

- 1/3 is not automatically warning
- available may be success if the underlying capability is present
- not reported is neutral unless missing evidence is actionable or problematic
- passed is success
- failed is danger
- READ-ONLY is provenance or boundary, not success
- 57 ARTIFACTS is a static count, not status

## 11. Badge contract

Badge-like elements must be classified by meaning.

Allowed categories:

ProvenanceBadge
StatusBadge
SeverityBadge
StaticPill / CountPill
ActionPill

### Provenance badges

Examples:

- READ-ONLY
- CORE-DERIVED
- CORE-OWNED
- SOURCE + CORE EVIDENCE
- GENERATED-AWARE when used as source posture

Meaning:

where the information comes from or what boundary constrains it

### Status badges

Examples:

- AVAILABLE
- READY
- LOADED
- PASSED
- COMPLETED
- RUNNING
- IDLE
- WAITING

Meaning:

current operational or data state

### Severity badges

Examples:

- FAILED
- ERROR
- CRITICAL
- WARNING
- BLOCKED

Meaning:

failure, risk, attention or blocking condition

### Static/count pills

Examples:

- 4 SCENARIOS
- 3 PRODUCTS
- 57 ARTIFACTS
- 102 RELATIONSHIPS

Meaning:

plain metric or count

Static/count pills must not use warning or success color unless the value itself encodes semantic state.

### Action pills

Action pills must be rare. If something performs an action, a button style is preferred.

## 12. Clickability contract

Visual affordance must match actual interactivity.

| Element | Contract |
|---|---|
| Primary button | Strong action visual, hover, focus, disabled |
| Secondary button | Lower emphasis but clearly clickable |
| Ghost utility button | Local utility only |
| Clickable card | Pointer, hover, focus-visible, selected if persistent |
| Clickable row | Full-row affordance, selected state distinct from hover |
| Tab | Active state stronger than hover; must use aria-selected or equivalent |
| Badge | Static unless explicitly action-classified |
| Static value | Not clickable |
| Read-only evidence | Can be emphasized but must not look actionable |
| Disabled item | Inert cursor/contrast; no active hover glow |

Rule:

Highlighted data is not automatically clickable.

### Acceptance criteria

A reviewer should be able to identify from screenshots:

- primary action
- secondary action
- selected card/row/tab
- disabled action
- static badge
- status badge
- read-only evidence
- plain value

without reading the code.

## 13. Card, panel, row and table contract

The following structures must converge:

panel
card
selectable card
summary/KPI card
table row
list row
inspector field
property grid
empty state
loading state
error state
raw/code block

### Panel/card rules

- panel background, border and radius must use the visual semantic contract
- card padding and radius must be consistent within each density tier
- card title, value and detail must follow a shared hierarchy
- clickable cards must differ from static cards
- selected cards must have persistent selected styling

### Row/table rules

- table headers must be quieter than selected/action rows
- clickable rows must use full-row affordance
- selected row must not rely only on text color
- dense rows must remain readable at 1440x900
- numeric values and statuses must not compete visually

### Raw/code block rules

- raw/code blocks must use the raw/code token family
- raw/code blocks must not look like editable text areas unless editable
- overflow must be controlled
- JSON/evidence/output blocks should share a common visual language

## 14. Generated Artifacts contract

Generated Artifacts has two states.

### State A — inventory not loaded

This is the nominal initial state after opening a workspace.

It must be treated as:

empty-but-actionable

It is not an error.

Required visual grammar:

- clear empty-state title
- short explanation
- primary CTA: Inspect generated artifacts
- no warning coloration
- no implication that evidence is missing or failed
- inspector/board areas must not look broken

### State B — inventory populated

This is the review/lineage state after inspection.

Required visual grammar:

- compact lineage header
- clear stats
- family cards identifiable as clickable if interactive
- review/action cards clearly clickable
- table rows distinguish static, hover and selected state
- preview/open actions distinguishable from provenance/status
- warnings shown only when actual warnings exist

## 15. Mission Overview duplicate header decision

Mission Overview currently has a top heading strip and a richer mission hero.

The target contract is:

one Mission Overview identity region only

Implementation target for the future hero/header PR:

- remove the thin top heading strip
- remove the redundant View Generated Reports button from that strip
- retain the rich mission identity/posture hero
- keep generated artifacts access through sidebar and contextual cards
- do not alter generated artifact navigation semantics

This belongs to the hero/header implementation PR, not E15R.

## 16. Data Flow Workbench exclusion contract

Data Flow Workbench is excluded from E16–E19 implementation unless explicitly stated.

Reason:

- it has graph/workbench semantics
- it includes drawer/focus/timeline sub-surfaces
- it risks forcing main product surfaces into a mini-app grammar

After E19, a dedicated Data Flow visual integration pass may align:

- header
- badges
- buttons
- tabs
- inspector fields
- raw/code blocks
- drawer/focus mode visual language

without changing graph semantics or data-flow behavior.

## 17. Implementation roadmap

### E16 — Operational + Mission Hero/Header Contract

Scope:

- Core Report Runner header
- Data Products header
- Generated Artifacts initial and populated headers
- Scenario Evidence header
- Mission Overview duplicate heading removal

Non-goals:

- no data changes
- no command changes
- no scenario execution changes
- no artifact generation changes
- no Data Flow Workbench changes
- no sidebar/status bar changes

### E17 — Badge / Value / Color Semantics

Scope:

- badge classification
- status/provenance/severity separation
- static value color cleanup
- yellow/amber demotion to warning-only usage
- selected/action/status color separation

### E18 — Clickability / Selected / Focus Affordance

Scope:

- clickable cards
- selectable rows
- tabs
- hover/focus-visible
- disabled state
- selected state

### E19 — Cards / Panels / Tables / Raw Blocks

Scope:

- card/panel rhythm
- summary/KPI cards
- inspector fields
- table/list rows
- empty/loading/error states
- raw/code/output blocks

### E20 — Data Flow Workbench Visual Integration

Optional later slice.

Scope to be decided after E16–E19.

## 18. QA requirements for implementation PRs

Every implementation PR must provide before/after QA screenshots for:

- Mission Overview
- Core Report Runner
- Data Products
- Generated Artifacts initial
- Generated Artifacts populated
- Scenario Evidence

Data Flow Workbench must be captured as a control surface unless explicitly in scope.

Required commands:

npm run qa:studio-visual-token-contract
npm run qa:data-flow-workbench-audit
npm run qa:desktop-envelope-audit
npm run qa:visual-checklist
npm run build
git diff --check
git status --short

If generated QA files change only timestamps, those timestamp-only diffs must not be committed.

## 19. Acceptance criteria for E15R

E15R is acceptable when:

- this document exists
- it is documentation-only
- no CSS/TSX/runtime file is changed
- it defines hero/header, typography, color, badge, clickability, generated artifacts states and Data Flow exclusion contracts
- it records the Mission Overview duplicate header decision
- it defines the E16–E20 roadmap
- it defines QA expectations for future PRs
