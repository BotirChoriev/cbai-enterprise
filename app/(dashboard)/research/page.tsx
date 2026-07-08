"use client";

import { Suspense } from "react";
import ResearchHome from "@/components/research/ResearchHome";

export default function ResearchPage() {
  return (
    <Suspense fallback={null}>
      <ResearchHome />
    </Suspense>
  );
}
