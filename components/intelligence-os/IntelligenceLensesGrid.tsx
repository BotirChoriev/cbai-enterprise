"use client";

import Link from "next/link";
import { INTELLIGENCE_LENSES } from "@/lib/intelligence-os/intelligence-lenses";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function IntelligenceLensesGrid() {
  const { t } = useTranslation();

  return (
    <section className="space-y-5" aria-labelledby="intelligence-lenses-heading">
      <div>
        <p className={cbaiSectionEyebrow}>{t("intelligenceLenses.eyebrow")}</p>
        <h2 id="intelligence-lenses-heading" className="text-base font-semibold text-zinc-100">
          {t("intelligenceLenses.title")}
        </h2>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {INTELLIGENCE_LENSES.map((lens) => (
          <li key={lens.id}>
            <article className={`${cbaiMineralSurface} flex h-full flex-col gap-2 p-4`}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-medium text-zinc-200">{lens.label}</h3>
                <span className="shrink-0 text-[9px] uppercase tracking-wider text-zinc-600">
                  {lens.maturity === "live"
                    ? t("intelligenceLenses.maturityLive")
                    : lens.maturity === "partial"
                      ? t("intelligenceLenses.maturityPartial")
                      : t("intelligenceLenses.maturityPreview")}
                </span>
              </div>
              <p className="flex-1 text-xs leading-relaxed text-zinc-500">{lens.description}</p>
              <p className="text-[10px] uppercase tracking-wider text-teal-500/70">{t("intelligenceLenses.notPortal")}</p>
              <Link href={lens.route} className="text-xs font-medium text-teal-400 hover:text-teal-300">
                {t("intelligenceLenses.openLens")} →
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
