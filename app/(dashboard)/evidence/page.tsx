import type { Metadata } from "next";
import EvidenceExplorer from "@/components/evidence/EvidenceExplorer";

export const metadata: Metadata = {
  title: "Evidence and Scientific Deliberation",
  description: "Structured scientific claims, evidence, methods, counter-evidence, and human decisions.",
};

/** Canonical Evidence route — same surface as legacy `/knowledge`. */
export default function EvidencePage() {
  return <EvidenceExplorer />;
}
