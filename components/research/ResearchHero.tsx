"use client";

import Link from "next/link";
import {
  cbaiBtnPrimary,
  cbaiSearchInput,
  cbaiSearchShell,
  cbaiSectionEyebrow,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";
import { RESEARCH_HOME } from "@/lib/research";
import { RESEARCH_DOMAINS, RESEARCH_TOPICS } from "@/lib/research/research-topics";
import ResearchEvidenceLattice from "@/components/research/ResearchEvidenceLattice";
import { useTranslation } from "@/lib/i18n/use-translation";

type ResearchHeroProps = {
  query?: string;
};

export default function ResearchHero({ query = "" }: ResearchHeroProps) {
  const { t } = useTranslation();

  return (
    <header className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className={cbaiSectionEyebrow}>{t("zeroLearningCurve.researchHeroEyebrow")}</p>
          <h1 className="cbai-display text-3xl text-zinc-50 sm:text-4xl">
            {RESEARCH_HOME.title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            {RESEARCH_HOME.subheadline}
          </p>
        </div>

        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">{RESEARCH_HOME.coreMessage}</p>

        <div className="space-y-3">
          <p className={cbaiSectionEyebrow}>{t("zeroLearningCurve.researchSearchEyebrow")}</p>
          <form
            action="/research"
            method="get"
            role="search"
            aria-label={t("zeroLearningCurve.researchSearchAria")}
            className={`${cbaiSearchShell} flex flex-col gap-3 sm:relative sm:block`}
          >
            <label htmlFor="research-search" className="sr-only">
              {t("zeroLearningCurve.researchSearchAria")}
            </label>
            <input
              id="research-search"
              name="q"
              type="search"
              key={query}
              defaultValue={query}
              placeholder={RESEARCH_HOME.searchPlaceholder}
              autoComplete="off"
              className={`${cbaiSearchInput} text-base sm:text-lg`}
            />
            <button
              type="submit"
              className={`${cbaiBtnPrimary} min-h-11 w-full sm:absolute sm:right-3 sm:top-1/2 sm:w-auto sm:-translate-y-1/2`}
            >
              {t("zeroLearningCurve.researchExploreTopic")}
            </button>
          </form>
          <p className={cbaiTextMuted}>{t("zeroLearningCurve.researchSearchFootnote")}</p>
        </div>

        <p className="text-sm text-zinc-500">
          University profiles available today in{" "}
          <Link href="/universities" className="font-medium text-teal-400 hover:text-teal-300">
            Public Intelligence → Universities
          </Link>
          .
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 lg:items-start">
        <ResearchEvidenceLattice />
        <p className="text-xs text-zinc-500 lg:pl-2">
          {RESEARCH_TOPICS.length} catalog topics across {RESEARCH_DOMAINS.length} real domains — node
          size reflects real topic count, never an invented score.
        </p>
      </div>
    </header>
  );
}
