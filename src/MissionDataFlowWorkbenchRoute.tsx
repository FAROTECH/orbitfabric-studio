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
          <span className="cockpit-eyebrow">Dedicated surface</span>
          <h2>Mission Data Flow Workbench</h2>
          <p>
            Standalone read-only Workbench surface for v0.14.0 artifact
            traceability integration. It renders a Core-derived snapshot and links
            generated artifact inventory when that inventory has been reported by
            the dedicated Generated Artifacts surface.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="READ-ONLY" />
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="TRACEABILITY" />
        </div>
      </div>

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
