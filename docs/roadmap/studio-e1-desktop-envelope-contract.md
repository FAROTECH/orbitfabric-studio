# E1 - Desktop Envelope Contract

Status: proposed contract
Baseline input: E0 dev-only QA surface capture harness
Target branch: `hardening/layout-1440-stabilization`
Scope: desktop layout contract only

---

## 1. Purpose

E1 defines the desktop envelope that every public OrbitFabric Studio surface must obey before layout primitives are introduced in E2 and before any surface-specific redesign begins in E3.

E1 is not a visual redesign milestone.
E1 is not a component migration milestone.
E1 is not a React Flow, graph-library, or widget-library decision point.

E1 exists to make the shell, viewport, scroll ownership, capture target, and surface sizing rules explicit and testable.

---

## 2. Hard boundaries

Studio remains a desktop-first engineering cockpit.

Supported envelope:

```text
Primary reference viewport: 1440 x 900
Fullscreen desktop viewport: first-class supported profile
Minimum supported desktop width: 1240 px
Below 1240 px: unsupported / not optimized
Mobile layout: out of scope
Tablet layout: out of scope
```

No public surface may depend on mobile or responsive stacking rules to become usable at the reference desktop envelope.

No E1 work may change OrbitFabric Core semantics, generated artifacts, Mission Model data, scenario data, validation behavior, command execution, or read-only boundaries.

---

## 3. Shell contract

The Studio shell is composed of these layout regions:

```text
Workspace header
Primary sidebar
Main surface
Optional contextual inspector
Shell status bar
```

The shell owns global chrome. A public surface owns only its content region.

The primary sidebar and shell status bar must never be treated as part of a public surface's semantic content.

The status bar must remain usable at 1440 x 900 with dev capture enabled. QA controls must not be clipped by workspace path, labels, badges, or preview copy.

---

## 4. Surface root contract

Every public surface must have a stable root selector.

Required public surface identities:

```text
Mission Overview        -> mission-overview
Core Report Runner      -> core-report-runner
Data Products           -> data-products
Scenario Evidence       -> scenarios
Generated Artifacts     -> generated-artifacts
Data Flow Workbench     -> data-flow-workbench
```

The QA capture harness must never fall back to `active-surface` for these public surfaces. A fallback may remain only for reserved or transitional surfaces.

Each public surface root must be semantically discoverable through either:

```text
an explicit id
an explicit class name
an explicit aria-label
```

Selector matching must prefer the most specific surface root over `.main-surface`.

---

## 5. Scroll ownership contract

Each public surface must have exactly one effective vertical scroll owner.

Allowed scroll owners:

```text
.main-surface
surface-specific root, only when explicitly justified
```

Disallowed patterns:

```text
body-level scrolling for cockpit surfaces
nested vertical scroll containers without a specific inspector/table purpose
fixed overlays that hide surface content
status bar overlap over content
sidebar overlap over content
```

Tables and inspectors may scroll internally only when they are local work areas, not when they replace the surface-level scroll model.

The QA overlay must report the resolved scroll owner.

---

## 6. Width and density contract

At 1440 x 900, with sidebar expanded, each public surface must remain inspectable without horizontal clipping.

At 1920 x 1080, with sidebar expanded, each public surface must use the available desktop width unless it has a documented reason not to.

Reference expectations:

```text
Mission Overview: compact dashboard target
Core Report Runner: dense control cockpit target
Data Products: tri-column inspection target
Scenario Evidence: long evidence console target
Generated Artifacts: inventory/table stress target
Data Flow Workbench: transitional workbench target, not E3 pilot
```

A surface may be vertically long. Vertical length is not automatically a failure. The failure condition is uncontrolled nested scrolling, clipped controls, hidden critical actions, unreadable density, or inconsistent shell integration.

---

## 7. Capture evidence contract

E0 capture evidence is the acceptance mechanism for E1 and later milestones.

For every relevant QA capture, the PNG must include:

```text
surface label
profile
mode
viewport size
captured content size
DPR
sidebar state
scroll owner
target selector
timestamp
```

Filenames must include:

```text
of-studio-qa__<surface-id>__current-window__viewport-<w>x<h>__content-<w>x<h>__sidebar-<state>__<timestamp>.png
```

Capture files remain local QA artifacts and must not be committed.

---

## 8. E1 acceptance checks

E1 is accepted only when all checks below are true.

```text
1. npm run build passes.
2. cargo check --manifest-path src-tauri/Cargo.toml passes or no Rust change is included.
3. E0 capture remains dev-only behind VITE_OF_DEV_CAPTURE=1.
4. QA capture button is visible and usable at 1440 x 900.
5. Each public surface resolves to a named surface id, not active-surface fallback.
6. Each public surface reports a deterministic scroll owner.
7. The contract document is present in docs/roadmap.
8. No production user-facing route, Core behavior, Mission Model source, generated artifact, or scenario data is changed.
```

---

## 9. E2 entry criteria

E2 may begin only after E1 is committed.

E2 may introduce shared layout primitives, but must not migrate every surface at once.

Allowed E2 work:

```text
DesktopSurface
SurfaceHero
SurfaceCard
SurfaceStatsGrid
SurfaceSplitGrid
shared spacing and density tokens
shared scroll-owner helpers
QA-oriented layout diagnostics
```

Disallowed E2 work:

```text
large visual redesign of all surfaces
React Flow adoption
new graph semantics
new Core-derived metrics
Mission Model editing
command uplink behavior
private inference
```

---

## 10. E3 pilot selection

Mission Overview is the E3 pilot surface.

Reason:

```text
It is the most compact public surface.
It is closest to the target cockpit direction.
It exercises summary cards, hero layout, domain cards, generated artifacts, warnings, and evidence posture.
Its E0 captures show a manageable desktop envelope.
```

Core Report Runner is the E4 pilot surface.

Data Products, Scenario Evidence, Generated Artifacts, and Data Flow Workbench must not be migrated before the E2 primitives and E3 pilot prove stable.

---

## 11. Explicit non-goals

E1 does not implement:

```text
new cockpit visuals
new graph rendering
React Flow
new data model
new generated artifact semantics
new validation metrics
Mission Model authoring
artifact mutation
command uplink
live telemetry
private relationship inference
private readiness or health calculations
```

E1 is a contract. It prevents the next layout work from becoming unbounded.
