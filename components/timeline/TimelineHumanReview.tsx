"use client";

import type { CountryTimelineModel } from "@/lib/timeline";
import { useTranslation } from "@/lib/i18n/use-translation";

type TimelineHumanReviewProps = {
  model: CountryTimelineModel;
};

export default function TimelineHumanReview({ model }: TimelineHumanReviewProps) {
  const { t } = useTranslation();

  function localizeLimitation(limitation: string): string {
    const map: Record<string, string> = {
      "Timeline displays evidence readiness structure only — not historical events or political interpretation.":
        t("timelineUi.limStructureOnly"),
      "No event narratives, political framing, or generated history appear on this timeline.":
        t("timelineUi.limNoNarratives"),
      "Year slots are structural placeholders until official time-series evidence connects.":
        t("timelineUi.limYearPlaceholders"),
      "Human review is required before any timeline use in decision support.":
        t("timelineUi.limHumanBeforeUse"),
      "Static export — no live time-series ingestion or runtime validation.":
        t("timelineUi.limStaticExport"),
      "No time-series evidence is connected — all year slots show evidence gaps.":
        t("timelineUi.limNoSeriesConnected"),
      "Partial indicator coverage exists but year-level evidence remains incomplete.":
        t("timelineUi.limPartialIncomplete"),
      "Year slots are mapped and awaiting official source time-series publication.":
        t("timelineUi.limAwaitingPublication"),
      "Verified status reflects connected sources — reviewers must confirm year applicability.":
        t("timelineUi.limVerifiedConfirm"),
    };
    return map[limitation] ?? limitation;
  }

  return (
    <section className="space-y-4" aria-labelledby="timeline-human-review-heading">
      <div>
        <h4
          id="timeline-human-review-heading"
          className="text-sm font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]"
        >
          {t("timelineUi.humanReviewHeading")}
        </h4>
        <p className="mt-1 text-sm text-[var(--cbai-text-muted)]">{t("timelineUi.humanReviewDescription")}</p>
      </div>

      <div className="rounded-xl border border-[color-mix(in_srgb,var(--cbai-status-warning)_20%,transparent)] bg-[color-mix(in_srgb,var(--cbai-status-warning)_5%,transparent)] px-5 py-4">
        <ul className="space-y-2 text-sm text-[var(--cbai-text-secondary)]">
          <li>{t("timelineUi.humanReviewRequired")}</li>
          <li>{t("timelineUi.humanReviewScope", { entity: model.entityLabel })}</li>
          <li>{t("timelineUi.humanReviewVerify")}</li>
        </ul>
      </div>

      {model.limitations.length > 0 ? (
        <div className="rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
            {t("timelineUi.limitations")}
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-[var(--cbai-text-muted)]">
            {model.limitations.map((limitation) => (
              <li key={limitation}>{localizeLimitation(limitation)}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
