import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Mission Center",
  description: "Legacy dashboard route — redirects to Mission Center.",
  robots: { index: false, follow: true },
};

/** Mission Center replaced the legacy dashboard — redirect preserves old links. */
export default function DashboardRedirectPage() {
  redirect("/");
}
