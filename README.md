# OrbitFabric Studio

**See the mission.**

OrbitFabric Studio is a local-first visual engineering workbench for OrbitFabric Mission Data Contracts.

OrbitFabric Core exposes the Mission Data Contract. OrbitFabric Studio exposes the mission to the human engineer.

Studio is not a graphical file browser, a JSON dashboard, or a GUI wrapper around Core commands. Its job is to reduce the effort required to understand a mission: what exists, how declared elements relate, and where those facts come from.

## Public Preview scope

The rebooted Studio currently provides one complete mission-understanding journey:

```text
Open Mission
  → Mission Atlas
  → Entity Explorer
  → Entity X-Ray
  → explicit relationship traversal
  → Relationship Explorer
  → Context Map
```

Implemented preview capabilities include:

- **Open Mission** with recent-mission recall and configurable OrbitFabric Core executable;
- **Mission Atlas / Overview** with presence-driven mission structure;
- **Entity Explorer** with transversal search and domain filtering;
- **Entity X-Ray** with type-aware contract detail, immediate relationships and provenance;
- **Global Studio Selection** preserved across mission views;
- **Context Path** representing the relationship path actually followed by the user;
- **Relationship Explorer** grouped by engineering intent;
- **Context Map** based only on explicit Core-owned relationships, with pan/zoom, node selection, per-node expansion, progressive `Expand context`, reset, semantic pastel tones and current-neighborhood emphasis;
- progressive lint / relationship hydration after the Mission Model becomes available;
- transactional Refresh that keeps the previous valid mission generation if reloading fails.

The preview remains read-only with respect to the Mission Model.

## Product boundary

OrbitFabric Core owns mission semantics.

Studio consumes structured Core-owned facts and may recombine them for presentation, but it must not infer or create mission meaning.

Studio must not:

- parse Mission Model YAML semantically as a replacement for Core;
- infer relationships from names, ID prefixes, file proximity or textual descriptions;
- turn telemetry limits into fault relationships unless Core exposes that relationship explicitly;
- parse textual preconditions into a private semantic graph;
- infer physical spacecraft containment that the contract does not declare;
- infer causality from co-occurrence;
- calculate private mission health/readiness/completeness scores;
- behave as mission control or a live telemetry/uplink system.

Correct pattern:

```text
OrbitFabric Core owns the fact.
Studio makes the fact understandable.
```

## Current Core integration

The preview consumes these structured OrbitFabric Core surfaces:

- Mission Snapshot (C1);
- Entity Index;
- Relationship Manifest, including the explicit FDIR extension (C4 minimum);
- lint JSON.

Studio writes temporary hydration reports only to Studio-owned OS temporary storage; opening a mission does not write generated reports into the user's mission repository.

Entity identity in Studio is domain-qualified:

```text
{ domain, id }
```

This is required because the same textual ID may legitimately exist in different Mission Model domains.

## Run from source

### Prerequisites

- Node.js 22+
- npm
- Rust toolchain suitable for Tauri 2
- Tauri Linux development dependencies when running on Linux
- a compatible OrbitFabric Core checkout / executable

Install frontend dependencies:

```bash
npm ci
```

Check the project:

```bash
npm run build
cargo test --locked --manifest-path src-tauri/Cargo.toml
cargo check --locked --manifest-path src-tauri/Cargo.toml
```

Run the desktop app:

```bash
npm run tauri:dev
```

On Linux/WebKit systems where DMA-BUF causes rendering problems, use:

```bash
WEBKIT_DISABLE_DMABUF_RENDERER=1 npm run tauri:dev
```

In the pre-open launcher, set **OrbitFabric executable** to the Core executable you want Studio to use. A common editable-development setup is:

```text
/path/to/orbitfabric/.venv/bin/orbitfabric
```

Then select either a Mission Model directory directly or a workspace root containing a conventional `mission/` child directory.

Core remains the authority on whether the selected source is a loadable mission.

## Acceptance missions

The preview is exercised against multiple mission shapes rather than one reference topology:

- `demo-3u` — minimal/smoke;
- OrbitFabric Reference Mission — primary engineering acceptance;
- `finch-inspired-minislice` — dense imaging/payload/readiness topology;
- `spacelab-inspired-communications-minislice` — communications-centric mission with no payload;
- `oresat-inspired-minislice` — heterogeneous topology with power/backlog pressure;
- `university-cubesat-minislice` — generic topology sanity.

A UI assumption is not considered generic merely because it works on the Reference Mission.

## Architecture

```text
OrbitFabric Core / Python
    owns semantics, validation and structured mission facts

Tauri / Rust
    owns desktop integration, filesystem boundaries and Core process lifecycle

React / TypeScript
    owns interaction, presentation and Studio-owned navigation state
```

The current Context Map renderer uses React Flow + ELK, but the semantic graph model is renderer-independent.

## Current release state

The reboot is being prepared as a **developer/source public preview**.

The mandatory release gate is tracked in:

```text
docs/PUBLIC_PREVIEW_RELEASE_GATE.md
```

Desktop binary packaging is deliberately separate for now. Tauri bundling remains inactive until the Core sidecar/runtime strategy, bundle targets and signing policy are explicitly decided.

## Not in this preview

The Product Contract includes later capabilities that are intentionally not required for this first preview:

- Operations Logic Lens / Operational State Map;
- Data Product Journey;
- Scenario Catalog;
- Scenario Replay / Evidence;
- Experiment Mode;
- Compare;
- Coverage;
- Generated Output Center;
- Mission Model editing.

The preview is intentionally small: it should already change how an engineer understands a mission before additional capability is added.
