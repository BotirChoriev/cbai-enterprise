import type { Metadata } from "next";
import EvidenceExplorer from "@/components/evidence/EvidenceExplorer";
import DecisionJourneyHero from "@/components/experience/DecisionJourneyHero";

export const metadata: Metadata = {
  title: "Evidence and Scientific Deliberation",
  description: "Structured scientific claims, evidence, methods, counter-evidence, and human decisions.",
};

/** Canonical Evidence route — same surface as legacy `/knowledge`. */
export default function EvidencePage() {
  return (
    <div className="mx-auto max-w-[100rem] space-y-6">
      <DecisionJourneyHero variant="evidence" />
      <EvidenceExplorer />
    </div>
  );
}
