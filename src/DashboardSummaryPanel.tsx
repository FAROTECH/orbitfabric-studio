import { ProvenanceBadge, StatusBadge } from "./Badges";
import type { CoreDashboardSummary } from "./types/workspace";

interface DashboardSummaryPanelProps {
  summary: CoreDashboardSummary | null;
}

export function DashboardSummaryPanel({ summary }: DashboardSummaryPanelProps) {
  return (
    <section
      id="studio-dashboard-summary"
      className={`entry-section ${summary ? "" : "muted-section"}`}
      aria-label="Core dashboard summary"
    >
      <div className="file-viewer-header">
        <div>
          <h3>Core dashboard summary</h3>
          <p>
            Read-only rendering of `orbitfabric.dashboard_summary`. Studio shows
            only Core-emitted validation, domain, entity and relationship inventory
            fields. It does not compute model completeness, mission health or
            coverage percentages.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="DASHBOARD SUMMARY" />
          <ProvenanceBadge label="READ-ONLY" />
        </div>
      </div>

      {summary ? <RenderedDashboardSummary summary={summary} /> : <UnavailableDashboardSummary />}
    </section>
  );
}

function RenderedDashboardSummary({ summary }: { summary: CoreDashboardSummary }) {
  return (
    <>
      <section className="entry-section" aria-label="Dashboard identity">
        <h3>Dashboard identity</h3>
        <div className="summary-grid">
          <DashboardSummaryItem label="Mission" value={summary.mission.name} />
          <DashboardSummaryItem label="Mission ID" value={summary.mission.id} />
          <DashboardSummaryItem label="Model version" value={summary.mission.model_version} />
          <DashboardSummaryItem label="Dashboard version" value={summary.dashboard_version} />
          <DashboardSummaryItem label="Core version" value={summary.orbitfabric_version} />
          <DashboardSummaryItem label="Source of truth" value={summary.boundaries.source_of_truth} />
        </div>
      </section>

      <section className="entry-section" aria-label="Dashboard validation summary">
        <h3>Validation summary</h3>
        <p>
          This is the validation summary emitted by Core in the dashboard report.
          Studio does not reinterpret it as mission health.
        </p>
        <div className="summary-grid">
          <DashboardSummaryItem label="Tool" value={summary.validation.tool} />
          <DashboardSummaryItem label="Result" value={summary.validation.result} />
          <DashboardSummaryItem label="Errors" value={String(summary.validation.errors)} />
          <DashboardSummaryItem label="Warnings" value={String(summary.validation.warnings)} />
          <DashboardSummaryItem label="Info" value={String(summary.validation.info)} />
        </div>
      </section>

      <section className="entry-section" aria-label="Dashboard model domain inventory">
        <h3>Model domain inventory</h3>
        <p>
          Domain presence and counts are Core-reported inventory facts. Studio does
          not convert them into a model completeness score.
        </p>
        <div className="summary-grid">
          <DashboardSummaryItem
            label="Required domains"
            value={`${summary.model_domains.required.present}/${summary.model_domains.required.total}`}
          />
          <DashboardSummaryItem
            label="Missing required domains"
            value={String(summary.model_domains.required.missing)}
          />
          <DashboardSummaryItem
            label="Optional domains"
            value={`${summary.model_domains.optional.present}/${summary.model_domains.optional.total}`}
          />
          <DashboardSummaryItem
            label="Missing optional domains"
            value={String(summary.model_domains.optional.missing)}
          />
        </div>

        <ul className="entry-list">
          {summary.model_domains.domains.map((domain) => (
            <li key={domain.id}>
              <div className="entry-main">
                <strong>{domain.display_name}</strong>
                <span className={`category-badge category-${domain.present ? "sourceModel" : "derivedReport"}`}>
                  {domain.present ? "present" : "missing"}
                </span>
              </div>
              <div className="command-meta">
                <span>id: {domain.id}</span>
                <span>source file: {domain.source_file}</span>
                <span>required: {String(domain.required)}</span>
                <span>count: {domain.count}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="entry-section" aria-label="Dashboard entity and relationship inventory">
        <h3>Entity and relationship inventory</h3>
        <div className="summary-grid">
          <DashboardSummaryItem
            label="Total entities"
            value={String(summary.entity_inventory.total_entities)}
          />
          <DashboardSummaryItem
            label="Entity domains"
            value={String(Object.keys(summary.entity_inventory.domains).length)}
          />
          <DashboardSummaryItem
            label="Total relationships"
            value={String(summary.relationship_inventory.total_relationships)}
          />
          <DashboardSummaryItem
            label="Relationship types"
            value={String(Object.keys(summary.relationship_inventory.relationship_types).length)}
          />
        </div>

        <DashboardRecordMap
          title="Entity domains"
          records={summary.entity_inventory.domains}
        />
        <DashboardRecordMap
          title="Relationship types"
          records={summary.relationship_inventory.relationship_types}
        />
      </section>

      <section className="entry-section muted-section" aria-label="Dashboard coverage state">
        <h3>Coverage state</h3>
        <p>
          The dashboard summary may report coverage as unavailable because real
          coverage belongs to `orbitfabric.coverage_summary`. Studio preserves
          this Core state and does not fill the gap with frontend calculations.
        </p>
        <div className="summary-grid">
          <DashboardSummaryItem label="Status" value={summary.coverage.status} />
          <DashboardSummaryItem
            label="Requires Core output"
            value={summary.coverage.requires_core_output}
          />
        </div>
        <p>{summary.coverage.reason}</p>
      </section>

      <section className="entry-section" aria-label="Dashboard boundary flags">
        <h3>Boundary flags</h3>
        <ul className="entry-list">
          <DashboardBoundaryItem label="Core-derived report" value={summary.boundaries.core_derived_report} />
          <DashboardBoundaryItem label="Read-only" value={summary.boundaries.read_only} />
          <DashboardBoundaryItem label="Contains dashboard summary" value={summary.boundaries.contains_dashboard_summary} />
          <DashboardBoundaryItem label="Contains coverage metrics" value={summary.boundaries.contains_coverage_metrics} />
          <DashboardBoundaryItem label="Contains health score" value={summary.boundaries.contains_health_score} />
          <DashboardBoundaryItem label="Contains Studio API" value={summary.boundaries.contains_studio_api} />
          <DashboardBoundaryItem label="Contains runtime behavior" value={summary.boundaries.contains_runtime_behavior} />
          <DashboardBoundaryItem label="Contains ground behavior" value={summary.boundaries.contains_ground_behavior} />
        </ul>
      </section>
    </>
  );
}

function UnavailableDashboardSummary() {
  return (
    <p className="empty-text">
      No valid `orbitfabric.dashboard_summary` report is selected. Run the fixed
      Core dashboard-summary export, then render the produced Core JSON report.
      Studio does not synthesize this report from lint, model summary or entity
      index output.
    </p>
  );
}

function DashboardRecordMap({
  title,
  records,
}: {
  title: string;
  records: Record<string, number>;
}) {
  const entries = Object.entries(records).sort(([left], [right]) => left.localeCompare(right));

  if (entries.length === 0) {
    return (
      <section className="entry-section muted-section" aria-label={title}>
        <h3>{title}</h3>
        <p>No records were emitted for this section.</p>
      </section>
    );
  }

  return (
    <section className="entry-section" aria-label={title}>
      <h3>{title}</h3>
      <ul className="entry-list">
        {entries.map(([key, value]) => (
          <li key={key}>
            <div className="entry-main">
              <strong>{key}</strong>
              <span className="category-badge category-sourceModel">reported</span>
            </div>
            <div className="command-meta">
              <span>count: {value}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DashboardBoundaryItem({ label, value }: { label: string; value: boolean }) {
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

function DashboardSummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
