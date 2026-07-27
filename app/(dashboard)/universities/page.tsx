import type { Metadata } from "next";
import UniversitiesPageClient from "./UniversitiesPageClient";

export const metadata: Metadata = {
  title: "University Intelligence",
  description:
    "Connect universities, laboratories, and researchers through traceable evidence — humans approve every commitment.",
};

export default function UniversitiesPage() {
  return <UniversitiesPageClient />;
}
