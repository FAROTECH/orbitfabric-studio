import type { GeneratedArtifactInventory } from "./types/workspace";

export interface GeneratedArtifactInventoryStoreSnapshot {
  workspacePath: string | null;
  inventory: GeneratedArtifactInventory | null;
}

type GeneratedArtifactInventoryListener = () => void;

let currentSnapshot: GeneratedArtifactInventoryStoreSnapshot = {
  workspacePath: null,
  inventory: null,
};

const listeners = new Set<GeneratedArtifactInventoryListener>();

export function publishGeneratedArtifactInventory(
  workspacePath: string,
  inventory: GeneratedArtifactInventory,
) {
  currentSnapshot = {
    workspacePath,
    inventory,
  };
  notifyGeneratedArtifactInventoryListeners();
}

export function clearGeneratedArtifactInventory(workspacePath?: string) {
  if (workspacePath && currentSnapshot.workspacePath !== workspacePath) {
    return;
  }

  currentSnapshot = {
    workspacePath: null,
    inventory: null,
  };
  notifyGeneratedArtifactInventoryListeners();
}

export function getGeneratedArtifactInventorySnapshot(): GeneratedArtifactInventoryStoreSnapshot {
  return currentSnapshot;
}

export function subscribeToGeneratedArtifactInventory(
  listener: GeneratedArtifactInventoryListener,
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function notifyGeneratedArtifactInventoryListeners() {
  for (const listener of listeners) {
    listener();
  }
}
