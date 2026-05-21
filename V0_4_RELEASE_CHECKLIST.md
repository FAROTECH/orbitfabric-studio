# OrbitFabric Studio v0.4.0 Release Checklist

Release: `v0.4.0 - Relationship Surface`

Status: release hardening complete

## Final Release Gates

```text
[x] README describes v0.4.0 as the released Relationship Surface milestone.
[x] ROADMAP marks v0.4.0 as completed.
[x] CHANGELOG contains a complete v0.4.0 release entry.
[x] docs/releases/v0.4.0-release-notes.md exists.
[x] Fixed Tauri command run_core_export_relationship_manifest exists.
[x] Relationship manifest TypeScript model exists.
[x] Relationship manifest parser exists.
[x] Run export relationship-manifest action exists.
[x] Relationship Manifest summary exists.
[x] Boundary labels exist.
[x] Relationship type summary exists.
[x] Relationship type filters exist.
[x] Relationship records navigation exists.
[x] Relationship record filters exist.
[x] Read-only relationship detail panel exists.
[x] Core provenance is explained.
[x] derived_from.model_field is displayed.
[x] Studio did not infer the relationship.
[x] The relationship is not runtime behavior.
[x] The relationship is not ground behavior.
[x] The relationship is not a dependency graph edge.
```

## Non-goal Gate

```text
[x] No editing.
[x] No visual model editing.
[x] No semantic YAML parser.
[x] No private relationship inference.
[x] No private graph semantics.
[x] No dependency graph.
[x] No relationship graph engine.
[x] No source line navigation.
[x] No source column navigation.
[x] No YAML AST navigation.
[x] No fake source spans.
[x] No plugin UI.
[x] No plugin execution.
[x] No runtime behavior.
[x] No ground behavior.
[x] No live telemetry.
[x] No command uplink.
[x] No mission-control UI.
[x] No scenario runner.
[x] No arbitrary OrbitFabric CLI argument entry.
[x] No arbitrary shell command.
[x] No relationship records invented by Studio.
[x] No synthetic nodes.
[x] No synthetic edges.
```

## Manual Verification Gate

```text
[x] npm run build.
[x] npm run tauri:dev.
[x] Open examples/demo-3u.
[x] Verify Core version 1.0.0.
[x] Run inspect mission.
[x] Run lint mission.
[x] Run export model-summary.
[x] Run export entity-index.
[x] Run export relationship-manifest.
[x] Verify Contract Domains.
[x] Verify Contract Entities.
[x] Verify Relationship Manifest summary.
[x] Verify relationship type summary.
[x] Verify relationship records.
[x] Verify total_relationships = 46 on demo-3u.
[x] Verify selected relationship explanation panel.
[x] Verify no graph, editing, arbitrary commands, dependency graph or runtime behavior exists.
```

## Release Metadata Gate

```text
[x] package.json version is updated to 0.4.0.
[x] package-lock.json version is updated to 0.4.0.
[x] src-tauri/Cargo.toml version is updated to 0.4.0.
[x] src-tauri/Cargo.lock version is updated to 0.4.0.
[x] src-tauri/tauri.conf.json version is updated to 0.4.0.
[x] README status is updated to v0.4.0 released.
[x] CHANGELOG v0.4.0 entry is complete.
[x] ROADMAP marks v0.4.0 as completed.
[x] docs/releases/v0.4.0-release-notes.md exists.
[x] GitHub release notes are prepared.
```

Current state: ready for v0.4.0 tag after release hardening PR merge.
