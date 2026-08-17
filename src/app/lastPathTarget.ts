import type { EntityRef } from "../mission/entityRef";
import type { ContextPathStep } from "../mission/selection";

export function lastPathTarget(
  path: readonly ContextPathStep[],
  fallback: EntityRef,
): EntityRef {
  return path.length > 0 ? path[path.length - 1].to : fallback;
}
