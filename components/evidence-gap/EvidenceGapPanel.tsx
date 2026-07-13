import type { EntityEvidenceGapProfile } from "@/lib/evidence-gap";
import { getNonAvailableGaps } from "@/lib/evidence-gap";
import EvidenceGapSummary from "@/components/evidence-gap/EvidenceGapSummary";
import EvidenceGapCard from "@/components/evidence-gap/EvidenceGapCard";
import EvidenceGapSources from "@/components/evidence-gap/EvidenceGapSources";
import EvidenceGapMethodology from "@/components/evidence-gap/EvidenceGapMethodology";
import EntityProfileSection from "@/components/shared/EntityProfileSection";

// Real profiles can carry dozens of missing-indicator records — showing every one at once turns a
// single section into a wall of near-identical cards (verified via a real, full-length country
// profile scroll). The first handful stays visible; the rest sits behind one real disclosure,
// never dropped or summarized away.
const VISIBLE_GAP_COUNT = 5;

type EvidenceGapPanelProps = {
  profile: EntityEvidenceGapProfile;
  showSummary?: boolean;
  showSources?: boolean;
  showMethodology?: boolean;
  heading?: string;
  sectionId?: string;
  nextStep?: { label: string; href: string };
};

export default function EvidenceGapPanel({
  profile,
  showSummary = true,
  showSources = true,
  showMethodology = true,
  heading = "Missing information",
  sectionId = "missing-evidence",
  nextStep = { label: "Reports →", href: "#reports" },
}: EvidenceGapPanelProps) {
  const nonAvailable = getNonAvailableGaps(profile);
  const compact = !showSummary && !showSources && !showMethodology;

  return (
    <EntityProfileSection id={sectionId} title={heading} nextStep={nextStep}>
      {!compact ? (
        <p className="text-sm text-zinc-500">What is missing and why.</p>
      ) : (
        <p className="text-sm text-zinc-500">
          What is missing, why, and which source applies.
        </p>
      )}

      {showSummary && <EvidenceGapSummary profile={profile} />}

      {nonAvailable.length === 0 ? (
        <p className="rounded-lg bg-zinc-900/50 px-4 py-4 text-sm text-zinc-400">
          No missing information is recorded for this profile.
        </p>
      ) : (
        <>
          <ul className="space-y-2">
            {nonAvailable.slice(0, VISIBLE_GAP_COUNT).map((gap) => (
              <li key={gap.gapId}>
                <EvidenceGapCard gap={gap} />
              </li>
            ))}
          </ul>
          {nonAvailable.length > VISIBLE_GAP_COUNT ? (
            <details className="rounded-lg border border-zinc-800/60 bg-zinc-950/50">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-zinc-500 marker:content-none [&::-webkit-details-marker]:hidden">
                Show all {nonAvailable.length} missing items
              </summary>
              <ul className="space-y-2 border-t border-zinc-800 px-4 py-4">
                {nonAvailable.slice(VISIBLE_GAP_COUNT).map((gap) => (
                  <li key={gap.gapId}>
                    <EvidenceGapCard gap={gap} />
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </>
      )}

      {showSources && <EvidenceGapSources profile={profile} />}
      {showMethodology && <EvidenceGapMethodology profile={profile} />}
    </EntityProfileSection>
  );
}
