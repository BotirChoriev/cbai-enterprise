"use client";

import { useMemo } from "react";
import { loadSavedKnowledgeSources } from "@/lib/knowledge-ingestion/saved-source-store";
import { deriveKnowledgeTrustStateFromSavedSource } from "@/lib/intelligence-os/trust-derivation";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

type SavedKnowledgeSourcesPanelProps = {
  readonly refreshKey: number;
};

export default function SavedKnowledgeSourcesPanel({ refreshKey }: SavedKnowledgeSourcesPanelProps) {
  const { t } = useTranslation();
  const sources = useMemo(() => {
    void refreshKey;
    return loadSavedKnowledgeSources();
  }, [refreshKey]);

  return (
    <section className={`${cbaiGlassCard} space-y-3 p-4`} aria-labelledby="saved-sources-heading">
      <div>
        <p className={cbaiSectionEyebrow}>{t("knowledgeBrain.eyebrow")}</p>
        <h2 id="saved-sources-heading" className="text-sm font-semibold text-zinc-100">
          {t("sourceIngestion.savedSourcesTitle")}
        </h2>
      </div>

      {sources.length === 0 ? (
        <p className="text-xs text-zinc-500">{t("sourceIngestion.savedSourcesEmpty")}</p>
      ) : (
        <ul className="space-y-2">
          {sources.map((source) => {
            const trust = deriveKnowledgeTrustStateFromSavedSource(source);
            return (
              <li key={source.id} className="rounded-md border border-zinc-800/80 bg-zinc-950/40 p-3">
                <p className="text-sm font-medium text-zinc-200">{source.title}</p>
                <p className="mt-1 text-[10px] text-zinc-600">
                  {source.lifecycleState} · {source.humanReviewState} · {trust.state}
                </p>
                {source.doi ? (
                  <p className="mt-1 text-[10px] text-zinc-600">
                    {t("sourceIngestion.doiLabel")}: {source.doi}
                  </p>
                ) : null}
                {source.missionRelations.length > 0 ? (
                  <p className="mt-1 text-[10px] text-teal-400/80">
                    {t("sourceIngestion.linkedToMission")} ({source.missionRelations.length})
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
