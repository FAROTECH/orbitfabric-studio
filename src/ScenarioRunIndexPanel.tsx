import { ProvenanceBadge, StatusBadge } from "./Badges";
import type { CoreScenarioRunIndex, CoreScenarioRunRecord } from "./types/workspace";

interface ScenarioRunIndexPanelProps {
  index: CoreScenarioRunIndex | null;
}

export function ScenarioRunIndexPanel({ index }: ScenarioRunIndexPanelProps) {
  return (
    <section
      id="studio-scenario-run-index"
      className={`entry-section ${index ? "" : "muted-section"}`}
      aria-label="Core scenario run index"
    >
      <div className="file-viewer-header">
        <div>
          <h3>Core scenario run index</h3>
          <p>
            Read-only rendering of `orbitfabric.scenario_run_index`. Studio shows
            only Core-indexed simulation JSON report records. It does not scan
            logs, deduplicate scenario IDs or infer run history from filenames.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="SCENARIO RUN INDEX" />
          <ProvenanceBadge label="READ-ONLY" />
        </div>
      </div>

      {index ? <RenderedScenarioRunIndex index={index} /> : <UnavailableScenarioRunIndex />}
    </section>
  );
}

function RenderedScenarioRunIndex({ index }: { index: CoreScenarioRunIndex }) {
  return (
    <>
      <section className="entry-section" aria-label="Scenario run index identity">
        <h3>Index identity</h3>
        <div className="summary-grid">
          <ScenarioRunIndexItem label="Index version" value={index.index_version} />
          <ScenarioRunIndexItem label="Core version" value={index.orbitfabric_version} />
          <ScenarioRunIndexItem
            label="Simulation reports directory"
            value={index.source.simulation_reports_dir}
          />
          <ScenarioRunIndexItem label="Input report tool" value={index.source.input_report_tool} />
        </div>
      </section>

      <section className="entry-section" aria-label="Scenario run summary">
        <h3>Run summary</h3>
        <p>
          The totals are Core-emitted run counts over simulation report files.
          Studio does not deduplicate by scenario id and does not build history
          from text logs.
        </p>
        <div className="summary-grid">
          <ScenarioRunIndexItem label="Total runs" value={String(index.summary.total)} />
          <ScenarioRunIndexItem label="Passed" value={String(index.summary.passed)} />
          <ScenarioRunIndexItem label="Failed" value={String(index.summary.failed)} />
        </div>
      </section>

      <ScenarioRunRecords records={index.runs} />

      <section className="entry-section" aria-label="Scenario run index boundary flags">
        <h3>Boundary flags</h3>
        <ul className="entry-list">
          <ScenarioRunBoundaryItem label="Core-derived report" value={index.boundaries.core_derived_report} />
          <ScenarioRunBoundaryItem label="Read-only" value={index.boundaries.read_only} />
          <ScenarioRunBoundaryItem label="Contains scenario run index" value={index.boundaries.contains_scenario_run_index} />
          <ScenarioRunBoundaryItem label="Contains coverage metrics" value={index.boundaries.contains_coverage_metrics} />
          <ScenarioRunBoundaryItem label="Contains health score" value={index.boundaries.contains_health_score} />
          <ScenarioRunBoundaryItem label="Derived from simulation JSON" value={index.boundaries.derived_from_simulation_json} />
          <ScenarioRunBoundaryItem label="Derived from logs" value={index.boundaries.derived_from_logs} />
          <ScenarioRunBoundaryItem label="Contains Studio API" value={index.boundaries.contains_studio_api} />
          <ScenarioRunBoundaryItem label="Contains runtime behavior" value={index.boundaries.contains_runtime_behavior} />
          <ScenarioRunBoundaryItem label="Contains ground behavior" value={index.boundaries.contains_ground_behavior} />
        </ul>
      </section>
    </>
  );
}

function ScenarioRunRecords({ records }: { records: CoreScenarioRunRecord[] }) {
  if (records.length === 0) {
    return (
      <section className="entry-section muted-section" aria-label="No scenario runs">
        <h3>Run records</h3>
        <p>No scenario run records were emitted by Core.</p>
      </section>
    );
  }

  return (
    <section className="entry-section" aria-label="Scenario run records">
      <h3>Run records</h3>
      <ul className="entry-list">
        {records.map((record) => (
          <li key={`${record.report_path}-${record.scenario}`}>
            <div className="entry-main">
              <strong>{record.scenario}</strong>
              <span className={`category-badge category-${record.result === "passed" ? "sourceModel" : "derivedReport"}`}>
                {record.result}
              </span>
            </div>
            <div className="command-meta">
              <span>mission: {record.mission}</span>
              <span>report file: {record.report_file}</span>
              <span>report path: {record.report_path}</span>
              {Object.entries(record.summary).map(([key, value]) => (
                <span key={key}>{key}: {value}</span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function UnavailableScenarioRunIndex() {
  return (
    <p className="empty-text">
      No valid `orbitfabric.scenario_run_index` report is selected. Run the fixed
      Core scenario-run-index export, then render the produced Core JSON report.
      Studio does not synthesize run history from logs, scenario YAML or generated
      report filenames.
    </p>
  );
}

function ScenarioRunBoundaryItem({ label, value }: { label: string; value: boolean }) {
  return (
    <li>
      <div className="entry-main">
        <strong>{label}</strong>
        <span className={`category-badge category-${value ? "sourceModel" : "derivedReport"}`}>
          {value ? "true" : "false"}
        </span>
      </div>
    </li>
  );
}

function ScenarioRunIndexItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
