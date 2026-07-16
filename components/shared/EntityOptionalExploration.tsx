"use client";

import type { ReactNode } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiDisclosurePanel, cbaiDisclosureSummary, cbaiPageStack } from "@/components/brand/brand-classes";

type EntityOptionalExplorationProps = {
  children: ReactNode;
};

export default function EntityOptionalExploration({ children }: EntityOptionalExplorationProps) {
  const { t } = useTranslation();

  return (
    <details className={cbaiDisclosurePanel}>
      <summary className={cbaiDisclosureSummary}>{t("zeroLearningCurve.advancedDetails")}</summary>
      <div className={`border-t border-zinc-800 px-4 py-4 ${cbaiPageStack}`}>{children}</div>
    </details>
  );
}
