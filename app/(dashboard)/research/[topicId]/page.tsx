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
