"use client";

import type { ResearchConnectionType } from "@/lib/research/network/network-types";
import { RESEARCH_CONNECTION_TYPE_LABELS } from "@/lib/research/network/network-types";
import { useTranslation } from "@/lib/i18n/use-translation";

type ResearchNetworkLegendProps = {
  compact?: boolean;
};

const CONNECTION_COLORS: Record<ResearchConnectionType, string> = {
  shared_domain: "#22d3ee",
  shared_method: "#34d399",
  shared_evidence: "#a78bfa",
  future_workspace: "#71717a",
};

export default function ResearchNetworkLegend({ compact = false }: ResearchNetworkLegendProps) {
  const { t } = useTranslation();
  const connectionTypes: ResearchConnectionType[] = [
    "shared_domain",
    "shared_method",
    "shared_evidence",
    "future_workspace",
  ];

  return (
    <div className={`grid gap-4 ${compact ? "sm:grid-cols-2" : "lg:grid-cols-3"}`}>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
          {t("researchNetworkLegend.nodeTypesHeading")}
        </p>
        <ul className="mt-2 space-y-1.5 text-xs text-zinc-500">
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-400/90 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            {t("researchNetworkLegend.researchTopicNode")}
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full border border-emerald-500/40 bg-emerald-500/20" />
            {t("researchNetworkLegend.catalogAvailable")}
          </li>
        </ul>
      </div>

      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
          {t("researchNetworkLegend.connectionTypesHeading")}
        </p>
        <ul className="mt-2 space-y-1.5">
          {connectionTypes.map((type) => (
            <li key={type} className="flex items-center gap-2 text-xs text-zinc-500">
              <span
                className="h-0.5 w-6 rounded-full"
                style={{ backgroundColor: CONNECTION_COLORS[type] }}
              />
              {RESEARCH_CONNECTION_TYPE_LABELS[type]}
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-1">
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
          {t("researchNetworkLegend.interactionHeading")}
        </p>
        <p className="mt-2 text-xs text-zinc-500">{t("researchNetworkLegend.interactionBody")}</p>
      </div>
    </div>
  );
}

export { CONNECTION_COLORS };
