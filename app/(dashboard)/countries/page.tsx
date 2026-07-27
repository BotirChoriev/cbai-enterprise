import type { Metadata } from "next";
import CountriesPageClient from "./CountriesPageClient";

export const metadata: Metadata = {
  title: "Country Intelligence",
  description:
    "Understand how a country is changing through traceable evidence — sources, history, comparison, and human decision.",
};

export default function CountriesPage() {
  return <CountriesPageClient />;
}
