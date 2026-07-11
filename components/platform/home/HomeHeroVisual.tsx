import { CBAI_ECOSYSTEMS, ECOSYSTEM_STATUS_LABELS } from "@/lib/cbai-ecosystems";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

// A restrained composition built from real platform data (the same CBAI_ECOSYSTEMS list
// rendered below in HomeEcosystems), not a decorative illustration — the point is to show,
// at a glance, that CBAI is one system with several honestly-labeled ecosystems.
export default function HomeHeroVisual() {
  return (
    <div className={`${cbaiGlassCard} mx-auto w-full max-w-md p-6`}>
      <p className={cbaiSectionEyebrow}>Intelligence Core</p>
      <p className="mt-1 text-sm text-zinc-400">One evidence core, honestly-labeled ecosystems.</p>

      <ul className="mt-5 space-y-2.5">
        {CBAI_ECOSYSTEMS.map((ecosystem) => (
          <li
            key={ecosystem.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2.5"
          >
            <span className="text-sm font-medium text-zinc-200">
              {ecosystem.title}
              {ecosystem.flagship ? (
                <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                  Flagship
                </span>
              ) : null}
            </span>
            <span className="shrink-0 text-[11px] text-zinc-500">
              {ECOSYSTEM_STATUS_LABELS[ecosystem.status]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
