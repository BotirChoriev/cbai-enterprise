import { EVIDENCE_FLOW_STEPS } from "@/lib/platform-home";

export default function HomeFlow() {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-6">
      <ol className="flex min-w-[640px] flex-col gap-0 sm:min-w-0 sm:flex-row sm:items-stretch sm:gap-0">
        {EVIDENCE_FLOW_STEPS.map((step, index) => (
          <li key={step.id} className="flex flex-1 flex-col sm:flex-row">
            <div className="flex flex-1 flex-col rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-4">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Step {index + 1}
              </span>
              <span className="mt-1 text-sm font-semibold text-zinc-100">
                {step.label}
              </span>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                {step.description}
              </p>
            </div>
            {index < EVIDENCE_FLOW_STEPS.length - 1 ? (
              <div
                className="flex items-center justify-center py-2 text-zinc-600 sm:px-2 sm:py-0"
                aria-hidden="true"
              >
                <span className="sm:hidden">↓</span>
                <span className="hidden sm:inline">→</span>
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
