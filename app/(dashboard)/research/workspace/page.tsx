import type { Metadata } from "next";
import { Suspense } from "react";
import ResearchWorkspaceHome from "@/components/research/workspace/ResearchWorkspaceHome";

export const metadata: Metadata = {
  title: "Research Workspace",
  description:
    "Explore one research topic from catalog notebook, timeline, graph, and future knowledge perspectives.",
};

export default function ResearchWorkspacePage() {
  return (
    <Suspense fallback={null}>
      <ResearchWorkspaceHome />
    </Suspense>
  );
}
