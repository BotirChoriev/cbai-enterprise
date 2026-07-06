export const SEARCH_INTELLIGENCE_VERSION = "1.0.0" as const;

export type SearchIntelligenceVersionInfo = {
  version: typeof SEARCH_INTELLIGENCE_VERSION;
  label: string;
  status: "foundation";
  description: string;
};

export const SEARCH_INTELLIGENCE_VERSION_INFO: SearchIntelligenceVersionInfo = {
  version: SEARCH_INTELLIGENCE_VERSION,
  label: "Global Search Intelligence",
  status: "foundation",
  description:
    "Registry-backed search navigation hub — not semantic AI, LLM search, or recommendations.",
};

export type SearchIntelligenceMigrationEntry = {
  fromVersion: string;
  toVersion: typeof SEARCH_INTELLIGENCE_VERSION;
  notes: string;
};

export const SEARCH_INTELLIGENCE_MIGRATION_MANIFEST: readonly SearchIntelligenceMigrationEntry[] =
  [
    {
      fromVersion: "0.0.0",
      toVersion: SEARCH_INTELLIGENCE_VERSION,
      notes: "Initial Global Search Intelligence foundation layer.",
    },
  ] as const;
