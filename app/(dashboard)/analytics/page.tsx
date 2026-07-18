import type { Metadata } from "next";
import { Suspense } from "react";
import AnalyticsRedirectClient from "@/components/reports/AnalyticsRedirectClient";

export const metadata: Metadata = {
  title: "Reports",
  description: "Legacy analytics route — redirects to Reports Center.",
  robots: { index: false, follow: true },
};

/** /analytics redirects to canonical /reports — query params preserved for entity context. */
export default function AnalyticsRedirectPage() {
  return (
    <Suspense fallback={null}>
      <AnalyticsRedirectClient />
    </Suspense>
  );
}
