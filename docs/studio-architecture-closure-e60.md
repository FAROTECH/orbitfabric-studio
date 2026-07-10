# Studio Architecture Closure — E60

## 1. Purpose

E60 closes the Studio structural hardening and `App.tsx` decomposition sequence completed through E59. This checkpoint closes a refactoring campaign; it does not declare OrbitFabric Studio feature-complete. It establishes the architecture baseline for subsequent product work.

## 2. Governing baseline

- Baseline branch: `main`.
- E59 merge commit: `a0f54df279d54f7ed99f140e382f2a9813d9286d`.
- The E28 visual baseline remains governing.
- Studio remains read-only and downstream of OrbitFabric Core.

No tag is claimed by this checkpoint.

## 3. Closure summary

| Gate or group | Purpose | Resulting boundary or outcome |
| --- | --- | --- |
| E45-E48 stale-code cleanup | Remove stale, unreachable, and legacy Studio code paths before further extraction. | Reduced `App.tsx` and surface area without changing UI, routing, or runtime behavior. |
| E49 cleanup checkpoint | Record the stale-code cleanup state after E45-E48. | Documented the cleanup baseline used by the next decomposition gates. |
| E50 Core report snapshot helpers | Separate Core report snapshot shape and simulation-report upsert behavior. | `coreReportSnapshots.ts` owns empty snapshot construction and simulation report replacement by scenario. |
| E51 Studio surface configuration | Move surface routing configuration and preview placeholder copy out of `App.tsx`. | `studioSurfaceConfig.ts` owns domain surface component mapping, default navigation IDs, public-preview navigation gating, and placeholder copy. |
| E52 formatters | Extract shared Studio formatting helpers. | `studioFormatters.ts` owns navigation labels, unknown-block formatting, and dashboard status labels. |
| E53 surface availability | Extract surface availability calculation. | `surfaceAvailability.ts` owns availability flags derived from workspace presence and available source model files. |
| E54 checkpoint | Record the App refactor state after E50-E53. | Documented the post-helper-extraction architecture baseline before command and selection extraction. |
| E55 audit | Audit the Core command handler seam before moving it. | Documented command names, payloads, preconditions, errors, result handling, generated-artifact refresh behavior, and report snapshot updates. |
| E56 report snapshot updater | Extract report parsing and snapshot merge behavior from Core command execution. | `coreReportSnapshotUpdate.ts` owns parser fan-out and preservation of prior snapshot values when new command output lacks a report type. |
| E57 Core command hook | Move Core command orchestration out of `App.tsx`. | `useCoreCommands` owns Core executable state, execution state, command results, errors, snapshots, preconditions, payloads, Tauri invocation, handlers, reset, and hydration. |
| E58 Studio selection hook | Move Studio selection state and selection transitions out of `App.tsx`. | `useStudioSelection` owns file, artifact, simulation, Core entity, and Inspector detail selections plus source-file reads and clearing rules. |
| E59 active surface router | Move active-surface rendering and report fallback assembly out of `App.tsx`. | `StudioActiveSurface` owns stateless active-surface routing, no-workspace overview rendering, report parsing and fallback resolution, simulation report precedence, Mission Data Flow Workbench snapshot construction, and props wiring to active surfaces. |

## 4. Final App.tsx responsibility

`src/App.tsx` now owns:

- top-level workspace state;
- generated-artifact summary and refresh state;
- active surface and active navigation state;
- sidebar collapsed state;
- workspace opening error and loading state;
- composition of `useStudioSelection`;
- composition of `useCoreCommands`;
- workspace opening and generated report hydration;
- navigation transitions;
- scroll lifecycle;
- application shell;
- `WorkspaceHeader`;
- `PrimarySidebar`;
- `InspectorPanel`;
- `ShellStatusBar`;
- explicit wiring of `StudioActiveSurface`.

These responsibilities are appropriate for the application composition root.

## 5. Extracted architectural seams

### `useCoreCommands`

`useCoreCommands` owns:

- Core executable configuration;
- Core execution state;
- command results and errors;
- Core report snapshots;
- command preconditions and payloads;
- Core Tauri command invocation;
- command handlers;
- reset and hydration API.

Application UI side effects are supplied through explicit callbacks.

### `useStudioSelection`

`useStudioSelection` owns:

- selected file;
- generated artifact selection;
- simulation record selection;
- Core entity selection;
- Inspector detail selection;
- selection clearing rules;
- source-file reading.

Workspace ownership and navigation remain outside the hook.

### `StudioActiveSurface`

`StudioActiveSurface` owns:

- stateless active-surface routing;
- no-workspace overview rendering;
- surface-specific report parsing and fallback resolution;
- simulation report precedence;
- Mission Data Flow Workbench snapshot construction;
- props wiring to active surfaces.

It owns no React state, Tauri invocation, dialog access, navigation state, or workspace lifecycle.

### Pure helper seams

- `coreReportSnapshots.ts` defines the Core report snapshot container, empty snapshot construction, and simulation report upsert behavior.
- `coreReportSnapshotUpdate.ts` creates functional snapshot updaters by parsing supported Core report content and preserving previous snapshot values when a report type is absent.
- `studioSurfaceConfig.ts` centralizes model-inventory surface component mapping, default navigation IDs, public-preview model navigation IDs, and public-preview placeholder copy.
- `studioFormatters.ts` contains pure label and value formatting helpers used by Studio shell and Inspector presentation.
- `surfaceAvailability.ts` derives active-surface availability from the current workspace state.

## 6. Dependency direction

```text
App.tsx
├── useCoreCommands
├── useStudioSelection
├── StudioActiveSurface
├── shell components
└── workspace lifecycle

StudioActiveSurface
├── active surface components
├── pure report parsers
├── Core report snapshots
├── surface configuration
└── pure presentation models
```

Hooks do not import application surface components. `StudioActiveSurface` does not own application state. Studio does not become authoritative over Core data. No circular dependency is intended.

## 7. Preserved invariants

- E28 visual baseline remains governing.
- UI and layout unchanged by E45-E59 structural work.
- Routing behavior preserved.
- Navigation behavior preserved.
- Inspector behavior preserved.
- Core command names, payloads, preconditions, and errors preserved.
- Report parsing order and precedence preserved.
- Simulation report precedence and source labels preserved.
- Generated-artifact behavior preserved.
- Workspace opening and hydration behavior preserved.
- Core/model-data semantics preserved.
- Studio remains read-only and downstream of Core.
- No React Flow introduced.
- No new routing dependency introduced.
- No package or lockfile changes in E60.
- No CSS changes in E60.
- No Tauri/Rust changes in E60.

## 8. Explicit closure decision

No further extraction from `App.tsx` is currently justified. Navigation, workspace lifecycle, shell rendering, and class derivation should remain in `App.tsx` unless future product requirements create a concrete reusable seam. Further decomposition performed solely to reduce line count would be architectural fragmentation. E59 is the final code-refactoring gate of this sequence. E60 is the closure checkpoint.

## 9. Rules for future changes

Future changes must:

- be driven by functional or measurable maintenance requirements;
- preserve E28 unless a dedicated visual gate supersedes it;
- keep Core authoritative;
- avoid reintroducing command orchestration into `App.tsx`;
- avoid reintroducing selection state into `App.tsx`;
- avoid moving application state into `StudioActiveSurface`;
- avoid generic route frameworks without a demonstrated requirement;
- keep PR scope explicit and reviewable;
- use `git --no-pager diff` in local review gates;
- avoid committing screenshots or local capture artifacts.

## 10. Recommended next phase

Subsequent work should return to product and roadmap priorities rather than further structural extraction. The next dedicated planning activity should:

- reassess the current Studio roadmap against the two north-star references;
- identify the next user-visible capability;
- distinguish product gaps from architecture gaps;
- define broader but coherent implementation PRs where justified;
- evaluate React Flow or other libraries only against a concrete functional requirement, not as a refactoring objective.

## 11. Validation record

E60 requires:

```bash
npm run build
git diff --check
```

E60 also requires verification that the changed-file list contains exactly:

```text
docs/studio-architecture-closure-e60.md
```
