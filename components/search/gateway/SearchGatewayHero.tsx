type SearchGatewayHeroProps = {
  query: string;
};

export default function SearchGatewayHero({ query }: SearchGatewayHeroProps) {
  return (
    <header className="space-y-3">
      {!query ? (
        <p className="text-sm text-zinc-400">Find a country, company, or university.</p>
      ) : null}
      <form
        action="/search"
        method="get"
        role="search"
        aria-label="Search country, company, or university"
        className="flex flex-col gap-2 sm:relative sm:block"
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
          className="home-search-input w-full rounded-2xl border border-zinc-600 bg-zinc-900 px-4 py-4 text-base text-zinc-100 placeholder:text-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 sm:py-4 sm:pr-28 sm:text-lg"
        />
        <button
          type="submit"
          className="min-h-11 w-full rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 sm:absolute sm:right-2 sm:top-1/2 sm:w-auto sm:-translate-y-1/2 sm:rounded-lg"
        >
          Search
        </button>
      </form>
    </header>
  );
}
