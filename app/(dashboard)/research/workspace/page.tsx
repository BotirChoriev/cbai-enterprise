import type { Metadata } from "next";
import { Suspense } from "react";
import ResearchWorkspacePageClient from "@/components/research/workspace/ResearchWorkspacePageClient";

export const metadata: Metadata = {
  title: "Research Workspace",
  description:
    "Explore one research topic from catalog notebook, timeline, graph, and future knowledge perspectives.",
};

export default function ResearchWorkspacePage() {
  return (
    <Suspense fallback={null}>
      <ResearchWorkspacePageClient />
    </Suspense>
  );
}
