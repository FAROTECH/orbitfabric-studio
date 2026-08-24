# OrbitFabric Studio

**See the mission.**

OrbitFabric Studio is a local-first engineering workbench for seeing and understanding OrbitFabric missions.

> **OrbitFabric exposes the Mission Data Contract. OrbitFabric Studio exposes the mission to the human.**

Studio is not a graphical file browser, a JSON dashboard, or a GUI wrapper around Core commands. Its job is to reduce the effort required to understand a mission: what exists, how declared elements relate, and where those facts come from.

## Public Preview scope

Release identity: **OrbitFabric Studio 0.15.0 Preview 1** (`v0.15.0-preview.1`).

The rebooted Studio provides a complete mission-understanding product slice with complementary lenses:

```text
Open Mission
  -> Mission Atlas
  -> Explore / Entity X-Ray
  -> Relations / Context Path / Context Map
  -> Validation Findings / exact entity inspection
  -> Operations / Operational State Map / Mode Focus
```

Implemented preview capabilities include:

- **Open Mission** with recent-mission recall and configurable OrbitFabric Core executable;
- **Mission Atlas / Overview** with presence-driven mission structure;
- **Entity Explorer** with transversal search and domain filtering;
- **Entity X-Ray** with type-aware detail, immediate relationships and provenance;
- **Global Studio Selection** preserved across mission views;
- **Context Path** representing the relationship path actually followed by the user;
- **Relationship Explorer** grouped by engineering intent;
- **Context Map** based only on explicit Core-owned relationships, with pan/zoom, node selection, explicit expansion, progressive `Expand context`, reset and current-neighborhood emphasis;
- **Validation Findings Viewer** exposing complete Core lint findings, severity filters and exact domain-qualified entity inspection;
- **Operations Logic Lens** answering “What can happen from here?” with a Core-declared Operational State Map and Mode Focus for transitions, commands, commandability and recovery contracts;
- ELK-owned orthogonal graph routing rendered by React Flow for readable cyclic state and relationship graphs;
- progressive Entity Index / relationship / lint hydration after the mission becomes available;
- transactional Refresh with generation reconciliation and preservation of the last valid Operations focus.

The preview remains read-only with respect to Mission Model source.

## Product boundary

OrbitFabric Core owns mission semantics.

Studio consumes structured Core-owned facts and may normalize, group, label, lay out and navigate them for presentation. It must not infer or create missing mission meaning.

Studio must not:

- parse Mission Model YAML semantically as a replacement for Core;
- infer relationships from names, ID prefixes, file proximity or textual descriptions;
- turn telemetry limits into fault relationships unless Core exposes that relationship explicitly;
- parse textual preconditions into a private semantic graph;
- infer physical containment or causality that the contract does not declare;
- calculate private mission health/readiness/completeness/coverage scores;
- behave as mission control or a live telemetry/uplink system.

Correct pattern:

```text
OrbitFabric Core owns the fact.
Studio makes the fact understandable.
```

## Current Core integration

The preview consumes these machine-readable OrbitFabric Core surfaces:

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

The first public preview targets **developer/source use**. Binary packaging is intentionally a later release gate.

### Tested host baseline

The release gate is exercised on:

- Debian 12 for primary desktop acceptance;
- Ubuntu 22.04 in CI for Rust/Tauri builds;
- Node.js 22+;
- stable Rust;
- Python 3.11+ for OrbitFabric Core.

Other platforms may work, but they are not part of the first source-preview acceptance claim until explicitly tested.

### Debian / Ubuntu system dependencies

Install the Tauri 2 Linux prerequisites:

```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

Install a current stable Rust toolchain if one is not already available:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Install Node.js 22+ using your normal system/version-manager workflow, then restart the shell or load the relevant environment.

Verify prerequisites:

```bash
rustc --version
cargo --version
node --version
npm --version
python3 --version
```

### Install the validated OrbitFabric Core baseline

Studio deliberately does not embed or replace OrbitFabric Core in this source preview.

The preview CI is validated against Core commit:

```text
47d37ec2c50eae40e13303eea900eb119bd2e0dd
```

Install that baseline:

```bash
git clone https://github.com/FAROTECH/orbitfabric.git
cd orbitfabric
git checkout 47d37ec2c50eae40e13303eea900eb119bd2e0dd
python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -e .
.venv/bin/orbitfabric --version
```

Keep the resulting executable path; for example:

```text
/home/user/dev/orbitfabric/.venv/bin/orbitfabric
```

A newer Core revision may also work, but the commit above is the reproducible compatibility baseline for this preview.

### Install Studio

Clone Studio and install its locked frontend dependencies:

```bash
git clone https://github.com/FAROTECH/orbitfabric-studio.git
cd orbitfabric-studio
npm ci
```

### Verify the source tree

Run the same release-critical checks used by CI:

```bash
npm audit --audit-level=low
npm run test:logic
npm run build
cargo test --locked --manifest-path src-tauri/Cargo.toml
cargo check --locked --manifest-path src-tauri/Cargo.toml
npm run tauri -- build --debug --no-bundle
```

All commands must pass before treating the clone as a valid source-preview environment.

### Run Studio

Start the desktop app:

```bash
npm run tauri:dev
```

If `npm run tauri:dev` creates an empty window and the terminal reports `DRM_IOCTL_MODE_CREATE_DUMB failed` or `Failed to create GBM buffer`, stop the process and disable the WebKit DMA-BUF renderer:

```bash
WEBKIT_DISABLE_DMABUF_RENDERER=1 npm run tauri:dev
```

This host-specific rendering fallback does not change Studio or Core semantics.

In the pre-open launcher, set **OrbitFabric executable** to the Core executable installed above.

Then select either:

- a Mission Model directory directly; or
- a workspace root containing a conventional `mission/` child directory.

Core remains the authority on whether the selected source is a loadable mission.

## Security boundary

The source preview keeps the desktop boundary intentionally small:

- OrbitFabric Core runs as a bounded child process managed by Rust/Tauri;
- Core invocations have explicit timeouts and timed-out children are terminated and reaped;
- Studio uses a restricted, window-scoped Tauri capability plus the native directory-open dialog;
- the WebView loads no application data from remote origins;
- production and development Content Security Policies are configured separately;
- full npm dependency auditing is a blocking CI gate.

## Acceptance missions

The preview is exercised against multiple mission shapes rather than one reference topology:

- `demo-3u` — minimal/smoke;
- OrbitFabric Reference Mission — primary engineering acceptance;
- `finch-inspired-minislice` — dense imaging/payload topology and duplicate textual IDs across domains;
- `spacelab-inspired-communications-minislice` — communications-centric mission with no payload;
- `oresat-inspired-minislice` — heterogeneous topology with power/backlog pressure;
- `university-cubesat-minislice` — generic topology sanity.

A UI assumption is not considered generic merely because it works on the Reference Mission.

## Architecture

```text
OrbitFabric Core / Python
    owns semantics, validation and structured mission facts

Tauri / Rust
    owns desktop integration, filesystem/temp boundaries and Core process lifecycle

React / TypeScript
    owns interaction, presentation and non-authoritative Studio state
```

The Context Map and Operational State Map use React Flow + ELK. ELK owns presentation geometry and orthogonal routes; the semantic graph/state models remain renderer-independent and contain only Core-owned facts.

Current architectural documentation is in:

```text
docs/ARCHITECTURE.md
docs/DATA_BOUNDARIES.md
docs/adr/0001-mission-first-studio.md
```

## Current release state

The reboot is feature-frozen as a **developer/source public preview**.

The mandatory release gate is tracked in:

```text
docs/PUBLIC_PREVIEW_RELEASE_GATE.md
```

The manual responsive acceptance procedure is tracked in:

```text
docs/qa/public-preview-visual-acceptance.md
```

Desktop binary packaging is deliberately separate. Core sidecar strategy, bundle targets, signing and notarization are not part of this source-preview claim.

## Not in this preview

The later Product Contract includes capabilities intentionally not required for the first preview:

- Data Product Journey;
- Scenario Catalog;
- Scenario Replay / Evidence;
- Experiment Mode;
- Compare;
- Coverage;
- Generated Output Center;
- Mission Model editing.

The preview is intentionally small: it should already change how an engineer understands a mission before additional capability is added.
