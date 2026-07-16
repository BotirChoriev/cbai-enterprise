"use client";

import { HomeTrustIcon } from "@/components/platform/home/HomeModuleIcon";
import { TRUST_PILLAR_I18N_KEYS, TRUST_PILLARS } from "@/lib/platform-home";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

export default function HomeTrust() {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="home-trust-heading" className={`${cbaiGlassCard} p-8 sm:p-10`}>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-teal-400">
          <HomeTrustIcon className="h-6 w-6" />
        </div>
        <div>
          <h2 id="home-trust-heading" className="text-xl font-semibold text-zinc-50 sm:text-2xl">
            {t("home.trustHomeHeading")}
          </h2>
          <p className="text-sm text-zinc-500">{t("home.trustHomeSubtitle")}</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_PILLARS.map((pillar) => {
          const pillarKey = TRUST_PILLAR_I18N_KEYS[pillar.id as keyof typeof TRUST_PILLAR_I18N_KEYS];
          const title = pillarKey ? t(`trust.pillars.${pillarKey}.title`) : pillar.title;
          const description = pillarKey ? t(`trust.pillars.${pillarKey}.description`) : pillar.description;

          return (
            <article
              key={pillar.id}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-5"
            >
              <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
