import type { WorkspaceEvidenceStatus } from "@/lib/research/workspace/workspace-explorer";
import { WORKSPACE_EVIDENCE_STATUS_KIND_LABELS } from "@/lib/research/workspace/workspace-explorer";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

function statusClass(kind: WorkspaceEvidenceStatus["statusKind"]): string {
  switch (kind) {
    case "catalog_available":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "future_workspace":
      return "border-cyan-500/25 bg-cyan-500/5 text-cyan-300";
    case "not_connected_yet":
      return "border-zinc-700 bg-zinc-900/60 text-zinc-400";
  }
}

type WorkspaceEvidenceOverviewProps = {
  evidenceStatuses: readonly WorkspaceEvidenceStatus[];
};

export default function WorkspaceEvidenceOverview({
  evidenceStatuses,
}: WorkspaceEvidenceOverviewProps) {
  return (
    <section aria-labelledby="workspace-evidence-overview-heading" className="space-y-3">
      <h2 id="workspace-evidence-overview-heading" className="text-sm font-semibold text-zinc-100">
        Evidence Overview
      </h2>
      <p className="text-xs text-zinc-600">Research object readiness — status only, no live records.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {evidenceStatuses.map((item) => (
          <div key={item.label} className={`${cbaiGlassCard} p-3`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-zinc-200">{item.label}</p>
              <span
                className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${statusClass(item.statusKind)}`}
              >
                {WORKSPACE_EVIDENCE_STATUS_KIND_LABELS[item.statusKind]}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500">{item.status}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
