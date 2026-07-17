"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useUniversalWorkspace } from "@/components/platform/context/UniversalWorkspaceProvider";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import {
  resolveKnowledgeExplanation,
  resolveMissionKnowledgeExplanation,
} from "@/lib/intelligence-os/knowledge-brain";
import type { KnowledgePrimaryBucket } from "@/lib/intelligence-os/knowledge-brain.types";
import type { UniversalObjectRef } from "@/lib/intelligence-os/universal-object";
import {
  cbaiLinkAction,
  cbaiMineralPanelMd,
  cbaiSectionEyebrow,
  cbaiStatCell,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

const BUCKET_KEYS: Record<KnowledgePrimaryBucket, string> = {
  known: "known",
  unknown: "unknown",
  conflict: "conflict",
  needs_review: "needsReview",
};

type KnowledgeBrainPanelProps = {
  objectRef?: UniversalObjectRef | null;
  className?: string;
  compact?: boolean;
};

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value?.trim()) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="text-xs leading-relaxed text-zinc-400">{value}</p>
    </div>
  );
}

function BucketList({ label, items }: { label: string; items: readonly string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</p>
      <ul className="space-y-0.5">
        {items.slice(0, compactLimit(items)).map((item) => (
          <li key={item} className="text-xs text-zinc-400">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function compactLimit(items: readonly string[]): number {
  return items.length > 5 ? 5 : items.length;
}

/** Knowledge Brain — progressive explainability without a giant panel. */
export default function KnowledgeBrainPanel({
  objectRef = null,
  className = "",
  compact = false,
}: KnowledgeBrainPanelProps) {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { mission } = useMissionContext();
  const { focusedObject } = useUniversalWorkspace();
  const disclosure = useProgressiveDisclosure();

  const ref = objectRef ?? focusedObject;

  const explanation = useMemo(() => {
    if (!hydrated) return null;
    if (ref) return resolveKnowledgeExplanation(ref, mission);
    return resolveMissionKnowledgeExplanation(mission);
  }, [hydrated, ref, mission]);

  if (!hydrated || !explanation) return null;

  if (!mission && !ref) {
    return (
      <section className={`${cbaiMineralPanelMd} ${className}`} role="status">
        <p className={cbaiTextMuted}>{t("knowledgeBrain.noMission")}</p>
      </section>
    );
  }

  const buckets = (["known", "unknown", "conflict", "needs_review"] as const).filter(
    (key) => explanation.primary[key].length > 0,
  );

  return (
    <section
      className={`${cbaiMineralPanelMd} space-y-3 ${className}`}
      aria-labelledby="knowledge-brain-heading"
    >
      <p className={cbaiSectionEyebrow} id="knowledge-brain-heading">
        {t("knowledgeBrain.eyebrow")}
      </p>

      <DetailRow label={t("knowledgeBrain.whatIsThis")} value={explanation.whatIsThis} />
      <DetailRow label={t("knowledgeBrain.whyItMatters")} value={explanation.whyItMatters} />
      {explanation.missionRelevance ? (
        <DetailRow label={t("knowledgeBrain.missionRelevance")} value={explanation.missionRelevance} />
      ) : null}

      {buckets.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {buckets.map((bucket) => (
            <div key={bucket} className={cbaiStatCell}>
              <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                {t(`knowledgeBrain.${BUCKET_KEYS[bucket]}`)}
              </p>
              <p className="text-lg font-medium text-zinc-200">{explanation.primary[bucket].length}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className={cbaiTextMuted}>{t("knowledgeBrain.emptyBucket")}</p>
      )}

      {!compact && disclosure.showEvidenceAdvanced ? (
        <>
          <DetailRow label={t("knowledgeBrain.howWeKnow")} value={explanation.howWeKnow} />
          <DetailRow label={t("knowledgeBrain.provenance")} value={explanation.provenance} />
          <DetailRow label={t("knowledgeBrain.freshness")} value={explanation.freshness} />
          <BucketList
            label={t("knowledgeBrain.supportingEvidence")}
            items={explanation.supportingEvidence}
          />
          <BucketList
            label={t("knowledgeBrain.contradictingEvidence")}
            items={explanation.contradictingEvidence}
          />
          <BucketList label={t("knowledgeBrain.missingEvidence")} items={explanation.missingEvidence} />
          <DetailRow label={t("knowledgeBrain.limitations")} value={explanation.limitations} />
        </>
      ) : null}

      {explanation.humanReviewRequired ? (
        <p className="text-xs text-amber-400/90" role="status">
          {t("knowledgeBrain.humanReviewRequired")}
        </p>
      ) : null}

      {explanation.suggestedAction ? (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">
            {t("knowledgeBrain.suggestedNext")}
          </p>
          <Link href={explanation.suggestedAction.href} className={cbaiLinkAction}>
            {explanation.suggestedAction.label} →
          </Link>
        </div>
      ) : null}

      {explanation.sources.length === 0 && !compact ? (
        <p className="text-[10px] text-zinc-600">{t("knowledgeBrain.sourceNotConnected")}</p>
      ) : null}
    </section>
  );
}
