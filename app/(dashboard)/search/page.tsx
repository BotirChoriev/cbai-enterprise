import type { Metadata } from "next";
import SearchGatewayClient from "@/components/search/gateway/SearchGatewayClient";

export const metadata: Metadata = {
  title: "Search",
  description: "Search countries, companies, universities, and research topics.",
};

export default function SearchPage() {
  return <SearchGatewayClient />;
}
