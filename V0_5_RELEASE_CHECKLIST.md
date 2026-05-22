# OrbitFabric Studio v0.5.0 Release Checklist

Release: `v0.5.0 - Generated Artifact Explorer`

Status: planning baseline

This checklist gates the v0.5.0 release.

v0.5.0 extends the implemented loop from:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships
```

to:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships -> Inspect Generated Artifacts
```

The milestone is complete only if Studio inspects generated artifacts without becoming a generator, semantic parser, runtime UI, ground UI, mission-control UI or arbitrary command launcher.

---

## 1. Baseline Gate

```text
[x] Studio main is aligned to v0.4.0 Relationship Surface at planning start.
[x] Studio v0.4.0 consumes Core model_summary.json.
[x] Studio v0.4.0 consumes Core entity_index.json.
[x] Studio v0.4.0 consumes Core relationship_manifest.json.
[x] Studio v0.4.0 does not edit files.
[x] Studio v0.4.0 does not execute arbitrary commands.
[x] Core v1.0.0 documents generated and exported artifact classes.
```

---

## 2. Documentation Gate

```text
[x] docs/development/v0.5.0-generated-artifact-explorer.md exists.
[x] docs/ADR/0010-v0-5-core-derived-generated-artifact-explorer.md exists.
[x] V0_5_RELEASE_CHECKLIST.md exists.
[x] README describes v0.5.0 as the active planning baseline.
[x] ROADMAP marks v0.5.0 as active.
[x] CHANGELOG contains a v0.5.0 planning entry.
[ ] docs/releases/v0.5.0-release-notes.md exists before final release.
```

---

## 3. Artifact Inventory Model Gate

```text
[x] Generated artifact TypeScript model exists.
[x] Artifact class supports reports, logs, docs, runtime, ground and unknown.
[x] Artifact metadata includes name, path, extension and size.
[x] Artifact metadata distinguishes known from unknown.
[x] Artifact metadata distinguishes previewable from not previewable.
[x] Artifact model does not contain Mission Model semantics.
[x] Artifact model does not contain runtime behavior fields.
[x] Artifact model does not contain ground behavior fields.
[x] Artifact model does not contain dependency graph fields.
```

---

## 4. Backend Inspection Gate

```text
[x] Controlled backend command exists for generated artifact inspection.
[x] Command reads only inside the selected workspace.
[x] Command inspects generated/ only.
[x] Command handles missing generated/ cleanly.
[x] Command is bounded and safe for local inspection.
[x] Command returns file metadata without modifying files.
[x] Command does not run OrbitFabric Core.
[x] Command does not run shell commands.
[x] Command does not generate artifacts.
[x] Command does not parse Mission Model YAML.
```

---

## 5. UI Explorer Gate

```text
[x] Generated Artifact Explorer panel exists.
[x] Artifact groups are visible.
[x] Reports, logs, docs, runtime, ground and unknown groups are visible.
[x] Artifact path, size and extension are visible.
[x] Known or unknown classification is visible.
[x] Empty states are explicit.
```

---

## 6. Known Artifact Classification Gate

```text
[x] Core structured reports are classified conservatively.
[x] Lint and simulation reports are classified conservatively.
[x] Generated docs Markdown files are classified conservatively.
[x] Runtime contract manifest and generated C++17 files are classified conservatively.
[x] Ground contract manifest, dictionaries, CSV files and Markdown files are classified conservatively.
[x] Unrecognized generated files remain visible as unknown.
[x] Studio does not infer Mission Data Contract meaning from file names.
```

---

## 7. Read-only Preview Gate

```text
[x] Supported text artifacts open in the existing read-only viewer.
[x] JSON, Markdown, log, C/C++ and CSV text artifacts are handled safely.
[x] Oversized files are rejected by the existing viewer limit.
[x] Unsupported files are listed but not previewed.
[x] Preview does not imply validation.
[x] Preview does not imply source-of-truth status.
```

---

## 8. Non-goal Gate

The following must remain true at the end of v0.5.0:

```text
[x] No editing.
[x] No generated file modification.
[x] No Mission Model modification.
[x] No arbitrary shell command.
[x] No arbitrary OrbitFabric CLI argument entry.
[x] No new generator workflow.
[x] No scenario runner.
[x] No runtime execution.
[x] No build-system integration.
[x] No flight software claim.
[x] No ground runtime claim.
[x] No mission-control UI.
[x] No live telemetry.
[x] No command uplink.
[x] No private YAML semantic parser.
[x] No private Mission Model validator.
[x] No private artifact semantics.
[x] No dependency graph.
[x] No relationship graph engine.
[x] No plugin execution.
[x] No plugin discovery.
```

---

## 9. Manual Verification Gate

```text
[x] npm install.
[x] npm run build.
[x] npm run tauri:dev.
[x] Open examples/demo-3u.
[x] Verify generated directory detection.
[x] Verify reports, logs, docs, runtime, ground and unknown groups.
[x] Verify read-only preview for supported text artifacts.
[x] Verify unsupported files are not previewed.
[x] Verify no file modification path exists.
[x] Verify no arbitrary command path exists.
[x] Verify no generation workflow was added.
```

---

## 10. Release Metadata Gate

```text
[ ] package.json version is updated to 0.5.0.
[ ] package-lock.json version is updated to 0.5.0.
[ ] src-tauri/Cargo.toml version is updated to 0.5.0.
[ ] src-tauri/Cargo.lock version is updated to 0.5.0.
[ ] src-tauri/tauri.conf.json version is updated to 0.5.0.
[ ] README status is updated to v0.5.0 released.
[ ] CHANGELOG v0.5.0 entry is complete.
[ ] ROADMAP marks v0.5.0 as completed.
[ ] docs/releases/v0.5.0-release-notes.md exists.
[ ] GitHub release notes are prepared.
```

Current state: manual verification gate complete.
