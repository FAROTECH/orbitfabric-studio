import type { EntityRef } from "./entityRef";

export type SelectionOrigin =
  | "atlas"
  | "explorer"
  | "xray"
  | "context-map"
  | "search"
  | "operations"
  | "data-journey"
  | "replay";

export interface ContextPathStep {
  relationshipId: string;
  from: EntityRef;
  to: EntityRef;
  direction: "forward" | "inverse";
}

export interface StudioSelection {
  subject: EntityRef | null;
  origin: SelectionOrigin | null;
  contextPath: readonly ContextPathStep[];
}

export function emptyStudioSelection(): StudioSelection {
  return {
    subject: null,
    origin: null,
    contextPath: [],
  };
}
