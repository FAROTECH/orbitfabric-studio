import type { ElkExtendedEdge, ElkPoint } from "elkjs";

export interface RoutedEdgeGeometry {
  points: readonly ElkPoint[];
  labelX: number;
  labelY: number;
}

export function routedEdgeGeometry(
  edge: ElkExtendedEdge,
  offsetX = 0,
  offsetY = 0,
): RoutedEdgeGeometry | null {
  const section = edge.sections?.[0];
  if (!section) {
    return null;
  }

  const points = [section.startPoint, ...(section.bendPoints ?? []), section.endPoint].map(
    (point) => ({ x: point.x - offsetX, y: point.y - offsetY }),
  );
  const label = edge.labels?.[0];
  const fallback = midpoint(points);

  return {
    points,
    labelX:
      label?.x !== undefined
        ? label.x + (label.width ?? 0) / 2 - offsetX
        : fallback.x,
    labelY:
      label?.y !== undefined
        ? label.y + (label.height ?? 0) / 2 - offsetY
        : fallback.y,
  };
}

function midpoint(points: readonly ElkPoint[]): ElkPoint {
  if (points.length === 0) {
    return { x: 0, y: 0 };
  }
  return points[Math.floor((points.length - 1) / 2)];
}
