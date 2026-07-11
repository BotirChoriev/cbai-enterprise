import {
  PRODUCT_STATUS_DOT_CLASSES,
  PRODUCT_STATUS_EXPLANATIONS,
  PRODUCT_STATUS_LABELS,
  type ProductStatus,
} from "@/lib/product-status";

type StatusBadgeProps = {
  status: ProductStatus;
  /** Render the full explanatory sentence beneath the badge, not just on hover. */
  showExplanation?: boolean;
  className?: string;
};

/**
 * One reusable status badge. Text is always visible (never color-only); the dot is decorative.
 * The explanation is always available via `title`, and optionally rendered inline as a sentence.
 */
export default function StatusBadge({ status, showExplanation, className = "" }: StatusBadgeProps) {
  const label = PRODUCT_STATUS_LABELS[status];
  const explanation = PRODUCT_STATUS_EXPLANATIONS[status];

  return (
    <span className={className}>
      <span
        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-300"
        title={explanation}
      >
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${PRODUCT_STATUS_DOT_CLASSES[status]}`} />
        {label}
        <span className="sr-only"> — {explanation}</span>
      </span>
      {showExplanation ? <span className="mt-1 block text-xs text-zinc-500">{explanation}</span> : null}
    </span>
  );
}
