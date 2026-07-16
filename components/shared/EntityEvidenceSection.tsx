"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import EntityProfileSection from "@/components/shared/EntityProfileSection";

type EntityEvidenceSectionProps = {
  connectedCount: number;
  sourceConnectedCount: number;
  totalSources: number;
  availableItems?: readonly string[];
};

export default function EntityEvidenceSection({
  connectedCount,
  sourceConnectedCount,
  totalSources,
  availableItems,
}: EntityEvidenceSectionProps) {
  const { t } = useTranslation();
  const showItemList = availableItems !== undefined;
  const plural = totalSources === 1 ? "" : "s";
  const topicPlural = connectedCount === 1 ? "" : "s";

  return (
    <EntityProfileSection
      id="evidence"
      title={t("entityIntelligence.availableInformation")}
      nextStep={{ label: t("entityIntelligence.missingInformation"), href: "#missing-evidence" }}
    >
      {showItemList ? (
        <div className="rounded-lg bg-zinc-900/50 px-4 py-4">
          {availableItems.length > 0 ? (
            <ul className="space-y-1.5 text-sm text-zinc-300">
              {availableItems.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-emerald-500/90" aria-hidden="true">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-400">{t("entityIntelligence.noOfficialInformation")}</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-zinc-900/50 px-4 py-3">
            <p className="text-xs text-zinc-600">{t("entityIntelligence.availableNow")}</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-zinc-100">{connectedCount}</p>
          </div>
          <div className="rounded-lg bg-zinc-900/50 px-4 py-3">
            <p className="text-xs text-zinc-600">{t("entityIntelligence.sourceStatus")}</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-zinc-100">
              {sourceConnectedCount}
              <span className="text-sm font-normal text-zinc-500"> / {totalSources}</span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">{t("entityIntelligence.sourcesConnected")}</p>
          </div>
        </div>
      )}

      <p className="text-sm text-zinc-400">
        {t("entityIntelligence.sourcesConnectedSummary", {
          connected: String(sourceConnectedCount),
          total: String(totalSources),
          plural,
        })}
        {showItemList && connectedCount > 0
          ? t("entityIntelligence.topicsListedAbove", {
              count: String(connectedCount),
              topicPlural,
            })
          : showItemList
            ? ""
            : t("entityIntelligence.topicsAvailableNow", {
                count: String(connectedCount),
                topicPlural,
              })}
        .
      </p>
    </EntityProfileSection>
  );
}
