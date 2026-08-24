import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkNode } from "elkjs";

import { routedEdgeGeometry, type RoutedEdgeGeometry } from "../../graph/elkRouting";
import type { OperationsModel } from "./operationsModel";

export const OPERATION_MODE_NODE_WIDTH = 190;
export const OPERATION_MODE_NODE_HEIGHT = 74;

export interface OperationalStateLayout {
  positions: ReadonlyMap<string, { x: number; y: number }>;
  routes: ReadonlyMap<string, RoutedEdgeGeometry>;
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
      "elk.layered.cycleBreaking.strategy": "GREEDY",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.layered.feedbackEdges": "true",
      "elk.spacing.nodeNode": "76",
      "elk.spacing.edgeEdge": "24",
      "elk.spacing.edgeNode": "34",
      "elk.layered.spacing.nodeNodeBetweenLayers": "170",
      "elk.layered.spacing.edgeNodeBetweenLayers": "38",
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
      labels: [{
        id: `${transition.key}:label`,
        text: transition.reason,
        width: edgeLabelWidth(transition.reason),
        height: 20,
      }],
    })),
  };

  const result = await elk.layout(graph);
  const positions = new Map<string, { x: number; y: number }>();
  for (const node of result.children ?? []) {
    positions.set(node.id, { x: node.x ?? 0, y: node.y ?? 0 });
  }

  const routes = new Map<string, RoutedEdgeGeometry>();
  for (const edge of result.edges ?? []) {
    const route = routedEdgeGeometry(edge);
    if (route) {
      routes.set(edge.id, route);
    }
  }
  return { positions, routes };
}

function edgeLabelWidth(label: string): number {
  return Math.max(76, Math.min(210, label.length * 6 + 16));
}
