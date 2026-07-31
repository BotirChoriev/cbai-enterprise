"use client";

import { useTranslation } from "@/lib/i18n/use-translation";

type IntelligenceStatusRailProps = {
  readonly context?: string | null;
  readonly evidence?: string | null;
  readonly unknown?: string | null;
  readonly humanBoundary?: string | null;
  readonly compact?: boolean;
};

const COPY = {
  en: {
    context: "Current context",
    evidence: "Evidence",
    unknown: "Unknowns",
    human: "Human checkpoint",
    contextFallback: "Select an object to begin",
    evidenceFallback: "Source review required",
    unknownFallback: "Missing information stays visible",
    humanFallback: "A human confirms the next action",
  },
  uz: {
    context: "Joriy kontekst",
    evidence: "Dalillar",
    unknown: "Noma’lumlar",
    human: "Inson nazorati",
    contextFallback: "Boshlash uchun obyektni tanlang",
    evidenceFallback: "Manbani tekshirish talab qilinadi",
    unknownFallback: "Yetishmagan ma’lumot ko‘rinib turadi",
    humanFallback: "Keyingi amalni inson tasdiqlaydi",
  },
} as const;

export default function IntelligenceStatusRail({
  context,
  evidence,
  unknown,
  humanBoundary,
  compact = false,
}: IntelligenceStatusRailProps) {
  const { language } = useTranslation();
  const copy = COPY[language === "uz" ? "uz" : "en"];
  const items = [
    { id: "context", label: copy.context, value: context || copy.contextFallback, tone: "teal" },
    { id: "evidence", label: copy.evidence, value: evidence || copy.evidenceFallback, tone: "cyan" },
    { id: "unknown", label: copy.unknown, value: unknown || copy.unknownFallback, tone: "violet" },
    { id: "human", label: copy.human, value: humanBoundary || copy.humanFallback, tone: "amber" },
  ] as const;

  return (
    <section
      className={`grid gap-2 ${compact ? "md:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2 xl:grid-cols-4"}`}
      aria-label={language === "uz" ? "Intellekt holati" : "Intelligence status"}
      data-cbai-intelligence-status=""
    >
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-xl border border-[var(--cbai-border-subtle)] bg-[var(--cbai-surface-muted)] p-3"
          data-cbai-status-role={item.id}
        >
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                item.tone === "amber"
                  ? "bg-amber-400"
                  : item.tone === "violet"
                    ? "bg-violet-400"
                    : item.tone === "cyan"
                      ? "bg-sky-400"
                      : "bg-teal-400"
              }`}
              aria-hidden="true"
            />
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--cbai-text-muted)]">
              {item.label}
            </p>
          </div>
          <p className={`mt-2 line-clamp-2 text-xs leading-5 ${item.id === "human" ? "text-amber-200" : "text-[var(--cbai-text-secondary)]"}`}>
            {item.value}
          </p>
        </article>
      ))}
    </section>
  );
}
