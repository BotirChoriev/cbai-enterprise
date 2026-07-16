"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import { translateGraphPersonas } from "@/lib/i18n/graph-extended-translation";

export default function GraphPersonas() {
  const { language } = useTranslation();
  const personas = translateGraphPersonas(getDictionary(language));
  const graphExtended = getDictionary(language).graphExtended;

  return (
    <ul
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      aria-label={graphExtended.personaGuidanceAria}
    >
      {personas.map((persona) => (
        <li
          key={persona.id}
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-4"
        >
          <h3 className="text-sm font-semibold text-zinc-100">{persona.title}</h3>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            {graphExtended.whatCanILearn}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{persona.whatCanILearn}</p>
        </li>
      ))}
    </ul>
  );
}
