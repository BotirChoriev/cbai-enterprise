"use client";

import type { GraphNode, GraphEdge } from "@/lib/graph/graph.types";
import { getEntityTypeLabel } from "@/lib/entity/entity.helpers";
import { entityTypeIconPaths } from "@/lib/entity/entity.icons";
import EntityIcon from "@/components/entity/EntityIcon";
import { buildEntityGraphEvidenceSummary } from "@/lib/graph/graph.evidence";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import {
  translateGraphEvidenceStatus,
} from "@/lib/i18n/graph-ui-translation";

type GraphConnectionsPanelProps = {
  selectedNode: GraphNode | null;
  connectedEdges: GraphEdge[];
  connectedNodes: GraphNode[];
};

export default function GraphConnectionsPanel({
  selectedNode,
  connectedEdges,
  connectedNodes,
}: GraphConnectionsPanelProps) {
  const { t, language } = useTranslation();
  const dictionary = getDictionary(language);

  if (!selectedNode) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <h2 className="text-sm font-semibold text-zinc-50">{t("graphUi.connectedEntities")}</h2>
        <p className="mt-3 text-xs leading-relaxed text-zinc-500">{t("graphUi.noSelectionConnections")}</p>
      </div>
    );
  }

  const summary = buildEntityGraphEvidenceSummary(selectedNode, connectedEdges, dictionary);
  const neighbors = connectedNodes.filter((node) => node.id !== selectedNode.id);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <h2 className="text-sm font-semibold text-zinc-50">{t("graphUi.evidenceSummary")}</h2>
        <dl className="mt-3 space-y-2 text-xs">
          <div>
            <dt className="text-zinc-600">{t("graphUi.relationshipStatus")}</dt>
            <dd className="mt-0.5 text-zinc-300">
              {summary.relationshipCount > 0
                ? t("graphUi.evidenceAvailable")
                : t("graphUi.evidenceMissing")}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-600">{t("graphUi.entityEvidenceStatus")}</dt>
            <dd className="mt-0.5 text-zinc-300">{summary.evidenceStatus}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <h2 className="text-sm font-semibold text-zinc-50">{t("graphUi.connectedEntities")}</h2>
        <p className="mt-1 text-[10px] text-zinc-600">
          {t("graphUi.neighborCount", {
            count: String(neighbors.length),
            plural: neighbors.length === 1 ? "" : "s",
          })}
        </p>
        <ul className="mt-3 max-h-40 space-y-1.5 overflow-y-auto">
          {neighbors.length === 0 ? (
            <li className="text-xs text-zinc-500">{t("graphPlatform.relationshipUnavailable")}</li>
          ) : (
            neighbors.map((node) => (
              <li
                key={node.id}
                className="flex items-center gap-2 rounded-lg bg-zinc-900/60 px-2 py-1.5"
              >
                <EntityIcon
                  path={node.entity.icon ?? entityTypeIconPaths[node.type]}
                  className="h-3.5 w-3.5 text-zinc-500"
                />
                <span className="truncate text-xs text-zinc-300">{node.label}</span>
                <span className="ml-auto text-[9px] text-zinc-600">
                  {getEntityTypeLabel(node.type)}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <h2 className="text-sm font-semibold text-zinc-50">{t("graphUi.evidenceRelationships")}</h2>
        <ul className="mt-3 space-y-2">
          {connectedEdges.length === 0 ? (
            <li className="text-xs text-zinc-500">{t("graphPlatform.relationshipUnavailable")}</li>
          ) : (
            connectedEdges.map((edge) => (
              <li
                key={edge.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs"
              >
                <p className="font-medium text-zinc-200">{edge.label}</p>
                <p className="mt-1 text-zinc-500">
                  {translateGraphEvidenceStatus(dictionary, edge.evidenceStatus)}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <h2 className="text-sm font-semibold text-zinc-50">{t("graphUi.availableInformation")}</h2>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">{summary.availableInformation}</p>
      </div>

      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 p-4">
        <h2 className="text-sm font-semibold text-zinc-300">{t("graphUi.futureEvidence")}</h2>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">{summary.futureEvidence}</p>
      </div>
    </div>
  );
}
