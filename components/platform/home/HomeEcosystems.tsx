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
      return "border-teal-500/30 bg-teal-500/8 text-teal-300";
    case "future-workspace":
      return "border-zinc-600/80 bg-zinc-900/70 text-zinc-400";
  }
}

function cardOpacityClass(status: EcosystemStatus): string {
  switch (status) {
    case "available-today":
      return "border-teal-500/20 shadow-[0_0_56px_-16px_rgba(34,211,238,0.22)]";
    case "in-development":
      return "border-teal-500/10 opacity-95";
    case "future-workspace":
      return "border-zinc-700/60 opacity-90";
  }
}

function EcosystemIcon({ id, size = "sm" }: { id: EcosystemIconId; size?: "sm" | "lg" }) {
  const shared =
    size === "lg"
      ? "h-16 w-16 shrink-0 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-emerald-400"
      : "h-10 w-10 shrink-0 rounded-lg border border-teal-500/15 bg-teal-500/5 p-2 text-teal-400";

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

// Asymmetric, not a grid of equal-weight cards: the one ecosystem that is genuinely most built
// (CBAI_ECOSYSTEMS' real `flagship` flag, not an editorial choice invented for this layout) gets
// a wide, featured treatment; the rest sit beneath it as a quieter, honestly-secondary row. A
// uniform grid would visually claim all four are equally mature, which would not be true.
export default function HomeEcosystems() {
  const flagship = CBAI_ECOSYSTEMS.find((e) => e.flagship) ?? CBAI_ECOSYSTEMS[0];
  const rest = CBAI_ECOSYSTEMS.filter((e) => e.id !== flagship.id);

  return (
    <section aria-labelledby="home-ecosystems-heading" className="space-y-8">
      <div className="space-y-3 text-center sm:text-left">
        <p className={cbaiSectionEyebrow}>CBAI Ecosystems</p>
        <h2 id="home-ecosystems-heading" className="cbai-display text-3xl text-zinc-50 sm:text-4xl">
          One Intelligence Core, three ecosystems
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          Research Intelligence is CBAI&apos;s flagship ecosystem today. Governance and Economic
          Intelligence share the same evidence core and are in active development — honest
          status for what is available now and what is coming next.
        </p>
      </div>

      <article
        className={`${cbaiGlassCard} ${cardOpacityClass(flagship.status)} grid gap-8 p-7 sm:p-10 lg:grid-cols-[auto_1fr_auto] lg:items-center`}
      >
        <EcosystemIcon id={flagship.id} size="lg" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="cbai-display text-2xl text-zinc-50 sm:text-3xl">{flagship.title}</h3>
            <span className="shrink-0 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
              Flagship
            </span>
            <span className={`shrink-0 rounded-md border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusBadgeClass(flagship.status)}`}>
              {ECOSYSTEM_STATUS_LABELS[flagship.status]}
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-300">{flagship.valueSentence}</p>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            {flagship.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-sm text-zinc-400">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" aria-hidden="true" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
        {flagship.href ? (
          <Link
            href={flagship.href}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#005810] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,88,16,0.6)] transition-colors hover:bg-[#00470d] lg:self-center"
          >
            {flagship.ctaLabel ?? "Open →"}
          </Link>
        ) : null}
      </article>

      <ul className="grid gap-4 sm:grid-cols-3">
        {rest.map((ecosystem) => (
          <li key={ecosystem.id}>
            <article className={`${cbaiGlassCard} ${cardOpacityClass(ecosystem.status)} flex h-full flex-col gap-3 p-5`}>
              <div className="flex items-start gap-3">
                <EcosystemIcon id={ecosystem.id} size="sm" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-zinc-50">{ecosystem.title}</h3>
                  <span className={`mt-1 inline-block rounded-md border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${statusBadgeClass(ecosystem.status)}`}>
                    {ECOSYSTEM_STATUS_LABELS[ecosystem.status]}
                  </span>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-zinc-400">{ecosystem.valueSentence}</p>
              {ecosystem.href && ecosystem.status === "available-today" ? (
                <Link href={ecosystem.href} className="mt-auto inline-flex text-xs font-semibold text-teal-400 transition-colors hover:text-teal-300">
                  {ecosystem.ctaLabel ?? "Open →"}
                </Link>
              ) : (
                <p className="mt-auto text-[11px] text-zinc-600">
                  {ecosystem.status === "future-workspace" ? "Planned as a future workspace." : "In active development — not fully available yet."}
                </p>
              )}
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
