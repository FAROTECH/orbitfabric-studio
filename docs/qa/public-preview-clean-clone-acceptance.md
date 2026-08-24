# OrbitFabric Studio — Public Preview Clean-Clone Acceptance

**Date:** 2026-08-24  
**Release candidate:** OrbitFabric Studio 0.15.0 Preview 1  
**Studio branch:** `reboot/studio-v1`  
**Studio acceptance head:** `ff5b64712aa5eed1ebe996681323421ae72551be`  
**Core baseline:** `47d37ec2c50eae40e13303eea900eb119bd2e0dd` / OrbitFabric 1.1.0  
**Host:** Debian 12 on the NewMac acceptance system

## Purpose

This record closes the README-only clean-clone gate for the first developer/source public preview.

The existing development clone was not used. Studio and Core were cloned into a new `/tmp/orbitfabric-studio-preview-*/` directory, and dependencies were installed from the documented lockfiles and pinned Core revision.

## Host prerequisites observed

```text
rustc 1.97.1
cargo 1.97.1
node 24.19.0
npm 11.17.0
Python 3.11.2
```

All Debian/Tauri packages listed in the README were already installed at the documented baseline or newer compatible Debian 12 revisions.

## README clarifications found during acceptance

Two ambiguities were corrected before continuing the acceptance run:

1. the unmerged release-candidate branch checkout now shows the explicit `git switch reboot/studio-v1` command;
2. the private-RC clone path now documents SSH authentication while preserving anonymous HTTPS as the post-publication path.

The clean clone was then completed from the updated README.

## Verification results

| Check | Result |
|---|---|
| `npm ci` | PASS — 95 packages installed |
| `npm audit --audit-level=low` | PASS — 0 vulnerabilities |
| `npm run test:logic` | PASS — 13/13 |
| `npm run build` | PASS |
| `cargo test --locked --manifest-path src-tauri/Cargo.toml` | PASS — 4/4 |
| `cargo check --locked --manifest-path src-tauri/Cargo.toml` | PASS |
| `npm run tauri -- build --debug --no-bundle` | PASS |
| Pinned Core install and version | PASS — OrbitFabric 1.1.0 |
| Real desktop launch and mission open | PASS |

The npm 11 `allow-scripts` warning for the pinned `esbuild@0.25.9` did not require an approval step: the TypeScript/Vite build and Tauri production-path build both completed successfully.

The existing Vite large-chunk warning remained non-blocking and unchanged.

## WebKit DMA-BUF observation

A plain `npm run tauri:dev` created an empty window on the NewMac and reported:

```text
KMS: DRM_IOCTL_MODE_CREATE_DUMB failed: Permission denied
Failed to create GBM buffer of size 1280x820: Permission denied
```

The README-documented fallback:

```bash
WEBKIT_DISABLE_DMABUF_RENDERER=1 npm run tauri:dev
```

rendered the launcher correctly and allowed the pinned Core and `demo-3u` mission to open normally.

This is a host WebKit/GBM rendering-path limitation. It does not alter Studio behavior, Core semantics or the release acceptance result.

## Decision

**PASS.** The Debian 12 README-only clean-clone gate is closed for OrbitFabric Studio 0.15.0 Preview 1.
