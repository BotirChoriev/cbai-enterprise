"use client";

import { ACTIVE_EDGE_TYPE_CONFIG, NODE_TYPE_COLORS } from "@/lib/graph/graph.mock";
import type { GraphNodeType } from "@/lib/graph/graph.types";
import { GRAPH_ENTITY_TYPES, GRAPH_RELATIONSHIP_TYPES } from "@/lib/graph/graph-platform";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import { translateGraphEntityTypes } from "@/lib/i18n/graph-ui-translation";

export default function GraphLegend() {
  const { t, language } = useTranslation();
  const dictionary = getDictionary(language);
  const entityTypes = translateGraphEntityTypes(dictionary);
  const activeNodeTypes: GraphNodeType[] = ["country", "company", "university"];
  const futureEntityCount = GRAPH_ENTITY_TYPES.filter((type) => !type.active).length;
  const futureRelationshipCount = GRAPH_RELATIONSHIP_TYPES.filter((type) => !type.active).length;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-50">{t("graphUi.legend")}</h3>

      <div className="mb-4">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          {t("graphUi.activeEntityTypes")}
        </p>
        <div className="space-y-1.5">
          {activeNodeTypes.map((type) => {
            const copy = entityTypes.find((entry) => entry.id === type);
            return (
              <div key={type} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: NODE_TYPE_COLORS[type] }}
                />
                <span className="text-xs text-zinc-400">{copy?.label ?? type}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          {t("graphUi.verifiedRelationships")}
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
          {t("graphUi.plannedTypes")}
        </p>
        <p className="text-xs text-zinc-500">
          {t("graphUi.plannedTypesSummary", {
            entityCount: String(futureEntityCount),
            relationshipCount: String(futureRelationshipCount),
          })}
        </p>
      </div>
    </div>
  );
}
