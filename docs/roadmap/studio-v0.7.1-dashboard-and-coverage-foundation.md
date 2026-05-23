# OrbitFabric Studio v0.7.1
# Dashboard and Coverage Foundation

## 1. Purpose

This milestone introduces the first Core-derived dashboard and coverage foundation for OrbitFabric Studio.

Studio v0.7.1 exists to make Core-owned dashboard, scenario run and coverage reports inspectable without moving coverage semantics into Studio.

Studio remains downstream from OrbitFabric Core.

The correct implementation pattern remains:

```text
OrbitFabric Core emits structured outputs.
Studio consumes and renders them.
```

The incorrect implementation pattern remains:

```text
Studio invents dashboard or coverage semantics because the UI needs a value.
```

## 2. Baseline

This milestone starts from the released Studio baseline:

```text
v0.7.0 - Scenario Evidence Explorer
```

The v0.7.0 baseline already provides:

```text
application shell
workspace header
primary navigation
workspace dashboard
contextual inspector
Generated Artifact Explorer
Scenario Evidence Explorer
controlled Core scenario execution
simulation JSON report parsing
simulation timeline, events, commands and mode transition rendering
data-flow evidence rendering
failed expectation rendering
plain-text simulation log preview linkage
```

The v0.7.0 baseline does not provide:

```text
dashboard-summary consumption
scenario-run-index consumption
coverage-summary consumption
structured expectation accounting rendering
coverage cards
coverage gap navigation
coverage detail inspection
```

## 3. Core readiness after post-v1 Core PRs

OrbitFabric Core main now exposes candidate post-v1 structured surfaces for Studio v0.7.1.

The relevant Core surfaces are:

```text
dashboard_summary.json
scenario_run_index.json
extended orbitfabric-sim simulation JSON report
coverage_summary.json
```

These surfaces remain Core-owned and candidate post-v1 outputs.

Studio may consume them only as Core-derived reports.

Studio must not treat them as a Studio-specific API.

## 4. Core surfaces consumed

### 4.1 Dashboard summary

Command:

```bash
orbitfabric export dashboard-summary <mission_dir> --json <path>
```

Expected report identity:

```text
kind: orbitfabric.dashboard_summary
dashboard_version: 0.1-candidate
```

Studio may render:

```text
mission identity
validation summary
model domain inventory
entity inventory
relationship inventory
coverage official unavailable state, when present
boundary flags
```

Studio must not derive model completeness from domain presence.

Studio must not derive mission health from lint status.

### 4.2 Scenario run index

Command:

```bash
orbitfabric export scenario-run-index --simulation-reports <dir> --json <path>
```

Expected report identity:

```text
kind: orbitfabric.scenario_run_index
index_version: 0.1-candidate
```

Studio may render:

```text
scenario run count
passed scenario run count
failed scenario run count
scenario run records
report path references
summary counts from simulation reports
```

The index counts report files and runs.

Studio must not deduplicate by scenario id unless Core later emits a dedicated deduplication field.

Studio must not read plain-text logs for this index.

### 4.3 Extended simulation JSON report

Existing producer:

```text
tool: orbitfabric-sim
```

New expectation accounting fields now available in Core simulation JSON reports:

```text
summary.expectations
summary.passed_expectations
summary.failed_expectations
expectations.total
expectations.passed
expectations.failed
expectations.records[]
```

The legacy top-level field remains:

```text
failed_expectations
```

Studio may render structured expectation accounting only from these Core JSON fields.

Studio must not infer passed expectations from empty failed expectation lists.

### 4.4 Coverage summary

Command:

```bash
orbitfabric export coverage-summary <mission_dir> \
  --entity-index <path> \
  --relationship-manifest <path> \
  --scenario-run-index <path> \
  --json <path>
```

Expected report identity:

```text
kind: orbitfabric.coverage_summary
coverage_version: 0.1-candidate
```

Core-derived coverage is based only on:

```text
entity_index.json
relationship_manifest.json
scenario_run_index.json
simulation JSON reports referenced by scenario_run_index.json
```

Studio may render coverage metrics only when they are present in this Core report.

Studio must not calculate additional percentages or alternative denominators.

Studio must not derive coverage from logs, YAML, UI state or filename heuristics.

## 5. Product loop

The v0.7.1 product loop is:

```text
Open workspace
  -> run or inspect Core-derived dashboard inputs
  -> export dashboard summary through Core
  -> inspect dashboard foundation
  -> run or inspect scenario evidence reports
  -> export scenario run index through Core
  -> export coverage summary through Core
  -> inspect coverage cards and gaps
  -> navigate to validation, evidence, relationship and artifact surfaces
```

## 6. Required Studio behavior

Studio v0.7.1 must distinguish:

```text
source model
Core-derived dashboard report
Core-derived scenario run index
Core-derived coverage report
Core simulation JSON report
generated report
plain-text log
local UI state
```

Each dashboard or coverage value must be labeled with clear provenance:

```text
CORE-DERIVED
REPORT
COVERAGE
READ-ONLY
CANDIDATE
UNAVAILABLE
```

Use `UNAVAILABLE` only when Core explicitly reports an unavailable state or when the report is absent.

Do not silently compute missing values.

## 7. Candidate UI surfaces

The first implementation should fit the existing v0.6.0 and v0.7.0 shell.

Candidate dashboard sections:

```text
Dashboard summary identity
Validation summary card
Model domain inventory card
Entity inventory card
Relationship inventory card
Scenario run summary card
Expectation accounting card
Coverage summary card
Entity coverage cards
Relationship coverage card
Unsupported coverage scope panel
```

Candidate cross-links:

```text
validation card -> Validation surface
scenario run card -> Evidence surface
entity coverage card -> Contracts surface
relationship coverage card -> Relationships surface
generated reports -> Artifacts or Reports & Logs surface
```

Links may be added only when the target already exists and the reference is safe.

## 8. Explicit non-goals

v0.7.1 explicitly excludes:

```text
no private coverage calculation
no frontend-defined coverage denominators
no model completeness score invented by Studio
no mission health score
no live spacecraft health
no mission control behavior
no command uplink
no live telemetry
no telemetry archive
no log-derived evidence
no YAML semantic parsing
no graph UI
no React Flow dependency
no graph coverage
no visual Mission Model editing
no authoring
no generated artifact mutation
no plugin-aware surface
no ground operations
```

## 9. Relation to v0.8.0

Ground Integration Artifact Viewer remains v0.8.0.

Studio v0.7.1 may show generated report references needed for dashboard and coverage.

It must not become a ground artifact viewer.

## 10. Relation to v0.8.1

Relationship and Flow Graph Foundation remains v0.8.1.

Studio v0.7.1 may show relationship coverage lists and counts emitted by Core.

It must not render a graph and must not infer graph semantics.

## 11. Acceptance criteria

v0.7.1 is complete when Studio can:

```text
1. run or consume Core dashboard-summary output through a fixed command;
2. parse valid orbitfabric.dashboard_summary reports;
3. render dashboard summary cards from Core report fields only;
4. run or consume Core scenario-run-index output through a fixed command;
5. parse valid orbitfabric.scenario_run_index reports;
6. render recent scenario run summaries from the Core index only;
7. parse extended orbitfabric-sim expectation accounting fields;
8. render passed and failed expectations only from Core expectation records;
9. run or consume Core coverage-summary output through a fixed command;
10. parse valid orbitfabric.coverage_summary reports;
11. render coverage cards and gaps only from Core coverage report fields;
12. keep unsupported coverage scopes visible and explicitly marked;
13. preserve raw stdout, stderr, exit code and raw report preview access;
14. avoid all private coverage, health, graph, mission control, telemetry, command uplink and editing behavior.
```

## 12. Implementation policy

The milestone must be implemented through small PRs.

Documentation and parser contracts come first.

Backend fixed Core command wrappers come before UI actions.

UI rendering must start with report identity and unavailable states before richer cards.

No release metadata is updated until final v0.7.1 closure.

## 13. Final milestone statement

v0.7.1 turns Core-owned dashboard and coverage reports into inspectable Studio surfaces.

It does not expand Studio authority.

It makes dashboard and coverage evidence easier to inspect while preserving the boundary between Mission Model source, Core-derived reports, generated outputs, logs and local UI state.
