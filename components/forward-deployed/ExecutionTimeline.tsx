"use client";

import { cbaiMineralPanel, cbaiSectionEyebrow, cbaiTextMuted } from "@/components/brand/brand-classes";
import type { EngineRunRecord } from "@/lib/forward-deployed-engines/engine-types";
import { useTranslation } from "@/lib/i18n/use-translation";
import EngineStatusBadge from "./EngineStatusBadge";

type Props = {
  run: EngineRunRecord;
};

export default function ExecutionTimeline({ run }: Props) {
  const { t } = useTranslation();

  return (
    <section className={cbaiMineralPanel} aria-labelledby="engine-timeline">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className={cbaiSectionEyebrow} id="engine-timeline">
          {t("forwardDeployed.executionState")}
        </h2>
        <EngineStatusBadge state={run.state} />
      </div>
      <ol className="space-y-2 border-l border-zinc-800 pl-3">
        {run.auditTrail.map((entry) => (
          <li key={entry.id} className={cbaiTextMuted}>
            <time dateTime={entry.timestamp}>{entry.timestamp.slice(11, 19)}</time> — {entry.message}
          </li>
        ))}
      </ol>
    </section>
  );
}
