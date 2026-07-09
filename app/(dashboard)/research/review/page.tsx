import type { Metadata } from "next";
import Link from "next/link";
import ResearchReviewWorkspace from "@/components/research/review/ResearchReviewWorkspace";
import type { ResearchReview } from "@/lib/research/review/review-model";
import { cbaiHeroGlow } from "@/components/brand/brand-classes";

export const metadata: Metadata = {
  title: "Research Review — Research Intelligence",
  description: "Review a research topic's evidence, decisions, and reviewer status.",
};

const PLACEHOLDER_REVIEW: ResearchReview = {
  reviewId: "review-placeholder-0001",
  createdAt: "2026-01-01T00:00:00.000Z",
  relatedTopicIds: [],
  kind: "methodology_review",
  status: "draft",
  priority: "medium",
  visibility: "team",
  title: "Research Review",
  summary: "This is a static placeholder review. No live review data is connected yet.",
  humanReviewRequired: true,
};

export default function ResearchReviewPage() {
  return (
    <div className={`mx-auto max-w-[1600px] px-3 py-6 sm:px-4 sm:py-8 ${cbaiHeroGlow}`}>
      <Link
        href="/research"
        className="inline-flex text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300"
      >
        ← Back to Research Intelligence
      </Link>

      <div className="mt-6">
        <ResearchReviewWorkspace review={PLACEHOLDER_REVIEW} />
      </div>
    </div>
  );
}
