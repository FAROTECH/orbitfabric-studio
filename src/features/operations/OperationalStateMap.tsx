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

import type { OperationsModel, OperationalModeFact } from "./operationsModel";
import {
  layoutOperationalStateMap,
  OPERATION_MODE_NODE_HEIGHT,
  OPERATION_MODE_NODE_WIDTH,
  type OperationalStateLayout,
} from "./operationalStateLayout";

interface OperationalStateMapProps {
  missionKey: string;
  model: OperationsModel;
  selectedModeId: string;
  onSelectMode: (mode: OperationalModeFact) => void;
}

type OperationalModeNodeData = Record<string, unknown> & {
  mode: OperationalModeFact;
  selected: boolean;
  onSelect: () => void;
};

type OperationalModeNode = Node<OperationalModeNodeData, "operational-mode">;

const nodeTypes: NodeTypes = {
  "operational-mode": OperationalModeNodeView,
};

export function OperationalStateMap(props: OperationalStateMapProps) {
  return (
    <ReactFlowProvider>
      <OperationalStateMapInner {...props} />
    </ReactFlowProvider>
  );
}

function OperationalStateMapInner({
  missionKey,
  model,
  selectedModeId,
  onSelectMode,
}: OperationalStateMapProps) {
  const [layout, setLayout] = useState<OperationalStateLayout | null>(null);
  const [layoutPending, setLayoutPending] = useState(true);
  const [layoutError, setLayoutError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLayoutPending(true);
    setLayoutError(null);
    layoutOperationalStateMap(model)
      .then((next) => {
        if (!cancelled) {
          setLayout(next);
          setLayoutPending(false);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLayoutError(error instanceof Error ? error.message : String(error));
          setLayoutPending(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [model]);

  const nodes = useMemo<OperationalModeNode[]>(() => {
    if (!layout) {
      return [];
    }
    return model.modes.flatMap((mode) => {
      const position = layout.positions.get(mode.ref.id);
      if (!position) {
        return [];
      }
      return [{
        id: mode.ref.id,
        type: "operational-mode" as const,
        position,
        draggable: false,
        selectable: true,
        focusable: true,
        style: {
          width: OPERATION_MODE_NODE_WIDTH,
          height: OPERATION_MODE_NODE_HEIGHT,
        },
        data: {
          mode,
          selected: mode.ref.id === selectedModeId,
          onSelect: () => onSelectMode(mode),
        },
      }];
    });
  }, [layout, model.modes, onSelectMode, selectedModeId]);

  const edges = useMemo<Edge[]>(
    () =>
      model.transitions.map((transition) => ({
        id: transition.key,
        source: transition.from,
        target: transition.to,
        sourceHandle: "out",
        targetHandle: "in",
        type: "smoothstep",
        label: transition.reason,
        className:
          transition.from === selectedModeId || transition.to === selectedModeId
            ? "is-selected-adjacent"
            : undefined,
        markerEnd: { type: MarkerType.ArrowClosed },
      })),
    [model.transitions, selectedModeId],
  );

  return (
    <section className="operational-state-map" aria-label="Operational State Map">
      <header className="operational-state-map-header">
        <div>
          <p className="eyebrow">Operational State Map</p>
          <h2>Declared mission modes</h2>
          <p>Nodes and arrows reproduce Core modes and mode transitions exactly.</p>
        </div>
        <div className="operational-state-stats">
          <span>{model.modes.length} modes</span>
          <span>{model.transitions.length} transitions</span>
        </div>
      </header>
      <div className="operational-state-canvas">
        {layoutError ? (
          <div className="context-map-layout-error" role="status">
            State layout failed: {layoutError}
          </div>
        ) : null}
        <OperationalStateFlow
          fitKey={`${missionKey}:${model.modes.length}:${model.transitions.length}`}
          nodes={nodes}
          edges={edges}
        />
        {layoutPending ? (
          <div className="context-map-layout-status" aria-live="polite">
            Arranging declared modes…
          </div>
        ) : null}
      </div>
      <footer className="operational-state-map-footer">
        <span>Arrow labels are Core-declared transition reasons.</span>
        <span>Payload lifecycle values remain declared effects, not mission modes.</span>
      </footer>
    </section>
  );
}

function OperationalStateFlow({
  fitKey,
  nodes,
  edges,
}: {
  fitKey: string;
  nodes: readonly OperationalModeNode[];
  edges: readonly Edge[];
}) {
  const { fitView } = useReactFlow();
  const fittedKey = useRef<string | null>(null);

  useEffect(() => {
    if (nodes.length === 0 || fittedKey.current === fitKey) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      void fitView({ padding: 0.22, duration: 220 });
      fittedKey.current = fitKey;
    });
    return () => cancelAnimationFrame(frame);
  }, [fitKey, fitView, nodes.length]);

  return (
    <ReactFlow
      className="operational-state-flow context-flow"
      nodes={[...nodes]}
      edges={[...edges]}
      nodeTypes={nodeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      nodesFocusable
      edgesFocusable={false}
      zoomOnDoubleClick={false}
      minZoom={0.3}
      maxZoom={1.8}
      proOptions={{ hideAttribution: true }}
    >
      <Background gap={28} size={0.8} />
      <Controls showInteractive={false} position="bottom-left" />
    </ReactFlow>
  );
}

function OperationalModeNodeView({ data }: NodeProps<OperationalModeNode>) {
  return (
    <div className={`operational-mode-node${data.selected ? " is-selected" : ""}`}>
      <Handle
        id="in"
        type="target"
        position={Position.Left}
        className="context-flow-handle"
        isConnectable={false}
      />
      <button
        type="button"
        className="operational-mode-node-main nodrag nopan"
        onClick={data.onSelect}
        aria-pressed={data.selected}
      >
        <span>{data.mode.initial ? "Initial mode" : "Mission mode"}</span>
        <strong>{data.mode.ref.id}</strong>
      </button>
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
