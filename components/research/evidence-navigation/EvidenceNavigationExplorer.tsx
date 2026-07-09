"use client";

import { useEffect, useMemo, useState } from "react";
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

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(topicNodeId);

  useEffect(() => {
    setSelectedNodeId(topicNodeId);
  }, [topicNodeId]);

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
          onSelectNode={setSelectedNodeId}
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
          onSelectNode={setSelectedNodeId}
        />
      </div>

      <div className={`${cbaiGlassCard} space-y-2 p-4`}>
        <p className="text-xs text-zinc-500">{HONEST_NOTICE}</p>
        <p className="text-[11px] text-zinc-600">{HUMAN_REVIEW_NOTICE}</p>
      </div>
    </section>
  );
}
