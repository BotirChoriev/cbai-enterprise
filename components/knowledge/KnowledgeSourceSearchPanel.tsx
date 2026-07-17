"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { ConnectorSearchResult } from "@/lib/knowledge-connectors/types";
import { searchCrossref } from "@/lib/knowledge-connectors/crossref/crossref-adapter";
import { recordWorkflowEvent } from "@/lib/telemetry/workflow-telemetry";
import { MISSION_DATA_CHANGED } from "@/lib/intelligence-os/mission-activation-events";
import KnowledgeSourceResultCard from "@/components/knowledge/KnowledgeSourceResultCard";
import SavedKnowledgeSourcesPanel from "@/components/knowledge/SavedKnowledgeSourcesPanel";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { cbaiGlassCard, cbaiSectionEyebrow, cbaiBtnPrimary, cbaiFocusRing } from "@/components/brand/brand-classes";

export default function KnowledgeSourceSearchPanel() {
  const { t } = useTranslation();
  const { mission } = useMissionContext();
  const { profile } = useAssistantProfile();
  const reviewerDisplayName = resolveOperatorName(profile);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConnectorSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bump = useCallback(() => setRefreshKey((n) => n + 1), []);

  useEffect(() => {
    const onChange = () => bump();
    window.addEventListener(MISSION_DATA_CHANGED, onChange);
    return () => window.removeEventListener(MISSION_DATA_CHANGED, onChange);
  }, [bump]);

  const search = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    recordWorkflowEvent("source_search_started", { metadata: { provider: "crossref" } });

    try {
      const data = await searchCrossref({ query: trimmed, limit: 8 });
      if (data.connectionState === "unavailable" || data.connectionState === "rate_limited") {
        setError(data.limitations[0] ?? t("errors.generic"));
        recordWorkflowEvent("source_search_failed", {
          errorCategory: data.errorCategory ?? "provider_error",
          outcome: "failure",
        });
        setResult(null);
        return;
      }
      setResult(data);
      recordWorkflowEvent("source_search_completed", {
        outcome: "success",
        metadata: { count: data.records.length },
      });
    } catch {
      setError(t("errors.generic"));
      recordWorkflowEvent("source_search_failed", {
        errorCategory: "network_failure",
        outcome: "failure",
      });
    } finally {
      setLoading(false);
    }
  }, [query, t]);

  return (
    <div className="space-y-4">
      <section className={`${cbaiGlassCard} space-y-4 p-4`} aria-labelledby="knowledge-source-search-heading">
        <div>
          <p className={cbaiSectionEyebrow}>{t("sourceIngestion.searchEyebrow")}</p>
          <h2 id="knowledge-source-search-heading" className="text-sm font-semibold text-zinc-100">
            {t("sourceIngestion.searchTitle")}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">{t("sourceIngestion.searchDetail")}</p>
        </div>

        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void search();
          }}
        >
          <label className="sr-only" htmlFor="knowledge-source-query">
            {t("sourceIngestion.searchQueryLabel")}
          </label>
          <input
            id="knowledge-source-query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("sourceIngestion.searchPlaceholder")}
            className={`min-h-10 flex-1 rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm text-zinc-200 ${cbaiFocusRing}`}
          />
          <button type="submit" disabled={loading} className={`${cbaiBtnPrimary} min-h-10`}>
            {loading ? t("common.loading") : t("navigation.search")}
          </button>
        </form>

        {error ? (
          <p className="text-xs text-amber-400/90" role="alert">
            {error}
          </p>
        ) : null}

        {result ? (
          <div className="space-y-3" role="status" aria-live="polite">
            <p className="text-xs text-zinc-500">
              {t("sourceIngestion.resultsCount").replace("{count}", String(result.records.length))} ·{" "}
              {t("sourceIngestion.retrievedAt").replace(
                "{date}",
                new Date(result.retrievedAt).toLocaleString(),
              )}{" "}
              · {t("sourceIngestion.connectionState").replace("{state}", result.connectionState)}
            </p>
            <ul className="space-y-2">
              {result.records.map((record) => (
                <KnowledgeSourceResultCard
                  key={record.id}
                  record={record}
                  refreshKey={refreshKey}
                  mission={mission}
                  reviewerDisplayName={reviewerDisplayName}
                  onMutation={bump}
                />
              ))}
            </ul>
            {result.limitations.map((limitation) => (
              <p key={limitation} className="text-[10px] text-zinc-600">
                {limitation}
              </p>
            ))}
          </div>
        ) : null}
      </section>

      <SavedKnowledgeSourcesPanel refreshKey={refreshKey} />
    </div>
  );
}
