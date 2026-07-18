/** DataCite REST response (subset). */

export type DataCiteAttributes = {
  readonly titles?: ReadonlyArray<{ title?: string }>;
  readonly creators?: ReadonlyArray<{ name?: string }>;
  readonly publicationYear?: number | null;
  readonly descriptions?: ReadonlyArray<{ description?: string }>;
  readonly url?: string | null;
};

export type DataCiteRecord = {
  readonly id?: string;
  readonly type?: string;
  readonly attributes?: DataCiteAttributes;
};

export type DataCiteSearchResponse = {
  readonly data?: readonly DataCiteRecord[];
  readonly meta?: { total?: number };
};
