import Link from "next/link";
import {
  CBAI_ECOSYSTEMS,
  ECOSYSTEM_STATUS_LABELS,
  type EcosystemStatus,
} from "@/lib/cbai-ecosystems";
import { cbaiGlassCard, cbaiSectionEyebrow, cbaiSectionTitle } from "@/components/brand/brand-classes";

function statusBadgeClass(status: EcosystemStatus): string {
  switch (status) {
    case "available-today":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    case "in-development":
      return "border-cyan-500/25 bg-cyan-500/5 text-cyan-400";
    case "future-workspace":
      return "border-zinc-600 bg-zinc-900/60 text-zinc-400";
  }
}

export default function HomeEcosystems() {
  return (
    <section aria-labelledby="home-ecosystems-heading" className="space-y-6">
      <div className="space-y-2">
        <p className={cbaiSectionEyebrow}>CBAI Ecosystems</p>
        <h2 id="home-ecosystems-heading" className={`${cbaiSectionTitle} text-xl sm:text-2xl`}>
          One global evidence platform
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          Four intelligence ecosystems — each built on official sources, clear review, and
          honest availability.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {CBAI_ECOSYSTEMS.map((ecosystem) => (
          <li key={ecosystem.id}>
            <article className={`${cbaiGlassCard} flex h-full flex-col p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">{ecosystem.title}</h3>
                <span
                  className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusBadgeClass(ecosystem.status)}`}
                >
                  {ECOSYSTEM_STATUS_LABELS[ecosystem.status]}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">{ecosystem.audience}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">
                {ecosystem.description}
              </p>
              {ecosystem.href && ecosystem.status === "available-today" ? (
                <Link
                  href={ecosystem.href}
                  className="mt-4 inline-flex text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  Start with Search →
                </Link>
              ) : null}
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
