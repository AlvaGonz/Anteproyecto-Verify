import React, { useMemo, useState } from "react";
import { NetworkGraphDto, NetworkNodeDto, NetworkEdgeDto } from "../../../features/projects/api/useGlobalSearch";
import { motion } from "framer-motion";

interface Props {
  graph: NetworkGraphDto;
}

export const VerificationNetworkGraph: React.FC<Props> = ({ graph }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Simple circle layout calculation
  const { nodes, edges } = useMemo(() => {
    if (!graph || !graph.nodos || graph.nodos.length === 0) return { nodes: [], edges: [] };

    const centerX = 400;
    const centerY = 300;
    const radius = 200;

    // Find the central node (the one that has edges pointing to others, typically the root)
    const rootId = graph.nodos[0].id; // using first node as root

    const positionedNodes = graph.nodos.map((n, i) => {
      if (n.id === rootId) {
        return { ...n, x: centerX, y: centerY, isRoot: true };
      }
      
      // Position others in a circle
      const otherNodesCount = graph.nodos.length - 1;
      const angle = (i * (2 * Math.PI)) / (otherNodesCount || 1);
      return {
        ...n,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        isRoot: false
      };
    });

    const positionedEdges = graph.enlaces.map((e) => {
      const source = positionedNodes.find(n => n.id === e.origenId);
      const target = positionedNodes.find(n => n.id === e.destinoId);
      return { ...e, source, target };
    }).filter(e => e.source && e.target);

    return { nodes: positionedNodes, edges: positionedEdges };
  }, [graph]);

  if (nodes.length === 0) {
    return <div className="p-8 text-center text-gray-500">No hay datos para mostrar el grafo.</div>;
  }

  return (
    <div className="w-full overflow-hidden bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-inner relative flex justify-center items-center p-4">
      <svg width="100%" height="600" viewBox="0 0 800 600" className="max-w-full">
        {/* Draw edges */}
        {edges.map((edge, i) => (
          <g key={`edge-${i}`}>
            <line
              x1={edge.source!.x}
              y1={edge.source!.y}
              x2={edge.target!.x}
              y2={edge.target!.y}
              stroke={hoveredNode === edge.source!.id || hoveredNode === edge.target!.id ? "#3b82f6" : "#cbd5e1"}
              strokeWidth={hoveredNode === edge.source!.id || hoveredNode === edge.target!.id ? 3 : 2}
              className="transition-all duration-300"
            />
            {/* Edge Label Background */}
            <rect
              x={(edge.source!.x + edge.target!.x) / 2 - 40}
              y={(edge.source!.y + edge.target!.y) / 2 - 12}
              width="80"
              height="24"
              rx="12"
              fill="white"
              className="dark:fill-gray-800"
              stroke="#e2e8f0"
            />
            {/* Edge Label */}
            <text
              x={(edge.source!.x + edge.target!.x) / 2}
              y={(edge.source!.y + edge.target!.y) / 2}
              textAnchor="middle"
              alignmentBaseline="middle"
              className="text-xs font-medium fill-gray-500 dark:fill-gray-400"
            >
              {edge.relacion}
            </text>
          </g>
        ))}

        {/* Draw nodes */}
        {nodes.map((node) => (
          <motion.g
            key={`node-${node.id}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            className="cursor-pointer"
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={node.isRoot ? 40 : 35}
              fill={node.isRoot ? "#1d4ed8" : "#f59e0b"}
              stroke={hoveredNode === node.id ? "#60a5fa" : "white"}
              strokeWidth="4"
              className="transition-colors duration-300"
            />
            
            {/* Tooltip-like label */}
            <rect
              x={node.x - 60}
              y={node.y + 45}
              width="120"
              height="40"
              rx="4"
              fill="rgba(0,0,0,0.7)"
              opacity={hoveredNode === node.id ? 1 : 0}
              className="transition-opacity duration-300 pointer-events-none"
            />
            <text
              x={node.x}
              y={node.y + 65}
              textAnchor="middle"
              alignmentBaseline="middle"
              fill="white"
              opacity={hoveredNode === node.id ? 1 : 0}
              className="text-xs pointer-events-none transition-opacity duration-300 font-semibold"
            >
              {node.etiqueta.length > 20 ? node.etiqueta.substring(0, 17) + "..." : node.etiqueta}
            </text>
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              alignmentBaseline="middle"
              fill="white"
              className="text-[10px] font-bold pointer-events-none uppercase tracking-wider"
            >
              {node.tipo}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
};
