"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import OperatorOrb from "@/components/shared/OperatorOrb";
import { cbaiGlassCard, cbaiSectionEyebrow, cbaiBtnPrimary, cbaiBtnSecondary } from "@/components/brand/brand-classes";

const ECOSYSTEM_HREFS = ["/research", "/companies", "/government"] as const;

export default function AboutPageClient() {
  const { t, language } = useTranslation();
  const about = getDictionary(language).aboutPage;
  const productStatus = getDictionary(language).productStatus;

  return (
    <OperatingPageShell title={t("aboutPage.title")} description={t("aboutPage.pageDescription")}>
      <section aria-labelledby="about-purpose-heading" className={`${cbaiGlassCard} relative overflow-hidden p-8 sm:p-12`}>
        <svg aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 text-[#005810] opacity-[0.06]" viewBox="0 0 200 200" fill="none">
          <g stroke="currentColor" strokeWidth="1">
            <path d="M20 40 L90 20 L150 60 L110 130 L40 110 Z" />
            <path d="M90 20 L110 130" />
            <path d="M20 40 L150 60" />
            <path d="M150 60 L180 150" />
          </g>
          <g fill="currentColor">
            <circle cx="20" cy="40" r="3" />
            <circle cx="90" cy="20" r="3" />
            <circle cx="150" cy="60" r="4" />
            <circle cx="110" cy="130" r="3" />
            <circle cx="40" cy="110" r="2.5" />
            <circle cx="180" cy="150" r="2.5" />
          </g>
        </svg>
        <div className="relative flex flex-col items-start gap-6">
          <OperatorOrb state="idle" size={64} />
          <p className={cbaiSectionEyebrow}>{t("aboutPage.whoWeAreEyebrow")}</p>
          <h1 id="about-purpose-heading" className="cbai-display max-w-3xl text-3xl text-zinc-50 sm:text-4xl md:text-5xl">
            {t("aboutPage.purposeHeadline")}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-400">{t("aboutPage.purposeBody")}</p>
        </div>
      </section>

      <section aria-labelledby="about-what-heading" className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-what-heading">{t("aboutPage.whatIsEyebrow")}</p>
        <h2 className="max-w-3xl cbai-display text-2xl text-zinc-50 sm:text-3xl">{t("aboutPage.whatIsHeadline")}</h2>
        <p className="max-w-2xl text-base leading-relaxed text-zinc-400">
          {t("aboutPage.whatIsBody")} {t("aboutPage.whatIsBodyExtra")}
        </p>
      </section>

      <section aria-labelledby="about-why-heading" className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-why-heading">{t("aboutPage.whyEyebrow")}</p>
        <h2 className="max-w-2xl cbai-display text-2xl text-zinc-50 sm:text-3xl">{t("aboutPage.whyHeadline")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {about.whyProblems.map((item) => (
            <div key={item.title} className="rounded-lg bg-zinc-900/50 px-5 py-4">
              <p className="text-sm font-semibold text-zinc-100">{item.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{item.body}</p>
            </div>
          ))}
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-zinc-400">{t("aboutPage.whyClosingExtended")}</p>
      </section>

      <section aria-labelledby="about-philosophy-heading" className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-philosophy-heading">{t("aboutPage.philosophyEyebrow")}</p>
        <h2 className="max-w-2xl cbai-display text-2xl text-zinc-50 sm:text-3xl">{t("aboutPage.philosophyHeadline")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {about.principles.map((principle, index) => (
            <div key={principle.title} className="relative overflow-hidden rounded-lg bg-zinc-900/50 px-5 py-4 pl-6">
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-[#005810] opacity-60" />
              <p className="font-mono text-[11px] text-zinc-600">{String(index + 1).padStart(2, "0")}</p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">{principle.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{principle.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="about-different-heading" className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-different-heading">{t("aboutPage.differentEyebrow")}</p>
        <h2 className="max-w-2xl cbai-display text-2xl text-zinc-50 sm:text-3xl">{t("aboutPage.differentHeadline")}</h2>
        <div className="space-y-3">
          {about.differentiators.map((d) => (
            <div key={d.from} className="flex flex-col gap-3 rounded-lg bg-zinc-900/50 px-5 py-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex shrink-0 items-center gap-3 sm:w-64">
                <span className="text-sm text-zinc-500 line-through decoration-zinc-700">{d.from}</span>
                <span aria-hidden="true" className="text-[#2fbf71]">→</span>
                <span className="text-sm font-semibold text-zinc-100">{d.to}</span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-500">{d.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="about-audience-heading" className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-audience-heading">{t("aboutPage.audiencesServesEyebrow")}</p>
        <h2 className="max-w-2xl cbai-display text-2xl text-zinc-50 sm:text-3xl">{t("aboutPage.audiencesHeadline")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {about.audiences.map((a) => (
            <div key={a.role} className="rounded-lg bg-zinc-900/50 px-5 py-4">
              <p className="text-sm font-semibold text-zinc-100">{a.role}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{a.need}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="about-workflow-heading" className={`${cbaiGlassCard} space-y-8 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-workflow-heading">{t("aboutPage.workflowEyebrow")}</p>
        <h2 className="max-w-2xl cbai-display text-2xl text-zinc-50 sm:text-3xl">{t("aboutPage.workflowHeadline")}</h2>
        <div className="flex flex-col gap-0 sm:flex-row sm:items-stretch">
          {about.workflowSteps.map((s, index) => (
            <div key={s.step} className="flex flex-1 flex-col items-center gap-3 sm:flex-row">
              <div className="flex w-full flex-col items-center gap-2 rounded-lg bg-zinc-900/50 px-4 py-5 text-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#005810]/40 text-xs font-semibold text-[#2fbf71]">
                  {index + 1}
                </span>
                <p className="text-sm font-semibold text-zinc-100">{s.step}</p>
                <p className="text-xs leading-relaxed text-zinc-500">{s.detail}</p>
              </div>
              {index < about.workflowSteps.length - 1 ? (
                <span aria-hidden="true" className="hidden shrink-0 text-zinc-700 sm:block">→</span>
              ) : null}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/search" className={cbaiBtnSecondary}>{t("aboutPage.trySearch")}</Link>
          <Link href="/my-work" className={cbaiBtnSecondary}>{t("aboutPage.startProject")}</Link>
        </div>
      </section>

      <section aria-labelledby="about-ecosystems-heading" className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-ecosystems-heading">{t("aboutPage.ecosystemsEyebrow")}</p>
        <h2 className="max-w-2xl cbai-display text-2xl text-zinc-50 sm:text-3xl">{t("aboutPage.ecosystemsHeadline")}</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {about.ecosystems.map((e, index) => (
            <Link
              key={e.name}
              href={ECOSYSTEM_HREFS[index] ?? "/"}
              className="group flex flex-col gap-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-5 py-5 transition-all hover:-translate-y-0.5 hover:border-[#2fbf71]/40 hover:bg-zinc-900"
            >
              <p className="text-sm font-semibold text-zinc-100">{e.name}</p>
              <p className="text-sm leading-relaxed text-zinc-500">{e.description}</p>
              <span className="mt-auto pt-2 text-xs font-medium text-[#2fbf71] opacity-0 transition-opacity group-hover:opacity-100">
                {t("aboutPage.exploreArrow")}
              </span>
            </Link>
          ))}
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">{t("aboutPage.ecosystemsClosing")}</p>
      </section>

      <section aria-labelledby="about-trust-heading" className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-trust-heading">{t("aboutPage.trustEyebrow")}</p>
        <h2 className="max-w-2xl cbai-display text-2xl text-zinc-50 sm:text-3xl">{t("aboutPage.trustHeadline")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-zinc-900/50 px-5 py-4">
            <p className="text-sm font-semibold text-[#2fbf71]">{t("aboutPage.trustDoesHeading")}</p>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-zinc-400">
              {about.trustDoes.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-zinc-900/50 px-5 py-4">
            <p className="text-sm font-semibold text-amber-400">{t("aboutPage.trustNeverHeading")}</p>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-zinc-400">
              {about.trustNever.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
          {t("aboutPage.trustClosingBefore")}
          <Link href="/trust" className="font-medium text-[#2fbf71] hover:underline">
            {t("aboutPage.trustClosingLink")}
          </Link>
          {t("aboutPage.trustClosingAfter")}
        </p>
      </section>

      <section aria-labelledby="about-vision-heading" className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-vision-heading">{t("aboutPage.visionEyebrow")}</p>
        <h2 className="max-w-2xl cbai-display text-2xl text-zinc-50 sm:text-3xl">{t("aboutPage.visionHeadline")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {about.visionItems.map((line) => (
            <p key={line} className="rounded-lg bg-zinc-900/50 px-5 py-4 text-sm leading-relaxed text-zinc-400">
              {line}
            </p>
          ))}
        </div>
      </section>

      <section aria-labelledby="about-limitations-heading" className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-limitations-heading">{t("aboutPage.limitationsEyebrow")}</p>
        <h2 className="max-w-2xl cbai-display text-2xl text-zinc-50 sm:text-3xl">{t("aboutPage.limitationsHeadline")}</h2>
        <ul className="space-y-3">
          {about.limitationsItems.map((line) => (
            <li key={line} className="rounded-lg bg-zinc-900/50 px-5 py-4 text-sm leading-relaxed text-zinc-400">
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="about-roadmap-heading" className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-roadmap-heading">{t("aboutPage.roadmapEyebrow")}</p>
        <h2 className="max-w-2xl cbai-display text-2xl text-zinc-50 sm:text-3xl">{t("aboutPage.roadmapHeadline")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {about.roadmapItems.map((item) => {
            const status = productStatus[item.statusKey];
            return (
              <div key={item.name} className="rounded-lg bg-zinc-900/50 px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-100">{item.name}</p>
                  <span className="rounded-md border border-zinc-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                    {status.label}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{item.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="about-manifesto-heading"
        className="relative overflow-hidden rounded-xl border border-[#005810]/20 bg-[#0b1f3a] px-8 py-12 sm:p-16"
      >
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]" viewBox="0 0 400 300" fill="none">
          <g stroke="#2fbf71" strokeWidth="0.75">
            <path d="M20 40 L120 20 L220 70 L160 180 L60 150 Z" />
            <path d="M220 70 L340 40 L380 160 L260 200" />
            <path d="M120 20 L160 180" />
            <path d="M60 150 L20 40" />
          </g>
          <g fill="#2fbf71">
            <circle cx="20" cy="40" r="2.5" /><circle cx="120" cy="20" r="2.5" />
            <circle cx="220" cy="70" r="3" /><circle cx="160" cy="180" r="2.5" />
            <circle cx="60" cy="150" r="2" /><circle cx="340" cy="40" r="2.5" />
            <circle cx="380" cy="160" r="2" /><circle cx="260" cy="200" r="2.5" />
          </g>
        </svg>
        <div className="relative mx-auto max-w-3xl space-y-8 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#6fe3a4]">
            {t("aboutPage.manifestoTitle")}
          </p>
          <h2 id="about-manifesto-heading" className="cbai-display text-2xl text-white sm:text-3xl">
            {t("aboutPage.manifestoHeadline")}
          </h2>
          <ul className="space-y-4 text-left sm:columns-2 sm:gap-x-10">
            {about.manifestoItems.map((line) => (
              <li key={line} className="break-inside-avoid text-sm leading-relaxed text-zinc-300 sm:text-[15px]">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="about-closing-heading" className={`${cbaiGlassCard} space-y-6 p-8 text-center sm:p-16`}>
        <div className="mx-auto flex justify-center">
          <OperatorOrb state="greeting" size={56} />
        </div>
        <h2 id="about-closing-heading" className="mx-auto max-w-2xl cbai-display text-2xl text-zinc-50 sm:text-3xl">
          {t("aboutPage.closingHeadline")}
        </h2>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-zinc-500">{t("aboutPage.closingBody")}</p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href="/" className={cbaiBtnPrimary}>{t("aboutPage.enterCBAI")}</Link>
          <Link href="/trust" className={cbaiBtnSecondary}>{t("aboutPage.readTrustCenter")}</Link>
        </div>
      </section>
    </OperatingPageShell>
  );
}
