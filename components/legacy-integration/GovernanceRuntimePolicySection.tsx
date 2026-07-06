import type { LegacyPolicySummary } from "@/lib/legacy-build-integration";

type GovernanceRuntimePolicySectionProps = {
  policy: LegacyPolicySummary;
};

export default function GovernanceRuntimePolicySection({
  policy,
}: GovernanceRuntimePolicySectionProps) {
  return (
    <section className="space-y-4" aria-labelledby="governance-runtime-policy-heading">
      <div>
        <h3
          id="governance-runtime-policy-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Runtime Policy Engine
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          BUILD-044 policy rules — deterministic evaluation only, not automated enforcement on
          this route.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Engine version
            </dt>
            <dd className="mt-1 font-mono text-xs text-zinc-300">{policy.engineVersion}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Status
            </dt>
            <dd className="mt-1 text-sm text-zinc-300">{policy.statusLabel}</dd>
          </div>
        </dl>
      </div>

      <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950">
        {policy.rules.map((rule) => (
          <li key={rule.ruleId} className="px-5 py-3">
            <p className="text-sm text-zinc-200">{rule.label}</p>
            <p className="font-mono text-[10px] text-zinc-600">{rule.ruleId}</p>
          </li>
        ))}
      </ul>

      {policy.recentDecisions.length === 0 && (
        <p className="text-sm text-zinc-500">No policy decisions recorded on this page load.</p>
      )}
    </section>
  );
}
