import type { University } from "@/lib/universities";
import type {
  Entity,
  EntityMetadataField,
  EntityTimelineEvent,
} from "@/lib/entity/entity.types";

/** Ordered metadata fields for university entity overview grid */
export const UNIVERSITY_METADATA_FIELDS: EntityMetadataField[] = [
  { key: "country", label: "Country" },
  { key: "city", label: "City" },
  { key: "founded", label: "Founded" },
  { key: "students", label: "Students" },
  { key: "faculty", label: "Faculty" },
  { key: "type", label: "Type" },
  { key: "ranking", label: "Global Ranking" },
  { key: "technologyLevel", label: "Technology Level" },
];

function buildUniversityTimeline(
  university: University,
): EntityTimelineEvent[] {
  return [
    {
      id: `${university.id}-founded`,
      title: "University Founded",
      description: `${university.name} established in ${university.founded}`,
      date: String(university.founded),
      type: "milestone",
    },
    {
      id: `${university.id}-ranking`,
      title: "Global Ranking",
      description: `Ranked #${university.ranking} globally`,
      date: "2026",
      type: "update",
    },
    {
      id: `${university.id}-ai`,
      title: "AI Research Active",
      description: `AI Readiness: ${university.aiReadiness}/100 · Research Strength: ${university.researchStrength}/100`,
      date: "2026",
      type: "analysis",
    },
  ];
}

/**
 * Adapter: maps University domain model → universal Entity interface.
 * All university presentation flows through this function.
 */
export function toUniversityEntity(university: University): Entity {
  return {
    id: university.id,
    type: "university",
    name: university.name,
    icon: university.icon,
    category: university.type,
    subtitle: `${university.city}, ${university.country}`,
    overview: university.overview,
    status: "active",
    scores: {
      aiScore: university.aiReadiness,
      investmentScore: university.investmentScore,
      riskScore: university.riskScore,
    },
    tags: university.topPrograms.map((program, i) => ({
      id: `${university.id}-program-${i}`,
      label: program,
      variant: i === 0 ? "accent" : "default",
    })),
    timeline: buildUniversityTimeline(university),
    aiSummary: university.aiSummary,
    metadata: {
      country: university.country,
      city: university.city,
      founded: university.founded,
      students: university.students.toLocaleString(),
      faculty: university.faculty.toLocaleString(),
      type: university.type,
      ranking: `#${university.ranking}`,
      technologyLevel: university.technologyLevel,
      researchStrength: university.researchStrength,
      innovationScore: university.innovationScore,
    },
    metrics: [
      {
        id: "ranking",
        label: "Global Ranking",
        value: `#${university.ranking}`,
        highlight: true,
      },
      {
        id: "students",
        label: "Students",
        value: university.students.toLocaleString(),
      },
      {
        id: "faculty",
        label: "Faculty",
        value: university.faculty.toLocaleString(),
      },
      {
        id: "researchStrength",
        label: "Research Strength",
        value: university.researchStrength,
        unit: "/100",
        change: "Peer reviewed",
        changeType: "positive",
      },
      {
        id: "innovation",
        label: "Innovation Score",
        value: university.innovationScore,
        unit: "/100",
      },
      {
        id: "aiReadiness",
        label: "AI Readiness",
        value: university.aiReadiness,
        unit: "/100",
      },
    ],
  };
}

/** Batch adapter for list operations and cross-entity queries */
export function toUniversityEntities(
  universities: University[],
): Entity[] {
  return universities.map(toUniversityEntity);
}
