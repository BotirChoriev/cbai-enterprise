"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiBtnPrimary, cbaiGlassCard } from "@/components/brand/brand-classes";

type SearchGatewayHeroProps = {
  query: string;
};

export default function SearchGatewayHero({ query }: SearchGatewayHeroProps) {
  const { t } = useTranslation();

  return (
    <header className="space-y-3">
      {!query ? <p className="text-sm text-zinc-400">{t("search.hint")}</p> : null}
      <form
        action="/search"
        method="get"
        role="search"
        aria-label={t("search.ariaLabel")}
        className={`${cbaiGlassCard} flex flex-col gap-2 p-2 sm:relative sm:block`}
      >
        <label htmlFor="gateway-search" className="sr-only">
          {t("search.ariaLabel")}
        </label>
        <input
          id="gateway-search"
          name="q"
          type="search"
          key={query}
          defaultValue={query}
          placeholder={t("search.placeholder")}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          autoFocus={Boolean(query)}
          className="home-search-input w-full rounded-lg border border-zinc-800/80 bg-slate-950/60 px-4 py-4 text-base text-zinc-100 placeholder:text-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 sm:py-4 sm:pr-28 sm:text-lg"
        />
        <button
          type="submit"
          className={`${cbaiBtnPrimary} min-h-11 w-full sm:absolute sm:right-3 sm:top-1/2 sm:w-auto sm:-translate-y-1/2`}
        >
          {t("search.submit")}
        </button>
      </form>
      {!query ? (
        <p className="text-xs text-zinc-600">
          {t("search.partOf")}{" "}
          <Link href="/" className="text-teal-400/80 hover:text-teal-300">
            {t("search.publicIntelligence")}
          </Link>{" "}
          — {t("search.availableToday")}
        </p>
      ) : null}
    </header>
  );
}
