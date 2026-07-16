import type { Metadata } from "next";
import GraphPageClient from "@/components/graph/GraphPageClient";

export const metadata: Metadata = {
  title: "Knowledge Graph",
  description: "Core intelligence navigation layer — verified local catalog relationships.",
};

export default function GraphPage() {
  return <GraphPageClient />;
}
