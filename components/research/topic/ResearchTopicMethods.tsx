"use client";

import type { ResearchTopic } from "@/lib/research/research-topics";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchTopicMethodsProps = {
  topic: ResearchTopic;
};

export default function ResearchTopicMethods({ topic }: ResearchTopicMethodsProps) {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="topic-methods-heading" className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>{t("researchTopicPanels.methodsEyebrow")}</p>
        <h2 id="topic-methods-heading" className="text-xl font-semibold text-zinc-100">
          {t("researchTopicPanels.methodsTitle")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{t("researchTopicPanels.methodsDetail")}</p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topic.relatedMethods.map((method) => (
          <li key={method}>
            <div className={`${cbaiGlassCard} px-4 py-3 text-sm text-zinc-300`}>{method}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
