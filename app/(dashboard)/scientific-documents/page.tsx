import type { Metadata } from "next";
import { Suspense } from "react";
import ScientificDocumentIntakeClient from "@/components/scientific-intake/ScientificDocumentIntakeClient";

export const metadata: Metadata = { title: "Scientific Documents" };

export default function ScientificDocumentsPage() {
  return (
    <Suspense fallback={null}>
      <ScientificDocumentIntakeClient />
    </Suspense>
  );
}
