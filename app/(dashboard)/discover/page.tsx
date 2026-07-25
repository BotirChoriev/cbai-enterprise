import type { Metadata } from "next";
import GlobalActivityClient from "@/components/discovery/GlobalActivityClient";

export const metadata: Metadata = {
  title: "Global Activity",
  description: "Opted-in public projects, research, reports, groups, and media on CheckBalanceAI.Global.",
};

export default function DiscoverPage() {
  return <GlobalActivityClient />;
}
