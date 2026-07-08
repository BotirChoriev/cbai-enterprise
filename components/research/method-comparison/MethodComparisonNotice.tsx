import {
  METHOD_COMPARISON_HONEST_NOTICE,
  METHOD_COMPARISON_HUMAN_REVIEW_NOTICE,
} from "@/lib/research/method-comparison/method-comparison-types";

type MethodComparisonNoticeProps = {
  showHumanReview?: boolean;
  compact?: boolean;
};

export default function MethodComparisonNotice({
  showHumanReview = true,
  compact = false,
}: MethodComparisonNoticeProps) {
  return (
    <div className={`space-y-2 ${compact ? "text-[11px]" : "text-xs"}`}>
      <p className="rounded-md border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 text-zinc-500">
        {METHOD_COMPARISON_HONEST_NOTICE}
      </p>
      {showHumanReview ? (
        <p className="text-zinc-600">{METHOD_COMPARISON_HUMAN_REVIEW_NOTICE}</p>
      ) : null}
    </div>
  );
}
