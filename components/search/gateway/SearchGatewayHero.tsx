import { SEARCH_GATEWAY, SEARCHABLE_CATEGORIES } from "@/lib/search-gateway";
import { getEntityCounts } from "@/lib/global-search";

type SearchGatewayHeroProps = {
  query: string;
};

export default function SearchGatewayHero({ query }: SearchGatewayHeroProps) {
  const counts = getEntityCounts();

  return (
    <header className="home-surface overflow-hidden rounded-2xl border border-zinc-800">
      <div className="px-8 py-8 sm:px-10 sm:py-10 lg:px-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400/90">
          {SEARCH_GATEWAY.eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-[1.12] tracking-tight text-zinc-50 sm:text-4xl lg:text-[2.65rem]">
          {SEARCH_GATEWAY.headline}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          {SEARCH_GATEWAY.explanation}
        </p>
        <p className="mt-3 text-sm text-zinc-500">
          {counts.all} records in local country, company, and university registries.
        </p>
      </div>

      <div className="border-t border-zinc-800 px-8 py-10 sm:px-10 lg:px-12 lg:py-12">
        <form
          action="/search"
          method="get"
          role="search"
          aria-label="Global search gateway"
          className="relative mx-auto max-w-3xl"
        >
          <label htmlFor="gateway-search" className="sr-only">
            Search the CBAI platform
          </label>
          <input
            id="gateway-search"
            name="q"
            type="search"
            key={query}
            defaultValue={query}
            placeholder={SEARCH_GATEWAY.placeholder}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            className="home-search-input w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-5 py-4 pr-28 text-base text-zinc-100 placeholder:text-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 sm:py-5 sm:text-lg"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 min-h-11 -translate-y-1/2 rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            Search
          </button>
        </form>
      </div>

      <div className="border-t border-zinc-800 px-8 py-8 sm:px-10 lg:px-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          {SEARCH_GATEWAY.whatCanISearchTitle}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          {SEARCH_GATEWAY.whatCanISearchDescription}
        </p>
        <ul
          className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Searchable categories"
        >
          {SEARCHABLE_CATEGORIES.filter((category) => category.connected).map((category) => (
            <li
              key={category.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
            >
              <span className="text-sm font-medium text-zinc-100">{category.label}</span>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                {category.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
