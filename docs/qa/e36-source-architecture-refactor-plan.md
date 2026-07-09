# E36 — Source Architecture Refactor Plan

## Decision

E36 defines the source architecture hardening plan for OrbitFabric Studio after the E35 documentation rewrite.

This PR does **not** refactor runtime code.

The objective is to define a narrow, reviewable and reversible refactor path that improves the internal quality of the Studio codebase while preserving the stabilized E28 visual baseline.

## Context

OrbitFabric Studio has reached a stable public-preview UI baseline, but the source architecture still reflects several historical implementation phases.

The current codebase is functional and visually stable, but it is not yet structured as cleanly as it should be for long-term maintainability, public review or future packaging.

Main areas identified for hardening:

- `src/App.tsx`;
- `src-tauri/src/lib.rs`;
- CSS import order and layer ownership;
- legacy diagnostic surface routing;
- shell / workspace / inspector responsibility boundaries;
- QA gates for safe refactor slices.

## Non-goals

E36 does not authorize:

- visual redesign;
- CSS consolidation;
- layout changes;
- runtime behavior changes;
- Core/model-data changes;
- packaging activation;
- brand asset work;
- React Flow or graph-library adoption;
- private mission inference;
- large multi-file refactor in a single PR.

## Refactor principles

Every source architecture refactor must follow these rules:

1. Preserve the E28 visual baseline.
2. Change one architectural seam per PR.
3. Keep every PR reviewable and reversible.
4. Run build and QA checks before merge.
5. Avoid semantic changes unless explicitly scoped.
6. Preserve Core/Studio boundaries.
7. Do not improve code structure by hiding missing Core outputs behind private Studio inference.
8. Prefer extraction over rewrite.
9. Prefer mechanical movement over behavior change.
10. Keep naming explicit and product-aligned.

## Frontend architecture plan

### Problem

`src/App.tsx` currently owns too many responsibilities.

It acts as:

- shell orchestrator;
- workspace state owner;
- Core command action host;
- primary surface router;
- legacy diagnostic surface host;
- inspector state host;
- file viewer host;
- several panel/component definitions host;
- formatting utility location.

This was acceptable during fast stabilization, but it is now too large for publication-grade maintainability.

### Target direction

Split `src/App.tsx` by responsibility without changing behavior.

Recommended extraction sequence:

#### E37.1 — Shell state extraction

Extract shell-level state and callbacks into a dedicated module or hook.

Candidate names:

```text
src/studioShellState.ts
src/useStudioShellState.ts
```

Scope:

- active surface;
- active navigation item;
- sidebar state;
- inspector visibility;
- local UI-only shell state.

No visual changes.

#### E37.2 — Workspace state extraction

Extract workspace/project inspection state.

Candidate names:

```text
src/workspaceState.ts
src/useWorkspaceInspection.ts
```

Scope:

- workspace path;
- mission directory;
- project entries;
- missing files;
- inspection errors;
- workspace loading state.

No Core command behavior changes.

#### E37.3 — File viewer extraction

Extract file viewer selection and rendering support.

Candidate names:

```text
src/FileViewer.tsx
src/fileViewerModel.ts
```

Scope:

- selected file;
- file content;
- missing file state;
- supported text rendering.

No Monaco/editor or preview behavior change.

#### E37.4 — Inspector extraction

Extract generic inspector rendering and detail-selection handling.

Candidate names:

```text
src/InspectorPanel.tsx
src/inspectorModel.ts
```

Scope:

- inspector selection model;
- inspector fields;
- path formatting;
- empty state.

No surface-specific detail behavior changes.

#### E37.5 — Legacy diagnostic surfaces extraction

Move transitional / diagnostic surface rendering out of `App.tsx`.

Candidate names:

```text
src/LegacyDiagnosticSurfaces.tsx
src/legacyDiagnosticSurfaceModel.ts
```

Scope:

- public preview placeholders;
- reserved future surfaces;
- old diagnostic routing boundaries.

No navigation behavior change.

#### E37.6 — Core report panel extraction

Move remaining Core report panels out of `App.tsx`.

Candidate names:

```text
src/CoreReportPanels.tsx
src/coreReportFormatting.ts
```

Scope:

- validation summary;
- model summary;
- entity index;
- relationship manifest;
- raw/unrecognized Core report rendering.

No Core parsing or command behavior change.

## Backend architecture plan

### Problem

`src-tauri/src/lib.rs` currently mixes:

- Tauri command handlers;
- workspace inspection;
- generated artifact inspection;
- bounded text file loading;
- Core command invocation;
- generated report path helpers;
- generated artifact classification;
- capture image saving;
- OS file-manager reveal support;
- platform-specific helpers;
- base64 decoding utilities.

This is functional, but it is too concentrated for long-term maintenance.

### Target direction

Split backend responsibilities into focused Rust modules.

Candidate structure:

```text
src-tauri/src/
├── lib.rs
├── workspace.rs
├── files.rs
├── core_commands.rs
├── artifacts.rs
├── reports.rs
├── capture.rs
├── platform.rs
└── errors.rs
```

### Recommended sequence

#### E38.1 — Backend module skeleton

Create module files and move pure helpers first.

Candidates:

- display path formatting;
- supported text file detection;
- language detection;
- safe filename handling.

No command behavior changes.

#### E38.2 — Workspace inspection module

Move workspace inspection and mission detection helpers.

Scope:

- workspace directory canonicalization;
- mission directory detection;
- expected file counting;
- YAML file listing;
- generated location inspection.

No frontend behavior change.

#### E38.3 — File operations module

Move bounded text file reading and file canonicalization.

Scope:

- safe file read;
- supported text files;
- workspace-contained path enforcement.

No permission broadening.

#### E38.4 — Core command module

Move fixed Core command wrappers and command execution utilities.

Scope:

- Core version;
- inspect mission;
- lint mission;
- export model summary;
- export entity index;
- export relationship manifest;
- export dashboard summary;
- export scenario run index;
- export coverage summary;
- scenario simulation.

No free-form command execution.

#### E38.5 — Generated artifacts module

Move generated artifact discovery, classification, inventory and count helpers.

No generated artifact mutation.

#### E38.6 — Capture and platform module

Move development capture saving and platform file-manager reveal support.

No packaging or OS integration expansion.

## CSS architecture plan

### Problem

CSS is currently stable but heavily layered.

`src/main.tsx` imports a long ordering-sensitive CSS stack. Several files are stabilization layers created during visual hardening.

This is acceptable for E28 stability, but it is not a clean long-term architecture.

### Immediate rule

Do **not** consolidate CSS during early source refactor slices.

First document the layer order.

### Recommended CSS layer classification

Current CSS should be classified into:

```text
base/global
visual semantics/tokens
shell
mission cockpit
surface-specific
desktop envelope
generated artifacts
scenario evidence
public baseline stabilization
dev capture
icons
```

### Future CSS work

A later PR may add:

```text
docs/qa/css-layer-order.md
```

Only after that should CSS consolidation begin.

CSS consolidation rules:

1. Do not remove `publicBaseline*` files blindly.
2. Preserve import order unless the PR proves it is safe.
3. Use visual QA before and after.
4. Avoid broad selector rewrites.
5. Prefer comment and grouping first.
6. Defer actual selector deduplication until source-level refactors are stable.

## QA gates for refactor PRs

Every source refactor PR should run:

```bash
npm run build
git diff --check
npm run qa:icon-audit
npm run qa:studio-visual-token-contract
cargo check --manifest-path src-tauri/Cargo.toml
```

When Rust files are touched:

```bash
cd src-tauri
cargo fmt --check
```

When visual shell, layout or CSS files are touched, also run the visual QA/capture workflow used for the E28 baseline.

## Proposed follow-up sequence

### E37 — Frontend Shell Extraction Plan Slice

Start with the least risky frontend extraction.

Recommended first source PR:

```text
Extract file viewer or inspector components from App.tsx without changing behavior.
```

Rationale:

- easier to review than shell state extraction;
- low semantic risk;
- likely reduces `App.tsx` size immediately;
- no CSS/layout change required.

### E38 — Backend Module Split Plan Slice

Start with pure helper extraction from `src-tauri/src/lib.rs`.

Recommended first backend PR:

```text
Move pure path/display/text helper functions into a module without changing commands.
```

Rationale:

- low behavioral risk;
- easy to verify with `cargo check`;
- creates module pattern for later backend splits.

### E39 — CSS Layer Order Documentation

Document CSS import order before any CSS consolidation.

### E40+ — Source Refactor Slices

Proceed incrementally after the first frontend/backend extraction PRs have proven safe.

## Brand and packaging boundary

Brand assets remain deferred.

Packaging remains inactive.

Source architecture refactors must not become packaging activation PRs.

Logo, app icon, favicon and generated Tauri icon assets will be handled in a dedicated brand-assets pass after source and documentation hardening have stabilized.
