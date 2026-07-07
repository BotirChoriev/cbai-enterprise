import { cbaiBtnPrimary } from "@/components/brand/brand-classes";
import { HOME_SEARCH } from "@/lib/platform-home";

export default function HomeHeroSearch() {
  return (
    <form
      action={HOME_SEARCH.action}
      method="get"
      role="search"
      aria-label="Search country, company, or university"
      className="cbai-glass flex flex-col gap-3 rounded-xl p-2 sm:relative sm:block"
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
        className="home-search-input w-full rounded-lg border border-zinc-800/80 bg-slate-950/60 px-5 py-4 text-lg text-zinc-100 placeholder:text-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 sm:py-5 sm:pr-32 sm:text-xl"
      />
      <button type="submit" className={`${cbaiBtnPrimary} min-h-12 w-full sm:absolute sm:right-4 sm:top-1/2 sm:w-auto sm:-translate-y-1/2`}>
        Search
      </button>
    </form>
  );
}
