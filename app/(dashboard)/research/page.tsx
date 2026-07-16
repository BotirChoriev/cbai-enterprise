import type { Metadata } from "next";
import { Suspense } from "react";
import ResearchPageClient from "@/components/research/ResearchPageClient";
import RouteChromeFallback from "@/components/system/RouteChromeFallback";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Explore catalog research topics and metadata connections in the Global Research Network.",
};

export default function ResearchPage() {
  return (
    <Suspense fallback={<RouteChromeFallback messageKey="loadingResearch" />}>
      <ResearchPageClient />
    </Suspense>
  );
}
