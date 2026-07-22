"use client";

import type {
  GovernanceRuleCategoryRow,
  GovernancePrinciple,
  GovernanceValidationStep,
} from "@/lib/governance-control-center";
import { governanceStatusClass } from "@/lib/governance-control-center";
import type { ComplianceReport } from "@/lib/governance/reports/types";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";

type GovernanceRuleRegistryProps = {
  categories: readonly GovernanceRuleCategoryRow[];
};

export function GovernanceRuleRegistry({ categories }: GovernanceRuleRegistryProps) {
  const { language } = useTranslation();
  const gc = getDictionary(language).governanceCenter;

  return (
    <section className="space-y-4" aria-labelledby="governance-rules-heading">
      <div>
        <h2
          id="governance-rules-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          {gc.reviewStandards}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{gc.reviewStandardsBody}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        <ul className="divide-y divide-zinc-800">
          {categories.map((row) => (
            <li
              key={row.category}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-100">{row.label}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{row.purpose}</p>
                <p className="mt-1 text-xs text-zinc-600">
                  {gc.ruleCount.replace("{count}", String(row.ruleCount)).replace("{plural}", row.ruleCount === 1 ? "" : "s")}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${governanceStatusClass(row.status)}`}
              >
                {gc.statusRegistered}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

type GovernancePrinciplesSectionProps = {
  principles: readonly GovernancePrinciple[];
};

export function GovernancePrinciplesSection({ principles }: GovernancePrinciplesSectionProps) {
  const { language } = useTranslation();
  const gc = getDictionary(language).governanceCenter;

  return (
    <section className="space-y-4" aria-labelledby="governance-principles-heading">
      <div>
        <h2
          id="governance-principles-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          {gc.constitutionalPrinciples}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{gc.constitutionalPrinciplesBody}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {principles.map((principle) => (
          <Card key={principle.id}>
            <CardHeader title={principle.title} />
            <CardContent>
              <p className="text-sm text-zinc-400">{principle.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

type GovernanceValidationFlowProps = {
  steps: readonly GovernanceValidationStep[];
};

export function GovernanceValidationFlow({ steps }: GovernanceValidationFlowProps) {
  const { language } = useTranslation();
  const gc = getDictionary(language).governanceCenter;

  return (
    <section className="space-y-4" aria-labelledby="governance-validation-heading">
      <div>
        <h2
          id="governance-validation-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          {gc.reviewProcess}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{gc.reviewProcessBody}</p>
      </div>

      <ol className="space-y-3">
        {steps.map((step) => (
          <li
            key={step.id}
            className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-teal-400">
                {gc.stepLabel.replace("{order}", String(step.order))}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-zinc-100">{step.title}</p>
              <p className="mt-1 text-sm text-zinc-400">{step.description}</p>
              {step.ruleCategories.length > 0 && (
                <p className="mt-2 text-xs text-zinc-600">
                  {gc.relatedTopics}{" "}
                  {step.ruleCategories
                    .map((category) => gc.categories[category as keyof typeof gc.categories]?.label ?? category)
                    .join(", ")}
                </p>
              )}
            </div>
            <span
              className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${governanceStatusClass(step.status)}`}
            >
              {gc.statusDeclared}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

type GovernanceComplianceModelProps = {
  template: ComplianceReport;
};

export function GovernanceComplianceModel({ template }: GovernanceComplianceModelProps) {
  const { language } = useTranslation();
  const gc = getDictionary(language).governanceCenter;

  return (
    <section className="space-y-4" aria-labelledby="governance-compliance-heading">
      <div>
        <h2
          id="governance-compliance-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          {gc.complianceReportModel}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{gc.complianceReportBody}</p>
      </div>

      <Card>
        <CardHeader
          title={template.moduleName}
          description={gc.moduleStatus
            .replace("{moduleId}", template.moduleId)
            .replace("{status}", template.overallStatus)}
        />
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">{gc.passedRules}</dt>
              <dd className="mt-1 text-zinc-300">
                {gc.passedRulesDetail.replace("{count}", String(template.passedRules.length))}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">{gc.failedRules}</dt>
              <dd className="mt-1 text-zinc-300">
                {gc.failedRulesDetail.replace("{count}", String(template.failedRules.length))}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">{gc.warnings}</dt>
              <dd className="mt-1 text-zinc-300">
                {gc.warningsDetail.replace("{count}", String(template.warnings.length))}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">{gc.recommendations}</dt>
              <dd className="mt-1 text-zinc-300">
                {gc.recommendationsDetail.replace("{count}", String(template.recommendations.length))}
              </dd>
            </div>
          </dl>
          {template.notes ? <p className="mt-4 text-xs text-zinc-600">{template.notes}</p> : null}
        </CardContent>
      </Card>
    </section>
  );
}
