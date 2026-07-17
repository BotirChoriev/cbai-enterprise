"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { ConnectorSearchResult } from "@/lib/knowledge-connectors/types";
import { searchCrossref } from "@/lib/knowledge-connectors/crossref/crossref-adapter";
import { recordWorkflowEvent } from "@/lib/telemetry/workflow-telemetry";
import { cbaiGlassCard, cbaiSectionEyebrow, cbaiBtnPrimary } from "@/components/brand/brand-classes";

export default function KnowledgeSourceSearchPanel() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConnectorSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <section className={`${cbaiGlassCard} space-y-4 p-4`} aria-labelledby="knowledge-source-search-heading">
      <div>
        <p className={cbaiSectionEyebrow}>{t("knowledgeBrain.eyebrow")}</p>
        <h2 id="knowledge-source-search-heading" className="text-sm font-semibold text-zinc-100">
          Crossref metadata search
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Live Crossref metadata search from this device. Results are not reviewed evidence.
        </p>
      </div>

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void search();
        }}
      >
        <label className="sr-only" htmlFor="knowledge-source-query">
          Search query
        </label>
        <input
          id="knowledge-source-query"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search scholarly metadata…"
          className="min-h-10 flex-1 rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm text-zinc-200"
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
        <div className="space-y-3" role="status">
          <p className="text-xs text-zinc-500">
            {result.records.length} result(s) · retrieved {new Date(result.retrievedAt).toLocaleString()} ·{" "}
            {result.connectionState}
          </p>
          <ul className="space-y-2">
            {result.records.map((record) => (
              <li key={record.id} className="rounded-md border border-zinc-800/80 bg-zinc-950/40 p-3">
                <p className="text-sm font-medium text-zinc-200">{record.title}</p>
                {record.authors.length > 0 ? (
                  <p className="mt-1 text-xs text-zinc-500">{record.authors.join("; ")}</p>
                ) : null}
                <p className="mt-1 text-[10px] text-zinc-600">
                  {record.publicationDate ?? "Date unknown"} · {record.trustState} · needs review before
                  evidence
                </p>
                {record.landingPageUrl ? (
                  <a
                    href={record.landingPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-teal-400 hover:text-teal-300"
                    onClick={() =>
                      recordWorkflowEvent("source_opened", {
                        objectType: "source",
                        objectId: record.canonicalId ?? record.id,
                      })
                    }
                  >
                    View source →
                  </a>
                ) : null}
              </li>
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
  );
}
