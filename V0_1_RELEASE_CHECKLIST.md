# OrbitFabric Studio v0.1.0 — Release Checklist

This checklist is the release gate for `v0.1.0 — Read-only Mission Project Viewer`.

The release is acceptable only if Studio can open and inspect a real OrbitFabric mission workspace without becoming a second model engine.

Primary loop:

```text
Open -> Inspect
```

---

## 1. Scope Discipline

```text
[ ] v0.1.0 remains read-only.
[ ] v0.1.0 does not implement visual model editing.
[ ] v0.1.0 does not implement graph views.
[ ] v0.1.0 does not implement scenario running.
[ ] v0.1.0 does not implement generator workflows.
[ ] v0.1.0 does not implement plugin support.
[ ] v0.1.0 does not implement live telemetry.
[ ] v0.1.0 does not implement command uplink.
[ ] v0.1.0 does not imply ground segment behavior.
[ ] v0.1.0 does not make unsupported compatibility claims.
```

---

## 2. Architecture Boundary

```text
[ ] The Mission Model remains the source of truth.
[ ] OrbitFabric Core remains authoritative for validation and generation.
[ ] Studio remains downstream.
[ ] The Adapter Layer remains presentation-only.
[ ] Studio does not duplicate Core validation.
[ ] Studio does not implement deep semantic parsing of Mission Model files.
[ ] Missing machine-readable Core outputs are recorded as Core enhancement needs, not reimplemented inside Studio.
```

---

## 3. Implementation Stack

```text
[ ] ADR-0006 exists and is accepted.
[ ] Tauri 2 is used as the local desktop shell.
[ ] React is used for the frontend.
[ ] TypeScript is used for application code.
[ ] Vite is used for frontend build tooling.
[ ] Monaco Editor is used only in read-only mode if introduced.
[ ] React Flow is not installed in v0.1.0.
```

---

## 4. Workspace Opening

```text
[ ] Studio can open a local directory selected by the user.
[ ] Studio does not create or modify workspace files on open.
[ ] Studio can inspect an OrbitFabric mission directory conservatively.
[ ] Studio handles a non-OrbitFabric directory without crashing.
[ ] Studio clearly displays the selected workspace path.
```

---

## 5. Project Tree

```text
[ ] Studio displays a project tree.
[ ] Expected Mission Model files are detected when present.
[ ] Scenario files are detected when present.
[ ] Generated directories are detected when present.
[ ] Missing optional files are not treated as semantic validation failures.
[ ] File and directory classification remains structural, not semantic.
```

---

## 6. Read-only File Viewing

```text
[ ] YAML files can be opened read-only.
[ ] Markdown files can be opened read-only where supported.
[ ] JSON/text outputs can be opened read-only where supported.
[ ] No save action is exposed.
[ ] No autosave or hidden write path exists.
[ ] Generated outputs are not presented as editable source.
```

---

## 7. Source / Derived / Generated / UI-state Labels

```text
[ ] Source model files are labeled as source model.
[ ] Scenario files are labeled as scenario source.
[ ] Core reports are labeled as derived reports.
[ ] Generated outputs are labeled as generated outputs.
[ ] Local UI state is not confused with Mission Model state.
```

---

## 8. Core Invocation

```text
[ ] Studio can locate or configure the OrbitFabric Core executable.
[ ] Studio can run `orbitfabric --version`.
[ ] Studio can run one narrow inspection/status command where available.
[ ] Studio displays command exit status.
[ ] Studio displays stdout and stderr.
[ ] Studio does not hide Core errors.
[ ] Studio does not reinterpret command failure as model semantics.
```

---

## 9. Generated Artifact Discovery

```text
[ ] Studio detects generated documentation directories if present.
[ ] Studio detects generated report directories if present.
[ ] Studio detects generated log directories if present.
[ ] Studio detects generated runtime artifact directories if present.
[ ] Generated artifact discovery is best-effort and does not imply artifacts must exist.
```

---

## 10. Documentation

```text
[ ] README describes v0.1.0 accurately.
[ ] CHANGELOG includes v0.1.0.
[ ] ROADMAP remains aligned with the implemented scope.
[ ] Architecture documents remain consistent with the implementation.
[ ] v0.0.0 completion checklist is archived under docs/releases/.
[ ] v0.1.0 release notes do not overclaim functionality.
```

---

## 11. Verification

```text
[ ] TypeScript checks pass.
[ ] Frontend build passes.
[ ] Tauri build or development check is documented.
[ ] Manual smoke test against a real OrbitFabric mission workspace is documented.
[ ] Manual smoke test against a non-mission directory is documented.
[ ] No fake demo data is required to demonstrate the release.
```

---

## 12. Release Gate

```text
[ ] v0.1.0 can be tagged.
[ ] GitHub release notes are prepared.
[ ] Known limitations are documented.
```
