# E44 — Source Refactor Checkpoint

## Purpose

This checkpoint documents the state of the frontend source after the first `App.tsx` extraction sequence, covering E37 through E43.

This change is documentation-only. It does not define, require, or imply any runtime change.

## Baseline Preserved

The E28 visual baseline remains the governing UI baseline.

- No CSS or layout changes were intentionally introduced by this checkpoint.
- Studio remains read-only and downstream from OrbitFabric Core.
- No Core/model-data semantics were changed.
- No generated artifact behavior was changed.
- Packaging and brand/logo/icon work remain deferred.

## Completed Extraction Sequence

The completed PR sequence is:

- **E37 — Extract File Viewer Component**
  - Removed file viewer rendering responsibility from `App.tsx`.
  - Created `src/FileViewer.tsx`.
  - Behavioral intent: no runtime or UI change.

- **E38 — Extract Workspace Entry Components**
  - Removed workspace entry and missing-file presentation responsibility from `App.tsx`.
  - Created `src/EntrySection.tsx` and `src/MissingFiles.tsx`.
  - Behavioral intent: no runtime or UI change.

- **E39 — Extract Public Preview Placeholder**
  - Removed public preview placeholder rendering responsibility from `App.tsx`.
  - Created `src/PublicPreviewPlaceholder.tsx`.
  - Behavioral intent: no runtime or UI change.

- **E40 — Extract Workspace Header**
  - Removed workspace header rendering responsibility from `App.tsx`.
  - Created `src/WorkspaceHeader.tsx`.
  - Behavioral intent: no runtime or UI change.

- **E41 — Extract Primary Sidebar**
  - Removed primary sidebar rendering responsibility from `App.tsx`.
  - Created `src/PrimarySidebar.tsx`.
  - Behavioral intent: no runtime or UI change.

- **E42 — Extract Inspector Field Helpers**
  - Removed inspector field helper rendering responsibility from `App.tsx`.
  - Created `src/InspectorField.tsx`.
  - Behavioral intent: no runtime or UI change.

- **E43 — Extract Inspector Panel**
  - Removed inspector panel rendering/composition responsibility from `App.tsx`.
  - Created `src/InspectorPanel.tsx`.
  - Behavioral intent: no runtime or UI change.

## Current Extracted Files

The current extracted frontend files from this sequence are:

- `src/FileViewer.tsx`
- `src/EntrySection.tsx`
- `src/MissingFiles.tsx`
- `src/PublicPreviewPlaceholder.tsx`
- `src/WorkspaceHeader.tsx`
- `src/PrimarySidebar.tsx`
- `src/InspectorField.tsx`
- `src/InspectorPanel.tsx`

## What `App.tsx` Still Owns

After E43, `App.tsx` still owns high-level application responsibilities, including at least:

- application state
- workspace opening flow
- selected surface state
- selected object, file, and generated artifact state
- Core command/report state
- high-level layout composition
- remaining large surface routing/composition
- formatter/helper functions not yet extracted where those helpers are still app-owned

This checkpoint does not assert exact line counts for any remaining `App.tsx` responsibility.

## Why the Next Step Should Not Be Another Blind Extraction

The inspector extraction was the largest frontend extraction in this sequence. After E43, the remaining `App.tsx` responsibilities are more coupled than the earlier presentation-only slices.

Future slices should be chosen only after inspecting the current `App.tsx` shape and build status. The next useful work may still be frontend source cleanup, but it should be based on current coupling rather than continuing the extraction sequence mechanically.

Backend Rust module split work and CSS layer-order documentation also remain possible next workstreams.

## Recommended Next Workstreams

A. **App.tsx audit after E43**
   - Inspect the current `App.tsx` responsibilities and identify safe, behavior-preserving slices.

B. **Tauri backend module split planning/execution**
   - Plan and execute Rust module boundaries separately from frontend extraction work.

C. **CSS layer-order documentation before any CSS consolidation**
   - Document layer/order expectations before attempting consolidation or cleanup.

D. **Brand/logo/icon dedicated pass**
   - Treat visual identity and asset work as its own pass rather than combining it with source refactors.

E. **Packaging activation only after brand and release policy decisions**
   - Defer packaging activation until branding and release expectations are settled.

## Validation Commands

Recommended validation commands for this checkpoint and nearby refactor work:

```bash
npm run build
git diff --check
npm run qa:icon-audit
npm run qa:studio-visual-token-contract
cargo check --manifest-path src-tauri/Cargo.toml
cd src-tauri
cargo fmt --check
```

## Non-goals

This checkpoint explicitly does not include:

- React Flow adoption
- layout redesign
- CSS consolidation
- Core/model-data change
- generated artifact mutation
- packaging activation
- brand asset work
