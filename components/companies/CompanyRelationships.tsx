import type { CompanyIntelligenceProfile } from "@/lib/companies.intelligence";
import EntityRelationshipsSection from "@/components/shared/EntityRelationshipsSection";

type CompanyRelationshipsProps = {
  profile: CompanyIntelligenceProfile;
};

export default function CompanyRelationships({ profile }: CompanyRelationshipsProps) {
  return <EntityRelationshipsSection entityType="company" entityId={profile.companyId} />;
}
