import StatusBadge from "@/components/platform/home/StatusBadge";
import { Card, CardContent } from "@/components/ui/Card";
import { PLATFORM_LANGUAGES } from "@/lib/platform-home";
import type { PlatformRoadmapPhase } from "@/lib/platform-home";

const roadmapStatusStyles: Record<
  PlatformRoadmapPhase["status"],
  "available" | "in_progress" | "evidence_not_connected"
> = {
  complete: "available",
  in_progress: "in_progress",
  planned: "evidence_not_connected",
};

type HomeLanguagesProps = {
  languages?: typeof PLATFORM_LANGUAGES;
};

export function HomeLanguages({
  languages = PLATFORM_LANGUAGES,
}: HomeLanguagesProps) {
  const active = languages.find((language) => language.available);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label htmlFor="language-select" className="flex-1 space-y-1">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Language
          </span>
          <select
            id="language-select"
            defaultValue={active?.code ?? "en"}
            disabled
            aria-describedby="language-select-note"
            className="mt-1 w-full max-w-xs rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-300 opacity-90"
          >
            {languages.map((language) => (
              <option key={language.code} value={language.code}>
                {language.nativeLabel}
                {language.available ? "" : " — unavailable"}
              </option>
            ))}
          </select>
        </label>
        <StatusBadge status="in_progress" />
      </div>
      <p id="language-select-note" className="text-sm text-zinc-500">
        English is the only available language today. Additional locales are
        planned; selector architecture is in place for future i18n routing.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {languages.map((language) => (
          <li
            key={language.code}
            className="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-2 text-sm"
          >
            <span className="text-zinc-300">
              {language.label}{" "}
              <span className="text-zinc-500">({language.nativeLabel})</span>
            </span>
            <span className="text-xs text-zinc-500">
              {language.available ? "Available" : "Planned"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type HomeRoadmapProps = {
  phases: PlatformRoadmapPhase[];
};

export function HomeRoadmap({ phases }: HomeRoadmapProps) {
  return (
    <ol className="space-y-3">
      {phases.map((phase, index) => (
        <li key={phase.id}>
          <Card>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                  Phase {index}
                </p>
                <h3 className="text-sm font-semibold text-zinc-100">
                  {phase.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500">
                  {phase.scope}
                </p>
              </div>
              <StatusBadge status={roadmapStatusStyles[phase.status]} />
            </CardContent>
          </Card>
        </li>
      ))}
    </ol>
  );
}
