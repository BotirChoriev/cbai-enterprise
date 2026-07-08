import type { DiscoveryRelationshipReason } from "@/lib/research/discovery/discovery-types";
import { DISCOVERY_RELATIONSHIP_REASON_LABELS } from "@/lib/research/discovery/discovery-types";

type DiscoveryReasonBadgeProps = {
  reason: DiscoveryRelationshipReason;
};

function badgeClass(reason: DiscoveryRelationshipReason): string {
  switch (reason) {
    case "same_domain":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
    case "shared_method":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "shared_evidence_type":
      return "border-violet-500/30 bg-violet-500/10 text-violet-300";
    case "shared_future_object":
      return "border-zinc-700 bg-zinc-900/60 text-zinc-400";
  }
}

export default function DiscoveryReasonBadge({ reason }: DiscoveryReasonBadgeProps) {
  return (
    <span
      className={`inline-flex rounded border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${badgeClass(reason)}`}
    >
      {DISCOVERY_RELATIONSHIP_REASON_LABELS[reason]}
    </span>
  );
}
