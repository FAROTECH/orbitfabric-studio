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

- [ ] `npm install`
- [ ] `npm run build`
- [ ] `npm run tauri:dev`
- [ ] Open `examples/demo-3u`
- [ ] Verify workspace header remains visible
- [ ] Verify primary navigation remains usable
- [ ] Verify Workspace Dashboard remains reachable
- [ ] Verify Evidence surface is reachable
- [ ] Verify scenario source files are listed from workspace inspection
- [ ] Verify scenario source preview is read-only
- [ ] Verify scenario source is marked as source/scenario/read-only
- [ ] Verify Core command panel remains reachable
- [ ] Verify existing Core lint command remains reachable
- [ ] Verify existing Core model-summary command remains reachable
- [ ] Verify existing Core entity-index command remains reachable
- [ ] Verify existing Core relationship-manifest command remains reachable
- [ ] Verify Generated Artifact Explorer remains reachable
- [ ] Verify generated artifact preview remains read-only
- [ ] Verify Reports & Logs remain preview-only unless a recognized Core report schema is parsed
- [ ] Verify Raw Core output remains visible

## Scenario Core command checks

Complete these only if a real fixed Core scenario command is implemented.

- [ ] Verify the Core scenario command is fixed and documented
- [ ] Verify no arbitrary CLI argument field exists
- [ ] Verify no shell plugin permission is added
- [ ] Verify scenario source path is workspace-contained
- [ ] Verify mission directory is workspace-contained
- [ ] Verify scenario report path is Studio-controlled
- [ ] Verify stdout, stderr and exit code are visible
- [ ] Verify report JSON availability is displayed
- [ ] Verify failed Core scenario command does not produce fake scenario status
- [ ] Verify missing Core report produces a clear unavailable state

## Scenario report checks

Complete these only if Core scenario report parsing is implemented.

- [ ] Verify recognized scenario report `kind`
- [ ] Verify report version is displayed
- [ ] Verify OrbitFabric Core version is displayed when present
- [ ] Verify mission identity is displayed when present
- [ ] Verify scenario identity is displayed
- [ ] Verify scenario source reference is displayed
- [ ] Verify scenario status/result is displayed only from Core report
- [ ] Verify expectations are displayed only from Core report
- [ ] Verify passed expectations are displayed only from Core report
- [ ] Verify failed expectations are displayed only from Core report
- [ ] Verify timeline records are displayed only from Core report/evidence
- [ ] Verify events are displayed only from Core report/evidence
- [ ] Verify telemetry effects are displayed only from Core report/evidence
- [ ] Verify mode changes are displayed only from Core report/evidence
- [ ] Verify data product records are displayed only from Core report/evidence
- [ ] Verify unknown evidence records remain visible and marked as unknown
- [ ] Verify unrecognized scenario reports remain preview-only

## Inspector checks

- [ ] Verify selecting a scenario source updates the Inspector
- [ ] Verify selecting a scenario report updates the Inspector, if implemented
- [ ] Verify selecting an expectation updates the Inspector, if implemented
- [ ] Verify selecting a timeline record updates the Inspector, if implemented
- [ ] Verify selecting an evidence record updates the Inspector, if implemented
- [ ] Verify Inspector shows provenance
- [ ] Verify Inspector shows read-only status
- [ ] Verify Inspector shows source/report/log references only when safe references exist
- [ ] Verify Inspector does not invent links

## Boundary checks

- [ ] No private scenario runner
- [ ] No independent scenario simulation
- [ ] No dynamic spacecraft simulator
- [ ] No orbital simulation
- [ ] No RF simulation
- [ ] No payload physics simulation
- [ ] No mission control behavior
- [ ] No command uplink behavior
- [ ] No live telemetry behavior
- [ ] No telemetry archive behavior
- [ ] No ground behavior
- [ ] No graph UI
- [ ] No React Flow dependency
- [ ] No coverage percentage invented by Studio
- [ ] No mission health score invented by Studio
- [ ] No model completeness percentage invented by Studio
- [ ] No data product coverage percentage invented by Studio
- [ ] No commandability coverage percentage invented by Studio
- [ ] No Mission Model YAML editing
- [ ] No generated artifact editing
- [ ] No source file mutation
- [ ] No generated artifact mutation
- [ ] No arbitrary command execution
- [ ] No arbitrary OrbitFabric CLI argument entry
- [ ] No private YAML semantic parser
- [ ] No private relationship inference
- [ ] No log-derived evidence when structured JSON is expected or available

## Source / evidence / report / log boundary checks

- [ ] Scenario source files are clearly distinguished from Core-derived evidence
- [ ] Core-derived evidence is clearly distinguished from raw logs
- [ ] Reports are clearly marked as reports
- [ ] Logs are clearly marked as logs
- [ ] Generated outputs remain generated outputs
- [ ] Unknown files remain unknown
- [ ] Preview-only files are marked as preview-only
- [ ] Read-only files are marked as read-only

## Release metadata

To be completed only at final v0.7.0 release closure.

- [ ] `README.md` marks v0.7.0 as current released baseline
- [ ] `CHANGELOG.md` contains v0.7.0 release notes
- [ ] `ROADMAP.md` marks v0.7.0 as completed
- [ ] `package.json` version is `0.7.0`
- [ ] `package-lock.json` version is `0.7.0`
- [ ] `src-tauri/Cargo.toml` version is `0.7.0`
- [ ] `src-tauri/Cargo.lock` package version is `0.7.0`
- [ ] `src-tauri/tauri.conf.json` version is `0.7.0`

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

- [ ] Controlled Core `orbitfabric sim` execution wrapper, if accepted for v0.7.0
- [ ] Read-only simulation log preview linkage, if accepted for v0.7.0
- [ ] Inspector binding for selected simulation report/evidence records, if accepted for v0.7.0
- [ ] Final regression and boundary pass
- [ ] Release metadata update to `0.7.0`
