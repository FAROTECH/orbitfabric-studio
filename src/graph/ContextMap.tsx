import { useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";

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
} from "./contextGraphModel";
import {
  CONTEXT_NODE_HEIGHT,
  CONTEXT_NODE_WIDTH,
  layoutContextGraph,
  type ContextGraphLayout,
} from "./contextGraphLayout";

interface ContextMapProps {
  session: MissionSession;
  root: EntityRef;
  current: EntityRef;
  contextPath: readonly ContextPathStep[];
  onNavigate: (subject: EntityRef, path: readonly ContextPathStep[]) => void;
}

type ContextNodeData = Record<string, unknown> & {
  entity: EntityRef;
  entityType: string;
  displayName: string;
  root: boolean;
  current: boolean;
  expandable: boolean;
  expanded: boolean;
  onSelect: () => void;
  onExpand: () => void;
};

type ContextFlowNode = Node<ContextNodeData, "context">;

const nodeTypes: NodeTypes = {
  context: ContextFlowNodeView,
};

export function ContextMap(props: ContextMapProps) {
  return (
    <ReactFlowProvider>
      <ContextMapInner {...props} />
    </ReactFlowProvider>
  );
}

function ContextMapInner({
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
  const [layout, setLayout] = useState<ContextGraphLayout | null>(null);
  const [layoutPending, setLayoutPending] = useState(true);
  const [layoutError, setLayoutError] = useState<string | null>(null);

  useEffect(() => {
    setExpanded(minimumExpansionForPath(root, contextPath));
    setLayout(null);
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
  const visibleKeys = useMemo(
    () => new Set(model.nodes.map((node) => node.key)),
    [model.nodes],
  );

  useEffect(() => {
    let cancelled = false;
    setLayoutPending(true);
    setLayoutError(null);

    layoutContextGraph(model)
      .then((nextLayout) => {
        if (cancelled) {
          return;
        }
        setLayout(nextLayout);
        setLayoutPending(false);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        setLayoutPending(false);
        setLayoutError(error instanceof Error ? error.message : String(error));
      });

    return () => {
      cancelled = true;
    };
  }, [model]);

  const nodes = useMemo<ContextFlowNode[]>(() => {
    if (!layout) {
      return [];
    }

    const result: ContextFlowNode[] = [];
    for (const node of model.nodes) {
      const position = layout.positions.get(node.key);
      if (!position) {
        continue;
      }

      const record = session.readModel.entityRecordsByKey.get(node.key);
      result.push({
        id: node.key,
        type: "context",
        position,
        draggable: false,
        selectable: false,
        focusable: false,
        style: {
          width: CONTEXT_NODE_WIDTH,
          height: CONTEXT_NODE_HEIGHT,
        },
        data: {
          entity: node.entity,
          entityType: record?.entity_type ?? node.entity.domain,
          displayName: record?.display_name ?? node.entity.id,
          root: rootKey === node.key,
          current: entityKey(current) === node.key,
          expanded: expanded.has(node.key),
          expandable: hasHiddenNeighbor(session, node.entity, visibleKeys),
          onSelect: () => {
            const path = findContextPath(model, node.entity);
            if (path !== null) {
              onNavigate(node.entity, path);
            }
          },
          onExpand: () => {
            setExpanded((currentExpanded) =>
              expandContextEntity(currentExpanded, node.entity),
            );
          },
        },
      });
    }

    return result;
  }, [
    current,
    expanded,
    layout,
    model,
    onNavigate,
    rootKey,
    session,
    visibleKeys,
  ]);

  const nodeIds = useMemo(() => new Set(nodes.map((node) => node.id)), [nodes]);
  const edges = useMemo<Edge[]>(
    () =>
      model.edges
        .filter(
          (edge) =>
            nodeIds.has(entityKey(edge.source)) && nodeIds.has(entityKey(edge.target)),
        )
        .map((edge) => {
          const presentation = relationshipPresentation(edge.relationshipType);
          const inPath = contextPath.some(
            (step) => step.relationshipId === edge.relationshipId,
          );

          return {
            id: edge.relationshipId,
            source: entityKey(edge.source),
            target: entityKey(edge.target),
            sourceHandle: "out",
            targetHandle: "in",
            type: "smoothstep",
            label: presentation?.forwardLabel ?? edge.relationshipType,
            className: inPath ? "is-in-path" : undefined,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            data: {
              relationshipType: edge.relationshipType,
            },
          };
        }),
    [contextPath, model.edges, nodeIds],
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

      <div className="context-map-canvas">
        {layoutError ? (
          <div className="context-map-layout-error" role="status">
            Context layout failed: {layoutError}
          </div>
        ) : null}

        <ContextFlowCanvas
          sessionId={session.sessionId}
          rootKey={rootKey}
          nodes={nodes}
          edges={edges}
        />

        {layoutPending ? (
          <div className="context-map-layout-status" aria-live="polite">
            Arranging context…
          </div>
        ) : null}
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

function ContextFlowCanvas({
  sessionId,
  rootKey,
  nodes,
  edges,
}: {
  sessionId: string;
  rootKey: EntityKey;
  nodes: readonly ContextFlowNode[];
  edges: readonly Edge[];
}) {
  const { fitView } = useReactFlow();
  const fittedKey = useRef<string | null>(null);
  const fitKey = `${sessionId}:${rootKey}`;

  useEffect(() => {
    if (nodes.length === 0 || fittedKey.current === fitKey) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      void fitView({ padding: 0.2, duration: 220 });
      fittedKey.current = fitKey;
    });

    return () => cancelAnimationFrame(frame);
  }, [fitKey, fitView, nodes.length]);

  return (
    <ReactFlow
      className="context-flow"
      nodes={[...nodes]}
      edges={[...edges]}
      nodeTypes={nodeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
      zoomOnDoubleClick={false}
      zoomOnScroll={false}
      panOnScroll={false}
      minZoom={0.25}
      maxZoom={1.8}
      proOptions={{ hideAttribution: true }}
    >
      <Background gap={28} size={0.8} />
      <Controls showInteractive={false} position="bottom-left" />
    </ReactFlow>
  );
}

function ContextFlowNodeView({ data }: NodeProps<ContextFlowNode>) {
  const classes = [
    "context-node",
    data.root ? "is-root" : "",
    data.current ? "is-current" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <Handle
        id="in"
        type="target"
        position={Position.Left}
        className="context-flow-handle"
        isConnectable={false}
      />
      <button
        type="button"
        className="context-node-main nodrag nopan"
        onClick={data.onSelect}
        title={`${data.entity.domain}:${data.entity.id}`}
      >
        <span className="context-node-type">{humanize(data.entityType)}</span>
        <strong>{data.displayName}</strong>
        <code>{data.entity.id}</code>
      </button>
      {data.expandable ? (
        <button
          type="button"
          className="context-node-expand nodrag nopan"
          onClick={(event) => {
            event.stopPropagation();
            data.onExpand();
          }}
          aria-label={`Expand context around ${data.displayName}`}
          title={data.expanded ? "Expand further if new relationships become available" : "Expand context"}
        >
          +
        </button>
      ) : null}
      <Handle
        id="out"
        type="source"
        position={Position.Right}
        className="context-flow-handle"
        isConnectable={false}
      />
    </div>
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
