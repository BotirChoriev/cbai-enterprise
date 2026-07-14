"use client";

import { useMemo } from "react";
import { buildGovernanceControlModel } from "@/lib/governance-control-center";
import {
  GovernanceRuleRegistry,
  GovernancePrinciplesSection,
  GovernanceValidationFlow,
} from "@/components/governance-control/GovernanceSections";
import GovernancePillars from "@/components/governance-control/GovernancePillars";
import { cbaiPageHeader } from "@/components/brand/brand-classes";

export default function GovernanceControlCenter() {
  const model = useMemo(() => buildGovernanceControlModel(), []);

  return (
    <div className="space-y-10">
      <div className={cbaiPageHeader}>
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_1fr]">
          <div className="relative">
            <h1 className="cbai-display text-2xl text-zinc-50">Governance</h1>
            <p className="mt-1 max-w-3xl text-sm text-zinc-500">
              Platform rules, standards, and review process for evidence-based decisions.
            </p>
          </div>
          <GovernancePillars categories={model.ruleCategories} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Total rules
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.summary.totalRules}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Critical rules
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.summary.criticalRules}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Rule categories
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.summary.ruleCategories}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Validation steps
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.summary.validationSteps}
          </p>
        </div>
      </div>

      <GovernanceRuleRegistry categories={model.ruleCategories} />
      <GovernancePrinciplesSection principles={model.principles} />
      <GovernanceValidationFlow steps={model.validationPipeline} />
    </div>
  );
}
