import type { Metadata } from "next";
import AgentsPageClient from "@/components/agents/AgentsPageClient";

// Not in primary navigation (removed after self-disclosing as non-functional immediately after
// the click) — kept reachable by direct URL, excluded from search indexing.
export const metadata: Metadata = {
  title: "Agents",
  description: "Planned agent capabilities for this platform — not available yet.",
  robots: { index: false, follow: true },
};

export default function AgentsPage() {
  return <AgentsPageClient />;
}
