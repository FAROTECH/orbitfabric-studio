# Contributing to OrbitFabric Studio

Thank you for your interest in improving OrbitFabric Studio.

OrbitFabric Studio is a local-first desktop engineering workbench for seeing and understanding OrbitFabric missions. The current public baseline is a developer/source preview, and `main` may also contain explicitly documented post-preview development. Contributions are welcome when they improve mission understanding, product clarity, integration continuity, reliability or security while preserving Studio's architectural boundaries.

## Architectural authority

The non-negotiable rule is:

```text
OrbitFabric Core owns engineering meaning.
Studio owns how that meaning is presented and explored.
```

Contributions must preserve these rules:

1. Do not semantically parse Mission Model YAML in Studio as a replacement for Core.
2. Do not infer relationships, causality, containment, readiness, health or coverage from names, file layout, textual descriptions or co-occurrence.
3. Preserve domain-qualified entity identity as `{ domain, id }` across selection, lookup and navigation.
4. Keep process exit status, protocol validity and semantic result distinct.
5. Keep Core hydration output in Studio-owned temporary storage; opening or refreshing a mission must not rewrite the mission workspace.
6. Treat graph geometry, grouping, labels and navigation state as presentation state, not mission semantics.
7. Preserve the current read-only boundary with respect to Mission Model source unless a separate architecture decision explicitly changes it.
8. Do not introduce hidden remote services, analytics, uploads or cloud copies of mission data through an unrelated feature.

When Studio needs engineering meaning that Core does not expose, improve the Core machine-readable surface or show the information as unavailable. Do not reconstruct the missing meaning privately in Studio.

See:

- `docs/ARCHITECTURE.md`
- `docs/DATA_BOUNDARIES.md`
- `docs/adr/0001-mission-first-studio.md`

## Integration and plugin boundary

Studio now has a generic integration substrate and a constrained Integration Plugin API candidate. Integration-related contributions must preserve:

```text
Integration Package != Studio Integration Plugin
```

The Integration Package owns projection semantics, target validation, artifact generation and target identities. A Studio Integration Plugin consumes explicit public integration records to improve target-aware presentation; it does not define a second integration model.

Current plugin rules include:

- generic Studio integration presentation must remain useful with zero plugins;
- target-aware presentation must derive from explicit Integration Result mappings rather than inferred target semantics;
- `mapping.sources[]` cardinality must be preserved rather than inventing a primary source;
- privileged plugin actions must cross Studio-owned validation gates;
- plugin failures must degrade only the contribution, not invalidate the Integration Result;
- no arbitrary filesystem, process, shell, Tauri, reducer or local-storage access is part of the public plugin API;
- no external plugin discovery or dynamic loader is implied by the current bundled proof.

Changes to Integration Package or adapter projection semantics belong in the corresponding integration package, not in Studio Core.

See:

- `docs/INTEGRATION_PLUGIN_API_V0.md`
- `docs/adr/0002-integration-plugin-api-before-external-plugin-execution.md`

## Useful contribution areas

Useful contributions include:

- mission-understanding UX and accessibility;
- Mission Atlas, Explore, Entity X-Ray, Relations, Validation and Operations improvements;
- renderer-independent graph behavior and presentation layout;
- Core gateway, hydration and protocol robustness;
- Tauri process, temporary-file and filesystem boundary hardening;
- generic Integrations workspace improvements;
- constrained Integration Plugin API improvements supported by a concrete use case;
- capture/export behavior that remains presentation-only;
- tests, CI, documentation and reproducible QA procedures.

Feature requests that require new Mission Data Contract semantics should normally start in OrbitFabric Core. Target-specific projection or generation behavior should normally start in the relevant Integration Package or adapter.

## Clean-room requirement

Do not contribute:

- proprietary mission data;
- private spacecraft architecture details;
- private packet or protocol definitions;
- real operational logs or anomaly timelines;
- private bus maps, pinouts or hardware mappings;
- employer-owned or customer-owned code;
- NDA-protected material;
- export-controlled material;
- credentials, tokens or private infrastructure details;
- screenshots or captures containing material you are not authorized to publish.

All examples and fixtures must be synthetic or based only on material that can legally be used and redistributed.

By contributing, you confirm that the contribution is your original work or material you have the legal right to contribute.

## Development setup

Use the README as the current source for host prerequisites and the validated OrbitFabric Core baseline.

Install the locked frontend dependencies:

```bash
npm ci
```

Run Studio from source:

```bash
npm run tauri:dev
```

## Required validation

Run the relevant release-critical checks before opening a pull request:

```bash
npm audit --audit-level=low
npm run test:logic
npm run build
cargo test --locked --manifest-path src-tauri/Cargo.toml
cargo check --locked --manifest-path src-tauri/Cargo.toml
npm run tauri -- build --debug --no-bundle
```

Repository CI additionally exercises pinned Core acceptance missions and the real reference Integration Package path. Do not replace those checks with Studio-only synthetic assumptions when a real Core or integration contract is available.

For UI changes, perform focused manual acceptance on the affected surface and include the tested host/window conditions in the PR when relevant.

## Pull request expectations

A good pull request should state:

- what changed and why;
- which Studio surface or architectural layer is affected;
- whether Core-owned semantic interpretation changes in any way;
- whether integration/package/plugin boundaries are affected;
- whether filesystem, process, IPC, WebView, network or sensitive-data boundaries change;
- which automated and manual checks were run;
- whether preview compatibility or documented behavior changes;
- confirmation that no protected material is included.

Prefer focused pull requests. Do not combine semantic-boundary changes, security-sensitive process changes and unrelated UI cleanup when that makes review harder.

## Documentation

Documentation is part of the product contract when it defines authority, security, release scope or integration boundaries. Update the relevant current documents when those boundaries change, while keeping historical release notes historically accurate.

## Community and security

Please also read:

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)

Do not report security vulnerabilities or protected mission information in a public issue.
