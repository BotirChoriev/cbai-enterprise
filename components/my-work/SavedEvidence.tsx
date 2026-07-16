"use client";

import Link from "next/link";
import type { ContextEntityRef } from "@/lib/context/context-types";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { evidenceItemHref, evidenceItemTopicName } from "@/lib/research/evidence/evidence-bookmark";
import { useTranslation } from "@/lib/i18n/use-translation";
import EmptyState from "@/components/shared/EmptyState";
import { cbaiGlassCard, cbaiMineralPanel, cbaiProminentAction, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type SavedEvidenceProps = {
  entities: readonly ContextEntityRef[];
};

export default function SavedEvidence({ entities }: SavedEvidenceProps) {
  const { t } = useTranslation();
  const { unpinEntityFromWorkspace } = usePlatformContext();

  return (
    <section aria-labelledby="saved-evidence-heading" className={`${cbaiGlassCard} space-y-3 p-4`}>
      <div>
        <p className={cbaiSectionEyebrow} id="saved-evidence-heading">
          {t("savedEvidence.eyebrow")}
        </p>
        <p className="mt-1 text-[11px] text-zinc-600">{t("savedEvidence.description")}</p>
      </div>

      {entities.length > 0 ? (
        <ul className="space-y-2">
          {entities.map((entity) => {
            const topicName = evidenceItemTopicName(entity.id);
            return (
              <li key={entity.id} className={cbaiMineralPanel}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={evidenceItemHref(entity.id)} className="text-sm text-teal-400 hover:text-teal-300">
                      {entity.name}
                    </Link>
                    {topicName ? (
                      <p className="mt-0.5 text-[11px] text-zinc-600">
                        {t("savedEvidence.fromTopic", { topic: topicName })}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => unpinEntityFromWorkspace("evidence", entity.id)}
                    aria-label={t("savedEvidence.removeAria", { name: entity.name })}
                    className="shrink-0 rounded px-1.5 py-0.5 text-xs text-zinc-600 hover:text-amber-400"
                  >
                    {t("savedEvidence.remove")}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          variant="section"
          message={t("savedEvidence.empty")}
          action={
            <Link href="/research" className={`${cbaiProminentAction} gap-1.5`}>
              {t("savedEvidence.exploreAction")} →
            </Link>
          }
        />
      )}
    </section>
  );
}
