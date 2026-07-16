"use client";

import type { GraphNode, GraphEdge, GraphStats, GraphNodeFilter } from "@/lib/graph/graph.types";
import { getEntityTypeLabel } from "@/lib/entity/entity.helpers";
import { buildEntityGraphEvidenceSummary } from "@/lib/graph/graph.evidence";
import KnowledgeLayersDisclosure from "@/components/knowledge/KnowledgeLayersDisclosure";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { loadProjects } from "@/lib/project/project-store";
import { cbaiGraphPanel, cbaiTextCaption } from "@/components/brand/brand-classes";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/translate";

type GraphEntityPanelProps = {
  selectedNode: GraphNode | null;
  connectedEdges: GraphEdge[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: GraphNodeFilter;
  onTypeFilterChange: (filter: GraphNodeFilter) => void;
  stats: GraphStats;
  onClearSelection: () => void;
};

const TYPE_FILTER_VALUES: GraphNodeFilter[] = ["all", "country", "company", "university"];

const MODULE_ROUTES: Record<string, string> = {
  country: "/countries",
  company: "/companies",
  university: "/universities",
};

export default function GraphEntityPanel({
  selectedNode,
  connectedEdges,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  stats,
  onClearSelection,
}: GraphEntityPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className={cbaiGraphPanel}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-50">{t("graphUi.entityDetails")}</h2>
          {selectedNode ? (
            <button
              type="button"
              onClick={onClearSelection}
              className="text-[10px] font-medium text-zinc-500 transition-colors hover:text-zinc-300"
            >
              {t("graphUi.clear")}
            </button>
          ) : null}
        </div>

        {!selectedNode ? (
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            {t("graphPlatform.noSelectionPrompt")}
          </p>
        ) : (
          <EntityDetails
            node={selectedNode}
            connectedEdges={connectedEdges}
          />
        )}
      </div>

      <div className={cbaiGraphPanel}>
        <label
          htmlFor="graph-search"
          className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-zinc-600"
        >
          {t("graphUi.searchEntities")}
        </label>
        <input
          id="graph-search"
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("graphPlatform.searchPlaceholder")}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/30"
        />

        <p className="mb-2 mt-4 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          {t("graphUi.entityType")}
        </p>
        <div className="space-y-1">
          {TYPE_FILTER_VALUES.map((option) => {
            const count =
              option === "all"
                ? stats.totalNodes
                : option === "country"
                  ? stats.countryCount
                  : option === "company"
                    ? stats.companyCount
                    : stats.universityCount;
            const active = typeFilter === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onTypeFilterChange(option)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                  active
                    ? "bg-teal-500/10 text-teal-300 ring-1 ring-teal-500/30"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                <span>
                  {option === "all" ? t("graphUi.allTypes") : getEntityTypeLabel(option)}
                </span>
                <span className="font-mono text-[10px] text-zinc-600">{count}</span>
              </button>
            );
          })}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-800 pt-4">
          <RegistryStat label={t("graphPlatform.registryNodes")} value={stats.totalNodes} />
          <RegistryStat label={t("graphPlatform.verifiedEdges")} value={stats.verifiedEdgeCount} />
        </dl>
      </div>
    </div>
  );
}

function EntityDetails({
  node,
  connectedEdges,
}: {
  node: GraphNode;
  connectedEdges: GraphEdge[];
}) {
  const { t, language } = useTranslation();
  const { mission } = useMissionContext();
  const dictionary = getDictionary(language);
  const summary = buildEntityGraphEvidenceSummary(node, connectedEdges, dictionary);
  const route = MODULE_ROUTES[node.type];
  const typeLabel = getEntityTypeLabel(node.type);

  const missionProject = mission?.projectId
    ? loadProjects().find((p) => p.id === mission.projectId)
    : null;
  const missionLinked =
    missionProject?.primaryEntity?.kind === node.type &&
    missionProject.primaryEntity.id === node.entityId;
  const missingEdges = connectedEdges.filter((e) => e.evidenceStatus !== "evidence_available").length;

  return (
    <div className="mt-4 space-y-4">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">{typeLabel}</p>
        <p className="mt-1 text-sm font-semibold text-zinc-50">{node.label}</p>
        {node.entity.subtitle ? (
          <p className="text-xs text-zinc-500">{node.entity.subtitle}</p>
        ) : null}
        <p className={`mt-2 ${cbaiTextCaption}`}>
          {missionLinked ? t("activation.graphMissionRelevant") : t("activation.graphMissionNotLinked")}
        </p>
      </div>

      <dl className="space-y-2 text-xs">
        <DetailRow label={t("graphUi.evidenceStatus")} value={summary.evidenceStatus} />
        <DetailRow label={t("graphUi.relationshipCount")} value={String(summary.relationshipCount)} />
        <DetailRow
          label={t("graphUi.availableSources")}
          value={summary.availableSources.join(", ")}
        />
        {missingEdges > 0 ? (
          <>
            <DetailRow
              label={t("activation.graphUnknowns")}
              value={String(missingEdges)}
            />
            <p className={`${cbaiTextCaption} text-amber-400/80`}>{t("activation.graphUnknownsExplain")}</p>
          </>
        ) : null}
      </dl>

      <KnowledgeLayersDisclosure
        className="mt-4 border-t border-zinc-800 pt-4"
        layers={{
          surface: node.label,
          summary: node.entity.subtitle ?? null,
          evidence: summary.evidenceStatus,
          reasoning: `${summary.relationshipCount} ${t("graphUi.relationshipCount").toLowerCase()}`,
          validation: summary.evidenceStatus,
          history: summary.availableSources.length > 0 ? summary.availableSources.join(", ") : null,
          impact: null,
          legacy: route ? t("graphUi.openModule", { type: typeLabel }) : null,
        }}
      />

      {route ? (
        <Link
          href={`${route}?id=${node.entityId}`}
          className="block w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2 text-center text-xs font-medium text-zinc-300 transition-colors hover:border-teal-500/40 hover:text-teal-300"
        >
          {t("graphUi.openModule", { type: typeLabel })}
        </Link>
      ) : null}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-zinc-600">{label}</dt>
      <dd className="mt-0.5 text-zinc-300">{value}</dd>
    </div>
  );
}

function RegistryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-zinc-900/60 px-2.5 py-2">
      <dt className="text-[9px] uppercase tracking-wider text-zinc-600">{label}</dt>
      <dd className="font-mono text-sm font-semibold text-zinc-200">{value}</dd>
    </div>
  );
}
