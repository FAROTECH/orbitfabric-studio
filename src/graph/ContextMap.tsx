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

type ContextNodeTone = "fdir" | "operations" | "data" | "system" | "neutral";

type ContextNodeData = Record<string, unknown> & {
  entity: EntityRef;
  entityType: string;
  displayName: string;
  tone: ContextNodeTone;
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
    initialContextExpansion(root),
  );
  const [layout, setLayout] = useState<ContextGraphLayout | null>(null);
  const [layoutPending, setLayoutPending] = useState(true);
  const [layoutError, setLayoutError] = useState<string | null>(null);

  useEffect(() => {
    setExpanded(initialContextExpansion(root));
    setLayout(null);
  }, [rootKey, session.sessionId]);

  const model = useMemo(
    () => buildContextGraphModel(session, root, expanded, contextPath),
    [contextPath, expanded, root, session],
  );
  const visibleKeys = useMemo(
    () => new Set(model.nodes.map((node) => node.key)),
    [model.nodes],
  );
  const expandableVisibleKeys = useMemo(
    () =>
      model.nodes
        .filter((node) => hasHiddenNeighbor(session, node.entity, visibleKeys))
        .map((node) => node.key),
    [model.nodes, session, visibleKeys],
  );
  const canExpandContext = expandableVisibleKeys.length > 0;

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
      const entityType = record?.entity_type ?? node.entity.domain;
      result.push({
        id: node.key,
        type: "context",
        position,
        draggable: false,
        selectable: true,
        focusable: true,
        style: {
          width: CONTEXT_NODE_WIDTH,
          height: CONTEXT_NODE_HEIGHT,
        },
        data: {
          entity: node.entity,
          entityType,
          displayName: record?.display_name ?? node.entity.id,
          tone: contextNodeTone(entityType),
          root: rootKey === node.key,
          current: entityKey(current) === node.key,
          expanded: expanded.has(node.key),
          expandable: hasHiddenNeighbor(session, node.entity, visibleKeys),
          onSelect: () => {
            const path = navigationPathForSelection(
              model,
              root,
              current,
              node.entity,
              contextPath,
            );
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

  const expandVisibleContext = () => {
    if (!canExpandContext) {
      return;
    }

    setExpanded((currentExpanded) => {
      const next = new Set(currentExpanded);
      for (const key of visibleKeys) {
        next.add(key);
      }
      return next;
    });
  };

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
          <div className="context-map-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={expandVisibleContext}
              disabled={!canExpandContext}
              title="Reveal one more layer around the context currently visible"
            >
              Expand context
            </button>
            <button
              type="button"
              className="secondary-action"
              onClick={() => setExpanded(initialContextExpansion(root))}
            >
              Reset map
            </button>
          </div>
        </div>
      </header>

      <div className="context-map-canvas">
        {layoutError ? (
          <div className="context-map-layout-error" role="status">
            Context layout failed: {layoutError}
          </div>
        ) : null}

        <ContextFlowCanvas
          missionKey={`${session.source.missionDir}:${session.snapshot.mission?.id ?? "unknown"}`}
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
  missionKey,
  rootKey,
  nodes,
  edges,
}: {
  missionKey: string;
  rootKey: EntityKey;
  nodes: readonly ContextFlowNode[];
  edges: readonly Edge[];
}) {
  const { fitView } = useReactFlow();
  const fittedKey = useRef<string | null>(null);
  const fitKey = `${missionKey}:${rootKey}`;

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
      elementsSelectable={true}
      nodesFocusable={true}
      edgesFocusable={false}
      zoomOnDoubleClick={false}
      zoomOnScroll={true}
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
    `tone-${data.tone}`,
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

function navigationPathForSelection(
  model: ContextGraphModel,
  root: EntityRef,
  current: EntityRef,
  target: EntityRef,
  contextPath: readonly ContextPathStep[],
): ContextPathStep[] | null {
  const targetKey = entityKey(target);
  const rootKey = entityKey(root);

  if (targetKey === rootKey) {
    return [];
  }

  // Selecting an entity already present in the investigation path means
  // "go back to that point", not "find a different shorter route".
  const pathEntities: EntityRef[] = [root, ...contextPath.map((step) => step.to)];
  const existingIndex = pathEntities.findIndex((entity) => entityKey(entity) === targetKey);
  if (existingIndex >= 0) {
    return contextPath.slice(0, existingIndex);
  }

  // Preserve cognitive continuity when the clicked entity is an immediate
  // neighbor of the current subject. The relationship remains Core-owned;
  // only the exploration path is Studio-owned presentation state.
  const currentKey = entityKey(current);
  const directEdge = model.edges.find((edge) => {
    const sourceKey = entityKey(edge.source);
    const edgeTargetKey = entityKey(edge.target);
    return (
      (sourceKey === currentKey && edgeTargetKey === targetKey) ||
      (edgeTargetKey === currentKey && sourceKey === targetKey)
    );
  });

  if (directEdge) {
    const forward = entityKey(directEdge.source) === currentKey;
    return [
      ...contextPath,
      {
        relationshipId: directEdge.relationshipId,
        from: current,
        to: target,
        direction: forward ? "forward" : "inverse",
      },
    ];
  }

  // A graph node can be visible without being directly adjacent to the
  // current subject. In that case use one deterministic visible path as a
  // fallback, rather than inventing a relationship.
  return findContextPath(model, target);
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

function contextNodeTone(entityType: string): ContextNodeTone {
  switch (entityType) {
    case "fault":
    case "recovery_intent":
    case "autonomous_action":
      return "fdir";

    case "mode":
    case "command":
    case "command_source":
    case "commandability_rule":
      return "operations";

    case "telemetry":
    case "event":
    case "packet":
    case "data_product":
    case "payload":
    case "contact_profile":
    case "contact_window":
    case "link_profile":
    case "downlink_flow":
      return "data";

    case "spacecraft":
    case "subsystem":
      return "system";

    default:
      return "neutral";
  }
}

function displayName(session: MissionSession, entity: EntityRef): string {
  return session.readModel.entityRecordsByKey.get(entityKey(entity))?.display_name ?? entity.id;
}

function humanize(value: string): string {
  return value.replaceAll("_", " ");
}
