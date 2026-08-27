import type {
  CoreDiagnosticDto,
  EntityIndexDto,
  LintReportDto,
  RelationshipManifestDto,
} from "../core/contracts";
import { sameEntity, type EntityRef } from "../mission/entityRef";
import {
  type MissionSession,
  type SecondarySurfaceName,
  withEntityIndex,
  withLint,
  withRelationships,
  withSecondaryFailure,
} from "../mission/MissionSession";
import { resolveEntityContract } from "../mission/resolveEntityContract";
import {
  emptyStudioSelection,
  type ContextPathStep,
  type SelectionOrigin,
  type StudioSelection,
} from "../mission/selection";

export type MissionWorkspaceView = "overview" | "operations" | "explore" | "relations" | "integrations";

export interface MissionOpeningState {
  requestId: string;
  generation: number;
  selectedPath: string;
  isRefresh: boolean;
}

export interface MissionOpenFailure {
  message: string;
  diagnostics: CoreDiagnosticDto[];
}

export interface StudioState {
  activeSession: MissionSession | null;
  opening: MissionOpeningState | null;
  openFailure: MissionOpenFailure | null;
  selection: StudioSelection;
  operationsMode: EntityRef | null;
  view: MissionWorkspaceView;
}

export type StudioAction =
  | {
      type: "MISSION_OPEN_REQUESTED";
      opening: MissionOpeningState;
    }
  | {
      type: "MISSION_PRIMARY_COMMITTED";
      session: MissionSession;
    }
  | {
      type: "MISSION_OPEN_FAILED";
      requestId: string;
      failure: MissionOpenFailure;
    }
  | {
      type: "MISSION_ENTITY_INDEX_READY";
      sessionId: string;
      entityIndex: EntityIndexDto;
    }
  | {
      type: "MISSION_RELATIONSHIPS_READY";
      sessionId: string;
      relationships: RelationshipManifestDto;
    }
  | {
      type: "MISSION_LINT_READY";
      sessionId: string;
      lint: LintReportDto;
    }
  | {
      type: "MISSION_SECONDARY_FAILED";
      sessionId: string;
      surface: SecondarySurfaceName;
      message: string;
    }
  | {
      type: "SELECTION_CHANGED";
      subject: EntityRef | null;
      origin: SelectionOrigin | null;
    }
  | {
      type: "CONTEXT_EDGE_FOLLOWED";
      step: ContextPathStep;
      origin: SelectionOrigin;
    }
  | {
      type: "CONTEXT_PATH_REPLACED";
      subject: EntityRef;
      path: readonly ContextPathStep[];
      origin: SelectionOrigin;
    }
  | {
      type: "CONTEXT_PATH_TRUNCATED";
      subject: EntityRef;
      length: number;
      origin: SelectionOrigin;
    }
  | {
      type: "WORKSPACE_VIEW_CHANGED";
      view: MissionWorkspaceView;
    };

export const initialStudioState: StudioState = {
  activeSession: null,
  opening: null,
  openFailure: null,
  selection: emptyStudioSelection(),
  operationsMode: null,
  view: "overview",
};

export function studioReducer(state: StudioState, action: StudioAction): StudioState {
  switch (action.type) {
    case "MISSION_OPEN_REQUESTED":
      return {
        ...state,
        opening: action.opening,
        openFailure: null,
      };

    case "MISSION_PRIMARY_COMMITTED": {
      if (state.opening?.requestId !== action.session.sessionId) {
        return state;
      }

      const replacingSameMission =
        state.activeSession?.snapshot.mission?.id === action.session.snapshot.mission?.id;

      return {
        ...state,
        activeSession: action.session,
        opening: null,
        openFailure: null,
        selection: replacingSameMission
          ? reconcileSelectionWithPrimary(state.selection, action.session)
          : emptyStudioSelection(),
        operationsMode: replacingSameMission
          ? reconcileOperationsMode(state.operationsMode, action.session)
          : null,
        view: replacingSameMission ? state.view : "overview",
      };
    }

    case "MISSION_OPEN_FAILED":
      if (state.opening?.requestId !== action.requestId) {
        return state;
      }
      return {
        ...state,
        opening: null,
        openFailure: action.failure,
      };

    case "MISSION_ENTITY_INDEX_READY":
      return updateActiveSession(state, action.sessionId, (session) =>
        withEntityIndex(session, action.entityIndex),
      );

    case "MISSION_RELATIONSHIPS_READY": {
      if (state.activeSession?.sessionId !== action.sessionId) {
        return state;
      }

      const session = withRelationships(state.activeSession, action.relationships);
      return {
        ...state,
        activeSession: session,
        selection: reconcileSelectionWithRelationships(state.selection, session),
      };
    }

    case "MISSION_LINT_READY":
      return updateActiveSession(state, action.sessionId, (session) =>
        withLint(session, action.lint),
      );

    case "MISSION_SECONDARY_FAILED":
      return updateActiveSession(state, action.sessionId, (session) =>
        withSecondaryFailure(session, action.surface, action.message),
      );

    case "SELECTION_CHANGED":
      return {
        ...state,
        selection: {
          subject: action.subject,
          origin: action.origin,
          contextPath: [],
        },
        operationsMode:
          action.subject?.domain === "modes" ? action.subject : state.operationsMode,
      };

    case "CONTEXT_EDGE_FOLLOWED":
      return {
        ...state,
        selection: {
          subject: action.step.to,
          origin: action.origin,
          contextPath: [...state.selection.contextPath, action.step],
        },
        operationsMode:
          action.step.to.domain === "modes" ? action.step.to : state.operationsMode,
      };

    case "CONTEXT_PATH_REPLACED":
      return {
        ...state,
        selection: {
          subject: action.subject,
          origin: action.origin,
          contextPath: [...action.path],
        },
        operationsMode:
          action.subject.domain === "modes" ? action.subject : state.operationsMode,
      };

    case "CONTEXT_PATH_TRUNCATED":
      return {
        ...state,
        selection: {
          subject: action.subject,
          origin: action.origin,
          contextPath: state.selection.contextPath.slice(0, action.length),
        },
        operationsMode:
          action.subject.domain === "modes" ? action.subject : state.operationsMode,
      };

    case "WORKSPACE_VIEW_CHANGED":
      return {
        ...state,
        view: action.view,
      };
  }
}

function reconcileOperationsMode(
  operationsMode: EntityRef | null,
  session: MissionSession,
): EntityRef | null {
  if (operationsMode === null) {
    return null;
  }
  return resolveEntityContract(session.snapshot, operationsMode) === null
    ? null
    : operationsMode;
}

function reconcileSelectionWithPrimary(
  selection: StudioSelection,
  session: MissionSession,
): StudioSelection {
  if (selection.subject === null) {
    return selection;
  }

  if (resolveEntityContract(session.snapshot, selection.subject) === null) {
    return emptyStudioSelection();
  }

  if (selection.contextPath.length === 0) {
    return selection;
  }

  const root = selection.contextPath[0].from;
  if (resolveEntityContract(session.snapshot, root) === null) {
    return emptyStudioSelection();
  }

  const validPath: ContextPathStep[] = [];
  for (const step of selection.contextPath) {
    if (
      resolveEntityContract(session.snapshot, step.from) === null ||
      resolveEntityContract(session.snapshot, step.to) === null
    ) {
      break;
    }
    validPath.push(step);
  }

  return {
    subject: lastPathTarget(validPath, root),
    origin: selection.origin,
    contextPath: validPath,
  };
}

function reconcileSelectionWithRelationships(
  selection: StudioSelection,
  session: MissionSession,
): StudioSelection {
  if (selection.subject === null || selection.contextPath.length === 0) {
    return selection;
  }

  const root = selection.contextPath[0].from;
  const validPath: ContextPathStep[] = [];

  for (const step of selection.contextPath) {
    const relationship = session.readModel.relationshipsById.get(step.relationshipId);
    if (!relationship || !relationshipMatchesStep(relationship, step)) {
      break;
    }
    validPath.push(step);
  }

  return {
    subject: lastPathTarget(validPath, root),
    origin: selection.origin,
    contextPath: validPath,
  };
}

function lastPathTarget(path: readonly ContextPathStep[], fallback: EntityRef): EntityRef {
  return path.length > 0 ? path[path.length - 1].to : fallback;
}

function relationshipMatchesStep(
  relationship: RelationshipManifestDto["relationships"][number],
  step: ContextPathStep,
): boolean {
  if (step.direction === "forward") {
    return sameEntity(relationship.from, step.from) && sameEntity(relationship.to, step.to);
  }

  return sameEntity(relationship.to, step.from) && sameEntity(relationship.from, step.to);
}

function updateActiveSession(
  state: StudioState,
  sessionId: string,
  update: (session: MissionSession) => MissionSession,
): StudioState {
  if (state.activeSession?.sessionId !== sessionId) {
    return state;
  }

  return {
    ...state,
    activeSession: update(state.activeSession),
  };
}
