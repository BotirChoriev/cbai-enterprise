import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import type { Country } from "@/lib/countries";

type CountryRelatedResearchProps = {
  country: Country;
};

/**
 * Required "Research topics" section on the Country Profile. Unlike Company↔Research (matched by
 * a real industry classification against research topic text), no real, honest signal links a
 * country to a research topic anywhere in this catalog — the Country record carries no
 * industry-equivalent field, and no research topic in the catalog references a country or region.
 * Rather than fabricate a match, this states that plainly. If a real link (e.g. a national
 * research funder registry) connects in the future, this becomes a real matcher — not before.
 */
export default function CountryRelatedResearch({ country }: CountryRelatedResearchProps) {
  return (
    <section aria-labelledby="country-related-research-heading" className="space-y-2">
      <p className={cbaiSectionEyebrow} id="country-related-research-heading">
        Research Topics
      </p>
      <p className="text-sm text-zinc-500">
        No research topics are connected to {country.name} in the current catalog — no verified
        link between countries and research topics exists yet.
      </p>
    </section>
  );
}
