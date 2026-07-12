import type { Metadata } from "next";
import ReasoningExplorer from "@/components/reasoning/ReasoningExplorer";

export const metadata: Metadata = {
  title: "Reasoning",
  description: "How official information supports review before decisions.",
};

export default function ReasoningPage() {
  return <ReasoningExplorer />;
}
