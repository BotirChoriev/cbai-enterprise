/**
 * Unified product status vocabulary — honest labels across flagship workflow.
 */

export const PRODUCT_STATUS_LABELS = [
  "Draft",
  "Needs confirmation",
  "Ready for input",
  "Connector required",
  "Instrument required",
  "Expert review required",
  "Evidence missing",
  "Under human review",
  "Supported",
  "Disputed",
  "Inconclusive",
  "Not implemented",
  "Completed",
] as const;

export type ProductStatusLabel = (typeof PRODUCT_STATUS_LABELS)[number];

export function describeProductStatus(
  label: ProductStatusLabel,
  detail?: string,
): { readonly label: ProductStatusLabel; readonly detail: string } {
  return { label, detail: detail ?? label };
}

/** "Verified" is intentionally excluded — use Supported + evidence chain instead. */
export function isAllowedPublicStatus(label: string): boolean {
  return (PRODUCT_STATUS_LABELS as readonly string[]).includes(label);
}
