"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

/** Honest reports empty state — explains provenance without fabricated drafts. */
export default function ReportsEmptyIntro() {
  const { t } = useTranslation();

  const steps = [
    t("reportsCenter.emptyStepEvidence"),
    t("reportsCenter.emptyStepWork"),
    t("reportsCenter.emptyStepOpen"),
  ];

  return (
    <section className={`${cbaiMineralSurface} space-y-4 p-5`} aria-labelledby="reports-empty-intro-heading">
      <div>
        <p className={cbaiSectionEyebrow}>{t("reportsCenter.emptyStepsHeading")}</p>
        <p id="reports-empty-intro-heading" className="mt-2 text-sm leading-relaxed text-[var(--cbai-text-secondary)]">
          {t("reportsCenter.emptyIntro")}
        </p>
      </div>
      <ol className="list-decimal space-y-1.5 pl-5 text-sm text-[var(--cbai-text-secondary)]">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-3 pt-1">
        <Link
          href="/search"
          className="text-sm font-medium text-[var(--cbai-accent-primary)] hover:text-[var(--cbai-accent-hover)]"
        >
          {t("reportsCenter.emptyActionSearch")} →
        </Link>
        <Link
          href="/knowledge"
          className="text-sm font-medium text-[var(--cbai-accent-primary)] hover:text-[var(--cbai-accent-hover)]"
        >
          {t("reportsCenter.emptyActionEvidence")} →
        </Link>
        <Link
          href="/my-work"
          className="text-sm font-medium text-[var(--cbai-accent-primary)] hover:text-[var(--cbai-accent-hover)]"
        >
          {t("reportsCenter.emptyActionMyWork")} →
        </Link>
      </div>
    </section>
  );
}
