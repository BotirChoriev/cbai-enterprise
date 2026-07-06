import Link from "next/link";
import { SEARCH_PERSONAS } from "@/lib/search-gateway";

export default function SearchPersonas() {
  return (
    <ul
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Search examples by persona"
    >
      {SEARCH_PERSONAS.map((persona) => (
        <li key={persona.id}>
          <Link
            href={persona.href}
            className="flex min-h-[5.5rem] flex-col justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-4 transition-colors hover:border-zinc-600 hover:bg-zinc-900/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            <span className="text-sm font-semibold text-zinc-100">
              {persona.title}
            </span>
            <span className="mt-1 text-xs text-zinc-500">Example search</span>
            <span className="mt-1 font-mono text-sm text-sky-400/90">
              {persona.exampleQuery}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
