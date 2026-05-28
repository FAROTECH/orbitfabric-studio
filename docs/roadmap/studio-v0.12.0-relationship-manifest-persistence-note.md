# v0.12.0 Relationship Manifest Persistence Note

This note records the implementation boundary for the Mission Data Flow Workbench relationship manifest persistence slice.

## Scope

This slice persists the latest Core-reported relationship manifest inside the Mission Cockpit Workbench context.

The embedded Mission Data Flow Workbench may now keep showing relationship manifest records after the current Core command output changes to another supported report type.

## Reset rule

The persisted relationship manifest is reset when the selected workspace changes.

This prevents relationships reported for one workspace from leaking into another workspace view.

## Boundary

The slice remains read-only and Core-derived.

It does not introduce:

- App-level routing changes;
- new active surfaces;
- sidebar changes;
- command bar changes;
- Inspector binding;
- React Flow;
- graph UI;
- authoring;
- generated artifact mutation;
- plugin behavior;
- live telemetry;
- private relationship inference;
- private data-flow inference.

## Implementation note

Persistence is intentionally local to the Mission Cockpit Workbench foundation.

A future App-level snapshot contract can still promote relationship manifest persistence to the central Core report snapshot model, but this slice avoids a broader `App.tsx` refactor.
