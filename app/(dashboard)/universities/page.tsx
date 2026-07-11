import type { Metadata } from "next";
import UniversitiesPageClient from "./UniversitiesPageClient";

export const metadata: Metadata = {
  title: "Universities",
  description: "University profiles with official information and reports.",
};

export default function UniversitiesPage() {
  return <UniversitiesPageClient />;
}
