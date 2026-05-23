# OrbitFabric Studio Target UX Realization Matrix

This document records the target UX realization path derived from the post-v0.6.0 Studio mockup review.

It is not a commitment to implement the mockups as-is.

It is a decision matrix for turning the mockup direction into a disciplined, Core-aligned implementation path.

OrbitFabric Studio must remain downstream from OrbitFabric Core.

The correct implementation pattern remains:

```text
OrbitFabric Core emits structured outputs.
Studio consumes and renders them.
```

The incorrect implementation pattern remains:

```text
Studio invents mission semantics because the required Core output is missing.
```

## Baseline

Studio v0.6.0 established the UX foundation:

```text
application shell
workspace header
primary navigation
main surface
workspace dashboard
provenance badges
status badges
severity badges
normalized surface anchors
contextual inspector
reserved Scenario Evidence surface
reserved Ground Integration surface
graph visualization boundary
read-only boundary polish
```

The v0.6.0 baseline does not implement:

```text
scenario execution
scenario evidence domain logic
ground integration domain logic
graph visualization
coverage metrics
mission health scoring
authoring
editing
plugin-aware surfaces
```

## Target UX principle

The long-term Studio UI may become visually close to a full engineering workbench with:

```text
left domain navigation
top command bar
mission overview dashboard
validation and coverage cards
scenario run summaries
generated artifact cards
data-flow graph surface
node inspector
scenario timeline
validation/evidence panes
bottom workspace status
```

This is acceptable only if the information remains:

```text
source model
Core-derived report
generated artifact
local UI state
```

and never becomes private frontend semantics.

## Recommended milestone path

The recommended realization path is:

```text
v0.7.0  Scenario Evidence Explorer
v0.7.1  Dashboard and Coverage Foundation
v0.8.0  Ground Integration Artifact Viewer
v0.8.1  Relationship and Flow Graph Foundation
v0.9.0  Studio UX Consolidation
```

This path avoids pushing too much into v0.7.0 or v0.8.0 and prevents v0.9.0 from becoming a purely cosmetic rewrite.

## Feature matrix

| Mockup feature | Candidate milestone | Core dependency | Risk | Decision |
|---|---|---|---|---|
| Domain sidebar for Mission, Spacecraft, Subsystems, Modes, Telemetry, Commands, Events, Faults, Packets, Payloads, Data Products, Contacts, Commandability, Autonomy, Scenarios and Generated Artifacts | v0.9.0, with preparation in v0.7.x and v0.8.x | Low to medium. Needs stable domain inventory from Core-derived surfaces | Medium. It may imply deeper navigation than is actually implemented | Implement progressively |
| Top project selector | v0.9.0 | Low. Can use workspace state | Low | Implement |
| Top command bar | v0.7.0 and v0.8.0 progressively, polish in v0.9.0 | High. Each button must map to a fixed approved Core command or controlled Studio command | High if actions appear available before the backend contract exists | Implement with strict enabled, disabled and reserved states |
| Validate Mission action | v0.7.0 | Existing validation command surface | Low | Implement or preserve |
| Run Scenario action | v0.7.0 | Fixed Core scenario command or equivalent controlled Core surface | Medium | Implement only through Core |
| Generate Docs action | v0.8.0 or v0.8.1 | Fixed Core generation command and generated artifact manifest | Medium | Implement only if Core surface is stable |
| Generate Runtime Skeleton action | v0.8.1 or later | Runtime artifact manifest from Core | Medium | Reserve until Core output exists |
| Generate Ground Artifacts action | v0.8.0 | Ground export command and ground export manifest from Core | High if it implies operational ground behavior | Implement with ground-facing artifact wording |
| Bottom workspace status bar | v0.9.0 | Low. Workspace path, schema and branch can be local/read-only metadata | Medium if it implies live state | Implement without autosave until authoring exists |
| Local cache status | v0.9.0 | Low to medium | Medium. Must remain UI/local state | Implement carefully |
| Autosave indicator | v0.10.0 or later | Requires authoring flow | High. Misleading while Studio is read-only | Do not implement before authoring |

## Mission overview dashboard matrix

| Mockup feature | Candidate milestone | Core dependency | Risk | Decision |
|---|---|---|---|---|
| Mission Health card | v0.7.1 or v0.9.0 | High. Needs defined Core-owned scoring or documented formula | High. Can imply live spacecraft health | Prefer `Contract Health` or `Validation Health` |
| Model Completeness card | v0.7.1 | High. Needs `model_completeness_summary` or equivalent | High if calculated privately | Implement only from Core-derived summary |
| Lint Status card | v0.7.0 or v0.7.1 | Existing lint report | Low | Implement early |
| Scenario Coverage card | v0.7.1 | High. Needs scenario coverage output | Medium | Implement after v0.7.0 scenario evidence |
| Data Product Coverage card | v0.7.1 or v0.8.1 | High. Needs coverage between data products, storage, downlink and artifacts | High | Implement only from coverage summary |
| Commandability Coverage card | v0.7.1 | High. Needs commandability coverage output | High | Implement only from Core-derived summary |
| Mission Data Contract Overview progress bars | v0.7.1 | Medium to high. Some counts exist, real completeness requires Core output | Medium | Implement as coverage foundation |
| Recent Validation Results | v0.7.0 or v0.7.1 | Medium. Findings from Core, recent history may be local | Low | Implement |
| Recent Scenario Runs | v0.7.0 | High. Needs scenario result outputs | Medium | Implement as part of Scenario Evidence Explorer |
| Generated artifact cards | v0.8.0 | Medium. Current inventory exists, manifest improves accuracy | Low to medium | Implement |
| Evidence Reports card | v0.7.0 or v0.7.1 | High. Needs evidence reports | Medium | Implement after scenario evidence |
| Runtime Skeleton card | v0.8.1 or later | High. Needs runtime artifact manifest | Medium | Implement only if Core generates it |
| Ground Database card | v0.8.0 or later | High. Needs a real database export concept | High | Use `Ground-facing Artifacts` unless Core defines a database export |

## Data flow workbench matrix

| Mockup feature | Candidate milestone | Core dependency | Risk | Decision |
|---|---|---|---|---|
| Graph View tab | v0.8.1 | Very high. Needs graph bundle, relationship manifest or flow manifest | Very high | Do not implement before Core-owned graph/flow data exists |
| YAML View tab | v0.7.0 or v0.8.0 | Low. Existing read-only source viewer can support it | Low | Implement |
| Scenario Runner tab | v0.7.0 | High. Needs fixed Core scenario command | Medium | Implement in v0.7.0 |
| Data Flow Evidence tab | v0.7.1 or v0.8.1 | High. Needs structured evidence and safe entity references | High | Implement after evidence records exist |
| Payload -> Data Product -> Storage -> Downlink -> Contact -> Ground Artifact graph | v0.8.1 | Very high. Needs typed nodes and edges | Very high | Implement only from Core-owned graph bundle |
| Command -> Mode -> Event -> Telemetry -> Scenario graph | v0.8.1 or v0.9.0 | Very high. Needs typed relationships and scenario references | Very high | Implement only from Core-owned graph bundle |
| Auto layout | v0.8.1 | Low for layout, high for underlying data | Medium | Allowed if layout is UI-only |
| Zoom, fit, minimap | v0.8.1 or v0.9.0 | Low | Low | Allowed |
| Graph filters | v0.8.1 or v0.9.0 | Medium. Needs stable node and edge taxonomy | Medium | Implement after graph type model exists |
| Node status badges | v0.8.1 | High. Needs findings linked to node ids | High | Implement only with explicit Core targets |
| Node inspector | v0.8.1 or v0.9.0 | High. Needs node metadata | Medium | Implement after graph bundle exists |
| Node warnings | v0.8.1 | High. Needs finding-to-node association | High | Implement only with Core-provided links |
| Node metadata such as created, updated, tags | v0.9.0 or later | Medium. Needs metadata model | Medium | Defer |
| Version badge on node | post-v0.9.0 | High. Needs version semantics | High | Defer |

## Scenario evidence matrix

| Mockup feature | Candidate milestone | Core dependency | Risk | Decision |
|---|---|---|---|---|
| Scenario list | v0.7.0 | Scenario source detection and Core scenario model | Low to medium | Implement |
| Run scenario | v0.7.0 | Fixed Core command or equivalent controlled Core surface | Medium | Implement only through Core |
| Scenario timeline | v0.7.0 | Scenario report timeline or evidence records | Medium | Core requirement |
| Step status PASS/WARN/FAIL | v0.7.0 | Core scenario result schema | Medium | Implement |
| Events and activities | v0.7.0 | Core evidence records | Medium | Implement |
| Telemetry effects | v0.7.0 | Core evidence records | Medium | Implement if provided |
| Mode changes | v0.7.0 | Core evidence records | Medium | Implement if provided |
| Produced or expected data products | v0.7.0 | Core evidence records | Medium | Implement if provided |
| Recent scenario run history | v0.7.0 or v0.7.1 | Core outputs plus local history | Medium | Implement carefully |
| Scenario coverage | v0.7.1 | Coverage summary | High if privately calculated | Implement only from Core-derived summary |
| Evidence chain view | v0.7.1 | Structured evidence records and references | High | Implement after v0.7.0 basic evidence |
| Links from scenario evidence to model entities | v0.7.1 | Safe references from Core | High | Implement only when references are explicit |

## Ground artifact matrix

| Mockup feature | Candidate milestone | Core dependency | Risk | Decision |
|---|---|---|---|---|
| Ground export manifest viewer | v0.8.0 | Ground export manifest | Medium | Implement |
| Telemetry dictionary viewer | v0.8.0 | Generated dictionary and manifest | Medium | Implement |
| Command dictionary viewer | v0.8.0 | Generated dictionary and manifest | Medium | Implement |
| Event dictionary viewer | v0.8.0 | Generated dictionary and manifest | Medium | Implement |
| Fault dictionary viewer | v0.8.0 | Generated dictionary and manifest | Medium | Implement |
| Packet dictionary viewer | v0.8.0 | Generated dictionary and manifest | Medium | Implement |
| Data product dictionary viewer | v0.8.0 | Generated dictionary and manifest | Medium | Implement |
| Mission database export viewer | v0.8.0 or v0.8.1 | Explicit Core output | High if the concept is not real | Implement only if Core defines it |
| Decoder skeleton preview | v0.8.1 | Core-generated decoder skeleton | High | Defer |
| Artifact provenance trace | v0.8.0 or v0.8.1 | Manifest references | Medium | Implement |
| Ground integration status | v0.8.1 | Manifest status fields | High if it implies operational readiness | Use conservative wording |

## UX consolidation matrix

| Mockup feature | Candidate milestone | Core dependency | Risk | Decision |
|---|---|---|---|---|
| Professional visual hierarchy | v0.9.0 | Low | Low | Implement |
| Density tuning | v0.9.0 | Low | Low | Implement |
| Resizable panels | v0.9.0 | Low | Low | Implement |
| Breadcrumbs | v0.9.0 | Low to medium | Low | Implement |
| Cross-surface filters | v0.9.0 | Medium | Medium | Implement after v0.7 and v0.8 data exists |
| Read-only command palette | v0.9.0 | Low to medium | Medium | Implement only for navigation and safe actions |
| Global search | v0.9.0 | Medium | Medium | Evaluate |
| Persistent UI layout | v0.9.0 | Low | Medium if confused with mission data | UI-only persistence allowed |
| Keyboard navigation | v0.9.0 | Low | Low | Implement |
| Icon system | v0.9.0 | Low | Low | Implement |
| Editable graph | Out of scope before authoring | Very high | Very high | Do not implement |
| Drag-and-drop authoring | Out of scope before authoring | Very high | Very high | Do not implement |

## Required Core outputs

The following outputs would unlock the mockup direction without forcing Studio to invent semantics.

| Output | Unlocks | Priority | Candidate milestone |
|---|---|---|---|
| `scenario_report.json` | Scenario result, status, duration, pass/warn/fail | Very high | v0.7.0 |
| `scenario_timeline.json` or timeline section in scenario report | Scenario timeline | Very high | v0.7.0 |
| `scenario_evidence_records.json` | Evidence chain, events, telemetry effects, mode changes, data product trace | Very high | v0.7.0 or v0.7.1 |
| `scenario_coverage_summary.json` | Scenario coverage dashboard card | High | v0.7.1 |
| `dashboard_summary.json` | Coherent dashboard KPI layer | High | v0.7.1 |
| `model_completeness_summary.json` | Model completeness card | Medium to high | v0.7.1 |
| `data_product_coverage_summary.json` | Data product coverage card | High | v0.7.1 |
| `commandability_coverage_summary.json` | Commandability coverage card | High | v0.7.1 |
| `generated_artifact_manifest.json` | Artifact cards and provenance | High | v0.8.0 |
| `ground_export_manifest.json` | Ground artifact viewer | Very high | v0.8.0 |
| `runtime_artifact_manifest.json` | Runtime skeleton card/viewer | Medium | v0.8.1 |
| evolved `relationship_manifest.json` | Typed relationship navigation | High | v0.8.1 |
| `graph_bundle.json` | Read-only graph view | Very high | v0.8.1 |
| stable finding targets or `node_finding_links` | Node warnings and graph validation context | High | v0.8.1 |
| stable `source_refs` | Safe links from UI to source | High | Cross-cutting |

## Risk matrix

| Risk | Severity | Affected surfaces | Mitigation |
|---|---:|---|---|
| UI appears to be mission control | High | Mission health, scenario runs, live-looking status | Use contract/evidence wording, never operational health wording |
| Percentages are invented by Studio | High | Completeness, coverage, health | Require Core-derived summaries |
| Graph semantics are invented by Studio | Very high | Data Flow Graph | Require Core-owned graph bundle |
| Ground segment claim is implied | High | Ground artifacts, ground database, command bar | Use ground-facing artifact wording |
| Autosave appears while Studio is read-only | High | Bottom status bar | Do not implement autosave before authoring |
| Buttons appear active without backend contracts | High | Command bar | Use disabled and reserved states with explicit tooltips |
| Visual polish outruns semantics | Medium | v0.9.0 | Keep all panels tied to source/Core/generated/local state |
| v0.7.0 becomes too large | High | Scenario, dashboard, graph | Split into v0.7.0 and v0.7.1 |
| v0.8.0 becomes too large | High | Ground, runtime, graph | Split into v0.8.0 and v0.8.1 |

## Concrete roadmap adjustment

The recommended roadmap adjustment is:

```text
v0.7.0 - Scenario Evidence Explorer
v0.7.1 - Dashboard and Coverage Foundation
v0.8.0 - Ground Integration Artifact Viewer
v0.8.1 - Relationship and Flow Graph Foundation
v0.9.0 - Studio UX Consolidation
```

### v0.7.0

Focus on:

```text
scenario list
controlled Core scenario run
scenario report loading
scenario status
scenario timeline
expectations
events
telemetry effects
mode changes
data products
report/log preview
```

### v0.7.1

Focus on:

```text
dashboard summary model
lint status card
scenario coverage card
data product coverage card
commandability coverage card
model completeness card
recent validation results
first serious mission overview dashboard
```

### v0.8.0

Focus on:

```text
ground export manifest
telemetry dictionary viewer
command dictionary viewer
event dictionary viewer
fault dictionary viewer
packet dictionary viewer
data product dictionary viewer
ground artifact provenance
ground-facing artifact inspector
```

### v0.8.1

Focus on:

```text
graph bundle contract
read-only graph surface
node and edge type taxonomy
graph inspector binding
graph filters
minimap, zoom and fit-to-view
selection to validation/evidence context
no editing
no authoring
```

### v0.9.0

Focus on:

```text
professional shell consolidation
domain sidebar
top command bar
dashboard consolidation
graph workbench polish
bottom panes
mature inspector
breadcrumbs
read-only command palette
UI-only layout persistence
keyboard navigation
visual hierarchy
density tuning
```

## Final decision

The mockup direction is accepted as a target UX direction.

The mockup is not accepted as an implementation shortcut.

The implementation must proceed through Core-aligned data contracts and narrow Studio milestones.

Studio must never introduce private mission semantics to make the UI look complete.

