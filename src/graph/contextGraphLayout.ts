import ELK, { type ElkNode } from "elkjs";

import { entityKey, type EntityKey } from "../mission/entityRef";
import type { ContextGraphModel } from "./contextGraphModel";

export const CONTEXT_NODE_WIDTH = 208;
export const CONTEXT_NODE_HEIGHT = 78;

export interface ContextGraphPosition {
  x: number;
  y: number;
}

export interface ContextGraphLayout {
  positions: ReadonlyMap<EntityKey, ContextGraphPosition>;
}

const elk = new ELK();

/**
 * Compute presentation-only positions for the local Context Map.
 *
 * The semantic graph remains ContextGraphModel and continues to contain only
 * Core-owned relationships. ELK receives that graph strictly as a layout input.
 * The selected investigation root is normalized back to (0, 0) after every
 * layout pass so progressive expansion does not move the user's anchor point.
 */
export async function layoutContextGraph(
  model: ContextGraphModel,
): Promise<ContextGraphLayout> {
  const graph: ElkNode = {
    id: "context-map",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.spacing.nodeNode": "62",
      "elk.layered.spacing.nodeNodeBetweenLayers": "104",
    },
    children: model.nodes.map((node) => ({
      id: node.key,
      width: CONTEXT_NODE_WIDTH,
      height: CONTEXT_NODE_HEIGHT,
    })),
    edges: model.edges.map((edge) => ({
      id: edge.relationshipId,
      sources: [entityKey(edge.source)],
      targets: [entityKey(edge.target)],
    })),
  };

  const result = await elk.layout(graph);
  const rootKey = entityKey(model.root);
  const rootNode = result.children?.find((node) => node.id === rootKey);
  const rootX = rootNode?.x ?? 0;
  const rootY = rootNode?.y ?? 0;

  const positions = new Map<EntityKey, ContextGraphPosition>();
  for (const node of result.children ?? []) {
    positions.set(node.id, {
      x: (node.x ?? 0) - rootX,
      y: (node.y ?? 0) - rootY,
    });
  }

  return { positions };
}
