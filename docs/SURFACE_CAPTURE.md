# Full-Surface Capture

OrbitFabric Studio can export the complete currently rendered mission workspace surface as a PNG.

The capture is intended for engineering documentation, review material and long Studio surfaces that extend beyond the visible window.

## Use

With a mission open, use either:

- the **Capture** button in the top bar; or
- `Ctrl+Shift+C` on Windows/Linux and `Cmd+Shift+C` on macOS.

The command captures the current workspace surface rather than the desktop or window chrome. Vertically scrollable content inside the captured surface is expanded for export where practical.

The PNG is saved under:

```text
Downloads/OrbitFabric Studio Captures/
```

The generated filename includes the mission id, current Studio view, selected entity when present and a timestamp.

Studio also attempts to copy the PNG to the system clipboard. Clipboard availability is best-effort and does not affect file saving.

## Ordinary surfaces

Mission Atlas, Entity X-Ray and other non-graph workspace surfaces use `html-to-image@1.11.11` with explicit full-surface dimensions and a bounded pixel ratio.

## React Flow surfaces

Context Map and Operational State Map contain interactive React Flow content and therefore use a dedicated graph-capture path on Windows/WebView2.

Studio:

1. clones the complete workspace into an off-screen, content-sized document layout;
2. removes nested-scroll and viewport clipping from that clone;
3. renders the clone with `html2canvas@1.4.1`;
4. snapshots the live React Flow edge geometry before cloning;
5. composites edge paths, arrows and labels directly onto the final canvas;
6. discards the clone when export completes.

The capture preserves the graph layout already rendered by Studio; it does not recompute mission relationships or graph semantics for export.

The live graph is not replaced or mutated. Selection, pan/zoom, Mission Model state and Core-owned semantic facts remain unchanged.

A small capture-only tail reserve protects the final interactive row on long graph workspaces from bottom-edge clipping during WebView2/html2canvas export.

## Boundary

Surface capture is a presentation/export feature only.

It does not:

- change Mission Model source;
- create or infer mission semantics;
- alter Core-owned structured facts;
- write generated artifacts into the mission repository;
- include the surrounding desktop or unrelated application windows.

The captured image reflects the Studio surface as currently rendered from Core-owned mission facts.
