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
    <div className="mx-auto max-w-7xl space-y-5">
      {!query && showGoalEntry ? <IntelligenceGatewayEntry compact variant="search" /> : null}
      <SearchGatewayHero query={query} />
      {query ? (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
          <div>
            <SearchGatewayResults response={response} query={query} />
          </div>
          <aside className="xl:sticky xl:top-4">
            <UniversalEvidenceSearchGroups response={response} />
          </aside>
        </div>
      ) : (
        <SearchGatewayResults response={response} query={query} />
      )}
    </div>
  );
}
