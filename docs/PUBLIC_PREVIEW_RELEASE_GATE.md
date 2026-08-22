# OrbitFabric Studio — Public Preview Release Gate

**Status:** active release gate  
**Target:** first public developer/source preview of the rebooted Studio  
**Scope freeze:** no new product features until this gate closes

## Release thesis

The first public preview does not need to implement the full Product Contract.
It must already deliver one complete and differentiated engineering journey:

```text
Open Mission
  → Mission Atlas
  → Entity Explorer
  → Entity X-Ray
  → explicit relationship traversal
  → Relationship Explorer
  → Context Map
```

The preview is publishable when an engineer who did not participate in development can install/run it, open a compatible OrbitFabric mission, understand the mission without reading YAML first, and trust that Studio is rendering Core-owned facts rather than inventing semantics.

## Scope boundary

Included in this preview:

- Open Mission + Recent Missions;
- Core runtime selection and compatibility surface;
- progressive Core hydration;
- Mission Atlas / Overview;
- Entity Explorer with domain filtering;
- type-aware Entity X-Ray;
- source/provenance visibility;
- immediate relationship traversal;
- Global Studio Selection;
- Context Path;
- Relationship Explorer;
- Context Map with pan/zoom, explicit selection, per-node expansion, `Expand context`, reset and local-current emphasis;
- contextual lint status;
- transactional refresh.

Explicitly deferred:

- Operations Logic Lens / Operational State Map;
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
- [x] Context Map: node selection and explicit `+` expansion are separate interactions.
- [x] Context Map: wheel zoom, background pan and browser/WebView context-menu suppression accepted.
- [x] Context Map: `Expand context`, reset, semantic pastel tones and current-edge emphasis accepted.
- [ ] SpaceLab-inspired communications minislice: no-payload runtime/manual acceptance.
- [ ] demo-3u: final smoke acceptance on release candidate.
- [ ] OreSat-inspired minislice: final heterogeneous/power-backlog smoke.

## Gate B — Core integration hardening

- [x] C1 Mission Snapshot is on OrbitFabric Core main.
- [x] C4 minimum explicit FDIR relationship extension is on OrbitFabric Core main.
- [x] Studio writes hydration reports only to Studio-owned temporary storage.
- [x] Open/Refresh are generation-scoped and transactional.
- [x] Relationship endpoints are checked against the Entity Index.
- [x] Non-zero Core exit status is not automatically treated as semantic failure.
- [x] Core child process has a bounded timeout (10 s version probe, 60 s mission operations).
- [x] Timed-out Core child is terminated and reaped.
- [x] Timeout behavior is covered by automated Rust tests.
- [x] Temporary request cleanup is verified directly in Rust and on primary-open failure paths.

## Gate C — Automated acceptance

- [x] TypeScript + Vite build in CI.
- [x] Rust compile check in CI.
- [x] Rust tests run in CI.
- [x] Pinned OrbitFabric Core C1/C4 integration assertions run in CI.
- [x] Core acceptance matrix covers demo-3u + FINCH + SpaceLab automatically.
- [x] SpaceLab assertion verifies that `payloads: []` is accepted as normal mission content.
- [x] FINCH assertion verifies same textual ID in multiple domains remains valid input.
- [x] Pure Studio tests cover domain-qualified EntityRef identity, Context Path/graph expansion separation and refresh reconciliation.
- [ ] Visual acceptance baseline exists for Overview / Explore+X-Ray / Context Map at representative viewport sizes.

## Gate D — Release hygiene

- [x] README describes the rebooted Studio rather than the historical E28/E34 product.
- [x] PR #318 description reflects the current React Flow + ELK Context Map and current release state.
- [x] Unused Monaco and `html-to-image` dependencies have been removed from the reboot dependency set.
- [x] npm audit findings were classified and fixed without `--force`; the audited dependency maintenance commit required a clean `npm audit --audit-level=low` before being pushed.
- [x] Direct graph dependency licenses are recorded in `THIRD_PARTY_NOTICES.md`; exact pinned ELK 0.11.1 is EPL-2.0. Binary redistribution obligations remain part of the later packaging gate.
- [ ] CSP / Tauri security configuration is reviewed for preview distribution.
- [ ] version/release naming is chosen.

## Gate E — Distribution

The first target is a **developer/source public preview**. Binary packaging is explicitly outside this first gate.

For the source preview:

- [ ] supported host prerequisites are documented precisely enough for a clean machine;
- [x] OrbitFabric Core runtime selection is documented;
- [x] Linux development/run path is documented;
- [ ] one clean-clone installation run is completed from README only.

Desktop binary packaging is deliberately a later gate:

- Tauri bundling is currently inactive;
- Core sidecar strategy is not yet frozen;
- signing/notarization policy is not yet frozen.

## Release decision

The preview can be published when all mandatory items in Gates A–E for the developer/source preview are closed and CI is green on the release candidate.

No Operations/Data Journey/Replay work is required to close this gate.

> **Release the smallest complete product that already changes how an engineer understands a mission.**
