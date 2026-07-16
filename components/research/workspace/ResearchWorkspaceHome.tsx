"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getResearchTopicById } from "@/lib/research/research-topics";
import { getDefaultWorkspaceTopic } from "@/lib/research/workspace/workspace-explorer";
import WorkspaceExplorer from "@/components/research/workspace/WorkspaceExplorer";
import RouteChromeFallback from "@/components/system/RouteChromeFallback";

function ResearchWorkspaceHomeContent({ embedded = false }: { embedded?: boolean }) {
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
      embedded={embedded}
    />
  );
}

export default function ResearchWorkspaceHome({ embedded = false }: { embedded?: boolean }) {
  return (
    <Suspense fallback={<RouteChromeFallback messageKey="loadingResearch" />}>
      <ResearchWorkspaceHomeContent embedded={embedded} />
    </Suspense>
  );
}
