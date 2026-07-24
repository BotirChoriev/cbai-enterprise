import type { Metadata } from "next";
import EvidenceExplorer from "@/components/evidence/EvidenceExplorer";

export const metadata: Metadata = {
  title: "Evidence",
  description: "Evidence architecture and source status.",
};

/** Canonical Evidence route — same surface as legacy `/knowledge`. */
export default function EvidencePage() {
  return <EvidenceExplorer />;
}
