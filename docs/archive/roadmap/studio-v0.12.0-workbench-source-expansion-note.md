# v0.12.0 Workbench Source Expansion Note

This note records the implementation boundary for the Mission Data Flow Workbench source expansion slice.

## Scope

This slice expands the data made visible to the existing Mission Cockpit embedded Workbench foundation.

The Workbench may now receive:

- Core model summary;
- Core entity index;
- Core relationship manifest when present in the current Core report content;
- Core dashboard summary;
- Core simulation report;
- Core coverage summary.

## Boundary

The slice remains read-only and Core-derived.

It does not introduce:

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

## Known limitation

The relationship manifest is consumed from the current Core report content only.

It is not persisted in the Mission Cockpit snapshot model in this slice.

Persisting it requires a deliberate App-level snapshot contract update in a later PR.
