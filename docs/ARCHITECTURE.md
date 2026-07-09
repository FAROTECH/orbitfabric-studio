# OrbitFabric Studio — Architecture

## 1. Architecture thesis

OrbitFabric Studio is a downstream visual engineering workbench for OrbitFabric Mission Data Contracts.

OrbitFabric Core remains authoritative for engineering meaning.

Studio is responsible for local presentation, navigation, inspection and interaction over Core-owned or Core-derived evidence.

Studio must not become a second implementation of OrbitFabric Core.

---

## 2. Core / Studio boundary

The fundamental boundary is:

```text
OrbitFabric Core
    |
    | CLI commands / JSON reports / generated artifacts
    v
Tauri backend adapter
    |
    | bounded commands / filesystem inspection / report loading
    v
React UI adapter and view models
    |
    | local presentation state
    v
Studio surfaces
```

The boundary is strict.

Studio consumes Core outputs.

Studio does not recreate Core semantics.

---

## 3. Authority model

### Core authority

OrbitFabric Core owns:

- Mission Model loading;
- schema interpretation;
- semantic validation;
- lint rules;
- scenario execution;
- scenario evidence;
- generated documentation;
- generated JSON reports;
- runtime-facing contract bindings;
- ground-facing contract artifacts;
- entity indexing;
- relationship semantics;
- coverage summaries;
- future plugin semantics.

### Studio authority

Studio owns:

- local workspace selection;
- UI layout;
- navigation state;
- read-only inspection surfaces;
- status presentation;
- file preview;
- generated artifact browsing;
- local capture utility;
- UI affordance state;
- provisional packaging/application identity.

Studio may display engineering meaning.

Studio must not invent engineering meaning.

---

## 4. Data categories

Studio must preserve this distinction everywhere:

```text
source model      = authoritative user-authored Mission Model files
derived report    = OrbitFabric Core output derived from the source model
generated output  = disposable artifact generated from the contract
UI state          = local Studio representation
```

The UI must make it clear whether a value comes from source files, Core-derived reports, generated artifacts or local UI state.

---

## 5. Runtime shape

The current application is a local-first Tauri 2 + React + TypeScript desktop workbench.

Primary runtime areas:

```text
src/
  React UI, surfaces, view models, CSS and QA support

src-tauri/
  Tauri shell, command handlers, filesystem access and Core wrappers

tools/dev/
  visual QA, audit and development utilities

docs/
  current project documentation, QA records and historical archive
```

Tauri bundling is currently inactive.

The app icon and graphical identity assets are provisional.

---

## 6. Frontend architecture

The frontend is organized around public-preview surfaces:

- Mission Cockpit;
- Core Report Runner;
- Mission Data Flow Workbench;
- Data Products;
- Scenario Evidence;
- Generated Artifacts;
- Ground Integration Artifact Viewer;
- Core-derived domain surfaces;
- reserved Autonomy surface.

Important frontend modules include:

- `src/App.tsx` — current shell orchestration and legacy diagnostic surface host;
- `src/navigationModel.ts` — navigation and surface status model;
- `src/coreReports.ts` — Core report parsing and guards;
- `src/missionContentViewModel.ts` — Mission Cockpit adapter model;
- `src/missionDataFlowWorkbenchModel.ts` — Workbench adapter model;
- `src/generatedArtifactInventoryStore.ts` — generated artifact inventory bridge;
- `src/StudioIcon.tsx` — semantic icon registry;
- `src/devSurfaceCapture.ts` — visual QA capture support.

### Current frontend debt

`src/App.tsx` is still too large and mixes multiple responsibilities.

Future refactor slices should extract:

- shell state;
- workspace state;
- inspector state;
- legacy diagnostic surfaces;
- scenario evidence panels;
- Core report panels;
- workspace file viewer logic.

Refactors must preserve visual behavior and the E28 baseline.

---

## 7. Backend architecture

The Tauri backend currently provides:

- workspace inspection;
- generated artifact inspection;
- bounded text file reading;
- generated artifact reveal in the OS file manager;
- development capture saving;
- fixed OrbitFabric Core command wrappers;
- scenario execution wrapper;
- generated report path management;
- generated artifact classification.

Important backend file:

```text
src-tauri/src/lib.rs
```

### Current backend debt

`src-tauri/src/lib.rs` is too large and mixes command handlers, filesystem helpers, Core invocation, artifact discovery and capture utilities.

Future refactor slices should split it into focused modules, for example:

```text
commands/
workspace/
core/
artifacts/
files/
capture/
platform/
```

No backend refactor should change command behavior unless explicitly scoped and tested.

---

## 8. Core invocation model

Studio invokes fixed Core commands.

Correct flow:

```text
User action
    |
Studio fixed command wrapper
    |
OrbitFabric Core CLI
    |
Core report / stdout / stderr / exit code
    |
Studio renders result
```

Studio must preserve raw evidence where useful.

Studio must fail clearly when Core is missing, unsupported or returns malformed output.

Studio must not expose a free shell.

---

## 9. Generated artifact model

Generated artifacts are read-only outputs.

Studio may:

- list them;
- classify them conservatively;
- preview supported text artifacts;
- reveal an artifact in the OS file manager;
- link generated artifacts to Core-reported evidence when such linkage is available.

Studio must not:

- mutate generated artifacts;
- treat generated artifacts as source of truth;
- infer runtime or ground behavior from generated files;
- hide unknown generated artifacts.

---

## 10. Scenario evidence model

Scenario evidence is Core-produced contract evidence.

It is not live operations.

It is not spacecraft telemetry.

It is not a private Studio simulation.

Studio may render Core simulation reports and scenario run indexes.

Studio must not infer scenario state from logs, scenario YAML or missing evidence.

---

## 11. CSS architecture

The current CSS is stable but historically layered.

The E28 visual baseline depends on an ordering-sensitive stack imported from `src/main.tsx`.

Current CSS categories include:

- base/global styles;
- cockpit visual hierarchy;
- surface-specific styles;
- desktop envelope styles;
- generated artifact styles;
- scenario styles;
- public baseline stabilization layers;
- semantic visual token layers.

### Current CSS debt

Several `publicBaseline*` files are stabilization layers, not final architecture.

Do not delete or consolidate them blindly.

Future CSS refactor must:

- document the import order;
- preserve the E28 visual baseline;
- change one layer at a time;
- use visual QA captures before and after changes;
- avoid broad selectors unless intentionally scoped.

---

## 12. Documentation architecture

Current-facing documentation should stay small and accurate.

Historical planning material is preserved under:

```text
docs/archive/
```

Active documentation should explain:

- what Studio is;
- what Studio is not;
- how it depends on Core;
- what the public-preview baseline contains;
- what remains provisional;
- how to develop and QA changes.

---

## 13. Packaging and brand boundary

Packaging is not active.

Brand assets are provisional.

Final logo, favicon, app icon and generated Tauri icon sets must be created in a dedicated brand-assets pass before packaging activation.

Packaging activation must be explicit and must not happen as a side effect of source cleanup.

---

## 14. Future architecture hardening

Recommended future sequence:

1. document CSS layer order;
2. split `App.tsx` by responsibility;
3. split Tauri backend modules;
4. reduce legacy diagnostic routing;
5. consolidate CSS only after visual regression coverage;
6. finalize brand assets;
7. activate packaging.

Each step must be narrow, reviewable and reversible.

---

## 15. Non-negotiable engineering rules

Studio must not introduce:

- private Mission Model semantics;
- private validation;
- private relationship inference;
- private data-flow inference;
- private health/readiness/completeness/coverage scoring;
- generated artifact mutation;
- operational ground behavior;
- command uplink behavior;
- live telemetry behavior;
- hidden authoring;
- silent source rewrites.

If Core does not provide the required engineering output, the correct response is to improve Core or show an explicit unavailable state.
