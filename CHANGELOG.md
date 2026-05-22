# Changelog

All notable changes to OrbitFabric Studio will be documented in this file.

The format follows a simple release-oriented structure.

OrbitFabric Studio is currently at `v0.4.0 - Relationship Surface`.

The current released baseline is `v0.4.0 - Relationship Surface`.

The active planning baseline is `v0.5.0 - Generated Artifact Explorer`.

---

## v0.5.0 - Generated Artifact Explorer

Planning baseline.

This milestone extends the product loop to:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships -> Inspect Generated Artifacts
```

v0.5.0 remains downstream from OrbitFabric Core.

Studio will inspect generated artifacts already present in the selected workspace.

Studio will not generate artifacts, modify files, execute arbitrary commands, infer Mission Model semantics from generated files, claim runtime behavior or claim ground behavior.

### Added

- Added `ADR-0010 - v0.5 Core-derived Generated Artifact Explorer`.
- Added `docs/development/v0.5.0-generated-artifact-explorer.md`.
- Added `V0_5_RELEASE_CHECKLIST.md`.
- Added v0.5.0 planning baseline for read-only generated artifact inspection.
- Added conservative artifact classes: reports, logs, docs, runtime, ground and unknown.
- Added initial known Core-documented artifact family list.
- Added explicit preview rules for supported text artifacts.
- Added release gates for inventory model, backend inspection, UI explorer, classification and read-only preview.

### Changed

- Updated README to mark v0.5.0 as the active planning baseline.
- Updated README to correct the stale v0.4.0 limitation around `relationship_manifest.json`.
- Updated README to describe v0.5.0 boundaries and non-goals.
- Updated ROADMAP to mark v0.5.0 as active.
- Updated ROADMAP to define v0.5.0 planned capabilities and exit criteria.

### Not Included

- No application code.
- No React changes.
- No TypeScript artifact inventory model.
- No Tauri commands.
- No backend directory traversal.
- No generated artifact UI.
- No version metadata changes.
- No lockfile changes.
- No editing.
- No generated file modification.
- No Mission Model modification.
- No arbitrary shell command.
- No arbitrary OrbitFabric CLI argument entry.
- No artifact generation workflow.
- No scenario runner.
- No runtime execution.
- No ground runtime claim.
- No mission-control UI.
- No private artifact semantics.

---

## v0.4.0 - Relationship Surface

Released milestone.

This milestone extends the product loop to:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships
```

### Added

- Fixed backend command for Core `export relationship-manifest`.
- Studio-controlled relationship manifest report path.
- TypeScript model and parser for Core `relationship_manifest.json`.
- UI action for `Run export relationship-manifest`.
- Relationship Manifest summary panel.
- Boundary labels for the Relationship Manifest Surface.
- Raw `relationship_manifest.json` preview.
- Missing-report fallback for the relationship manifest command.
- Relationship type summary and filters from Core `relationship_types`.
- Relationship records navigation and filters from Core `relationships`.
- Selected relationship explanation panel.
- Explicit provenance and boundary statements for selected relationship records.
- `docs/releases/v0.4.0-release-notes.md`.

### Changed

- Updated the visible Studio header to `Relationship Surface`.
- Updated the visible release label to `v0.4.0 relationship surface`.
- Updated the visible product loop to `Open -> Inspect -> Validate -> Navigate -> Explain Relationships`.
- Updated README to describe v0.4.0 as the current released baseline.
- Updated ROADMAP to mark v0.4.0 as completed.
- Updated package, Cargo and Tauri version metadata to `0.4.0`.

### Validated Manually

Manual smoke tests were performed with OrbitFabric Core 1.0.0 on:

```text
examples/demo-3u
```

Observed relationship manifest result:

```text
total_relationships = 46
```

Validated local checks:

```text
npm run build
npm run tauri:dev
```

### Not Included

- No editing.
- No visual model editing.
- No semantic YAML parser.
- No private relationship inference.
- No dependency graph.
- No relationship graph engine.
- No source line or column navigation.
- No runtime behavior.
- No ground behavior.
- No arbitrary command execution.
- No relationship records invented by Studio.
- No synthetic nodes.
- No synthetic edges.

---

## Historical releases

Previous release entries are unchanged in repository history.

See release notes and tagged versions for v0.0.0, v0.1.0, v0.2.0 and v0.3.0 details.
