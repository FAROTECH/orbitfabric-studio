# Post v0.13.0 Studio Surface Cleanup

Status: completed and merged into the v0.13.0 tagged technical milestone.

This document records the cleanup pass performed after the v0.13.0 release-hardening merge and before deferring GitHub Release publication.

## Completed scope

- Renamed the temporary generated artifact explorer implementation by inlining the compact implementation back into `GeneratedArtifactExplorer.tsx`.
- Removed the temporary `GeneratedArtifactExplorerCompactV2.tsx` alias file.
- Moved Generated Artifacts from visual isolation toward a dedicated React surface.
- Added `GeneratedArtifactsSurface` as the dedicated surface wrapper.
- Reduced `releaseHardening.css` by moving generated artifact explorer rules into stable generated artifact explorer styles.
- Preserved the v0.13.0 QA-approved behavior.

## Preserved constraints

- No authoring.
- No graph editing.
- No private Mission Model inference.
- No telemetry live behavior.
- No command uplink behavior.
- No React Flow introduction.
- No generated artifact mutation.

## Validation checklist

- `npm run build` passes.
- `npm run tauri:dev` passes for manual QA.
- Home remains compact and not clipped.
- Mission Cockpit remains stable.
- Data Flow Workbench remains visually stable enough for v0.13.0.
- Generated Artifacts remains compact and read-only.
- Generated Artifacts no longer routes through the legacy workspace surface.
- Contacts & Downlink and Commandability keep conservative multi-domain aggregation.
- Autonomy remains reserved.

## Release publication note

The `v0.13.0` tag is valid as a technical milestone tag. GitHub Release publication is intentionally deferred until the documentation, roadmap and communication package are reviewed together.
