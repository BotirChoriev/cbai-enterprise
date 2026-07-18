import type { Metadata } from "next";
import { Suspense } from "react";
import ResearchCanvasPageClient from "@/components/research/canvas/ResearchCanvasPageClient";
import RouteChromeFallback from "@/components/system/RouteChromeFallback";

export const metadata: Metadata = {
  title: "Research Canvas",
  description:
    "Smart Idea & Research Canvas — upload sketches, define measurements, discover open science, and create research missions.",
};

export default function ResearchCanvasPage() {
  return (
    <Suspense fallback={<RouteChromeFallback messageKey="loadingResearch" />}>
      <ResearchCanvasPageClient />
    </Suspense>
  );
}
