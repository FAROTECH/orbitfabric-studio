# OrbitFabric Studio — Public Preview Windows Acceptance

**Date:** 2026-08-24  
**Release candidate:** OrbitFabric Studio 0.15.0 Preview 1  
**Acceptance track:** `reboot/studio-v1` before final merge  
**Core baseline:** `47d37ec2c50eae40e13303eea900eb119bd2e0dd` / OrbitFabric 1.1.0  
**Host:** Windows 11

## Purpose

This record captures the additional Windows source-build and real-desktop acceptance completed for Preview 1.

Debian 12 remains the primary README-only clean-clone acceptance host. Ubuntu 22.04 remains the automated Rust/Tauri CI host. The Windows pass demonstrates that the same source preview builds and runs through the native Tauri/WebView2 path without changing the Core integration boundary.

## Host prerequisites observed

```text
PowerShell 7.6.5
Git 2.54.0
Node.js 24.17.0
npm 11.13.0
Python 3.12.10
Rust 1.96.0 (MSVC)
Visual Studio Build Tools 2022 / MSVC 14.44
Windows SDK 10.0.26100.0
```

The configured Core executable was:

```text
C:\Users\FabrizioRovelli\dev_of\orbitfabric\.venv\Scripts\orbitfabric.exe
```

Its reported version was `orbitfabric 1.1.0`.

## Verification results

| Check | Result |
|---|---|
| `npm ci` | PASS |
| `npm audit --audit-level=low` | PASS — 0 vulnerabilities |
| `npm run test:logic` | PASS |
| `npm run build` | PASS — only the accepted large-chunk warning |
| `cargo test --locked --manifest-path src-tauri/Cargo.toml` | PASS |
| `cargo check --locked --manifest-path src-tauri/Cargo.toml` | PASS |
| Real Tauri/WebView2 cold start | PASS |
| Configured pinned Core executable | PASS |
| Mission open, hydration and navigation | PASS |

The Unix-only timeout tests remain exercised by Debian/Ubuntu. The Windows Rust run covers the platform-neutral backend tests and is complemented by the real process/runtime acceptance above.

## Manual mission acceptance

The accumulated Windows acceptance covered:

- SpaceLab-inspired communications minislice, including the valid no-payload shape;
- `demo-3u`;
- OreSat-inspired minislice, including Validation, Operations and dense Relations;
- FINCH-inspired minislice, including high-degree Context Map behavior and duplicate textual IDs across domains.

The Context Map checks included root-neighborhood reconstruction, forward and inverse traversal, mixed-direction Context Path behavior, fan-out, deduplication and the absence of invented, missing or reversed rendered relationships.

Wide, Standard and Compact layouts were also exercised through the release acceptance sequence.

## Decision

**PASS.** Windows 11 is an additional source-build and real-desktop acceptance host for OrbitFabric Studio 0.15.0 Preview 1.

This does not turn Preview 1 into a packaged Windows release. Binary installers, Core sidecar packaging and signing remain explicitly deferred.
