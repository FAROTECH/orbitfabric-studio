# OrbitFabric Studio developer tools

Small local utilities used during Studio desktop QA.

## Location

These scripts should live in:

    tools/dev/

Suggested files:

    tools/dev/README.md
    tools/dev/resize-orbitfabric-studio.macos.sh
    tools/dev/resize-orbitfabric-studio.windows.ps1

## Resize Studio window on macOS

Start Studio first:

    npm run tauri:dev

Then, from the repository root:

    chmod +x tools/dev/resize-orbitfabric-studio.macos.sh
    ./tools/dev/resize-orbitfabric-studio.macos.sh 1440 900

## Resize Studio window on Windows

Start Studio first:

    npm run tauri:dev

Then, from PowerShell:

    powershell -ExecutionPolicy Bypass -File .\tools\dev\resize-orbitfabric-studio.windows.ps1 1440 900

## Notes

These scripts are only developer utilities.

They do not affect Studio runtime behavior, mission data, generated artifacts, or Core outputs.

Use them only to make desktop QA reproducible across macOS and Windows.
