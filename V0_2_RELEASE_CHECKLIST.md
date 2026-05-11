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
[ ] v0.2.0 remains read-only.
[ ] v0.2.0 does not implement source model editing.
[ ] v0.2.0 does not implement graph views.
[ ] v0.2.0 does not implement scenario running.
[ ] v0.2.0 does not implement generator workflows.
[ ] v0.2.0 does not implement ground artifact generation UI.
[ ] v0.2.0 does not implement ground artifact explorer UI.
[ ] v0.2.0 does not implement plugin support.
[ ] v0.2.0 does not implement live telemetry.
[ ] v0.2.0 does not implement command uplink.
[ ] v0.2.0 does not imply ground segment behavior.
[ ] v0.2.0 does not make unsupported compatibility claims.
```

---

## 2. Architecture Boundary

```text
[ ] The Mission Model remains the source of truth.
[ ] OrbitFabric Core remains authoritative for validation and linting.
[ ] Studio remains downstream.
[ ] Studio does not duplicate Core validation.
[ ] Studio does not implement semantic YAML parsing.
[ ] Studio does not infer diagnostics from stdout when a Core JSON report exists.
[ ] Missing Core report fields are recorded as Core enhancement needs, not reimplemented inside Studio.
```

---

## 3. Core Baseline

```text
[ ] OrbitFabric Core v0.8.0 is treated as the planning baseline.
[ ] `orbitfabric --version` remains available as a fixed status command.
[ ] `orbitfabric inspect mission <mission_dir>` remains available as a fixed inspection command.
[ ] `orbitfabric lint <mission_dir> --json <path>` is the validation command consumed by v0.2.0.
[ ] `orbitfabric gen ground <mission_dir>` is acknowledged as a Core v0.8.0 feature.
[ ] `orbitfabric gen ground <mission_dir>` remains out of scope for Studio v0.2.0.
```

---

## 4. Controlled Command Invocation

```text
[ ] Lint invocation is fixed and allowlisted.
[ ] No arbitrary command execution is introduced.
[ ] No arbitrary CLI argument field is introduced.
[ ] The user can still see command, args, stdout, stderr and exit code.
[ ] Core command failures are not hidden.
[ ] A failed process is not reinterpreted as Mission Model semantics.
[ ] JSON report output is written to a Studio-controlled path.
[ ] Source Mission Model files are not modified.
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
[ ] The report is labeled as a derived report.
[ ] The report producer is shown as `orbitfabric-lint` when available.
[ ] The OrbitFabric Core version field is shown.
[ ] The Mission Model version field is shown separately.
[ ] Result values are displayed without redefining their meaning.
[ ] Summary counts are read from Core JSON.
[ ] Findings are read from Core JSON.
[ ] Studio does not invent missing fields.
```

---

## 6. Diagnostics Presentation

```text
[ ] Diagnostics summary displays errors, warnings and info counts from Core JSON.
[ ] Diagnostics list displays severity, code, message, domain, object ID and suggestion where available.
[ ] File references are shown only when provided by Core JSON.
[ ] Source file opening from a diagnostic is allowed only when the referenced file exists inside the selected workspace.
[ ] No fake line or column information is displayed.
[ ] No quick fix or suppression mechanism is introduced.
```

---

## 7. Source / Derived / Generated / Raw Output Labels

```text
[ ] Structural inspection remains labeled as Studio structural inspection.
[ ] Lint status remains labeled as Core validation/lint result.
[ ] JSON lint report remains labeled as Core JSON report / derived report.
[ ] stdout and stderr remain labeled as Core raw output.
[ ] Generated outputs remain distinct from source model files.
[ ] UI state is not confused with Mission Model state.
```

---

## 8. Compatibility with Core v0.8.0 Generated Areas

```text
[ ] Existing generated docs, reports, logs and runtime detection still works.
[ ] Presence of `generated/ground/generic/` does not break workspace inspection.
[ ] `generated/ground/generic/` is not promoted to a v0.2.0 UI workflow.
[ ] Ground artifacts are documented as future backlog for generated or ground artifact inspection.
```

---

## 9. Documentation

```text
[ ] README describes v0.2.0 accurately after implementation.
[ ] CHANGELOG includes v0.2.0.
[ ] ROADMAP remains aligned with the implemented scope.
[ ] ADR-0007 exists and is accepted.
[ ] Development notes describe the v0.2.0 slices.
[ ] Release notes are prepared before tagging.
[ ] Known limitations are documented.
```

---

## 10. Verification

```text
[ ] TypeScript checks pass.
[ ] Frontend build passes.
[ ] Tauri development run is checked locally.
[ ] Manual smoke test against a valid OrbitFabric mission workspace is documented.
[ ] Manual smoke test against a mission with lint findings is documented if available.
[ ] Manual smoke test for Core command failure is documented.
[ ] No generated local Tauri files are committed.
```

Recommended local checks:

```bash
git fetch
git checkout <branch>
git pull
npm run build
source "$HOME/.cargo/env"
npm run tauri:dev
```

---

## 11. Release Gate

```text
[ ] v0.2.0 can be tagged only after release readiness cleanup is merged.
[ ] GitHub release notes are prepared.
[ ] Scope non-goals are still true at the end of the milestone.
[ ] No source model write path exists.
[ ] No arbitrary command path exists beyond configured executable plus fixed command arguments.
```
