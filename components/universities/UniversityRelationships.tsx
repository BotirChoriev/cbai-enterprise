import type { UniversityIntelligenceProfile } from "@/lib/universities.intelligence";
import EntityRelationshipsSection from "@/components/shared/EntityRelationshipsSection";

type UniversityRelationshipsProps = {
  profile: UniversityIntelligenceProfile;
};

export default function UniversityRelationships({ profile }: UniversityRelationshipsProps) {
  return <EntityRelationshipsSection entityType="university" entityId={profile.universityId} />;
}
