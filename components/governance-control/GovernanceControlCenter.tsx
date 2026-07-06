"use client";

import { useMemo } from "react";
import { buildGovernanceControlModel } from "@/lib/governance-control-center";
import {
  GovernanceRuleRegistry,
  GovernancePrinciplesSection,
  GovernanceValidationFlow,
  GovernanceComplianceModel,
} from "@/components/governance-control/GovernanceSections";
import {
  GovernancePersonasSection,
  GovernanceLimitsSection,
} from "@/components/governance-control/GovernancePersonasSection";

export default function GovernanceControlCenter() {
  const model = useMemo(() => buildGovernanceControlModel(), []);

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-sky-500/5 to-violet-500/5"
        />
        <div className="relative">
          <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-400">
            CBAI Governance Control v{model.version}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
            Governance Control Center
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-zinc-500">
            Governance Control Center shows platform rules, standards, and compliance status.
            This is not AI control — no model toggles, provider health, or token metrics.
          </p>
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
      <GovernanceComplianceModel template={model.complianceReportTemplate} />
      <GovernancePersonasSection personas={model.personas} />
      <GovernanceLimitsSection limits={model.limits} />

      <footer className="border-t border-zinc-800 pt-6 text-xs text-zinc-600">
        Governance Framework v{model.governanceVersion}
      </footer>
    </div>
  );
}
