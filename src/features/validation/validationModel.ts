import type { LintFindingDto } from "../../core/contracts";
import { entityKey, type EntityRef } from "../../mission/entityRef";
import type { MissionReadModel } from "../../mission/MissionSession";

export type ValidationSeverityFilter = "all" | "error" | "warning" | "info";

export function filterValidationFindings(
  findings: readonly LintFindingDto[],
  filter: ValidationSeverityFilter,
): readonly LintFindingDto[] {
  if (filter === "all") {
    return findings;
  }

  return findings.filter((finding) => normalizedSeverity(finding.severity) === filter);
}

export function validationSeverityCount(
  findings: readonly LintFindingDto[],
  severity: Exclude<ValidationSeverityFilter, "all">,
): number {
  return findings.filter((finding) => normalizedSeverity(finding.severity) === severity).length;
}

export function resolveFindingEntityRef(
  finding: LintFindingDto,
  readModel: Pick<MissionReadModel, "entityRecordsByKey">,
): EntityRef | null {
  if (finding.domain === null || finding.object_id === null) {
    return null;
  }

  const ref = { domain: finding.domain, id: finding.object_id };
  return readModel.entityRecordsByKey.has(entityKey(ref)) ? ref : null;
}

function normalizedSeverity(severity: string): string {
  return severity.trim().toLowerCase();
}
