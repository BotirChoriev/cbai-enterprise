"use client";

import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function EvidenceResultsDrawer() {
  const { t } = useTranslation();
  const vo = useVoiceOperator();

  if (!vo.evidenceOpen || !vo.evidenceResults) return null;

  const { query, items, providerFailures, limitations } = vo.evidenceResults;

  return (
    <div
      className="fixed inset-x-0 bottom-28 z-[60] mx-auto max-h-[45vh] w-full max-w-3xl overflow-hidden px-3 md:bottom-32 md:pl-64"
      role="dialog"
      aria-label={t("voiceOperator.evidencePanelTitle")}
    >
      <div className="flex max-h-[45vh] flex-col rounded-xl border border-zinc-800 bg-slate-950/98 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">{t("voiceOperator.evidencePanelTitle")}</h2>
            <p className="text-[11px] text-zinc-500">
              {t("voiceOperator.evidenceQuery")}: {query}
            </p>
          </div>
          <button type="button" onClick={vo.closeEvidence} className="text-xs text-zinc-400 hover:text-zinc-100">
            {t("voiceOperator.closeDock")}
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="text-sm text-zinc-400">{t("voiceOperator.evidenceNoResults")}</p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id} className="rounded-lg border border-zinc-800 p-3">
                  <p className="text-sm font-medium text-zinc-100">{item.title}</p>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    {t("voiceOperator.evidenceProvider")}: {item.provider}
                    {item.year ? ` · ${item.year}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">{item.authors.join(", ")}</p>
                  {item.doi ? (
                    <a href={item.sourceUrl ?? `https://doi.org/${item.doi}`} className="mt-1 inline-block text-xs text-teal-400" target="_blank" rel="noreferrer">
                      DOI:{item.doi}
                    </a>
                  ) : null}
                  <p className="mt-2 text-[11px] text-zinc-500">{item.relevanceNote}</p>
                  <p className="text-[10px] font-medium text-amber-950 dark:text-amber-100">{t("voiceOperator.evidenceMetadataOnly")}</p>
                </li>
              ))}
            </ul>
          )}
          {providerFailures.length > 0 ? (
            <p className="mt-3 text-[11px] font-medium text-red-950 dark:text-red-200">
              {t("voiceOperator.evidenceProviderFailed")}: {providerFailures.join(", ")}
            </p>
          ) : null}
          {limitations.length > 0 ? (
            <p className="mt-2 text-[11px] text-zinc-600">
              {t("voiceOperator.evidenceLimitations")}: {limitations.slice(0, 2).join(" ")}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
