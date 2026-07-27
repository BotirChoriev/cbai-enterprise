import SearchGatewayHero from "@/components/search/gateway/SearchGatewayHero";
import SearchGatewayResults from "@/components/search/gateway/SearchGatewayResults";
import UniversalEvidenceSearchGroups from "@/components/evidence-to-action/UniversalEvidenceSearchGroups";
import IntelligenceGatewayEntry from "@/components/gateway/IntelligenceGatewayEntry";
import type { GatewaySearchResponse } from "@/lib/search-gateway";

type SearchGatewayProps = {
  query: string;
  response: GatewaySearchResponse;
  showGoalEntry?: boolean;
};

export default function SearchGateway({ query, response, showGoalEntry = true }: SearchGatewayProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {!query && showGoalEntry ? <IntelligenceGatewayEntry compact variant="search" /> : null}
      <SearchGatewayHero query={query} />
      {query ? <UniversalEvidenceSearchGroups response={response} /> : null}
      <div className="mt-4">
        <SearchGatewayResults response={response} query={query} />
      </div>
    </div>
  );
}
