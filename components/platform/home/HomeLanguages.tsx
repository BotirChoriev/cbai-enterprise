import StatusBadge from "@/components/platform/home/StatusBadge";
import { PLATFORM_LANGUAGES } from "@/lib/platform-home";

export function HomeLanguages() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <label htmlFor="language-select" className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Platform language
          </label>
          <select
            id="language-select"
            defaultValue="en"
            disabled
            aria-describedby="language-select-note"
            className="w-full max-w-xs rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            {PLATFORM_LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.nativeLabel}
                {language.available ? "" : " — Planned"}
              </option>
            ))}
          </select>
        </div>
        <StatusBadge status="in_progress" />
      </div>
      <p id="language-select-note" className="text-sm text-zinc-500">
        English is available today. Locale keys are prepared for additional languages.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORM_LANGUAGES.map((language) => (
          <li
            key={language.code}
            className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3 text-sm"
          >
            <span className="text-zinc-300">
              {language.label}{" "}
              <span className="text-zinc-500">({language.nativeLabel})</span>
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              {language.available ? "Available" : "Planned"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
