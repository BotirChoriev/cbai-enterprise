import Link from "next/link";
import {
  CBAI_ECOSYSTEMS,
  ECOSYSTEM_STATUS_LABELS,
  type EcosystemIconId,
  type EcosystemStatus,
} from "@/lib/cbai-ecosystems";
import {
  cbaiGlassCard,
  cbaiSectionEyebrow,
} from "@/components/brand/brand-classes";

function statusBadgeClass(status: EcosystemStatus): string {
  switch (status) {
    case "available-today":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shadow-[0_0_16px_-4px_rgba(52,211,153,0.3)]";
    case "in-development":
      return "border-cyan-500/30 bg-cyan-500/8 text-cyan-300";
    case "future-workspace":
      return "border-zinc-600/80 bg-zinc-900/70 text-zinc-400";
  }
}

function cardOpacityClass(status: EcosystemStatus): string {
  switch (status) {
    case "available-today":
      return "border-cyan-500/20 shadow-[0_0_56px_-16px_rgba(34,211,238,0.22)]";
    case "in-development":
      return "border-cyan-500/10 opacity-95";
    case "future-workspace":
      return "border-zinc-700/60 opacity-90";
  }
}

function EcosystemIcon({ id }: { id: EcosystemIconId }) {
  const shared = "h-10 w-10 shrink-0 rounded-lg border border-cyan-500/15 bg-cyan-500/5 p-2 text-cyan-400";

  switch (id) {
    case "public":
      return (
        <svg className={shared} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.25" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />
          <circle cx="12" cy="6" r="1.25" fill="#22d3ee" />
          <circle cx="18" cy="12" r="1" fill="#38bdf8" />
          <circle cx="12" cy="18" r="1" fill="#60a5fa" />
        </svg>
      );
    case "research":
      return (
        <svg className={shared} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 3h6v3H9z" stroke="currentColor" strokeWidth="1.25" />
          <path d="M10 6v4l-4 9h12l-4-9V6" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="12" cy="14" r="1.5" fill="#22d3ee" />
        </svg>
      );
    case "economic":
      return (
        <svg className={shared} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 18l5-6 4 3 7-9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
          <circle cx="18" cy="6" r="1.25" fill="#22d3ee" />
          <circle cx="13" cy="15" r="1" fill="#38bdf8" />
        </svg>
      );
    case "governance":
      return (
        <svg className={shared} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3l8 4v6c0 4.5-3.5 7.5-8 8-4.5-.5-8-3.5-8-8V7l8-4z" stroke="currentColor" strokeWidth="1.25" />
          <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        </svg>
      );
  }
}

export default function HomeEcosystems() {
  return (
    <section aria-labelledby="home-ecosystems-heading" className="space-y-8">
      <div className="space-y-3 text-center sm:text-left">
        <p className={cbaiSectionEyebrow}>CBAI Ecosystems</p>
        <h2
          id="home-ecosystems-heading"
          className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl"
        >
          One global evidence platform
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          Four intelligence ecosystems — honest status for what is available now and what is
          coming next.
        </p>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2">
        {CBAI_ECOSYSTEMS.map((ecosystem) => (
          <li key={ecosystem.id}>
            <article
              className={`${cbaiGlassCard} ${cardOpacityClass(ecosystem.status)} flex h-full flex-col p-6`}
            >
              <div className="flex items-start gap-4">
                <EcosystemIcon id={ecosystem.id} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-zinc-50">{ecosystem.title}</h3>
                    <span
                      className={`shrink-0 rounded-md border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusBadgeClass(ecosystem.status)}`}
                    >
                      {ECOSYSTEM_STATUS_LABELS[ecosystem.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    {ecosystem.valueSentence}
                  </p>
                </div>
              </div>

              <ul className="mt-5 space-y-2 border-t border-cyan-500/10 pt-4">
                {ecosystem.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <span
                      className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${
                        ecosystem.status === "available-today"
                          ? "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]"
                          : "bg-zinc-600"
                      }`}
                      aria-hidden="true"
                    />
                    {bullet}
                  </li>
                ))}
              </ul>

              {ecosystem.href && ecosystem.status === "available-today" ? (
                <Link
                  href={ecosystem.href}
                  className="mt-5 inline-flex text-sm font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  Start with Search →
                </Link>
              ) : (
                <p className="mt-5 text-xs text-zinc-600">
                  {ecosystem.status === "future-workspace"
                    ? "Planned as a future workspace."
                    : "In active development — not fully available yet."}
                </p>
              )}
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
