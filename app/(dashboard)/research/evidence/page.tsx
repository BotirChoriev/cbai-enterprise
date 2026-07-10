import type { Metadata } from "next";
import Link from "next/link";
import ResearchEvidenceExplorer from "@/components/research/evidence/ResearchEvidenceExplorer";
import ResearchEvidenceWorkspace from "@/components/research/evidence/ResearchEvidenceWorkspace";
import type { ResearchEvidence } from "@/lib/research/evidence/evidence-model";
import { cbaiHeroGlow } from "@/components/brand/brand-classes";

export const metadata: Metadata = {
  title: "Research Evidence — Research Intelligence",
  description: "Review a piece of research evidence, its source, status, and strength.",
};

const PLACEHOLDER_EVIDENCE: ResearchEvidence = {
  id: "evidence-placeholder-0001",
  researchTopicId: "topic-placeholder-0001",
  title: "Research Evidence",
  summary:
    "This is a static placeholder evidence record. No live evidence data is connected yet.",
  sourceType: "publication",
  sourceId: "source-placeholder-0001",
  status: "draft",
  strength: "weak",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export default function ResearchEvidencePage() {
  return (
    <div className={`mx-auto max-w-[1600px] px-3 py-6 sm:px-4 sm:py-8 ${cbaiHeroGlow}`}>
      <Link
        href="/research"
        className="inline-flex text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300"
      >
        ← Back to Research Intelligence
      </Link>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ResearchEvidenceExplorer evidence={[PLACEHOLDER_EVIDENCE]} />
        <ResearchEvidenceWorkspace evidence={PLACEHOLDER_EVIDENCE} />
      </div>
    </div>
  );
}
