import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import type {
  GeneratedArtifactClass,
  GeneratedArtifactEntry,
  GeneratedArtifactInventory,
  GeneratedArtifactKnownStatus,
  GeneratedArtifactProvenanceSource,
} from "./types/workspace";

const artifactClassOrder: GeneratedArtifactClass[] = [
  "reports",
  "logs",
  "docs",
  "runtime",
  "ground",
  "unknown",
];

const documentedArtifactPaths = new Set([
  "reports/lint_report.json",
  "reports/model_summary.json",
  "reports/entity_index.json",
  "reports/relationship_manifest.json",
  "reports/orbitfabric_studio_lint_report.json",
  "reports/orbitfabric_studio_model_summary.json",
  "reports/orbitfabric_studio_entity_index.json",
  "reports/orbitfabric_studio_relationship_manifest.json",
  "docs/telemetry.md",
  "docs/commands.md",
  "docs/events.md",
  "docs/faults.md",
  "docs/modes.md",
  "docs/packets.md",
  "docs/payloads.md",
  "docs/data_products.md",
  "docs/contacts.md",
  "docs/commandability.md",
  "docs/data_flow.md",
  "runtime/cpp17/runtime_contract_manifest.json",
  "runtime/cpp17/include/orbitfabric/generated/mission_ids.hpp",
  "runtime/cpp17/include/orbitfabric/generated/mission_enums.hpp",
  "runtime/cpp17/include/orbitfabric/generated/mission_registries.hpp",
  "runtime/cpp17/include/orbitfabric/generated/command_args.hpp",
  "runtime/cpp17/include/orbitfabric/generated/adapter_interfaces.hpp",
  "runtime/cpp17/CMakeLists.txt",
  "runtime/cpp17/src/orbitfabric_runtime_contract_smoke.cpp",
  "ground/generic/ground_contract_manifest.json",
  "ground/generic/README.md",
  "ground/generic/dictionaries/telemetry_dictionary.json",
  "ground/generic/dictionaries/command_dictionary.json",
  "ground/generic/dictionaries/event_dictionary.json",
  "ground/generic/dictionaries/fault_dictionary.json",
  "ground/generic/dictionaries/data_product_dictionary.json",
  "ground/generic/dictionaries/packet_dictionary.json",
  "ground/generic/csv/telemetry_dictionary.csv",
  "ground/generic/csv/command_dictionary.csv",
  "ground/generic/csv/event_dictionary.csv",
  "ground/generic/csv/fault_dictionary.csv",
  "ground/generic/csv/data_product_dictionary.csv",
  "ground/generic/csv/packet_dictionary.csv",
  "ground/generic/ground_dictionaries.md",
]);

interface GeneratedArtifactExplorerPanelProps {
  workspacePath: string;
}

type ClassifiedGeneratedArtifactEntry = GeneratedArtifactEntry & {
  known_status: GeneratedArtifactKnownStatus;
  classification_reason: string;
  provenance: {
    source: GeneratedArtifactProvenanceSource;
    detail: string | null;
  };
};

interface ClassifiedArtifactCounts {
  knownArtifacts: number;
  unknownArtifacts: number;
}

export function GeneratedArtifactExplorerPanel({
  workspacePath,
}: GeneratedArtifactExplorerPanelProps) {
  const [inventory, setInventory] = useState<GeneratedArtifactInventory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const classifiedArtifacts = classifyGeneratedArtifacts(inventory?.artifacts ?? []);
  const groupedArtifacts = groupArtifactsByClass(classifiedArtifacts);
  const classifiedCounts = countClassifiedArtifacts(classifiedArtifacts);

  async function handleInspectGeneratedArtifacts() {
    setError(null);
    setIsInspecting(true);

    try {
      const result = await invoke<GeneratedArtifactInventory>(
        "inspect_generated_artifacts",
        { workspacePath },
      );
      setInventory(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsInspecting(false);
    }
  }

  return (
    <section className="entry-section" aria-label="Generated Artifact Explorer">
      <div className="file-viewer-header">
        <div>
          <h3>Generated Artifact Explorer</h3>
          <p>
            Read-only inventory of files already present under `generated/`.
            Studio lists artifact metadata and conservative classes. It does not
            generate files, edit files or infer Mission Model semantics from
            generated artifacts.
          </p>
        </div>
        <span className="status-pill">Read-only</span>
      </div>

      <div className="command-actions">
        <button
          type="button"
          onClick={handleInspectGeneratedArtifacts}
          disabled={isInspecting}
        >
          {isInspecting ? "Inspecting generated artifacts..." : "Inspect generated artifacts"}
        </button>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {isInspecting ? <p className="empty-text">Inspecting generated artifacts...</p> : null}

      {!inventory && !isInspecting ? (
        <p className="empty-text">
          Run the generated artifact inspection to list files already present in
          the workspace `generated/` directory.
        </p>
      ) : null}

      {inventory ? (
        <>
          <div className="summary-grid">
            <ArtifactSummaryItem
              label="Generated directory"
              value={inventory.generated_dir ?? "Not detected"}
            />
            <ArtifactSummaryItem
              label="Total artifacts"
              value={String(inventory.counts.total_artifacts)}
            />
            <ArtifactSummaryItem
              label="Known artifacts"
              value={String(classifiedCounts.knownArtifacts)}
            />
            <ArtifactSummaryItem
              label="Unknown artifacts"
              value={String(classifiedCounts.unknownArtifacts)}
            />
            <ArtifactSummaryItem
              label="Previewable"
              value={String(inventory.counts.previewable_artifacts)}
            />
            <ArtifactSummaryItem
              label="Not previewable"
              value={String(inventory.counts.not_previewable_artifacts)}
            />
          </div>

          {inventory.warnings.length > 0 ? (
            <div className="warning-box">
              <h3>Generated artifact warnings</h3>
              <ul>
                {inventory.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {inventory.artifacts.length === 0 ? (
            <p className="empty-text">No generated artifacts were reported.</p>
          ) : (
            artifactClassOrder.map((artifactClass) => (
              <GeneratedArtifactClassSection
                key={artifactClass}
                artifactClass={artifactClass}
                artifacts={groupedArtifacts[artifactClass] ?? []}
              />
            ))
          )}
        </>
      ) : null}
    </section>
  );
}

function GeneratedArtifactClassSection({
  artifactClass,
  artifacts,
}: {
  artifactClass: GeneratedArtifactClass;
  artifacts: ClassifiedGeneratedArtifactEntry[];
}) {
  return (
    <section className="entry-section" aria-label={`${artifactClass} generated artifacts`}>
      <div className="entry-main">
        <h3>{formatArtifactClass(artifactClass)}</h3>
        <span className="category-badge category-generatedOutput">
          {artifacts.length} artifacts
        </span>
      </div>

      {artifacts.length === 0 ? (
        <p className="empty-text">No artifacts in this class.</p>
      ) : (
        <ul className="entry-list">
          {artifacts.map((artifact) => (
            <li key={artifact.path}>
              <div className="entry-main">
                <strong>{artifact.name}</strong>
                <span className={`category-badge category-${knownStatusCategory(artifact)}`}>
                  {artifact.known_status}
                </span>
                <span className={`category-badge category-${previewStatusCategory(artifact)}`}>
                  {artifact.preview_status}
                </span>
              </div>
              <span className="entry-path">{artifact.relative_path}</span>
              <div className="command-meta">
                <span>size: {artifact.size_bytes} bytes</span>
                <span>extension: {artifact.extension ?? "none"}</span>
                <span>class: {artifact.artifact_class}</span>
                <span>classification: {artifact.classification_reason}</span>
                <span>provenance: {artifact.provenance.source}</span>
              </div>
              {artifact.provenance.detail ? <p>{artifact.provenance.detail}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ArtifactSummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function classifyGeneratedArtifacts(
  artifacts: GeneratedArtifactEntry[],
): ClassifiedGeneratedArtifactEntry[] {
  return artifacts.map((artifact) => classifyGeneratedArtifact(artifact));
}

function classifyGeneratedArtifact(
  artifact: GeneratedArtifactEntry,
): ClassifiedGeneratedArtifactEntry {
  const relativePath = normalizeGeneratedArtifactPath(artifact.relative_path);

  if (documentedArtifactPaths.has(relativePath)) {
    return knownArtifact(
      artifact,
      "documentedCorePath",
      "Known generated artifact matched by an explicitly documented Core output path.",
    );
  }

  if (relativePath.startsWith("reports/") && relativePath.endsWith("_report.json")) {
    return knownArtifact(
      artifact,
      "documentedCoreFileName",
      "Known generated report matched by the documented reports/*_report.json naming convention.",
    );
  }

  if (relativePath.startsWith("logs/") && relativePath.endsWith(".log")) {
    return knownArtifact(
      artifact,
      "documentedCoreFileName",
      "Known generated log matched by the documented logs/*.log artifact class.",
    );
  }

  return {
    ...artifact,
    known_status: "unknown",
    classification_reason:
      "Generated artifact did not match a documented Core output path or conservative documented filename pattern.",
    provenance: {
      source: "unknown",
      detail:
        "The file remains visible, but Studio does not interpret it as a known generated artifact.",
    },
  };
}

function knownArtifact(
  artifact: GeneratedArtifactEntry,
  provenanceSource: GeneratedArtifactProvenanceSource,
  classificationReason: string,
): ClassifiedGeneratedArtifactEntry {
  return {
    ...artifact,
    known_status: "known",
    classification_reason: classificationReason,
    provenance: {
      source: provenanceSource,
      detail:
        "Classification is limited to generated artifact identity. Studio does not infer Mission Model semantics, runtime behavior or ground behavior from this file.",
    },
  };
}

function normalizeGeneratedArtifactPath(relativePath: string): string {
  return relativePath.replace(/\\/g, "/");
}

function countClassifiedArtifacts(
  artifacts: ClassifiedGeneratedArtifactEntry[],
): ClassifiedArtifactCounts {
  return artifacts.reduce<ClassifiedArtifactCounts>(
    (counts, artifact) => {
      if (artifact.known_status === "known") {
        counts.knownArtifacts += 1;
      } else {
        counts.unknownArtifacts += 1;
      }

      return counts;
    },
    { knownArtifacts: 0, unknownArtifacts: 0 },
  );
}

function groupArtifactsByClass(
  artifacts: ClassifiedGeneratedArtifactEntry[],
): Record<GeneratedArtifactClass, ClassifiedGeneratedArtifactEntry[]> {
  return artifacts.reduce<Record<GeneratedArtifactClass, ClassifiedGeneratedArtifactEntry[]>>(
    (grouped, artifact) => {
      grouped[artifact.artifact_class].push(artifact);
      return grouped;
    },
    {
      reports: [],
      logs: [],
      docs: [],
      runtime: [],
      ground: [],
      unknown: [],
    },
  );
}

function formatArtifactClass(artifactClass: GeneratedArtifactClass): string {
  switch (artifactClass) {
    case "reports":
      return "Reports";
    case "logs":
      return "Logs";
    case "docs":
      return "Generated documentation";
    case "runtime":
      return "Runtime-facing artifacts";
    case "ground":
      return "Ground-facing artifacts";
    case "unknown":
      return "Unknown generated artifacts";
  }
}

function knownStatusCategory(artifact: ClassifiedGeneratedArtifactEntry) {
  return artifact.known_status === "known" ? "sourceModel" : "derivedReport";
}

function previewStatusCategory(artifact: ClassifiedGeneratedArtifactEntry) {
  return artifact.preview_status === "previewable" ? "generatedOutput" : "derivedReport";
}
