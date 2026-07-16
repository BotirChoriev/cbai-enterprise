"use client";

import type { ReactNode } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";

type EntityOptionalExplorationProps = {
  children: ReactNode;
};

export default function EntityOptionalExploration({ children }: EntityOptionalExplorationProps) {
  const { t } = useTranslation();

  return (
    <details className="scroll-mt-6 rounded-lg border border-zinc-800/60 bg-zinc-950/50">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-zinc-500 marker:content-none [&::-webkit-details-marker]:hidden">
        {t("zeroLearningCurve.advancedDetails")}
      </summary>
      <div className="space-y-6 border-t border-zinc-800 px-4 py-4">{children}</div>
    </details>
  );
}
