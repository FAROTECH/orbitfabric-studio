import type {
  MissionDataFlowTraceabilityGroup,
  MissionDataFlowTraceabilityLink,
  MissionDataFlowWorkbenchLane,
  MissionDataFlowWorkbenchRecord,
  MissionDataFlowWorkbenchSnapshot,
  MissionDataFlowWorkbenchSourceSummary,
} from "./missionDataFlowWorkbenchModel";
import type { GeneratedArtifactEntry, GeneratedArtifactInventory } from "./types/workspace";

export function linkGeneratedArtifactsIntoWorkbenchSnapshot(
  snapshot: MissionDataFlowWorkbenchSnapshot,
  inventory: GeneratedArtifactInventory | null,
): MissionDataFlowWorkbenchSnapshot {
  const artifactRecords = createGeneratedArtifactRecords(inventory);
  const artifactTraceabilityGroup = createGeneratedArtifactTraceabilityGroup(inventory);
  const lanes = replaceGeneratedArtifactLane(snapshot.lanes, artifactRecords);
  const traceabilityGroups = replaceGeneratedOutputTraceabilityGroup(
    snapshot.traceability.groups,
    artifactTraceabilityGroup,
  );
  const traceabilityLinks = traceabilityGroups.flatMap((group) => group.links);

  return {
    ...snapshot,
    sources: replaceGeneratedArtifactSource(snapshot.sources, inventory),
    lanes,
    traceability: {
      groups: traceabilityGroups,
      counts: {
        groups: traceabilityGroups.length,
        links: traceabilityLinks.length,
        reportedLinks: traceabilityLinks.filter((link) => link.state === "reported").length,
        unavailableLinks: traceabilityLinks.filter((link) => link.state === "unavailable").length,
      },
    },
    counts: {
      ...snapshot.counts,
      generatedArtifacts: artifactRecords.length,
      traceabilityLinks: traceabilityLinks.length,
    },
  };
}

function replaceGeneratedArtifactLane(
  lanes: MissionDataFlowWorkbenchLane[],
  records: MissionDataFlowWorkbenchRecord[],
): MissionDataFlowWorkbenchLane[] {
  return lanes.map((lane) =>
    lane.id === "generated-artifacts"
      ? {
          ...lane,
          records,
          state: records.length > 0 ? "reported" : "not-reported",
          emptyDetail: "No generated artifact inventory has been loaded yet.",
        }
      : lane,
  );
}

function replaceGeneratedOutputTraceabilityGroup(
  groups: MissionDataFlowTraceabilityGroup[],
  generatedGroup: MissionDataFlowTraceabilityGroup,
): MissionDataFlowTraceabilityGroup[] {
  const hasGeneratedGroup = groups.some((group) => group.id === "generated-outputs");

  if (!hasGeneratedGroup) {
    return [...groups, generatedGroup];
  }

  return groups.map((group) => (group.id === "generated-outputs" ? generatedGroup : group));
}

function replaceGeneratedArtifactSource(
  sources: MissionDataFlowWorkbenchSourceSummary[],
  inventory: GeneratedArtifactInventory | null,
): MissionDataFlowWorkbenchSourceSummary[] {
  return sources.map((source) =>
    source.id === "generated-artifact-inventory"
      ? {
          ...source,
          state: inventory ? "reported" : "not-reported",
          detail: inventory
            ? `${inventory.counts.total_artifacts} artifacts linked into Workbench evidence`
            : "not loaded",
        }
      : source,
  );
}

function createGeneratedArtifactRecords(
  inventory: GeneratedArtifactInventory | null,
): MissionDataFlowWorkbenchRecord[] {
  return inventory?.artifacts.map(toGeneratedArtifactRecord) ?? [];
}

function toGeneratedArtifactRecord(
  artifact: GeneratedArtifactEntry,
): MissionDataFlowWorkbenchRecord {
  return {
    id: `generated-artifact:${artifact.relative_path}`,
    label: artifact.name,
    kind: "generated-artifact",
    evidenceKind: "artifact-evidence",
    provenance: "generated-artifact-inventory",
    state: artifact.known_status === "known" ? "reported" : "unavailable",
    detail: `${artifact.artifact_class}, ${artifact.preview_status}, ${artifact.classification_reason}`,
    raw: artifact,
  };
}

function createGeneratedArtifactTraceabilityGroup(
  inventory: GeneratedArtifactInventory | null,
): MissionDataFlowTraceabilityGroup {
  const links = inventory?.artifacts.map(toGeneratedArtifactTraceabilityLink) ?? [];

  return {
    id: "generated-outputs",
    title: "Generated output evidence",
    evidenceKind: "artifact-evidence",
    provenance: "generated-artifact-inventory",
    state: links.length > 0 ? "reported" : "not-reported",
    links,
    emptyDetail: "No generated artifact inventory has been loaded yet.",
  };
}

function toGeneratedArtifactTraceabilityLink(
  artifact: GeneratedArtifactEntry,
): MissionDataFlowTraceabilityLink {
  return {
    id: `traceability:generated-artifact:${artifact.relative_path}`,
    label: artifact.name,
    kind: "generated-artifact",
    evidenceKind: "artifact-evidence",
    provenance: "generated-artifact-inventory",
    state: artifact.known_status === "known" ? "reported" : "unavailable",
    from: {
      label: artifact.artifact_class,
      domain: "generated_artifact_class",
      id: artifact.artifact_class,
      recordId: `generated-artifact-class:${artifact.artifact_class}`,
    },
    to: {
      label: artifact.relative_path,
      domain: "generated_artifact",
      id: artifact.relative_path,
      recordId: `generated-artifact:${artifact.relative_path}`,
    },
    detail: `${artifact.artifact_class}, ${artifact.preview_status}, ${artifact.classification_reason}`,
    raw: artifact,
  };
}
