import type { Metadata } from "next";
import EvidenceExplorer from "@/components/evidence/EvidenceExplorer";

export const metadata: Metadata = {
  title: "Evidence",
  description: "Evidence architecture and source status.",
};

export default function KnowledgePage() {
  return <EvidenceExplorer />;
}
