/** OpenAlex API response shapes (subset). */

export type OpenAlexWork = {
  readonly id?: string;
  readonly doi?: string | null;
  readonly title?: string | null;
  readonly publication_date?: string | null;
  readonly authorships?: ReadonlyArray<{ author?: { display_name?: string } }>;
  readonly abstract_inverted_index?: Record<string, readonly number[]> | null;
  readonly type?: string | null;
  readonly open_access?: { is_oa?: boolean; oa_url?: string | null } | null;
  readonly primary_location?: { landing_page_url?: string | null; license?: string | null } | null;
};

export type OpenAlexSearchResponse = {
  readonly meta?: { count?: number };
  readonly results?: readonly OpenAlexWork[];
};
