import Link from "next/link";
import { cbaiBtnPrimary, cbaiGlassCard } from "@/components/brand/brand-classes";

type SearchGatewayHeroProps = {
  query: string;
};

export default function SearchGatewayHero({ query }: SearchGatewayHeroProps) {
  return (
    <header className="space-y-3">
      {!query ? (
        <p className="text-sm text-zinc-400">Search country, company, or university.</p>
      ) : null}
      <form
        action="/search"
        method="get"
        role="search"
        aria-label="Search country, company, or university"
        className={`${cbaiGlassCard} flex flex-col gap-2 p-2 sm:relative sm:block`}
      >
        <label htmlFor="gateway-search" className="sr-only">
          Search country, company, or university
        </label>
        <input
          id="gateway-search"
          name="q"
          type="search"
          key={query}
          defaultValue={query}
          placeholder="Japan, Apple, Harvard University"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          autoFocus={Boolean(query)}
          className="home-search-input w-full rounded-lg border border-zinc-800/80 bg-slate-950/60 px-4 py-4 text-base text-zinc-100 placeholder:text-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 sm:py-4 sm:pr-28 sm:text-lg"
        />
        <button
          type="submit"
          className={`${cbaiBtnPrimary} min-h-11 w-full sm:absolute sm:right-3 sm:top-1/2 sm:w-auto sm:-translate-y-1/2`}
        >
          Search
        </button>
      </form>
      {!query ? (
        <p className="text-xs text-zinc-600">
          Part of{" "}
          <Link href="/" className="text-cyan-400/80 hover:text-cyan-300">
            Public Intelligence
          </Link>{" "}
          — available today.
        </p>
      ) : null}
    </header>
  );
}
