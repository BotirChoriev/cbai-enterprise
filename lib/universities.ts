/**
 * Factual university registry (CBAI Constitution).
 *
 * Local reference catalog only — no scores, rankings, narratives, or statistics.
 */
export type UniversityType = "Public" | "Private" | "Research";

export type University = {
  /** Stable university identifier. */
  id: string;
  /** Official institution name from local registry. */
  name: string;
  /** Short catalog symbol from local reference. */
  icon: string;
  /** Country label from local registry. */
  country: string;
  /** City label from local registry. */
  city: string;
  /** Founding year from local registry reference. */
  founded: number;
  /** Institution type from local registry. */
  type: UniversityType;
  /** Official website when recorded in local registry; otherwise null. */
  website: string | null;
};

export const universityTypes: UniversityType[] = ["Public", "Private", "Research"];

export const universities: University[] = [
  {
    id: "stanford",
    name: "Stanford University",
    icon: "SU",
    country: "United States",
    city: "Stanford, CA",
    founded: 1885,
    type: "Private",
    website: "https://www.stanford.edu",
  },
  {
    id: "mit",
    name: "MIT",
    icon: "MIT",
    country: "United States",
    city: "Cambridge, MA",
    founded: 1861,
    type: "Private",
    website: "https://www.mit.edu",
  },
  {
    id: "harvard",
    name: "Harvard University",
    icon: "HU",
    country: "United States",
    city: "Cambridge, MA",
    founded: 1636,
    type: "Private",
    website: "https://www.harvard.edu",
  },
  {
    id: "oxford",
    name: "Oxford University",
    icon: "OX",
    country: "United Kingdom",
    city: "Oxford",
    founded: 1096,
    type: "Public",
    website: "https://www.ox.ac.uk",
  },
  {
    id: "cambridge",
    name: "Cambridge University",
    icon: "CAM",
    country: "United Kingdom",
    city: "Cambridge",
    founded: 1209,
    type: "Public",
    website: "https://www.cam.ac.uk",
  },
  {
    id: "tuit",
    name: "Tashkent University of Information Technologies",
    icon: "TUIT",
    country: "Uzbekistan",
    city: "Tashkent",
    founded: 1955,
    type: "Public",
    website: null,
  },
  {
    id: "nuuz",
    name: "National University of Uzbekistan",
    icon: "NUUz",
    country: "Uzbekistan",
    city: "Tashkent",
    founded: 1918,
    type: "Public",
    website: null,
  },
  {
    id: "kaist",
    name: "KAIST",
    icon: "KAIST",
    country: "South Korea",
    city: "Daejeon",
    founded: 1971,
    type: "Research",
    website: "https://www.kaist.ac.kr",
  },
];

export function getUniversityCountries(): string[] {
  return [...new Set(universities.map((university) => university.country))].sort();
}

export function getUniversityTypes(): UniversityType[] {
  return [...new Set(universities.map((university) => university.type))].sort();
}
