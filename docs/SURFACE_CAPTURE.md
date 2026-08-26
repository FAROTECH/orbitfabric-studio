# Full-Surface Capture

OrbitFabric Studio can export the complete currently rendered mission workspace surface as a PNG.

The capture is intended for engineering documentation, review material and long Studio surfaces that extend beyond the visible window.

## Use

With a mission open, use either:

- the **Capture** button in the top bar; or
- `Ctrl+Shift+C` on Windows/Linux and `Cmd+Shift+C` on macOS.

The command captures the current workspace surface rather than the desktop or window chrome. Vertically scrollable content inside the captured surface is expanded for the export where possible.

The PNG is saved under:

```text
Downloads/OrbitFabric Studio Captures/
```

The generated filename includes the mission id, current Studio view, selected entity when present and a timestamp.

Studio also attempts to copy the PNG to the system clipboard. Clipboard availability is best-effort and does not affect file saving.

## Boundary

Surface capture is a presentation/export feature only.

It does not:

- change Mission Model source;
- create or infer mission semantics;
- alter Core-owned structured facts;
- write generated artifacts into the mission repository;
- include the surrounding desktop or unrelated application windows.

The captured image reflects the Studio surface as currently rendered from Core-owned mission facts.
