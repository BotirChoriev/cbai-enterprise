import type { PipelineReadinessState } from "@/lib/pipeline-readiness";
import { pipelineReadinessStateLabel, pipelineReadinessStatusClass } from "@/lib/pipeline-readiness";

type StatusBadgeProps = {
  state: PipelineReadinessState;
};

export function PipelineStatusBadge({ state }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${pipelineReadinessStatusClass(state)}`}
    >
      {pipelineReadinessStateLabel(state)}
    </span>
  );
}
