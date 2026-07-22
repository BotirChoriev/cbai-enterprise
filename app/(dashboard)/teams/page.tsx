import type { Metadata } from "next";
import { Suspense } from "react";
import TeamsWorkspaceClient from "@/components/teams/TeamsWorkspaceClient";

export const metadata: Metadata = { title: "Teams" };

export default function TeamsPage() {
  return (
    <Suspense fallback={null}>
      <TeamsWorkspaceClient />
    </Suspense>
  );
}
