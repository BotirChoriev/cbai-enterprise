import type { EntityEvidenceGapProfile } from "@/lib/evidence-gap";
import { getNonAvailableGaps } from "@/lib/evidence-gap";
import EvidenceGapSummary from "@/components/evidence-gap/EvidenceGapSummary";
import EvidenceGapCard from "@/components/evidence-gap/EvidenceGapCard";
import EvidenceGapSources from "@/components/evidence-gap/EvidenceGapSources";
import EvidenceGapMethodology from "@/components/evidence-gap/EvidenceGapMethodology";
import EntityProfileSection from "@/components/shared/EntityProfileSection";

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
        <ul className="space-y-2">
          {nonAvailable.map((gap) => (
            <li key={gap.gapId}>
              <EvidenceGapCard gap={gap} />
            </li>
          ))}
        </ul>
      )}

      {showSources && <EvidenceGapSources profile={profile} />}
      {showMethodology && <EvidenceGapMethodology profile={profile} />}
    </EntityProfileSection>
  );
}
