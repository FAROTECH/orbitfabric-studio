# OrbitFabric Studio

Local-first visual engineering workbench for OrbitFabric Mission Data Contracts.

OrbitFabric Studio exists to make mission contracts inspectable, navigable and reviewable without replacing OrbitFabric Core or redefining mission semantics.

Studio is not where mission semantics are created.

Studio is where mission semantics become inspectable.

---

## Current baseline

```text
Project state: post-E34 cleanup / public-preview hardening
Package version: 0.14.0
Visual baseline: studio-visual-baseline-e28
Packaging: inactive
Brand assets: provisional
```

The current baseline is a stabilized public-preview workbench. The repository has completed the E28 visual closure gate, the E29 generated-artifact action contract, the E30 label-overflow decision, the E31 application identity audit and the E32-E34 documentation cleanup/archive sequence.

The active work is now publication hardening:

- simplify current-facing documentation;
- preserve historical material under `docs/archive/`;
- keep the E28 visual baseline stable;
- prepare source architecture refactor slices;
- defer final logo/app-icon work until the documentation reset is complete;
- defer packaging activation until brand assets and bundle policy are explicit.

---

## Product boundary

OrbitFabric Core remains authoritative for:

- Mission Model loading;
- validation and linting;
- scenario execution and scenario evidence;
- generated reports;
- generated artifacts;
- entity indexing;
- relationship semantics;
- coverage summaries;
- future plugin semantics.

OrbitFabric Studio consumes and renders Core outputs.

Studio must not:

- parse Mission Model YAML semantically as a replacement for Core;
- invent missing relationships;
- infer private data-flow links;
- calculate private health, readiness, completeness or coverage scores;
- mutate generated artifacts;
- behave like a ground segment;
- expose live telemetry or command uplink behavior;
- hide Core diagnostics behind private UI conclusions.

Correct pattern:

```text
OrbitFabric Core emits a structured output.
Studio consumes and renders it.
```

Incorrect pattern:

```text
Studio reimplements Core semantics because the required output is missing.
```

If Core does not report a value, Studio displays `unavailable`, `not reported`, `reserved` or `diagnostic` instead of inventing meaning.

---

## Implemented public-preview capabilities

Studio currently provides:

- local workspace opening;
- structural workspace inspection;
- read-only source and generated-artifact preview;
- fixed OrbitFabric Core command wrappers;
- Core report rendering for lint, model summary, entity index, relationship manifest, dashboard summary, scenario run index and coverage summary;
- Scenario Evidence inspection;
- Generated Artifacts inspection and real file-manager reveal action;
- Mission Cockpit surface;
- Mission Data Flow Workbench surface;
- domain navigation for Core-derived mission areas;
- reserved Autonomy handling;
- contextual Inspector;
- shell status bar;
- surface capture utility;
- Studio icon registry;
- visual QA and audit scripts.

Studio remains local-first and read-only for the current public-preview baseline.

---

## Repository structure

```text
.
├── README.md
├── ROADMAP.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATA_BOUNDARIES.md
│   ├── qa/
│   ├── roadmap/
│   └── archive/
├── src/
├── src-tauri/
├── tools/dev/
├── package.json
└── vite.config.ts
```

Historical release checklists, release notes, milestone plans and old development notes are preserved under `docs/archive/`.

Current-facing documentation should stay small and aligned with the public-preview baseline.

---

## Development checks

Recommended local checks:

```bash
npm run build
git diff --check
npm run qa:icon-audit
npm run qa:studio-visual-token-contract
cargo check --manifest-path src-tauri/Cargo.toml
```

For Rust formatting:

```bash
cd src-tauri
cargo fmt --check
```

---

## Packaging and brand status

Tauri bundling is intentionally inactive.

The current icon and graphical assets are provisional. Final logo, favicon, app icon and generated Tauri icon assets will be handled in a dedicated brand-assets pass before packaging activation.

Packaging activation must be a dedicated PR with explicit decisions on:

- final icon master;
- bundle targets;
- artifact naming;
- signing expectations;
- macOS notarization expectations;
- versioning policy;
- release channel.

---

## Current roadmap

The immediate roadmap is publication hardening:

1. documentation rewrite;
2. source architecture refactor plan;
3. source architecture refactor slices;
4. brand assets / logo / app icon;
5. packaging activation.

Longer-term product milestones remain possible only if they preserve the Core/Studio boundary.
