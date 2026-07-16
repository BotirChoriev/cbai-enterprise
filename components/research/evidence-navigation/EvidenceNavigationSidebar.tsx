"use client";

import type { EvidenceNavigationPath } from "@/lib/research/evidence-navigation/evidence-navigation-model";
import type { EvidenceNavigationNextStep } from "@/lib/research/evidence-navigation/evidence-navigation-query";
import {
  RELATIONSHIP_LABELS,
  STATUS_LABELS,
  OBJECT_KIND_LABELS,
} from "@/components/research/evidence-navigation/EvidenceNavigationNode";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type EvidenceNavigationSidebarProps = {
  path: EvidenceNavigationPath;
  selectedNodeId: string;
  directNextSteps: readonly EvidenceNavigationNextStep[];
  suggestedNextSteps: readonly EvidenceNavigationNextStep[];
  onSelectNode: (nodeId: string) => void;
};

export default function EvidenceNavigationSidebar({
  selectedNodeId,
  directNextSteps,
  suggestedNextSteps,
  onSelectNode,
}: EvidenceNavigationSidebarProps) {
  const steps =
    directNextSteps.length > 0 ? directNextSteps : suggestedNextSteps;
  const isSuggested = directNextSteps.length === 0 && suggestedNextSteps.length > 0;

  return (
    <aside aria-label="Next navigation" className={`${cbaiGlassCard} p-4`}>
      <p className={cbaiSectionEyebrow}>Next navigation</p>
      <p className="mt-1 text-xs text-zinc-500">
        {isSuggested
          ? "Continue along the catalog research path."
          : "Direct catalog connections from the selected node."}
      </p>

      {steps.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {steps.map((step) => (
            <li key={`${selectedNodeId}:${step.node.nodeId}`}>
              <button
                type="button"
                onClick={() => onSelectNode(step.node.nodeId)}
                className="w-full rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2 text-left transition-all duration-[250ms] hover:border-teal-500/30 hover:bg-teal-500/5"
              >
                <span className="block text-[10px] font-medium uppercase tracking-wider text-teal-400/80">
                  {RELATIONSHIP_LABELS[step.edge.relationshipType]}
                </span>
                <span className="mt-1 block text-sm font-medium text-zinc-200">
                  {step.node.label}
                </span>
                <span className="mt-0.5 block text-[10px] text-zinc-500">
                  {OBJECT_KIND_LABELS[step.node.objectKind]} · {STATUS_LABELS[step.node.status]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-xs text-zinc-500">
          You have reached the end of this catalog navigation path.
        </p>
      )}
    </aside>
  );
}
