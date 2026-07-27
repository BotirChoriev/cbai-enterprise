import type { Metadata } from "next";
import GraphPageClient from "@/components/graph/GraphPageClient";

export const metadata: Metadata = {
  title: "World and Me — Live Intelligence Map",
  description: "Evidence-backed map of world change relevant to your work — humans decide.",
};

export default function GraphPage() {
  return <GraphPageClient />;
}
