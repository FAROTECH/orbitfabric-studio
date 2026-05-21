# ADR-0009 - v0.4 Core-derived Relationship Surface

## Status

Accepted for v0.4.0 planning.

## Context

OrbitFabric Studio v0.3.0 is a Core-derived Contract Navigation Surface.

It consumes:

```text
Core model_summary.json
Core entity_index.json
```

It answers:

```text
What contract domains are present in this mission, and where can I inspect them?
What contract entities are defined in this mission, and where can I inspect their source file?
```

The next milestone is:

```text
v0.4.0 - Relationship Surface
```

The intended loop becomes:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships
```

OrbitFabric Core v1.0.0 exposes a Core-owned Relationship Manifest Surface.

The stable command shape is:

```text
orbitfabric export relationship-manifest <mission_dir> --json <report_path>
```

The produced report is:

```text
relationship_manifest.json
kind: orbitfabric.relationship_manifest
manifest_version: 0.1-candidate
status: candidate
```

The report answers:

```text
How are indexed mission contract entities related?
```

The report is a manifest of Core-owned relationship records.

It is not a graph engine.

It is not a dependency graph.

It is not a runtime behavior model.

It is not a ground behavior model.

Studio needs to make this surface visible without becoming authoritative for relationship semantics.

## Decision

For v0.4.0, Studio will consume one additional fixed Core export command:

```text
orbitfabric export relationship-manifest <mission_dir> --json <studio_controlled_report_path>
```

The command invocation remains allowlisted.

The frontend will not expose arbitrary CLI argument entry.

The report path will be controlled by Studio.

The UI will distinguish:

```text
source model
derived relationship report
generated output
UI state
```

Studio will parse only the machine-readable fields exposed by Core v1.0.0.

Studio will render Core-owned relationship types and relationship records read-only.

Studio will not derive relationships from YAML, names, IDs, file names, stdout, stderr, generated documentation, generated runtime files, generated ground files or UI state.

Studio will not introduce private relationship semantics.

Studio will not introduce a dependency graph.

Studio will not introduce a relationship graph engine.

Studio may link relationship endpoints to existing Core `entity_index.json` records when available.

The linking rule is limited to:

```text
endpoint domain + endpoint id -> entity_index entity domain + entity id
```

If the entity index is unavailable or incompatible, Studio will still show the Core relationship record without endpoint detail links.

## Accepted Relationship Manifest Fields

The v0.4.0 implementation baseline for relationship navigation is the Core v1.0.0 relationship manifest shape.

Studio may consume:

```text
manifest_version
kind
orbitfabric_version
status
mission
source
boundaries
counts
relationship_types
relationships
derivation_policy
```

Studio may display relationship type fields provided by Core, including:

```text
relationship_type
display_name
from_domain
to_domain
derived_from.model_field
relationship_count
```

Studio may display relationship record fields provided by Core, including:

```text
relationship_id
relationship_type
from.domain
from.id
to.domain
to.id
derived_from.model_field
```

Studio must not invent additional relationship record fields.

Studio must not add source line, source column, YAML AST, dependency graph, plugin, runtime or ground behavior fields.

## Boundary Requirements

The v0.4.0 UI must make the following boundaries explicit:

```text
Core relationship manifest
not relationship graph
not dependency graph
no source locations
no runtime behavior
no ground behavior
```

These boundary labels must remain visible near the Relationship Manifest surface.

## Provenance Requirements

Every relationship shown by Studio must be traceable to a Core relationship record.

Every relationship explanation must state that the relationship is Core-owned and derived from the explicit Mission Model field indicated by Core.

Studio must not claim that a relationship was derived, validated or interpreted by Studio.

## Explanation Requirements

For a selected relationship record, Studio may explain:

```text
this relationship comes from Core relationship_manifest.json
it is derived from derived_from.model_field
it is not inferred by Studio
it is not runtime behavior
it is not ground behavior
it is not a dependency graph edge
```

Studio may show safe source-file links only when those links are already available through Core-provided entity index or source-file metadata.

No line or column jump is allowed.

## Compatibility Handling

Studio v0.4.0 targets Core v1.0.0 behavior for relationship manifest consumption.

Compatibility must be based on command behavior and report availability.

A compatible relationship report must satisfy at least:

```text
command completes successfully
report content is available
kind is orbitfabric.relationship_manifest
manifest_version is recognized
required top-level fields are present
```

A missing, unsupported or invalid report must result in a clear fallback state.

Version strings may be shown but must not be the only compatibility signal.

## Consequences

- v0.4.0 can answer how indexed entities are related according to Core.
- Core remains the only authority for relationship semantics.
- Studio becomes a relationship inspection surface, not a relationship engine.
- Studio can reuse entity index records for endpoint navigation.
- Studio cannot provide source line navigation because Core v1.0.0 does not expose source locations.
- Studio cannot provide runtime or ground behavior interpretation because Core v1.0.0 explicitly excludes those semantics from the relationship manifest.
- A graph-like visualization is optional and deferred unless every node and edge can be mapped one-to-one to Core-owned records.

## Explicit Non-decisions

This ADR does not authorize:

```text
editing
visual model editing
semantic YAML parsing
private relationship inference
private graph semantics
dependency graph
relationship graph engine
source line or column navigation
YAML AST navigation
fake source spans
plugin UI
plugin execution
runtime behavior
ground behavior
live telemetry
command uplink
scenario runner
arbitrary OrbitFabric CLI argument entry
arbitrary shell command
synthetic nodes
synthetic edges
```

## Related Documents

- `docs/development/v0.4.0-relationship-surface.md`
- `V0_4_RELEASE_CHECKLIST.md`
- OrbitFabric Core `docs/reference/relationship-manifest-surface.md`
