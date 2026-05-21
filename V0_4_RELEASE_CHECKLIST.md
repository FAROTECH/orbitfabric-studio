# OrbitFabric Studio v0.4.0 Release Checklist

Release: `v0.4.0 - Relationship Surface`

Status: planning baseline

This checklist gates the v0.4.0 release.

v0.4.0 extends the implemented loop from:

```text
Open -> Inspect -> Validate -> Navigate
```

to:

```text
Open -> Inspect -> Validate -> Navigate -> Explain Relationships
```

The milestone is complete only if Studio consumes Core-owned relationship records without becoming a second Core, semantic YAML parser, relationship inference engine, dependency graph engine or runtime behavior interpreter.

---

## 1. Baseline Gate

```text
[x] Studio main is aligned to v0.3.0 Contract Navigation Surface.
[x] Studio v0.3.0 consumes Core model_summary.json.
[x] Studio v0.3.0 consumes Core entity_index.json.
[x] Studio v0.3.0 does not implement relationship navigation.
[x] Studio v0.3.0 does not implement graph rendering.
[x] Studio v0.3.0 does not infer relationships.
[x] Core v1.0.0 exposes relationship_manifest.json.
[x] Core v1.0.0 exposes orbitfabric export relationship-manifest.
[x] Core v1.0.0 documents the Relationship Manifest Surface.
```

---

## 2. Documentation Gate

```text
[x] README describes v0.4.0 as the next Relationship Surface milestone.
[x] ROADMAP marks v0.4.0 as active and based on Core v1.0.0 relationship_manifest.json.
[x] CHANGELOG contains a v0.4.0 planning entry.
[x] docs/development/v0.4.0-relationship-surface.md exists.
[x] docs/ADR/0009-v0-4-core-derived-relationship-surface.md exists.
[x] V0_4_RELEASE_CHECKLIST.md exists.
[ ] docs/releases/v0.4.0-release-notes.md exists before final release.
```

---

## 3. Core Surface Gate

Studio v0.4.0 must consume:

```text
orbitfabric export relationship-manifest <mission_dir> --json <studio_report_path>
```

Required report identity:

```text
kind: orbitfabric.relationship_manifest
manifest_version: 0.1-candidate
status: candidate
```

Required top-level fields:

```text
[ ] manifest_version
[ ] kind
[ ] orbitfabric_version
[ ] status
[ ] mission
[ ] source
[ ] boundaries
[ ] counts
[ ] relationship_types
[ ] relationships
[ ] derivation_policy
```

---

## 4. Backend Command Gate

```text
[ ] Add fixed Tauri command run_core_export_relationship_manifest.
[ ] Command invokes only orbitfabric export relationship-manifest.
[ ] Command uses the currently opened mission directory.
[ ] Command writes to a Studio-controlled report path.
[ ] Command returns stdout.
[ ] Command returns stderr.
[ ] Command returns exit_code.
[ ] Command returns success.
[ ] Command returns report availability.
[ ] Command returns report path.
[ ] Command returns report content when available.
[ ] No arbitrary CLI argument entry exists.
[ ] No arbitrary shell command exists.
[ ] No generic generator workflow exists.
[ ] No scenario runner exists.
```

---

## 5. TypeScript Report Model Gate

```text
[ ] Add CoreRelationshipManifest TypeScript model.
[ ] Add CoreRelationshipType TypeScript model.
[ ] Add CoreRelationshipRecord TypeScript model.
[ ] Add Core relationship endpoint model.
[ ] Add derivation metadata model.
[ ] Parse relationship_manifest.json as a derived Core report.
[ ] Detect missing report.
[ ] Detect invalid report.
[ ] Detect unsupported kind.
[ ] Detect unsupported manifest_version.
[ ] Do not add source line fields.
[ ] Do not add source column fields.
[ ] Do not add YAML AST fields.
[ ] Do not add dependency graph fields.
[ ] Do not add runtime behavior fields.
[ ] Do not add ground behavior fields.
[ ] Do not add plugin fields.
```

---

## 6. Command UI Gate

```text
[ ] Add Run export relationship-manifest action.
[ ] Show raw command result.
[ ] Show stdout.
[ ] Show stderr.
[ ] Show exit code.
[ ] Show report path.
[ ] Show report availability.
[ ] Show missing or unsupported report fallback.
[ ] Preserve existing model-summary and entity-index behavior.
```

---

## 7. Relationship Manifest Summary Gate

```text
[ ] Show mission.
[ ] Show manifest_version.
[ ] Show Core version.
[ ] Show status.
[ ] Show total_relationships.
[ ] Verify total_relationships = 46 on examples/demo-3u with Core v1.0.0.
```

Required boundary labels:

```text
[ ] Core relationship manifest.
[ ] Not relationship graph.
[ ] Not dependency graph.
[ ] No source locations.
[ ] No runtime behavior.
[ ] No ground behavior.
```

---

## 8. Relationship Type Summary Gate

```text
[ ] Show relationship_types list.
[ ] Show relationship_type.
[ ] Show display_name.
[ ] Show from_domain.
[ ] Show to_domain.
[ ] Show derived_from.model_field.
[ ] Show relationship_count.
[ ] Add relationship_type filter.
[ ] Add from_domain filter.
[ ] Add to_domain filter.
[ ] Do not render a graph in this slice.
```

---

## 9. Relationship Records Gate

```text
[ ] Show relationship records from Core only.
[ ] Show relationship_id.
[ ] Show relationship_type.
[ ] Show from.domain.
[ ] Show from.id.
[ ] Show to.domain.
[ ] Show to.id.
[ ] Show derived_from.model_field.
[ ] Link from endpoint to entity_index entity when available.
[ ] Link to endpoint to entity_index entity when available.
[ ] Fall back cleanly when entity_index is unavailable.
[ ] Do not create synthetic nodes.
[ ] Do not create synthetic edges.
[ ] Do not infer missing relationships.
```

---

## 10. Relationship Explanation Gate

```text
[ ] Add read-only relationship detail panel.
[ ] Explain that the relationship comes from Core relationship_manifest.json.
[ ] Explain that the relationship is derived from derived_from.model_field.
[ ] Explain that Studio did not infer the relationship.
[ ] Explain that the relationship is not runtime behavior.
[ ] Explain that the relationship is not ground behavior.
[ ] Explain that the relationship is not a dependency graph edge.
[ ] Link to a source file only when safely resolvable through Core-provided metadata.
[ ] Do not provide line navigation.
[ ] Do not provide column navigation.
```

---

## 11. Optional Visualization Gate

A graph-like visualization is not required for v0.4.0.

If it is introduced, all of the following must be true:

```text
[ ] Every visible edge corresponds one-to-one to a Core relationship record.
[ ] Every visible node corresponds to an entity_index entity.
[ ] Studio calculates no additional edges.
[ ] Studio creates no synthetic nodes.
[ ] Layout has no semantic meaning.
[ ] UI does not call it a dependency graph.
[ ] UI does not call it a relationship graph engine.
```

If these conditions cannot be preserved, the visualization must be deferred.

---

## 12. Non-goal Gate

The following must remain true at the end of v0.4.0:

```text
[ ] No editing.
[ ] No visual model editing.
[ ] No semantic YAML parser.
[ ] No private relationship inference.
[ ] No private graph semantics.
[ ] No dependency graph.
[ ] No relationship graph engine.
[ ] No source line navigation.
[ ] No source column navigation.
[ ] No YAML AST navigation.
[ ] No fake source spans.
[ ] No plugin UI.
[ ] No plugin execution.
[ ] No runtime behavior.
[ ] No ground behavior.
[ ] No live telemetry.
[ ] No command uplink.
[ ] No mission-control UI.
[ ] No scenario runner.
[ ] No arbitrary OrbitFabric CLI argument entry.
[ ] No arbitrary shell command.
[ ] No relationship records invented by Studio.
[ ] No synthetic nodes.
[ ] No synthetic edges.
```

---

## 13. Manual Verification Gate

Required local checks before final tag:

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
npm install
npm run build
npm run tauri:dev
```

Manual smoke test workspace:

```text
examples/demo-3u
```

Required manual checks before v0.4.0 release:

```text
[ ] Open workspace.
[ ] Verify Core version 1.0.0.
[ ] Run inspect mission.
[ ] Run lint mission.
[ ] Run export model-summary.
[ ] Run export entity-index.
[ ] Run export relationship-manifest.
[ ] Verify Contract Domains.
[ ] Verify Contract Entities.
[ ] Verify Relationship Manifest summary.
[ ] Verify relationship type summary.
[ ] Verify relationship records.
[ ] Verify total_relationships = 46 on demo-3u.
[ ] Verify relationship records are not inferred by Studio.
[ ] Verify from/to links resolve to existing entities when entity_index is available.
[ ] Verify fallback with missing relationship_manifest.
[ ] Verify fallback with Core without relationship-manifest.
[ ] Verify no graph, editing, arbitrary commands, dependency graph or runtime behavior exists.
```

---

## 14. Release Metadata Gate

Before tagging v0.4.0:

```text
[ ] package.json version is updated to 0.4.0.
[ ] package-lock.json version is updated to 0.4.0.
[ ] src-tauri/Cargo.toml version is updated to 0.4.0.
[ ] src-tauri/Cargo.lock version is updated to 0.4.0.
[ ] src-tauri/tauri.conf.json version is updated to 0.4.0.
[ ] README status is updated to v0.4.0 released.
[ ] CHANGELOG v0.4.0 entry is complete.
[ ] ROADMAP marks v0.4.0 as completed.
[ ] docs/releases/v0.4.0-release-notes.md exists.
[ ] GitHub release notes are prepared.
```

Version metadata and lockfiles must be updated together locally to avoid manual lockfile corruption.

---

## 15. Release Gate

```text
[ ] v0.4.0 can be tagged only after all technical and documentation gates are complete.
[ ] Scope non-goals remain true at the end of the milestone.
[ ] No source model write path exists.
[ ] No private relationship inference exists.
[ ] No dependency graph exists.
[ ] Core-derived provenance is visible for all relationship data.
[ ] Known limitations are documented.
```

Current state: planning baseline.
