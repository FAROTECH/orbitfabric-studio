# E31 — Application Identity / App Icon / Packaging Assets Audit

## Decision

E31 intentionally does **not** activate Tauri bundling.

The current repository already has a coherent application identity for the public-preview baseline:

- application name: `OrbitFabric Studio`;
- npm package name: `orbitfabric-studio`;
- Tauri product name: `OrbitFabric Studio`;
- Tauri identifier: `io.orbitfabric.studio`;
- Rust package name: `orbitfabric-studio`;
- HTML document title: `OrbitFabric Studio`;
- version: `0.14.0`.

However, packaging is still intentionally inactive:

```json
"bundle": {
  "active": false
}
```

This is acceptable for the current baseline because Studio is still being stabilized as a local-first engineering workbench before a formal distributable package contract is introduced.

## Findings

### Identity metadata

The product identity is coherent across:

- `package.json`;
- `src-tauri/Cargo.toml`;
- `src-tauri/tauri.conf.json`;
- `index.html`;
- runtime UI copy.

The repository consistently uses `OrbitFabric Studio` as the application/product identity.

### Existing icon assets

The repository already contains application icon assets under:

- `src-tauri/icons/`;
- `assets/app-icon.png`.

The Tauri icon directory includes platform-oriented assets such as:

- `icon.png`;
- `icon.icns`;
- `icon.ico`;
- `32x32.png`;
- `128x128.png`;
- `128x128@2x.png`;
- Windows square logo PNGs;
- iOS icon PNGs;
- Android launcher PNGs.

These assets are present, but E31 does not certify them as final brand artwork. A visual review of the master icon and generated sizes should happen before packaging is activated.

### Bundle configuration

`src-tauri/tauri.conf.json` currently keeps bundling disabled.

This avoids accidentally treating the current app as a production distributable before the project has explicitly defined:

- target platforms;
- bundle targets;
- final icon master;
- signing expectations;
- macOS notarization expectations;
- release artifact naming;
- versioning policy;
- distribution channel.

## Policy

Application identity is considered stable enough for the public-preview baseline.

Packaging is **not** considered finalized.

Future packaging work must be done in a dedicated PR and should include:

- explicit bundle activation decision;
- verified icon master;
- generated icon set validation;
- macOS `.icns` validation;
- Windows `.ico` validation;
- Linux icon expectations, if Linux packaging is targeted;
- bundle target list;
- release artifact naming;
- build output inspection.

## Engineering boundaries

No runtime behavior changes are made in E31.

No Core/model-data behavior is changed.

No UI layout is changed.

No bundle activation is performed.

No generated icon files are rewritten in this PR.

## Follow-up

Recommended next packaging PR, when ready:

```text
E31b — Tauri Bundle Contract / Packaging Activation
```

That PR should explicitly decide whether to enable:

```json
"bundle": {
  "active": true
}
```

and should verify the generated platform artifacts before merge.
