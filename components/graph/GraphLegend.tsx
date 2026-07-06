import { ACTIVE_EDGE_TYPE_CONFIG, NODE_TYPE_COLORS } from "@/lib/graph/graph.mock";
import { getEntityTypeLabel } from "@/lib/entity/entity.helpers";
import type { GraphNodeType } from "@/lib/graph/graph.types";
import { GRAPH_ENTITY_TYPES, GRAPH_RELATIONSHIP_TYPES } from "@/lib/graph/graph-platform";

export default function GraphLegend() {
  const activeNodeTypes: GraphNodeType[] = ["country", "company", "university"];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-50">Legend</h3>

      <div className="mb-4">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Active Entity Types
        </p>
        <div className="space-y-1.5">
          {activeNodeTypes.map((type) => (
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

      <div className="mb-4">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Verified Relationships
        </p>
        <div className="space-y-1.5">
          {ACTIVE_EDGE_TYPE_CONFIG.map((edge) => (
            <div key={edge.type} className="flex items-center gap-2">
              <svg width="24" height="8" className="shrink-0" aria-hidden="true">
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

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Planned Types
        </p>
        <p className="text-xs text-zinc-500">
          {GRAPH_ENTITY_TYPES.filter((type) => !type.active).length} future entity
          types ·{" "}
          {GRAPH_RELATIONSHIP_TYPES.filter((type) => !type.active).length} relationship
          types not connected
        </p>
      </div>
    </div>
  );
}
