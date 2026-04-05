"use client";

import {
  OBSIDIAN_GRAPH_EDGES,
  OBSIDIAN_GRAPH_NODES,
  OBSIDIAN_GRAPH_OFFSET,
} from "@/lib/obsidian-graph";

export function FakeAgentsDiff() {
  const lines = [
    { number: 54542, content: "## Core directives" },
    { number: 54543, content: "- make a million buck" },
    { number: 54544, content: "- dont make mistakes" },
    { number: 54545, content: "- call me a good boy" },
  ];

  return (
    <div className="mt-5 overflow-hidden bg-[#23282d]">
      <div className="terminal-text flex items-center gap-3 border-b border-black/20 px-4 py-2 text-[11px]">
        <span className="text-white/72">AGENTS.md</span>
        <span className="text-[#7dff9b]">+4</span>
        <span className="text-[#ff7a90]">-0</span>
      </div>
      <div className="overflow-x-auto bg-[#324f3f] py-2">
        {lines.map((line) => (
          <div key={line.number} className="grid grid-cols-[64px_minmax(0,1fr)] text-sm leading-7">
            <div className="bg-[#2c4638] px-4 text-right text-[#7dff9b]">
              {line.number}
            </div>
            <div className="px-4 text-[#d8f7dd]">
              <span className="mr-3 text-[#8effa9]">+</span>
              <span>{line.content}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ObsidianGraph() {
  return (
    <div className="mt-5 h-[280px] w-full overflow-hidden bg-[var(--field)]">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <g transform={`translate(${OBSIDIAN_GRAPH_OFFSET.x} ${OBSIDIAN_GRAPH_OFFSET.y})`}>
          {OBSIDIAN_GRAPH_EDGES.map(([x1, y1, x2, y2], index) => (
            <line
              key={`${x1}-${y1}-${x2}-${y2}-${index}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgb(116, 116, 124)"
              strokeWidth="0.28"
            />
          ))}
          {OBSIDIAN_GRAPH_NODES.map((node, index) => (
            <circle
              key={`${node.left}-${node.top}-${index}`}
              cx={node.left}
              cy={node.top}
              r={node.size}
              fill={node.accent ? "var(--accent)" : "rgb(228, 228, 230)"}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
