"use client";

import { SUPREME_PRINCIPLES } from "@/lib/constitution/supreme-principles";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function SupremePrinciplesSection() {
  const { t, language } = useTranslation();
  const copy = getDictionary(language).supremeConstitution;

  return (
    <section className="space-y-4" aria-labelledby="supreme-constitution-heading">
      <div>
        <p className={cbaiSectionEyebrow}>{t("supremeConstitution.eyebrow")}</p>
        <h2 id="supreme-constitution-heading" className="text-base font-semibold text-zinc-200">
          {t("supremeConstitution.title")}
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {SUPREME_PRINCIPLES.map((principle) => {
          const translated = copy.principles[principle.id];
          return (
            <div key={principle.id} className={`${cbaiGlassCard} space-y-2 p-5`}>
              <p className="text-sm font-semibold text-[#2fbf71]">
                {translated?.title ?? principle.title}
              </p>
              <p className="text-sm leading-relaxed text-zinc-300">
                {translated?.statement ?? principle.statement}
              </p>
              <p className="text-xs leading-relaxed text-zinc-500">
                <span className="font-medium text-zinc-400">{t("supremeConstitution.productImplication")}: </span>
                {translated?.productImplication ?? principle.productImplication}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
