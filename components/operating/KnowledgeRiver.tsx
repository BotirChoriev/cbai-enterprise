"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { deriveKnowledgeRiver } from "@/lib/intelligence-os/knowledge-river";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type KnowledgeRiverProps = {
  className?: string;
  compact?: boolean;
};

/** Temporal evidence history from real mission/project records only. */
export default function KnowledgeRiver({ className = "", compact = false }: KnowledgeRiverProps) {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { mission } = useMissionContext();

  const events = useMemo(() => (hydrated ? deriveKnowledgeRiver(mission) : []), [hydrated, mission]);

  if (!hydrated || events.length === 0) return null;

  const visible = compact ? events.slice(0, 4) : events;

  return (
    <section className={`space-y-2 ${className}`} aria-labelledby="knowledge-river-heading">
      <p className={cbaiSectionEyebrow} id="knowledge-river-heading">
        {t("universalWorkspace.knowledgeRiver")}
      </p>
      <ol className="space-y-1.5">
        {visible.map((event) => (
          <li
            key={event.id}
            className="rounded-md border border-zinc-800/60 bg-zinc-950/30 px-2.5 py-1.5 text-xs"
          >
            {event.href ? (
              <Link href={event.href} className="block hover:text-teal-300">
                <span className="font-medium text-zinc-300">{event.label}</span>
                <span className="mt-0.5 block text-zinc-500">{event.detail}</span>
              </Link>
            ) : (
              <>
                <span className="font-medium text-zinc-300">{event.label}</span>
                <span className="mt-0.5 block text-zinc-500">{event.detail}</span>
              </>
            )}
            <span className="mt-1 block text-[10px] text-zinc-600">
              {t("universalWorkspace.riverCause")}: {event.cause}
            </span>
            <span
              className={`text-[10px] ${event.unresolved ? "text-amber-500/70" : "text-emerald-500/70"}`}
            >
              {event.unresolved
                ? t("universalWorkspace.riverUnresolved")
                : t("universalWorkspace.riverResolved")}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
