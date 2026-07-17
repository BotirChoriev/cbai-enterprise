/** BUILD-028 — Crossref API response DTO (provider boundary). */

export type CrossrefWorkItem = {
  DOI?: string;
  title?: string[];
  subtitle?: string[];
  author?: Array<{ given?: string; family?: string; name?: string }>;
  published?: { "date-parts"?: number[][] };
  "published-online"?: { "date-parts"?: number[][] };
  URL?: string;
  abstract?: string;
  license?: Array<{ URL?: string }>;
  type?: string;
};

export type CrossrefSearchResponse = {
  status?: string;
  message?: {
    "total-results"?: number;
    items?: CrossrefWorkItem[];
  };
};
