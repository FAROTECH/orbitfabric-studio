# OrbitFabric Studio v0.6.0 Release Checklist

## Scope

Release milestone:

```text
v0.6.0 - Studio Information Architecture & UX Foundation
```

Primary released loop:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships -> Inspect Generated Artifacts -> Review Reserved Surfaces
```

## Required checks

- [ ] `npm install`
- [ ] `npm run build`
- [ ] `npm run tauri:dev`
- [ ] Open `examples/demo-3u`
- [ ] Verify workspace header
- [ ] Verify primary navigation
- [ ] Verify state-aware sidebar availability
- [ ] Verify Workspace Dashboard
- [ ] Verify Core command panel remains reachable
- [ ] Verify Core lint report preview remains reachable
- [ ] Verify model summary surface remains reachable
- [ ] Verify entity index surface remains reachable
- [ ] Verify relationship manifest surface remains reachable
- [ ] Verify Generated Artifact Explorer remains reachable
- [ ] Verify generated artifact preview remains read-only
- [ ] Verify contextual inspector updates for source file selection
- [ ] Verify contextual inspector updates for generated artifact selection
- [ ] Verify raw Core output remains visible
- [ ] Verify Evidence and Ground remain reserved
- [ ] Verify no scenario execution command exists
- [ ] Verify no ground operation command exists
- [ ] Verify no editing affordance exists

## Boundary checks

- [ ] No new Tauri command introduced for v0.6.0 release alignment
- [ ] No new Core command introduced for v0.6.0 release alignment
- [ ] No React Flow dependency
- [ ] No graph UI
- [ ] No authoring
- [ ] No generated artifact mutation
- [ ] No Mission Model mutation
- [ ] No live telemetry behavior
- [ ] No command uplink behavior

## Release metadata

- [ ] `README.md` marks v0.6.0 as current released baseline
- [ ] `CHANGELOG.md` contains v0.6.0 release notes
- [ ] `ROADMAP.md` marks v0.6.0 as completed and v0.7.0 as active
- [ ] `package.json` version is `0.6.0`
- [ ] `package-lock.json` version is `0.6.0`
- [ ] `src-tauri/Cargo.toml` version is `0.6.0`
- [ ] `src-tauri/Cargo.lock` package version is `0.6.0`
- [ ] `src-tauri/tauri.conf.json` version is `0.6.0`

## Tagging

After merge to `main` and final validation:

```bash
git tag v0.6.0
git push origin v0.6.0
```
