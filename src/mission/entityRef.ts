export interface EntityRef {
  domain: string;
  id: string;
}

export type EntityKey = string;

export function entityKey(ref: EntityRef): EntityKey {
  return `${ref.domain}\u0000${ref.id}`;
}

export function sameEntity(left: EntityRef | null, right: EntityRef | null): boolean {
  if (left === null || right === null) {
    return left === right;
  }
  return left.domain === right.domain && left.id === right.id;
}
