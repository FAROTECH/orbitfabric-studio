import type { EntityRef } from "../../mission/entityRef";
import type { MissionSession } from "../../mission/MissionSession";
import type { ContextPathStep } from "../../mission/selection";
import { ContextMap } from "../../graph/ContextMap";
import { RelationshipExplorer } from "./RelationshipExplorer";

interface RelationsWorkspaceProps {
  session: MissionSession;
  subject: EntityRef | null;
  contextPath: readonly ContextPathStep[];
  onFollow: (step: ContextPathStep) => void;
  onNavigateMap: (subject: EntityRef, path: readonly ContextPathStep[]) => void;
  onOpenExplore: () => void;
}

export function RelationsWorkspace({
  session,
  subject,
  contextPath,
  onFollow,
  onNavigateMap,
  onOpenExplore,
}: RelationsWorkspaceProps) {
  if (subject === null || session.readiness.relationships !== "ready") {
    return (
      <RelationshipExplorer
        session={session}
        subject={subject}
        contextPath={contextPath}
        onFollow={onFollow}
        onOpenExplore={onOpenExplore}
      />
    );
  }

  const root = contextPath[0]?.from ?? subject;

  return (
    <div className="relations-workspace">
      <ContextMap
        session={session}
        root={root}
        current={subject}
        contextPath={contextPath}
        onNavigate={onNavigateMap}
      />
      <RelationshipExplorer
        session={session}
        subject={subject}
        contextPath={contextPath}
        onFollow={onFollow}
        onOpenExplore={onOpenExplore}
      />
    </div>
  );
}
