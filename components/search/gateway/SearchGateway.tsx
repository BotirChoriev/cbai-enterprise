import SearchGatewayHero from "@/components/search/gateway/SearchGatewayHero";
import SearchGatewayResults from "@/components/search/gateway/SearchGatewayResults";
import type { GatewaySearchResponse } from "@/lib/search-gateway";

type SearchGatewayProps = {
  query: string;
  response: GatewaySearchResponse;
};

export default function SearchGateway({ query, response }: SearchGatewayProps) {
  return (
    <div className="home-page mx-auto max-w-2xl px-4 pb-12 pt-6 sm:px-6">
      <SearchGatewayHero query={query} />
      <div className="mt-4">
        <SearchGatewayResults response={response} query={query} />
      </div>
    </div>
  );
}
