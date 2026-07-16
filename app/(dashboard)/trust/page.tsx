import type { Metadata } from "next";
import TrustPageClient from "@/components/trust/TrustPageClient";

export const metadata: Metadata = {
  title: "Trust",
  description: "Methodology, verification model, evidence policy, data sources, and known limitations.",
};

export default function TrustPage() {
  return <TrustPageClient />;
}
