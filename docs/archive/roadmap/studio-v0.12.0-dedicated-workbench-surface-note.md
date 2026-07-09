# v0.12.0 Dedicated Workbench Surface Boundary

This note records the boundary for the first dedicated Mission Data Flow Workbench surface frame.

## Scope

This slice prepares a standalone route-ready frame for the Mission Data Flow Workbench.

It adds:

- a dedicated `MissionDataFlowWorkbenchRoute` component;
- explicit route-level read-only and Core-derived boundary language;
- reuse of the existing `MissionDataFlowWorkbenchSurface` Reference B layout;
- no new semantics beyond the existing Workbench snapshot.

## Why this is not wired in App.tsx yet

`App.tsx` is currently a large shell file.

Adding a new `ActiveSurface` requires a coordinated update to:

- `navigationModel.ts`;
- `shellCommandBarModel.ts`;
- `App.tsx` default navigation mapping;
- `App.tsx` surface availability map;
- `App.tsx` report snapshot construction for the Workbench route;
- `App.tsx` active surface renderer.

This slice avoids a fragile connector-side replacement of the large `App.tsx` file.

The next slice should perform the App-level wiring locally or from a verified full-file baseline.

## Non-goals

This slice does not introduce:

- new active surface registration;
- sidebar navigation changes;
- command bar changes;
- App-level routing changes;
- React Flow;
- graph editing;
- drag/drop;
- authoring;
- private relationship inference;
- private data-flow inference;
- generated artifact mutation.
