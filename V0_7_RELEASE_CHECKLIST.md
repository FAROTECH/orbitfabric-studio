# OrbitFabric Studio v0.7.0 Release Checklist

## Scope

Release milestone:

```text
v0.7.0 - Scenario Evidence Explorer
```

Primary released loop:

```text
Open -> List Scenarios -> Inspect Scenario Source -> Inspect Core Evidence -> Review Reports and Logs
```

If the fixed Core scenario command is available and verified:

```text
Open -> Select Scenario -> Run Scenario through Core -> Inspect Evidence -> Review Reports and Logs
```

## Required checks

- [x] `npm install`
- [x] `npm run build`
- [x] `npm run tauri:dev`
- [x] Open `examples/demo-3u`
- [x] Verify workspace header remains visible
- [x] Verify primary navigation remains usable
- [x] Verify Workspace Dashboard remains reachable
- [x] Verify Evidence surface is reachable
- [x] Verify scenario source files are listed from workspace inspection
- [x] Verify scenario source preview is read-only
- [x] Verify scenario source is marked as source/scenario/read-only
- [x] Verify Core command panel remains reachable
- [x] Verify existing Core lint command remains reachable
- [x] Verify existing Core model-summary command remains reachable
- [x] Verify existing Core entity-index command remains reachable
- [x] Verify existing Core relationship-manifest command remains reachable
- [x] Verify Generated Artifact Explorer remains reachable
- [x] Verify generated artifact preview remains read-only
- [x] Verify Reports & Logs remain preview-only unless a recognized Core report schema is parsed
- [x] Verify Raw Core output remains visible

## Scenario Core command checks

Complete these only if a real fixed Core scenario command is implemented.

- [x] Verify the Core scenario command is fixed and documented
- [x] Verify no arbitrary CLI argument field exists
- [x] Verify no shell plugin permission is added
- [x] Verify scenario source path is workspace-contained
- [x] Verify mission directory is workspace-contained
- [x] Verify scenario report path is Studio-controlled
- [x] Verify stdout, stderr and exit code are visible
- [x] Verify report JSON availability is displayed
- [x] Verify failed Core scenario command does not produce fake scenario status
- [x] Verify missing Core report produces a clear unavailable state

## Scenario report checks

Complete these only if Core scenario report parsing is implemented.

- [ ] Verify recognized scenario report `kind`
- [ ] Verify report version is displayed
- [ ] Verify OrbitFabric Core version is displayed when present
- [ ] Verify mission identity is displayed when present
- [x] Verify scenario identity is displayed
- [ ] Verify scenario source reference is displayed
- [x] Verify scenario status/result is displayed only from Core report
- [ ] Verify expectations are displayed only from Core report
- [ ] Verify passed expectations are displayed only from Core report
- [x] Verify failed expectations are displayed only from Core report
- [x] Verify timeline records are displayed only from Core report/evidence
- [x] Verify events are displayed only from Core report/evidence
- [ ] Verify telemetry effects are displayed only from Core report/evidence
- [x] Verify mode changes are displayed only from Core report/evidence
- [ ] Verify data product records are displayed only from Core report/evidence
- [ ] Verify unknown evidence records remain visible and marked as unknown
- [ ] Verify unrecognized scenario reports remain preview-only

## Inspector checks

- [x] Verify selecting a scenario source updates the Inspector
- [x] Verify selecting a scenario report updates the Inspector, if implemented
- [x] Verify selecting an expectation updates the Inspector, if implemented
- [x] Verify selecting a timeline record updates the Inspector, if implemented
- [x] Verify selecting an evidence record updates the Inspector, if implemented
- [x] Verify Inspector shows provenance
- [x] Verify Inspector shows read-only status
- [x] Verify Inspector shows source/report/log references only when safe references exist
- [x] Verify Inspector does not invent links

## Boundary checks

- [x] No private scenario runner
- [x] No independent scenario simulation
- [x] No dynamic spacecraft simulator
- [x] No orbital simulation
- [x] No RF simulation
- [x] No payload physics simulation
- [x] No mission control behavior
- [x] No command uplink behavior
- [x] No live telemetry behavior
- [x] No telemetry archive behavior
- [x] No ground behavior
- [x] No graph UI
- [x] No React Flow dependency
- [x] No coverage percentage invented by Studio
- [x] No mission health score invented by Studio
- [x] No model completeness percentage invented by Studio
- [x] No data product coverage percentage invented by Studio
- [x] No commandability coverage percentage invented by Studio
- [x] No Mission Model YAML editing
- [x] No generated artifact editing
- [x] No source file mutation
- [x] No generated artifact mutation
- [x] No arbitrary command execution
- [x] No arbitrary OrbitFabric CLI argument entry
- [x] No private YAML semantic parser
- [x] No private relationship inference
- [x] No log-derived evidence when structured JSON is expected or available

## Source / evidence / report / log boundary checks

- [x] Scenario source files are clearly distinguished from Core-derived evidence
- [x] Core-derived evidence is clearly distinguished from raw logs
- [x] Reports are clearly marked as reports
- [x] Logs are clearly marked as logs
- [x] Generated outputs remain generated outputs
- [x] Unknown files remain unknown
- [x] Preview-only files are marked as preview-only
- [x] Read-only files are marked as read-only

## Release metadata

To be completed only at final v0.7.0 release closure.

- [x] `README.md` marks v0.7.0 as current released baseline
- [x] `CHANGELOG.md` contains v0.7.0 release notes
- [x] `ROADMAP.md` marks v0.7.0 as completed
- [x] `package.json` version is `0.7.0`
- [x] `package-lock.json` version is `0.7.0`
- [x] `src-tauri/Cargo.toml` version is `0.7.0`
- [x] `src-tauri/Cargo.lock` package version is `0.7.0`
- [x] `src-tauri/tauri.conf.json` version is `0.7.0`

## Tagging

After merge to `main` and final validation:

```bash
git tag v0.7.0
git push origin v0.7.0
```

## Implementation checkpoint after structured simulation report viewer

The following implementation slices have been completed before introducing any active scenario execution from Studio:

- [x] v0.7.0 planning specification added
- [x] v0.7.0 release checklist added
- [x] Scenario source files listed from workspace inspection
- [x] Scenario source preview remains read-only
- [x] Passive generated report/log candidates are visible and preview-only
- [x] Passive generated report/log candidates are clearly marked as candidates
- [x] Core simulation JSON report parser is implemented for `tool: orbitfabric-sim`
- [x] Core simulation report summary is rendered from structured Core JSON
- [x] Core simulation timeline is rendered from structured Core JSON
- [x] Core simulation events are rendered from structured Core JSON
- [x] Core simulation commands are rendered from structured Core JSON
- [x] Core simulation mode transitions are rendered from structured Core JSON
- [x] Core simulation `data_flow_evidence` is rendered from structured Core JSON
- [x] Core simulation `failed_expectations` is rendered from structured Core JSON
- [x] Studio does not infer passed expectations from the absence of failed expectations
- [x] Studio does not infer produced data products from data-flow evidence records
- [x] Studio does not infer coverage or mission health metrics
- [x] Studio does not parse scenario YAML semantically
- [x] Studio does not parse plain-text scenario logs as evidence
- [x] Studio does not execute scenarios independently

Remaining before v0.7.0 release closure:

- [x] Controlled Core `orbitfabric sim` execution wrapper, if accepted for v0.7.0
- [x] Read-only simulation log preview linkage, if accepted for v0.7.0
- [x] Inspector binding for selected simulation report/evidence records, if accepted for v0.7.0
- [x] Final regression and boundary pass
- [x] Release metadata update to `0.7.0`

## Final v0.7.0 closure notes

The v0.7.0 release closes as a read-only Scenario Evidence Explorer.

Implemented and verified scope:

- scenario source listing;
- fixed Core `orbitfabric sim` execution;
- Studio-controlled report/log paths;
- structured Core simulation JSON report rendering;
- read-only log preview linkage;
- generated artifact refresh after simulation;
- Inspector binding for selected Core simulation records;
- explicit no-log-derived-evidence boundary;
- explicit no-private-simulation boundary;
- explicit no-coverage-inference boundary.

Known intentionally deferred items:

- dedicated Core `kind` / schema version for simulation reports;
- complete expectation accounting;
- passed expectations as explicit Core records;
- dedicated telemetry effects;
- produced data products as runtime facts;
- coverage summaries;
- graph visualization;
- authoring/editing;
- plugin-aware surfaces.
