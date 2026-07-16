import type { CountryIntelligenceProfile } from "@/lib/countries.intelligence";
import EntityRelationshipsSection from "@/components/shared/EntityRelationshipsSection";

type CountryRelationshipsProps = {
  profile: CountryIntelligenceProfile;
};

export default function CountryRelationships({ profile }: CountryRelationshipsProps) {
  return <EntityRelationshipsSection entityType="country" entityId={profile.countryId} />;
}
