"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ResearchTopic } from "@/lib/research/research-topics";
import {
  buildEvidenceNavigationForTopic,
  findNavigationNode,
  listNavigationNextSteps,
} from "@/lib/research/evidence-navigation/evidence-navigation-query";
import type { EvidenceNavigationNextStep } from "@/lib/research/evidence-navigation/evidence-navigation-query";
import EvidenceNavigationPath from "@/components/research/evidence-navigation/EvidenceNavigationPath";
import EvidenceNavigationNode from "@/components/research/evidence-navigation/EvidenceNavigationNode";
import EvidenceNavigationSidebar from "@/components/research/evidence-navigation/EvidenceNavigationSidebar";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const FLOW_SECTION_ORDER = [
  "research_topic",
  "method",
  "evidence_type",
  "publication",
  "experiment",
  "dataset",
  "laboratory",
  "researcher",
  "open_question",
  "negative_result",
  "workspace",
] as const;

const HONEST_NOTICE =
  "This navigation path uses catalog relationships only. Live evidence is not connected yet.";

const HUMAN_REVIEW_NOTICE =
  "Human review is required before any catalog navigation supports a research decision.";

const NODE_PARAM = "node";

type EvidenceNavigationExplorerProps = {
  topic: ResearchTopic;
};

function sectionRank(objectKind: string): number {
  const index = FLOW_SECTION_ORDER.indexOf(objectKind as (typeof FLOW_SECTION_ORDER)[number]);
  return index === -1 ? 50 : index;
}

function buildSuggestedNextSteps(
  path: NonNullable<ReturnType<typeof buildEvidenceNavigationForTopic>>,
  selectedNodeId: string,
): readonly EvidenceNavigationNextStep[] {
  const selectedNode = findNavigationNode(path, selectedNodeId);
  if (!selectedNode) {
    return [];
  }

  const sortedNodes = [...path.nodes].sort(
    (left, right) => sectionRank(left.objectKind) - sectionRank(right.objectKind),
  );
  const currentIndex = sortedNodes.findIndex((node) => node.nodeId === selectedNodeId);

  if (currentIndex === -1 || currentIndex >= sortedNodes.length - 1) {
    return [];
  }

  const nextNode = sortedNodes[currentIndex + 1];
  return [
    {
      edge: {
        edgeId: `suggested:${selectedNodeId}:${nextNode.nodeId}`,
        sourceNodeId: selectedNodeId,
        targetNodeId: nextNode.nodeId,
        relationshipType: "future_supports",
        status: nextNode.status,
      },
      node: nextNode,
    },
  ];
}

export default function EvidenceNavigationExplorer({ topic }: EvidenceNavigationExplorerProps) {
  const path = useMemo(
    () => buildEvidenceNavigationForTopic(topic.topicId),
    [topic.topicId],
  );

  const topicNodeId = useMemo(() => {
    return path?.nodes.find((node) => node.objectKind === "research_topic")?.nodeId ?? null;
  }, [path]);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(() => {
    const nodeParam = searchParams.get(NODE_PARAM);
    if (path && nodeParam && findNavigationNode(path, nodeParam)) {
      return nodeParam;
    }
    return topicNodeId;
  });

  const updateNodeParam = useCallback(
    (nodeId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nodeId) {
        params.set(NODE_PARAM, nodeId);
      } else {
        params.delete(NODE_PARAM);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Tracks the topic's root node so a topic switch resets selection without
  // re-running on every URL change caused by updateNodeParam itself.
  const previousTopicNodeIdRef = useRef(topicNodeId);

  useEffect(() => {
    if (previousTopicNodeIdRef.current !== topicNodeId) {
      previousTopicNodeIdRef.current = topicNodeId;
      setSelectedNodeId(topicNodeId);
      updateNodeParam(topicNodeId);
      return;
    }

    if (!path) {
      return;
    }
    const nodeParam = searchParams.get(NODE_PARAM);
    if (!nodeParam || findNavigationNode(path, nodeParam)) {
      return;
    }
    updateNodeParam(null);
  }, [topicNodeId, path, searchParams, updateNodeParam]);

  const handleSelectNode = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      updateNodeParam(nodeId);
    },
    [updateNodeParam],
  );

  if (!path || !selectedNodeId) {
    return null;
  }

  const selectedNode = findNavigationNode(path, selectedNodeId);
  if (!selectedNode) {
    return null;
  }

  const directNextSteps = listNavigationNextSteps(path, selectedNodeId);
  const suggestedNextSteps = buildSuggestedNextSteps(path, selectedNodeId);

  return (
    <section aria-labelledby="evidence-navigation-explorer-heading" className="space-y-4">
      <div className="space-y-2">
        <p className={cbaiSectionEyebrow}>Evidence Navigation</p>
        <h2
          id="evidence-navigation-explorer-heading"
          className="text-xl font-semibold tracking-tight text-zinc-100"
        >
          Follow the research path
        </h2>
        <p className="max-w-3xl text-sm text-zinc-500">
          Visually follow how catalog knowledge connects from the research topic through methods,
          evidence types, gaps, questions, and workspace areas.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(240px,280px)_minmax(0,1fr)_minmax(240px,280px)]">
        <EvidenceNavigationPath
          path={path}
          selectedNodeId={selectedNodeId}
          onSelectNode={handleSelectNode}
        />

        <EvidenceNavigationNode
          node={selectedNode}
          humanReviewRequired={path.humanReviewRequired}
          nextSteps={directNextSteps}
        />

        <EvidenceNavigationSidebar
          path={path}
          selectedNodeId={selectedNodeId}
          directNextSteps={directNextSteps}
          suggestedNextSteps={suggestedNextSteps}
          onSelectNode={handleSelectNode}
        />
      </div>

      <div className={`${cbaiGlassCard} space-y-2 p-4`}>
        <p className="text-xs text-zinc-500">{HONEST_NOTICE}</p>
        <p className="text-[11px] text-zinc-600">{HUMAN_REVIEW_NOTICE}</p>
      </div>
    </section>
  );
}
