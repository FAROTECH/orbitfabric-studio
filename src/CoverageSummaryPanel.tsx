import { ProvenanceBadge, StatusBadge } from "./Badges";
import type {
  CoreCoverageRecord,
  CoreCoverageSummary,
  CoreExpectationCoverageByType,
} from "./types/workspace";

interface CoverageSummaryPanelProps {
  summary: CoreCoverageSummary | null;
}

export function CoverageSummaryPanel({ summary }: CoverageSummaryPanelProps) {
  return (
    <section
      id="studio-coverage-summary"
      className={`entry-section ${summary ? "" : "muted-section"}`}
      aria-label="Core coverage summary"
    >
      <div className="file-viewer-header">
        <div>
          <h3>Core coverage summary</h3>
          <p>
            Read-only rendering of `orbitfabric.coverage_summary`. Studio shows
            only Core-emitted coverage totals, ratios, covered ids, uncovered ids
            and unsupported scopes. It does not compute alternative denominators,
            mission health or model completeness.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="COVERAGE SUMMARY" />
          <ProvenanceBadge label="READ-ONLY" />
        </div>
      </div>

      {summary ? <RenderedCoverageSummary summary={summary} /> : <UnavailableCoverageSummary />}
    </section>
  );
}

function RenderedCoverageSummary({ summary }: { summary: CoreCoverageSummary }) {
  const entityCoverageEntries = Object.entries(summary.entity_coverage).sort(
    ([left], [right]) => left.localeCompare(right),
  );
  const expectationTypeEntries = Object.entries(summary.expectation_coverage.by_type).sort(
    ([left], [right]) => left.localeCompare(right),
  );
  const relationshipTypeEntries = Object.entries(summary.relationship_coverage.by_type).sort(
    ([left], [right]) => left.localeCompare(right),
  );

  return (
    <>
      <section className="entry-section" aria-label="Coverage identity">
        <h3>Coverage identity</h3>
        <div className="summary-grid">
          <CoverageSummaryItem label="Mission" value={summary.mission.name} />
          <CoverageSummaryItem label="Mission ID" value={summary.mission.id} />
          <CoverageSummaryItem label="Model version" value={summary.mission.model_version} />
          <CoverageSummaryItem label="Coverage version" value={summary.coverage_version} />
          <CoverageSummaryItem label="Core version" value={summary.orbitfabric_version} />
          <CoverageSummaryItem label="Source of truth" value={summary.boundaries.source_of_truth} />
        </div>
      </section>

      <section className="entry-section" aria-label="Coverage input reports">
        <h3>Input reports</h3>
        <p>
          These input paths and report identities are emitted by Core. Studio does
          not rescan Mission Model YAML or text logs to rebuild coverage.
        </p>
        <div className="summary-grid">
          <CoverageSummaryItem label="Entity index" value={summary.source.entity_index} />
          <CoverageSummaryItem label="Entity index kind" value={summary.source.entity_index_kind} />
          <CoverageSummaryItem label="Entity index version" value={summary.source.entity_index_version} />
          <CoverageSummaryItem label="Relationship manifest" value={summary.source.relationship_manifest} />
          <CoverageSummaryItem label="Relationship manifest kind" value={summary.source.relationship_manifest_kind} />
          <CoverageSummaryItem label="Relationship manifest version" value={summary.source.relationship_manifest_version} />
          <CoverageSummaryItem label="Scenario run index" value={summary.source.scenario_run_index} />
          <CoverageSummaryItem label="Scenario run index kind" value={summary.source.scenario_run_index_kind} />
          <CoverageSummaryItem label="Scenario run index version" value={summary.source.scenario_run_index_version} />
        </div>
      </section>

      <section className="entry-section" aria-label="Scenario run coverage context">
        <h3>Scenario run context</h3>
        <p>
          Scenario run totals are Core-emitted context for coverage. Studio does
          not deduplicate by scenario id and does not infer run history.
        </p>
        <div className="summary-grid">
          <CoverageSummaryItem label="Total runs" value={String(summary.scenario_runs.total)} />
          <CoverageSummaryItem label="Passed runs" value={String(summary.scenario_runs.passed)} />
          <CoverageSummaryItem label="Failed runs" value={String(summary.scenario_runs.failed)} />
        </div>
      </section>

      <section className="entry-section" aria-label="Entity coverage">
        <h3>Entity coverage</h3>
        {entityCoverageEntries.length > 0 ? (
          entityCoverageEntries.map(([domain, record]) => (
            <CoverageRecordSection
              key={domain}
              title={domain}
              record={record}
              coveredLabel="Covered ids"
              uncoveredLabel="Uncovered ids"
            />
          ))
        ) : (
          <p className="empty-text">No entity coverage records were emitted by Core.</p>
        )}
      </section>

      <section className="entry-section" aria-label="Expectation coverage">
        <h3>Expectation coverage</h3>
        <p>
          Expectation totals and pass ratios are emitted by Core. Studio does not
          infer passed expectations from missing failures.
        </p>
        <div className="summary-grid">
          <CoverageSummaryItem label="Total" value={String(summary.expectation_coverage.total)} />
          <CoverageSummaryItem label="Passed" value={String(summary.expectation_coverage.passed)} />
          <CoverageSummaryItem label="Failed" value={String(summary.expectation_coverage.failed)} />
          <CoverageSummaryItem label="Pass ratio" value={formatRatio(summary.expectation_coverage.pass_ratio)} />
        </div>
        <CoverageExpectationTypes entries={expectationTypeEntries} />
      </section>

      <section className="entry-section" aria-label="Relationship coverage">
        <h3>Relationship coverage</h3>
        <p>
          Relationship coverage is limited to Core-supported relationship types.
          Unsupported relationship types remain visible below.
        </p>
        <div className="summary-grid">
          <CoverageSummaryItem
            label="Supported types"
            value={summary.relationship_coverage.supported_relationship_types.join(", ") || "none"}
          />
          <CoverageSummaryItem
            label="Total supported relationships"
            value={String(summary.relationship_coverage.total_supported_relationships)}
          />
          <CoverageSummaryItem
            label="Covered supported relationships"
            value={String(summary.relationship_coverage.covered_supported_relationships)}
          />
          <CoverageSummaryItem
            label="Uncovered supported relationships"
            value={String(summary.relationship_coverage.uncovered_supported_relationships)}
          />
          <CoverageSummaryItem
            label="Coverage ratio"
            value={formatRatio(summary.relationship_coverage.coverage_ratio)}
          />
        </div>

        <CoverageIdList
          title="Covered relationship ids"
          ids={summary.relationship_coverage.covered_relationship_ids}
        />
        <CoverageIdList
          title="Uncovered relationship ids"
          ids={summary.relationship_coverage.uncovered_relationship_ids}
        />

        {relationshipTypeEntries.length > 0 ? (
          relationshipTypeEntries.map(([type, record]) => (
            <CoverageRecordSection
              key={type}
              title={type}
              record={record}
              coveredLabel="Covered relationship ids"
              uncoveredLabel="Uncovered relationship ids"
            />
          ))
        ) : (
          <p className="empty-text">No relationship coverage records by type were emitted by Core.</p>
        )}
      </section>

      <section className="entry-section muted-section" aria-label="Unsupported coverage scopes">
        <h3>Unsupported coverage scopes</h3>
        <p>
          Unsupported scopes are emitted by Core and intentionally kept visible.
          Studio does not hide or fill them with private calculations.
        </p>
        <div className="summary-grid">
          <CoverageSummaryItem
            label="Unsupported entity domains"
            value={summary.unsupported.entity_domains.join(", ") || "none"}
          />
          <CoverageSummaryItem
            label="Unsupported relationship types"
            value={summary.unsupported.relationship_types.join(", ") || "none"}
          />
        </div>
        <p>{summary.unsupported.reason}</p>
      </section>

      <section className="entry-section" aria-label="Coverage boundary flags">
        <h3>Boundary flags</h3>
        <ul className="entry-list">
          <CoverageBoundaryItem label="Core-derived report" value={summary.boundaries.core_derived_report} />
          <CoverageBoundaryItem label="Read-only" value={summary.boundaries.read_only} />
          <CoverageBoundaryItem label="Contains coverage metrics" value={summary.boundaries.contains_coverage_metrics} />
          <CoverageBoundaryItem label="Contains health score" value={summary.boundaries.contains_health_score} />
          <CoverageBoundaryItem label="Contains model completeness score" value={summary.boundaries.contains_model_completeness_score} />
          <CoverageBoundaryItem label="Coverage derived from entity index" value={summary.boundaries.coverage_derived_from_entity_index} />
          <CoverageBoundaryItem label="Coverage derived from relationship manifest" value={summary.boundaries.coverage_derived_from_relationship_manifest} />
          <CoverageBoundaryItem label="Coverage derived from scenario run index" value={summary.boundaries.coverage_derived_from_scenario_run_index} />
          <CoverageBoundaryItem label="Coverage derived from simulation JSON" value={summary.boundaries.coverage_derived_from_simulation_json} />
          <CoverageBoundaryItem label="Coverage derived from logs" value={summary.boundaries.coverage_derived_from_logs} />
          <CoverageBoundaryItem label="Contains Studio API" value={summary.boundaries.contains_studio_api} />
          <CoverageBoundaryItem label="Contains runtime behavior" value={summary.boundaries.contains_runtime_behavior} />
          <CoverageBoundaryItem label="Contains ground behavior" value={summary.boundaries.contains_ground_behavior} />
        </ul>
      </section>
    </>
  );
}

function CoverageRecordSection({
  title,
  record,
  coveredLabel,
  uncoveredLabel,
}: {
  title: string;
  record: CoreCoverageRecord;
  coveredLabel: string;
  uncoveredLabel: string;
}) {
  return (
    <section className="entry-section" aria-label={`${title} coverage record`}>
      <div className="entry-main">
        <h3>{title}</h3>
        <StatusBadge label="CORE COVERAGE" />
      </div>
      <div className="summary-grid">
        <CoverageSummaryItem label="Total" value={String(record.total)} />
        <CoverageSummaryItem label="Covered" value={String(record.covered)} />
        <CoverageSummaryItem label="Uncovered" value={String(record.uncovered)} />
        <CoverageSummaryItem label="Coverage ratio" value={formatRatio(record.coverage_ratio)} />
      </div>
      <CoverageIdList title={coveredLabel} ids={record.covered_ids} />
      <CoverageIdList title={uncoveredLabel} ids={record.uncovered_ids} />
    </section>
  );
}

function CoverageExpectationTypes({
  entries,
}: {
  entries: [string, CoreExpectationCoverageByType][];
}) {
  if (entries.length === 0) {
    return <p className="empty-text">No expectation coverage by type was emitted by Core.</p>;
  }

  return (
    <section className="entry-section" aria-label="Expectation coverage by type">
      <h3>Expectation coverage by type</h3>
      <ul className="entry-list">
        {entries.map(([type, record]) => (
          <li key={type}>
            <div className="entry-main">
              <strong>{type}</strong>
              <StatusBadge label="EXPECTATION TYPE" />
            </div>
            <div className="command-meta">
              <span>total: {record.total}</span>
              <span>passed: {record.passed}</span>
              <span>failed: {record.failed}</span>
              <span>pass ratio: {formatRatio(record.pass_ratio)}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CoverageIdList({ title, ids }: { title: string; ids: string[] }) {
  return (
    <section className={`entry-section ${ids.length > 0 ? "" : "muted-section"}`} aria-label={title}>
      <h3>{title}</h3>
      {ids.length > 0 ? (
        <ul className="entry-list">
          {ids.map((id) => (
            <li key={id}>
              <div className="entry-main">
                <strong>{id}</strong>
                <span className="category-badge category-sourceModel">reported</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-text">No ids were emitted for this section.</p>
      )}
    </section>
  );
}

function UnavailableCoverageSummary() {
  return (
    <p className="empty-text">
      No valid `orbitfabric.coverage_summary` report is selected. Run the fixed
      Core coverage-summary export after producing the required entity index,
      relationship manifest and scenario run index reports. Studio does not
      synthesize coverage from logs, YAML or generated artifact filenames.
    </p>
  );
}

function CoverageBoundaryItem({ label, value }: { label: string; value: boolean }) {
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

function CoverageSummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatRatio(value: number | null): string {
  return value === null ? "not reported" : String(value);
}
