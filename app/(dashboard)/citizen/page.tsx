import type { Metadata } from "next";
import CitizenWorkspace from "@/components/workspaces/CitizenWorkspace";

export const metadata: Metadata = {
  title: "Citizen",
  description: "Public information topics in clear language.",
};

export default function CitizenPage() {
  return <CitizenWorkspace />;
}
