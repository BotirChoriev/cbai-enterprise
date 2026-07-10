import type {
  ResearchTopicStatus,
  ResearchVisibility,
} from "@/lib/research/topic/topic-types";

export interface ResearchTopic {
  id: string;
  title: string;
  slug: string;
  abstract: string;
  researchField: string;
  keywords: readonly string[];
  status: ResearchTopicStatus;
  visibility: ResearchVisibility;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
