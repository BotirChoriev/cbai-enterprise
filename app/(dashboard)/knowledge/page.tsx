import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Evidence",
  description: "Evidence architecture and source status.",
};

/**
 * Canonical route decision (P0):
 * - `/knowledge` → Evidence (alias retained for bookmarks)
 * - `/graph` → Knowledge Graph
 * - `/evidence` → Evidence (primary)
 */
export default function KnowledgePage() {
  redirect("/evidence");
}
