# E32 — Master Cleanup / Documentation / Source Architecture Plan

## Decision

E32 starts the post-visual-baseline cleanup phase.

The goal is not to rewrite Git history and not to destabilize the E28 visual baseline. The goal is to clean the current repository state, make the project easier to understand, reduce historical noise, and define a safe refactor path for source architecture and CSS.

The existing Git history remains valuable as a private audit trail. A publication-ready mirror or clean-history repository may be created later if needed, but the working repository should first be cleaned structurally.

## Audit summary

The E32 audit identified three main cleanup areas:

1. repository/documentation hygiene;
2. documentation reset and publication readiness;
3. source architecture and CSS maintainability.

The repository does not currently track generated build folders such as `dist/`, `node_modules/` or `src-tauri/target/`. Those may exist locally, but they are not a tracked repository hygiene issue.

## Area 1 — Repository historical cleanup

### Problem

The repository root and documentation tree still contain many historical planning and release artifacts from earlier Studio directions.

Examples include:

- root-level `V0_*_RELEASE_CHECKLIST.md` files;
- old roadmap files;
- old development notes;
- historical release notes;
- pre-E28 QA/audit material;
- mockup-era planning documents.

These files are not useless, but they no longer represent the current public-preview baseline.

### Decision

Do not delete aggressively.

Classify historical material into:

- current project contract;
- current QA baseline;
- historical archive;
- obsolete/removable material.

### First cleanup rule

Move historical material before deleting it.

Candidate future action:

```text
docs/archive/
```

or:

```text
docs/archive/releases/
docs/archive/roadmap/
docs/archive/development/
docs/archive/qa/
```

## Area 2 — Documentation reset

### Problem

The documentation has accumulated multiple project phases and several changes of direction. The current README, roadmap and architecture docs should be rewritten around the actual Studio baseline:

- local-first Tauri workbench;
- read-only public-preview baseline;
- Core-owned/Core-derived evidence;
- no private mission inference;
- no runtime/ground/telemetry/command behavior;
- E28 visual closure;
- E29 Generated Artifacts action contract;
- E30 ellipsis policy decision;
- E31 identity/packaging asset audit.

### Decision

Create a small current documentation set and demote old planning documents to archive.

Recommended current docs:

- `README.md`
- `ROADMAP.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_BOUNDARIES.md`
- `docs/qa/e28-final-studio-visual-closure-gate.md`
- `docs/qa/e29-generated-artifacts-action-contract.md` if added later
- `docs/qa/e30-label-overflow-ellipsis-audit.md`
- `docs/qa/e31-application-identity-packaging-assets-audit.md`
- this E32 plan

## Area 3 — Source architecture

### Problem

The source code is functional and visually stable, but not yet publication-grade internally.

Main findings:

- `src/App.tsx` is too large and still contains too many responsibilities.
- `src-tauri/src/lib.rs` is large and mixes command handlers, filesystem inspection, Core command execution, generated artifact discovery, capture saving and utility helpers.
- CSS is heavily layered and historically named.
- `src/main.tsx` imports many CSS files in a long ordering-sensitive stack.
- Several `publicBaseline*` CSS files are stabilization layers, not long-term source architecture.

### Decision

Do not refactor source architecture in E32.

Create a future refactor sequence that preserves E28 visual behavior:

1. split `App.tsx` by shell, workspace state, inspector and legacy diagnostic surfaces;
2. split Tauri backend into modules;
3. document CSS layer order;
4. consolidate CSS only after visual regression coverage is clear;
5. preserve the E28 capture baseline during each refactor.

## Classification

### KEEP

- current E28/E30/E31 QA decision records;
- current Core/Studio boundary documentation;
- current source files required by the app;
- Tauri config and package metadata;
- icon assets, marked as provisional;
- visual north-star assets, until brand refresh.

### MOVE

- root-level historical release checklists;
- old roadmap files no longer representing current direction;
- old development notes;
- historical release notes;
- mockup-era material;
- pre-E28 QA material not needed for daily project understanding.

### REWRITE

- `README.md`;
- `ROADMAP.md`;
- `docs/ARCHITECTURE.md`;
- possibly `docs/VISION.md`, `docs/UX_PRINCIPLES.md`, `docs/NON_GOALS.md` and `docs/DATA_BOUNDARIES.md` after current baseline wording is finalized.

### REFACTOR

- `src/App.tsx`;
- `src-tauri/src/lib.rs`;
- CSS layering and import order;
- domain/surface routing boundaries;
- legacy surface mapping.

### DELETE

No large deletion is approved by E32.

Deletion requires a later PR with explicit file list and reason.

### DEFER

- brand logo and final app icon;
- packaging activation;
- bundle target selection;
- signing/notarization;
- React Flow or graph library adoption;
- large CSS consolidation;
- Git history rewrite.

## Follow-up PR plan

### E33 — Documentation Archive & Root Cleanup

Move historical checklists and old planning artifacts out of the repository root and into an archive structure.

No runtime changes.

### E34 — Documentation Rewrite

Rewrite README, roadmap and architecture docs to describe the current Studio baseline clearly.

No runtime changes.

### E35 — Source Architecture Refactor Plan

Document the refactor plan for `App.tsx`, Tauri backend and CSS layers.

No runtime changes.

### E36+ — Source Architecture Refactor Slices

Perform small source refactors with build and visual QA gates.

Each PR must be narrow and reversible.

## Brand asset timing

Logo, app icon, favicon, Tauri icon master and graphical brand assets remain provisional.

They should be redesigned in a dedicated chat after the documentation reset and before packaging activation.
