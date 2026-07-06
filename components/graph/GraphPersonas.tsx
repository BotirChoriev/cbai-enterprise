import { GRAPH_PERSONAS } from "@/lib/graph/graph-platform";

export default function GraphPersonas() {
  return (
    <ul
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Knowledge graph persona guidance"
    >
      {GRAPH_PERSONAS.map((persona) => (
        <li
          key={persona.id}
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-4"
        >
          <h3 className="text-sm font-semibold text-zinc-100">{persona.title}</h3>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            What can I learn?
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
            {persona.whatCanILearn}
          </p>
        </li>
      ))}
    </ul>
  );
}
