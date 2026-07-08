import type { Metadata } from "next";
import { Suspense } from "react";
import ResearchHome from "@/components/research/ResearchHome";

export const metadata: Metadata = {
  title: "Research Intelligence — Global Research Network",
  description:
    "Explore 64 catalog research topics and their metadata connections in the Global Research Network.",
};

export default function ResearchPage() {
  return (
    <Suspense fallback={null}>
      <ResearchHome />
    </Suspense>
  );
}
