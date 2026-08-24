# OrbitFabric Studio — Public Preview Release Gate

**Status:** merged candidate — owner-controlled publication steps pending  
**Target:** OrbitFabric Studio 0.15.0 Preview 1 — first public developer/source preview of the rebooted Studio  
**Scope freeze:** Validation and Operations are accepted; no new product features until this gate closes

## Release thesis

The first public preview must deliver one complete and differentiated engineering journey:

```text
Open Mission
  -> Mission Atlas
  -> Explore / Entity X-Ray
  -> Relations / Context Path / Context Map
  -> Validation Findings / exact entity inspection
  -> Operations / Operational State Map / Mode Focus
```

The preview is publishable when an engineer who did not participate in development can install/run it, open a compatible OrbitFabric mission, understand the mission without reading YAML first, and trust that Studio is rendering Core-owned facts rather than inventing semantics.

## Scope boundary

Included:

- Open Mission + Recent Missions;
- Core runtime selection;
- progressive Core hydration;
- Mission Atlas / Overview;
- Entity Explorer with domain filtering;
- type-aware Entity X-Ray;
- source/provenance visibility;
- immediate relationship traversal;
- Global Studio Selection;
- Context Path;
- Relationship Explorer;
- React Flow + ELK Context Map with pan/zoom, selection, explicit expansion and reset;
- Validation Findings Viewer with complete Core lint fields, severity filters and exact entity inspection;
- Operations Logic Lens with a Core-declared Operational State Map and Mode Focus;
- ELK-owned orthogonal routing for Context and Operational maps;
- transactional refresh with valid selection, Context Path and Operations focus reconciliation.

Explicitly deferred:

- Data Product Journey;
- Scenario Catalog;
- Replay / Evidence;
- Experiment / Compare;
- Coverage surface;
- Generated Output Center;
- Mission Model editing;
- live telemetry/uplink/mission-control behavior.

## Gate A — Product acceptance

- [x] Reference Mission: Atlas / Explore / X-Ray / relationship traversal / Context Map manually accepted.
- [x] FINCH-inspired minislice: dense Atlas accepted.
- [x] FINCH-inspired minislice: same textual ID in different domains correctly distinguished with `{domain,id}` identity.
- [x] FINCH-inspired minislice: high-degree Payload X-Ray and Context Map accepted.
- [x] Context Map: selection and explicit expansion are separate interactions.
- [x] Context Map: wheel zoom, background pan and browser/WebView context-menu suppression accepted.
- [x] Context Map: Expand context, reset, semantic tones and current-edge emphasis accepted.
- [x] SpaceLab-inspired communications minislice: no-payload Overview, Operations, Explore/X-Ray and Relations runtime/manual acceptance.
- [x] demo-3u: final smoke plus Operations commandability/recovery acceptance.
- [x] OreSat-inspired minislice: validation, exact entity inspection, Operations and dense Relations acceptance.
- [x] Validation Findings: severity filters, Escape/close, exact Entity X-Ray navigation and 1280 / 960 / 640 responsive acceptance.
- [x] Operations: Core-declared state/transition counts, Mode Focus, commands, commandability, recovery contracts and raw effects accepted.
- [x] Operations: last Mode Focus preserved through explicit Entity X-Ray inspection.
- [x] Context/Operational maps: ELK orthogonal routing, Expand/Reset and dense cyclic topology accepted.
- [x] Wide / Standard / Compact manual visual pass at 1280 / 960 / 640 px on the real Tauri application.

## Gate B — Core integration hardening

- [x] C1 Mission Snapshot is on OrbitFabric Core main.
- [x] C4 minimum explicit FDIR relationship extension is on OrbitFabric Core main.
- [x] Studio writes hydration reports only to Studio-owned temporary storage.
- [x] Open/Refresh are generation-scoped and transactional.
- [x] Relationship endpoints are checked against the Entity Index.
- [x] Non-zero Core exit status is not automatically treated as semantic failure.
- [x] Core child process has bounded timeouts.
- [x] Timed-out Core child is terminated and reaped.
- [x] Timeout behavior is covered by automated Rust tests.
- [x] Temporary request cleanup is verified directly in Rust and on primary-open failure paths.

## Gate C — Automated acceptance

- [x] TypeScript + Vite build in CI.
- [x] Rust tests and locked check in CI.
- [x] Tauri production-path debug build in CI with configured CSP and no bundle.
- [x] Full npm dependency audit is a blocking CI gate.
- [x] Pinned OrbitFabric Core C1/C4 integration assertions run in CI.
- [x] Core acceptance matrix covers demo-3u + FINCH + SpaceLab automatically.
- [x] SpaceLab assertion verifies `payloads: []` is normal mission content.
- [x] FINCH assertion verifies same textual ID in multiple domains remains valid input.
- [x] Pure Studio tests cover domain-qualified identity, Context Path/graph behavior and refresh reconciliation.
- [x] Validation tests cover exact domain-qualified finding links and stable severity filtering.
- [x] Operations tests cover declared-only state/focus joins and payload-lifecycle separation.
- [x] Graph-layout tests verify complete orthogonal ELK routes do not cross unrelated nodes.
- [x] Repeatable visual acceptance baseline defined in `docs/qa/public-preview-visual-acceptance.md`.
- [x] Clean-clone evidence CI #177 passed on commit `be70421`.
- [x] Final pre-merge CI #178 passed on branch head `1e6100a`.

## Gate D — Release hygiene

- [x] README describes the rebooted mission-understanding Studio.
- [x] PR #318 description reflects React Flow + ELK and current release state.
- [x] Unused Monaco and `html-to-image` dependencies removed.
- [x] Full npm audit clean and permanently blocking in CI.
- [x] Direct graph dependency licenses recorded in `THIRD_PARTY_NOTICES.md`.
- [x] Tauri moved from original 2.0.0 baseline to the hardened current 2.x preview baseline.
- [x] Production CSP and localhost-only development CSP enabled and production-path build verified.
- [x] Tauri capability is window-scoped and minimal.
- [x] Unreachable E60 runtime source removed from the active `src/` tree and validated with frontend/Rust/Tauri builds.
- [x] Broken E60 QA scripts and obsolete current-facing cockpit/workbench documentation removed from the active public-source narrative.
- [x] Current Charter, Vision, Architecture, UX, boundaries and roadmap are mission-first.
- [x] Version/release naming chosen: **OrbitFabric Studio 0.15.0 Preview 1** / `v0.15.0-preview.1`.
- [x] PR #318 merged into `main` with merge commit `5bfbd79`.
- [x] Public clone instructions cleaned of release-candidate branch and private-repository authentication steps.

## Gate E — Distribution

The first target is a **developer/source public preview**. Binary packaging is outside this gate.

For the source preview:

- [x] Supported/tested Linux host prerequisites documented in README.
- [x] OrbitFabric Core runtime selection documented.
- [x] Linux development/run path documented.
- [x] One clean-clone installation run completed from README only on Debian 12; evidence is recorded in `docs/qa/public-preview-clean-clone-acceptance.md`.
- [x] Feature branch merged into the default branch through PR #318.
- [ ] Repository owner changes GitHub visibility from private to public before publication.
- [ ] Tag `v0.15.0-preview.1` and a GitHub prerelease are published from the final merged commit.

Deferred desktop packaging decisions include:

- Core sidecar strategy;
- bundle targets;
- signing/notarization;
- final release artifacts.

## Release decision

The preview can be published when all mandatory developer/source items above are closed and CI is green on the release candidate.

No Data Journey/Replay work is required to close this gate. Operations is implemented and accepted as part of the frozen preview scope.

> **Release the smallest complete product that already changes how an engineer understands a mission.**
