import type { EvidenceNavigationNode as NavigationNodeModel } from "@/lib/research/evidence-navigation/evidence-navigation-model";
import type {
  EvidenceNavigationObjectKind,
  EvidenceNavigationRelationshipType,
  EvidenceNavigationStatus,
} from "@/lib/research/evidence-navigation/evidence-navigation-types";
import type { EvidenceNavigationNextStep } from "@/lib/research/evidence-navigation/evidence-navigation-query";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const STATUS_LABELS: Record<EvidenceNavigationStatus, string> = {
  available_catalog: "Catalog Available",
  not_connected_yet: "Not Connected Yet",
  future_workspace: "Future Workspace",
  human_review_required: "Human Review Required",
};

const OBJECT_KIND_LABELS: Record<EvidenceNavigationObjectKind, string> = {
  research_topic: "Research Topic",
  method: "Method",
  evidence_type: "Evidence Type",
  publication: "Publication",
  experiment: "Experiment",
  dataset: "Dataset",
  laboratory: "Laboratory",
  researcher: "Researcher",
  open_question: "Open Question",
  negative_result: "Negative Result",
  patent: "Patent",
  workspace: "Research Workspace",
};

const RELATIONSHIP_LABELS: Record<EvidenceNavigationRelationshipType, string> = {
  starts_from: "Starts from",
  uses_method: "Uses method",
  requires_evidence: "Requires evidence",
  connects_to_gap: "Connects to gap",
  connects_to_question: "Connects to question",
  connects_to_negative_result: "Connects to negative result",
  future_supports: "Future supports",
  opens_workspace: "Opens workspace",
};

type EvidenceNavigationNodeProps = {
  node: NavigationNodeModel;
  humanReviewRequired: boolean;
  nextSteps: readonly EvidenceNavigationNextStep[];
};

function statusAccent(status: EvidenceNavigationStatus): string {
  switch (status) {
    case "available_catalog":
      return "border-emerald-500/25 bg-emerald-500/5 text-emerald-300";
    case "not_connected_yet":
      return "border-zinc-700 bg-zinc-900/40 text-zinc-400";
    case "future_workspace":
      return "border-teal-500/25 bg-teal-500/5 text-teal-300";
    case "human_review_required":
      return "border-amber-500/25 bg-amber-500/5 text-amber-300";
  }
}

export default function EvidenceNavigationNode({
  node,
  humanReviewRequired,
  nextSteps,
}: EvidenceNavigationNodeProps) {
  const requiresHumanReview =
    humanReviewRequired || node.status === "human_review_required";

  return (
    <article className={`${cbaiGlassCard} space-y-4 border-teal-500/15 p-5`}>
      <div className="space-y-2">
        <p className={cbaiSectionEyebrow}>Selected node</p>
        <h3 className="text-xl font-semibold text-zinc-100">{node.label}</h3>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2">
          <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Type</dt>
          <dd className="mt-1 text-sm text-zinc-200">
            {OBJECT_KIND_LABELS[node.objectKind]}
          </dd>
        </div>
        <div className="rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2">
          <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Status</dt>
          <dd className="mt-1">
            <span
              className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${statusAccent(node.status)}`}
            >
              {STATUS_LABELS[node.status]}
            </span>
          </dd>
        </div>
        <div className="rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2 sm:col-span-2">
          <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Human review
          </dt>
          <dd className="mt-1 text-sm text-zinc-300">
            {requiresHumanReview ? "Required" : "Not required for catalog navigation"}
          </dd>
        </div>
      </dl>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
          Next connections
        </p>
        {nextSteps.length > 0 ? (
          <ul className="space-y-2">
            {nextSteps.map((step) => (
              <li
                key={step.edge.edgeId}
                className="rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2 text-sm text-zinc-400"
              >
                <span className="text-teal-400/90">
                  {RELATIONSHIP_LABELS[step.edge.relationshipType]}
                </span>
                <span className="text-zinc-600"> → </span>
                <span className="text-zinc-200">{step.node.label}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-500">
            No direct catalog connections from this node. Use the path panel or next navigation
            panel to continue.
          </p>
        )}
      </div>
    </article>
  );
}

export { STATUS_LABELS, OBJECT_KIND_LABELS, RELATIONSHIP_LABELS };
