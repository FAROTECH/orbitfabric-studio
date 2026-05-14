import type {
  CoreEntityIndex,
  CoreEntityIndexDomain,
  CoreEntityIndexEntity,
  CoreLintFinding,
  CoreLintReport,
  CoreModelSummary,
  CoreModelSummaryDomain,
} from "./types/workspace";

export function parseCoreLintReport(content: string | null): CoreLintReport | null {
  if (!content) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(content);

    if (!isRecord(parsed)) {
      return null;
    }

    if (
      typeof parsed.tool !== "string" ||
      typeof parsed.version !== "string" ||
      typeof parsed.mission !== "string" ||
      typeof parsed.model_version !== "string" ||
      typeof parsed.result !== "string" ||
      !isNumberRecord(parsed.loaded) ||
      !isCoreLintSummary(parsed.summary) ||
      !Array.isArray(parsed.findings) ||
      !parsed.findings.every(isCoreLintFinding)
    ) {
      return null;
    }

    return parsed as unknown as CoreLintReport;
  } catch {
    return null;
  }
}

export function parseCoreModelSummary(content: string | null): CoreModelSummary | null {
  if (!content) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(content);

    if (!isRecord(parsed)) {
      return null;
    }

    if (
      parsed.kind !== "orbitfabric.model_summary" ||
      typeof parsed.summary_version !== "string" ||
      typeof parsed.orbitfabric_version !== "string" ||
      !isCoreReportMissionIdentity(parsed.mission) ||
      !isCoreReportSource(parsed.source) ||
      !isRecord(parsed.boundaries) ||
      !isNumberRecord(parsed.counts) ||
      !Array.isArray(parsed.domains) ||
      !parsed.domains.every(isCoreModelSummaryDomain)
    ) {
      return null;
    }

    return parsed as unknown as CoreModelSummary;
  } catch {
    return null;
  }
}

export function parseCoreEntityIndex(content: string | null): CoreEntityIndex | null {
  if (!content) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(content);

    if (!isRecord(parsed)) {
      return null;
    }

    if (
      parsed.kind !== "orbitfabric.entity_index" ||
      typeof parsed.index_version !== "string" ||
      typeof parsed.orbitfabric_version !== "string" ||
      !isCoreReportMissionIdentity(parsed.mission) ||
      !isCoreReportSource(parsed.source) ||
      !isRecord(parsed.boundaries) ||
      !isCoreEntityIndexCounts(parsed.counts) ||
      !Array.isArray(parsed.domains) ||
      !parsed.domains.every(isCoreEntityIndexDomain) ||
      !Array.isArray(parsed.entities) ||
      !parsed.entities.every(isCoreEntityIndexEntity)
    ) {
      return null;
    }

    return parsed as unknown as CoreEntityIndex;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  return (
    isRecord(value) &&
    Object.values(value).every((entry) => typeof entry === "number")
  );
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isCoreReportMissionIdentity(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.model_version === "string"
  );
}

function isCoreReportSource(value: unknown): boolean {
  return isRecord(value) && typeof value.mission_dir === "string";
}

function isCoreLintSummary(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.errors === "number" &&
    typeof value.warnings === "number" &&
    typeof value.info === "number"
  );
}

function isCoreLintFinding(value: unknown): value is CoreLintFinding {
  return (
    isRecord(value) &&
    typeof value.severity === "string" &&
    typeof value.code === "string" &&
    isNullableString(value.file) &&
    isNullableString(value.domain) &&
    isNullableString(value.object_id) &&
    typeof value.message === "string" &&
    isNullableString(value.suggestion)
  );
}

function isCoreModelSummaryDomain(value: unknown): value is CoreModelSummaryDomain {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.display_name === "string" &&
    typeof value.source_file === "string" &&
    typeof value.required === "boolean" &&
    typeof value.present === "boolean" &&
    typeof value.count === "number" &&
    typeof value.count_provenance === "string"
  );
}

function isCoreEntityIndexCounts(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.total_entities === "number" &&
    isNumberRecord(value.domains)
  );
}

function isCoreEntityIndexDomain(value: unknown): value is CoreEntityIndexDomain {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.display_name === "string" &&
    typeof value.source_file === "string" &&
    typeof value.required === "boolean" &&
    typeof value.present === "boolean" &&
    typeof value.indexed === "boolean" &&
    typeof value.model_count === "number" &&
    typeof value.entity_count === "number" &&
    typeof value.count_provenance === "string"
  );
}

function isCoreEntityIndexEntity(value: unknown): value is CoreEntityIndexEntity {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.domain === "string" &&
    typeof value.entity_type === "string" &&
    typeof value.display_name === "string" &&
    typeof value.source_file === "string" &&
    typeof value.provenance === "string" &&
    typeof value.required_domain === "boolean" &&
    typeof value.present === "boolean"
  );
}
