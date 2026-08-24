import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkNode } from "elkjs";

import type { OperationsModel } from "./operationsModel";

export const OPERATION_MODE_NODE_WIDTH = 190;
export const OPERATION_MODE_NODE_HEIGHT = 74;

export interface OperationalStateLayout {
  positions: ReadonlyMap<string, { x: number; y: number }>;
}

const elk = new ELK();

export async function layoutOperationalStateMap(
  model: OperationsModel,
): Promise<OperationalStateLayout> {
  const graph: ElkNode = {
    id: "operational-state-map",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.spacing.nodeNode": "52",
      "elk.layered.spacing.nodeNodeBetweenLayers": "104",
    },
    children: model.modes.map((mode) => ({
      id: mode.ref.id,
      width: OPERATION_MODE_NODE_WIDTH,
      height: OPERATION_MODE_NODE_HEIGHT,
    })),
    edges: model.transitions.map((transition) => ({
      id: transition.key,
      sources: [transition.from],
      targets: [transition.to],
    })),
  };

  const result = await elk.layout(graph);
  const positions = new Map<string, { x: number; y: number }>();
  for (const node of result.children ?? []) {
    positions.set(node.id, { x: node.x ?? 0, y: node.y ?? 0 });
  }
  return { positions };
}
