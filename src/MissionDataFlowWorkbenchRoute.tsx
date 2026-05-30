import { ProvenanceBadge, StatusBadge } from "./Badges";
import { MissionDataFlowWorkbenchSurface } from "./MissionDataFlowWorkbenchSurface";
import type { MissionDataFlowWorkbenchSnapshot } from "./missionDataFlowWorkbenchModel";

export function MissionDataFlowWorkbenchRoute({
  snapshot,
}: {
  snapshot: MissionDataFlowWorkbenchSnapshot;
}) {
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
            Standalone read-only Workbench surface for the v0.13.0
            Evidence-integrated Workbench release. It renders a Core-derived
            snapshot and does not introduce authoring, graph editing or private
            data-flow inference.
          </p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="READ-ONLY" />
          <ProvenanceBadge label="CORE-DERIVED" />
          <StatusBadge label="EVIDENCE WORKBENCH" />
        </div>
      </div>

      <MissionDataFlowWorkbenchSurface snapshot={snapshot} />
    </section>
  );
}
