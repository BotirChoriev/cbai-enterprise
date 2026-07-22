"use client";

import type { ResearchReview } from "@/lib/research/review/review-model";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import StatusBadge from "@/components/shared/StatusBadge";
import { useTranslation } from "@/lib/i18n/use-translation";

type ReviewTimelineProps = {
  review: ResearchReview;
};

export default function ReviewTimeline({ review }: ReviewTimelineProps) {
  const { t, language } = useTranslation();
  const timelineDateFormat = new Intl.DateTimeFormat(language, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });

  function formatTimelineDate(value: string | undefined): string | null {
    return value ? timelineDateFormat.format(new Date(value)) : null;
  }

  const milestones = [
    { label: t("researchReviewTimeline.created"), value: formatTimelineDate(review.createdAt) },
    { label: t("researchReviewTimeline.submitted"), value: null },
    { label: t("researchReviewTimeline.assigned"), value: null },
    { label: t("researchReviewTimeline.decision"), value: null },
    { label: t("researchReviewTimeline.archived"), value: null },
  ];

  return (
    <section aria-label={t("researchReviewTimeline.ariaLabel")} className={`${cbaiGlassCard} space-y-3 p-4`}>
      <p className={cbaiSectionEyebrow}>{t("researchReviewTimeline.heading")}</p>
      <ol className="space-y-2">
        {milestones.map((milestone) => (
          <li
            key={milestone.label}
            className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2"
          >
            <span className="text-sm font-medium text-zinc-200">{milestone.label}</span>
            {milestone.value ? (
              <span className="text-xs text-zinc-500">{milestone.value}</span>
            ) : (
              <StatusBadge status="waiting_for_verified_data" />
            )}
          </li>
        ))}
      </ol>
      <p className="text-xs text-zinc-600">{t("researchReviewTimeline.futureEventsNote")}</p>
    </section>
  );
}
