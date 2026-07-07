import { HOME_SEARCH } from "@/lib/platform-home";

export default function HomeHeroSearch() {
  return (
    <form
      action={HOME_SEARCH.action}
      method="get"
      role="search"
      aria-label="Search country, company, or university"
      className="flex flex-col gap-3 sm:relative sm:block"
    >
      <label htmlFor="home-global-search" className="sr-only">
        Search country, company, or university
      </label>
      <input
        id="home-global-search"
        name={HOME_SEARCH.param}
        type="search"
        placeholder="Japan, Apple, Harvard University"
        autoComplete="off"
        className="home-search-input w-full rounded-2xl border border-zinc-600 bg-zinc-900 px-5 py-5 text-lg text-zinc-100 placeholder:text-zinc-500 shadow-lg shadow-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 sm:py-6 sm:pr-32 sm:text-xl"
      />
      <button
        type="submit"
        className="min-h-12 w-full rounded-xl bg-zinc-100 px-5 py-3 text-base font-semibold text-zinc-900 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 sm:absolute sm:right-3 sm:top-1/2 sm:w-auto sm:-translate-y-1/2 sm:rounded-lg sm:py-2.5 sm:text-sm"
      >
        Search
      </button>
    </form>
  );
}
