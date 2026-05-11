# ADR-0007 - v0.2 Core-derived Validation Diagnostics

## Status

Accepted for v0.2.0 planning.

## Context

OrbitFabric Studio v0.1.0 established the first runnable desktop shell and the narrow product loop:

```text
Open -> Inspect
```

It can open a local OrbitFabric workspace, inspect files structurally, show read-only text files and run fixed Core status commands.

The next milestone is:

```text
v0.2.0 - Validation and Diagnostics Workbench
```

The intended loop becomes:

```text
Open -> Inspect -> Validate -> Understand
```

Validation must remain delegated to OrbitFabric Core.

Studio must not become a second validator, a semantic YAML parser or a private model engine.

OrbitFabric Core v0.8.0 provides the required baseline surface:

```text
orbitfabric lint <mission_dir> --json <path>
```

The generated lint JSON report is a derived report.

It is produced by Core from the Mission Model.

Studio may display it.

Studio must not invent diagnostics beyond it.

## Decision

For v0.2.0, Studio will consume OrbitFabric Core lint output through one fixed command:

```text
orbitfabric lint <mission_dir> --json <studio_controlled_report_path>
```

The command invocation remains allowlisted.

The frontend will not expose arbitrary CLI argument entry.

The report path will be controlled by Studio.

The UI will distinguish:

```text
Studio structural inspection
Core validation/lint result
Core JSON report
Core raw stdout/stderr/exit-code output
```

The Core JSON report is the only source of structured diagnostics in v0.2.0.

stdout and stderr remain visible for transparency and failure analysis.

stdout and stderr are not parsed as diagnostics when a JSON report is available.

## Core JSON Report Shape

The v0.2.0 planning baseline is the OrbitFabric Core v0.8.0 lint report shape:

```json
{
  "tool": "orbitfabric-lint",
  "version": "0.8.0",
  "mission": "demo-3u",
  "model_version": "0.1.0",
  "result": "passed",
  "loaded": {
    "spacecraft": 1,
    "subsystems": 4,
    "modes": 4,
    "mode_transitions": 0,
    "telemetry": 5,
    "commands": 4,
    "events": 4,
    "faults": 3,
    "packets": 3
  },
  "summary": {
    "errors": 0,
    "warnings": 0,
    "info": 0
  },
  "findings": []
}
```

Current result values are:

```text
passed
passed_with_warnings
failed
```

Each finding currently exposes:

```text
severity
code
file
domain
object_id
message
suggestion
```

The report currently does not expose:

```text
line
column
absolute source path
schema version
report timestamp
Git commit SHA
JSON Schema URL
```

Studio must not fake any of those fields.

## v0.2.0 Scope

The v0.2.0 implementation may include:

```text
fixed Core lint command invocation
Core raw output display
Core JSON report path display
Core JSON report parsing
validation summary panel
diagnostics count display
diagnostics list display
file reference display when Core provides a file field
read-only opening of referenced files when safely resolvable inside the workspace
```

The v0.2.0 implementation must not include:

```text
source model editing
graph view
scenario runner
generator workflow
ground artifact generation UI
ground artifact explorer UI
semantic YAML parsing
independent validation rules
stdout scraping when JSON exists
quick fixes
suppression mechanism
command uplink
live telemetry
ground segment behavior
arbitrary command execution
arbitrary Core CLI argument entry
```

## Handling Core Failures

If Core fails before writing a JSON report, Studio must show:

```text
command
args
exit code
stdout
stderr
JSON report unavailable status
```

Studio must not reinterpret that failure as a structured lint result.

A process failure is process evidence.

A Core JSON report is derived validation evidence.

They are related but not identical.

## File Reference Rule

If a finding contains a `file` field, Studio may attempt to resolve it relative to the selected mission directory or workspace.

A file reference may become clickable only if:

```text
the file field is present
the resolved path exists
the resolved path remains inside the selected workspace
the file type is supported by the read-only viewer
```

Studio must not infer a file from `domain`, `object_id` or message text.

Studio must not infer a line or column.

## Ground Integration Boundary

OrbitFabric Core v0.8.0 also introduces:

```text
orbitfabric gen ground <mission_dir>
generated/ground/generic/
ground_contract_manifest.json
JSON ground dictionaries
CSV ground dictionaries
ground_dictionaries.md
```

These features are acknowledged for compatibility.

They are not part of Studio v0.2.0.

Studio v0.2.0 must not become a ground artifact generator, ground artifact explorer, mission control system, operator console, telemetry archive, command uplink service or ground segment.

Ground-facing artifact inspection belongs to a future generated or ground artifact viewer milestone.

## Consequences

- v0.2.0 can provide useful diagnostics without semantic drift.
- Core remains the only authority for validation results.
- Studio becomes a diagnostics workbench, not a validator.
- Raw Core output remains available for debugging.
- Missing report fields become Core enhancement candidates.
- File navigation is limited to fields already provided by Core.

## Risks

- Users may interpret Studio diagnostics as Studio-owned validation.
- UI may encourage hidden inference from stdout or YAML.
- Missing line and column metadata may make diagnostics less precise.
- Core loading failures may not produce JSON.
- Ground artifacts from Core v0.8.0 may tempt scope expansion.

## Mitigations

- Label every diagnostics surface as Core-derived.
- Preserve raw stdout, stderr and exit code.
- Do not parse stdout when JSON is available.
- Do not display fake line or column references.
- Keep command invocation fixed and visible.
- Treat missing JSON as unavailable structured report, not as a parsed failure.
- Record ground artifacts as future backlog, not v0.2.0 scope.

## Review Trigger

Review this ADR before introducing:

```text
line or column diagnostic rendering
JSON Schema validation for reports
Core compatibility matrix
scenario diagnostics
generator workflows
ground artifact viewer
any editing or quick-fix workflow
any independent semantic parser inside Studio
```
