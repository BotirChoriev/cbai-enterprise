import type { Metadata } from "next";
import CompaniesPageClient from "./CompaniesPageClient";

export const metadata: Metadata = {
  title: "Companies",
  description: "Company profiles with official information and reports.",
};

export default function CompaniesPage() {
  return <CompaniesPageClient />;
}
