"use client";

import Link from "next/link";
import type { SearchResultEntry } from "@/lib/search-intelligence-entry";
import { isUnavailableRoute } from "@/lib/search-intelligence-entry";
import StatusBadge from "@/components/shared/StatusBadge";
import SaveToWorkspaceButton from "@/components/shared/SaveToWorkspaceButton";
import VoiceSummaryButton from "@/components/shared/VoiceSummaryButton";
import type { ProductStatus } from "@/lib/product-status";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { cbaiLinkMuted, cbaiProminentAction } from "@/components/brand/brand-classes";

const cardShell = "rounded-lg bg-zinc-900/50 px-4 py-3 transition-colors hover:bg-zinc-900/80";
const cardStatic = "rounded-lg bg-zinc-950/50 px-4 py-3";

const EVIDENCE_STATUS_TO_PRODUCT_STATUS: Record<SearchResultEntry["evidenceStatus"], ProductStatus> = {
  "Available now": "live",
  "Evidence connected": "partial",
  "Evidence unavailable": "not_connected",
};

type SearchResultCardProps = {
  entry: SearchResultEntry;
};

export default function SearchResultCard({ entry }: SearchResultCardProps) {
  const { t } = useTranslation();
  const disclosure = useProgressiveDisclosure();
  const disabled = !entry.linked || isUnavailableRoute(entry.route);
  const showSecondary = disclosure.level === "expert" && !disabled;
  const voiceSummaryText = [entry.name, entry.type, entry.shortDescription, entry.coverageLabel]
    .filter((part): part is string => Boolean(part))
    .join(". ");

  if (disabled) {
    return (
      <div className={cardStatic}>
        <p className="text-sm font-semibold text-zinc-100">{entry.name}</p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {entry.type}
          {entry.countryLabel ? ` · ${entry.countryLabel}` : ""}
        </p>
        <p className="mt-1 text-xs text-zinc-400">{entry.shortDescription}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={EVIDENCE_STATUS_TO_PRODUCT_STATUS[entry.evidenceStatus]} />
        </div>
      </div>
    );
  }

  return (
    <div className={cardShell}>
      <p className="text-sm font-semibold text-zinc-100">{entry.name}</p>
      <p className="mt-0.5 text-xs text-zinc-500">
        {entry.type}
        {entry.countryLabel ? ` · ${entry.countryLabel}` : ""}
      </p>
      <p className="mt-1 text-xs text-zinc-400">{entry.shortDescription}</p>
      {entry.coverageLabel ? <p className="mt-1 text-[11px] text-zinc-600">{entry.coverageLabel}</p> : null}

      <div className="mt-3">
        <Link href={entry.href} className={`${cbaiProminentAction} gap-1.5`}>
          {t("search.openProfile")}
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {showSecondary ? (
        <details className="mt-2">
          <summary className={cbaiLinkMuted}>{t("zeroLearningCurve.advancedDetails")}</summary>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {entry.entityRef ? <SaveToWorkspaceButton entity={entry.entityRef} className="!px-2.5 !py-1 !text-[11px]" /> : null}
            {entry.createProjectHref ? (
              <Link href={entry.createProjectHref} className={cbaiLinkMuted}>
                {t("search.createProjectArrow")}
              </Link>
            ) : null}
            <VoiceSummaryButton text={voiceSummaryText} className="!px-2.5 !py-1 !text-[11px]" />
          </div>
        </details>
      ) : null}
    </div>
  );
}
