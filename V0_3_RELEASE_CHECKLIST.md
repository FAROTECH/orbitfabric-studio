# OrbitFabric Studio v0.3.0 Release Checklist

Release: `v0.3.0 - Contract Navigation Surface`

Status: release candidate

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

## 2. Documentation Gate

```text
[x] README describes v0.3.0 release-candidate state.
[x] ROADMAP defines v0.3.0 as Contract Navigation Surface based on Core model_summary and entity_index.
[x] ROADMAP defers relationship and graph navigation until a Core relationship surface exists.
[x] CHANGELOG contains a v0.3.0 entry.
[x] docs/development/v0.3.0-contract-navigation-surface.md exists.
[x] docs/ADR/0008-v0-3-core-derived-contract-navigation.md exists.
[x] docs/releases/v0.3.0-release-notes.md exists.
[x] V0_3_RELEASE_CHECKLIST.md exists.
```

---

## 3. Core Export Command Gate

```text
[x] Backend exposes a fixed command for `orbitfabric export model-summary`.
[x] Backend exposes a fixed command for `orbitfabric export entity-index`.
[x] Export report paths are controlled by Studio.
[x] Backend returns stdout, stderr, exit code and success state.
[x] Backend reports JSON report availability.
[x] Backend returns report content only when available.
[x] No arbitrary command execution is introduced.
[x] No arbitrary OrbitFabric CLI argument entry is introduced.
[x] No scenario runner is introduced.
[x] No generator workflow is introduced beyond fixed Core-owned report exports.
```

---

## 4. TypeScript Report Model Gate

```text
[x] TypeScript model for Core model_summary.json exists.
[x] TypeScript model for Core entity_index.json exists.
[x] Types mirror Core fields actually exposed by v0.8.1 and v0.8.2.
[x] Minimal report recognition handles missing reports.
[x] Minimal report recognition handles invalid reports.
[x] Minimal report recognition handles unsupported command states.
[x] No line or column fields are invented.
[x] No relationship fields are invented.
[x] No graph fields are invented.
[x] No YAML AST fields are invented.
```

---

## 5. Domain Navigation Gate

```text
[x] UI displays domains from Core model_summary.domains.
[x] UI displays required and present state.
[x] UI displays count.
[x] UI displays count_provenance.
[x] UI displays source_file when provided by Core.
[x] UI exposes a read-only source-file link only when safely resolvable.
[x] UI shows a domain navigation panel.
[x] UI labels the data as Core model summary derived.
[x] UI handles missing model_summary report.
[x] UI handles unsupported model-summary command.
```

Manual validation was performed with OrbitFabric Core 0.8.2 on `examples/demo-3u`.

---

## 6. Entity Navigation Gate

```text
[x] UI displays entities from Core entity_index.entities.
[x] UI groups entities by domain.
[x] UI displays id.
[x] UI displays display_name.
[x] UI displays domain.
[x] UI displays entity_type.
[x] UI displays source_file when provided by Core.
[x] UI displays provenance.
[x] UI displays required_domain.
[x] UI displays present.
[x] UI shows an entity navigation panel.
[x] UI shows a domain summary panel from Core entity_index.domains.
[x] UI displays indexed / not-indexed state.
[x] UI displays model_count and entity_count.
[x] UI labels the data as Core entity index derived.
[x] UI handles missing entity_index report.
[x] UI handles unsupported entity-index command.
```

Manual validation was performed with OrbitFabric Core 0.8.2 on `examples/demo-3u`.

Observed total entity count: `46`.

---

## 7. Summary-only Domain Gate

```text
[x] mode_transitions is not given synthetic entity records.
[x] policies is not given synthetic entity records.
[x] Summary-only domains are displayed as summarized but not entity-indexed when Core reports them that way.
[x] Studio does not maintain a private entity registry for missing domains.
```

Manual validation confirmed `mode_transitions` and `policies` as `NOT INDEXED` with zero synthetic entity records.

---

## 8. Source File Linking Gate

```text
[x] Domain source_file links are safe and read-only.
[x] Entity source_file links are safe and read-only.
[x] Links are allowed only when Core-provided source_file resolves inside the workspace.
[x] Links are allowed only for supported viewer text files.
[x] Links are not inferred from domain name.
[x] Links are not inferred from entity id.
[x] Links are not inferred from entity type.
[x] No line or column jump is attempted.
```

---

## 9. Compatibility Gate

```text
[x] Core v0.8.0 behavior is handled structurally: lint available, navigation unavailable.
[x] Core v0.8.1 behavior is handled structurally: domain navigation available, entity navigation unavailable.
[x] Core v0.8.2 behavior is handled and manually validated: domain navigation and entity navigation available.
[x] Compatibility is based on command behavior and report availability.
[x] Version strings may be displayed but are not the only compatibility signal.
```

Note: direct manual runtime validation in this release-candidate pass was performed with Core `0.8.2`. Older Core behavior is handled through fixed command failure/report-availability fallbacks and should be spot-checked before final tagging if older-Core compatibility is considered release-critical.

---

## 10. Non-goal Gate

```text
[x] No editing.
[x] No visual model editing.
[x] No semantic YAML parser.
[x] No private entity extraction.
[x] No private domain registry when Core model_summary is available.
[x] No private relationship resolver.
[x] No graph view.
[x] No relationship navigation.
[x] No dependency graph.
[x] No line or column navigation.
[x] No fake source span.
[x] No quick fixes.
[x] No suppressions.
[x] No scenario runner.
[x] No generator workflow beyond fixed Core-owned report exports.
[x] No ground artifact explorer.
[x] No runtime artifact explorer.
[x] No plugin UI.
[x] No arbitrary command execution.
[x] No arbitrary OrbitFabric CLI argument entry.
[x] No mission-control UI.
[x] No live telemetry.
[x] No command uplink.
```

---

## 11. Manual Verification Gate

Recommended local checks before final tag:

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
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
[x] Open workspace.
[x] Verify Core version command.
[x] Run inspect mission.
[x] Run lint mission.
[x] Run export model-summary.
[x] Run export entity-index when supported.
[x] Open Contract Navigation Surface.
[x] Verify domain list.
[x] Verify domain navigation panel.
[x] Verify entity list.
[x] Verify entity navigation panel.
[x] Open source file from domain.
[x] Open source file from entity.
[x] Confirm file viewer remains read-only.
[ ] Confirm fallback with Core without entity-index.
[ ] Confirm fallback with missing model_summary report.
[ ] Confirm fallback with missing entity_index report.
[x] Confirm raw stdout and stderr remain visible.
[x] Confirm no graph, editing or arbitrary command UI exists.
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
[x] README status is updated to v0.3.0 release candidate.
[x] CHANGELOG v0.3.0 entry is complete.
[ ] ROADMAP marks v0.3.0 as completed.
[x] docs/releases/v0.3.0-release-notes.md exists.
[ ] GitHub release notes are prepared.
```

Version metadata and lockfiles must be updated together locally to avoid manual lockfile corruption.

---

## 13. Release Gate

```text
[ ] v0.3.0 can be tagged only after all technical and documentation gates are complete.
[x] Scope non-goals remain true at the end of the milestone.
[x] No source model write path exists.
[x] No graph or relationship navigation exists.
[x] Core-derived provenance is visible for all navigation data.
[x] Known limitations are documented.
```

Current state: release candidate, not yet tag-ready.

Remaining before tag:

```text
- version metadata update to 0.3.0
- lockfile refresh through npm/Cargo locally
- final local build
- final smoke test from main
- optional older-Core fallback spot-check
- GitHub release notes finalization
```
