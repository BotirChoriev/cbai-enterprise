import type { Metadata } from "next";
import CitizenPageClient from "@/components/workspaces/CitizenPageClient";

export const metadata: Metadata = {
  title: "Citizen",
  description: "Public information topics in clear language.",
};

export default function CitizenPage() {
  return <CitizenPageClient />;
}
