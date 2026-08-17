import { useEffect, useMemo, useState } from "react";

import { entityKey, type EntityKey, type EntityRef } from "../mission/entityRef";
import type { MissionSession } from "../mission/MissionSession";
import { relationshipPresentation } from "../mission/relationshipPresentation";
import type { ContextPathStep } from "../mission/selection";
import {
  buildContextGraphModel,
  expandContextEntity,
  findContextPath,
  initialContextExpansion,
  type ContextGraphModel,
  type ContextGraphNode,
} from "./contextGraphModel";

interface ContextMapProps {
  session: MissionSession;
  root: EntityRef;
  current: EntityRef;
  contextPath: readonly ContextPathStep[];
  onNavigate: (subject: EntityRef, path: readonly ContextPathStep[]) => void;
}

interface PositionedNode extends ContextGraphNode {
  x: number;
  y: number;
}

interface GraphLayout {
  width: number;
  height: number;
  nodes: readonly PositionedNode[];
  positions: ReadonlyMap<EntityKey, PositionedNode>;
}

const NODE_WIDTH = 174;
const NODE_HEIGHT = 68;
const RING_GAP = 190;
const CANVAS_PADDING = 130;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function ContextMap({
  session,
  root,
  current,
  contextPath,
  onNavigate,
}: ContextMapProps) {
  const rootKey = entityKey(root);
  const [expanded, setExpanded] = useState<ReadonlySet<EntityKey>>(() =>
    minimumExpansionForPath(root, contextPath),
  );

  useEffect(() => {
    setExpanded(minimumExpansionForPath(root, contextPath));
  }, [rootKey, session.sessionId]);

  useEffect(() => {
    setExpanded((currentExpanded) => {
      const next = new Set(currentExpanded);
      next.add(rootKey);
      for (const step of contextPath) {
        next.add(entityKey(step.from));
        next.add(entityKey(step.to));
      }
      return next;
    });
  }, [contextPath, rootKey]);

  const model = useMemo(
    () => buildContextGraphModel(session, root, expanded),
    [expanded, root, session],
  );
  const layout = useMemo(() => layoutContextGraph(model), [model]);
  const visibleKeys = useMemo(
    () => new Set(model.nodes.map((node) => node.key)),
    [model.nodes],
  );

  return (
    <section className="context-map" aria-label="Context Map">
      <header className="context-map-header">
        <div>
          <p className="eyebrow">Context Map</p>
          <h2>Local mission context</h2>
          <p>
            Only explicit Core-owned relationships around this investigation are shown. Expand a
            node to reveal its immediate neighborhood.
          </p>
        </div>
        <div className="context-map-stats">
          <span>{model.nodes.length} nodes</span>
          <span>{model.edges.length} relationships</span>
          <button
            type="button"
            className="secondary-action"
            onClick={() => setExpanded(minimumExpansionForPath(root, contextPath))}
          >
            Reset map
          </button>
        </div>
      </header>

      <div className="context-map-canvas" tabIndex={0}>
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          role="img"
          aria-label={`Relationship context around ${displayName(session, root)}`}
        >
          <defs>
            <marker
              id="context-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="context-arrow-marker" />
            </marker>
          </defs>

          <g className="context-map-edges">
            {model.edges.map((edge) => {
              const source = layout.positions.get(entityKey(edge.source));
              const target = layout.positions.get(entityKey(edge.target));
              if (!source || !target) {
                return null;
              }

              const geometry = edgeGeometry(source, target);
              const presentation = relationshipPresentation(edge.relationshipType);
              const label = presentation?.forwardLabel ?? edge.relationshipType;
              const inPath = contextPath.some(
                (step) => step.relationshipId === edge.relationshipId,
              );

              return (
                <g
                  key={edge.relationshipId}
                  className={`context-map-edge${inPath ? " is-in-path" : ""}`}
                >
                  <line
                    x1={geometry.x1}
                    y1={geometry.y1}
                    x2={geometry.x2}
                    y2={geometry.y2}
                    markerEnd="url(#context-arrow)"
                  />
                  <foreignObject
                    x={geometry.labelX - 70}
                    y={geometry.labelY - 13}
                    width="140"
                    height="26"
                    className="context-edge-label-object"
                  >
                    <div className="context-edge-label" title={edge.relationshipType}>
                      {label}
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </g>

          <g className="context-map-nodes">
            {layout.nodes.map((node) => (
              <ContextMapNode
                key={node.key}
                session={session}
                node={node}
                model={model}
                current={entityKey(current) === node.key}
                root={rootKey === node.key}
                expanded={expanded.has(node.key)}
                expandable={hasHiddenNeighbor(session, node.entity, visibleKeys)}
                onSelect={() => {
                  const path = findContextPath(model, node.entity);
                  if (path !== null) {
                    onNavigate(node.entity, path);
                  }
                }}
                onExpand={() =>
                  setExpanded((currentExpanded) =>
                    expandContextEntity(currentExpanded, node.entity),
                  )
                }
              />
            ))}
          </g>
        </svg>
      </div>

      <footer className="context-map-footer">
        <span>
          Root <strong>{displayName(session, root)}</strong>
        </span>
        <span>
          Current <strong>{displayName(session, current)}</strong>
        </span>
        <span>Arrow direction follows the declared Core relationship.</span>
      </footer>
    </section>
  );
}

function ContextMapNode({
  session,
  node,
  current,
  root,
  expanded,
  expandable,
  onSelect,
  onExpand,
}: {
  session: MissionSession;
  node: PositionedNode;
  model: ContextGraphModel;
  current: boolean;
  root: boolean;
  expanded: boolean;
  expandable: boolean;
  onSelect: () => void;
  onExpand: () => void;
}) {
  const record = session.readModel.entityRecordsByKey.get(node.key);
  const classes = [
    "context-node",
    root ? "is-root" : "",
    current ? "is-current" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <foreignObject
      x={node.x - NODE_WIDTH / 2}
      y={node.y - NODE_HEIGHT / 2}
      width={NODE_WIDTH}
      height={NODE_HEIGHT}
      className="context-node-object"
    >
      <div className={classes}>
        <button
          type="button"
          className="context-node-main"
          onClick={onSelect}
          title={`${node.entity.domain}:${node.entity.id}`}
        >
          <span className="context-node-type">
            {humanize(record?.entity_type ?? node.entity.domain)}
          </span>
          <strong>{record?.display_name ?? node.entity.id}</strong>
          <code>{node.entity.id}</code>
        </button>
        {expandable ? (
          <button
            type="button"
            className="context-node-expand"
            onClick={onExpand}
            aria-label={`Expand context around ${record?.display_name ?? node.entity.id}`}
            title={expanded ? "Expand further if new relationships become available" : "Expand context"}
          >
            +
          </button>
        ) : null}
      </div>
    </foreignObject>
  );
}

function minimumExpansionForPath(
  root: EntityRef,
  contextPath: readonly ContextPathStep[],
): ReadonlySet<EntityKey> {
  const next = new Set(initialContextExpansion(root));
  for (const step of contextPath) {
    next.add(entityKey(step.from));
    next.add(entityKey(step.to));
  }
  return next;
}

function layoutContextGraph(model: ContextGraphModel): GraphLayout {
  const maxDepth = model.nodes.reduce(
    (maximum, node) =>
      Number.isFinite(node.depth) ? Math.max(maximum, node.depth) : maximum,
    0,
  );
  const radius = Math.max(RING_GAP, maxDepth * RING_GAP);
  const width = Math.max(900, radius * 2 + CANVAS_PADDING * 2 + NODE_WIDTH);
  const height = Math.max(620, radius * 2 + CANVAS_PADDING * 2 + NODE_HEIGHT);
  const centerX = width / 2;
  const centerY = height / 2;

  const depthCounts = new Map<number, number>();
  const nodes: PositionedNode[] = [];

  for (const node of model.nodes) {
    if (node.depth === 0) {
      nodes.push({ ...node, x: centerX, y: centerY });
      continue;
    }

    const depth = Number.isFinite(node.depth) ? node.depth : maxDepth + 1;
    const index = depthCounts.get(depth) ?? 0;
    depthCounts.set(depth, index + 1);

    const angle = index * GOLDEN_ANGLE + depth * 0.53;
    const nodeRadius = RING_GAP * depth;
    nodes.push({
      ...node,
      x: centerX + Math.cos(angle) * nodeRadius,
      y: centerY + Math.sin(angle) * nodeRadius,
    });
  }

  return {
    width,
    height,
    nodes,
    positions: new Map(nodes.map((node) => [node.key, node])),
  };
}

function edgeGeometry(source: PositionedNode, target: PositionedNode) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const ux = dx / distance;
  const uy = dy / distance;
  const sourcePadding = Math.min(NODE_WIDTH, NODE_HEIGHT) * 0.58;
  const targetPadding = Math.min(NODE_WIDTH, NODE_HEIGHT) * 0.65;

  const x1 = source.x + ux * sourcePadding;
  const y1 = source.y + uy * sourcePadding;
  const x2 = target.x - ux * targetPadding;
  const y2 = target.y - uy * targetPadding;

  return {
    x1,
    y1,
    x2,
    y2,
    labelX: (x1 + x2) / 2,
    labelY: (y1 + y2) / 2,
  };
}

function hasHiddenNeighbor(
  session: MissionSession,
  entity: EntityRef,
  visibleKeys: ReadonlySet<EntityKey>,
): boolean {
  const key = entityKey(entity);

  for (const relationship of session.readModel.outgoingByEntity.get(key) ?? []) {
    if (!visibleKeys.has(entityKey(relationship.to))) {
      return true;
    }
  }

  for (const relationship of session.readModel.incomingByEntity.get(key) ?? []) {
    if (!visibleKeys.has(entityKey(relationship.from))) {
      return true;
    }
  }

  return false;
}

function displayName(session: MissionSession, entity: EntityRef): string {
  return session.readModel.entityRecordsByKey.get(entityKey(entity))?.display_name ?? entity.id;
}

function humanize(value: string): string {
  return value.replaceAll("_", " ");
}
