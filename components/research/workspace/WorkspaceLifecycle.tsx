import { WORKSPACE_LIFECYCLE_STAGES } from "@/lib/research/workspace";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function WorkspaceLifecycle() {
  return (
    <section aria-labelledby="workspace-lifecycle-heading" className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>Lifecycle</p>
        <h2 id="workspace-lifecycle-heading" className="text-xl font-semibold text-zinc-100">
          Research lifecycle
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          How knowledge organization progresses inside the research workspace — not historical
          chronology.
        </p>
      </div>

      <ol className="space-y-0">
        {WORKSPACE_LIFECYCLE_STAGES.map((stage, index) => (
          <li key={stage.stageId}>
            <div className={`${cbaiGlassCard} flex gap-4 p-4`}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-teal-500/25 bg-teal-500/10 text-xs font-semibold text-teal-300">
                {index + 1}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">{stage.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{stage.description}</p>
              </div>
            </div>
            {index < WORKSPACE_LIFECYCLE_STAGES.length - 1 ? (
              <div className="flex justify-start pl-6" aria-hidden="true">
                <div className="h-4 w-px bg-gradient-to-b from-teal-500/40 to-teal-500/10" />
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
