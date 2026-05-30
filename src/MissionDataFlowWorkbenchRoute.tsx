import { useSyncExternalStore } from "react";

import { ProvenanceBadge, StatusBadge } from "./Badges";
import { MissionDataFlowWorkbenchSurface } from "./MissionDataFlowWorkbenchSurface";
import { linkGeneratedArtifactsIntoWorkbenchSnapshot } from "./missionDataFlowWorkbenchArtifactLinkage";
import type { MissionDataFlowWorkbenchSnapshot } from "./missionDataFlowWorkbenchModel";
import {
  getGeneratedArtifactInventorySnapshot,
  subscribeToGeneratedArtifactInventory,
} from "./generatedArtifactInventoryStore";

export function MissionDataFlowWorkbenchRoute({
  snapshot,
}: {
  snapshot: MissionDataFlowWorkbenchSnapshot;
}) {
  const artifactInventorySnapshot = useSyncExternalStore(
    subscribeToGeneratedArtifactInventory,
    getGeneratedArtifactInventorySnapshot,
  );
  const linkedSnapshot = linkGeneratedArtifactsIntoWorkbenchSnapshot(
    snapshot,
    artifactInventorySnapshot.inventory,
  );

  return (
    <section
      className="active-surface-frame"
      aria-label="Mission Data Flow Workbench dedicated surface"
    >
      <div className="file-viewer-header">
        <div>
          <span className="cockpit-eyebrow">Dedicated traceability workbench</span>
          <h2>Mission Data Flow Workbench</h2>
          <p>
            Read-only engineering surface for reported relationships, scenario
            data-flow evidence, validation evidence, coverage evidence and generated
            artifact traceability. Studio renders the reported contract posture; it
            does not author the Mission Model or infer missing links.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="READ-ONLY" />
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="TRACEABILITY" />
        </div>
      </div>

      <section className="entry-section muted-section" aria-label="Traceability posture">
        <div className="entry-main">
          <div>
            <span className="cockpit-eyebrow">Traceability posture</span>
            <h3>Reported evidence rails</h3>
            <p>
              Compact route-level summary for the Workbench before entering the
              canvas. Counts are copied from the linked read-only snapshot.
            </p>
          </div>
          <StatusBadge label={`${linkedSnapshot.traceability.counts.links} LINKS`} />
        </div>
        <div className="summary-grid">
          <div className="summary-item">
            <span>Relationship records</span>
            <strong>{linkedSnapshot.counts.relationshipRecords}</strong>
          </div>
          <div className="summary-item">
            <span>Scenario evidence</span>
            <strong>{linkedSnapshot.counts.scenarioDataFlowEvidenceRecords}</strong>
          </div>
          <div className="summary-item">
            <span>Generated artifacts</span>
            <strong>{linkedSnapshot.counts.generatedArtifacts}</strong>
          </div>
          <div className="summary-item">
            <span>Reported links</span>
            <strong>{linkedSnapshot.traceability.counts.reportedLinks}</strong>
          </div>
          <div className="summary-item">
            <span>Unavailable links</span>
            <strong>{linkedSnapshot.traceability.counts.unavailableLinks}</strong>
          </div>
          <div className="summary-item">
            <span>Inference</span>
            <strong>{linkedSnapshot.boundary.inference}</strong>
          </div>
        </div>
      </section>

      {artifactInventorySnapshot.inventory ? (
        <section className="entry-section muted-section" aria-label="Generated artifact linkage">
          <h3>Generated artifact linkage</h3>
          <p>
            The Workbench is consuming the latest read-only generated artifact
            inventory reported by Studio. Artifact files are not edited,
            regenerated or interpreted as Mission Model source semantics.
          </p>
          <div className="summary-grid">
            <div className="summary-item">
              <span>Inventory workspace</span>
              <strong>{artifactInventorySnapshot.workspacePath ?? "not reported"}</strong>
            </div>
            <div className="summary-item">
              <span>Linked artifacts</span>
              <strong>{artifactInventorySnapshot.inventory.counts.total_artifacts}</strong>
            </div>
          </div>
        </section>
      ) : null}

      <MissionDataFlowWorkbenchSurface snapshot={linkedSnapshot} />
    </section>
  );
}
