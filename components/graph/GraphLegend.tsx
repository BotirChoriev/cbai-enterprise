import { EDGE_TYPE_CONFIG } from "@/lib/graph/graph.mock";
import { NODE_TYPE_COLORS } from "@/lib/graph/graph.mock";
import { getEntityTypeLabel } from "@/lib/entity/entity.helpers";
import type { GraphNodeType } from "@/lib/graph/graph.types";

export default function GraphLegend() {
  const nodeTypes: GraphNodeType[] = ["country", "company", "university"];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-50">Legend</h3>

      <div className="mb-4">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Node Types
        </p>
        <div className="space-y-1.5">
          {nodeTypes.map((type) => (
            <div key={type} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: NODE_TYPE_COLORS[type] }}
              />
              <span className="text-xs text-zinc-400">
                {getEntityTypeLabel(type)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Relationships
        </p>
        <div className="space-y-1.5">
          {EDGE_TYPE_CONFIG.map((edge) => (
            <div key={edge.type} className="flex items-center gap-2">
              <svg width="24" height="8" className="shrink-0">
                <line
                  x1="0"
                  y1="4"
                  x2="24"
                  y2="4"
                  stroke={edge.color}
                  strokeWidth="2"
                  strokeDasharray={edge.strokeDasharray}
                />
              </svg>
              <span className="text-xs text-zinc-400">{edge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
