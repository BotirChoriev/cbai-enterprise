import type { Metadata } from "next";
import { Suspense } from "react";
import PublicationReadinessClient from "@/components/publications/PublicationReadinessClient";

export const metadata: Metadata = { title: "Publications" };

export default function PublicationsPage() {
  return (
    <Suspense fallback={null}>
      <PublicationReadinessClient />
    </Suspense>
  );
}
