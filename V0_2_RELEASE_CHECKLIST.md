# OrbitFabric Studio v0.2.0 - Release Checklist

This checklist is the release gate for `v0.2.0 - Validation and Diagnostics Workbench`.

The release is acceptable only if Studio can run OrbitFabric Core validation through fixed commands and display Core-derived diagnostics without becoming a second validator.

Primary loop:

```text
Open -> Inspect -> Validate -> Understand
```

---

## 1. Scope Discipline

```text
[x] v0.2.0 remains read-only.
[x] v0.2.0 does not implement source model editing.
[x] v0.2.0 does not implement graph views.
[x] v0.2.0 does not implement scenario running.
[x] v0.2.0 does not implement generator workflows.
[x] v0.2.0 does not implement ground artifact generation UI.
[x] v0.2.0 does not implement ground artifact explorer UI.
[x] v0.2.0 does not implement plugin support.
[x] v0.2.0 does not implement live telemetry.
[x] v0.2.0 does not implement command uplink.
[x] v0.2.0 does not imply ground segment behavior.
[x] v0.2.0 does not make unsupported compatibility claims.
```

---

## 2. Architecture Boundary

```text
[x] The Mission Model remains the source of truth.
[x] OrbitFabric Core remains authoritative for validation and linting.
[x] Studio remains downstream.
[x] Studio does not duplicate Core validation.
[x] Studio does not implement semantic YAML parsing.
[x] Studio does not infer diagnostics from stdout when a Core JSON report exists.
[x] Missing Core report fields are recorded as Core enhancement needs, not reimplemented inside Studio.
```

---

## 3. Core Baseline

```text
[x] OrbitFabric Core v0.8.0 is treated as the planning baseline.
[x] `orbitfabric --version` remains available as a fixed status command.
[x] `orbitfabric inspect mission <mission_dir>` remains available as a fixed inspection command.
[x] `orbitfabric lint <mission_dir> --json <path>` is the validation command consumed by v0.2.0.
[x] `orbitfabric gen ground <mission_dir>` is acknowledged as a Core v0.8.0 feature.
[x] `orbitfabric gen ground <mission_dir>` remains out of scope for Studio v0.2.0.
```

---

## 4. Controlled Command Invocation

```text
[x] Lint invocation is fixed and allowlisted.
[x] No arbitrary command execution is introduced.
[x] No arbitrary CLI argument field is introduced.
[x] The user can still see command, args, stdout, stderr and exit code.
[x] Core command failures are not hidden.
[x] A failed process is not reinterpreted as Mission Model semantics.
[x] JSON report output is written to a Studio-controlled path.
[x] Source Mission Model files are not modified.
```

---

## 5. Core JSON Report Handling

The v0.2.0 lint report surface consumes the Core JSON report shape documented by OrbitFabric v0.8.0:

```text
tool
version
mission
model_version
result
loaded
summary
findings
```

```text
[x] The report is labeled as a derived report.
[x] The report producer is shown as `orbitfabric-lint` when available.
[x] The OrbitFabric Core version field is shown.
[x] The Mission Model version field is shown separately.
[x] Result values are displayed without redefining their meaning.
[x] Summary counts are read from Core JSON.
[x] Findings are read from Core JSON.
[x] Studio does not invent missing fields.
```

---

## 6. Diagnostics Presentation

```text
[x] Diagnostics summary displays errors, warnings and info counts from Core JSON.
[x] Diagnostics list displays severity, code, message, domain, object ID and suggestion where available.
[x] File references are shown only when provided by Core JSON.
[x] Source file opening from a diagnostic is allowed only when the referenced file exists inside the selected workspace.
[x] No fake line or column information is displayed.
[x] No quick fix or suppression mechanism is introduced.
```

---

## 7. Source / Derived / Generated / Raw Output Labels

```text
[x] Structural inspection remains labeled as Studio structural inspection.
[x] Lint status remains labeled as Core validation/lint result.
[x] JSON lint report remains labeled as Core JSON report / derived report.
[x] stdout and stderr remain labeled as Core raw output.
[x] Generated outputs remain distinct from source model files.
[x] UI state is not confused with Mission Model state.
```

---

## 8. Compatibility with Core v0.8.0 Generated Areas

```text
[x] Existing generated docs, reports, logs and runtime detection still works.
[x] Presence of `generated/ground/generic/` does not break workspace inspection.
[x] `generated/ground/generic/` is not promoted to a v0.2.0 UI workflow.
[x] Ground artifacts are documented as future backlog for generated or ground artifact inspection.
```

---

## 9. Documentation

```text
[x] README describes v0.2.0 accurately after implementation.
[x] CHANGELOG includes v0.2.0.
[x] ROADMAP remains aligned with the implemented scope.
[x] ADR-0007 exists and is accepted.
[x] Development notes describe the v0.2.0 slices.
[x] Release notes are prepared before tagging.
[x] Known limitations are documented.
```

---

## 10. Verification

```text
[x] TypeScript checks pass.
[x] Frontend build passes.
[x] Tauri development run is checked locally.
[x] Manual smoke test against a valid OrbitFabric mission workspace is documented.
[x] Manual smoke test against a mission with lint findings is documented if available.
[x] Manual smoke test for Core command failure is documented as final pre-tag check.
[x] No generated local Tauri files are committed.
```

Recommended local checks:

```bash
git fetch
git checkout main
git pull
npm run build
source "$HOME/.cargo/env"
npm run tauri:dev
```

Manual positive-path tests performed:

```text
examples/demo-3u
examples/spacelab-inspired-communications-minislice
```

Manual failure-path final check before tagging:

```text
Configure an invalid OrbitFabric executable path.
Run a fixed Core command.
Confirm command, args, failure evidence and error text remain visible.
Confirm no structured diagnostics are invented when no Core JSON report exists.
Restore the valid OrbitFabric executable path.
```

---

## 11. Release Gate

```text
[x] v0.2.0 can be tagged after this release-state finalization is merged.
[x] GitHub release notes are prepared.
[x] Scope non-goals are still true at the end of the milestone.
[x] No source model write path exists.
[x] No arbitrary command path exists beyond configured executable plus fixed command arguments.
```

---

## 12. Version Metadata Review

Version metadata has been reviewed coherently across:

```text
[x] package.json
[x] package-lock.json
[x] src-tauri/Cargo.toml
[x] src-tauri/Cargo.lock
[x] src-tauri/tauri.conf.json
```

All version metadata is aligned to:

```text
0.2.0
```

This checklist is complete for v0.2.0 tagging after merge of the final release-state PR.
