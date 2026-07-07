import SearchGatewayHero from "@/components/search/gateway/SearchGatewayHero";
import SearchGatewayResults from "@/components/search/gateway/SearchGatewayResults";
import type { GatewaySearchResponse } from "@/lib/search-gateway";

type SearchGatewayProps = {
  query: string;
  response: GatewaySearchResponse;
};

export default function SearchGateway({ query, response }: SearchGatewayProps) {
  return (
    <div className="home-page mx-auto max-w-6xl px-4 pb-16 sm:px-0">
      <SearchGatewayHero query={query} />
      <div className="mt-8">
        <SearchGatewayResults response={response} query={query} />
      </div>
    </div>
  );
}
