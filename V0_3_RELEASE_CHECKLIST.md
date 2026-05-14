# OrbitFabric Studio v0.3.0 Release Checklist

Release: `v0.3.0 - Contract Navigation Surface`

Status: planning baseline

This checklist gates the v0.3.0 release.

v0.3.0 extends the implemented loop from:

```text
Open -> Inspect -> Validate -> Understand
```

to:

```text
Open -> Inspect -> Validate -> Navigate
```

The milestone is complete only if Studio consumes Core-owned contract navigation surfaces without becoming a second Core, semantic YAML parser, validator, relationship resolver or graph engine.

---

## 1. Baseline

```text
[x] Studio v0.2.0 baseline is complete.
[x] Studio main is aligned with the v0.2.0 release state before v0.3.0 work starts.
[x] Core v0.8.1 Contract Introspection Surface is identified as the minimum domain navigation baseline.
[x] Core v0.8.2 Entity Index Surface is identified as the full entity navigation baseline.
[x] Core v0.8.0 compatibility is treated as a graceful unsupported navigation state.
```

---

## 2. Documentation Planning Gate

```text
[ ] README describes v0.3.0 planning state.
[ ] ROADMAP defines v0.3.0 as Contract Navigation Surface based on Core model_summary and entity_index.
[ ] ROADMAP defers relationship and graph navigation until a Core relationship surface exists.
[ ] CHANGELOG contains an unreleased v0.3.0 entry.
[ ] docs/development/v0.3.0-contract-navigation-surface.md exists.
[ ] docs/ADR/0008-v0-3-core-derived-contract-navigation.md exists.
[ ] V0_3_RELEASE_CHECKLIST.md exists.
```

---

## 3. Core Export Command Gate

```text
[ ] Backend exposes a fixed command for `orbitfabric export model-summary`.
[ ] Backend exposes a fixed command for `orbitfabric export entity-index`.
[ ] Export report paths are controlled by Studio.
[ ] Backend returns stdout, stderr, exit code and success state.
[ ] Backend reports JSON report availability.
[ ] Backend returns report content only when available.
[ ] No arbitrary command execution is introduced.
[ ] No arbitrary OrbitFabric CLI argument entry is introduced.
[ ] No scenario runner is introduced.
[ ] No generator workflow is introduced beyond fixed Core-owned report exports.
```

---

## 4. TypeScript Report Model Gate

```text
[ ] TypeScript model for Core model_summary.json exists.
[ ] TypeScript model for Core entity_index.json exists.
[ ] Types mirror Core fields actually exposed by v0.8.1 and v0.8.2.
[ ] Minimal report recognition handles missing reports.
[ ] Minimal report recognition handles invalid reports.
[ ] Minimal report recognition handles unsupported command states.
[ ] No line or column fields are invented.
[ ] No relationship fields are invented.
[ ] No graph fields are invented.
[ ] No YAML AST fields are invented.
```

---

## 5. Domain Navigation Gate

```text
[ ] UI displays domains from Core model_summary.domains.
[ ] UI displays required and present state.
[ ] UI displays count.
[ ] UI displays count_provenance.
[ ] UI displays source_file when provided by Core.
[ ] UI exposes a read-only source-file link only when safely resolvable.
[ ] UI shows a domain detail panel.
[ ] UI labels the data as Core model summary derived.
[ ] UI handles missing model_summary report.
[ ] UI handles unsupported model-summary command.
```

---

## 6. Entity Navigation Gate

```text
[ ] UI displays entities from Core entity_index.entities.
[ ] UI groups entities by domain.
[ ] UI displays id.
[ ] UI displays display_name.
[ ] UI displays domain.
[ ] UI displays entity_type.
[ ] UI displays source_file when provided by Core.
[ ] UI displays provenance.
[ ] UI displays required_domain.
[ ] UI displays present.
[ ] UI shows an entity detail panel.
[ ] UI shows a domain summary panel from Core entity_index.domains.
[ ] UI displays indexed / not-indexed state.
[ ] UI displays model_count and entity_count.
[ ] UI labels the data as Core entity index derived.
[ ] UI handles missing entity_index report.
[ ] UI handles unsupported entity-index command.
```

---

## 7. Summary-only Domain Gate

```text
[ ] mode_transitions is not given synthetic entity records.
[ ] policies is not given synthetic entity records.
[ ] Summary-only domains are displayed as summarized but not entity-indexed when Core reports them that way.
[ ] Studio does not maintain a private entity registry for missing domains.
```

---

## 8. Source File Linking Gate

```text
[ ] Domain source_file links are safe and read-only.
[ ] Entity source_file links are safe and read-only.
[ ] Links are allowed only when Core-provided source_file resolves inside the workspace.
[ ] Links are allowed only for supported viewer text files.
[ ] Links are not inferred from domain name.
[ ] Links are not inferred from entity id.
[ ] Links are not inferred from entity type.
[ ] No line or column jump is attempted.
```

---

## 9. Compatibility Gate

```text
[ ] Core v0.8.0 behavior is handled: lint available, navigation unavailable.
[ ] Core v0.8.1 behavior is handled: domain navigation available, entity navigation unavailable.
[ ] Core v0.8.2 behavior is handled: domain navigation and entity navigation available.
[ ] Compatibility is based on command behavior and report availability.
[ ] Version strings may be displayed but are not the only compatibility signal.
```

---

## 10. Non-goal Gate

```text
[ ] No editing.
[ ] No visual model editing.
[ ] No semantic YAML parser.
[ ] No private entity extraction.
[ ] No private domain registry when Core model_summary is available.
[ ] No private relationship resolver.
[ ] No graph view.
[ ] No relationship navigation.
[ ] No dependency graph.
[ ] No line or column navigation.
[ ] No fake source span.
[ ] No quick fixes.
[ ] No suppressions.
[ ] No scenario runner.
[ ] No generator workflow beyond fixed Core-owned report exports.
[ ] No ground artifact explorer.
[ ] No runtime artifact explorer.
[ ] No plugin UI.
[ ] No arbitrary command execution.
[ ] No arbitrary OrbitFabric CLI argument entry.
[ ] No mission-control UI.
[ ] No live telemetry.
[ ] No command uplink.
```

---

## 11. Manual Verification Gate

Recommended local checks for each technical PR:

```bash
git fetch
git checkout <branch>
git pull
npm run build
source "$HOME/.cargo/env"
npm run tauri:dev
```

Manual smoke test workspace:

```text
examples/demo-3u
```

Required manual checks before v0.3.0 release:

```text
[ ] Open workspace.
[ ] Verify Core version command.
[ ] Run inspect mission.
[ ] Run lint mission.
[ ] Run export model-summary.
[ ] Run export entity-index when supported.
[ ] Open Contract Navigation Surface.
[ ] Verify domain list.
[ ] Verify domain detail panel.
[ ] Verify entity list.
[ ] Verify entity detail panel.
[ ] Open source file from domain.
[ ] Open source file from entity.
[ ] Confirm file viewer remains read-only.
[ ] Confirm fallback with Core without entity-index.
[ ] Confirm fallback with missing model_summary report.
[ ] Confirm fallback with missing entity_index report.
[ ] Confirm raw stdout and stderr remain visible.
[ ] Confirm no graph, editing or arbitrary command UI exists.
```

---

## 12. Release Metadata Gate

Before tagging v0.3.0:

```text
[ ] package.json version is updated to 0.3.0.
[ ] package-lock.json version is updated to 0.3.0.
[ ] src-tauri/Cargo.toml version is updated to 0.3.0.
[ ] src-tauri/Cargo.lock version is updated to 0.3.0.
[ ] src-tauri/tauri.conf.json version is updated to 0.3.0.
[ ] README status is updated to v0.3.0.
[ ] CHANGELOG v0.3.0 entry is complete.
[ ] ROADMAP marks v0.3.0 as completed.
[ ] docs/releases/v0.3.0-release-notes.md exists.
[ ] GitHub release notes are prepared.
```

---

## 13. Release Gate

```text
[ ] v0.3.0 can be tagged only after all technical and documentation gates are complete.
[ ] Scope non-goals remain true at the end of the milestone.
[ ] No source model write path exists.
[ ] No graph or relationship navigation exists.
[ ] Core-derived provenance is visible for all navigation data.
[ ] Known limitations are documented.
```
