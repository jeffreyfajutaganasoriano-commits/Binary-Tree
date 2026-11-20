import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
  TraversalStep,
  TreeMetrics,
  TreeNode,
} from '../lib/tree';

interface PositionedNode {
  node: TreeNode;
  x: number;
  y: number;
  parentX: number | null;
  parentY: number | null;
  parentId: string | null;
  sideFromParent: 'left' | 'right' | null;
}

interface TreeCanvasProps {
  root: TreeNode;
  metrics: TreeMetrics;
  activeStep: TraversalStep | null;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
}

const DEPTH_STEP_COLORS = ['#B98E83', '#C9A995', '#A98273', '#8C9DA7', '#687C87'];

function computeNonOverlappingLayout(root: TreeNode): {
  nodes: PositionedNode[];
  width: number;
  height: number;
  nodeRadius: number;
} {
  let inorderIndex = 0;
  const xIndexMap = new Map<string, number>();

  function assignInorderX(node: TreeNode | null): void {
    if (node === null) return;
    assignInorderX(node.left);
    xIndexMap.set(node.id, inorderIndex);
    inorderIndex += 1;
    assignInorderX(node.right);
  }

  assignInorderX(root);

  const count = Math.max(inorderIndex, 1);
  const horizontalStep = count > 18 ? 62 : count > 10 ? 72 : 84;
  const levelHeight = 96;
  const padX = 72;
  const padTop = 62;
  const padBottom = 60;
  const nodeRadius = count > 20 ? 22 : 25;

  const positioned: PositionedNode[] = [];
  let maxDepth = 0;

  function collect(
    node: TreeNode | null,
    parentX: number | null,
    parentY: number | null,
    parentId: string | null,
    sideFromParent: 'left' | 'right' | null,
  ): void {
    if (node === null) return;
    const xIdx = xIndexMap.get(node.id) ?? 0;
    const x = padX + xIdx * horizontalStep;
    const y = padTop + node.depth * levelHeight;
    if (node.depth > maxDepth) {
      maxDepth = node.depth;
    }

    positioned.push({
      node,
      x,
      y,
      parentX,
      parentY,
      parentId,
      sideFromParent,
    });

    collect(node.left, x, y, node.id, 'left');
    collect(node.right, x, y, node.id, 'right');
  }

  collect(root, null, null, null, null);

  const width = Math.max(480, padX * 2 + Math.max(0, count - 1) * horizontalStep);
  const height = Math.max(300, padTop + maxDepth * levelHeight + padBottom);

  return { nodes: positioned, width, height, nodeRadius };
}

export function TreeCanvas({
  root,
  metrics,
  activeStep,
  selectedNodeId,
  onSelectNode,
}: TreeCanvasProps) {
  const [zoom, setZoom] = useState(1);

  const layout = useMemo(() => computeNonOverlappingLayout(root), [root]);

  const visitedMap = useMemo(() => {
    const map = new Map<string, number>();
    if (activeStep) {
      for (const token of activeStep.visitedNodes) {
        map.set(token.nodeId, token.order);
      }
    }
    return map;
  }, [activeStep]);

  const stackNodeIds = useMemo(() => {
    const set = new Set<string>();
    if (activeStep) {
      for (const frame of activeStep.callStack) {
        set.add(frame.nodeId);
      }
    }
    return set;
  }, [activeStep]);

  const inspectedNode = useMemo(() => {
    const targetId = selectedNodeId ?? activeStep?.nodeId ?? root.id;
    return layout.nodes.find((n) => n.node.id === targetId)?.node ?? root;
  }, [layout.nodes, selectedNodeId, activeStep, root]);

  const svgWidth = Math.round(layout.width * zoom);
  const svgHeight = Math.round(layout.height * zoom);

  return (
    <section
      aria-labelledby="tree-canvas-heading"
      className="flex h-full flex-col overflow-hidden rounded-xl border border-[#D2DCE4] bg-[#E7EBEE] dark:border-[#3A3735] dark:bg-[#272625]"
    >
      {/* Canvas Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D2DCE4] px-5 py-3.5 dark:border-[#3E3B39]">
        <div>
          <h2
            id="tree-canvas-heading"
            className="font-heading text-base font-bold text-[#A98273] dark:text-[#DEC3B3]"
          >
            Binary Expression Tree Diagram
          </h2>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#827A75] tabular-nums dark:text-[#B8AFA9]">
            <span>Nodes: {metrics.nodeCount}</span>
            <span aria-hidden="true">·</span>
            <span>Operands (Leaves): {metrics.leafCount}</span>
            <span aria-hidden="true">·</span>
            <span>Operators: {metrics.internalCount}</span>
            <span aria-hidden="true">·</span>
            <span>Height: {metrics.height}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.65, Number((z - 0.15).toFixed(2))))}
            aria-label="Zoom out tree diagram"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#D2DCE4] bg-[#F8F2EF] text-[#5F5A57] transition-colors hover:bg-[#DEC3B3] focus-visible:outline-2 focus-visible:outline-[#A98273] dark:border-[#3E3B39] dark:bg-[#1E1C1B] dark:text-[#DFD6D0] dark:hover:bg-[#342F2D]"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="min-w-[46px] text-center font-mono text-xs text-[#5F5A57] tabular-nums dark:text-[#DFD6D0]">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.6, Number((z + 0.15).toFixed(2))))}
            aria-label="Zoom in tree diagram"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#D2DCE4] bg-[#F8F2EF] text-[#5F5A57] transition-colors hover:bg-[#DEC3B3] focus-visible:outline-2 focus-visible:outline-[#A98273] dark:border-[#3E3B39] dark:bg-[#1E1C1B] dark:text-[#DFD6D0] dark:hover:bg-[#342F2D]"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          {zoom !== 1 && (
            <button
              type="button"
              onClick={() => setZoom(1)}
              aria-label="Reset zoom"
              className="inline-flex h-9 items-center gap-1 rounded-md border border-[#D2DCE4] bg-[#DEC3B3] px-2.5 text-xs font-semibold text-[#46413E] transition-colors hover:bg-[#C9A995] dark:border-[#4A4542] dark:bg-[#342F2D] dark:text-[#F0E5DF] dark:hover:bg-[#443D3A]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* SVG Stage */}
      <div className="relative min-h-[340px] flex-1 overflow-auto bg-[#F8F2EF] p-4 dark:bg-[#1E1C1B]">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          role="img"
          aria-label={`Binary Expression Tree diagram with ${metrics.nodeCount} nodes and height ${metrics.height}`}
          className="mx-auto block select-none"
        >
          <defs>
            <pattern
              id="tree-grid-dots"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="2"
                r="1"
                className="fill-[#D2DCE4] dark:fill-[#34312F]"
              />
            </pattern>
          </defs>

          <rect
            x="0"
            y="0"
            width={layout.width}
            height={layout.height}
            rx="8"
            fill="url(#tree-grid-dots)"
          />

          {/* Edges Layer */}
          <g>
            {layout.nodes.map((item) => {
              if (item.parentX === null || item.parentY === null || item.parentId === null) {
                return null;
              }

              const isActiveEdge =
                activeStep?.activeEdge?.fromId === item.parentId &&
                activeStep?.activeEdge?.toId === item.node.id;

              const isCallPathEdge =
                stackNodeIds.has(item.parentId) && stackNodeIds.has(item.node.id);

              const midX = (item.parentX + item.x) / 2;
              const midY = (item.parentY + item.y) / 2;

              return (
                <g key={`edge-${item.parentId}-${item.node.id}`}>
                  <line
                    x1={item.parentX}
                    y1={item.parentY}
                    x2={item.x}
                    y2={item.y}
                    strokeWidth={isActiveEdge ? 3.25 : isCallPathEdge ? 2.5 : 1.75}
                    stroke={
                      isActiveEdge
                        ? '#A98273'
                        : isCallPathEdge
                          ? '#C9A995'
                          : '#8C9DA7'
                    }
                  />
                  {/* L / R Child Label */}
                  <rect
                    x={midX - 8}
                    y={midY - 8}
                    width="16"
                    height="16"
                    rx="4"
                    fill={isActiveEdge ? '#A98273' : '#E7EBEE'}
                    stroke={isActiveEdge ? '#A98273' : '#D2DCE4'}
                    strokeWidth="1"
                  />
                  <text
                    x={midX}
                    y={midY + 3.5}
                    textAnchor="middle"
                    className="font-mono text-[10px] font-semibold"
                    fill={isActiveEdge ? '#F8F2EF' : '#5F5A57'}
                  >
                    {item.sideFromParent === 'left' ? 'L' : 'R'}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Nodes Layer */}
          <g>
            {layout.nodes.map((item) => {
              const { node, x, y } = item;
              const isActiveNode = activeStep?.nodeId === node.id;
              const isVisitingNow = isActiveNode && activeStep?.action === 'visit-node';
              const isInCallStack = stackNodeIds.has(node.id);
              const visitOrder = visitedMap.get(node.id);
              const isSelected = inspectedNode.id === node.id;

              const isOperator = node.kind === 'operator';
              const displayLabel =
                node.value.length > 5 ? `${node.value.slice(0, 4)}…` : node.value;

              const depthColor = DEPTH_STEP_COLORS[node.depth % DEPTH_STEP_COLORS.length];

              let fillHex = isOperator ? '#E5D6CE' : '#FFFFFF';
              let strokeHex = depthColor;
              let textHex = '#5F5A57';

              if (visitOrder !== undefined) {
                fillHex = '#8C9DA7';
                strokeHex = '#687C87';
                textHex = '#F8F2EF';
              }

              if (isInCallStack && !isActiveNode) {
                fillHex = '#F0E5DF';
                strokeHex = '#C9A995';
                textHex = '#5F5A57';
              }

              if (isActiveNode) {
                fillHex = isVisitingNow ? '#A98273' : '#DEC3B3';
                strokeHex = '#A98273';
                textHex = isVisitingNow ? '#F8F2EF' : '#46413E';
              }

              return (
                <g
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectNode(node.id);
                    }
                  }}
                  aria-label={`${isOperator ? 'Operator' : 'Operand'} node ${node.value}, ${node.isRoot ? 'Root' : node.isLeaf ? 'Leaf' : 'Internal node'}, depth ${node.depth}`}
                  className="cursor-pointer focus:outline-none"
                >
                  {/* Root indicator label above root */}
                  {node.isRoot && (
                    <g>
                      <rect
                        x={x - 22}
                        y={y - layout.nodeRadius - 24}
                        width="44"
                        height="16"
                        rx="3"
                        fill="#687C87"
                      />
                      <text
                        x={x}
                        y={y - layout.nodeRadius - 12.5}
                        textAnchor="middle"
                        fill="#F8F2EF"
                        className="font-mono text-[9.5px] font-semibold tracking-wider uppercase"
                      >
                        ROOT
                      </text>
                    </g>
                  )}

                  {/* Outer selection / active ring */}
                  {(isActiveNode || isSelected) && (
                    <circle
                      cx={x}
                      cy={y}
                      r={layout.nodeRadius + 6}
                      fill="none"
                      strokeWidth={isActiveNode ? 2.5 : 1.75}
                      strokeDasharray={isActiveNode ? undefined : '3 3'}
                      stroke={isActiveNode ? '#B98E83' : '#8C9DA7'}
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={layout.nodeRadius}
                    strokeWidth={node.isLeaf ? 2.5 : 2.25}
                    fill={fillHex}
                    stroke={strokeHex}
                  />

                  {/* Node Value */}
                  <text
                    x={x}
                    y={y + 5}
                    textAnchor="middle"
                    fill={textHex}
                    className="font-mono text-sm font-semibold"
                  >
                    {displayLabel}
                  </text>

                  {/* Leaf indicator below leaf */}
                  {node.isLeaf && (
                    <text
                      x={x}
                      y={y + layout.nodeRadius + 15}
                      textAnchor="middle"
                      className="font-mono text-[10px] font-medium fill-[#827A75] dark:fill-[#B8AFA9]"
                    >
                      Leaf
                    </text>
                  )}

                  {/* Traversal Visit Order Badge */}
                  {visitOrder !== undefined && (
                    <g>
                      <rect
                        x={x + layout.nodeRadius - 10}
                        y={y - layout.nodeRadius - 6}
                        width="22"
                        height="16"
                        rx="4"
                        fill="#687C87"
                      />
                      <text
                        x={x + layout.nodeRadius + 1}
                        y={y - layout.nodeRadius + 5.5}
                        textAnchor="middle"
                        fill="#F8F2EF"
                        className="font-mono text-[10px] font-bold tabular-nums"
                      >
                        #{visitOrder}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Legend + Inspected Node Footer */}
      <div className="flex flex-col gap-2.5 border-t border-[#D2DCE4] bg-[#E7EBEE] px-5 py-3.5 text-xs dark:border-[#3E3B39] dark:bg-[#272625]">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[#5F5A57] tabular-nums dark:text-[#DFD6D0]">
          <span className="font-semibold">
            Selected Node: <code className="font-mono font-bold text-[#A98273] dark:text-[#DEC3B3]">{inspectedNode.value}</code>
          </span>
          <span aria-hidden="true" className="text-[#827A75]">·</span>
          <span>
            Type: {inspectedNode.kind === 'operator' ? 'Operator' : 'Operand'}
          </span>
          <span aria-hidden="true" className="text-[#827A75]">·</span>
          <span>
            Role:{' '}
            {inspectedNode.isRoot && inspectedNode.isLeaf
              ? 'Root & Leaf'
              : inspectedNode.isRoot
                ? 'Root (Internal)'
                : inspectedNode.isLeaf
                  ? 'Leaf'
                  : 'Internal'}
          </span>
          <span aria-hidden="true" className="text-[#827A75]">·</span>
          <span>Depth: {inspectedNode.depth}</span>
          <span aria-hidden="true" className="text-[#827A75]">·</span>
          <span>Subtree Height: {inspectedNode.height}</span>
          <span aria-hidden="true" className="text-[#827A75]">·</span>
          <span>
            L={inspectedNode.left ? inspectedNode.left.value : 'null'}, R=
            {inspectedNode.right ? inspectedNode.right.value : 'null'}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#827A75] dark:text-[#B8AFA9]">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-[#A98273] bg-[#DEC3B3]" />
              <span>Active</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-[#C9A995] bg-[#F0E5DF]" />
              <span>In Stack</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-[#687C87] bg-[#8C9DA7]" />
              <span>Visited</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#827A75] dark:text-[#B8AFA9]">
            <span>Depth Steps:</span>
            {DEPTH_STEP_COLORS.map((hex, i) => (
              <span
                key={hex}
                title={`Depth Step ${i + 1}: ${hex}`}
                className="inline-block h-2.5 w-4 rounded-xs"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
