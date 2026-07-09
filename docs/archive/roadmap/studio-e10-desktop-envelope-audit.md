# Studio E10 - Desktop Envelope Migration Audit

Status: consolidation / audit slice  
Scope: repository-owned audit, no UI migration  
Depends on: E1-E9 desktop envelope stabilization

---

## Purpose

E10 closes the normal desktop-envelope migration sequence by adding a small repository-owned audit.

The goal is not to migrate another surface. The goal is to make the current state explicit and checkable after Mission Overview, Core Report Runner, Data Products, Generated Artifacts and Scenario Evidence have all been promoted to the shared desktop envelope.

---

## Included

- A dev QA audit command verifies the migrated surface set.
- The audit checks root `DesktopSurface` usage for normal public surfaces.
- The audit checks that each bridge stylesheet exists and is imported.
- The audit checks that the visual QA manifest/checklist still contains the expected target selectors and capture profiles.
- The audit documents Data Flow Workbench as a deliberate special-case surface, not part of the normal envelope migration sequence.
- A generated audit report is written under `docs/qa/desktop-envelope-migration-audit.md`.

---

## Excluded

E10 does not:

- change UI layout;
- migrate Data Flow Workbench;
- alter OrbitFabric Core behavior;
- alter reference mission data;
- change capture image generation;
- introduce screenshot comparison;
- introduce browser automation;
- add mobile/tablet support.

---

## Normal migrated surfaces

The normal migrated surface set is:

```text
Mission Overview
Core Report Runner
Data Products
Generated Artifacts
Scenario Evidence
```

Each of these must keep:

```text
DesktopSurface root
surface-specific bridge CSS
manifest target selector
visual QA checklist row
reference + fullscreen capture profiles
```

---

## Special-case surface

Data Flow Workbench remains intentionally outside this migration set.

It is still captured by the QA harness, but it should not be treated as a normal dashboard-like surface until a dedicated Data Flow audit decides whether it should keep its current workbench/canvas model or be migrated through a different envelope pattern.

---

## Validation

Run:

```text
npm run qa:desktop-envelope-audit
npm run qa:visual-checklist
npm run build
git diff --check
```

The generated audit report must show `PASS` for the normal migrated surfaces and for the Data Flow Workbench special-case manifest/checklist checks.
