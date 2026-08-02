import type { Metadata } from "next";
import { Suspense } from "react";
import PersonalWorkspaceHome from "@/components/workspace/PersonalWorkspaceHome";

export const metadata: Metadata = { title: "Personal workspace" };

export default function WorkspacePage() {
  return (
    <Suspense fallback={null}>
      <PersonalWorkspaceHome />
    </Suspense>
  );
}
