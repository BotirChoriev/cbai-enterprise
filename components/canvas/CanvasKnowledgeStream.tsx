"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { loadProjects } from "@/lib/project/project-store";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import type { Mission } from "@/lib/intelligence-os/mission.types";

export default function CanvasKnowledgeStream() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const projects = hydrated ? loadProjects().slice(0, 4) : [];

  return (
    <section className="space-y-2 px-1" aria-labelledby="knowledge-stream-heading">
      <p id="knowledge-stream-heading" className={cbaiSectionEyebrow}>
        {t("intelligenceCanvas.knowledgeStream")}
      </p>
      {projects.length > 0 ? (
        <ul className="space-y-1">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/my-work?project=${p.id}`}
                className="block truncate text-xs text-zinc-400 transition-colors hover:text-teal-300"
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-zinc-600">{t("missionCenter.noLinkedProject")}</p>
      )}
      <Link href="/graph" className="inline-block text-xs text-teal-500/80 hover:text-teal-300">
        {t("intelligenceCanvas.viewGraph")} →
      </Link>
    </section>
  );
}

export function MissionDnaStrip({ mission }: { mission: Mission | null }) {
  const { t } = useTranslation();
  if (!mission) return null;

  const fields = [
    { label: t("missionCreation.whyLabel"), value: mission.whyExists },
    { label: t("missionCreation.successLabel"), value: mission.successCriteria },
    { label: t("missionCreation.capabilitiesLabel"), value: mission.capabilitiesNeeded },
  ].filter((f) => f.value?.trim());

  if (fields.length === 0) return null;

  return (
    <section className="border-t border-zinc-800/60 px-4 py-3" aria-labelledby="mission-dna-heading">
      <p id="mission-dna-heading" className={cbaiSectionEyebrow}>
        {t("intelligenceCanvas.missionDna")}
      </p>
      <dl className="mt-2 grid gap-2 sm:grid-cols-3">
        {fields.map((f) => (
          <div key={f.label}>
            <dt className="text-[9px] uppercase tracking-wider text-zinc-600">{f.label}</dt>
            <dd className="mt-0.5 text-xs leading-relaxed text-zinc-400">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
