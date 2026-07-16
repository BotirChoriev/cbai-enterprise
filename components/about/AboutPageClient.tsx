"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import OperatorOrb from "@/components/shared/OperatorOrb";
import { cbaiGlassCard, cbaiSectionEyebrow, cbaiBtnPrimary, cbaiBtnSecondary } from "@/components/brand/brand-classes";

const PRINCIPLES = [
  { title: "Evidence before opinion", description: "A position is only as strong as the evidence connected to it. CBAI states what is known, what is missing, and never fills the gap with confidence it hasn't earned." },
  { title: "Transparency before confidence", description: "A number without a method is a guess wearing a costume. Every figure in CBAI traces back to a documented source and a stated methodology, or it is not shown at all." },
  { title: "Understanding before decisions", description: "CBAI is built to slow the moment before a decision down by exactly the amount needed to understand it — never to rush a conclusion, never to substitute for one." },
  { title: "Knowledge belongs together", description: "A research finding, a country's institutions, and a company's exposure to that research are not separate stories. CBAI connects them because reality already does." },
  { title: "Technology should assist thinking, not replace it", description: "CBAI organizes, connects, and explains. It does not conclude on a person's behalf. The reasoning stays visible so the thinking stays yours." },
  { title: "Humans remain responsible", description: "Every output CBAI produces carries a human-decision-required principle. Judgment, accountability, and consequence belong to the person using the platform — always, without exception." },
  { title: "Uncertainty is a fact, not a failure", description: "When evidence is insufficient, CBAI says so directly, in full sentences, in the same place a confident answer would have gone. An honest gap is more useful than a fabricated fill." },
  { title: "Sources outrank summaries", description: "A summary is a convenience. A source is the truth it was built from. CBAI keeps the path between them open, always one click from claim back to citation." },
  { title: "Alternatives, not verdicts", description: "Real decisions rarely have one right answer. CBAI presents options side by side, with their real trade-offs, rather than forcing a single recommendation dressed as certainty." },
  { title: "History is preserved, not overwritten", description: "Understanding changes as evidence changes. CBAI keeps that history intact, so nothing that was once believed simply disappears without a trace." },
  { title: "Neutrality is a discipline", description: "CBAI does not have a political position. It has a method. The same evidentiary standard applies whether the subject is popular, unpopular, or uncomfortable." },
  { title: "Explain, always", description: "Every classification, every status, every gap comes with a plain-language reason. Nothing in CBAI is color-coded and left unexplained." },
] as const;

export default function AboutPageClient() {
  const { t } = useTranslation();

  return (
    <OperatingPageShell title={t("aboutPage.title")} description={t("aboutPage.pageDescription")}>
      <section aria-labelledby="about-purpose-heading" className={`${cbaiGlassCard} relative overflow-hidden p-8 sm:p-12`}>
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
        <p className="max-w-2xl text-base leading-relaxed text-zinc-400">{t("aboutPage.whatIsBody")}</p>
      </section>

      <section aria-labelledby="about-philosophy-heading" className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-philosophy-heading">{t("aboutPage.philosophyEyebrow")}</p>
        <h2 className="max-w-2xl cbai-display text-2xl text-zinc-50 sm:text-3xl">{t("aboutPage.philosophyHeadline")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((principle, index) => (
            <div key={principle.title} className="relative overflow-hidden rounded-lg bg-zinc-900/50 px-5 py-4 pl-6">
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-[#005810] opacity-60" />
              <p className="font-mono text-[11px] text-zinc-600">{String(index + 1).padStart(2, "0")}</p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">{principle.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{principle.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/search" className={cbaiBtnSecondary}>{t("aboutPage.trySearch")}</Link>
        <Link href="/my-work" className={cbaiBtnPrimary}>{t("aboutPage.enterCBAI")}</Link>
        <Link href="/trust" className={cbaiBtnSecondary}>{t("aboutPage.openTrust")}</Link>
        <Link href="/research" className={cbaiBtnSecondary}>{t("aboutPage.exploreResearch")}</Link>
      </div>
    </OperatingPageShell>
  );
}
