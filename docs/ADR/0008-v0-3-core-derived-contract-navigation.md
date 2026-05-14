# ADR-0008 - v0.3 Core-derived Contract Navigation

## Status

Accepted and implemented in v0.3.0.

## Context

OrbitFabric Studio v0.2.0 established the validation and diagnostics workbench loop:

```text
Open -> Inspect -> Validate -> Understand
```

It invokes fixed OrbitFabric Core commands, displays Core-derived lint reports and preserves raw stdout, stderr and exit code evidence.

The v0.3.0 milestone is:

```text
v0.3.0 - Contract Navigation Surface
```

The implemented loop becomes:

```text
Open -> Inspect -> Validate -> Navigate
```

Studio must remain downstream.

The Mission Model remains the source of truth.

OrbitFabric Core remains authoritative for model loading, structural validation, semantic linting, generated artifacts, runtime-facing bindings, ground-facing artifacts, contract introspection and entity indexing.

Studio may render contract navigation only from Core-owned surfaces.

Studio must not become a second Core, a semantic YAML parser, an entity extractor, a relationship resolver or a graph engine.

## Core Baseline

Core v0.8.1 introduced the Contract Introspection Surface:

```text
orbitfabric.export package
model_summary_to_dict(model, mission_dir)
write_model_summary(model, mission_dir, output_file)
orbitfabric export model-summary
model_summary.json
kind: orbitfabric.model_summary
summary_version: 0.1
```

This surface answers:

```text
What contract domains are present in this mission?
```

Core v0.8.2 introduced the Entity Index Surface:

```text
entity_index_to_dict(model, mission_dir)
write_entity_index(model, mission_dir, output_file)
orbitfabric export entity-index
entity_index.json
kind: orbitfabric.entity_index
index_version: 0.1
```

This surface answers:

```text
What contract entities are defined in this mission?
```

Core v0.8.2 does not introduce:

```text
relationship manifest
relationship graph
dependency graph
source line tracking
source column tracking
YAML node location tracking
YAML AST export
plugin API
plugin discovery
Studio-specific API
runtime behavior
ground behavior
new Mission Model semantics
```

## Decision

For v0.3.0, Studio consumes two fixed Core export commands:

```text
orbitfabric export model-summary <mission_dir> --json <studio_controlled_report_path>
orbitfabric export entity-index <mission_dir> --json <studio_controlled_report_path>
```

The command invocations remain allowlisted.

The frontend does not expose arbitrary CLI argument entry.

The report paths are controlled by Studio.

The UI distinguishes:

```text
source model
Core model summary
Core entity index
Core lint report
generated output
UI state
```

The Core model summary is the only source of structured domain navigation in v0.3.0.

The Core entity index is the only source of structured entity navigation in v0.3.0.

Studio must not create synthetic domains or entities when Core reports do not provide them.

Studio must not infer relationships between entities.

## Model Summary Fields

The v0.3.0 implementation baseline for domain navigation is the Core v0.8.1 model summary shape.

Studio may consume:

```text
kind
summary_version
mission
source_mission_dir
boundaries
domains
```

For each domain, Studio may consume fields exposed by Core, including:

```text
id
display_name
source_file
required
present
count
count_provenance
```

Studio must not invent additional domain fields.

## Entity Index Fields

The v0.3.0 implementation baseline for entity navigation is the Core v0.8.2 entity index shape.

Studio may consume:

```text
kind
index_version
mission
source_mission_dir
boundaries
domains
total_entity_count
entities
```

For each domain summary, Studio may consume fields exposed by Core, including:

```text
id
display_name
source_file
required
present
indexed
model_count
entity_count
```

For each entity record, Studio may consume fields exposed by Core, including:

```text
id
domain
entity_type
display_name
source_file
provenance
required_domain
present
```

Studio must not invent line, column, source span, relationship or graph metadata.

## Entity-indexed and Summarized-only Domains

Core v0.8.2 may entity-index domains such as:

```text
spacecraft
subsystems
modes
telemetry
commands
events
faults
packets
payloads
data_products
contact_profiles
link_profiles
contact_windows
downlink_flows
command_sources
commandability_rules
autonomous_actions
recovery_intents
```

Core v0.8.2 may summarize but not entity-index domains such as:

```text
mode_transitions
policies
```

Studio must display summarized-only domains as such.

Studio must not synthesize entity records for them.

## Compatibility Handling

Studio v0.3.0 supports three runtime states:

```text
Core v0.8.0 behavior:
  lint JSON available
  model-summary command unavailable
  entity-index command unavailable
  contract navigation unavailable with clear explanation

Core v0.8.1 behavior:
  model-summary command available
  entity-index command unavailable
  domain navigation enabled
  entity navigation unavailable with clear explanation

Core v0.8.2 behavior:
  model-summary command available
  entity-index command available
  domain navigation enabled
  entity navigation enabled
```

Compatibility must be based on behavior.

Version strings may be displayed, but command success, command failure and report availability are the decisive signals.

## Source File Linking Rule

A domain or entity `source_file` may become clickable only when:

```text
the Core-derived source_file field is present
the value exactly matches or safely resolves to a known source model file in the selected workspace
the resolved path remains inside the selected workspace
the file type is supported by the read-only viewer
```

Studio must not infer a file from domain name, entity id, entity type or display name.

Studio must not infer a line or column.

## Consequences

- v0.3.0 provides useful contract navigation without semantic drift.
- Core remains the only authority for contract introspection and entity indexing.
- Studio becomes a navigation surface, not a model engine.
- Core v0.8.1 enables domain navigation.
- Core v0.8.2 enables entity navigation.
- Relationship and graph views remain blocked until Core exposes a relationship surface.

## Risks

- Users may assume Studio owns the domain or entity model.
- UI grouping may look like Studio has reinterpreted the Mission Model.
- Missing entity-index support in local Core may confuse users.
- Summary-only domains may be mistaken for missing data.
- Future graph desire may tempt private relationship inference.

## Mitigations

- Label every domain surface as Core model summary derived.
- Label every entity surface as Core entity index derived.
- Show unsupported Core states explicitly.
- Show missing report states explicitly.
- Show summarized but not entity-indexed domains explicitly.
- Preserve raw stdout, stderr and exit code.
- Do not render relationships or graphs in v0.3.0.
- Do not create synthetic entities.
- Do not parse YAML semantically.

## Review Trigger

Review this ADR before introducing:

```text
relationship navigation
graph rendering
dependency visualization
source line or column navigation
YAML AST consumption
plugin-aware entity surfaces
any source model editing
any quick-fix workflow
any private semantic parser inside Studio
```
