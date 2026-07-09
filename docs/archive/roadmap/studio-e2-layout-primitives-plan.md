# Studio E2 Layout Primitives Plan

Status: proposed implementation slice
Depends on: `studio-e1-desktop-envelope-contract.md`
Scope: desktop-only layout primitives
Non-goal: migrating Mission Overview, Core Report Runner, Data Products, Scenario Evidence, Generated Artifacts or Data Flow Workbench in this slice

---

## 1. Purpose

E2 introduces a small set of shared desktop layout primitives that future surface hardening must use instead of adding more one-off CSS overrides.

The goal is not to redesign a surface in this slice. The goal is to make the next redesign step deterministic.

E2 is successful only if it gives E3 a stable vocabulary for:

- surface root width;
- hero composition;
- card and panel framing;
- KPI/stat strips;
- repeatable grids;
- main/inspector split layouts;
- density selection.

---

## 2. Relationship to E1

E1 defines the contract. E2 provides the implementation vocabulary.

The primitives are constrained by the E1 desktop envelope:

- desktop-only;
- design reference: 1440 x 900;
- fullscreen desktop remains first-class;
- minimum supported desktop width: 1240 px;
- no mobile or tablet behavior;
- one scroll owner per surface;
- explicit surface root per route;
- no content hidden behind shell chrome;
- no new Core semantics.

---

## 3. Introduced primitives

This slice introduces:

```text
DesktopSurface
DesktopHero
DesktopCard
DesktopPanel
DesktopGrid
DesktopSplit
DesktopStatStrip
```

These primitives are intentionally small. They are not a design system, not a component library and not a semantic model.

They are a layout grammar for the public baseline surfaces.

---

## 4. CSS contract

The CSS primitive layer introduces the `of-desktop-*` namespace.

Rules:

- `of-desktop-*` classes are reserved for shared desktop shell/surface primitives.
- Feature-specific CSS must not override these primitives globally.
- A surface may add a local class next to a primitive class, but must not alter the primitive contract for other surfaces.
- New public-baseline layout fixes must prefer consuming these primitives over creating another `publicBaseline*` override file.

---

## 5. Initial tokens

The first token set is intentionally minimal:

```text
--of-desktop-reference-width
--of-desktop-min-supported-width
--of-desktop-content-max-width
--of-desktop-readable-max-width
--of-desktop-wide-max-width
--of-desktop-surface-gap
--of-desktop-card-gap
--of-desktop-panel-radius
--of-desktop-panel-border
--of-desktop-panel-bg
--of-desktop-panel-shadow
--of-desktop-heading-color
--of-desktop-muted-color
```

Future E3/E4 work may tune token values, but must preserve the token names unless a migration is explicitly documented.

---

## 6. Adoption order

The primitives must be adopted in this order:

1. Mission Overview.
2. Core Report Runner.
3. Data Products.
4. Generated Artifacts compact/inventory states.
5. Scenario Evidence.
6. Data Flow Workbench only after the first five surfaces prove the contract.

Data Flow Workbench remains deliberately last because E0 capture showed it has a different internal width behavior and behaves like a mini-application rather than a normal surface.

---

## 7. E2 acceptance criteria

E2 is accepted when:

- the primitive TypeScript module compiles;
- the primitive CSS is imported once from the application entrypoint;
- no existing surface is visually migrated by this slice;
