import type { Metadata } from "next";
import CountryCompareClient from "./CountryCompareClient";

export const metadata: Metadata = {
  title: "Country comparison",
  description: "Compare 2–4 countries on compatible indicators — never a best-country ranking.",
};

export default function CountryComparePage() {
  return <CountryCompareClient />;
}
