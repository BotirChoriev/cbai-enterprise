import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Reports",
  description: "Legacy analytics route — redirects to Reports Center.",
  robots: { index: false, follow: true },
};

/** /analytics redirects to canonical /reports — backward compatible. */
export default function AnalyticsRedirectPage() {
  redirect("/reports");
}
