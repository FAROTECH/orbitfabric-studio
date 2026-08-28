## Summary

Describe the purpose of this pull request and the engineering problem it addresses.

## Changes

List the concrete changes introduced by this PR.

- 
- 
- 

## Affected Area

Select all that apply:

- [ ] Mission opening / Core gateway / hydration
- [ ] Mission Atlas
- [ ] Explore / Entity X-Ray
- [ ] Relations / Context Path / Context Map
- [ ] Validation Findings
- [ ] Operations / Operational State Map / Mode Focus
- [ ] Graph model / ELK / React Flow presentation
- [ ] Generic Integrations workspace
- [ ] Integration Plugin API / bundled plugin
- [ ] Capture / export
- [ ] Tauri / process / filesystem / security boundary
- [ ] CI / tooling / release
- [ ] Documentation
- [ ] Other

## Semantic Authority

Does this PR change how Studio interprets OrbitFabric mission semantics?

- [ ] No; Studio continues to consume explicit Core-owned facts only.
- [ ] Yes; explain why this belongs in Studio rather than requiring a Core surface change.

Describe any affected Core surfaces, entity identity rules or relationship handling.

Studio must not reconstruct missing Mission Data Contract meaning from raw YAML, names, text, file layout or co-occurrence.

## Integration Boundary

For integration-related changes, confirm the ownership boundary:

```text
Integration Package != Studio Integration Plugin
```

Describe any impact on Integration Result consumption, package execution, plugin context, target presentation or Studio-gated actions. State explicitly if this section is not applicable.

## Security / Trust Boundary

Does this PR affect any of the following?

- [ ] filesystem or path handling
- [ ] temporary files
- [ ] child process execution / timeout / cleanup
- [ ] Tauri capabilities or IPC
- [ ] CSP / WebView / remote-content behavior
- [ ] local preference persistence
- [ ] capture/export output
- [ ] external adapter execution
- [ ] Integration Plugin API privileges
- [ ] network behavior or data transmission
- [ ] none of the above

If any trust boundary changes, describe the impact and mitigation.

## Preview / Compatibility Impact

Does this PR change behavior documented for the current public preview or another public candidate contract?

- [ ] No
- [ ] Yes; documentation/release notes are updated as appropriate.

## Validation

Select the checks that were run as relevant.

- [ ] `npm audit --audit-level=low`
- [ ] `npm run test:logic`
- [ ] `npm run build`
- [ ] `cargo test --locked --manifest-path src-tauri/Cargo.toml`
- [ ] `cargo check --locked --manifest-path src-tauri/Cargo.toml`
- [ ] `npm run tauri -- build --debug --no-bundle`
- [ ] focused manual Tauri/UI acceptance
- [ ] repository CI, including pinned Core acceptance, is green
- [ ] real reference Integration Package acceptance is green when relevant

If some checks were not run, explain why.

## Clean-Room Confirmation

By opening this PR, I confirm that the contribution does not include proprietary, confidential, export-controlled or NDA-protected material, including private mission data, spacecraft architecture, packet formats, operational logs, customer/employer-owned code, credentials or unauthorized screenshots/captures.

- [ ] Confirmed

## Notes for Review

Add anything the reviewer should pay particular attention to, including deliberate non-goals or follow-up work.
