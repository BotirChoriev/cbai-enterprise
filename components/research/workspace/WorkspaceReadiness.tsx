import {
  WORKSPACE_AVAILABLE_TODAY,
  WORKSPACE_HUMAN_REVIEW_NOTICE,
  WORKSPACE_NOT_AVAILABLE_YET,
  getResearchWorkspace,
} from "@/lib/research/workspace";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function WorkspaceReadiness() {
  const workspace = getResearchWorkspace();

  return (
    <section aria-labelledby="workspace-readiness-heading" className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>Readiness</p>
        <h2 id="workspace-readiness-heading" className="text-xl font-semibold text-zinc-100">
          Workspace readiness
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={`${cbaiGlassCard} border-emerald-500/15 p-5`}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/90">
            Available today
          </p>
          <ul className="mt-3 space-y-2">
            {WORKSPACE_AVAILABLE_TODAY.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={`${cbaiGlassCard} border-zinc-700/40 p-5`}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Not available yet
          </p>
          <ul className="mt-3 space-y-2">
            {WORKSPACE_NOT_AVAILABLE_YET.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-zinc-500">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`${cbaiGlassCard} p-5`}>
        <p className="text-[10px] font-medium uppercase tracking-wider text-cyan-400/90">
          Supported objects
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {workspace.supportedObjects.map((object) => (
            <li
              key={object}
              className="rounded-md border border-zinc-800 bg-zinc-900/50 px-2 py-1 text-xs text-zinc-400"
            >
              {object}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-zinc-600">{WORKSPACE_HUMAN_REVIEW_NOTICE}</p>
      </div>
    </section>
  );
}
