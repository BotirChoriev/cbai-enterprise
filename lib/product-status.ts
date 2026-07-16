/**
 * One reusable product status vocabulary (CBAI Product Activation, Release 3, Phase 8).
 *
 * This does not replace every existing status-label mapping in the codebase (workspaceStatusClass,
 * explorerStatusClass, and similar per-module switches already exist and are honest, working, and
 * low-risk to leave alone) — it's the vocabulary new and newly-fixed empty/status states should
 * use going forward, so those states stop inventing one-off words like "Missing" or "Soon".
 */

export type ProductStatus =
  | "live"
  | "partial"
  | "waiting_for_verified_data"
  | "preview"
  | "restricted"
  | "not_connected"
  | "planned";

export const PRODUCT_STATUSES: readonly ProductStatus[] = [
  "live",
  "partial",
  "waiting_for_verified_data",
  "preview",
  "restricted",
  "not_connected",
  "planned",
];

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  live: "Live",
  partial: "Partial",
  waiting_for_verified_data: "Waiting for verified data",
  preview: "Preview",
  restricted: "Restricted",
  not_connected: "Not connected",
  planned: "Planned",
};

/** Always a full sentence — status is never conveyed by a bare word or color alone. */
export const PRODUCT_STATUS_EXPLANATIONS: Record<ProductStatus, string> = {
  live: "Works today with real, connected data.",
  partial: "Some real data is connected here; other parts are not yet.",
  waiting_for_verified_data: "Built and ready, but no verified source is connected yet.",
  preview: "An early, limited version — not the full capability yet.",
  restricted: "Available only in specific contexts or to specific roles.",
  not_connected: "No data source or integration is connected yet.",
  planned: "Planned for a future release — not built yet.",
};

export const PRODUCT_STATUS_DOT_CLASSES: Record<ProductStatus, string> = {
  live: "bg-emerald-400",
  partial: "bg-teal-400",
  waiting_for_verified_data: "bg-amber-400",
  preview: "bg-violet-400",
  restricted: "bg-orange-400",
  not_connected: "bg-zinc-600",
  planned: "bg-zinc-500",
};
