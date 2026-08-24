import { useEffect, useRef, useState } from "react";

import type { LintFindingDto, LintReportDto } from "../../core/contracts";
import type { EntityRef } from "../../mission/entityRef";
import type { MissionReadModel } from "../../mission/MissionSession";
import {
  filterValidationFindings,
  resolveFindingEntityRef,
  validationSeverityCount,
  type ValidationSeverityFilter,
} from "./validationModel";

interface ValidationFindingsDrawerProps {
  report: LintReportDto;
  readModel: MissionReadModel;
  onClose: () => void;
  onInspectEntity: (ref: EntityRef) => void;
}

const FILTERS: readonly ValidationSeverityFilter[] = ["all", "error", "warning", "info"];

export function ValidationFindingsDrawer({
  report,
  readModel,
  onClose,
  onInspectEntity,
}: ValidationFindingsDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [filter, setFilter] = useState<ValidationSeverityFilter>("all");
  const visibleFindings = filterValidationFindings(report.findings, filter);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) {
      return;
    }

    if (!dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      id="validation-findings-dialog"
      className="validation-drawer"
      aria-labelledby="validation-findings-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className="validation-drawer-header">
        <div>
          <p className="eyebrow">Core validation</p>
          <h2 id="validation-findings-title">Validation Findings</h2>
          <p>Reported by OrbitFabric Core. Studio does not infer additional findings.</p>
        </div>
        <button
          className="icon-action"
          type="button"
          onClick={onClose}
          aria-label="Close Validation Findings"
          autoFocus
        >
          ×
        </button>
      </header>

      <div className="validation-filters" role="group" aria-label="Filter findings by severity">
        {FILTERS.map((candidate) => (
          <button
            key={candidate}
            type="button"
            className={candidate === filter ? "is-active" : ""}
            aria-pressed={candidate === filter}
            onClick={() => setFilter(candidate)}
          >
            {filterLabel(candidate)}
            <span>{filterCount(report.findings, candidate)}</span>
          </button>
        ))}
      </div>

      <div className="validation-findings-scroll">
        {visibleFindings.length > 0 ? (
          <div className="validation-finding-list">
            {visibleFindings.map((finding, index) => (
              <ValidationFinding
                key={`${finding.code}-${index}`}
                finding={finding}
                entityRef={resolveFindingEntityRef(finding, readModel)}
                onInspectEntity={onInspectEntity}
              />
            ))}
          </div>
        ) : (
          <p className="validation-empty">No findings match this severity filter.</p>
        )}
      </div>

      <footer className="validation-drawer-footer">
        Showing {visibleFindings.length} of {report.findings.length} Core findings
      </footer>
    </dialog>
  );
}

function ValidationFinding({
  finding,
  entityRef,
  onInspectEntity,
}: {
  finding: LintFindingDto;
  entityRef: EntityRef | null;
  onInspectEntity: (ref: EntityRef) => void;
}) {
  return (
    <article className="validation-finding">
      <header className="validation-finding-header">
        <span className={`validation-severity severity-${severityClass(finding.severity)}`}>
          {finding.severity}
        </span>
        <code>{finding.code}</code>
      </header>

      <p className="validation-message">{finding.message}</p>

      {finding.domain !== null || finding.object_id !== null || finding.file !== null ? (
        <dl className="validation-finding-details">
          {finding.domain !== null ? <Detail label="Domain" value={finding.domain} /> : null}
          {finding.object_id !== null ? (
            <Detail label="Object ID" value={finding.object_id} />
          ) : null}
          {finding.file !== null ? <Detail label="Source" value={finding.file} /> : null}
        </dl>
      ) : null}

      {finding.suggestion !== null ? (
        <div className="validation-suggestion">
          <strong>Suggestion</strong>
          <p>{finding.suggestion}</p>
        </div>
      ) : null}

      {entityRef !== null ? (
        <button
          className="secondary-action validation-inspect-action"
          type="button"
          onClick={() => onInspectEntity(entityRef)}
        >
          Inspect entity
        </button>
      ) : null}
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>
        <code>{value}</code>
      </dd>
    </div>
  );
}

function filterCount(
  findings: readonly LintFindingDto[],
  filter: ValidationSeverityFilter,
): number {
  return filter === "all" ? findings.length : validationSeverityCount(findings, filter);
}

function filterLabel(filter: ValidationSeverityFilter): string {
  return filter === "all" ? "All" : `${filter[0].toUpperCase()}${filter.slice(1)}`;
}

function severityClass(severity: string): string {
  const normalized = severity.trim().toLowerCase();
  return normalized === "error" || normalized === "warning" || normalized === "info"
    ? normalized
    : "other";
}
