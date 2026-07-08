import { notFound } from "next/navigation";
import ResearchTopicDetail from "@/components/research/topic/ResearchTopicDetail";
import { getResearchTopicById, RESEARCH_TOPICS } from "@/lib/research";

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

  return <ResearchTopicDetail topic={topic} />;
}
