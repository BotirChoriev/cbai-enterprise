import SearchGatewayHero from "@/components/search/gateway/SearchGatewayHero";
import SearchGatewayResults from "@/components/search/gateway/SearchGatewayResults";
import SearchExploreByCategory from "@/components/search/gateway/SearchExploreByCategory";
import HomeSection from "@/components/platform/home/HomeSection";
import type { GatewaySearchResponse } from "@/lib/search-gateway";

type SearchGatewayProps = {
  query: string;
  response: GatewaySearchResponse;
};

export default function SearchGateway({ query, response }: SearchGatewayProps) {
  const hasQuery = Boolean(response.query);

  return (
    <div className="home-page mx-auto max-w-6xl pb-16">
      <SearchGatewayHero query={query} />

      <HomeSection
        id="search-results"
        title={hasQuery ? "Results" : "Start here"}
        description={
          hasQuery
            ? "Select a country to open the full evidence and decision review."
            : "Search countries, companies, or universities by name."
        }
      >
        <SearchGatewayResults response={response} query={query} />
      </HomeSection>

      {!hasQuery ? (
        <HomeSection
          id="explore-by-category"
          title="Browse"
          description="Open a registry directly."
        >
          <SearchExploreByCategory />
        </HomeSection>
      ) : null}
    </div>
  );
}
