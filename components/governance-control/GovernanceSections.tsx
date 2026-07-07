import type {
  GovernanceRuleCategoryRow,
  GovernancePrinciple,
  GovernanceValidationStep,
} from "@/lib/governance-control-center";
import { governanceStatusClass } from "@/lib/governance-control-center";
import type { ComplianceReport } from "@/lib/governance/reports/types";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type GovernanceRuleRegistryProps = {
  categories: readonly GovernanceRuleCategoryRow[];
};

export function GovernanceRuleRegistry({ categories }: GovernanceRuleRegistryProps) {
  return (
    <section className="space-y-4" aria-labelledby="governance-rules-heading">
      <div>
        <h2
          id="governance-rules-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Review standards
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Platform rules grouped by topic — definitions for manual review.
        </p>
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
                  {row.ruleCount} rule{row.ruleCount === 1 ? "" : "s"}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${governanceStatusClass(row.status)}`}
              >
                {row.status}
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

export function GovernancePrinciplesSection({
  principles,
}: GovernancePrinciplesSectionProps) {
  return (
    <section className="space-y-4" aria-labelledby="governance-principles-heading">
      <div>
        <h2
          id="governance-principles-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Constitutional Principles
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Supreme principles all platform modules inherit from the CBAI Constitution.
        </p>
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
  return (
    <section className="space-y-4" aria-labelledby="governance-validation-heading">
      <div>
        <h2
          id="governance-validation-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Review process
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Steps for validating releases before they reach users.
        </p>
      </div>

      <ol className="space-y-3">
        {steps.map((step) => (
          <li
            key={step.id}
            className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-cyan-400">Step {step.order}</p>
              <p className="mt-0.5 text-sm font-semibold text-zinc-100">{step.title}</p>
              <p className="mt-1 text-sm text-zinc-400">{step.description}</p>
              {step.ruleCategories.length > 0 && (
                <p className="mt-2 text-xs text-zinc-600">
                  Related topics: {step.ruleCategories.join(", ")}
                </p>
              )}
            </div>
            <span
              className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${governanceStatusClass(step.status)}`}
            >
              {step.status}
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
  return (
    <section className="space-y-4" aria-labelledby="governance-compliance-heading">
      <div>
        <h2
          id="governance-compliance-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Compliance Report Model
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Structural template for manual audits and future CI output — no checks executed here.
        </p>
      </div>

      <Card>
        <CardHeader
          title={template.moduleName}
          description={`Module ID: ${template.moduleId} · Status: ${template.overallStatus}`}
        />
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">Passed rules</dt>
              <dd className="mt-1 text-zinc-300">
                {template.passedRules.length} — populated by future validators
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Failed rules</dt>
              <dd className="mt-1 text-zinc-300">
                {template.failedRules.length} — populated by future validators
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Warnings</dt>
              <dd className="mt-1 text-zinc-300">
                {template.warnings.length} — non-blocking findings
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Recommendations</dt>
              <dd className="mt-1 text-zinc-300">
                {template.recommendations.length} — remediation guidance
              </dd>
            </div>
          </dl>
          {template.notes && (
            <p className="mt-4 text-xs text-zinc-600">{template.notes}</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
