type SearchGatewayHeroProps = {
  query: string;
};

export default function SearchGatewayHero({ query }: SearchGatewayHeroProps) {
  return (
    <header className="home-surface overflow-hidden rounded-2xl border border-zinc-800">
      <div className="space-y-2 px-4 py-6 sm:px-10 sm:py-8 lg:px-12">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">Search</h1>
        <p className="text-sm text-zinc-400">
          Type a country, company, or university name — then open a profile.
        </p>
      </div>

      <div className="border-t border-zinc-800 px-4 py-6 sm:px-10 lg:px-12">
        <form
          action="/search"
          method="get"
          role="search"
          aria-label="Search profiles"
          className="flex max-w-3xl flex-col gap-3 sm:relative sm:block"
        >
          <label htmlFor="gateway-search" className="sr-only">
            Search profiles
          </label>
          <input
            id="gateway-search"
            name="q"
            type="search"
            key={query}
            defaultValue={query}
            placeholder="e.g. Uzbekistan, Apple, Oxford"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            className="home-search-input w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3.5 text-base text-zinc-100 placeholder:text-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 sm:px-5 sm:py-4 sm:pr-28"
          />
          <button
            type="submit"
            className="min-h-11 w-full rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 sm:absolute sm:right-2 sm:top-1/2 sm:w-auto sm:-translate-y-1/2"
          >
            Search
          </button>
        </form>
      </div>
    </header>
  );
}
