# OrbitFabric Studio v0.1.0 - Release Checklist

This checklist is the release gate for `v0.1.0 - Read-only Mission Project Viewer`.

The release is acceptable only if Studio can open and inspect a real OrbitFabric mission workspace without becoming a second model engine.

Primary loop:

```text
Open -> Inspect
```

---

## 1. Scope Discipline

```text
[x] v0.1.0 remains read-only.
[x] v0.1.0 does not implement visual model editing.
[x] v0.1.0 does not implement graph views.
[x] v0.1.0 does not implement scenario running.
[x] v0.1.0 does not implement generator workflows.
[x] v0.1.0 does not implement plugin support.
[x] v0.1.0 does not implement live telemetry.
[x] v0.1.0 does not implement command uplink.
[x] v0.1.0 does not imply ground segment behavior.
[x] v0.1.0 does not make unsupported compatibility claims.
```

---

## 2. Architecture Boundary

```text
[x] The Mission Model remains the source of truth.
[x] OrbitFabric Core remains authoritative for validation and generation.
[x] Studio remains downstream.
[x] The Adapter Layer remains presentation-only.
[x] Studio does not duplicate Core validation.
[x] Studio does not implement deep semantic parsing of Mission Model files.
[x] Missing machine-readable Core outputs are recorded as Core enhancement needs, not reimplemented inside Studio.
```

---

## 3. Implementation Stack

```text
[x] ADR-0006 exists and is accepted.
[x] Tauri 2 is used as the local desktop shell.
[x] React is used for the frontend.
[x] TypeScript is used for application code.
[x] Vite is used for frontend build tooling.
[x] Monaco Editor is used only in read-only mode if introduced.
[x] React Flow is not installed in v0.1.0.
```

---

## 4. Workspace Opening

```text
[x] Studio can open a local directory selected by the user.
[x] Studio does not create or modify workspace files on open.
[x] Studio can inspect an OrbitFabric mission directory conservatively.
[x] Studio handles a non-OrbitFabric directory without crashing.
[x] Studio clearly displays the selected workspace path.
```

---

## 5. Project Tree

```text
[x] Studio displays a project tree.
[x] Expected Mission Model files are detected when present.
[x] Scenario files are detected when present.
[x] Generated directories are detected when present.
[x] Missing optional files are not treated as semantic validation failures.
[x] File and directory classification remains structural, not semantic.
```

---

## 6. Read-only File Viewing

```text
[x] YAML files can be opened read-only.
[x] Markdown files can be opened read-only where supported.
[x] JSON/text outputs can be opened read-only where supported.
[x] No save action is exposed.
[x] No autosave or hidden write path exists.
[x] Generated outputs are not presented as editable source.
```

---

## 7. Source / Derived / Generated / UI-state Labels

```text
[x] Source model files are labeled as source model.
[x] Scenario files are labeled as scenario source.
[x] Core reports are labeled as derived reports.
[x] Generated outputs are labeled as generated outputs.
[x] Local UI state is not confused with Mission Model state.
```

---

## 8. Core Invocation

```text
[x] Studio can locate or configure the OrbitFabric Core executable.
[x] Studio can run `orbitfabric --version`.
[x] Studio can run one narrow inspection/status command where available.
[x] Studio displays command exit status.
[x] Studio displays stdout and stderr.
[x] Studio does not hide Core errors.
[x] Studio does not reinterpret command failure as model semantics.
```

---

## 9. Generated Artifact Discovery

```text
[x] Studio detects generated documentation directories if present.
[x] Studio detects generated report directories if present.
[x] Studio detects generated log directories if present.
[x] Studio detects generated runtime artifact directories if present.
[x] Generated artifact discovery is best-effort and does not imply artifacts must exist.
```

---

## 10. Documentation

```text
[x] README describes v0.1.0 accurately.
[x] CHANGELOG includes v0.1.0.
[x] ROADMAP remains aligned with the implemented scope.
[x] Architecture documents remain consistent with the implementation.
[x] v0.0.0 completion checklist is archived under docs/releases/.
[x] v0.1.0 release notes do not overclaim functionality.
```

---

## 11. Verification

```text
[x] TypeScript checks pass.
[x] Frontend build passes.
[x] Tauri build or development check is documented.
[x] Manual smoke test against a real OrbitFabric mission workspace is documented.
[x] Manual smoke test against a non-mission directory is documented.
[x] No fake demo data is required to demonstrate the release.
```

Verified manually against:

```text
/Users/farotech/DevDisk/ProgettiShared/orbitfabric/examples/demo-3u
```

Observed Core status output:

```text
orbitfabric 0.7.0
OrbitFabric Mission Inspection 0.7.0
Mission: demo-3u
Result: PASSED
```

---

## 12. Release Gate

```text
[x] v0.1.0 can be tagged after this release readiness PR is merged.
[x] GitHub release notes are prepared.
[x] Known limitations are documented.
```
