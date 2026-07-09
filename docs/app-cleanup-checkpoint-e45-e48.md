# E49 — App.tsx Cleanup Checkpoint after E45–E48

## Purpose

This checkpoint records the post-cleanup state after E45 through E48 removed stale, unreachable, and legacy code from `src/App.tsx`.

This is a documentation-only checkpoint before pausing the current cleanup sequence and before choosing the next source or backend workstream. It does not define, require, or imply any runtime change.

## Completed Cleanup Sequence

The completed cleanup sequence is:

- **E45 — stale legacy scenario evidence code removed**
  - Removed obsolete scenario evidence code that was no longer part of the active Studio surface.
- **E46 — small stale App.tsx symbols removed**
  - Removed small unused symbols and helpers that remained after prior refactors.
- **E47 — unreachable legacy workspace surface chain removed**
  - Removed the unreachable legacy workspace inspection surface chain.
- **E48 — stale local state / derived flags removed**
  - Removed stale local state and unused derived flags that no longer affected the active application flow.

## Preserved Invariants

The following invariants remain preserved after the E45–E48 cleanup sequence:

- The E28 visual baseline remains governing.
- Runtime behavior is intentionally unchanged.
- UI/layout is intentionally unchanged.
- Core/model-data semantics are unchanged.
- Generated artifact behavior is unchanged.
- Packaging/brand/icon work is unchanged and still deferred.
- Studio remains read-only and downstream from OrbitFabric Core.
- Studio does not become mission operations, telemetry live, command uplink, or ground segment runtime.

## Current App.tsx Responsibilities

After the E45–E48 cleanup sequence, `App.tsx` primarily owns high-level application responsibilities, including:

- application state
- workspace opening flow
- selected file, artifact, simulation, and domain entity context
- Core command handlers
- Core report snapshot hydration
- active surface and navigation routing
- top-level shell composition

This checkpoint does not assert that these responsibilities are permanently owned by `App.tsx`; it only records the current post-cleanup state.

## Removed Legacy Responsibilities

The E45–E48 cleanup sequence removed stale or unreachable responsibilities from `App.tsx`, including:

- old scenario evidence surface
- old workspace inspection surface chain
- old inline Core output/report panels
- old file viewer-only loading/error state
- small unused symbols and helpers left from prior refactors

## Remaining Next-Step Options

Possible next workstreams remain cautious and non-prescriptive:

- App.tsx state/handler extraction only if a clear seam is identified
- Tauri backend module split planning
- CSS layer-order documentation before any CSS consolidation
- brand/logo/icon dedicated pass
- packaging activation only after brand and release policy

These options are not roadmap promises. They are candidates to evaluate against the current codebase state before selecting the next focused task.

## Explicit Non-goals

This checkpoint does not:

- introduce React Flow
- alter routing
- alter layout
- change Core command behavior
- change generated artifact behavior
- activate packaging
- define brand/logo/icon assets
