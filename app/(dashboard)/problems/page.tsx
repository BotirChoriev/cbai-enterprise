import type { Metadata } from "next";
import { Suspense } from "react";
import ProblemWorkspace from "@/components/problems/ProblemWorkspace";

export const metadata: Metadata = {
  title: "Problem Space",
  description: "Evidence, contradictions, unknowns, scenarios, human decisions, and monitoring.",
};

export default function ProblemsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--cbai-text-secondary)]">Opening Problem Space…</p>}>
      <ProblemWorkspace />
    </Suspense>
  );
}
