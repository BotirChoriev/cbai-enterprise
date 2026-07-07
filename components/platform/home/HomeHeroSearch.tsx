import { HOME_SEARCH } from "@/lib/platform-home";

export default function HomeHeroSearch() {
  return (
    <form
      action={HOME_SEARCH.action}
      method="get"
      role="search"
      aria-label="Search countries, companies, and universities"
      className="relative w-full"
    >
      <label htmlFor="home-global-search" className="sr-only">
        Search country, company, or university
      </label>
      <input
        id="home-global-search"
        name={HOME_SEARCH.param}
        type="search"
        placeholder="e.g. Uzbekistan, Apple, Oxford"
        autoComplete="off"
        className="home-search-input w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-5 py-4 pr-28 text-base text-zinc-100 placeholder:text-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 sm:py-5 sm:text-lg"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
      >
        Search
      </button>
    </form>
  );
}
