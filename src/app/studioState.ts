import type { CoreDiagnosticDto, EntityIndexDto, LintReportDto, RelationshipManifestDto } from "../core/contracts";
import type { EntityRef } from "../mission/entityRef";
import {
  type MissionSession,
  type SecondarySurfaceName,
  withEntityIndex,
  withLint,
  withRelationships,
  withSecondaryFailure,
} from "../mission/MissionSession";
import {
  emptyStudioSelection,
  type SelectionOrigin,
  type StudioSelection,
} from "../mission/selection";

export type MissionWorkspaceView = "overview" | "explore" | "relations";

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
      type: "WORKSPACE_VIEW_CHANGED";
      view: MissionWorkspaceView;
    };

export const initialStudioState: StudioState = {
  activeSession: null,
  opening: null,
  openFailure: null,
  selection: emptyStudioSelection(),
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
        selection: replacingSameMission ? state.selection : emptyStudioSelection(),
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

    case "MISSION_RELATIONSHIPS_READY":
      return updateActiveSession(state, action.sessionId, (session) =>
        withRelationships(session, action.relationships),
      );

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
      };

    case "WORKSPACE_VIEW_CHANGED":
      return {
        ...state,
        view: action.view,
      };
  }
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
