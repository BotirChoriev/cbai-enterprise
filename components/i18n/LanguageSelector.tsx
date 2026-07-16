"use client";

import { useRef, useState } from "react";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getAllLanguages, getLanguageDefinition } from "@/lib/i18n/languages";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type LanguageSelectorProps = {
  /** Icon + code only — for the mobile header rail. */
  compact?: boolean;
};

/**
 * Real language selector (Global Language Foundation mission, Phase 5). A native
 * `<details>/<summary>` disclosure — the same accessible, keyboard-operable pattern already used
 * elsewhere in this app (e.g. the Countries World Intelligence Map) — rather than a custom
 * dropdown widget.
 *
 * Deliberately exposes THREE separate, clearly labeled settings, never conflated:
 *  1. Interface language — `profile.preferredLanguage`, switches all translated UI text
 *     immediately (every consumer reads it live via useTranslation()).
 *  2. Voice-recognition language — `profile.speechLanguage`, the BCP-47 tag the Command Center's
 *     Web Speech API call actually uses (see components/assistant/AssistantCommandCenter.tsx).
 *  3. Original source language — not a selector (there is nothing to switch): a one-line policy
 *     statement that source titles stay in their original language, with a translated summary
 *     shown separately rather than overwriting the source.
 *
 * Persistence, fallback, and "never show a raw key" are inherited for free from the existing
 * Assistant Profile system (localStorage when signed out, cloud-synced when signed in) and from
 * lib/i18n/translate.ts's English-fallback lookup — this component adds no second state system.
 */
export default function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const { profile, updateProfile } = useAssistantProfile();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const languages = getAllLanguages();
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? languages.filter(
        (language) =>
          language.name.toLowerCase().includes(normalizedQuery) ||
          language.nativeName.toLowerCase().includes(normalizedQuery) ||
          language.code.toLowerCase().includes(normalizedQuery),
      )
    : languages;

  const activeLanguages = filtered.filter((language) => language.active);
  const preparedLanguages = filtered.filter((language) => !language.active);
  const current = getLanguageDefinition(profile.preferredLanguage);

  function selectInterfaceLanguage(code: string) {
    updateProfile({ preferredLanguage: code });
    detailsRef.current?.removeAttribute("open");
  }

  return (
    <details ref={detailsRef} className="relative">
      <summary
        className="flex min-h-10 cursor-pointer list-none items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/80 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-teal-500/30 hover:text-teal-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 [&::-webkit-details-marker]:hidden"
        aria-label={`${t("common.open")} language settings — current interface language: ${current.nativeName} (${current.code})`}
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0 text-teal-400">
          <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M2.5 10h15M10 2.5c2.2 2.1 3.4 4.8 3.4 7.5s-1.2 5.4-3.4 7.5c-2.2-2.1-3.4-4.8-3.4-7.5S7.8 4.6 10 2.5Z" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        {!compact ? <span>{current.nativeName}</span> : null}
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">{current.code}</span>
      </summary>

      <div
        className={`${cbaiGlassCard} absolute right-0 z-50 mt-2 w-72 space-y-3 border-zinc-800 p-3 text-sm`}
        role="group"
        aria-label="Language settings"
      >
        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-zinc-500">Interface language</p>
          {languages.length > 6 ? (
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search languages…"
              aria-label="Search languages"
              className="mb-2 w-full rounded-md border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus-visible:border-teal-500/40"
            />
          ) : null}
          <ul className="max-h-56 space-y-0.5 overflow-y-auto">
            {activeLanguages.map((language) => (
              <li key={language.code}>
                <button
                  type="button"
                  onClick={() => selectInterfaceLanguage(language.code)}
                  aria-pressed={language.code === profile.preferredLanguage}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                    language.code === profile.preferredLanguage
                      ? "bg-teal-500/10 text-teal-300"
                      : "text-zinc-300 hover:bg-zinc-900"
                  }`}
                >
                  <span>
                    {language.nativeName} <span className="text-zinc-500">· {language.name}</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-600">{language.code}</span>
                </button>
              </li>
            ))}
            {activeLanguages.length === 0 ? <li className="px-2 py-1.5 text-xs text-zinc-600">{t("common.noResults")}</li> : null}
          </ul>

          {preparedLanguages.length > 0 ? (
            <>
              <p className="mb-1 mt-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                Prepared, not active yet
              </p>
              <ul className="max-h-32 space-y-0.5 overflow-y-auto">
                {preparedLanguages.map((language) => (
                  <li key={language.code}>
                    <span
                      className="flex w-full cursor-not-allowed items-center justify-between rounded-md px-2 py-1.5 text-left text-xs text-zinc-600"
                      title="Translation and voice support not verified yet"
                    >
                      <span>
                        {language.nativeName} <span className="text-zinc-700">· {language.name}</span>
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-700">{language.code}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        <div className="border-t border-zinc-800/80 pt-2.5">
          <label htmlFor="voice-language-select" className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-zinc-500">
            Voice-recognition language
          </label>
          <select
            id="voice-language-select"
            value={profile.speechLanguage}
            onChange={(event) => updateProfile({ speechLanguage: event.target.value })}
            className="w-full rounded-md border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus-visible:border-teal-500/40"
          >
            {languages
              .filter((language) => language.voiceLocale)
              .map((language) => (
                <option key={language.code} value={language.voiceLocale ?? "en-US"}>
                  {language.nativeName} ({language.voiceLocale}
                  {language.voiceSupport !== "full" ? " — support varies" : ""})
                </option>
              ))}
          </select>
        </div>

        <p className="border-t border-zinc-800/80 pt-2.5 text-[10px] leading-relaxed text-zinc-600">
          Original-language source titles are always kept as published — a translated summary is shown
          separately, never replacing the source.
        </p>
      </div>
    </details>
  );
}
