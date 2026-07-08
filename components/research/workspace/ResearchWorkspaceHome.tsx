"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getResearchTopicById } from "@/lib/research/research-topics";
import { getDefaultWorkspaceTopic } from "@/lib/research/workspace/workspace-explorer";
import WorkspaceExplorer from "@/components/research/workspace/WorkspaceExplorer";

function ResearchWorkspaceHomeContent() {
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic");
  const requestedTopic = topicParam ? getResearchTopicById(topicParam) : undefined;
  const showTopicNotFoundNotice = Boolean(topicParam && !requestedTopic);
  const initialTopicId = requestedTopic?.topicId ?? getDefaultWorkspaceTopic().topicId;

  return (
    <WorkspaceExplorer
      initialTopicId={initialTopicId}
      showTopicNotFoundNotice={showTopicNotFoundNotice}
      deepLinkTopicId={requestedTopic?.topicId}
    />
  );
}

export default function ResearchWorkspaceHome() {
  return (
    <Suspense fallback={null}>
      <ResearchWorkspaceHomeContent />
    </Suspense>
  );
}
