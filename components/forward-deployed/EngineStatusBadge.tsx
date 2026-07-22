"use client";

import type { EngineLifecycleState } from "@/lib/forward-deployed-engines/engine-types";
import { useTranslation } from "@/lib/i18n/use-translation";

const STATE_KEY: Record<EngineLifecycleState, string> = {
  idle: "forwardDeployed.statusBadge.idle",
  understanding: "forwardDeployed.statusBadge.understanding",
  planning: "forwardDeployed.statusBadge.planning",
  awaiting_confirmation: "forwardDeployed.statusBadge.awaiting_confirmation",
  executing: "forwardDeployed.statusBadge.executing",
  blocked: "forwardDeployed.statusBadge.blocked",
  needs_evidence: "forwardDeployed.statusBadge.needs_evidence",
  needs_human_review: "forwardDeployed.statusBadge.needs_human_review",
  completed: "forwardDeployed.statusBadge.completed",
  failed: "forwardDeployed.statusBadge.failed",
  cancelled: "forwardDeployed.statusBadge.cancelled",
};

type Props = {
  state: EngineLifecycleState;
};

export default function EngineStatusBadge({ state }: Props) {
  const { t } = useTranslation();
  return (
    <span
      className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-900/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-teal-400/90"
      role="status"
      aria-live="polite"
    >
      {t(STATE_KEY[state])}
    </span>
  );
}
