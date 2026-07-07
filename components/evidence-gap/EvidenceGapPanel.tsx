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
  heading = "Missing evidence",
  sectionId = "missing-evidence",
  nextStep,
}: EvidenceGapPanelProps) {
  const nonAvailable = getNonAvailableGaps(profile);
  const compact = !showSummary && !showSources && !showMethodology;

  return (
    <EntityProfileSection id={sectionId} title={heading} nextStep={nextStep}>
      {!compact ? (
        <p className="text-sm text-zinc-500">
          What is missing and why — from official source records only.
        </p>
      ) : null}

      {showSummary && <EvidenceGapSummary profile={profile} />}

      {nonAvailable.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 px-5 py-6 text-center">
          <p className="text-sm text-zinc-400">No missing evidence for applicable indicators.</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
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
