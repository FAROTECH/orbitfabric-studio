# ADR-0010 - v0.5 Core-derived Generated Artifact Explorer

Status: Accepted for planning  
Date: 2026-05-22  
Milestone: `v0.5.0 - Generated Artifact Explorer`

---

## Context

OrbitFabric Studio v0.4.0 established a Core-derived Relationship Surface by consuming `relationship_manifest.json` produced by OrbitFabric Core.

OrbitFabric Core v1.0.0 also produces or documents several generated and exported surfaces:

- Core-owned structured reports;
- lint and simulation JSON reports;
- generated Markdown documentation;
- generated runtime-facing contract bindings;
- generated ground-facing contract artifacts;
- scenario logs.

These artifacts are useful for engineering inspection, but they are not the Mission Model source of truth.

Studio needs a read-only way to organize and inspect these artifacts without becoming a generator, validator, runtime UI, ground UI or semantic parser.

---

## Decision

Studio v0.5.0 will introduce a read-only Generated Artifact Explorer.

The explorer will inventory generated files already present in the selected workspace and classify them using conservative path, extension and known Core-documented file-name rules.

Studio may display artifact metadata and raw supported text content.

Studio must not generate artifacts.

Studio must not execute arbitrary commands.

Studio must not modify files.

Studio must not infer Mission Data Contract semantics from generated artifacts.

Studio must not parse raw YAML to explain generated artifacts.

Studio must not interpret generated code, ground dictionaries or scenario logs as runtime behavior.

OrbitFabric Core remains authoritative for generation, validation, scenario evidence and engineering meaning.

---

## Accepted Artifact Classes

The initial explorer classes are:

```text
reports
logs
docs
runtime
ground
unknown
```

The `unknown` class is intentional.

It preserves visibility without inventing meaning.

A file under `generated/` that does not match a conservative known rule should remain visible as unknown rather than being hidden or semantically interpreted.

---

## Provenance Rule

Studio may show provenance only when it is based on one of these sources:

- documented Core default output paths;
- documented Core file names;
- explicit manifest fields already present in a generated artifact;
- already loaded Core-owned structured surfaces.

Studio must not create provenance from naming heuristics that imply mission semantics.

---

## Preview Rule

Supported text artifacts may be opened through the existing read-only viewer.

Unsupported, binary or oversized files should be listed but not previewed.

Previewing a generated file is not equivalent to validating it.

Previewing a generated file is not equivalent to accepting it as source.

---

## Security and Boundary Rule

The backend may inspect only files inside the selected workspace.

Recursive inspection must be bounded.

The explorer must not introduce a Tauri shell plugin.

The explorer must not expose arbitrary CLI argument entry.

The explorer must not introduce a generic file manager.

---

## Consequences

Positive consequences:

- generated artifacts become inspectable without terminal-only navigation;
- source, derived and generated boundaries become clearer;
- unknown generated files remain visible without semantic drift;
- future scenario evidence and ground artifact viewers get a safer foundation.

Tradeoffs:

- v0.5.0 will not generate missing artifacts;
- v0.5.0 will not prove artifact freshness beyond conservative metadata;
- v0.5.0 will not interpret generated runtime or ground artifacts semantically unless Core provides explicit structured metadata;
- v0.5.0 will likely need follow-up Core manifest support if stronger provenance is required later.

---

## Non-goals

This ADR does not authorize:

```text
artifact generation
file editing
Mission Model editing
arbitrary command execution
scenario execution
runtime execution
build-system integration
flight software behavior
ground software behavior
mission-control UI
live telemetry
command uplink
private YAML semantic parsing
private Mission Model validation
private artifact semantics
relationship graph
dependency graph
plugin execution
plugin discovery
```

---

## Follow-up PR Structure

The intended implementation sequence is:

```text
PR 0: v0.5.0 docs and planning baseline
PR 1: generated artifact inventory TypeScript model
PR 2: controlled backend generated-directory inspection
PR 3: Generated Artifact Explorer UI
PR 4: conservative known artifact classification
PR 5: artifact detail panel and safe raw preview
PR 6: release hardening v0.5.0
```

Each PR must preserve the v0.5.0 non-goals.
