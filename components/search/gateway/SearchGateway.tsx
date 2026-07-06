import SearchGatewayHero from "@/components/search/gateway/SearchGatewayHero";
import SearchGatewayResults from "@/components/search/gateway/SearchGatewayResults";
import SearchExploreByCategory from "@/components/search/gateway/SearchExploreByCategory";
import SearchPersonas from "@/components/search/gateway/SearchPersonas";
import SearchPipeline from "@/components/search/gateway/SearchPipeline";
import SearchFutureReady from "@/components/search/gateway/SearchFutureReady";
import HomeSection from "@/components/platform/home/HomeSection";
import type { GatewaySearchResponse } from "@/lib/search-gateway";

type SearchGatewayProps = {
  query: string;
  response: GatewaySearchResponse;
};

export default function SearchGateway({ query, response }: SearchGatewayProps) {
  return (
    <div className="home-page mx-auto max-w-6xl pb-16">
      <SearchGatewayHero query={query} />

      <HomeSection
        id="search-results"
        title="Search Results"
        description="Grouped by registry type and platform layer. No scores, confidence values, or AI summaries."
      >
        <SearchGatewayResults response={response} />
      </HomeSection>

      <HomeSection
        id="explore-by-category"
        title="Explore by Category"
        description="Browse platform areas directly. Unconnected categories remain honestly labeled."
      >
        <SearchExploreByCategory />
      </HomeSection>

      <HomeSection
        id="search-personas"
        title="Search by Role"
        description="Each persona has one example query — select to run a supported search."
      >
        <SearchPersonas />
      </HomeSection>

      <HomeSection id="search-pipeline" title="Search Pipeline">
        <SearchPipeline />
      </HomeSection>

      <HomeSection
        id="search-future"
        title="Future-Ready Architecture"
        description="Declared capabilities prepared in schema — not implemented on this build."
      >
        <SearchFutureReady />
      </HomeSection>
    </div>
  );
}
