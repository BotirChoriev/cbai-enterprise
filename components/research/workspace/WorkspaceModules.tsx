import { getResearchWorkspace, isWorkspaceModuleActive } from "@/lib/research/workspace";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function WorkspaceModules() {
  const workspace = getResearchWorkspace();

  return (
    <section aria-labelledby="workspace-modules-heading" className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>Modules</p>
        <h2 id="workspace-modules-heading" className="text-xl font-semibold text-zinc-100">
          Workspace modules
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Future modules for knowledge organization and evidence review — shell only today.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {workspace.futureModules.map((module) => {
          const active = isWorkspaceModuleActive(module);
          return (
            <li key={module}>
              <div
                className={`${cbaiGlassCard} p-4 ${active ? "border-emerald-500/15" : "opacity-90"}`}
              >
                <p className="text-sm font-medium text-zinc-200">{module}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                  {active ? "Available in catalog shell" : "Future workspace — not connected yet"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
