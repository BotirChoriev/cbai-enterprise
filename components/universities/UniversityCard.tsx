"use client";

import type { University } from "@/lib/universities";
import { getUniversityLinkedEntities } from "@/lib/universities.adapter";
import {
  buildUniversityIntelligenceProfile,
  resolveUniversityListEvidenceLabel,
  universityEvidenceStatusClass,
} from "@/lib/universities.intelligence";
import { buildUniversityNetworkProfile } from "@/lib/university-intelligence";
import UniversityLogoMark from "@/components/universities/UniversityLogoMark";
import { useTranslation } from "@/lib/i18n/use-translation";
import { translateEntityListEvidenceLabel } from "@/lib/i18n/entity-ui-translation";
import { getDictionary } from "@/lib/i18n/translate";
import { getUniversityIntelligenceCopy } from "@/lib/i18n/platform-copy-university-intelligence";
import { countryFlagEmojiForUniversity } from "@/lib/university-intelligence";
import { cbaiFocusRing } from "@/components/brand/brand-classes";

type UniversityCardProps = {
  university: University;
  isSelected: boolean;
  onSelect: () => void;
};

export default function UniversityCard({
  university,
  isSelected,
  onSelect,
}: UniversityCardProps) {
  const { language, t } = useTranslation();
  const dictionary = getDictionary(language);
  const cis = getUniversityIntelligenceCopy(language);
  const network = buildUniversityNetworkProfile(university);
  const flag = countryFlagEmojiForUniversity(network);
  const profile = buildUniversityIntelligenceProfile(
    university,
    getUniversityLinkedEntities(university),
  );
  const evidenceLabel = translateEntityListEvidenceLabel(
    dictionary,
    resolveUniversityListEvidenceLabel(profile),
  );
  const evidenceClass = universityEvidenceStatusClass(
    profile.referenceConnected ? "connected" : "insufficient",
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`${cbaiFocusRing} w-full rounded-xl border p-3 text-left transition-all ${
        isSelected
          ? "border-teal-500/40 bg-teal-500/5 ring-1 ring-teal-500/20"
          : "border-[var(--cbai-border)] bg-[color-mix(in_oklab,var(--cbai-surface)_85%,transparent)] hover:border-teal-500/25"
      }`}
      data-cbai-university-card=""
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <UniversityLogoMark
            abbreviation={university.icon}
            officialName={university.name}
            logo={network.identity.logo}
            size="md"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--cbai-text-primary)]">
              <span lang="en">{university.name}</span>
            </p>
            <p className="text-[10px] text-[var(--cbai-text-muted)]">
              {flag ? <span aria-hidden="true">{flag} </span> : null}
              {university.type} · {university.country}
            </p>
          </div>
        </div>
        {isSelected ? (
          <span className="shrink-0 rounded-md bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:text-teal-300">
            {t("entities.selected")}
          </span>
        ) : null}
      </div>

      <div className="mt-3 space-y-2">
        <p className="text-xs text-[var(--cbai-text-secondary)]">{university.city}</p>
        <span
          className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${evidenceClass}`}
        >
          {evidenceLabel}
        </span>
        <p className="text-[11px] text-[var(--cbai-text-muted)]">{cis.lastVerifiedUnknown}</p>
        <span className="inline-flex min-h-11 items-center text-xs font-medium text-teal-800 dark:text-teal-200">
          {cis.openProfile}
        </span>
      </div>
    </button>
  );
}
