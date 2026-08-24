import {
  BaseEdge,
  type Edge,
  type EdgeProps,
  type EdgeTypes,
} from "@xyflow/react";

import type { RoutedEdgeGeometry } from "./elkRouting";

export type ElkRoutedEdgeData = Record<string, unknown> & {
  route: RoutedEdgeGeometry;
};

export type ElkRoutedFlowEdge = Edge<ElkRoutedEdgeData, "elk-routed">;

export const routedEdgeTypes: EdgeTypes = {
  "elk-routed": RoutedEdge,
};

function RoutedEdge({
  id,
  data,
  label,
  markerEnd,
  style,
  sourceX,
  sourceY,
  targetX,
  targetY,
}: EdgeProps<ElkRoutedFlowEdge>) {
  const points = data?.route.points ?? [
    { x: sourceX, y: sourceY },
    { x: targetX, y: targetY },
  ];
  const labelX = data?.route.labelX ?? (sourceX + targetX) / 2;
  const labelY = data?.route.labelY ?? (sourceY + targetY) / 2;

  return (
    <BaseEdge
      id={id}
      path={roundedOrthogonalPath(points)}
      markerEnd={markerEnd}
      style={style}
      label={label}
      labelX={labelX}
      labelY={labelY}
      labelShowBg
      labelBgPadding={[5, 3]}
      labelBgBorderRadius={3}
    />
  );
}

function roundedOrthogonalPath(
  points: readonly { x: number; y: number }[],
  radius = 8,
): string {
  const first = points[0];
  if (!first) {
    return "";
  }
  if (points.length === 1) {
    return `M ${first.x} ${first.y}`;
  }

  const commands = [`M ${first.x} ${first.y}`];
  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1];
    const corner = points[index];
    const next = points[index + 1];
    const incoming = Math.hypot(corner.x - previous.x, corner.y - previous.y);
    const outgoing = Math.hypot(next.x - corner.x, next.y - corner.y);
    const cornerRadius = Math.min(radius, incoming / 2, outgoing / 2);
    const before = pointTowards(corner, previous, cornerRadius);
    const after = pointTowards(corner, next, cornerRadius);
    commands.push(`L ${before.x} ${before.y}`);
    commands.push(`Q ${corner.x} ${corner.y} ${after.x} ${after.y}`);
  }

  const last = points[points.length - 1];
  commands.push(`L ${last.x} ${last.y}`);
  return commands.join(" ");
}

function pointTowards(
  from: { x: number; y: number },
  to: { x: number; y: number },
  distance: number,
): { x: number; y: number } {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  if (length === 0) {
    return from;
  }
  const ratio = distance / length;
  return {
    x: from.x + (to.x - from.x) * ratio,
    y: from.y + (to.y - from.y) * ratio,
  };
}
