import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResearchTopicDetail from "@/components/research/topic/ResearchTopicDetail";
import ResearchIntelligenceOverview from "@/components/research/topic/ResearchIntelligenceOverview";
import { getResearchTopicById, RESEARCH_TOPICS } from "@/lib/research";
import { cbaiHeroGlow } from "@/components/brand/brand-classes";

export function generateStaticParams() {
  return RESEARCH_TOPICS.map((topic) => ({ topicId: topic.topicId }));
}

type ResearchTopicPageProps = {
  params: Promise<{ topicId: string }>;
};

// Real, verified gap (baseline audit): this Server Component always had generateMetadata
// available and never used it, so all 64 real research topic pages silently inherited the root
// layout's generic default title instead of their own real name — confirmed live via a full
// route sweep before fixing, not assumed from source alone.
export async function generateMetadata({ params }: ResearchTopicPageProps): Promise<Metadata> {
  const { topicId } = await params;
  const topic = getResearchTopicById(topicId);
  if (!topic) return {};
  return {
    title: topic.topicName,
    description: topic.description,
  };
}

export default async function ResearchTopicPage({ params }: ResearchTopicPageProps) {
  const { topicId } = await params;
  const topic = getResearchTopicById(topicId);

  if (!topic) {
    notFound();
  }

  return (
    <>
      <ResearchTopicDetail topic={topic} />
      <div className={`mx-auto max-w-6xl px-4 pb-10 sm:px-6 ${cbaiHeroGlow}`}>
        <ResearchIntelligenceOverview topicId={topic.topicId} />
      </div>
    </>
  );
}
