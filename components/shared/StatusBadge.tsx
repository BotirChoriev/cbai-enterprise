"use client";

import { PRODUCT_STATUS_DOT_CLASSES, type ProductStatus } from "@/lib/product-status";
import { useTranslation } from "@/lib/i18n/use-translation";

type StatusBadgeProps = {
  status: ProductStatus;
  showExplanation?: boolean;
  className?: string;
};

/**
 * One reusable status badge — labels and explanations come from i18n, never hardcoded English.
 */
export default function StatusBadge({ status, showExplanation, className = "" }: StatusBadgeProps) {
  const { t } = useTranslation();
  const label = t(`productStatus.${status}.label`);
  const explanation = t(`productStatus.${status}.explanation`);

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
