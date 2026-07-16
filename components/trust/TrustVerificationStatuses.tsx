"use client";

import StatusBadge from "@/components/shared/StatusBadge";
import type { ProductStatus } from "@/lib/product-status";

const VERIFICATION_STATUSES: ProductStatus[] = [
  "live",
  "partial",
  "waiting_for_verified_data",
  "preview",
];

export default function TrustVerificationStatuses() {
  return (
    <ul className="space-y-2">
      {VERIFICATION_STATUSES.map((status) => (
        <li key={status}>
          <StatusBadge status={status} showExplanation />
        </li>
      ))}
    </ul>
  );
}
