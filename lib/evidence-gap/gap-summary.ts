import {
  GAP_RECORD_VERSION,
  type EntityEvidenceGapProfile,
  type EvidenceGapSummary,
  type EvidenceGapSummarySection,
} from "@/lib/evidence-gap/gap-types";

function buildAvailableSection(profile: EntityEvidenceGapProfile): EvidenceGapSummarySection {
  const available = profile.gaps.filter((g) => g.currentStatus === "available");

  const content =
    available.length === 0
      ? ["No indicator evidence is currently connected for this entity."]
      : available.map(
          (gap) =>
            `${gap.indicatorTitle} (${gap.indicatorId}) — available via ${gap.expectedSource}.`,
        );

  return {
    id: "evidence-available",
    heading: "Evidence Available",
    content,
  };
}

function buildMissingSection(profile: EntityEvidenceGapProfile): EvidenceGapSummarySection {
  const nonAvailable = profile.gaps.filter((g) => g.currentStatus !== "available");

  const content =
    nonAvailable.length === 0
      ? ["All applicable indicators have connected evidence."]
      : nonAvailable.map(
          (gap) =>
            `${gap.indicatorTitle}: ${gap.missingReason ?? "Evidence not connected"} — ${gap.verificationBlocker ?? "Official source not yet connected"}.`,
        );

  return {
    id: "evidence-missing",
    heading: "Evidence Missing",
    content,
  };
}

function buildCategoriesSection(profile: EntityEvidenceGapProfile): EvidenceGapSummarySection {
  const byReason = new Map<string, number>();

  for (const gap of profile.gaps) {
    if (gap.currentStatus === "available") continue;
    const reason = gap.missingReason ?? "Evidence source not connected";
    byReason.set(reason, (byReason.get(reason) ?? 0) + 1);
  }

  const content =
    byReason.size === 0
      ? ["No gap categories — all indicators connected."]
      : [...byReason.entries()].map(([reason, count]) => `${reason}: ${count} indicator(s).`);

  return {
    id: "gap-categories",
    heading: "Gap Categories",
    content: [
      `${profile.availableCount} available, ${profile.plannedCount} planned, ${profile.missingCount} missing, ${profile.blockedCount} blocked — of ${profile.totalIndicators} total.`,
      ...content,
    ],
  };
}

function buildSourcesSection(profile: EntityEvidenceGapProfile): EvidenceGapSummarySection {
  const sourceNames = new Set(
    profile.gaps.map((gap) => gap.expectedSource).filter((s) => s !== "Official source not yet connected"),
  );

  const content =
    sourceNames.size === 0
      ? ["No official sources mapped to applicable indicators."]
      : [...sourceNames].map((name) => `Expected official source: ${name}.`);

  return {
    id: "official-sources",
    heading: "Official Sources",
    content,
  };
}

function buildMethodologySection(profile: EntityEvidenceGapProfile): EvidenceGapSummarySection {
  const pending = profile.gaps.filter(
    (g) => g.missingReason === "Methodology pending" || g.currentStatus !== "available",
  );

  const content =
    pending.length === 0
      ? ["All applicable indicators have methodology references resolved."]
      : pending.slice(0, 8).map(
          (gap) => `${gap.indicatorTitle}: ${gap.requiredMethodology}`,
        );

  return {
    id: "methodology",
    heading: "Methodology",
    content,
  };
}

function buildLimitationsSection(profile: EntityEvidenceGapProfile): EvidenceGapSummarySection {
  return {
    id: "limitations",
    heading: "Limitations",
    content: [...profile.limitations],
  };
}

function buildHumanReviewSection(): EvidenceGapSummarySection {
  return {
    id: "human-review",
    heading: "Human Review Required",
    content: [
      "Human oversight is mandatory before using gap information in any decision context.",
      "Gap explorer shows connection and verification posture only — not analytics, predictions, or recommendations.",
      "Reviewers must verify source applicability and methodology independently.",
    ],
  };
}

/** Build factual evidence gap summary — counts only, no fake percentages. */
export function buildEvidenceGapSummary(profile: EntityEvidenceGapProfile): EvidenceGapSummary {
  return {
    entityId: profile.entityId,
    entityLabel: profile.entityLabel,
    sections: [
      buildAvailableSection(profile),
      buildMissingSection(profile),
      buildCategoriesSection(profile),
      buildSourcesSection(profile),
      buildMethodologySection(profile),
      buildLimitationsSection(profile),
      buildHumanReviewSection(),
    ],
    limitations: profile.limitations,
    humanReviewRequired: true,
    version: GAP_RECORD_VERSION,
  };
}

export function flattenEvidenceGapSummary(summary: EvidenceGapSummary): string {
  return summary.sections.flatMap((section) => section.content).join("\n");
}
