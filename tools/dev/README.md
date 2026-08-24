# OrbitFabric Studio developer tools

This directory contains only small local helpers that are still useful to the rebooted Studio.

The active product does not depend on these scripts at runtime.

## Desktop resize helpers

The public-preview visual acceptance baseline uses three representative widths:

```text
Wide      1280 px
Standard   960 px
Compact    640 px
```

The canonical acceptance procedure is documented in:

```text
docs/qa/public-preview-visual-acceptance.md
```

### macOS

Start Studio first:

```bash
npm run tauri:dev
```

Then:

```bash
chmod +x tools/dev/resize-orbitfabric-studio.macos.sh
./tools/dev/resize-orbitfabric-studio.macos.sh 1280 900
```

Repeat with 960 and 640 width as required by the acceptance protocol.

### Windows

Start Studio first, then from PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\dev\resize-orbitfabric-studio.windows.ps1 1280 900
```

Repeat with 960 and 640 width as required.

## Linux

The primary manual preview acceptance is performed on the real Tauri application. Window sizing may be done with the desktop/window-manager facilities available on the test host; there is no Studio-specific Linux resize dependency.

## Boundary

These helpers modify only the desktop window size. They do not affect mission data, Core outputs, Studio selection, relationship semantics or generated files.
