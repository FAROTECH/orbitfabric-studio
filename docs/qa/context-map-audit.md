# Context Map Audit

Context Map Audit is a **development-only verification aid** for proving that the map shown by Studio matches the explicit OrbitFabric Core relationship facts for the current interaction state.

It is not a product semantic surface and it does not create mission meaning.

The `Audit map` control is rendered only by Vite development builds (`import.meta.env.DEV`). It is intentionally absent from production builds.

## Evidence model

Each audit exports one JSON file with four independently inspectable layers:

```text
Core raw facts
  -> expected_from_core
  -> context_model
  -> rendered
```

`core.relationships` contains the complete hydrated Core Relationship Manifest for the mission.

`expected_from_core` is reconstructed directly from that manifest plus the current `expanded` set and `context_path`. It deliberately does not call `buildContextGraphModel`.

`context_model` records the nodes and edges produced by Studio's renderer-independent Context Graph model.

`rendered` records the actual React Flow projection, including edge direction, labels, path/current highlighting flags, node expansion state, expandability and layout positions.

The `checks` section compares the layers and reports missing/extra nodes and relationships.

## Important semantics

For a given audit state:

- the root is initially expanded;
- every explicitly expanded entity contributes all of its immediate incoming and outgoing Core relationships;
- Context Path contributes its exact Core-owned relationships but does **not** expand path-node neighborhoods;
- selecting a node does not implicitly expand it;
- arrow direction must match Core `from -> to`;
- rendered path highlighting must match Context Path membership;
- rendered current-neighborhood highlighting must match edges incident to the current entity.

## Suggested verification sequence

Use several mission shapes. For each step, export the evidence before making the next interaction so files can be compared independently.

1. Open a known entity as Context Map root. Do not expand anything. Export evidence.
2. Expand one visible node with `+`. Export evidence again.
3. Select one immediate neighbor. Export evidence and verify Context Path without implicit expansion.
4. Use `Expand context` once. Export evidence and verify exactly one additional visible-neighborhood expansion step.
5. Navigate backward to an existing Context Path entity. Export evidence and verify path truncation.
6. Reset the map. Export evidence and verify the expanded set returns to the root while the investigation selection/path semantics remain explicit.

A useful audit should have `checks.all_pass = true`. A false value is not automatically a Core defect: use the difference blocks to locate the discrepancy between Core expectation, Context Graph model and React Flow render.

## File handling

The development WebView downloads the JSON as:

```text
orbitfabric-context-map-<mission>-<root>-<current>-<timestamp>.json
```

The timestamp is used only in the filename so multiple interaction snapshots can coexist. The evidence content itself does not contain a generation timestamp and is deterministic for the same hydrated mission and map state.
