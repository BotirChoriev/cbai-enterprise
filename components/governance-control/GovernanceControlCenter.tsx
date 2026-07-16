"use client";

import { useMemo } from "react";
import { buildGovernanceControlModel } from "@/lib/governance-control-center";
import {
  GovernanceRuleRegistry,
  GovernancePrinciplesSection,
  GovernanceValidationFlow,
} from "@/components/governance-control/GovernanceSections";
import GovernancePillars from "@/components/governance-control/GovernancePillars";
import SupremePrinciplesSection from "@/components/governance-control/SupremePrinciplesSection";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import { translateGovernanceControlModel } from "@/lib/i18n/governance-translation";

type GovernanceControlCenterProps = {
  embedded?: boolean;
};

export default function GovernanceControlCenter({ embedded = false }: GovernanceControlCenterProps) {
  const { language } = useTranslation();
  const model = useMemo(
    () => translateGovernanceControlModel(getDictionary(language), buildGovernanceControlModel()),
    [language],
  );
  const gc = getDictionary(language).governanceCenter;

  return (
    <div className="space-y-10">
      {embedded ? <GovernancePillars categories={model.ruleCategories} /> : null}

      <SupremePrinciplesSection />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{gc.totalRules}</p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">{model.summary.totalRules}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{gc.criticalRules}</p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">{model.summary.criticalRules}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{gc.ruleCategories}</p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">{model.summary.ruleCategories}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            {gc.validationStepsLabel}
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">{model.summary.validationSteps}</p>
        </div>
      </div>

      <GovernanceRuleRegistry categories={model.ruleCategories} />
      <GovernancePrinciplesSection principles={model.principles} />
      <GovernanceValidationFlow steps={model.validationPipeline} />
    </div>
  );
}
