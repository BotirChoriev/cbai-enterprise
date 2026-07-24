"use client";

import type { WorkspaceCoverageItem } from "@/lib/workspaces";
import { workspaceStatusClass } from "@/lib/workspaces";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import { translateWorkspaceStatusLabel } from "@/lib/i18n/investor-translation";

type WorkspaceCoverageGridProps = {
  heading: string;
  description: string;
  items: readonly WorkspaceCoverageItem[];
  headingId: string;
};

export default function WorkspaceCoverageGrid({
  heading,
  description,
  items,
  headingId,
}: WorkspaceCoverageGridProps) {
  const { language } = useTranslation();
  const dictionary = getDictionary(language);
  const shared = dictionary.workspaceShared;

  return (
    <section className="space-y-4" aria-labelledby={headingId}>
      <div>
        <h2
          id={headingId}
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          {heading}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-zinc-100">{item.title}</h3>
              <span
                className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${workspaceStatusClass(item.statusLabel)}`}
              >
                {translateWorkspaceStatusLabel(dictionary, item.statusLabel)}
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-500">{item.description}</p>
            <p className="mt-3 text-xs text-zinc-600">
              {shared.topicsWithEvidence
                .replace("{connected}", String(item.connectedCount))
                .replace("{total}", String(item.indicatorCount))
                .replace(
                  "{topicPlural}",
                  language === "en" && item.indicatorCount !== 1 ? "s" : "",
                )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
