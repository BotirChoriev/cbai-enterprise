import SearchGatewayHero from "@/components/search/gateway/SearchGatewayHero";
import SearchGatewayResults from "@/components/search/gateway/SearchGatewayResults";
import IntelligenceGatewayEntry from "@/components/gateway/IntelligenceGatewayEntry";
import type { GatewaySearchResponse } from "@/lib/search-gateway";

type SearchGatewayProps = {
  query: string;
  response: GatewaySearchResponse;
};

export default function SearchGateway({ query, response }: SearchGatewayProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {!query ? <IntelligenceGatewayEntry compact variant="search" /> : null}
      <SearchGatewayHero query={query} />
      <div className="mt-4">
        <SearchGatewayResults response={response} query={query} />
      </div>
    </div>
  );
}
