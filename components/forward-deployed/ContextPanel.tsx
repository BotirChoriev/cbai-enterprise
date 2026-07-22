"use client";

import { cbaiMineralPanel, cbaiSectionEyebrow, cbaiTextMuted } from "@/components/brand/brand-classes";
import type { EngineContext } from "@/lib/forward-deployed-engines/engine-types";
import { useTranslation } from "@/lib/i18n/use-translation";

type Props = {
  context: EngineContext;
};

export default function ContextPanel({ context }: Props) {
  const { t } = useTranslation();
  const rows = [
    context.pathname && `Route: ${context.pathname}`,
    context.entityName && `Entity: ${context.entityName}`,
    context.countryCode && `Country: ${context.countryCode}`,
    context.topicId && `Topic: ${context.topicId}`,
    context.projectId && `Project: ${context.projectId}`,
  ].filter(Boolean);

  if (rows.length === 0) return null;

  return (
    <section className={cbaiMineralPanel} aria-labelledby="engine-context">
      <h2 className={cbaiSectionEyebrow} id="engine-context">
        {t("forwardDeployed.context")}
      </h2>
      <ul className="space-y-1">
        {rows.map((row) => (
          <li key={row} className={cbaiTextMuted}>
            {row}
          </li>
        ))}
      </ul>
    </section>
  );
}
