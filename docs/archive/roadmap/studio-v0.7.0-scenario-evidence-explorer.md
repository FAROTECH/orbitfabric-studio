# OrbitFabric Studio v0.7.0
# Scenario Evidence Explorer

## 1. Purpose

This milestone introduces the Scenario Evidence Explorer as the first Studio surface dedicated to deterministic scenario evidence produced by OrbitFabric Core.

The goal is to make scenario sources, Core-produced scenario outputs, reports, logs, expectations and evidence records inspectable through the existing v0.6.0 Studio application shell.

Studio remains downstream from OrbitFabric Core.

Studio must not simulate mission behavior independently.

Studio must not become mission control, a live telemetry dashboard, a command uplink console, a spacecraft simulator, a runtime interface or a ground segment.

The correct implementation pattern remains:

```text
OrbitFabric Core emits structured scenario outputs.
Studio consumes and renders them.
```

The incorrect implementation pattern remains:

```text
Studio invents scenario behavior because Core output is missing.
```

## 2. Baseline

This milestone starts from the released v0.6.0 baseline:

```text
v0.6.0 - Studio Information Architecture & UX Foundation
```

The v0.6.0 baseline provides:

```text
application shell
workspace header
primary navigation
main surface
workspace dashboard
provenance, status and severity badges
normalized read-only surfaces
contextual inspector
Generated Artifact Explorer
reserved Scenario Evidence surface
reserved Ground Integration surface
graph visualization boundary
read-only boundary polish
```

The v0.6.0 baseline does not provide:

```text
scenario execution
scenario evidence domain logic
scenario report parsing
scenario timeline rendering
expectation result rendering
scenario coverage
mission health scoring
graph UI
authoring
editing
plugin-aware surfaces
```

## 3. Goal

v0.7.0 answers:

```text
Which scenario sources exist in this workspace?
Which scenario evidence outputs were produced by Core?
What was the scenario result according to Core?
Which expectations passed or failed according to Core?
What timeline and evidence records did Core report?
Which reports and logs are associated with the scenario?
```

v0.7.0 does not answer:

```text
What is the live state of the spacecraft?
What command should be uplinked?
What is the current telemetry stream?
What does a private Studio simulator predict?
What coverage percentage exists unless Core reports it?
```

## 4. Product loop

The v0.7.0 product loop is:

```text
Open workspace
  -> list scenario sources
  -> inspect scenario source read-only
  -> run a fixed Core scenario command only if the Core command is real and documented
  -> load Core-produced scenario report
  -> inspect scenario status
  -> inspect expectations
  -> inspect timeline and evidence records
  -> preview associated report and log files read-only
  -> inspect selected evidence in the contextual inspector
```

If the fixed Core scenario command is not yet available, v0.7.0 must stop at passive scenario source and evidence artifact inspection.

## 5. Source, evidence, report and log boundaries

Studio must preserve the following categories:

```text
scenario source
  User-authored scenario YAML under the workspace scenarios area.

Core-derived evidence
  Structured scenario result and evidence records emitted by OrbitFabric Core.

report
  JSON or text report produced by a fixed Core command or present under generated reports.

log
  Text log produced by a fixed Core command or present under generated logs.

generated output
  Disposable output under generated/ that may be previewed read-only when supported.

UI state
  Local Studio selection, filtering and preview state.
```

Studio must not merge these categories into one ambiguous object.

Every major scenario object must clearly expose whether it is:

```text
SOURCE
SCENARIO SOURCE
CORE-DERIVED
SCENARIO EVIDENCE
REPORT
LOG
GENERATED
READ-ONLY
PREVIEW ONLY
UNKNOWN
```

## 6. Required Core outputs

The following outputs are required for a serious Scenario Evidence Explorer.

They are expected Core outputs for this milestone. Studio must not fabricate them.

### 6.1 Scenario source files

Studio already detects scenario YAML files structurally.

Minimum fields available to Studio before Core execution:

```text
name
path
kind
category = scenarioSource
```

Allowed Studio behavior:

```text
list scenario files
preview scenario YAML read-only
select scenario source in the inspector
show SOURCE, SCENARIO SOURCE and READ-ONLY badges
```

Forbidden Studio behavior:

```text
parse scenario YAML semantically
infer scenario expectations
infer affected model entities
infer scenario status
```

### 6.2 Controlled Core scenario command

Scenario execution may be exposed only if OrbitFabric Core provides a real, fixed command.

The command must be invoked through a dedicated Tauri command, not through arbitrary CLI argument entry.

The concrete command shape must be verified against OrbitFabric Core before implementation.

Candidate shape, not an implementation commitment:

```text
orbitfabric sim <scenario_file> --json <scenario_report_path>
```

or another documented Core command with equivalent structured output.

Required constraints:

```text
fixed command name
fixed argument structure
workspace-contained scenario file
Studio-controlled report path
no arbitrary command string
no arbitrary argument entry
raw stdout, stderr and exit code remain visible
```

### 6.3 Scenario report JSON

A scenario report should provide at least:

```text
kind
report_version
orbitfabric_version
mission identity
scenario identity
scenario source reference
result or status
summary counts
expectations
passed expectations
failed expectations
timeline or timeline reference
evidence records or evidence records reference
associated report/log paths, if available
boundary metadata
```

Recommended kind:

```text
orbitfabric.scenario_report
```

The exact schema must be accepted before TypeScript parsing is added.

### 6.4 Scenario timeline

The timeline may be a section inside `scenario_report.json` or a separate Core output.

The timeline should contain ordered records such as:

```text
record id
time or step index
type
label
status
message
related evidence record ids
safe references, if available
```

Studio must not synthesize a timeline from raw logs.

### 6.5 Scenario evidence records

Evidence records should be structured enough to support:

```text
expectation evaluations
events
telemetry effects
mode changes
produced data products
expected data products
warnings or failures
safe references to Mission Model entities, if available
```

Recommended separate output, if Core chooses to emit one:

```text
scenario_evidence_records.json
```

The evidence records may also be embedded in the scenario report.

### 6.6 Scenario logs

Logs should be loaded only as read-only text artifacts.

Studio may preview logs when they are:

```text
workspace-contained
text
size-bounded
reported by Core or present in generated/logs/
```

Studio must not parse logs as structured evidence when JSON evidence exists or is expected.

### 6.7 Safe references

Links from scenario evidence to source files, model entities, reports or logs require explicit Core-provided references.

Allowed references:

```text
source_file
domain
object_id
entity id
report path
log path
evidence record id
timeline record id
```

Forbidden references:

```text
frontend-inferred ids
filename heuristics for model entities
raw YAML scanning
line or column jumps without Core metadata
relationship inference not present in Core output
```

### 6.8 Boundary metadata

Scenario outputs should state what they contain and what they do not contain.

Recommended boundary flags:

```text
source_of_truth
core_derived_report
read_only
contains_scenario_report
contains_scenario_evidence
contains_scenario_timeline
contains_live_telemetry
contains_command_uplink
contains_runtime_behavior
contains_ground_behavior
contains_private_simulation
contains_graph
contains_coverage_summary
```

This prevents Studio from implying live operations or unsupported semantics.

## 7. Candidate UI surfaces

The Scenario Evidence Explorer should fit the v0.6.0 shell.

Candidate sub-surfaces:

```text
Scenario Sources
Scenario Execution Status
Scenario Report Summary
Expectations
Timeline
Evidence Records
Events
Telemetry Effects
Mode Changes
Data Products
Reports and Logs
Raw Scenario JSON
```

The surface may start with a limited subset if Core output is not yet complete.

## 8. Scenario list

The scenario list is the safest first implementation step.

Data source:

```text
WorkspaceInspection.scenario_files
```

Allowed:

```text
show scenario name
show path
show source category
open read-only preview
select in inspector
show empty state when no scenarios exist
```

Forbidden:

```text
infer scenario title
infer scenario expected behavior
infer expected telemetry or events
infer pass/fail status
```

## 9. Scenario execution

Scenario execution is allowed only through Core.

If implemented, the button must be disabled unless all conditions are true:

```text
workspace is open
mission directory exists
scenario source is selected
Core scenario command is implemented in backend
Core scenario command has a fixed argument shape
report output path is Studio-controlled
```

The button label must not imply mission control.

Allowed labels:

```text
Run Core scenario
Run scenario through Core
```

Forbidden labels:

```text
Execute mission
Send command
Start simulation
Run spacecraft
```

If Core command support is not available, Studio must show a reserved or unavailable state.

## 10. Scenario report loading

Scenario reports may be loaded through either:

```text
the result of a controlled Core scenario command
existing generated reports discovered in generated/
```

Studio may parse only recognized report shapes.

Unrecognized reports must remain preview-only.

A recognized report requires:

```text
kind
version
scenario identity
result/status
schema-conforming expectations or evidence records
```

## 11. Expectations

Expectations must come from Core report or evidence records.

Allowed fields:

```text
id
description
status
message
related evidence ids
safe references, if available
```

Expected status values should be treated as display data unless the schema defines a stricter enum.

Studio may group expectations as:

```text
passed
failed
warning or skipped, if Core reports them
unknown, if Core reports them
```

Studio must not decide pass or fail independently.

## 12. Timeline

Timeline records must come from Core.

Allowed display:

```text
ordered list
step index
timestamp or logical time, if provided
type
status
summary
linked evidence id
```

Studio must not create an animation, live playback or operational timeline.

## 13. Evidence records

Evidence records must be rendered according to their Core-reported type.

Initial categories may include:

```text
event
telemetry_effect
mode_change
data_product
expectation
note
warning
failure
unknown
```

Unknown record types must remain visible as unknown.

Studio must not hide unknown Core evidence records.

Studio must not assign private engineering meaning to unknown evidence records.

## 14. Reports and logs

Reports and logs remain preview-only artifacts unless parsed as recognized Core scenario reports.

Allowed:

```text
show file name
show relative path
show report/log provenance
open supported text previews
show raw JSON
show raw logs
```

Forbidden:

```text
parse logs as evidence
treat logs as source of truth over structured Core report
mutate files
delete files
regenerate files
```

## 15. Inspector behavior

The contextual inspector should support:

```text
selected scenario source
selected scenario report
selected timeline record
selected expectation
selected evidence record
selected event
selected telemetry effect
selected mode change
selected data product record
selected scenario log
```

The inspector must show:

```text
identity
provenance
status
source reference, if safe
report/log references, if safe
raw metadata
boundary notes
```

It must not invent relationships.

## 16. Explicit non-goals

v0.7.0 explicitly excludes:

```text
no private scenario runner
no private scenario simulation
no dynamic spacecraft simulator
no orbital simulation
no RF simulation
no payload physics simulation
no mission control behavior
no command uplink
no live telemetry
no telemetry archive
no live runtime execution
no ground behavior
no graph UI
no React Flow
no coverage percentages invented by Studio
no mission health scoring
no authoring
no editing
no source mutation
no generated artifact mutation
no arbitrary command execution
no arbitrary OrbitFabric CLI argument entry
no private YAML semantic parser
no private relationship inference
```

## 17. Relation to v0.7.1

Coverage and dashboard metrics belong to v0.7.1 unless Core already exposes explicit summaries and the scope is deliberately narrowed.

v0.7.0 should not implement:

```text
scenario coverage card
model completeness percentage
data product coverage percentage
commandability coverage percentage
contract health score
mission health score
```

Those require Core-derived summaries.

## 18. Relation to v0.8.0

Ground Integration Artifact Viewer remains v0.8.0.

Scenario evidence may mention produced or expected data products if Core reports them.

Scenario evidence must not turn into ground integration behavior.

## 19. Acceptance criteria

v0.7.0 is complete when Studio can:

```text
1. list scenario source files detected in the workspace;
2. preview scenario source files read-only;
3. distinguish scenario source, Core-derived evidence, reports, logs, generated output and UI state;
4. execute a scenario only through a fixed, documented OrbitFabric Core command, if that command is available;
5. load recognized Core-produced scenario report JSON;
6. display scenario result/status from Core output;
7. display expectations from Core output;
8. distinguish passed and failed expectations only as reported by Core;
9. display timeline records from Core output;
10. display evidence records from Core output;
11. show events, telemetry effects, mode changes and data product records only if Core provides them;
12. preview associated report and log files read-only;
13. drive the contextual inspector from selected scenario/evidence/report/log objects;
14. preserve raw stdout, stderr, exit code and raw JSON/log transparency;
15. avoid all private simulation, mission control, command uplink, live telemetry, graph, coverage and editing behavior.
```

## 20. Risks and mitigations

### Risk: Studio becomes a private scenario simulator

Mitigation:

```text
Only run fixed Core commands.
Never interpret scenario YAML semantically in Studio.
Never compute scenario outcomes in Studio.
```

### Risk: logs become evidence

Mitigation:

```text
Logs remain preview-only.
Structured JSON reports and evidence records are the only evidence source.
```

### Risk: scenario run UI looks like mission control

Mitigation:

```text
Use Core scenario/evidence wording.
Avoid operational labels.
Avoid live-looking controls.
Avoid command uplink language.
```

### Risk: coverage appears before Core supports it

Mitigation:

```text
Move coverage to v0.7.1.
Render coverage only from Core-derived summaries.
```

### Risk: unknown evidence records are hidden

Mitigation:

```text
Keep unknown records visible.
Mark them UNKNOWN or PREVIEW ONLY.
Do not assign private semantics.
```

## 21. Suggested PR sequence

The recommended implementation sequence is documented separately in:

```text
docs/roadmap/studio-v0.7.0-pr-plan.md
```

## 22. Final milestone statement

v0.7.0 turns Scenario Evidence into an inspectable Studio surface only where Core provides structured scenario evidence.

It does not expand Studio authority.

It makes deterministic Core scenario evidence easier to inspect, navigate and explain while preserving the boundary between source scenario files, Core-derived evidence, generated reports, logs and local UI state.
