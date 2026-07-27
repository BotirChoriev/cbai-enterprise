"use client";

import type { IntelligenceAnswer } from "@/lib/domain-intelligence/query-planner";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type Props = {
  readonly answer: IntelligenceAnswer;
};

export default function IntelligenceAnswerPanel({ answer }: Props) {
  const { t } = useTranslation();

  return (
    <section aria-label={t("domainIntelligence.answerOrientation")} className={`${cbaiGlassCard} space-y-3 p-5`}>
      <p className={cbaiSectionEyebrow}>{t("domainIntelligence.answerOrientation")}</p>
      <p className="text-sm text-[var(--cbai-text-primary)]">{answer.orientation}</p>
      <p className="text-xs text-[var(--cbai-text-muted)]">{t("domainIntelligence.noFabricatedData")}</p>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
          {t("domainIntelligence.sources")}
        </h3>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-[var(--cbai-text-secondary)]">
          {answer.findings.map((f, i) => (
            <li key={`${f.text.slice(0, 24)}-${i}`}>
              {f.text}
              {f.sourceLabels.length > 0 ? (
                <span className="text-[var(--cbai-text-muted)]"> — {f.sourceLabels.join("; ")}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-[var(--cbai-text-muted)]">{answer.timelineNotice}</p>

      {answer.keyActors.length > 0 ? (
        <p className="text-sm text-[var(--cbai-text-secondary)]">
          Actors (registry): {answer.keyActors.join(", ")}
        </p>
      ) : null}

      {answer.methods.length > 0 ? (
        <p className="text-sm text-[var(--cbai-text-secondary)]">
          Methods (catalog labels): {answer.methods.join(", ")}
        </p>
      ) : null}

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
          {t("domainIntelligence.contradictions")}
        </h3>
        <ul className="mt-1 list-disc pl-5 text-xs text-[var(--cbai-text-secondary)]">
          {answer.contradictions.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
          {t("domainIntelligence.knowledgeGaps")}
        </h3>
        <ul className="mt-1 list-disc pl-5 text-xs text-[var(--cbai-text-secondary)]">
          {answer.knowledgeGaps.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
          {t("domainIntelligence.limitations")}
        </h3>
        <ul className="mt-1 list-disc pl-5 text-xs text-[var(--cbai-text-muted)]">
          {answer.limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </div>

      {answer.recommendedWorkCard ? (
        <p className="border-t border-[var(--cbai-border-subtle)] pt-3 text-sm text-[var(--cbai-text-primary)]">
          <span className="font-medium">{t("domainIntelligence.recommendedWorkCard")}: </span>
          {answer.recommendedWorkCard.titleHint} ({answer.recommendedWorkCard.preset}) — confirmation
          required
        </p>
      ) : null}
    </section>
  );
}
