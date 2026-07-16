import type { Metadata } from "next";
import { Suspense } from "react";
import ResearchPageClient from "@/components/research/ResearchPageClient";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Explore catalog research topics and metadata connections in the Global Research Network.",
};

export default function ResearchPage() {
  return (
    <Suspense fallback={null}>
      <ResearchPageClient />
    </Suspense>
  );
}
