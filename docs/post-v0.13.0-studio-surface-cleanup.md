# Post v0.13.0 Studio Surface Cleanup

This branch starts the follow-up cleanup after the v0.13.0 release-hardening merge.

## Scope

- Rename `GeneratedArtifactExplorerCompactV2.tsx` to a stable component name.
- Remove the temporary re-export wrapper from `GeneratedArtifactExplorer.tsx`.
- Move Generated Artifacts from visual isolation toward a dedicated React surface.
- Reduce `releaseHardening.css` by moving durable layout rules into stable surface styles.
- Preserve the v0.13.0 QA-approved behavior.

## Constraints

- No authoring.
- No graph editing.
- No private Mission Model inference.
- No telemetry live behavior.
- No command uplink behavior.
- No React Flow introduction in this cleanup PR.

## Validation checklist

- `npm run build` passes.
- Home remains compact and not clipped.
- Mission Cockpit does not render the Workbench below it.
- Data Flow Workbench remains visually stable.
- Generated Artifacts remains compact and read-only.
- Contacts & Downlink and Commandability keep conservative multi-domain aggregation.
- Autonomy remains reserved.
