"use client";

import type { EvidenceNavigationPath } from "@/lib/research/evidence-navigation/evidence-navigation-model";
import { listNavigationNextSteps } from "@/lib/research/evidence-navigation/evidence-navigation-query";
import type { EvidenceNavigationRelationshipType } from "@/lib/research/evidence-navigation/evidence-navigation-types";
import {
  OBJECT_KIND_LABELS,
  STATUS_LABELS,
} from "@/components/research/evidence-navigation/EvidenceNavigationNode";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type EvidenceNavigationPathProps = {
  path: EvidenceNavigationPath;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
};

type PathSection = {
  sectionId: string;
  title: string;
  relationshipType?: EvidenceNavigationRelationshipType;
};

const PATH_SECTIONS: readonly PathSection[] = [
  { sectionId: "topic", title: "Research Topic" },
  { sectionId: "methods", title: "Methods", relationshipType: "uses_method" },
  {
    sectionId: "evidence",
    title: "Evidence Types",
    relationshipType: "requires_evidence",
  },
  { sectionId: "gaps", title: "Knowledge Gaps", relationshipType: "connects_to_gap" },
  {
    sectionId: "questions",
    title: "Open Questions",
    relationshipType: "connects_to_question",
  },
  {
    sectionId: "negative-results",
    title: "Negative Results",
    relationshipType: "connects_to_negative_result",
  },
  {
    sectionId: "workspace",
    title: "Research Workspace",
    relationshipType: "opens_workspace",
  },
];

function buildPathSections(path: EvidenceNavigationPath) {
  const topicNode = path.nodes.find((node) => node.objectKind === "research_topic");
  if (!topicNode) {
    return [];
  }

  const topicSteps = listNavigationNextSteps(path, topicNode.nodeId);
  const stepsGrouped = new Map<
    EvidenceNavigationRelationshipType,
    Array<(typeof topicSteps)[number]>
  >();

  for (const step of topicSteps) {
    const group = stepsGrouped.get(step.edge.relationshipType) ?? [];
    group.push(step);
    stepsGrouped.set(step.edge.relationshipType, group);
  }

  return PATH_SECTIONS.map((section) => {
    if (section.sectionId === "topic") {
      return {
        ...section,
        nodes: [topicNode],
      };
    }

    const nodes =
      section.relationshipType !== undefined
        ? (stepsGrouped.get(section.relationshipType) ?? []).map((step) => step.node)
        : [];

    return {
      ...section,
      nodes,
    };
  });
}

export default function EvidenceNavigationPath({
  path,
  selectedNodeId,
  onSelectNode,
}: EvidenceNavigationPathProps) {
  const sections = buildPathSections(path);

  return (
    <nav aria-label="Evidence navigation path" className={`${cbaiGlassCard} p-4`}>
      <p className={cbaiSectionEyebrow}>Navigation path</p>
      <ol className="mt-4 space-y-4">
        {sections.map((section, sectionIndex) => (
          <li key={section.sectionId} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-[10px] font-semibold text-cyan-300">
                {sectionIndex + 1}
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {section.title}
              </p>
            </div>

            {section.nodes.length > 0 ? (
              <ul className="ml-7 space-y-1.5 border-l border-zinc-800/80 pl-3">
                {section.nodes.map((node) => {
                  const selected = node.nodeId === selectedNodeId;
                  return (
                    <li key={node.nodeId}>
                      <button
                        type="button"
                        onClick={() => onSelectNode(node.nodeId)}
                        className={`w-full rounded-lg border px-3 py-2 text-left transition-all duration-[250ms] ${
                          selected
                            ? "border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_16px_-6px_rgba(34,211,238,0.35)]"
                            : "border-zinc-800/80 bg-slate-950/40 hover:border-cyan-500/20 hover:bg-cyan-500/5"
                        }`}
                      >
                        <span className="block text-sm font-medium text-zinc-200">{node.label}</span>
                        <span className="mt-0.5 block text-[10px] text-zinc-500">
                          {OBJECT_KIND_LABELS[node.objectKind]} · {STATUS_LABELS[node.status]}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="ml-7 text-[11px] text-zinc-600">No catalog nodes in this section.</p>
            )}

            {sectionIndex < sections.length - 1 ? (
              <div className="ml-2 flex justify-center py-1 text-zinc-700" aria-hidden="true">
                ↓
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
