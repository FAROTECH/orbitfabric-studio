import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkNode } from "elkjs";

import { entityKey, type EntityKey } from "../mission/entityRef";
import { relationshipPresentation } from "../mission/relationshipPresentation";
import { routedEdgeGeometry, type RoutedEdgeGeometry } from "./elkRouting";
import type { ContextGraphModel } from "./contextGraphModel";

export const CONTEXT_NODE_WIDTH = 208;
export const CONTEXT_NODE_HEIGHT = 78;

export interface ContextGraphPosition {
  x: number;
  y: number;
}

export interface ContextGraphLayout {
  positions: ReadonlyMap<EntityKey, ContextGraphPosition>;
  routes: ReadonlyMap<string, RoutedEdgeGeometry>;
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
      "elk.layered.cycleBreaking.strategy": "GREEDY",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.layered.feedbackEdges": "true",
      "elk.spacing.nodeNode": "62",
      "elk.spacing.edgeEdge": "22",
      "elk.spacing.edgeNode": "32",
      "elk.layered.spacing.nodeNodeBetweenLayers": "150",
      "elk.layered.spacing.edgeNodeBetweenLayers": "36",
    },
    children: model.nodes.map((node) => ({
      id: node.key,
      width: CONTEXT_NODE_WIDTH,
      height: CONTEXT_NODE_HEIGHT,
    })),
    edges: model.edges.map((edge) => {
      const label =
        relationshipPresentation(edge.relationshipType)?.forwardLabel ?? edge.relationshipType;
      return {
        id: edge.relationshipId,
        sources: [entityKey(edge.source)],
        targets: [entityKey(edge.target)],
        labels: [{
          id: `${edge.relationshipId}:label`,
          text: label,
          width: Math.max(76, Math.min(210, label.length * 6 + 16)),
          height: 20,
        }],
      };
    }),
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

  const routes = new Map<string, RoutedEdgeGeometry>();
  for (const edge of result.edges ?? []) {
    const route = routedEdgeGeometry(edge, rootX, rootY);
    if (route) {
      routes.set(edge.id, route);
    }
  }

  return { positions, routes };
}
