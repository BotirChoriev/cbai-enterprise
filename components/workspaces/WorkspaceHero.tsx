import type { ReactNode } from "react";
import { cbaiPageHeader } from "@/components/brand/brand-classes";

type WorkspaceHeroProps = {
  versionLabel: string;
  title: string;
  subtitle: string;
  description: string;
  /** Room-specific accent for the eyebrow label — falls back to the shared cyan chrome. */
  accentClassName?: string;
  /** A bespoke, real-data-driven visual for this room. When present, the hero becomes a
   * two-column moment (text / motif) instead of the generic single-column card. */
  motif?: ReactNode;
  metrics?: readonly {
    label: string;
    value: string;
    detail?: string;
  }[];
};

export default function WorkspaceHero({
  versionLabel,
  title,
  subtitle,
  description,
  accentClassName,
  motif,
  metrics,
}: WorkspaceHeroProps) {
  const eyebrowClass = accentClassName ?? "text-cyan-400";

  return (
    <>
      <div className={`relative overflow-hidden ${cbaiPageHeader}`}>
        {!motif && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-sky-500/5 to-violet-500/5"
          />
        )}
        <div className={motif ? "relative grid items-center gap-8 lg:grid-cols-[1.05fr_1fr]" : "relative"}>
          <div>
            <p className={`text-[10px] font-medium uppercase tracking-widest ${eyebrowClass}`}>
              {versionLabel}
            </p>
            <h1 className="cbai-display mt-1 text-2xl text-zinc-50">{title}</h1>
            <p className="mt-0.5 text-sm font-medium text-zinc-400">{subtitle}</p>
            <p className="mt-2 max-w-3xl text-sm text-zinc-500">{description}</p>
          </div>
          {motif}
        </div>
      </div>

      {metrics && metrics.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3"
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                {metric.label}
              </p>
              <p className="mt-1 text-xl font-semibold text-zinc-100">
                {metric.value}
                {metric.detail && (
                  <span className="text-sm font-normal text-zinc-500"> {metric.detail}</span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
