# OrbitFabric Studio — Architecture

## 1. Architecture thesis

OrbitFabric Studio is a local-first desktop workbench that helps a human see and understand an OrbitFabric mission.

The authority boundary is strict:

```text
OrbitFabric Core owns engineering meaning.
Studio owns how that meaning is presented and explored.
```

Studio is not a second implementation of OrbitFabric Core.

## 2. Runtime data flow

The current reboot follows this path:

```text
OrbitFabric Core CLI / JSON surfaces
        |
        v
Rust / Tauri process + filesystem seam
        |
        v
TauriCoreGateway
        |
        v
MissionHydrator
        |
        v
MissionSession read model
        |
        +--> Mission Atlas
        +--> Entity Explorer
        +--> Entity X-Ray
        +--> Relationship Explorer
        `--> Context Graph -> ELK layout -> React Flow
```

Core is the source of mission semantics. Studio validates transport/protocol shape and internal referential safety, but it does not independently decide what mission data means.

## 3. Core integration contract

Mission opening is progressively hydrated.

### Primary hydration

C1 Mission Snapshot is the load-bearing surface. A successful snapshot makes the mission explorable immediately.

### Secondary hydration

Entity Index, Relationship Manifest and lint information arrive progressively. They enrich the already-loaded mission rather than blocking the first useful screen.

This preserves:

```text
loadable != lint-clean
```

A mission may be successfully loaded while still containing Core-reported warnings or diagnostics.

### Exit status and protocol

Studio does not equate process exit status with semantic result:

```text
process exit status
    != protocol validity
    != semantic result
```

For example, Core may emit valid structured lint output and still return a non-zero process status because findings exist.

## 4. Process and temporary-file boundary

Rust/Tauri owns:

- invoking the configured OrbitFabric executable;
- bounded process lifetime;
- terminating and reaping timed-out child processes;
- writing Core JSON output to Studio-owned OS temporary storage;
- cleanup of request temporary directories;
- native directory selection;
- path/process error reporting.

Current timeouts are bounded: short capability/version probes use a smaller timeout than mission operations.

Studio does not write hydration products into the user's mission workspace.

## 5. Frontend authority

React/TypeScript may:

- normalize Core output into a read model;
- group and label facts for presentation;
- maintain selection, navigation and view state;
- present relationship families by engineering intent;
- compute graph layout input from explicit Core-owned edges;
- preserve the path the user actually followed through those edges.

React/TypeScript must not:

- parse YAML to recover missing semantics;
- infer relationships from names, co-occurrence, limits or text;
- create private validation rules;
- derive mission health/readiness/completeness/coverage scores;
- treat layout as engineering meaning.

## 6. Entity identity

Entity IDs are not assumed globally unique across domains.

The universal Studio identity is:

```ts
EntityRef = { domain, id }
```

This is required for real missions such as FINCH where the same textual ID may validly identify entities in different domains.

## 7. Mission session and refresh

`MissionSession` is the non-authoritative read model for one loaded generation.

Open/Refresh are transactional and generation-scoped:

- a new generation hydrates independently;
- stale asynchronous responses are ignored;
- the previous valid session is not partially mutated by a failed refresh;
- semantic selection and Context Path are reconciled when possible.

The Context Map may recalculate and refit after refresh to keep the current semantic context readable. Pixel-perfect viewport persistence is not an architectural requirement.

## 8. Selection and Context Path

Studio has one global semantic selection across lenses. Operations also retains the last valid mode focus as presentation state so an explicit Entity X-Ray inspection does not destroy the user's operational context.

The Context Path is presentation state describing the investigation route the user actually followed through explicit Core-owned edges. It is not a shortest-path claim and is not mission semantics.

When the user follows a direct relationship, the path extends. Selecting an earlier entity already in the path truncates back to that point.

## 9. Graph architecture

Both engineering graphs use the same authority-preserving rendering pipeline:

```text
Core-owned structured facts
        |
        v
renderer-independent presentation model
        |
        v
ELK node geometry + orthogonal edge routes
        |
        v
React Flow renderer
```

`ContextGraphModel` owns presentation-level graph membership and expansion state over explicit Relationship Manifest edges. `OperationsModel` contains only explicit Mission Snapshot modes, transitions and declared mode-linked contracts. Payload lifecycle values remain effects and never become inferred mission-mode nodes.

ELK owns presentation geometry and complete orthogonal routes. React Flow renders those routes and owns interaction; it does not reinterpret edge direction. Automated geometry tests verify that cyclic graph routes remain orthogonal and do not cross unrelated nodes.

Selection and expansion are separate actions. Nodes are selectable/focusable but not freely draggable because arbitrary node placement must not imply mission meaning.

The Context Map is a local investigation surface, not a global graph dump or graph editor. The Operational State Map is a declared-contract lens, not a simulator or runtime-state display.

## 10. Active frontend tree

The active reboot source is intentionally small:

```text
src/
├── App.tsx
├── main.tsx
├── vite-env.d.ts
├── app/
│   ├── lastPathTarget.ts
│   └── studioState.ts
├── core/
│   ├── CoreGateway.ts
│   ├── TauriCoreGateway.ts
│   ├── contracts.ts
│   └── surfaceValidation.ts
├── features/
│   ├── atlas/
│   ├── explorer/
│   ├── launcher/
│   ├── operations/
│   ├── relationships/
│   ├── validation/
│   └── xray/
├── graph/
│   ├── ContextMap.tsx
│   ├── RoutedEdge.tsx
│   ├── contextGraphLayout.ts
│   ├── contextGraphModel.ts
│   ├── contextMapEvidence.ts
│   └── elkRouting.ts
├── mission/
│   ├── MissionHydrator.ts
│   ├── MissionSession.ts
│   ├── entityRef.ts
│   ├── relationshipPresentation.ts
│   ├── resolveEntityContract.ts
│   └── selection.ts
└── styles/
    ├── context-map.css
    ├── features.css
    ├── operations.css
    ├── relations.css
    ├── reset.css
    ├── responsive.css
    ├── shell.css
    └── tokens.css
```

Historical E60 cockpit/workbench source is intentionally absent from the active tree. Git history is the archive.

## 11. Tauri security boundary

The preview uses the current hardened Tauri 2.x baseline selected during release hardening.

Security properties include:

- production CSP enabled;
- separate localhost-only development CSP for Vite/HMR;
- window-scoped minimal capability;
- `core:default` plus only the native directory-open permission required by the product;
- no remote content capability;
- no browser/WebView context menu exposed to the user.

The production-path Tauri build is a permanent CI gate so configuration/CSP regressions fail before release.

## 12. Responsive architecture

The first preview is designed around three presentation tiers rather than one fixed desktop size:

```text
Wide      ~1280 px
Standard  ~960 px
Compact   ~640 px
```

The same semantic surfaces remain available. Layout adapts; mission meaning does not.

## 13. Automated acceptance

Permanent CI covers:

- blocking `npm audit`;
- pure Studio logic tests;
- TypeScript + Vite production build;
- Rust tests;
- locked Cargo check;
- Tauri production-path debug build;
- pinned OrbitFabric Core integration checks;
- an acceptance matrix including demo-3u, FINCH and SpaceLab.

Pure Studio tests protect domain-qualified identity, Validation finding links/filters, declared-only Operations joins, focus preservation, Context Path/graph behavior, ELK route geometry and refresh reconciliation. Rust tests protect Core process timeout/termination and temporary cleanup.

## 14. Deferred architecture

The first source preview intentionally does not require:

- a database;
- a server;
- a Core sidecar bundle;
- desktop signing/notarization;
- Mission Model editing;
- a plugin runtime;
- cloud accounts or collaboration;
- live telemetry or operational connectivity.

Those require separate architecture decisions if they ever become product requirements.

## 15. Non-negotiable rule

When Studio needs engineering meaning that Core does not expose, the answer is not to infer it privately.

The correct choices are:

1. improve the Core machine-readable surface; or
2. show the information as unavailable.
