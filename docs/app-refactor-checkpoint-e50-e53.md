# E54 — App.tsx Refactor Checkpoint after E50–E53

## Purpose

This checkpoint records the post-refactor state after E50 through E53 extracted helper and configuration responsibilities from `src/App.tsx`.

This is a documentation-only checkpoint before deciding whether to touch the more delicate Core command handler seam. It documents the current state without defining, requiring, or implying any runtime, layout, routing, data, packaging, or source-code behavior change.

## Completed Refactor Sequence

The completed refactor sequence is:

- **E50 — Core report snapshot helpers extracted**
  - Extracted pure helper responsibilities for creating and reading Core report snapshots out of `src/App.tsx`.
- **E51 — Studio surface configuration extracted**
  - Extracted static Studio surface configuration out of `src/App.tsx`.
- **E52 — Studio formatting helpers extracted**
  - Extracted pure Studio formatting helpers out of `src/App.tsx`.
- **E53 — surface availability helper extracted**
  - Extracted runtime surface availability creation out of `src/App.tsx`.

## Extracted Files

The E50–E53 refactor sequence introduced these focused source files:

- `src/coreReportSnapshots.ts`
  - Owns Core report snapshot helper logic used to create and hydrate report snapshot state.
- `src/studioSurfaceConfig.ts`
  - Owns static Studio surface configuration that describes the available Studio surface metadata.
- `src/studioFormatters.ts`
  - Owns pure formatting helpers used by Studio presentation code.
- `src/surfaceAvailability.ts`
  - Owns runtime construction of active surface availability state from the current Studio context.

## Preserved Invariants

The following invariants remain preserved after the E50–E53 refactor sequence:

- The E28 visual baseline remains governing.
- Runtime behavior is intentionally unchanged.
- UI/layout is intentionally unchanged.
- Active routing is intentionally unchanged.
- Active surfaces are intentionally unchanged.
- Core command behavior is unchanged.
- Core/model-data semantics are unchanged.
- Generated artifact behavior is unchanged.
- Packaging/brand/icon work is unchanged and still deferred.
- No CSS changes were part of E50–E53.
- No package changes were part of E50–E53.
- No Tauri/Rust changes were part of E50–E53.
- Studio remains read-only and downstream from OrbitFabric Core.

## Current App.tsx Responsibilities

After the E50–E53 refactor sequence, `App.tsx` still owns high-level application responsibilities, including:

- application state
- workspace opening flow
- selected file, artifact, simulation, and domain entity context
- Core command handlers
- Core report snapshot hydration
- active surface and navigation routing
- top-level shell composition
- runtime composition of active surfaces

This checkpoint does not assert that these responsibilities are permanently owned by `App.tsx`; it only records the current post-refactor state.

## Remaining Candidate Seam

The next possible source seam is the Core command handler area, but that seam is more delicate than the helper/config extractions completed in E50–E53 because it touches:

- Core error state
- Core result state
- selected detail updates
- generated artifact refresh token
- Core report snapshot hydration
- scenario execution flow

Any future work in this area should be evaluated cautiously against the preserved invariants above. This checkpoint does not promise that the seam will be extracted.

## Explicit Non-goals

This checkpoint does not:

- move Core command handlers
- alter Core command payloads
- introduce React hooks
- alter routing
- alter layout
- change generated artifact behavior
- activate packaging
- define brand/logo/icon assets
- introduce React Flow
