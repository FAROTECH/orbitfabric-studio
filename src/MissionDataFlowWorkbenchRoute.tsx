import { useSyncExternalStore } from "react";

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
      className="active-surface-frame mission-data-flow-route-frame"
      aria-label="Mission Data Flow Workbench dedicated surface"
    >
      <MissionDataFlowWorkbenchSurface snapshot={linkedSnapshot} />
    </section>
  );
}
