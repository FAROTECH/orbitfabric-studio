import { ProvenanceBadge, StatusBadge } from "./Badges";
import type {
  CoreSimulationExpectationRecord,
  CoreSimulationReport,
} from "./types/workspace";

interface SimulationExpectationAccountingPanelProps {
  report: CoreSimulationReport | null;
}

export function SimulationExpectationAccountingPanel({
  report,
}: SimulationExpectationAccountingPanelProps) {
  return (
    <section
      id="studio-expectation-accounting"
      className={`entry-section ${report?.expectations ? "" : "muted-section"}`}
      aria-label="Core simulation structured expectation accounting"
    >
      <div className="file-viewer-header">
        <div>
          <h3>Structured expectation accounting</h3>
          <p>
            Read-only rendering of Core simulation JSON expectation accounting.
            Studio displays only `summary.expectations`,
            `summary.passed_expectations`, `summary.failed_expectations` and
            `expectations.records[]` emitted by `orbitfabric-sim`.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="EXPECTATION ACCOUNTING" />
          <ProvenanceBadge label="READ-ONLY" />
        </div>
      </div>

      {report?.expectations ? (
        <RenderedExpectationAccounting report={report} />
      ) : (
        <UnavailableExpectationAccounting />
      )}
    </section>
  );
}

function RenderedExpectationAccounting({ report }: { report: CoreSimulationReport }) {
  const accounting = report.expectations;

  if (!accounting) {
    return <UnavailableExpectationAccounting />;
  }

  return (
    <>
      <section className="entry-section" aria-label="Expectation accounting summary">
        <h3>Expectation summary</h3>
        <p>
          These values are Core-emitted accounting fields. Studio does not infer
          passed expectations from an empty legacy `failed_expectations` list.
        </p>
        <div className="summary-grid">
          <ExpectationSummaryItem
            label="Summary expectations"
            value={formatOptionalNumber(report.summary.expectations)}
          />
          <ExpectationSummaryItem
            label="Summary passed"
            value={formatOptionalNumber(report.summary.passed_expectations)}
          />
          <ExpectationSummaryItem
            label="Summary failed"
            value={String(report.summary.failed_expectations)}
          />
          <ExpectationSummaryItem label="Accounting total" value={String(accounting.total)} />
          <ExpectationSummaryItem label="Accounting passed" value={String(accounting.passed)} />
          <ExpectationSummaryItem label="Accounting failed" value={String(accounting.failed)} />
        </div>
      </section>

      <ExpectationRecords records={accounting.records} />

      <section className="entry-section muted-section" aria-label="Expectation accounting boundary">
        <h3>Boundary</h3>
        <ul className="entry-list">
          <li>
            <div className="entry-main">
              <strong>Passed expectations are rendered only when Core reports them.</strong>
              <span className="category-badge category-derivedReport">boundary</span>
            </div>
          </li>
          <li>
            <div className="entry-main">
              <strong>Legacy `failed_expectations` remains compatibility data, not the source for passed counts.</strong>
              <span className="category-badge category-derivedReport">boundary</span>
            </div>
          </li>
          <li>
            <div className="entry-main">
              <strong>Expectation records are not converted into coverage by Studio.</strong>
              <span className="category-badge category-derivedReport">boundary</span>
            </div>
          </li>
        </ul>
      </section>
    </>
  );
}

function ExpectationRecords({ records }: { records: CoreSimulationExpectationRecord[] }) {
  if (records.length === 0) {
    return (
      <section className="entry-section muted-section" aria-label="No expectation records">
        <h3>Expectation records</h3>
        <p>No structured expectation records were emitted by Core.</p>
      </section>
    );
  }

  return (
    <section className="entry-section" aria-label="Expectation records">
      <h3>Expectation records</h3>
      <ul className="entry-list">
        {records.map((record, index) => (
          <li key={`${record.t}-${record.expectation_type}-${record.target}-${index}`}>
            <div className="entry-main">
              <strong>{record.target}</strong>
              <span className={`category-badge category-${record.result === "passed" ? "sourceModel" : "derivedReport"}`}>
                {record.result}
              </span>
            </div>
            <p>{record.message}</p>
            <div className="command-meta">
              <span>t: {record.t}</span>
              <span>type: {record.expectation_type}</span>
              <span>expected: {formatJsonValue(record.expected)}</span>
              <span>actual: {formatJsonValue(record.actual)}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function UnavailableExpectationAccounting() {
  return (
    <p className="empty-text">
      No structured expectation accounting is present in the selected
      `orbitfabric-sim` report. Studio does not synthesize passed expectations
      from the legacy top-level `failed_expectations` field.
    </p>
  );
}

function ExpectationSummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatOptionalNumber(value: number | undefined): string {
  return value === undefined ? "not reported" : String(value);
}

function formatJsonValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}
