import type { Metadata } from "next";
import CountriesPageClient from "./CountriesPageClient";

export const metadata: Metadata = {
  title: "Countries",
  description: "Country profiles — available information, gaps, and reports.",
};

export default function CountriesPage() {
  return <CountriesPageClient />;
}
