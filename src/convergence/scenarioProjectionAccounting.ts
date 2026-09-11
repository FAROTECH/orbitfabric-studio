import type { IntegrationArtifact, IntegrationResult } from "../integrations/contracts";
import { sha256Utf8 } from "../integrations/sha256";
import type { ScenarioDeclarationLoaded } from "./consumer-contracts";

export const SCENARIO_ACCOUNTING_KIND = "orbitfabric.scenario_projection_accounting";
export const SCENARIO_ACCOUNTING_VERSION = "0.1-candidate";

export type ScenarioProjectionDisposition = "projected" | "not_projected" | "unsupported";

export interface ScenarioProjectionAccountingRecord {
  atomId: string;
  disposition: ScenarioProjectionDisposition;
  mappingIds: string[];
  reason: string | null;
}

export interface ScenarioProjectionAccounting {
  kind: typeof SCENARIO_ACCOUNTING_KIND;
  accountingVersion: typeof SCENARIO_ACCOUNTING_VERSION;
  scenario: { id: string; sha256: string };
  completeness: "complete" | "partial";
  reason: string | null;
  records: ScenarioProjectionAccountingRecord[];
}

export interface ScenarioProjectionAccountingObservation {
  resultSha256: string;
  artifactId: string;
  artifactSha256: string;
  sourcePath: string;
  sourceText: string;
  accounting: ScenarioProjectionAccounting;
}

const SHA256 = /^[0-9a-f]{64}$/;

export class UnsupportedAccountingVersion extends Error {}

export async function parseAndValidateScenarioAccounting(
  sourceText: string,
  artifact: IntegrationArtifact,
  result: IntegrationResult,
  sourcePath: string,
  resultSha256: string,
): Promise<ScenarioProjectionAccountingObservation> {
  if (!SHA256.test(resultSha256)) throw new Error("Exact parent Result SHA-256 is required.");
  if (result.artifacts.filter((item) => item.id === artifact.id).length !== 1 || result.artifacts.find((item) => item.id === artifact.id) !== artifact) {
    throw new Error("Select an unambiguous artifact owned by this parent Result.");
  }
  if (result.resultVersion !== "0.2-candidate") throw new Error("Scenario accounting requires Result 0.2-candidate.");
  if (artifact.kind !== SCENARIO_ACCOUNTING_KIND || artifact.status !== "generated" || artifact.mediaType !== "application/json") {
    throw new Error("Scenario accounting must be a generated generic artifact.");
  }
  if (!artifact.path || /[\\\\:]/.test(artifact.path) || artifact.path.split("/").some((part) => !part || part === "." || part === "..")) {
    throw new Error("Accounting artifact path must be portable and bundle-relative.");
  }
  if (!artifact.sha256 || !SHA256.test(artifact.sha256)) {
    throw new Error("Scenario accounting artifact has no usable SHA-256 identity.");
  }
  if (await sha256Utf8(sourceText) !== artifact.sha256) {
    throw new Error("Scenario accounting bytes do not match the parent Result artifact digest.");
  }
  const accounting = parseScenarioAccounting(sourceText);
  validateAccountingParentBinding(accounting, artifact, result);
  return {
    resultSha256,
    artifactId: artifact.id,
    artifactSha256: artifact.sha256,
    sourcePath,
    sourceText,
    accounting,
  };
}

export function parseScenarioAccounting(sourceText: string): ScenarioProjectionAccounting {
  const root = objectValue(JSON.parse(sourceText) as unknown, "Scenario Projection Accounting");
  if (root.kind !== SCENARIO_ACCOUNTING_KIND) throw new Error(`Unsupported Scenario accounting kind: ${String(root.kind)}.`);
  if (typeof root.accounting_version === "string" && root.accounting_version !== SCENARIO_ACCOUNTING_VERSION) throw new UnsupportedAccountingVersion(`Unsupported Scenario accounting version: ${root.accounting_version}.`);
  if (root.accounting_version !== SCENARIO_ACCOUNTING_VERSION) throw new Error("Scenario accounting version must be declared.");
  rejectUnknownKeys(root, ["kind", "accounting_version", "scenario", "completeness", "reason", "records"], "Scenario Projection Accounting");
  const scenario = objectValue(root.scenario, "Scenario accounting scenario");
  rejectUnknownKeys(scenario, ["id", "sha256"], "Scenario accounting scenario");
  const completeness = stringValue(root.completeness, "Scenario accounting completeness");
  if (completeness !== "complete" && completeness !== "partial") throw new Error(`Unsupported Scenario accounting completeness: ${completeness}.`);
  const reason = optionalReason(root.reason, "Scenario accounting reason");
  if (completeness === "partial" && !reason) throw new Error("Partial Scenario accounting requires a nonblank producer reason.");
  const records = arrayValue(root.records, "Scenario accounting records").map(parseRecord);
  if (new Set(records.map((record) => record.atomId)).size !== records.length) throw new Error("Scenario accounting atom ids must be unique.");
  return {
    kind: SCENARIO_ACCOUNTING_KIND,
    accountingVersion: SCENARIO_ACCOUNTING_VERSION,
    scenario: { id: stringValue(scenario.id, "Scenario accounting scenario id"), sha256: sha256Value(scenario.sha256, "Scenario accounting Scenario SHA-256") },
    completeness,
    reason,
    records,
  };
}

export function validateAccountingAgainstScenario(
  accounting: ScenarioProjectionAccounting,
  declaration: ScenarioDeclarationLoaded,
): { unaccountedAtomIds: string[] } {
  if (accounting.scenario.id !== declaration.scenario.id || accounting.scenario.sha256 !== declaration.source.scenarioSha256) {
    throw new Error("Scenario accounting does not bind the exact loaded Scenario id and SHA-256.");
  }
  const declared = new Set(declaration.atoms.map((atom) => atom.id));
  for (const record of accounting.records) {
    if (!declared.has(record.atomId)) throw new Error(`Scenario accounting contains unknown atom ${record.atomId}.`);
  }
  const recorded = new Set(accounting.records.map((record) => record.atomId));
  const unaccountedAtomIds = declaration.atoms.map((atom) => atom.id).filter((id) => !recorded.has(id));
  if (accounting.completeness === "complete" && unaccountedAtomIds.length) {
    throw new Error(`Complete Scenario accounting omits: ${unaccountedAtomIds.join(", ")}.`);
  }
  return { unaccountedAtomIds };
}

function validateAccountingParentBinding(accounting: ScenarioProjectionAccounting, artifact: IntegrationArtifact, result: IntegrationResult): void {
  const scenarioInputs = result.inputs.operationInputs;
  if (scenarioInputs.length !== 1 || scenarioInputs[0].role !== "scenario" || scenarioInputs[0].status !== "available" || scenarioInputs[0].id !== accounting.scenario.id || scenarioInputs[0].sha256 !== accounting.scenario.sha256) {
    throw new Error("Scenario accounting does not bind the exact available Scenario input in its parent Result.");
  }
  const ownedMappings = new Set(result.mappings.map((mapping) => mapping.id));
  if (ownedMappings.size !== result.mappings.length || new Set(artifact.derivedFromMappings).size !== artifact.derivedFromMappings.length) throw new Error("Parent mapping identities must be unique.");
  const used = new Set<string>();
  for (const record of accounting.records) {
    for (const mappingId of record.mappingIds) {
      if (!ownedMappings.has(mappingId)) throw new Error(`Scenario accounting references foreign mapping ${mappingId}.`);
      used.add(mappingId);
    }
  }
  if (!sameSet(used, new Set(artifact.derivedFromMappings))) {
    throw new Error("Scenario accounting mapping union differs from parent artifact provenance.");
  }
}

function parseRecord(value: unknown, index: number): ScenarioProjectionAccountingRecord {
  const label = `Scenario accounting records[${index}]`;
  const item = objectValue(value, label);
  rejectUnknownKeys(item, ["atom_id", "disposition", "mapping_ids", "reason"], label);
  const disposition = stringValue(item.disposition, `${label}.disposition`);
  if (!["projected", "not_projected", "unsupported"].includes(disposition)) throw new Error(`Unsupported Scenario projection disposition: ${disposition}.`);
  const mappingIds = arrayValue(item.mapping_ids, `${label}.mapping_ids`).map((entry, mappingIndex) => stringValue(entry, `${label}.mapping_ids[${mappingIndex}]`));
  if (new Set(mappingIds).size !== mappingIds.length) throw new Error(`${label} mapping ids must be unique.`);
  const reason = optionalReason(item.reason, `${label}.reason`);
  if (disposition !== "projected" && (mappingIds.length || !reason)) throw new Error(`${disposition} requires empty mappings and a nonblank producer reason.`);
  return { atomId: stringValue(item.atom_id, `${label}.atom_id`), disposition: disposition as ScenarioProjectionDisposition, mappingIds, reason };
}

function objectValue(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  return value as Record<string, unknown>;
}
function arrayValue(value: unknown, label: string): unknown[] { if (!Array.isArray(value)) throw new Error(`${label} must be an array.`); return value; }
function stringValue(value: unknown, label: string): string { if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be a nonblank string.`); return value; }
function sha256Value(value: unknown, label: string): string { const parsed = stringValue(value, label); if (!SHA256.test(parsed)) throw new Error(`${label} must be a lowercase 64-character SHA-256.`); return parsed; }
function optionalReason(value: unknown, label: string): string | null { if (value === undefined || value === null) return null; const parsed = stringValue(value, label); if (!parsed.trim()) throw new Error(`${label} must be nonblank.`); return parsed; }
function rejectUnknownKeys(value: Record<string, unknown>, allowed: readonly string[], label: string): void { const unknown = Object.keys(value).filter((key) => !allowed.includes(key)); if (unknown.length) throw new Error(`${label} contains unsupported field(s): ${unknown.sort().join(", ")}.`); }
function sameSet(left: Set<string>, right: Set<string>): boolean { return left.size === right.size && [...left].every((item) => right.has(item)); }
